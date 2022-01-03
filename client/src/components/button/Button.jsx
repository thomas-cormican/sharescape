import React, { useState, useEffect } from "react";
import { AiOutlineSend } from "react-icons/ai";

import "./button.scss";

function Button({ children, logo, onClick, primary, size, post }) {
  const [windowWidth, setWindowWidth] = useState(null);
  useEffect(() => {
    setWindowWidth(window.innerWidth);
    function handleResize() {
      setWindowWidth(window.innerWidth);
    }

    window.addEventListener("resize", handleResize);
  }, []);

  return (
    <div className="button__wrapper">
      <button
        onClick={onClick}
        className={`button ${primary && "primary"} ${size}`}
      >
        <span className="button__icon">
          {logo === "google" && <img src="/google-g.png" alt="" />}
        </span>

        {windowWidth <= 1250 && post ? (
          <AiOutlineSend />
        ) : (
          <span className="button__text">{children}</span>
        )}
      </button>
    </div>
  );
}

export default Button;
