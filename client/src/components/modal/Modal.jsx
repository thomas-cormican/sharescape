import React from "react";
import { AiOutlineClose } from "react-icons/ai";

import "./modal.scss";

function Modal({ children, closeModal }) {
  return (
    <div className="modal">
      <div onClick={() => closeModal()} className="modal__overlay"></div>
      <div className="modal__content">
        <button onClick={() => closeModal()} className="modal__close">
          <AiOutlineClose />
        </button>
        <div className="modal__children">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
