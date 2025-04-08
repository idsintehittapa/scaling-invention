import React from "react";
import "./hero.css";

const Hero: React.FC = () => {
  return (
    <div className="hero-container">
      {/* Background video with overlay */}
      <video className="background-video" autoPlay loop muted playsInline>
        <source
          src="https://www.youtube.com/watch?v=I3suYQ0kLF4"
          type="video/mp4"
        />
      </video>

      {/* Dark overlay for better text visibility */}
      <div className="overlay"></div>

      {/* Content centered on screen */}
      <div className="hero-content">
        <div className="text-container">
          <h1 className="hero-title">Loreum Ipsum</h1>
          <p className="hero-subtitle">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Hero;
