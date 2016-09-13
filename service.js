var extend = require('extend');
var url = require('url');
var querystring = require('querystring');
var http = require('http');
var https = require('https');

function HttpService(endpoint) {
  this.requestOptions = undefined;
  if (typeof endpoint !== 'undefined' && endpoint) {
    this.init(endpoint);
  }
}
// export
module.exports = HttpService;

HttpService.prototype.init = function (endpoint) {
  if (!endpoint) {
    return;
  }
  this.init = function () { };
  this.requestOptions = url.parse(endpoint);
  this.requestOptions.headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36',
    'Accept': 'application/json;charset=UTF-8'
  };
  // add authorization header
  if (this.requestOptions.auth) {
    this.requestOptions.headers.Authorization = 'Basic ' + (new Buffer(this.requestOptions.auth)).toString('base64');
  }
};
HttpService.prototype.delete = function (path, query, callback) {
  this.request(path, 'delete', query, callbackWithJSONParsing(callback));
};
HttpService.prototype.put = function (path, query, data, callback) {
  var payload = JSON.stringify(data);
  this.upload(path, 'put', query, 'application/json;charset=UTF-8', payload, callbackWithJSONParsing(callback));
};
HttpService.prototype.get = function (path, query, callback) {
  this.request(path, 'get', query, callbackWithJSONParsing(callback));
};
HttpService.prototype.post = function (path, query, data, callback) {
  var payload = JSON.stringify(data);
  this.upload(path, 'post', query, 'application/json;charset=UTF-8', payload, callbackWithJSONParsing(callback));
};
HttpService.prototype.request = function (path, method, query, callback) {
  var request = extend({}, this.requestOptions);
  if (path !== undefined) {
    request.path = path + '?' + querystring.stringify(query);
  }
  request.method = method;
  var pending = (request.protocol === 'https:' ? https : http).request(request, function (res) {
    var result = '';
    res.on('data', function (chunk) {
      result += chunk;
    });
    res.on('end', function () {
      // 2xx
      if (res.statusCode / 100 !== 2) {
        callback({
          code: res.statusCode,
          message: res.statusMessage || "Status code is not 2xx"
        }, result);
      } else {
        callback(undefined, result);
      }
    });

  });
  pending.on('error', function (e) {
    e.message = "connection-error";
    callback(e);
  });
  pending.end();
};
HttpService.prototype.upload = function (path, method, query, contentType, payload, callback) {
  var request = extend({}, this.requestOptions);
  request.headers['Content-Type'] = contentType;
  request.headers['Content-Length'] = Buffer.byteLength(payload);
  if (path !== undefined) {
    request.path = path + '?' + querystring.stringify(query);
  }
  request.method = method;
  var pending = (request.protocol === 'https:' ? https : http).request(request, function (res) {
    var result = '';
    res.on('data', function (chunk) {
      result += chunk;
    });
    res.on('end', function () {
      // 2xx
      if (res.statusCode / 100 !== 2) {
        callback({
          code: res.statusCode,
          message: res.statusMessage || "Status code is not 2xx"
        }, result);
      } else {
        callback(undefined, result);
      }
    });

  });
  pending.on('error', function (e) {
    e.message = "connection-error";
    callback(e);
  });
  pending.write(payload);
  pending.end();
};
function callbackWithJSONParsing(callback) {
  return function (err, response) {
    if (err) {
      try {
        var res = JSON.parse(response || '""');
        if (res && res !== '') {
          var parsedError = res.error || res;
          if (typeof parsedError === 'string') {
            parsedError = { message: parsedError };
          }
          parsedError.previous = err;
          callback(parsedError, undefined);
        } else {
          callback(err, response);
        }
      } catch (e) {
        callback({ message: e.message, previous: err }, response);
      }
    } else {
      try {
        callback(err, JSON.parse(response || '""'));
      } catch (e) {
        callback({ message: e.message }, response);
      }
    }
  };
}
