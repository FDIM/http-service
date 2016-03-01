var http = require("http");
var HttpService = require("./index.js");
var port =  34356;
var proxy = http.createServer( (req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('{"data":["test"]}');
});
proxy.listen(port);
var endpoint = "http://localhost:"+port;
var https = new HttpService(endpoint);
https.get("/key/value/one/two",{}, function(err, res) {
  proxy.close();
  if(res.data[0]==='test'){
    process.exit(0);
  }else{
    process.exit(1);
  }
});
