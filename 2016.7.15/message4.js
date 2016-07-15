/**
 * Created by dell on 2016/7/15.
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
    sid: String,//新浪ID
    password:String,
    nickname: String,//昵称
    sex: String,
    birthday: {type: Date, default: Date.now},
    //Date.now只是一个函数，每次他调用的时候才会生成一个时间，Date.now()是传递的一个时间
    ava: String,//img不知道存储类型是什么。//头像
    age: {type: Number, min: 0, max: 120},
    location: String,//位置
    profile: String,//简介
    job: String,//工作
    description: String,
    area: String,
    communion_interests: String,
    follows: {},//对象 存数据
    likes: {}
});
var messageSchema = new mongoose.Schema({
    content: String,//文字消息
    p: Number,//页码
    a_id: String,
    b_id: String //对方id
});
var userModel = db.model('user', userSchema);
var messageModel = db.model('message', messageSchema);
function user_register(req, res, next) {
    var conditions={
        "$or":( {sid: req.params.sid},
        {nickname: req.params.nickname}),
        password:req.params.password,
        "$or":( {sex: req.params.sex},
        {birthday: req.params.birthday},
        {ava: req.params.ava},
        {age: req.params.age},
        {home: req.params.home},
        {location: req.params.location})

    };
    userModel.create(conditions, function (err, result) {
        if (err) {
            res.send(err);
            console.log(err);
            return;
        }
        else {
            res.send(result);
            console.log(result);
        }
    });
}

function user_info(req, res, next) {
    var conditions = {
        "$or": [
            {uid: req.params.uid},
            {sid: req.params.sid}]
    };
    var fields = {sid: 1, _id: 1, nickname: 1, sex: 1}; // 待返回的字段
    var options = {$exists: true};//存在
    userModel.find(conditions, fields, options, function (err, result) {
        if (err) {
            res.send(err);
            console.log(err);
            return;
        }
        else {
            res.send(result);
            console.log(result);
        }
    });
}
//用户信息修改
function info_replace(req, res, next) {
    var conditions = {
        "$or": [
            {uid: req.params.uid},
            {sid: req.params.sid}],
        "$or":[
            {job:req.params.job},
            {home:req.params.home}//可以继续加
        ]
    };
    var update     = {$set : {
        "$or":[
            {job:req.params.job},
            {home:req.params.home}]
    }};//更新数据
    var fields = {sid: 1, _id: 1, nickname: 1, sex: 1}; // 待返回的字段
    var options = {upset : true};
    userModel.update(conditions, update, options,  function (err, result) {
        if (err) {
            res.send(err);
            console.log(err);
            return;
        }
        else {
            res.send(result);
            console.log(result);
        }
    });
}

function follow1(req, res, next) {
    messageModel.create({
        uid: req.params.uid,
        sid: req.params.sid,
        oid: req.params.oid
    }, function (err, result) {
        if (err) {
            res.send(err);
            console.log(err);
            return;
        }
        else {
            res.send({s: 1, likeeach: 是否相互喜欢(0 / 1)});
            console.log(result);
        }
    });
}

function find(req, res, next) {
    var conditions = {
        uid: req.params.uid,
        sid: req.params.sid
    };
   var fields = {oid:1}; // 待返回的字段
    var options = {};//存在
    messageModel.find(conditions, fields, options, function (err, result,db_user) {
        if (err) {
            res.send(err);
            console.log(err);
            return;
        }
        else {
            res.send({'oid': db_user.oid});
            res.send(fields);
            /*return (fields);*/
        }
    });
}

