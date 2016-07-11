/**
 * Created by dell on 2016/7/8.
 */
var restify=require('restify');
var server=restify.createServer();
server.use(restify.acceptParser(server.acceptable));
server.use(restify.authorizationParser());
server.use(restify.dateParser());
server.use(restify.queryParser());
server.use(restify.jsonp());
server.use(restify.gzipResponse());
server.use(restify.bodyParser());
//  \是转义符
//用于处理JsonClient请求
/*server.get('/json/v1',funciton(req,res,next){
    var a = {name:'conan',blog:'blog.fen.me'}
    res.send(a);
});*/
server.get('/json/v1',function(req,res,next){
    var a={name:'conan',blog:'blog.fen.me'}
    res.send(a);
});
//用于处理StringClient请求
server.get('/json/v2',function(req,res,next)
{
    var a={name:'conan',blog:'blog.fens.me'}
    res.send(JSON.stringify(a));
    //stringify()用于从一个对象解析出字符串
});
server.listen(3999,'127.0.0.1',function(){
    console.log('%s listening at %s',server.name,server.url);
});

// json.v1 内容是{"name":"conan","blog":"blog.fen.me"}
// json.v1 内容是"{\"name\":\"conan\",\"blog\":\"blog.fens.me\"}"