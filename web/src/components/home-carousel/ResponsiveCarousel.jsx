import { Carousel } from '@material-tailwind/react';
import { useEffect, useState } from 'react';

export function ResponsiveCarousel() {
  const images = {
    desktop: {
      image1: 'https://res.cloudinary.com/duoshgr3h/image/upload/v1723893978/PortadaSeptiembre24W_nuecv3.webp',
      image3: 'https://res.cloudinary.com/duoshgr3h/image/upload/v1723893977/PortadaFraseW_aebphs.webp',
      image4: 'https://res.cloudinary.com/duoshgr3h/image/upload/v1723893977/PortadaTrabajos1W_pmuqwe.webp',
      image5: 'https://res.cloudinary.com/duoshgr3h/image/upload/v1723893977/PortadaTrabajos2W_uxwqx8.webp',
    },
    mobile: {
      image1: 'https://res.cloudinary.com/duoshgr3h/image/upload/v1723893977/PortadaSeptiembre24S_lqo1pp.webp',
      image3: 'https://res.cloudinary.com/duoshgr3h/image/upload/v1723893977/PortadaFraseB_ijq8a1.webp',
      image4: 'https://res.cloudinary.com/duoshgr3h/image/upload/v1723893977/PortadaTrabajos1S_bpcjc0.webp',
      image5: 'https://res.cloudinary.com/duoshgr3h/image/upload/v1723893977/PortadaTrabajos2S_jqnsqk.webp',
    },
  };

  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    handleResize(); // Set initial state
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // La imagen principal que es crítica para el LCP se carga de forma prioritaria
  const mainImageSrc = isMobile ? images.mobile.image1 : images.desktop.image1;
  const otherImages = isMobile ? images.mobile : images.desktop;
  
  return (
    <Carousel
      autoplay={true}
      loop={true}
      className="rounded-xl lg:rounded-3xl xl:rounded-5xl"
      navigation={({ setActiveIndex, activeIndex, length }) => (
        <div className="absolute bottom-4 left-2/4 z-50 flex -translate-x-2/4 gap-2">
          {new Array(length).fill('').map((_, i) => (
            <span
              key={i}
              className={`block h-1 cursor-pointer rounded-2xl transition-all content-[''] ${
                activeIndex === i ? 'w-8 bg-white' : 'w-4 bg-white/50'
              }`}
              onClick={() => setActiveIndex(i)}
            />
          ))}
        </div>
      )}
    >
      <img
        src={mainImageSrc}
        alt="Interior de estudio"
        className="w-full object-cover"
        fetchpriority="high"
      />
      <img
        src={otherImages.image3}
        alt="Frase La Vin Nails"
        className="w-full object-cover"
        loading="lazy"
      />
      <img
        src={otherImages.image4}
        alt="Trabajos de manicura"
        className="w-full object-cover"
        loading="lazy"
      />
      <img
        src={otherImages.image5}
        alt="Trabajos de manicura"
        className="w-full object-cover"
        loading="lazy"
      />
    </Carousel>
  );
}