function user_follow(req, res, next) {
    var a_id = req.params.a_id; //a的_id
    var b_id = req.params.b_id;//b的_id
    var a_sid = req.params.a_sid;//a的新浪微博账号
    userModel.findOne({
        _id: a_id,
        sid: a_sid
    }, function(err, a_user) {
        if (err || !a_user) {
            throw (err);
            return;
        } else {
            userModel.findOne({
                _id: b_id
            }, function(err, b_user) {
                if (err || !a_user) {
                    throw (err);
                    return;
                } else {
                    b_user.follows = b_user.follows || {};// ||或
                    b_user.likes = b_user.likes || {};
                    a_user.follows = a_user.follows || {};
                    a_user.likes = a_user.likes || {};
                    if (a_user.likes[b_id]) {
                        res.send({
                            's': '1',
                            'a_user.likes[b_id]result': '1',
                            'result':'ab已互粉'
                        });
                        return;
                    }
                    var a_id_info = {
                        _id: a_id,
                        ava: a_user.head,
                        nickname: a_user.nickname,
                        lastContent: ''
                    };//变量 下一步存数据库
                    var result = 0;//！
                    if (a_user.follows[b_id]) { //有 真
                        var b_id_info = a_user.follows[b_id];
                        a_user.likes[b_id] = b_id_info;
                        delete a_user.follows[b_id];
                        delete b_user.follows[a_id];
                        b_user.likes[a_id] = a_id_info;
                        result= 1;
                    } else {
                        b_user.follows[a_id] = a_id_info;
                        result = 0;
                    }
                    a_user.markModified('follows');
                    a_user.markModified('likes');
                    b_user.markModified('follows');
                    b_user.markModified('likes');
                    a_user.save(function(err) {
                        if (err) {
                            throw (err);
                            return;
                        } else {
                            b_user.save(function(err) {
                                if (err) {
                                    throw (err);
                                    return;
                                } else {
                                    res.send({
                                        's': '1',
                                        'result': result
                                    });
                                    return;
                                }
                            });
                        }
                    });
                }
            });
        }
    });
}

function  user_like(req,res,next){//获取req.params.uid，req.params.sid
    var conditions = {_id:req.params._id,sid:req.params.sid };
    var fields ={ 'likes':1};
    userModel.findOne(conditions, fields, function(err, db_user) {
        if (err || !db_user) {
            throw (err);
            return;
        } else {
            res.send({
                's': '1',
                'likes': db_user.likes
            });
        }
    });
}

function user_message(req, res, next) {
    var a_id= req.params.a_id; //输入_id
    var b_id= req.params.b_id;
    var content = req.params.content;
    if (!a_id&&a_id.length== null) {
        res.send({
            's': '0',
            'e': 'a_id is err'
        });
        return;
    }
    if (!b_id&&b_id.length== null) {
        res.send({
            's': '0',
            'e': 'b_id is err'
        });
        return;
    }
    var conditions={
        a_id: a_id,
        b_id: b_id,
        content: content,
        time: Date.parse(new Date())
    }
    //依次平行关系 不需要嵌套
    //1.加入messageModel
    messageModel.create(conditions,function(err,doc){
        if(err)
            res.send(err);
        else
            res.rend({'code':doc.code});

    });
    //2.a_id修改最新信息
    userModel.findeOne({_id:a_id},{'likes':1},function(err,users)
    {
        if(err)
            res.send(err);
        else
        {
            users.likes[b_id]['lastContent'] = content;
            users.markModified('likes');
            users.save();
        }

    });
    //3.b_id修改最新信息
    userModel.findeOne({_id:b_id},{'likes':1},function(err,users)
    {
        if(err)
            res.send(err);
        else
        {
            users.likes[a_id]['lastContent'] = content;
            users.markModified('likes');
            users.save();
        }

    });
}

function message_history(req, res, next) {
    var a_id= req.params.a_id;
    var b_id = req.params.b_id;
    var page =(req.params.p > 0) ? parseInt(req.params.p) : 1;//三元式
    if (!a_id&&a_id.length== null) {
        res.send({
            's': '0',
            'e': 'a_id is err'
        });
        return;
    }
    if (!b_id&&b_id.length== null) {
        res.send({
            's': '0',
            'e': 'b_id is err'
        });
        return;
    }
    messageModel.find({
        a_id: {
            $in: [a_id, b_id]
        },
        b_id: {
            $in: [a_id, b_id]
        }
    }, {
        '__v': 0
    }, {
        sort: {
            '_id': 1
        },
        skip: (page - 1) * 20,
        limit: 20
    }, function(err, messages) {
        if (err || !messages) {
            throw (err);
            return;
        } else {
            res.send({
                's': '1',
                'messages': messages
            });
        }
    });
    
}

server.get('/reg', user_register);
server.get('/info', user_info);
server.get('/follow1', follow1);
server.get('/find', find);
server.get('/follow', user_follow);
server.get('/like', user_like);
server.get('/message_txt', user_message);
server.get('/message_history', message_history);
server.get('/info_replace', info_replace);
server.listen(1212, '127.0.0.1', function () {
    console.log('%s listening at %s', server.name, server.url);
});
