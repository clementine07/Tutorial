var restify = require('restify');
var fs = fs = require('fs');
var mongoose = require('mongoose');
var http = require("http");
var https = require('https');
var rongcloud = require('./rongcloud');
var querystring = require('querystring');

var server = restify.createServer();
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());


mongoose.connect('mongodb://localhost/miao');

var userSchema = mongoose.Schema({
	sid: String,
	img: Array,
	job: String,
	token: String,
	home: String,
	haunt: String,
	nickname: String,
	description: String,
	sex: Number,
	score: String,
	type: Number,
	power: Number,
	age: Number,
	birthday: String,
	album: String,
	constellation: Number,
	update_time: String,
	head: String,
	human_head: Number,
	distance: String,
	area: String,
	pic_num: Number,
	video_num: Number,
	all_video_num: Number,
	slide_type: Number,
	communion_interests: Number,
	lucky_id: String,
	glory_grade: Number,
	thumb_num: Number,
	like_num: Number,
	star_num: Number,
	follows: {},//对象 存数据
	likeeachs: {}
});

var messageSchema = mongoose.Schema({
	fid: String,
	tid: String,
	content: String,
	time: Number
});

var userModel = mongoose.model('user', userSchema);
var messageModel = mongoose.model('message', messageSchema);

function info_replace(req, res, next) {
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
	var attributes = req.params.attributes;
	if (!attributes) {
		res.send({
			's': '0',
			'e': 'attributes is null'
		});
		return;
	} else if (attributes != 'job' && attributes != 'home' && attributes != 'nickname' && attributes != 'description' && attributes != 'sex' && attributes != 'age' && attributes != 'birthday' && attributes != 'area' && attributes != 'communion_interests') {
		res.send({
			's': '0',
			'e': 'This property does not support modification'
		});
		return;
	}
	var attributesValue =  attributesValue;
	if (!attributesValue) {
		res.send({
			's': '0',
			'e': 'attributesValue is null'
		});
		return;
	}

	userModel.findOne({
		_id: uid,
		sid: sid
	}, function(err, db_user) {
		if (err || db_user.length == 0) {
			res.send({
				's': '0',
				'e': 'user is null'
			});
			return;
		} else {
			db_user[attributes] = attributesValue;
			db_user.save(function(err) {
				if (err) {
					throw (err);
					return;
				} else {
					res.send({
						's': '1'
					});
					return;
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
}

function db_ava_upload(res, uid, sid, url) {
	userModel.findOne({
		_id: uid,
		sid: sid
	}, function(err, db_user) {

		if (err || db_user.length == 0) {
			res.send({
				's': '0',
				'e': 'user is null'
			});
			return;
		} else {
			userModel.update({
				_id: uid,
				sid: sid
			}, {
				$set: {
					head: url
				}
			}, function(err) {
				if (err) {
					throw (err);
					return;
				} else {
					rongcloud.refresh('miao' + db_user._id, db_user.nickname, db_user.head);
					res.send({
						's': '1',
						'url': url
					});
				}
			});
		}
	});
}

function user_log(req, res, next) {
	var nick = req.params.nick;
	var ava = req.params.ava;
	var sid = req.params.sid;
	if (!nick || nick.length == 0) {
		res.send({
			's': '0',
			'e': 'nick is null'
		});
		return;
	} else if (!ava || ava.length == 0) {
			ava = '/img/defined.png';
		} else if (!sid || sid.length == 0) {
			res.send({
				's': '0',
				'e': 'sid is null'
			});
			return;
	}

	userModel.findOne({
		'sid': sid
	}, function(err, db_user) {
		if (err || !db_user) {

			var userEntity = new userModel({
				sid: sid,
				head: ava,
				nickname: nick,
				token: ''
			});

			rongcloud.getToken('miao' + userEntity._id, nick, ava, function(err, result) {
				if (err) {
					throw (err);
					return;
				} else {
					if (result.code == '200') {
						userEntity.token = result.token;
						userEntity.save(function(err) {
							if (err) {
								throw (err);
								return;
							} else {
								res.send({
									's': '1',
									'us': userEntity
								});
								rongcloud.refresh('miao' + userEntity._id, userEntity.nickname, userEntity.head, function(err, result) {
									if (err) {
										console.log(err);
									} else {
										console.log(result);
									}
								});
								if (userEntity.head != '/img/defined.png') {
									ava_download(userEntity);
								}
							}
						});
					} else {
						res.send({
							's': '0',
							'e': 'rongcloud code == ' + result.code
						});
						return;
					}
				}
			});

		} else {
			res.send({
				's': '1',
				'us': db_user
			});
		}
	});
}

function ava_download(userEntity) {
	http.get(userEntity.head, function(res) {
		var imgData = "";
		res.setEncoding("binary"); //一定要设置response的编码为binary否则会下载下来的图片打不开
		res.on("data", function(chunk) {
			imgData += chunk;
		});
		res.on("end", function() {
			var path = '/Library/WebServer/Documents/img/' + userEntity._id + '.png';
			fs.writeFile(path, imgData, "binary", function(err) {
				if (!err) {
					userEntity.head = '/img/' + userEntity._id + '.png';
					userEntity.save();
					rongcloud.refresh('miao' + userEntity._id, userEntity.nickname, userEntity.head);
				}
			});
		});
	});
}

function user_info(req, res, next) {
	var uid = req.params.uid;
	if (!uid || uid.length == 0) {
		res.send({
			's': '0',
			'e': 'uid is null'
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

	userModel.findOne({
		_id: uid,
		sid: sid
	}, {
		'token': 0,
		'__v': 0,
		'likeeachs': 0,
		'follows': 0
	}, function(err, db_user) {
		if (err || !db_user) {
			throw (err);
			return;
		} else {
			res.send({
				's': '1',
				'us': db_user
			});
		}
	});
}

function user_follow(req, res, next) {
	var uid = req.params.uid;
	var oid = req.params.oid;
	var sid = req.params.sid;
	if (!sid) {
		res.send({
			's': '0',
			'e': 'sid is null'
		});
		return;
	}
	if (!uid || uid.length == 0) {
		res.send({
			's': '0',
			'e': 'uid is null'
		});
		return;
	}
	if (!oid || oid.length == 0) {
		res.send({
			's': '0',
			'e': 'oid is null'
		});
		return;
	}

	userModel.findOne({
		_id: uid,
		sid: sid
	}, function(err, u_user) {
		if (err || !u_user) {
			throw (err);
			return;
		} else {
			userModel.findOne({
				_id: oid,
			}, function(err, o_user) {
				if (err || !u_user) {
					throw (err);
					return;
				} else {
					o_user.follows = o_user.follows || {};// ||或
					o_user.likeeachs = o_user.likeeachs || {};
					u_user.follows = u_user.follows || {};
					u_user.likeeachs = u_user.likeeachs || {};
					if (u_user.likeeachs[oid]) {
						res.send({
							's': '1',
							'likeeach': '1'
						});
						return;
					}
					var uid_info = {
						uid: uid,
						ava: u_user.head,
						nick: u_user.nickname,
						lastContent: ''
					};//变量 下一步存数据库
					var likeeach = 0;//！
					if (u_user.follows[oid]) { //有 真
						var oid_info = u_user.follows[oid];
						u_user.likeeachs[oid] = oid_info;
						delete u_user.follows[oid];
						delete o_user.follows[uid];
						o_user.likeeachs[uid] = uid_info;
						likeeach = 1;
					} else {
						o_user.follows[uid] = uid_info;
						likeeach = 0;
					}
					u_user.markModified('follows');
					u_user.markModified('likeeachs');
					o_user.markModified('follows');
					o_user.markModified('likeeachs');
					u_user.save(function(err) {
						if (err) {
							throw (err);
							return;
						} else {
							o_user.save(function(err) {
								if (err) {
									throw (err);
									return;
								} else {
									res.send({
										's': '1',
										'likeeach': likeeach
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

function user_likeeach(req, res, next) {
	var uid = req.params.uid;
	if (!uid || uid.length == 0) {
		res.send({
			's': '0',
			'e': 'uid is null'
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

	userModel.findOne({
		_id: uid,
		sid: sid
	}, {
		'likeeachs': 1
	}, function(err, db_user) {
		if (err || !db_user) {
			throw (err);
			return;
		} else {
			res.send({
				's': '1',
				'likeeachs': db_user.likeeachs
			});
		}
	});
}

function user_message_txt(req, res, next) {
	var fromUserId = req.params.uid;
	var toUserId = req.params.oid;
	var content = req.params.content;
	var objectName = 'RC:TxtMsg';//荣云发消息
	if (!fromUserId) {
		res.send({
			's': '0',
			'e': 'uid is null'
		});
		return;
	}
	if (!toUserId) {
		res.send({
			's': '0',
			'e': 'oid is null'
		});
		return;
	}
	rongcloud.message('miao' + fromUserId, 'miao' + toUserId, objectName, '{"content":"' + content + '","extra":"' + fromUserId.toString() + '"}', '', '', '', '', function(err, resultText) {
		if (err) {
			throw (err);
			return;
		} else {

			var messageEntity = new messageModel({
				fid: 'miao' + fromUserId,
				tid: 'miao' + toUserId,
				content: content,
				time: Date.parse(new Date()),
			});
			messageEntity.save(function(err) {
				if (err) {
					throw (err);
					return;
				} else {
					res.send({
						's': '1',
						'code': resultText.code
					});
				}
			});

			userModel.findOne({
				_id: fromUserId
			}, {
				'likeeachs': 1
			}, function(err, users) {
				if (err) {
					throw (err);
					return;
				} else {
					users.likeeachs[toUserId]['lastContent'] = content;
					users.markModified('likeeachs');
					users.save();
				}
			});

			userModel.findOne({
				_id: toUserId
			}, {
				'likeeachs': 1
			}, function(err, users) {
				if (err) {
					throw (err);
					return;
				} else {
					users.likeeachs[fromUserId]['lastContent'] = content;
					users.markModified('likeeachs');
					users.save();
				}
			});

		}
	});
}

function message_history(req, res, next) {
	var fid = 'miao' + req.params.fid;
	var tid = 'miao' + req.params.tid;
	var page = (req.params.p > 0) ? parseInt(req.params.p) : 1;

	if (!fid) {
		res.send({
			's': '0',
			'e': 'fid is null'
		});
		return;
	}
	if (!tid) {
		res.send({
			's': '0',
			'e': 'tid is null'
		});
		return;
	}

	messageModel.find({
		fid: {
			$in: [fid, tid]
		},
		tid: {
			$in: [fid, tid]
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

function access_token(req, res, next) {
	var code = req.params.code;
	if (!code || code.length == 0) {
		res.send({
			's': '0',
			'e': 'code is null'
		});
		return;
	}

	var client_id = '2053370752';
	var client_secret = '683b865cc597c0359f53c4c417ac3ea8';
	var grant_type = 'authorization_code';
	var redirect_uri = 'https://api.weibo.com/oauth2/default.html';

	var apiData = {
		'client_id': client_id,
		'client_secret': client_secret,
		'redirect_uri': redirect_uri,
		'grant_type': 'authorization_code',
		'code': code
	};
	var postData = querystring.stringify(apiData);
	var options = {
		hostname: 'api.weibo.com',
		port: 443,
		path: '/oauth2/access_token',
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': postData.length
		}
	};
	var https_req = https.request(options, function(https_res) {
		var recvData = "";
		https_res.setEncoding('utf8');
		https_res.on('data', function(chunk) {
			recvData = recvData + chunk;
		});
		https_res.on('end', function() {
			var tokenObj = JSON.parse(recvData);
			console.log("tokenObj");
			console.log(tokenObj);
			res.send({
				's': '1',
				'access_token': tokenObj.access_token,
				'uid': tokenObj.uid
			});
		})
	});
	https_req.on('error', function(e) {
		res.send({
			's': '0',
			'e': e
		});
	});
	https_req.write(postData);
	https_req.end();

}

function feed_list(req, res, next) {
	var uid = req.params.uid;
	if (!uid || uid.length == 0) {
		res.send({
			's': '0',
			'e': 'uid is null'
		});
		return;
	}

	userModel.find({
		'_id': {
			$ne: uid
		}
	}, {
		'__v': 0
	}, {
		sort: {
			'_id': -1
		},
		limit: 20
	}, function(err, feedlist) {
		if (err || !feedlist) {
			throw (err);
			return;
		} else {
			res.send({
				's': '1',
				'feedlist': feedlist
			});
		}
	});
}

server.post('/ava_upload', ava_upload);
server.get('/log', user_log);
server.get('/info', user_info);
server.get('/follow', user_follow);
server.get('/likeeach', user_likeeach);
server.get('/message_txt', user_message_txt);
server.get('/message_history', message_history);
server.get('/access_token', access_token);
server.get('/feed_list', feed_list);
server.get('/info_replace', info_replace);


server.listen(8086, function() {
	console.log('%s listening at %s', server.name, server.url);
});