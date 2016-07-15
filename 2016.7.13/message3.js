/**
 * Created by dell on 2016/7/14.
 */
var restify = require('restify');
var server = restify.createServer();
//这一段是为了服务器更好获取请求参数
server.use(restify.acceptParser(server.acceptable));
server.use(restify.authorizationParser());
server.use(restify.dateParser());
server.use(restify.queryParser());
server.use(restify.jsonp());
server.use(restify.gzipResponse());
server.use(restify.bodyParser());
var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://localhost/message');
var userSchema = new mongoose.Schema({
    No: String,//新浪ID
    password:String,
    phone:Number,
    nickname: String,//昵称
    sex: String,
    birthday: {type: Date, default: Date.now},
    //Date.now只是一个函数，每次他调用的时候才会生成一个时间，Date.now()是传递的一个时间
    ava: String,//头像//存储图片的绝对路径
    age: {type: Number, min: 0, max: 120},
    follows: {},//对象 存数据
    likes: {},
    home: String,
    location: String,//位置
    profile: String,//简介
    job: String,//工作
    description: String,
    area: String,
    communion_interests: String
});
var messageSchema = new mongoose.Schema({
    content: String,//文字消息
    p: Number,//页码
    No: String
});
var userModel = db.model('user', userSchema);
var messageModel = db.model('message', messageSchema);
function user_register(req,res,next) {//用户注册是数据的插入
    userModel.create({
        No: req.params.No,//编号
        nickname: req.params.nickname,//昵称
        password:req.params.password,
        phone:req.params.phone
    }, function (err, result) {
        if (err) {
            res.send(err);
            console.log(err);
            return;
        }
        else {
            res.send('注册成功！');
            console.log(result);
        }
    });
}
function user_log(req,res,next) { //用户登录，是查询
    //No/nickname/phone & password
    var conditions = {"$or": [
        {No: req.params.No},
        {nickname: req.params.nickname},
        {phone:req.params.phone}],
        password:req.params.password//逻辑不够完善 password是必选项
    };
    userModel.findOne(conditions, function (err, doc) {
        if (err){
            res.send(err);
            console.log(err);
        }
        else
        {
            if(doc == null)//如果查询结果为空
                res.send('登录失败');
            else
                res.send('登录成功');
            console.log(doc);
        }
    });
}
//用户信息的获取
function user_info(req,res,next) {
    var conditions = {No:req.params.No};//编号在注册时就确定唯一
    var fields   = {_id:0,__v:0}; // 待返回的字段(除此之外）
    var options  = {$exists: true};//存在
    userModel.find(conditions,fields, options , function (err,result) {
        if (err)
            res.send(err);
        else
            res.send(result);
        console.log(result);
    });
}
function user_follow(req,res,next) {
    var aNo = req.params.aNo; //a的_id
    var bNo = req.params.bNo ;//b的_id
    if(!aNo&&!bNo)
        res.send('用户编号错误');
    var conditions = {No:bNo};//编号在注册时就确定唯一
    userModel.findOne(conditions, function (err,b_user) {
        if (err) {
            res.send('err');
            console.log(err);
        }
        else if (b_user == null)//如果B查找不到
        {
            res.send('查找用户不存在');
        }
        else
        {
            /*b_user.likes[aNo]使用前要写b_user.likes = b_user.likes || {};*/
            b_user.follows = b_user.follows || {};// ||或
            b_user.likes = b_user.likes || {};
            if(b_user.likes[aNo])//B互粉里有a,ab互粉
                res.send('已互粉，请勿重复关注');
            else if(b_user.follows[aNo])//b的粉丝里有a
                res.send('已关注，请勿重复关注');
            else{
                var conditions2= {No:aNo};
                userModel.findOne(conditions, function (err,a_user) {
                    if (err) {
                        res.send('a_user');
                        console.log(err);
                    }
                   /* else if(a_user.follows[bNo] == null ){
                        res.send('查找用户不存在');
                    }*/
                    else {
                         a_user.follows = a_user.follows || {};// ||或
                         a_user.likes = a_user.likes || {};
                        b_user.follows = b_user.follows || {};// ||或
                        b_user.likes = b_user.likes || {};
                        if (a_user.follows[bNo]==bNo)//b已关注a
                        {
                            var like_aNo=req.params.aNo;
                            var like_bNo = b_user.follows[bNo];
                            a_user.likes[bNo]=like_bNo;
                            delete  a_user.follows[aNo];
                            delete  b_user.follows[bNo];
                            b_user.likes[aNo]=like_aNo;
                            res.send('成功关注，成为互粉');
                        }

                       else
                        {
                            b_user.follows[aNo]=aNo;
                            res.send('成功关注');
                        }
                        a_user.markModified('follows');
                        a_user.markModified('likes');
                        b_user.markModified('follows');
                        b_user.markModified('likes');
                        a_user.save();
                        b_user.save();
                    }
                });
            }
        }
    });

}
function  user_like(req,res,next){
    //根据编号查询他的互粉人 和他的资料
}

function user_message_txt(req,res,next) {
    var aNo = req.params.aNo;
    var bNo = req.params.bNo;
    var content = req.params.content;

}


server.post('/reg',user_register);
server.get('/log', user_log);
server.get('/info', user_info);
server.get('/follow', user_follow);
server.get('/like', user_like);

server.listen(1218, '127.0.0.1', function () {
    console.log('%s listening at %s', server.name, server.url);
});