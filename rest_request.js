var querystring = require('querystring');
var https = require('https');

var hostname = 'csademo4.solutionplace.svcs.hpe.com';
var username = 'idmTransportUser';
var password = 'cloud';
var portno = 8444;
var token_path = '/idm-service/v2.0/tokens';
    

function performRequest(endpoint, method, data, success) {
  var dataString = JSON.stringify(data);
  var headers = {};
  
  if (method == 'GET') {
    endpoint += '?' + querystring.stringify(data);
  }
  else {
    headers = {
      'Accept': '*/*',
      'Content-Type': 'application/json',
      'Content-Length': dataString.length,
      'Authorization' : 'Basic ' + new Buffer(username + ':' + password).toString('base64')
    };
  }

  var options = {
    hostname: hostname,
    path: endpoint,
    method: method,
    port: portno,
    headers: headers,
  };

  // ignore self-signed certificates
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

  var req = https.request(options, function(res) {
    res.setEncoding('utf-8');

    var responseString = '';

    res.on('data', function(data) {
      responseString += data;
    });

    res.on('end', function() {
      console.log('----------- Response String --------------------\n' + responseString);
      var responseObject = JSON.parse(responseString);
      console.log('----------- Response Object -----------------------\n' + responseObject.token.id );
      success(responseObject);
    });
  });

  req.write(dataString);
  req.end();
}

function GetToken() {
  performRequest('/idm-service/v2.0/tokens', 'POST', {
    "passwordCredentials" : {
        "username" : "consumer",
        "password" : "cloud"
        },
        "tenantName" : "CONSUMER"
    },  function(data) {
    console.log('Received Token ' + data.token.id);
  });
}

GetToken();
