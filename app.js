/**
 * Module dependencies.
 */

var express = require('express'),
  	stylus = require('stylus'),
  	nib = require('nib'),
  	sio = require('socket.io'),
	everyauth = require('everyauth'),
	db = require("mongojs").connect("dubmixes", ["playing"]);

/**
 * App.
 */

var app = express.createServer();

/**
 * App configuration.
 */


app.configure(function () {
	app.use(stylus.middleware({ src: __dirname + '/public', compile: compile }));
	app.use(express.static(__dirname + '/public'));
	app.set('views', __dirname);
	//app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.favicon());
	app.use(express.cookieParser()); 
	app.use(express.session({secret:'keyboard cat'}));
	app.use(require('./auth').configure(app));
	app.use(app.router);

	function compile (str, path) {
		return stylus(str)
			.set('filename', path)
			.use(nib());
	};
});

/**
 * App routes.
 */

app.get('/', function (req, res) {
	var playingNow;
	
	var user = req.session.user;

	db.playing.find(function(err, playing) {
		playingNow = playing;
		
		res.render('index', { 
			layout: false,
			'user': user || 'nobody',
			playing_now: playingNow[0].playing, 
			groups_cache: playingNow[0].groups
		});
	});
	
});

app.get('/callback', function (req, res) {
	console.log(req);
	res.render('index', { layout: false });
});

/*
 Stupid Facebook route
 $cache_expire = 60*60*24*365;
 header("Pragma: public");
 header("Cache-Control: max-age=".$cache_expire);
 header('Expires: ' . gmdate('D, d M Y H:i:s', time()+$cache_expire) . ' GMT');
*/
app.get('/channel.html', function (req, res) {
	var max_age = 60*60*24*365;
	var expires = new Date(Date.now() + 900000);
/*
	I THINK THIS WORKS ? 
*/
	//res.header("Pragma", "public");	
	//res.header("Cache-Control", "max-age="+max_age);	
	//res.header("Expires", expires);	
	
	res.send('<script src="//connect.facebook.net/en_US/all.js"></script>');
});

/**
 * App listen.
 */

app.listen(3000, function () {
  var addr = app.address();
  console.log('   app listening on http://' + addr.address + ':' + addr.port);
});


/**
 * Socket.IO server (single process only)
 */

var io = sio.listen(app)
  , nicknames = {};
  
/**

	start nginx web proxy hack 
	
*/

io.configure(function() {
  io.set("transports", ["xhr-polling"]);
  io.set("polling duration", 10);

  var path = require('path');
  var HTTPPolling = require(path.join(
    path.dirname(require.resolve('socket.io')),'lib', 'transports','http-polling')
  );
  var XHRPolling = require(path.join(
    path.dirname(require.resolve('socket.io')),'lib','transports','xhr-polling')
  );

  XHRPolling.prototype.doWrite = function(data) {
    HTTPPolling.prototype.doWrite.call(this);

    var headers = {
      'Content-Type': 'text/plain; charset=UTF-8',
      'Content-Length': (data && Buffer.byteLength(data)) || 0
    };

    if (this.req.headers.origin) {
      headers['Access-Control-Allow-Origin'] = '*';
      if (this.req.headers.cookie) {
        headers['Access-Control-Allow-Credentials'] = 'true';
      }
    }

    this.response.writeHead(200, headers);
    this.response.write(data);
    this.log.debug(this.name + ' writing', data);
  };
});


/** 

	end nginx web proxy hack 	

*/
  

io.sockets.on('connection', function (socket) {
	io.sockets.emit('nicknames', nicknames);

	//need daily chat persistence ? 
	socket.on('user message', function (msg) {
		socket.broadcast.emit('user message', socket.nickname, msg);
	});

	socket.on('nickname', function (nick, fn) {
		if (nicknames[nick]) {
			fn(true);
		} else {
			fn(false);
			//remove old nick from list.
	      	if(nicknames[socket.nickname]) {
	      		socket.broadcast.emit('announcement', nicknames[socket.nickname] + ' changed nick to ' + nick );
	      		delete nicknames[socket.nickname];
	      	} else {
	      		socket.broadcast.emit('announcement', nick + ' connected');	
	      	}
			nicknames[nick] = socket.nickname = nick;
	      
			io.sockets.emit('nicknames', nicknames);
		}
	});

  socket.on('play', function (playThis) {
	//record what's playing in mongo

	//clear for now
	db.playing.remove({});  	
	//save what's playing and cache the groups
	db.playing.save({'playing': playThis.playing, 'groups': playThis.groups}, function(err, saved) {
		if( err || !saved ) console.log("User not saved");
		else console.log("User saved");
	});	
  	io.sockets.emit('play', playThis);
  });
  
  socket.on('logout', function () {
    if (!socket.nickname) return;

    delete nicknames[socket.nickname];
    socket.broadcast.emit('announcement', socket.nickname + ' disconnected');
  	io.sockets.emit('nicknames', nicknames);
  }); 
  
  socket.on('disconnect', function () {
    if (!socket.nickname) return;

    delete nicknames[socket.nickname];
    socket.broadcast.emit('announcement', socket.nickname + ' disconnected');
    socket.broadcast.emit('nicknames', nicknames);
  });
});
