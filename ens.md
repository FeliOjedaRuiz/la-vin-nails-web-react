# ens.md (Estructura de Narrativa del Sistema)

## 1. El Alma del Proyecto: ¿Qué es La Vin Nails?

**La Vin Nails** es el escaparate digital y centro de gestión de un salón de estética especializado en el cuidado de uñas, belleza y bienestar. Su propósito es elevar la experiencia de autocuidado desde el primer contacto digital:

1.  **Para los Administradores:** Ser una herramienta de gestión eficiente que centralice los servicios, las citas y la interacción con los clientes, minimizando el trabajo administrativo manual y maximizando la ocupación del salón.
2.  **Para los Clientes:** Ofrecer un catálogo visualmente atractivo, premium y fácil de navegar donde puedan descubrir servicios, conocer precios y solicitar citas de forma intuitiva desde cualquier dispositivo, con un enfoque *Mobile-First*.

## 2. Puntos de Dolor y Soluciones (Narrativa Funcional)

### 2.1. Gestión de Servicios Dinámica
- **Dolor:** Actualizar precios o servicios en el código es lento y propenso a errores.
- **Solución:** Integración con **Notion** (según se observa en el stack) para que los administradores puedan gestionar el catálogo de servicios de forma externa y sencilla, reflejándose automáticamente en la web.

### 2.2. Experiencia Visual Premium
- **Dolor:** La estética en el sector de las uñas es fundamental; una web descuidada aleja al cliente.
- **Solución:** Uso de **Cloudinary** para optimizar y servir imágenes de alta calidad del portafolio. Un diseño limpio, elegante y con micro-animaciones que transmita profesionalidad y cuidado.

### 2.3. Disponibilidad y Comunicación
- **Dolor:** Pérdida de citas por falta de confirmación rápida o solapamiento.
- **Solución:** Sistema de notificaciones vía **Nodemailer** y una lógica de backend robusta con **Mongoose** para gestionar el estado de las solicitudes de citas.

## 3. Arquitectura del Modelo Mental (Las Entidades)

1.  **`El Servicio`**: La unidad base de valor. Definido por nombre, descripción, precio y duración. Proviene de una fuente de verdad (posiblemente Notion/MongoDB).
2.  **`La Cita`**: La reserva de tiempo de un cliente para uno o varios servicios. Incluye datos del cliente, estado (Pendiente, Confirmada) y fecha/hora.
3.  **`El Portafolio`**: La galería visual de trabajos realizados, gestionada mediante Cloudinary.

## 4. Visión de Sistema Vivo (El Futuro)

El proyecto busca evolucionar hacia una plataforma integral de reservas en tiempo real, posiblemente integrando pasarelas de pago o un sistema de fidelización de clientes. La arquitectura actual debe ser modular y escalable para permitir estas futuras expansiones sin necesidad de reescribir el núcleo del sistema.
