import React from "react";

import "./alert.scss";

function Alert({ message }) {
  return <div className="alertInner">{message}</div>;
}

export default Alert;
