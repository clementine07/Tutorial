/**
 * Created by dell on 2016/7/7.
 */
var http=require('http'),
    fs=require('fs'),
    url=require('url');
//创建http服务器
http.createServer(function(req,res)
{
    //获取web客户端请求路径
    var pathname=url.parse(req.url).pathname;
    
    console.log(req.url);
    console.log(req.method);
    console.log(req.headers);
    switch (pathname) {
        //判断请求参数是否为/index，如果是 就执行resIndex(res);
        case'/index':
            resIndex(res);
            break;
        case'/img':
            resImage(res);
            break;
        //返回404 not found
        default:resDefault(res);
            break;
    }
}).listen(1337);


function resIndex(res){
    var readPath=__dirname+'/'+url.parse('index.html').pathname;
    var indexPage=fs.readFileSync(readPath);
    res.writeHead(200,{'Content-Type':'text/html'});
    res.end(indexPage);
}

function resImage(res){
    var readPath=__dirname+'/'+url.parse('logo.jpg').pathname;
    var indexPage=fs.readFileSync(readPath);
    res.writeHead(200,{'Content-Type':'image/jpg'});
    res.end(indexPage);
}

function resDefault(res){
    res.writeHead(200,{'Content-Type':'text/plain'});
    res.end('can not find source');
}


