/**
 * Created by dell on 2016/7/8.
 */
var restify=require('restify');
var client=restify.createClient({
    url:'http://localhost:3999',
   // accept: 'text/plain'//!!! 字符串
    accept: 'application/json'
});
client.get('/json/v2',function(err,req){
    req.on('result',function(err,res){
        res.body='';
        res.setEncoding('utf8');
       res.on('data',function (chunk) {
           res.body+=chunk;

       });
        res.on('end',function () {
            console.log(res.body);
        })
    });
});
