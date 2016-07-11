/**
 * Created by dell on 2016/7/8.
 */
var restify=require('restify');
var client=restify.createStringClient({
    url:'http://localhost:3999'
});
client.get('/json/v1',function(err,req,res,obj){
    if(err)
        console.log(err);
    console.log(JSON.stringify(obj,null,2));
});