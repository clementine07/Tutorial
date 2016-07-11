/**
 * Created by dell on 2016/7/7.
 */
var restify = require('restify');

function respond(req, res, next) {
    res.send('hello ' + req.params.name);
}

var server = restify.createServer();
server.get('/hello/:name', respond);//get路径

server.listen(9998, function() {
    console.log('%s listening at %s', server.name, server.url);
});