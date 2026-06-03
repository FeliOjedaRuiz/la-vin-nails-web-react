import { useState, useEffect, useCallback, useRef } from 'react';
import http from '../services/base-api';

const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

/**
 * Hook that exposes PWA status and controls for the admin panel.
 * @returns {{
 *   swStatus: 'active'|'waiting'|'installing'|'none'|'unsupported',
 *   checkForUpdate: () => Promise<{hasUpdate: boolean}>,
 *   isCheckingUpdate: boolean,
 *   pushSupported: boolean,
 *   pushPermission: NotificationPermission|null,
 *   isSubscribed: boolean,
 *   isTogglingPush: boolean,
 *   togglePush: () => Promise<void>,
 *   sendTestNotification: () => Promise<void>,
 *   isSendingTest: boolean,
 *   testResult: {success: boolean, message: string}|null,
 * }}
 */
const usePwaStatus = () => {
  const [swStatus, setSwStatus] = useState('none');
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [pushPermission, setPushPermission] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isTogglingPush, setIsTogglingPush] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [isDevMode, setIsDevMode] = useState(false);
  const registrationRef = useRef(null);

  const pushSupported = 'serviceWorker' in navigator && 'PushManager' in window;

  // Detectar estado del SW y suscripción al montar
  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      setSwStatus('unsupported');
      return;
    }

    // getRegistration() resuelve a undefined si no hay SW registrado (dev mode)
    // a diferencia de .ready que se queda colgada para siempre
    navigator.serviceWorker.getRegistration().then((registration) => {
      if (!registration) {
        setSwStatus('none');
        setIsDevMode(true);
        return;
      }

      registrationRef.current = registration;

      if (registration.active) setSwStatus('active');
      else if (registration.waiting) setSwStatus('waiting');
      else if (registration.installing) setSwStatus('installing');
      else setSwStatus('none');

      // Escuchar cambios de estado del SW
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          setSwStatus('installing');
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              setSwStatus(navigator.serviceWorker.controller ? 'waiting' : 'active');
            } else if (newWorker.state === 'activated') {
              setSwStatus('active');
            }
          });
        }
      });

      // Estado push
      if (pushSupported) {
        setPushPermission(Notification.permission);
        registration.pushManager.getSubscription().then((sub) => {
          setIsSubscribed(!!sub);
        });
      }
    });
  }, [pushSupported]);

  /**
   * Busca actualizaciones del SW. Devuelve {hasUpdate: true} si hay una nueva versión esperando.
   */
  const checkForUpdate = useCallback(async () => {
    if (!registrationRef.current) return { hasUpdate: false };
    setIsCheckingUpdate(true);
    try {
      await registrationRef.current.update();
      const hasUpdate = !!registrationRef.current.waiting;
      if (hasUpdate) {
        // Disparar el evento que ya escucha UpdateBanner
        const event = new CustomEvent('pwaUpdate', { detail: registrationRef.current });
        window.dispatchEvent(event);
      }
      return { hasUpdate };
    } finally {
      setIsCheckingUpdate(false);
    }
  }, []);

  /**
   * Activa o desactiva las push notifications para este dispositivo.
   */
  const togglePush = useCallback(async () => {
    if (!registrationRef.current || isTogglingPush) return;
    setIsTogglingPush(true);
    try {
      if (isSubscribed) {
        // Desactivar
        const subscription = await registrationRef.current.pushManager.getSubscription();
        if (subscription) {
          const endpoint = subscription.endpoint;
          await subscription.unsubscribe();
          await http.delete('/push/unsubscribe', { data: { endpoint } });
        }
        setIsSubscribed(false);
      } else {
        // Activar — pedir permiso si hace falta
        const permission = await Notification.requestPermission();
        setPushPermission(permission);
        if (permission !== 'granted') return;

        const { publicKey } = await http.get('/push/public-key');
        const convertedKey = urlBase64ToUint8Array(publicKey.trim());

        const subscription = await registrationRef.current.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedKey,
        });
        await http.post('/push/subscribe', subscription.toJSON());
        setIsSubscribed(true);
      }
    } catch (err) {
      console.error('Error al cambiar estado de push:', err);
    } finally {
      setIsTogglingPush(false);
    }
  }, [isSubscribed, isTogglingPush]);

  /**
   * Envía una push de prueba usando datos de la última reserva real.
   */
  const sendTestNotification = useCallback(async () => {
    if (isSendingTest) return;
    setIsSendingTest(true);
    setTestResult(null);
    try {
      const data = await http.post('/push/test');
      setTestResult({ success: true, message: data.message || '¡Notificación enviada! Revisá tu dispositivo.' });
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al enviar la notificación de prueba.';
      setTestResult({ success: false, message: msg });
    } finally {
      setIsSendingTest(false);
      // Limpiar el mensaje tras 5 segundos
      setTimeout(() => setTestResult(null), 5000);
    }
  }, [isSendingTest]);

  return {
    swStatus,
    isDevMode,
    checkForUpdate,
    isCheckingUpdate,
    pushSupported,
    pushPermission,
    isSubscribed,
    isTogglingPush,
    togglePush,
    sendTestNotification,
    isSendingTest,
    testResult,
  };
};

export default usePwaStatus;
