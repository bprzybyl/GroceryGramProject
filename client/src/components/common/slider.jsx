import React from "react";

const Slider = ({ name, label, checked, error, ...rest }) => {
  return (
    <div className="custom-control custom-switch mt-2 mb-2">
      <input
        {...rest}
        checked={checked}
        type="checkbox"
        className="custom-control-input"
        id={name}
        name={name}
      ></input>
      <label className="custom-control-label" htmlFor={name}>
        {label}
      </label>
    </div>
  );
};

export default Slider;
