/**
 * Created by dell on 2016/7/13.
 */
var fs = require('fs');
var restify = require('restify');
var server = restify.createServer();
var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://localhost/message');
var userSchema = new mongoose.Schema({
    uid:String,//用户ID
    sid:String,//新浪ID
    nickname:String,//昵称
    sex:String,
    birthday:{type:Date,default:Date.now},
    //Date.now只是一个函数，每次他调用的时候才会生成一个时间，Date.now()是传递的一个时间
    ava:String,//img不知道存储类型是什么。//头像
    age: { type: Number, min: 0, max:120 },
    home:String,
    location:String,//位置
     profile:String,//简介 
    job:String,//工作
    description:String,
    area:String,
    communion_interests:String
});
var messageSchema = new mongoose.Schema({
    content:String,//文字消息
    p:Number ,//页码
    uid:String,
    sid:String
});
var userModel=db.model('user',userSchema );
var messageModel=db.model('message',messageSchema);
/*function  upload_ava(res,req,next){
    var conditions = {
        uid:req.params.uid,
        sid:req.params.sid
    };
    var options  = {$exists: true};
   userModel.find(conditions, options,  function (err, result) {
        if (err) {
            res.send(err);
            console.log(err);
            return;
        }
        else
        {
            res.send(result);
            console.log(result);
            fs.readFile('file.txt', 'utf-8', function(err, data) {
                if (err) {
                    console.error(err);
                } else {
                    console.log(data);
                }
            });
        }
    });
}
function ava_upload(req, res, next) {
    var path = req.files.f.path;
    if (!path) {
        res.send({
            's': '0',
            'e': 'path is null'
        });
        return;
    }
    var sid = req.params.sid;
    if (!sid) {
        res.send({
            's': '0',
            'e': 'sid is null'
        });
        return;
    }
    var uid = req.params.uid;
    if (!uid) {
        res.send({
            's': '0',
            'e': 'uid is null'
        });
        return;
    }

    fs.rename(path, '/Library/WebServer/Documents/img/' + sid + Date.parse(new Date()) + '.png', function(err) {
        if (err) {
            throw (err);
            return;
        } else {
            db_ava_upload(res, uid, sid, '/img/' + sid + Date.parse(new Date()) + '.png');
        }
    });
}*/
/*server.post('/ava_upload', function(req,res,next) {
    upload_ava(req,res,next);
});*/
/*server.get('/ava_upload', function(req,res,next) {
    upload_ava(req,res,next);
});*/
/*server.post('/ava_upload', ava_upload);*/


function user_log(req,res,next){
    var conditions = {
            nick :req.params.nick,
            ava :req.params.ava,
            sid :req.params.sid,
    };
    var fields   = {sid: 1,_id : 1, nick  : 1,ava:1,img:1,
    age:1,location:1,profile:1,job:1}; // 待返回的字段
    var options  = {};//存在
    userModel.find(conditions,fields , options , function (err, result) {
        if (err) {
            res.send(err);
            console.log(err);
            return;
        }
        else
        {
            res.send(result);
            console.log(result);
        }
    });

}
server.get('/log', user_log);
server.listen(1211, '127.0.0.1',function() {
    console.log('%s listening at %s', server.name, server.url);
});

