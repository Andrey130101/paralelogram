const express = require("express");
const app = express();


app.use(express.static(__dirname + '/static'));

app.get("/", (request, response) => {
  response.sendFile(__dirname + "/index.html");
});
//process.env.PORT
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port ");
});
