/**
 * Created by dell on 2016/7/7.
 */
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