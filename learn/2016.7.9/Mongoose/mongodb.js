/**
 * Created by dell on 2016/7/9.
 */
/*数据库连接*/
var mongoose =require('mongoose');//载入mongoose模块
mongoose.connect('mongodb://localhost/text');//连接已创建的数据库text
exports.mongoose=mongoose;