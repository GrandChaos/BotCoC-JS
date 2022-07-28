var http = require('http');

http.createServer(function(req, res) {
  res.write("<h2>BOT GOVNA</h2>\
  <h4> by #STABILITY</h4>");
  res.end();
}).listen(8080);