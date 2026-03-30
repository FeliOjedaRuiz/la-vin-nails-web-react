const mongoose = require('mongoose');
const pushService = require('./api/utils/push.service');
require('dotenv').config({ path: './api/.env' });

async function runTest() {
  try {
    console.log('Conectando a MongoDB para buscar administradores suscritos...');
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('Enviando notificación de prueba...');
    await pushService.sendNotificationToAdmins({
      title: 'Prueba de Sistema 💅',
      body: '¡Hola! Si lees esto, el sistema de notificaciones de La Vin Nails está 100% operativo.',
      url: '/admin'
    });

    console.log('✅ Petición de envío completada.');
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error en el test de push:', error);
    process.exit(1);
  }
}

runTest();
