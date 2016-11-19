var express = require('express');
var http = require('http');
var config = require('./config');
var appName = config.appName;
var port = config.port;
var app = express();

app.use(express.static(__dirname + '/public'));

var server = http.createServer(app);

server.listen(port);
console.log(appName + ' app running at http://localhost:' + port);
