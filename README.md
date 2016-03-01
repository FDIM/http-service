# http-service
A simple nodejs module that wraps http, mainly targetting json data exchange between servers.

# install
As simple as "npm install http-service"

# usage
Standard get,post,put,delete methods are available. 

````
var HttpService = require('http-service');

var test = new HttpService("https://localhost:5426");

test.get('/my-path', {queryParam:1}, function(err, data){});
test.delete('/my-path', {queryParam:1}, function(err, data){});
test.post('/my-path', {queryParam:1}, {payloadParam:1}, function(err, data){});
test.put('/my-path', {queryParam:1}, {payloadParam:1}, function(err, data){});
````
