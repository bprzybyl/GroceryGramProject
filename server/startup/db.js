const config = require("config");
const mongoose = require("mongoose");

module.exports = async () => {
  const db = config.get("remoteDb");

  await mongoose.connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false      
  });
};
