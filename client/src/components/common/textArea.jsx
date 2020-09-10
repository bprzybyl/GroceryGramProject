import React from "react";

const TextArea = ({ name, label, rows, placeholder, error, ...rest }) => {
  return (
    <div className="form-group">
      {label && <label htmlFor={name}>{label}</label>}

      <textarea
        {...rest}
        name={name}
        className="form-control"
        id={name}
        rows={rows}
        placeholder={placeholder}
      ></textarea>
      {error && <div className="alert alert-danger">{error}</div>}
    </div>
  );
};

export default TextArea;
