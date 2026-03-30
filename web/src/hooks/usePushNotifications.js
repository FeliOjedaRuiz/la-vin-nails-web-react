import { useEffect } from 'react';
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

const usePushNotifications = (user) => {
  useEffect(() => {
    // Solo para administradores y si el navegador soporta Service Workers y Push
    if (user?.role !== 'admin' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      return;
    }

    const initPush = async () => {
      try {
        const registration = await navigator.serviceWorker.ready;

        // Pedir permiso al usuario (si no lo tiene ya o si está bloqueado)
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          console.warn('Permiso de notificaciones push denegado o ignorado.');
          return;
        }

        // Obtener la clave pública VAPID del backend
        const { publicKey } = await http.get('/push/public-key');

        const convertedVapidKey = urlBase64ToUint8Array(publicKey);

        // Intenta obtener la suscripción existente
        let subscription = await registration.pushManager.getSubscription();

        // Si ya existe, la comparamos o la renovamos para asegurar que usa la nueva clave VAPID
        if (subscription) {
          await subscription.unsubscribe();
        }
        
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey,
        });

        // Enviar la suscripción al backend con toJSON() para evitar problemas de serialización
        await http.post('/push/subscribe', subscription.toJSON());
        
        console.log('Push notifications: Suscrito correctamente');

      } catch (error) {
        console.error('Error inicializando Push Notifications:', error);
      }
    };

    initPush();
  }, [user]);
};

export default usePushNotifications;
