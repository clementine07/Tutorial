/**
 * Created by dell on 2016/7/8.
 */
var restify=require('restify');
var client=restify.createJsonClient({
    url:'http://localhost:3999'
});
client.get('/json/v2',function(err,req,res,obj){
    if(err)
        console.log(err);
    console.log(JSON.stringify(obj,null,2));
});
