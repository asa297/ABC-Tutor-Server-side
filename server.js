var express = require('express');
var http = require('https');
var fs = require('fs')
var path = require('path')
var app = new express();
const httpsOptions = {
  cert: fs.readFileSync(path.join(__dirname, 'ssl', 'server.crt')),
  key: fs.readFileSync(path.join(__dirname, 'ssl', 'server.key')),
  passphrase: 'ben12123'
}
var server = http.createServer(httpsOptions,app);
var io = require('socket.io').listen(server);
var cors = require('cors')
var bodyParser = require("body-parser");
var mysql = require('mysql');


var omise = require('omise')({
  'secretKey': 'skey_test_5a1j2ntf48hwtsp877s',
  'omiseVersion': '2015-09-10'
});

var mysqlPool = mysql.createPool({
    host     : '172.104.167.197',
    user     : 'root',
    password : 'my-secret-pw',
    database : 'tutordb'
});
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cors({credentials: true}));


app.get('/',function(req,res) {
	res.send('for socker.ioo');
});
app.post('/checkout/:course_id/:branch_id/:user_id/:ts/:amount', function(req, res ,next) {
  var token = req.body.omiseToken
  var course_id = req.params.course_id
  var branch_id = req.params.branch_id
  var user_id = req.params.user_id
  var purchase_ts = req.params.ts
  var myAmount = req.params.amount

  //console.log(course_id + " " + branch_id +" " +user_id+" "+ purchase_ts );
  //console.log(req.body)
	console.log(myAmount)
    omise.charges.create({
    'amount': myAmount + '00' ,
    'currency': 'thb',
    'card': token
  }, function(err, resp) {
    if (resp.paid) {
      //Success
      //res.send('success')

	let data = {
		  user_id: user_id,
		  course_id: course_id,
		  branch_id: branch_id,
		  purchase_ts:purchase_ts

	  }
		io.to(user_id).emit('purchase', data)
	mysqlPool.getConnection(function(err, connection) {
	  if(err) throw err;

	  var query = "INSERT INTO `user_purchase`(`course_id`, `branch_id`, `user_id`, `purchase_ts`) VALUES ("+course_id+","+branch_id+","+user_id+",'"+purchase_ts+"')"
	  connection.query(query);

	})


    } else {
      //Handle failure
      res.send('fail' + err)
      throw resp.failure_code;
    }


  });
})


io.on('connection', function (socket) {
    console.log('user connected: ' + socket.id);

    socket.on('subscribe', function (course_id) {
      socket.join(course_id)
      console.log('subscribe: ' + course_id)
    })
    socket.on('unsubscribe', function (course_id) {
      socket.leave(course_id)
      console.log('unsubscribe: ' + course_id)
    })
    socket.on('join', function (user_id) {
    	console.log('user join: ' + user_id)
		socket.join(user_id)
	})
	socket.on('leave', function (user_id) {
		console.log('user leave: ' + user_id)
		socket.leave(user_id)
	})

    socket.on('private_message' ,function (data) {
      io.to(data.course_id).emit('private_message', data)
    })
    socket.on('live_message' ,function (data) {
      console.log('live_message')
      io.to(data.course_id).emit('live_message', data)
    })

    socket.on('live_tutor', function (data) {
      io.emit('live_tutor', data)
    })
    socket.on('stoplive' ,function (data) {
      io.to(data.course_id).emit('stoplive', data)
    })
    socket.on('requestCamera' ,function (data) {
      io.to(data.course_id).emit('requestCamera', data)
    })
    socket.on('refuseCamera' ,function (data) {
      io.to(data.course_id).emit('refuseCamera', data)
    })
    socket.on('allowCamera', function(data) {
      io.to(data.course_id).emit('allowCamera', data)
    })
    socket.on('live_cam_1', function(data) {
      io.to(data.course_id).emit('live_cam_1', data)
    })
    socket.on('live_cam_2', function(data) {
      io.to(data.course_id).emit('live_cam_2', data)
    })
    socket.on('live_cam_3', function(data) {
      io.to(data.course_id).emit('live_cam_3', data)
    })
    socket.on('live_cam_4', function(data) {
      io.to(data.course_id).emit('live_cam_4', data)
    })
    socket.on('stopCamera' ,function (data) {
      console.log('stopCamera')
      io.to(data.course_id).emit('stopCamera', data)
    })
    socket.on('forceStopCamera',function (data) {
      console.log('forceStopCamera')
      io.to(data.course_id).emit('forceStopCamera', data)
    })
    socket.on('announcement', function (data) {
      io.to(data.course_id).emit('announcement', data)
    })
		socket.on('announcement_comment', function (data) {
			io.to(data.course_id).emit('announcement_comment', data)
		})
    socket.on('qa', function (data) {
      io.to(data.course_id).emit('qa', data)
    })
		socket.on('qa_comment', function (data) {
			io.to(data.course_id).emit('qa_comment', data)
		})
    socket.on('courseContent', function (data) {
      io.to(data.course_id).emit('courseContent', data)
    })
    socket.on('chat', function (data) {
      io.to(data.course_id).emit('chat', data)
    })
    socket.on('course', function (data) {
      io.to(data.course_id).emit('course', data)
    })
	  socket.on('PUSH_COURSE', function (data) {
		console.log('PUSH_COURSE: ' + data.course_id);
      //io.to(data.course_id).emit('PUSH_COURSE', data)
	  io.emit('PUSH_COURSE', data)
    })
	  socket.on('voting', function (data) {
      io.emit('voting', data)
    })
    socket.on('course_review', function (data) {
      io.emit('course_review', data)
    })
    socket.on('course_user_purchased', function (data) {
      io.emit('course_user_purchased', data)
    })
		socket.on('online', function (data) {
			socket.join(data.course_id)
			io.to(data.course_id).emit('online', data)
		})
		socket.on('offline', function (data) {
			socket.leave(data.course_id)
			io.to(data.course_id).emit('offline', data)
		})
		socket.on('noti_course', function (data) {
			io.emit('noti_course', data)
		})
		socket.on('noti_content', function (data) {
			io.to(data.course_id).emit('noti_content', data)
		})
		socket.on('noti_annountment', function (data) {
			console.log("noti_annountment:" + data)
			io.to(data.course_id).emit('noti_annountment', data)
		})
		socket.on('update_course', function (data) {
			io.emit('update_course', data)
		})
    socket.on('course_live', function (data) {
      io.to(data.course_id).emit('course_live', data)
    })

})
var api = require('./api.js');
app.use('/api', api);
var port = process.env.PORT || 4000;
server.listen(port ,function(){
console.log('server running on port: ' + port);
});
