/**
 * Created by dell on 2016/7/9.
 */
/*增加数据模型Movie.js*/
var mongodb=require('./mongodb');
var Schema=mongodb.mongoose.Schema;
var MovieSchema = new Schema({
    name:String,
    alias:[String],
    publish:Date,
    create_date:{type:Date, default:Date.now},
    images: {
        coverSmall: String,
        coverBig: String
    },
    source:[{
        source:String,
        link:String,
        swfLink:String,
        quality:String,
        version:String,
        lang:String,
        subtitle:String,
        create_date:{type:Date, default:Date.now}
    }]
});
var Movie=mongodb.mongoose.model('Movie',MovieSchema);
var MovieDAO=function(){};
module.exports=new MovieDAO();

