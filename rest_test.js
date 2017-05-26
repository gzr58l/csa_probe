var Client = require('node-rest-client').Client;
 
var options = {
                mimetypes: {
                        json: ["application/json", "application/json;charset=utf-8"],
                        xml: ["application/xml", "application/xml;charset=utf-8"]  
                    },
                user: "",
                password:""
                };


var client = new Client(options);
 
// direct way 
client.get("https://jsonplaceholder.typicode.com/posts/1", function (data, response) {
    // parsed response body as js object 
    console.log(data);
    // raw response 
    //console.log(response);
}).on('error', function (err) {
    console.log('something went wrong on the request', err.request.options);
});
 
// handling client error events 
client.on('error', function (err) {
    console.error('Something went wrong on the client', err);
});

// registering remote methods 
client.registerMethod("jsonMethod", "http://remote.site/rest/json/method", "GET");
 
client.methods.jsonMethod(function (data, response) {
    // parsed response body as js object 
    console.log(data);
    // raw response 
    //console.log(response);
});