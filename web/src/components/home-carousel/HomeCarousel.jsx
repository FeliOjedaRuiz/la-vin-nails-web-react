import { Carousel } from "@material-tailwind/react";
import mobile1 from "../../images/portada-local-mobile.jpg";
import desktop1 from "../../images/portada-local-desktop.jpg";
import { useEffect, useState } from "react";

export function HomeCarousel() {
  const [image1, setImage1] = useState(mobile1);
  const [changeSize, setChageSize] = useState(true);
  useEffect(() => {
    if (window.innerHeight < window.innerWidth) {
      setImage1(desktop1);
    } else {
      setImage1(mobile1);
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
      className="rounded-xl"
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
      <img src={image1} alt="foto 1" className="w-full object-cover" />
      <img src={image1} alt="foto 1" className="w-full object-cover" />
      <img src={image1} alt="foto 1" className="w-full object-cover" />

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
