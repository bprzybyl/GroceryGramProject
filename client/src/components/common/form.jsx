import React, { Component } from "react";
import Joi from "joi-browser";
import Input from "./input";
import TextArea from "./textArea";
import Select from "./select";
import Slider from "./slider";

class Form extends Component {
  state = {
    data: {},
    error: {},
  };

  validate = () => {
    const options = { abortEarly: true };
    const { error } = Joi.validate(this.state.data, this.schema, options);
    if (!error) return null;

    const errors = {};
    for (let item of error.details) errors[item.path[0]] = item.message;
    return errors;
  };

  validateProperty = ({ name, value }) => {
    const obj = { [name]: value };
    const schema = { [name]: this.schema[name] };
    const { error } = Joi.validate(obj, schema);
    return error ? error.details[0].message : null;
  };

  handleSubmit = (e) => {
    e.preventDefault(); //prevent roundtrip http request to server
    const errors = this.validate();
    this.setState({ errors: errors || {} });
    if (errors) return;

    this.doSubmit();
  };

  handleSliderChange = ({ currentTarget: input }) => {
    const errors = { ...this.state.errors };
    const errorMessage = this.validateProperty(input);

    if (!errorMessage) delete errors[input.name];

    const data = { ...this.state.data };
    data[input.name] = input.checked;
    this.setState({ data, errors });
  };

  handleChange = ({ currentTarget: input }) => {
    const errors = { ...this.state.errors };
    const errorMessage = this.validateProperty(input);

    if (!errorMessage) delete errors[input.name];

    const data = { ...this.state.data };
    data[input.name] = input.value;
    this.setState({ data, errors });
  };

  handleChangeMultiRow = async ({ currentTarget: input }, row, valueField) => {
    const errors = { ...this.state.errors };
    const errorMessage = this.validateProperty(input);

    if (!errorMessage) delete errors[input.name];
    const data = [...this.state[valueField]];
    data[row][input.name] = input.value;
    this.setState({ valueField: data, errors });
  };

  renderButton(label, style = "btn btn-dark mt-2 mr-2") {
    return <button className={style}>{label}</button>;
  }

  renderButtonCustomHandler(
    label,
    handleClick,
    style = "btn btn-dark mt-2 mr-2"
  ) {
    return (
      <button className={style} onClick={(e) => handleClick(e)}>
        {label}
      </button>
    );
  }

  renderInput(name, label, type = "text", placeholder = "") {
    const { data, errors } = this.state;
    return (
      <Input
        type={type}
        name={name}
        label={label}
        placeholder={placeholder}
        value={data[name]}
        onChange={this.handleChange}
        error={errors[name]}
      />
    );
  }

  renderSlider(name, label, checked = false) {
    const { errors } = this.state;

    return (
      <Slider
        name={name}
        label={label}
        checked={checked}
        onChange={this.handleSliderChange}
        error={errors[name]}
      />
    );
  }

  renderTextArea(name, label, rows, placeholder = "") {
    const { data, errors } = this.state;
    return (
      <TextArea
        name={name}
        label={label}
        placeholder={placeholder}
        rows={rows}
        value={data[name]}
        onChange={this.handleChange}
        error={errors[name]}
      />
    );
  }

  renderMultiRowInput(
    name,
    label,
    row,
    valueField,
    type = "text",
    placeholder = ""
  ) {
    const { errors } = this.state;
    const stateField = this.state[valueField];

    return (
      <Input
        type={type}
        name={name}
        label={label}
        placeholder={placeholder}
        value={stateField[row][name]}
        onChange={(e) => this.handleChangeMultiRow(e, row, valueField)}
        error={row === this.state.validateIngredientsRow && errors[name]}
      />
    );
  }

  renderSelect(name, label, options) {
    const { data, errors } = this.state;
    return (
      <Select
        name={name}
        label={label}
        value={data[name]}
        options={options}
        onChange={this.handleChange}
        error={errors[name]}
      />
    );
  }

  renderMultiRowSelect(name, label, row, valueField, options, placeholder) {
    const { errors } = this.state;
    const stateField = this.state[valueField];

    return (
      <Select
        name={name}
        label={label}
        value={stateField[row][name]}
        options={options}
        onChange={(e) => this.handleChangeMultiRow(e, row, valueField)}
        error={row === this.state.validateIngredientsRow && errors[name]}
      />
    );
  }
}

export default Form;
