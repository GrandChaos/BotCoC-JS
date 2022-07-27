var http = require('http');

http.createServer(function(req, res) {
  res.write("<h2>BOT GOVNA</h2>\
  <h4> by #STABILITY</h4>\
  <widgetbot\
    server='961280288057593877'\
    channel='961302414483390504'\
    width='800'\
    height='600'\
></widgetbot>\
<script src='https://cdn.jsdelivr.net/npm/@widgetbot/html-embed'></script>\
  <p>__________________________________________________________________</p>\
  <p><a href='http://alstability.ru/'>Our website</a></p>\
  <p><a href='https://discord.gg/BwfdbsWAKP'>Our discord</a></p>");
  res.end();
}).listen(8080);