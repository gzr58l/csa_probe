var http = require('http');

function getJSON(options, cb){
    http.request(options, function(res) {
        var body = '';

        res.on('data', function(chunk){
            body+= chunk;
        });

        res.on('end', function() {
            var result = JSON.parse(body);
            cb(null, result);
        })

        res.on('error', cb);

    })
    .on('error', cb)
    .end();
}


var options = { 
    host: 'csademo4.solutionplace.svcs.hpe.com',
    port: 8444,
    path: '/idm-service/v2.0/tokens',
    method: 'POST',
    Authorization: 'Basic ' + new Buffer('idmTransportUser:cloud').toString('base64')   
};

getJSON(options, function(err, result){
    if (err) {
        return console.log('Error while trying to get price ', err);
    }

    console.log(result);
})


