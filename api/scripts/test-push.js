require('dotenv').config();
const mongoose = require('mongoose');
const pushService = require('../utils/push.service');

async function runTest() {
  try {
    console.log('Conectando a MongoDB para buscar administradores suscritos...');
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('Enviando notificación de prueba...');
    const payload = {
      title: 'Nueva Reserva - La Vin Nails 💅',
      body: '¡Melisa! Tienes una nueva solicitud de manicura para mañana a las 11:00. Haz clic para ver los detalles.',
      url: '/admin/appointments'
    };
    await pushService.notifyAdmins(payload);

    console.log('✅ Petición de envío completada.');
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error en el test de push:', error);
    process.exit(1);
  }
}

runTest();
