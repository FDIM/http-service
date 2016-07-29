# http-service
A simple nodejs module that wraps http, mainly targetting json data exchange between servers.

# install
As simple as "npm install http-service"

# usage
Standard get,post,put,delete methods are available. 

````
var HttpService = require('http-service');

var test = new HttpService("https://localhost:5426"); 
// or
var test = new HttpService(); 
test.init("https://localhost:5426"); // meant to be initialized from outside and use environment variables

test.get('/my-path', {queryParam:1}, function(err, data){});
test.delete('/my-path', {queryParam:1}, function(err, data){});
test.post('/my-path', {queryParam:1}, {payloadParam:1}, function(err, data){});
test.put('/my-path', {queryParam:1}, {payloadParam:1}, function(err, data){});
````

# example

```
// services/my-api.js
var HttpService = require('http-service');

function MyApi(){
  HttpService.call(this);
}
MyApi.prototype = Object.create(HttpService.prototype);

module.exports = new MyApi();

MyApi.prototype.myCustomFn = function(user, data, callback){
  this.post('/api/user/'+user.id, {}, data, callback);
};

// server.js
var myApi = require('./services/my-api.js');
myApi.init(process.env.MY_API_ENDPOINT || "https://usr:1234353@localhost:4563");

// some-route.js
var myApi = require('../services/my-api.js');
myApi.myCustomFn({id:123},{name:""}, function(err, userData){});
```
