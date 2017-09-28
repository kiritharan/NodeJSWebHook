
var bodyParser = require('body-parser');
var express = require('express');
var app = express();
var xhub = require('express-x-hub');
var access_token = "DQVJ2SzVFMkpvNmM1QkpNZAUxrX1BMdUZAySW5uaWQ1UnZAkRGFsLU15aW1wZAkpwenNPTjNQSENIT2RBRGtNZAlNfbjZAkQ21vRmk4aTVpdEpGMlVoWl94ZAW4tNWpaMDgySXVqOTlaNnlyLWpfS3dvd3g5OEdnQUlKcnBLTzJxRFJ1dGZAkOVJreUI0b1o3U2NtS2FzUFprME5NcHl2YzNnTEo5a2JxRm9NRnV0MllGSWxkZATZA3a3BMUmZAXWk1BRUxqNjJmcTBMSlhkd2czOVRHTVdISAZDZD";
var APP_SECRET = "29e07098746b8ab7ec1b28210dbfe5ac";
var token = "hello";
var message;

app.set('port', (process.env.PORT || 5000));
app.listen(app.get('port'));

app.use(xhub({ algorithm: 'sha1', secret: APP_SECRET }));
app.use(bodyParser.json());

//var token = process.env.TOKEN || 'token';
var received_updates = [];

app.get('/', function(req, res) {
  console.log('req: ' + req);
  res.send('<pre>' + JSON.stringify(received_updates, null, 2) + '</pre>');
});

app.get(function(req, res) {  
    message = "Receieved"; 
  if (req.param('hub.verify_token') == token) 
  {
      message = "Success";
    res.send(req.param('hub.challenge'));
  } 
  else 
  {
    message = "failed";
    res.s
    endStatus(400);
  }
});



app.post('/facebook', function(req, res) {
  console.log('Facebook request body:', req.body);

  if (!req.isXHubValid()) {
    console.log('Warning - request header X-Hub-Signature not present or invalid');
    res.sendStatus(401);
    return;
  }

  console.log('request header X-Hub-Signature validated');
  // Process the Facebook updates here
  received_updates.unshift(req.body);
  res.sendStatus(200);
});

app.post('/instagram', function(req, res) {
  console.log('Instagram request body:');
  console.log(req.body);
  // Process the Instagram updates here
  received_updates.unshift(req.body);
  res.sendStatus(200);
});

app.listen();
var http = require('http');

var server = http.createServer(function(request, response) {

    response.writeHead(200, {"Content-Type": "text/plain"});
    response.end("Hello World!" + message);

});

var port = process.env.PORT || 1337;
server.listen(port);

console.log("Server running at http://localhost:%d", port);
