import React, { useState, useEffect } from "react";
import "./Carousel.css";

function Carousel({ images, currentIndex, onClose }) {
  const [index, setIndex] = useState(currentIndex);

  // Allow keyboard navigation (left/right/escape)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [index, images]);

  const handleNext = () => {
    setIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const handlePrev = () => {
    setIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  if (!images || images.length === 0) return null;
  const currentImage = images[index];

  return (
    <div className="carousel-backdrop" onClick={onClose}>
      <div className="carousel-modal" onClick={(e) => e.stopPropagation()}>
        <button className="carousel-btn btn-close" onClick={onClose}>
          &times;
        </button>
        <button className="carousel-btn btn-prev" onClick={handlePrev}>
          &#10094;
        </button>
        <div className="carousel-content">
          <img
            src={currentImage.url}
            alt={currentImage.title}
            className="carousel-image"
          />
          <h3 className="carousel-title">{currentImage.title}</h3>
          <span className="carousel-counter">
            {index + 1} / {images.length}
          </span>
        </div>
        <button className="carousel-btn btn-next" onClick={handleNext}>
          &#10095;
        </button>
      </div>
    </div>
  );
}

export default Carousel;
