import { Carousel } from "@material-tailwind/react";
import { useEffect, useState } from "react";

export function ResponsiveCarousel() {
  const desktop1 =
    "https://res.cloudinary.com/duoshgr3h/image/upload/v1723893978/PortadaSeptiembre24W_nuecv3.webp";
  // const desktop2 = "";
  const desktop3 =
    "https://res.cloudinary.com/duoshgr3h/image/upload/v1723893977/PortadaFraseW_aebphs.webp";
  const desktop4 =
    "https://res.cloudinary.com/duoshgr3h/image/upload/v1723893977/PortadaTrabajos1W_pmuqwe.webp";
  const desktop5 =
    "https://res.cloudinary.com/duoshgr3h/image/upload/v1723893977/PortadaTrabajos2W_uxwqx8.webp";
  const mobile1 =
    "https://res.cloudinary.com/duoshgr3h/image/upload/v1723893977/PortadaSeptiembre24S_lqo1pp.webp";
  // const mobile2 = "";
  const mobile3 =
    "https://res.cloudinary.com/duoshgr3h/image/upload/v1723893977/PortadaFraseB_ijq8a1.webp";
  const mobile4 =
    "https://res.cloudinary.com/duoshgr3h/image/upload/v1723893977/PortadaTrabajos1S_bpcjc0.webp";
  const mobile5 =
    "https://res.cloudinary.com/duoshgr3h/image/upload/v1723893977/PortadaTrabajos2S_jqnsqk.webp";

  const [image1, setImage1] = useState(desktop1);
  // const [image2, setImage2] = useState(desktop2);
  const [image3, setImage3] = useState(desktop3);
  const [image4, setImage4] = useState(desktop4);
  const [image5, setImage5] = useState(desktop5);
  const [changeSize, setChageSize] = useState(true);

  useEffect(() => {
    if (window.innerWidth > 640) {
      setImage1(desktop1);
      // setImage2(desktop2);
      setImage3(desktop3);
      setImage4(desktop4);
      setImage5(desktop5);
    } else {
      setImage1(mobile1);
      // setImage2(mobile2);
      setImage3(mobile3);
      setImage4(mobile4);
      setImage5(mobile5);
    }
  }, [changeSize]);

  window.onresize = function (event) {
    setChageSize(!changeSize);
  };

  return (
    <Carousel
      autoplay={true}
      loop={true}
      className="rounded-xl lg:rounded-3xl xl:rounded-5xl"
      navigation={({ setActiveIndex, activeIndex, length }) => (
        <div className="absolute bottom-4 left-2/4 z-50 flex -translate-x-2/4 gap-2">
          {new Array(length).fill("").map((_, i) => (
            <span
              key={i}
              className={`block h-1 cursor-pointer rounded-2xl transition-all content-[''] ${
                activeIndex === i ? "w-8 bg-white" : "w-4 bg-white/50"
              }`}
              onClick={() => setActiveIndex(i)}
            />
          ))}
        </div>
      )}
    >
      <img
        src={image1}
        alt="Interior de estudio"
        className="w-full object-cover"
      />
      {/* <img
        src={image2}
        alt="fachada de estudio"
        className="w-full object-cover"
      /> */}
      <img
        src={image3}
        alt="trabajos de manicuria"
        className="w-full object-cover"
      />
      <img
        src={image4}
        alt="trabajos de manicuria"
        className="w-full object-cover"
      />
      <img
        src={image5}
        alt="trabajos de manicuria"
        className="w-full object-cover"
      />
    </Carousel>
  );
}
