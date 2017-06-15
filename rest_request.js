var querystring = require('querystring');
var https = require('https');

var hostname = 'csademo4.solutionplace.svcs.hpe.com';
var username = 'idmTransportUser';
var password = 'cloud';
var portno = 8444;
var ctype = 'application/json';
var token_path = '/idm-service/v2.0/tokens';
var mpp_path = '/csa/api/mpp/mpp-offering/filter';
var off_path = '/csa/api/mpp/mpp-offering';
var mpp_req_path = '/csa/api/mpp/mpp-request';
var csa_token = '';


function performRequest(endpoint, method, data, success) {
  var dataString = JSON.stringify(data);
  var headers = {};

  headers = {
    'Accept': '*/*',
    'Content-Type': ctype,
    'Content-Length': dataString.length,
    'Authorization' : 'Basic ' + new Buffer(username + ':' + password).toString('base64'),
    'x-auth-token' : csa_token
  };
  //console.log('in preformRequest with csa_token = ' + csa_token);
  if (method == 'GET') {
    endpoint += '?' + querystring.stringify(data);
    console.log('---------- end point -------------\n' + endpoint);
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
      if (res.statusCode != 200 ) {
        console.log ('Response string: \n', responseString);
      } else 
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
        "username" : "carl.kanzabedian@hpe.com", // "consumer"
        "password" : "carl2017"
        },
        "tenantName" : "SN"
    },  function(data) {
      csa_token = data.token.id;
      console.log('Received Token--------\n' + csa_token);
      GetMppOfferings();
      //GetCatalog();
  });
}


function GetMppOfferings() {
  console.log('in GetMppOfferings\n');
  performRequest(mpp_path, 'POST', {
        'approval':'ALL'
       },
    function(data) {
    console.log('---------------------------------------Offerings-------------------------------\n' );
   // console.dir (data, {depth:null, colors:true});
    for (i=0; i < data.members.length; i++ ){
       console.log("Offering Id: "   + data.members[i].id + '\n' +
                   "CatalogID: "     + data.members[i].catalogId + '\n' +
                   "Category Name: " + data.members[i].category.name + '\n');
       GetOfferingDetails(data.members[i].id, data.members[i].catalogId, data.members[i].category.name);
    }
  });
}

function GetOfferingDetails(offering_id, catalog_id, category_name) {
  console.log('in GetOfferingDetails\n');
  performRequest(off_path + '/' + offering_id, 'GET', {
      catalogId : catalog_id,
      category : category_name
    },
  function (data) {
    console.log('-----------------------------------------Offering Details------------------------\n');
    
    if (data.displayName == 'AWSVM' ){
      // console.dir(data, {depth:null, colors:true});
      console.log('OfferingId: ' + data.id + '\n' + 'DisplayName: ' + data.displayName + '\n');
      CreateSubscription(data.id, data.catalogId);
    }
  });
}

function GetCatalog() {
  console.log('in GetCatalog\n');
  performRequest('/catalog/filter', 'POST', {
    "state" : "ACTIVE"
  },
  function (data) {
    console.log('Catalog Details-------\n');
    console.dir(data, {depth:null, colors:true});
  });
}

function CreateSubscription(offeringId, catalogId) {
  console.log('in CreateSbscription');
  ctype = 'multipart/form-data; boundary=Abcdefg';

  performRequest(mpp_req_path + '/' + offeringId + '?catalogId=' + catalogId, 'POST', 
    '--Abcdefg' +
    'Content-Disposition: form-data; name="requestForm" ' + 
    '{"action":"ORDER"} ' +
    '--Abcdefg--',
    function(data) {
    console.log('Created subscription')
    console.dir(data, {depth:null, colors:true});
  });
}


GetToken();

// GetMppOfferings();