var rongcloudSDK = require('rongcloud-sdk');
rongcloudSDK.init('e5t4ouvptdd1a', '8jQchULtGz16');

//获取token
function rongcloud_user_getToken(uid, nick, uri, callback) {
	rongcloudSDK.user.getToken(uid, nick, uri, function(err, resultText) {
		if (err) {
			if (callback) callback(err);
		} else {
			var result = JSON.parse(resultText);
			if (callback) callback(null, result);
		}
	});
}

//刷新用户信息
function rongcloud_user_refresh(uid, nick, uri, callback) {
	rongcloudSDK.user.refresh(uid, nick, uri, function(err, resultText) {
		if (err) {
			if (callback) callback(err);
		} else {
			var result = JSON.parse(resultText);
			if (callback) callback(null, result);
		}
	});
}

//检查用户在线状态
function rongcloud_user_checkOnline(uid, callback) {
	rongcloudSDK.user.checkOnline(uid, function(err, resultText) {
		if (err) {
			if (callback) callback(err);
		} else {
			var result = JSON.parse(resultText);
			if (callback) callback(null, result);
		}
	});
}


//发送单聊信息
function rongcloud_message_private_publish(fuid, tuid, objectName, content, pushContent, pushData, count, varifyBlacklist, callback) {
	rongcloudSDK.message.private.publish(fuid, tuid, objectName, content, pushContent, pushData, count, varifyBlacklist, function(err, resultText) {
		if (err) {
			if (callback) callback(err);
		} else {
			var result = JSON.parse(resultText);
			if (callback) callback(null, result);
		}
	});
}

exports.getToken = rongcloud_user_getToken;
exports.refresh = rongcloud_user_refresh;
exports.checkOnline = rongcloud_user_checkOnline;
exports.message = rongcloud_message_private_publish;

// rongcloud_user_getToken('0001','levy','',function(err, result) {
// 	console.log(err);
// 	console.log(result.token);
// });

// rongcloud_unblock('0001', function(err, result) {
// 	console.log(err);
// 	console.log(result);
// });

// rongcloud_block_query(function(err, result) {
// 	console.log(err);
// 	console.log(result);
// });