var username = 'Test';
var password = '123';
var auth = 'Basic ' + new Buffer(username + ':' + password).toString('base64');

console.log('Here is the encoded auth code ' + auth);