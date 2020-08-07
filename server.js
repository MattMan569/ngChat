var express = require("express");

var app = express();

var distDir = __dirname + "/dist";
app.use(express.static(distDir));

app.get("/*", (req, res) => {
  res.sendFile("index.html", {
    root: "dist/ngChat",
  });
});

var server = app.listen(process.env.PORT || 8080, () => {
  var port = server.address().port;
  console.log("App is up on port", port);
});
