/* eslint-disable no-restricted-globals */

// Service Worker de La Vin Nails
// Estrategia: Cache-first para shell estático (HTML, CSS, JS).
// Las llamadas a la API del backend (Express) van siempre a red (NO están cacheadas).
// Workbox inyecta el manifest de precache en self.__WB_MANIFEST durante el build.
// Más info: https://developers.google.com/web/tools/workbox

import { clientsClaim } from 'workbox-core';
import { ExpirationPlugin } from 'workbox-expiration';
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate } from 'workbox-strategies';

// Toma el control de los clientes abiertos inmediatamente al activarse.
clientsClaim();

// Precachea todos los assets generados por el build (CSS, JS, HTML estático).
// CRA inyecta el manifest de URLs en self.__WB_MANIFEST durante `npm run build`.
// IMPORTANTE: esta variable DEBE estar presente aunque no uses precaching.
precacheAndRoute(self.__WB_MANIFEST);

// App Shell routing: todas las navegaciones se sirven desde index.html.
// Esto permite que React Router maneje las rutas en cliente.
const fileExtensionRegexp = new RegExp('/[^/?]+\\.[^/]+$');
registerRoute(
  ({ request, url }) => {
    if (request.mode !== 'navigate') {
      return false;
    }
    if (url.pathname.startsWith('/_')) {
      return false;
    }
    if (url.pathname.match(fileExtensionRegexp)) {
      return false;
    }
    return true;
  },
  createHandlerBoundToURL(process.env.PUBLIC_URL + '/index.html')
);

// Cache de imágenes PNG/WebP del dominio local con expiración de 50 entradas.
registerRoute(
  ({ url }) =>
    url.origin === self.location.origin &&
    (url.pathname.endsWith('.png') || url.pathname.endsWith('.webp')),
  new StaleWhileRevalidate({
    cacheName: 'la-vin-images',
    plugins: [
      new ExpirationPlugin({ maxEntries: 50 }),
    ],
  })
);

// Permite que la app fuerce el skip de la fase "waiting" del SW.
// Se usa para activar la nueva versión sin esperar a que el usuario cierre pestañas.
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Listener para recibir notificaciones Push en background
self.addEventListener('push', (event) => {
  if (event.data) {
    try {
      const payload = event.data.json();
      
      const title = payload.title || 'Nueva Notificación';
      const iconUrl = `${self.location.origin}/icons/icon-192x192.png`;

      const options = {
        body: payload.body || 'Tienes un nuevo mensaje.',
        icon: iconUrl,
        data: { url: payload.url || '/' },
        vibrate: [200, 100, 200]
      };

      event.waitUntil(self.registration.showNotification(title, options));
    } catch (e) {
      console.error('Error parseando push payload:', e);
    }
  }
});

// Listener para manejar el click en la notificación
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data.url;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Buscar si ya hay una pestaña exactamente en esa URL para enfocarla
      const exactMatch = windowClients.find((client) => {
        // Normalizar: quitar trailing slash y comparar URL limpia
        const clientUrl = client.url.replace(/\/$/, '');
        const targetUrl = urlToOpen.replace(/\/$/, '');
        return clientUrl === targetUrl;
      });

      if (exactMatch) {
        exactMatch.navigate(urlToOpen);
        return exactMatch.focus();
      }

      // No hay coincidencia exacta — abrir nueva pestaña
      return self.clients.openWindow(urlToOpen);
    })
  );
});
