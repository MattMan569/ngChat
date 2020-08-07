var path = require("path");
var express = require("express");

var app = express();

// var distDir = path.resolve(__dirname, "/dist");
app.use(express.static(__dirname + "/dist/ngChat"));

app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname + "/dist/ngChat/index.html"));
});

var server = app.listen(process.env.PORT || 8080, () => {
  var port = server.address().port;
  console.log("App is up on port", port);
});
