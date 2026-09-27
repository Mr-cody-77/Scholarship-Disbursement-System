import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import image1 from "../assets/1.png";
import image2 from "../assets/2.jpg";
import image3 from "../assets/2.png";
import image4 from "../assets/4.png";

const PhotoSlider = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
  };

  // Add imported images to the array
  const images = [image1, image2, image3, image4];

  return (
    <div className="my-8">
      <Slider {...settings}>
        {images.map((src, index) => (
          <div key={index}>
            <img
              src={src}
              alt={`Slide ${index + 1}`}
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default PhotoSlider;
