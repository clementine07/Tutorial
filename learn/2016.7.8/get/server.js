/**
 * Created by dell on 2016/7/8.
 */
/*REST响应G请求：*/

var restify = require('restify');


var ip_addr = '127.0.0.1';
var port    =  '9998';
/*createServer() 函数接受一个选择对象，
将myapp作为选择对象的服务器的名称传递给它*/
var server = restify.createServer({
    name: "myapp",
    key:"dfd"
});


/*创建服务器实例之后，通过端口、
ip地址和一个回调函数调用listen函数。*/
server.listen(port ,ip_addr, function(){
    console.log('%s listening at %s ', server.name , server.url);
});