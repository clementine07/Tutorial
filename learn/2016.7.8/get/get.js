/**
 * Created by dell on 2016/7/8.
 */
var restify = require('restify');

function respond(req, res, next) {
    res.send('hello ' + req.params.name);
}

var server = restify.createServer();
server.get('/hello/:name', respond);
server.head('/hello/:name', respond);

function send(req, res, next) {
    res.send('hello ' + req.params.name);
    return next();
}

server.post('/hello', function create(req, res, next) {
    res.send(201, {"firstName":"Brett"});
    return next();
});
server.put('/hello', send);
server.get(/^\/([a-zA-Z0-9_\.~-]+)\/(.*)/, send);
server.head('/hello/:name', send);
server.del('hello/:name', function rm(req, res, next) {
    res.send(204);
    return next();
});

server.listen(3900,'127.0.0.1', function() { //port,ip_adr
    console.log('%s listening at %s', server.name, server.url);
});

