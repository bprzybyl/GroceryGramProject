const express = require("express");
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

app.use(bodyParser.json());
  
// enable cors for PATCH requests
app.options('*', cors());

require("./startup/db")();
require("./startup/routes")(app);

app.use(express.static('./public'));

const port = process.env.PORT || 3001;
const server = app.listen(port, function () {
  console.log("GroceryGram API listening on port 3001!");
});

module.exports = server;
