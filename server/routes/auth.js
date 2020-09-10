const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { User } = require("../models/user");
const Joi = require("@hapi/joi");
const bcrypt = require("bcrypt");

// validates the incoming request
validateLogin = (req) => {
  const schema = Joi.object({
    email: Joi.string().email().min(5).max(64).required(),
    password: Joi.string().alphanum().min(3).max(64).required(),
  });
  return schema.validate(req);
};

// validates the incoming request
validateChangePassword = (req) => {
  const schema = Joi.object({
    email: Joi.string().email().min(5).max(64).required(),
    oldPassword: Joi.string().alphanum().min(3).max(64).required(),
    newPassword: Joi.string().alphanum().min(3).max(64).required(),
  });
  return schema.validate(req);
};

router.post("/", async (req, res) => {
  // validate the incoming request
  const { error } = validateLogin(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // get the user from mongo db and make sure exists
  let user = await User.findOne({ email: req.body.email.toLowerCase() });
  if (!user) return res.status(400).send("Invalid email or password.");

  // compare request password with stored user password
  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send("Invalid email or password.");

  // generate and send the token in header
  const token = user.generateAuthToken();
  res
    .header("x-auth-token", token)
    .header("access-control-expose-headers", "x-auth-token")
    .send();
});

router.patch("/", auth, async function (req, res) {
  // validate the incoming request
  const { error } = validateChangePassword(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // get the user from mongo db and make sure exists
  let user = await User.findOne({ email: req.body.email.toLowerCase() });
  if (!user) return res.status(404).send("Email not found");

  // compare request password with stored user password
  const validPassword = await bcrypt.compare(
    req.body.oldPassword,
    user.password
  );
  if (!validPassword) return res.status(400).send("Incorrect Password.");

  // hash and store the new password
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(req.body.newPassword, salt);
  await user.save();

  // generate new token and send in header
  const token = user.generateAuthToken();
  res
    .header("x-auth-token", token)
    .header("access-control-expose-headers", "x-auth-token")
    .status(200)
    .send("Password Changed!");
});

module.exports = router;
