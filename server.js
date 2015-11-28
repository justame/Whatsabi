var config = require("./config"),
    appName = config.appName,
    ip = config.ip,
    port = config.port,
    http = require("http"),
    express = require("express"),
    app = express();

app.use(express.static(__dirname + "/public"));

var server = http.createServer(app);

server.listen(port);
console.log(appName + " app running at http://" + ip + ":" + port);