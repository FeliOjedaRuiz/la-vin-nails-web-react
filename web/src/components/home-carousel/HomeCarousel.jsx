import { Carousel } from "@material-tailwind/react";
import mobile1 from "../../images/portada-2024-s.jpg";
import desktop1 from "../../images/portada-2024-w.jpg";
import mobile2 from "../../images/portada-fachada-2024-s.jpg";
import desktop2 from "../../images/portada-fachada-2024-w.jpg";
import mobile3 from "../../images/portada-trabajos1-s.jpg";
import desktop3 from "../../images/portada-trabajos1-w.jpg";
import mobile4 from "../../images/portada-trabajos2-s.jpg";
import desktop4 from "../../images/portada-trabajos2-w.jpg";
import { useEffect, useState } from "react";

export function HomeCarousel() {
  const [image1, setImage1] = useState(mobile1);
  const [image2, setImage2] = useState(mobile1);
  const [image3, setImage3] = useState(mobile1);
  const [image4, setImage4] = useState(mobile1);
  const [changeSize, setChageSize] = useState(true);
  useEffect(() => {
    if (window.innerHeight < window.innerWidth) {
      setImage1(desktop1);
      setImage2(desktop2);
      setImage3(desktop3);
      setImage4(desktop4);
    } else {
      setImage1(mobile1);
      setImage2(mobile2);
      setImage3(mobile3);
      setImage4(mobile4);
    }
  }, [changeSize]);
  window.onresize = function (event) {
    setChageSize(!changeSize);
    console.log("resize");
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
      
      <img src={image1} alt="Interior de estudio" className="w-full object-cover" />
      <img src={image2} alt="fachada de estudio" className="w-full object-cover" />
      <img src={image3} alt="trabajos de manicuria" className="w-full object-cover" />
      <img src={image4} alt="trabajos de manicuria" className="w-full object-cover" />

      {/* <img
        src="https://images.unsplash.com/photo-1493246507139-91e8fad9978e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2940&q=80"
        alt="foto 2"
        className="h-full w-full object-cover"
      />
      <img
        src="https://images.unsplash.com/photo-1518623489648-a173ef7824f3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2762&q=80"
        alt="foto 3"
        className="h-full w-full object-cover"
      /> */}
    </Carousel>
  );
}
