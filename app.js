var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
// var socketio = require('socket.io');
var cors = require('cors');

var session = require('express-session');
var webSocket = require('./socket');
// var RedisStore = require('connect-redis')(session);
// var redis = require('redis');
// var redisClient = redis.createClient();

// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');
// var loginRouter = require('./routes/login');

var moment = require('moment');

var sequelize = require('./models').sequelize;

var app = express();

app.use(cors());

const server = app.listen(5001, () => {
  console.log(app.get('port'), '번 포트에서 대기 중');
});
sequelize.sync();

// my add
// app.use(require('connect-history-api-fallback')());
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');



app.use(function(req, res, next) {
        // res.header("Access-Control-Allow-Origin", "*");
        // res.header("Access-Control-Allow-Headers", "X-Requested-With");
        // res.header("Access-Control-Allow-Headers", "Content-Type");
        // res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
  console.log('start express 1');
  next();

});
console.log('process.env.NODE_ENV:', process.env.NODE_ENV);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());

app.use(session({
	secret: 'rsp', //keboard cat (랜덤한 값)
	resave: false,
	saveUninitialized: true
}));

app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', indexRouter);
// app.use('/users', usersRouter);
// app.use('/api/login', loginRouter);

webSocket(server, app);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  c
  res.render('error');
});

module.exports = app;
