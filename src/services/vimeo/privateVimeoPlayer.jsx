import React from "react";
import "./vimeo.css";

const PrivateVimeoPlayer = ({ embedHtml }) => {
  return (
    <div
      className="video-container relative w-full 
      h-full
       overflow-hidden"
    >
      <canvas
        className="absolute inset-0 z-50 pointer-events-none"
      />

      <div
        className="w-full 
      h-full 
      relative"
      >
        <div
          className="absolute video-wrapper inset-0 h-full w-full z-10"
          dangerouslySetInnerHTML={{ __html: embedHtml }}
        />
      </div>
    </div>
  );
};

export default PrivateVimeoPlayer;
