var querystring = require('querystring');
var https = require('https');

var hostname = 'csademo4.solutionplace.svcs.hpe.com';
var username = 'idmTransportUser';
var password = 'cloud';
var portno = 8444;
var token_path = '/idm-service/v2.0/tokens';
var mpp_path = '/csa/api/mpp/mpp-offering/filter';
var off_path = '/csa/api/mpp/mpp-offering'
var csa_token = '';


function performRequest(endpoint, method, data, success) {
  var dataString = JSON.stringify(data);
  var headers = {};
  console.log('in preformRequest with csa_token = ' + csa_token);
  if (method == 'GET') {
       headers = {
        'Accept': '*/*',
        'Content-Type': 'application/json',
        'Content-Length': dataString.length,
        'Authorization' : 'Basic ' + new Buffer(username + ':' + password).toString('base64'),
        'x-auth-token' : csa_token
       };
    endpoint += '?' + querystring.stringify(data);
    console.log('---------- end point -------------\n' + endpoint);
  }
  else {
    headers = {
      'Accept': '*/*',
      'Content-Type': 'application/json',
      'Content-Length': dataString.length,
      'Authorization' : 'Basic ' + new Buffer(username + ':' + password).toString('base64'),
      'x-auth-token' : csa_token
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
      var responseObject = JSON.parse(responseString);
      //console.log('----------- Response Object -----------------------\n' + responseObject.token.id );
      success(responseObject);
    });
  });

  req.write(dataString);
  req.end();
}

function GetToken() {
  console.log('in GetToken');
  performRequest('/idm-service/v2.0/tokens', 'POST', {
    "passwordCredentials" : {
        "username" : "consumer",
        "password" : "cloud"
        },
        "tenantName" : "CONSUMER"
    },  function(data) {
      csa_token = data.token.id;
      console.log('Received Token--------\n' + csa_token);
      GetMppOfferings();
  });
}


function GetMppOfferings() {
  console.log('in GetMppOfferings\n');
  performRequest(mpp_path, 'POST', {
        'approval':'ALL'
       },
    function(data) {
    console.log('Offerings---------\n' );
    console.dir (data, {depth:null, colors:true});
    GetOfferingDetails(data.members[0].id, data.members[0].catalogId, data.members[0].category.name)
  });
}

function GetOfferingDetails(offering_id, catalog_id, category_name) {
  console.log('in GetOfferingDetails\n');
  performRequest(off_path + '/' + offering_id, 'GET', {
      catalogId : catalog_id,
      category : category_name
    },
  function (data) {
    console.log('Offering Details------\n');
    console.dir(data, {depth:null, colors:true});
  });
}

GetToken();

// GetMppOfferings();