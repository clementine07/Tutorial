/**
* Created by dell on 2016/7/9.
*/
var restify=require('restify'),
    routes=require('./routes'),
    user=require('./routes/user'),
    movie=require('./routes/movie'),
    http=require('http'),
    path=require('path'),
    ejs=require('ejs'),
    SessionStore=require('session-mongoose')(restify);
