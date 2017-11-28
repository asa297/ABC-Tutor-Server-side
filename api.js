var Express = require('express')
var mysql = require('mysql')
var multer  = require('multer')
var fs = require('fs');
var bodyParser = require("body-parser");
var app = new Express()
// var mongojs = require('mongojs');
// var db = mongojs('mongodb://172.104.167.197:27017/tutor', ['course_chat']);
//var db = mongojs('mongodb://benkung:1320@ds061345.mlab.com:61345/bendb', ['data_info','pic_info']);
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://172.104.167.197:27017/tutor';



app.use(bodyParser.json({limit:1024102420}));
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
	 var firstPath = 'uploads'
	 if (!fs.existsSync(firstPath)){
		fs.mkdir(firstPath);
	}
	 var path = firstPath + '/' + req.params.contentid;
	if (!fs.existsSync(path)){
		fs.mkdir(path);
	}
	console.log(path);
	cb(null, path)
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
});
var upload = multer({storage: storage});
var mysqlPool = mysql.createPool({
    host     : '172.104.167.197',
    user     : 'root',
    password : 'my-secret-pw',
    database : 'tutordb'
});

// get all branch
app.get('/',function(req,res) {
	mysqlPool.getConnection(function(err, connection) {
		if(err) throw err;
		var query = "SELECT * FROM `branch`"
	  connection.query(query, function(err, rows) {
		res.json(rows);
		connection.release();

    res.end();
	  });
	});
});
/*
app.get('/getcourse/:branchid/',function(req,res) {
	mysqlPool.getConnection(function(err, connection) {
	  if(err) throw err;
	  var branch_id = req.params.branchid
	  var query = "SELECT c.course_id, c.user_id, c.branch_id, c.subject, c.code, c.price, c.des as des, c.cover as cover, c.ts, c.lastUpdate, u.fname,u.lname,u.user_img,u.facebook,u.twitter,u.youtube from course c, user u WHERE u.user_id = c.user_id AND branch_id = "+branch_id+" ORDER BY c.ts DESC"
	  ;
	  connection.query(query, function(err, rows) {
		res.json(rows);
		connection.release();
	  });
	})
});
*/

app.get('/getcourse/:branchid/',function(req,res) {
	mysqlPool.getConnection(function(err, connection) {
	  if(err) throw err;
	  var branch_id = req.params.branchid
    var query = "SELECT c.course_id, c.user_id, c.branch_id, c.subject, c.code, c.price, c.des as des, c.cover as cover, c.ts, c.lastUpdate, u.fname, u.lname, u.user_img, u.email, u.facebook, u.twitter, u.youtube, cr.five , cr.four , cr.three , cr.two , cr.one , ROUND(cr.avg,1) AS avg , cr.length FROM course_rating cr RIGHT JOIN course c ON c.course_id = cr.course_id RIGHT JOIN user u ON u.user_id = c.user_id WHERE c.branch_id = "+branch_id+""
	  connection.query(query, function(err, rows) {
		res.json(rows);
		connection.release();
    res.end();

	  });
	})
});

//get all course in any branch
app.get('/courselength/:branchid',function(req,res) {
	mysqlPool.getConnection(function(err, connection) {
	  if(err) throw err;
		var branch_id = req.params.branchid
		var query = "SELECT COUNT(*) as count FROM `course` WHERE branch_id = "+branch_id+" "
	  connection.query(query , function(err, rows) {
		res.json(rows);
		connection.release();
    res.end();
	  });
	});
});

app.post('/insertcourse', function (req,res) {
	mysqlPool.getConnection(function(err, connection) {
	  if(err) throw err;
		var course_id = req.body.course_id
		var user_id = req.body.user_id
		var branch_id = req.body.branch_id
		var subject = req.body.subject
		var code = req.body.code
		var price = req.body.price
		var des = req.body.des
		var cover = req.body.cover
		var ts = req.body.ts
		var coupon = req.body.coupon
		var lastUpdate = req.body.lastUpdate
		var query = "INSERT INTO course VALUES("+course_id+","+user_id+","+branch_id+",'"+subject+"','"+code+"',"+price+",'"+des+"','"+cover+"','"+ts+"','"+coupon+"','"+lastUpdate+"')"
		;
		connection.query(query, function(err, rows) {
			//res.json(rows)
		res.status(200).send();
    res.end();

	  });
	});
});
app.post('/upload/:contentid',  upload.any(), function(req, res) {

    res.status(200).send();
	var contentid = req.params.contentid //รับ content id
  mysqlPool.getConnection(function(err, connection) {
    if(err) throw err;
	for (i = 0; i < req.files.length; i++ ){
		var originalname = req.files[i].originalname //รับชื่อไฟล์
		var path = contentid + '/' + originalname //สร้าง path ไอดีผู้ใช้/ชื่อไฟล์
		var query = "INSERT INTO `course_content_file`(`content_id`,`content_name`, `content_file`) VALUES ("+contentid+",'"+originalname+"','"+path+"')"
		//var query = "INSERT INTO course_content_file VALUES("+contentid+",'"+path+"')"

			connection.query(query)

	   }
       res.end();
  })
});

app.get('/course/:id/',function(req,res) {
	mysqlPool.getConnection(function(err, connection) {
	  if(err) throw err;
	  var id = req.params.id
	  var query = "SELECT c.course_id, c.user_id, c.branch_id, c.subject, c.code, c.price, c.des as des, c.cover as cover, c.ts, c.lastUpdate, u.fname, u.lname, u.user_img, u.email, u.facebook, u.twitter, u.youtube, cr.five , cr.four , cr.three , cr.two , cr.one , ROUND(cr.avg,1) AS avg , cr.length FROM course c LEFT JOIN course_rating cr ON c.course_id = cr.course_id LEFT JOIN user u ON u.user_id = c.user_id WHERE c.course_id = "+id+""
	  ;
	  connection.query(query, function(err, rows) {
		res.json(rows);
		connection.release();
      res.end();
	  });
	})
});

app.post('/updateuser', function(req,res){
	mysqlPool.getConnection(function(error,connection) {
		var user_id = req.body.user_id
		var fname = req.body.fname
		var lname = req.body.lname
		var user_img = req.body.user_img
		var email = req.body.email
		var facebook = req.body.facebook
		var youtube = req.body.youtube
		var twitter = req.body.twitter
		var query = "UPDATE user set fname = '"+fname+"',lname ='"+lname+"',user_img ='"+user_img+"',email='"+email+"',facebook='"+facebook+"',twitter='"+twitter+"', youtube='"+youtube+"' WHERE user_id = "+user_id+""

		connection.query(query, function(){
  res.end();
		})
	});
});

app.post('/insertcoursecontent', function(req,res){
	mysqlPool.getConnection(function(error,connection) {
/*
    //var content_id = req.body.content_id
		var course_id = req.body.course_id
		var content_title = req.body.content_title
		var content_des =  req.body.content_des
		var content_ts = req.body.content_ts
		//var query = "INSERT INTO course_content VALUES("+content_id+","+course_id+",'"+content_title+"','"+content_des+"','"+content_ts+"')"
    var query = "INSERT INTO `course_content`(course_id`, `content_title`, `content_des`, `content_ts`) VALUES("+course_id+",'"+content_title+"','"+content_des+"','"+content_ts+"')"
		//connection.query(query)

    connection.query(query, function (error, results, fields) {
      console.log("content_id = " + results.insertId)
      var data = {
        content_id: results.insertId
      }
      res.json(data);
      if (error) {
        return connection.rollback(function() {
          throw error;
        });
      }
    });
*/
    var course_id = req.body.course_id
		var content_title = req.body.content_title
		var content_des =  req.body.content_des
		var content_ts = req.body.content_ts
    var query = "INSERT INTO `course_content`(`course_id`, `content_title`, `content_des`, `content_ts`) VALUES("+course_id+",'"+content_title+"','"+content_des+"','"+content_ts+"')"

    connection.query(query, function (error, results, fields) {
    if (error) throw error;
      console.log("content_id = " + results.insertId);
    var data = {
      content_id: results.insertId
    }
    res.json(data);

  });
  console.log(query)
  res.end();
	});
});
app.get('/getfile/:contentid/:filename' , function(req,res){
	var content_id = req.params.contentid
	var filename = req.params.filename
	var pathFile = __dirname + "/uploads/"+content_id+"/"+filename+""
	res.sendFile(pathFile)
});

app.get('/popularcourse/:branch' , function(req,res){
	mysqlPool.getConnection(function(err, connection) {
	  if(err) throw err;
	  var branch = req.params.branch
	  var query = "SELECT c.course_id, c.user_id, c.branch_id, c.subject, c.code, c.price, c.des as des, c.cover as cover, c.ts, c.lastUpdate, u.fname, u.lname, u.user_img,u.email, u.facebook, u.twitter, u.youtube, cr.five , cr.four , cr.three , cr.two , cr.one , ROUND(cr.avg,1) AS avg , cr.length FROM (SELECT course_id, COUNT(course_id) as count FROM user_purchase WHERE branch_id = "+branch+" GROUP BY course_id ORDER BY count DESC limit 5) up LEFT JOIN course c ON c.course_id = up.course_id LEFT JOIN course_rating cr ON cr.course_id = up.course_id LEFT JOIN user u ON u.user_id = c.user_id"
	  connection.query(query, function(err, rows) {
		res.json(rows);
		connection.release();
      res.end();
	  });
	})
});

app.get('/popularcourse' , function(req,res){
	mysqlPool.getConnection(function(err, connection) {
	  if(err) throw err;
	  var query = "SELECT c.course_id, c.user_id, c.branch_id, c.subject, c.code, c.price, c.des as des, c.cover as cover, c.ts, c.lastUpdate, u.fname, u.lname, u.user_img, u.email, u.facebook, u.twitter, u.youtube, cr.five , cr.four , cr.three , cr.two , cr.one , ROUND(cr.avg,1) AS avg , cr.length FROM (SELECT course_id, count(course_id) as count from user_purchase GROUP BY course_id ORDER BY count desc limit 4) up LEFT JOIN course c ON c.course_id = up.course_id LEFT JOIN course_rating cr ON cr.course_id = up.course_id LEFT JOIN user u ON u.user_id = c.user_id"
    connection.query(query, function(err, rows) {
		res.json(rows);
		connection.release();
      res.end();
	  });
	})
})

app.post('/insertuserpurchase/' , function(req,res){
	mysqlPool.getConnection(function(err, connection) {
	  if(err) throw err;
	  var course_id = req.body.course_id;
	  var branch_id = req.body.branch_id;
	  var user_id = req.body.user_id
	  var purchase_ts = req.body.purchase_ts
		var query = "INSERT INTO `user_purchase`(`course_id`, `branch_id`, `user_id`, `purchase_ts`) VALUES ("+course_id+","+branch_id+","+user_id+",'"+purchase_ts+"')"
	  connection.query(query);
      res.end();

	})
})

app.get('/userpurchased/:course_id',function(req,res) {
	mysqlPool.getConnection(function(err, connection) {
	  if(err) throw err;
	  var course_id = req.params.course_id
	  var query = "SELECT u.user_id, u.user_img,up.course_id,u.fname,u.lname, DATE_FORMAT(up.purchase_ts, '%Y-%m-%d %H:%i:%s') AS purchase_ts FROM user u,user_purchase up  WHERE up.user_id = u.user_id AND course_id = "+course_id+" GROUP BY up.user_id ORDER BY purchase_ts desc"
	  connection.query(query, function(err, rows) {
		res.json(rows);
		connection.release();
      res.end();
	  });
	})
});

app.get('/user/:user_id',function(req,res) {
	mysqlPool.getConnection(function(err, connection) {
	  if(err) throw err;
	  var user_id = req.params.user_id
		var query = "SELECT * FROM `user` WHERE user_id = "+user_id+""
	  connection.query(query, function(err, rows) {
		res.json(rows);
		connection.release();
      res.end();
	  });
	})
});

app.post('/insertreview' , function(req,res){
	mysqlPool.getConnection(function(err, connection) {
	  if(err) throw err;
	  var course_id = req.body.course_id;
	  var user_id = req.body.user_id
	  var review_text = req.body.review_text;
	  var review_ts = req.body.review_ts
	  var review_vote = req.body.review_vote
		var query = "INSERT INTO `course_review`(`course_id`, `user_id`, `review_text`, `review_ts`, `review_vote`) VALUES ("+course_id+","+user_id+",'"+review_text+"','"+review_ts+"',"+review_vote+")"

	  connection.query(query);
      res.end();
	})
})


// Avergane Course Voting
app.get('/get_avg_voting_by_courseid/:courseid',function(req,res) {
	mysqlPool.getConnection(function(err, connection) {
	  if(err) throw err;
	  var course_id = req.params.courseid;
	  var query = "SELECT course_id ,count(case when review_vote = 5 then 5 end) as five , count(case when review_vote = 4 then 1 end) as four, count(case when review_vote = 3 then 1 end) as three, count(case when review_vote = 2 then 1 end) as two,count(case when review_vote = 1 then 1 end) as one, AVG(review_vote) as avg, count(*) as length from course_review WHERE course_id = "+course_id+""

	  connection.query(query, function(err, rows) {
		res.json(rows);
		connection.release();
      res.end();
	  });
	})
})

// course_review using course_id order by ts DESC
app.get('/get_review_course_order_ts/:courseid',function(req,res) {
	mysqlPool.getConnection(function(err, connection) {
	  if(err) throw err;
	  var course_id = req.params.courseid;
	  var query = "SELECT cr.review_id , cr.course_id, cr.user_id, ur.fname , ur.lname ,cr.review_text ,DATE_FORMAT(cr.review_ts, '%Y-%m-%d %H:%i:%s') AS review_ts , `review_vote` , ur.user_img FROM course_review cr , user ur WHERE cr.course_id = "+course_id+" AND cr.user_id = ur.user_id ORDER BY review_ts DESC"
	  connection.query(query, function(err, rows) {
		res.json(rows);
		connection.release();
      res.end();
	  });
	})
})

// course_review using user_id group by course_id
app.get('/get_review_course_user/:userid',function(req,res) {
	mysqlPool.getConnection(function(err, connection) {
	  if(err) throw err;
	  var user_id = req.params.userid;
	  var query = "SELECT course_id FROM `course_review` WHERE `user_id` = "+user_id+" GROUP BY course_id"

	  connection.query(query, function(err, rows) {
		res.json(rows);
		connection.release();
      res.end();
	  });
	})
})

// post chat
app.post('/insertchat' , function(req,res){
	mysqlPool.getConnection(function(err, connection) {
	  if(err) throw err;
	  var course_id = req.body.course_id;
	  var user_id = req.body.user_id
	  var chat_text = req.body.chat_text;
	  var chat_ts = req.body.chat_ts
		var query = "INSERT INTO `course_chat`(`course_id`, `user_id`, `chat_text`, `chat_ts`) VALUES ("+course_id+","+user_id+",'"+chat_text+"','"+chat_ts+"')"

	  connection.query(query);
  res.end();
	})
})

/*
// get course_chat order by course_id
app.get('/get_course_chat/:courseid',function(req,res) {
	mysqlPool.getConnection(function(err, connection) {
	  if(err) throw err;
	  var course_id = req.params.courseid;
	  var query = "SELECT cc.chat_id, cc.course_id, cc.user_id, cc.chat_text, DATE_FORMAT(cc.chat_ts, '%Y-%m-%d %H:%i:%s') AS chat_ts , u.fname , u.lname , u.user_img FROM course_chat cc LEFT JOIN user u ON cc.user_id = u.user_id WHERE cc.course_id = "+course_id+" ORDER BY chat_ts ASC"
	  connection.query(query, function(err, rows) {
		res.json(rows);
		connection.release();
      res.end();
	  });
	})
})
*/
// get course_content using course_id order by ts
app.get('/get_course_content/:courseid',function(req,res) {
	mysqlPool.getConnection(function(err, connection) {
	  if(err) throw err;
	  var course_id = req.params.courseid;
	  var query = "SELECT `content_id`, `course_id`, `content_title`, `content_des`, DATE_FORMAT(`content_ts`, '%Y-%m-%d %H:%i:%s') AS content_ts FROM `course_content` WHERE `course_id` = "+course_id+" ORDER BY content_ts ASC"

	  connection.query(query, function(err, rows) {
		res.json(rows);
		connection.release();
      res.end();
	  });
	})
})

// get course_content_file using content_id
app.get('/get_course_content_file/:contentid',function(req,res) {
	mysqlPool.getConnection(function(err, connection) {
	  if(err) throw err;
	  var content_id = req.params.contentid;
	  var query = "SELECT * FROM `course_content_file` WHERE `content_id` = "+content_id+""

	  connection.query(query, function(err, rows) {
		res.json(rows);
		connection.release();
      res.end();
	  });
	})
})

// get course_announce using course_id order by ts
app.get('/get_course_announce/:courseid',function(req,res) {
	mysqlPool.getConnection(function(err, connection) {
	  if(err) throw err;
	  var course_id = req.params.courseid;
	  var query = "SELECT ca.annou_id, ca.course_id, ca.annou_text, DATE_FORMAT(ca.annou_ts, '%Y-%m-%d %H:%i:%s') AS annou_ts , u.user_id , u.fname , u.lname , u.user_img FROM course_announce ca INNER JOIN course c ON ca.course_id = c.course_id INNER JOIN user u ON c.user_id = u.user_id WHERE ca.course_id = "+course_id+" ORDER BY annou_ts DESC"
	  connection.query(query, function(err, rows) {
		res.json(rows);
		connection.release();
      res.end();
	  });
	})
})

// get course_announce_comment using annou_id
app.get('/get_course_announce_comment/:annouid',function(req,res) {
	mysqlPool.getConnection(function(err, connection) {
	  if(err) throw err;
	  var annou_id = req.params.annouid;
	  var query = "SELECT cac.annou_com_id, cac.annou_id, cac.user_id, cac.annou_com_text, DATE_FORMAT(cac.annou_com_ts, '%Y-%m-%d %H:%i:%s') AS annou_com_ts , u.user_id , u.fname , u.lname , u.user_img FROM course_announce_comment cac INNER JOIN user u ON cac.user_id = u.user_id WHERE cac.annou_id =  "+annou_id+""
	  connection.query(query, function(err, rows) {
		res.json(rows);
		connection.release();
      res.end();
	  });
	})
})

// post course_announce
app.post('/insertcourse_announce' , function(req,res){
	mysqlPool.getConnection(function(err, connection) {
/*
    if(err) throw err;
    var annou_id = req.body.annou_id;
	  var course_id = req.body.course_id;
	  var annou_text = req.body.annou_text
	  var annou_ts = req.body.annou_ts;
		var query = "INSERT INTO `course_announce`(`annou_id`,`course_id`, `annou_text`, `annou_ts`) VALUES ("+annou_id+","+course_id+",'"+annou_text+"','"+annou_ts+"')"

	  connection.query(query);
*/


    if(err) throw err;
	  var course_id = req.body.course_id;
	  var annou_text = req.body.annou_text
	  var annou_ts = req.body.annou_ts;
    var query = "INSERT INTO `course_announce`(`course_id`, `annou_text`, `annou_ts`) VALUES ("+course_id+",'"+annou_text+"','"+annou_ts+"')"

    connection.query(query, function (error, results, fields) {
    if (error) throw error;
      console.log("annou_id= " + results.insertId);
    var data = {
      annou_id: results.insertId
    }
    res.json(data);

  });

  console.log(query)
    res.end();
	})
})

// post course_announce_comment
app.post('/insertcourse_announce_comment' , function(req,res){
	mysqlPool.getConnection(function(err, connection) {
	  if(err) throw err;
	  var annou_id = req.body.annou_id;
    var user_id = req.body.user_id
	  var annou_com_text = req.body.annou_com_text
	  var annou_com_ts = req.body.annou_com_ts;
		var query = "INSERT INTO `course_announce_comment`(`annou_id`, `user_id`, `annou_com_text`, `annou_com_ts`) VALUES ("+annou_id+","+user_id+",'"+annou_com_text+"','"+annou_com_ts+"')"

	  connection.query(query);
  res.end();
	})
})

// get course_q using course_id order by ts
app.get('/get_course_q/:courseid',function(req,res) {
	mysqlPool.getConnection(function(err, connection) {
	  if(err) throw err;
	  var course_id = req.params.courseid;
	  var query = "SELECT cq.q_id, cq.course_id, cq.user_id, cq.q_title, cq.q_des , DATE_FORMAT(cq.q_ts, '%Y-%m-%d %H:%i:%s') AS q_ts , u.fname , u.lname , u.user_img FROM `course_q` cq , user u WHERE cq.course_id = "+course_id+" AND u.user_id = cq.user_id ORDER BY q_ts DESC"
	  connection.query(query, function(err, rows) {
		res.json(rows);
		connection.release();
      res.end();
	  });
	})
})

// get course_q_comment using q_id
app.get('/get_course_q_comment/:qid',function(req,res) {
	mysqlPool.getConnection(function(err, connection) {
	  if(err) throw err;
	  var q_id = req.params.qid;
	  var query = "SELECT cqm.q_com_id, cqm.q_id, cqm.user_id, cqm.q_com_text, DATE_FORMAT(cqm.q_com_ts, '%Y-%m-%d %H:%i:%s') AS q_com_ts , u.fname , u.lname , u.user_img FROM course_q_comment cqm , user u WHERE cqm.q_id = "+q_id+" AND cqm.user_id = u.user_id"
    connection.query(query, function(err, rows) {
		res.json(rows);
		connection.release();
      res.end();
	  });
	})
})

// post course_q
app.post('/insertcourse_q' , function(req,res){
	mysqlPool.getConnection(function(err, connection) {
	 /* if(err) throw err;
    //var q_id = req.body.q_id;
	  var course_id = req.body.course_id;
    var user_id = req.body.user_id
	  var q_title = req.body.q_title
    var q_des = req.body.q_des
	  var q_ts = req.body.q_ts;
		var query = "INSERT INTO `course_q`(`course_id`, `user_id`, `q_title`, `q_des`, `q_ts`) VALUES ("+course_id+","+user_id+",'"+q_title+"','"+q_des+"','"+q_ts+"')"

	  connection.query(query);
*/

    if(err) throw err;
	  var course_id = req.body.course_id;
    var user_id = req.body.user_id
	  var q_title = req.body.q_title
    var q_des = req.body.q_des
	  var q_ts = req.body.q_ts;
    var query = "INSERT INTO `course_q`(`course_id`, `user_id`, `q_title`, `q_des`, `q_ts`) VALUES ("+course_id+","+user_id+",'"+q_title+"','"+q_des+"','"+q_ts+"')"

    connection.query(query, function (error, results, fields) {
    if (error) throw error;
      console.log("q_id= " + results.insertId);
    var data = {
      q_id: results.insertId
    }
    res.json(data);

  });

  console.log(query)
    res.end();
	})
})

// post course_q_comment
app.post('/insertcourse_q_comment' , function(req,res){
	mysqlPool.getConnection(function(err, connection) {
	  if(err) throw err;
	  var q_id = req.body.q_id;
    var user_id = req.body.user_id
	  var q_com_text = req.body.q_com_text
	  var q_com_ts = req.body.q_com_ts;
		var query = "INSERT INTO `course_q_comment`(`q_id`, `user_id`, `q_com_text`, `q_com_ts`) VALUES ("+q_id+","+user_id+",'"+q_com_text+"','"+q_com_ts+"')"

	  connection.query(query);
      res.end();

	})
})

//get notification
app.get('/get_notification/:userid/:notitype',function(req,res) {
	mysqlPool.getConnection(function(err, connection) {
	  if(err) throw err;
	  var user_id = req.params.userid
    var noti_type = req.params.notitype
	  var query =  "SELECT n.noti_id , n.course_id ,n.user_id , c.subject , c.code , n.noti_des , n.noti_cover , u.fname AS fname_sender , u.lname AS lname_sender, DATE_FORMAT(n.noti_ts, '%Y-%m-%d %H:%i:%s') AS noti_ts FROM notification n LEFT JOIN course c ON n.course_id = c.course_id LEFT JOIN user u ON c.user_id = u.user_id WHERE n.noti_type = "+noti_type+" AND n.user_id = "+user_id+" ORDER BY n.noti_ts DESC LIMIT 0,10"
    connection.query(query, function(err, rows) {
		res.json(rows);
		connection.release();
      res.end();
	  });
	})
})


// post notification
app.post('/insertnotification' , function(req,res){
	mysqlPool.getConnection(function(err, connection) {
	  if(err) throw err;
	  var course_id = req.body.course_id;
    var user_id = req.body.user_id
	  var noti_cover = req.body.noti_cover
	  var noti_des = req.body.noti_des
    var noti_type = req.body.noti_type
    var noti_ts = req.body.noti_ts
		var query = "INSERT INTO `notification`( `course_id`, `user_id`, `noti_cover`, `noti_des`, `noti_type`, `noti_ts`) VALUES ("+course_id+","+user_id+",'"+noti_cover+"','"+noti_des+"',"+noti_type+",'"+noti_ts+"')"
	  connection.query(query);
  res.end();
	})
})

// insert user into room chat
app.post('/insertusertoroom' , function(req,res){
	mysqlPool.getConnection(function(err, connection) {
	  if(err) throw err;
	  var course_id = req.body.course_id;
    var user_id = req.body.user_id
		var query = "INSERT INTO `room_chat`(`course_id`, `user_id`) VALUES ("+course_id+","+user_id+")"
    connection.query(query);
      res.end();
	})
})

// delete user from chat room
app.post('/deleteuserfromroom' , function(req,res){
	mysqlPool.getConnection(function(err, connection) {
	  if(err) throw err;
    var course_id = req.body.course_id;
    var user_id = req.body.user_id
		var query = "DELETE FROM `room_chat` WHERE user_id = "+user_id+" AND course_id = "+course_id+""
    connection.query(query);
    connection.release();
      res.end();
	})
})

// get all user who is in chat room of any course
app.get('/get_userinroom/:courseid',function(req,res) {
	mysqlPool.getConnection(function(err, connection) {
	  if(err) throw err;
    var course_id = req.params.courseid
	  var query =  "SELECT rc.session_id , rc.course_id , rc.user_id , u.fname , u.lname , u.user_img FROM room_chat rc LEFT JOIN user u ON rc.user_id = u.user_id WHERE rc.course_id = "+course_id+""
    connection.query(query, function(err, rows) {
		res.json(rows);
		connection.release();
      res.end();
	  });
	})
})

// get all course which is user purchased
app.get('/get_all_userpurchased/:userid',function(req,res) {
	mysqlPool.getConnection(function(err, connection) {
	  if(err) throw err;
    var user_id = req.params.userid
	  var query =  "SELECT c.course_id, c.user_id, c.branch_id, c.subject, c.code, c.price, c.des as des, c.cover as cover, c.ts, c.lastUpdate, u.fname, u.lname, u.user_img, u.email, u.facebook, u.twitter, u.youtube, cr.five , cr.four , cr.three , cr.two , cr.one , ROUND(cr.avg,1) AS avg , cr.length FROM user_purchase up JOIN course c ON c.course_id = up.course_id JOIN user u ON u.user_id = c.user_id JOIN course_rating cr ON c.course_id = cr.course_id WHERE up.user_id = "+user_id+" GROUP BY up.course_id ORDER BY c.lastUpdate DESC"
    connection.query(query, function(err, rows) {
		res.json(rows);
		connection.release();
      res.end();
	  });
	})
})

// get all course which is owner
app.get('/get_all_userowner/:userid',function(req,res) {
	mysqlPool.getConnection(function(err, connection) {
	  if(err) throw err;
    var user_id = req.params.userid
	  var query =  "SELECT c.course_id, c.user_id, c.branch_id, c.subject, c.code, c.price, c.des as des, c.cover as cover, c.ts, c.lastUpdate, u.fname, u.lname, u.user_img, u.email, u.facebook, u.twitter, u.youtube, cr.five , cr.four , cr.three , cr.two , cr.one , ROUND(cr.avg,1) AS avg , cr.length FROM course c JOIN user u ON u.user_id = c.user_id JOIN course_rating cr ON c.course_id = cr.course_id WHERE u.user_id = "+user_id+" GROUP BY c.course_id ORDER BY c.lastUpdate DESC"
    connection.query(query, function(err, rows) {
		res.json(rows);
		connection.release();

      res.end();
	  });
	})
})

// get all course which is user_favorite
app.get('/get_all_userfavorite/:userid',function(req,res) {
	mysqlPool.getConnection(function(err, connection) {
	  if(err) throw err;
    var user_id = req.params.userid
	  var query =  "SELECT c.course_id, c.user_id, c.branch_id, c.subject, c.code, c.price, c.des as des, c.cover as cover, c.ts, c.lastUpdate, u.fname, u.lname, u.user_img, u.email, u.facebook, u.twitter, u.youtube, cr.five , cr.four , cr.three , cr.two , cr.one , ROUND(cr.avg,1) AS avg , cr.length FROM user_favorite uf JOIN course c ON uf.course_id = c.course_id JOIN user u ON u.user_id = c.user_id JOIN course_rating cr ON c.course_id = cr.course_id WHERE uf.user_id = "+user_id+" GROUP BY c.course_id"
    connection.query(query, function(err, rows) {
		res.json(rows);
		connection.release();
      res.end();
	  });
	})
})

// insert user_favorite
app.post('/insertusertoroom' , function(req,res){
	mysqlPool.getConnection(function(err, connection) {
	  if(err) throw err;
	  var course_id = req.body.course_id;
    var user_id = req.body.user_id
		var query = "INSERT INTO `user_favorite`(`course_id`, `user_id`) VALUES ("+course_id+","+user_Id+")"
    connection.query(query);
      res.end();
	})
})

///////////////// REGISTER ////////////////////////////////

//post to user table and user_login for new user
app.post('/insertnewuser' , function(req,res){
	mysqlPool.getConnection(function(err, connection) {
	  if(err) throw err;
    var user_id = req.body.user_id
		var fname = req.body.fname
		var lname = req.body.lname
		var user_img = req.body.user_img
    var sex = req.body.sex
    var birthday = req.body.birthday
		var email = req.body.email
		var facebook = req.body.facebook
		var twitter = req.body.twitter
    var youtube = req.body.youtube
    var user_name = req.body.user_name
    var user_pass = req.body.user_pass
    var user_ts = req.body.user_ts

    var query1 = "INSERT INTO user(`fname`, `lname`, `user_img`, `sex`, `birthday`, `email`, `facebook`, `twitter`, `youtube`) VALUES ('"+fname+"','"+lname+"','"+user_img+"','"+sex+"','"+birthday+"','"+email+"','"+facebook+"','"+twitter+"','"+youtube+"');"
    connection.beginTransaction(function(err) {
	  if (err) { throw err; }
	  connection.query(query1, function (error, results, fields) {
      console.log("test id1" + results.insertId)
      var data = {
        user_id : results.insertId
      }
      res.json(data);
	    if (error) {
	      return connection.rollback(function() {
	        throw error;
	      });
	    }

	    var query2 = "INSERT INTO user_login(`user_id`, `user_name`, `user_pass`, `user_ts`) VALUES ((SELECT user_id FROM user WHERE email = '"+email+"'),'"+user_name+"',AES_ENCRYPT(SHA2('"+user_pass+"',512), '"+user_ts+"' ),'"+user_ts+"');"
	    connection.query(query2, function (error, results, fields) {
	      if (error) {
	        return connection.rollback(function() {
	          throw error;
	        });
	      }
	      connection.commit(function(err) {
	        if (err) {
	          return connection.rollback(function() {
	            throw err;
	          });
	        }

	        console.log('success!');
            res.end();
	      });
	    });
	  });


	});

	})


})

///////////////// END REGISTER ////////////////////////////////

///////////////// LOGIN ////////////////////////////////

// get respone to check password
app.get('/get_check_password/:username/:password',function(req,res) {
	mysqlPool.getConnection(function(err, connection) {
	  if(err) throw err;
    var user_name = req.params.username
    var user_pass = req.params.password
	  var query =  "SELECT COUNT(*) AS check_pass ,user_id FROM user_login WHERE user_name = '"+user_name+"' AND user_pass = CONVERT(AES_ENCRYPT(SHA2('"+user_pass+"',512), user_ts) ,BINARY(200))" //if password is correct , it'll return 1
    connection.query(query, function(err, rows) {
		res.json(rows);
		connection.release();
      res.end();
	  });
	})
})

// get respone to check username
app.get('/get_check_username/:username/',function(req,res) {
	mysqlPool.getConnection(function(err, connection) {
	  if(err) throw err;
    var user_name = req.params.username
	  var query =  "SELECT COUNT(*) as check_username from user_login WHERE user_name = '"+user_name+"'" //if username is correct , it'll return 1
    connection.query(query, function(err, rows) {
		res.json(rows);
		connection.release();
      res.end();
	  });
	})
})

// get respone to check email
app.get('/get_check_email/:email/',function(req,res) {
	mysqlPool.getConnection(function(err, connection) {
	  if(err) throw err;
    var email = req.params.email
	  var query =  "SELECT COUNT(*) as check_email from user WHERE email = '"+email+"'" //if email is correct , it'll return 1
    connection.query(query, function(err, rows) {
		res.json(rows);
		connection.release();
      res.end();
	  });
	})
})
///////////////// END LOGIN ////////////////////////////////


app.get('/get_notification_type1/',function(req,res) {
	mysqlPool.getConnection(function(err, connection) {
	  if(err) throw err;
	var query = "SELECT n.course_id,c.subject,c.code,n.user_id,u.fname,u.lname,u.user_img, n.noti_cover, n.noti_des, n.noti_type, DATE_FORMAT(n.noti_ts, '%Y-%m-%d %H:%i:%s') AS noti_ts FROM `notification` n INNER JOIN user u ON u.user_id = n.user_id INNER JOIN course c ON c.course_id = n.course_id WHERE noti_type = 1 ORDER BY noti_ts DESC limit 10"
	  connection.query(query, function(err, rows) {
		res.json(rows);
		connection.release();
      res.end();
	  });
	})
})

app.get('/get_notification_type2/:course_id',function(req,res) {
	mysqlPool.getConnection(function(err, connection) {
	  if(err) throw err;
	  var course_id = req.params.course_id
	  var query = "SELECT n.course_id,n.user_id,u.fname,u.lname,u.user_img, n.noti_cover, n.noti_des, n.noti_type, DATE_FORMAT(n.noti_ts, '%Y-%m-%d %H:%i:%s') AS noti_ts FROM `notification` n INNER JOIN user u ON u.user_id = n.user_id WHERE course_id IN ("+course_id+") AND noti_type = 2 ORDER BY noti_ts DESC limit 10"
	  connection.query(query, function(err, rows) {
		res.json(rows);
		connection.release();
      res.end();
	  });
	})
})
app.get('/get_all_my_user/:userid',function(req,res) {
	mysqlPool.getConnection(function(err, connection) {
	  if(err) throw err;
	  var user_id = req.params.userid
		var query = "SELECT COUNT(*) AS student_count FROM (SELECT c.course_id , c.user_id FROM course c INNER JOIN user u ON c.user_id = u.user_id WHERE c.user_id = "+user_id+") own INNER JOIN user_purchase up ON up.course_id = own.course_id"
		connection.query(query, function(err, rows) {
			res.json(rows);
			connection.release();
        res.end();
		});
	})
})
app.get('/get_all_my_review/:userid',function(req,res) {
	mysqlPool.getConnection(function(err, connection) {
	  if(err) throw err;
	  var user_id = req.params.userid
		var query = "SELECT COUNT(*) AS review_count FROM (SELECT c.course_id , c.user_id FROM course c INNER JOIN user u ON c.user_id = u.user_id WHERE c.user_id = "+user_id+") own INNER JOIN course_review cr ON cr.course_id = own.course_id"
		connection.query(query, function(err, rows) {
			res.json(rows);
			connection.release();
        res.end();
		});
	})
})

app.post('/updatecourse', function(req,res){
	mysqlPool.getConnection(function(error,connection) {
    var course_id = req.body.course_id
    var subject = req.body.subject
    var code = req.body.code
    var price = req.body.price
    var des = req.body.des
    var cover = req.body.cover
    var coupon = req.body.coupon


		var query = "UPDATE `course` SET `subject`= '"+subject +"',`code`= '"+code +"',`price`= '"+price +"' ,`des`= '"+des+"',`cover`= '"+cover+"',`coupon`= '"+coupon+"' WHERE course_id = "+course_id+""
		console.log(query);
		connection.query(query)
      res.end();
	});
});


app.get('/getchat/:course_id',  (req,res) => {
  var start = new Date().getTime();
  dataFromMongo(req.params.course_id)
  .then((results) => {
      return dataFromMySQL(results)
  })
  .then((json) => {

    console.log(new Date().getTime() - start);
    res.send(json)
  })
  .catch((error) => {
    res.send(error)
  })


// try {
//   const mongoData = await dataFromMongo(req.params.course_id)
//   const jsonData = await dataFromMySQL(mongoData)
//   res.send(jsonData)
// } catch (e) {
//   res.send(e)
// }


})
app.post('/insert_chat_mongo',function(req,res) {
	var course_id = req.body.course_id
	var user_id = req.body.user_id
	var chat_text = req.body.chat_text
	var chat_ts = req.body.chat_ts

	MongoClient.connect(url, function(err, db) {
		if (err) throw err;
		var myobj = {
			course_id: course_id,
			user_id: user_id,
			chat_text: chat_text,
			chat_ts: chat_ts
		};
		db.collection("course_chat").insertOne(myobj, function(err, res) {
		  if (err) throw err;
		  console.log("1 document inserted");
		  db.close();
		  res.end();
		});
	  });

})


const dataFromMongo = (course_id) => {

  return new Promise((resolve, reject) => {
      MongoClient.connect(url,(req,db) => {
      db.collection('course_chat').find({course_id : Number.parseInt(course_id)}).sort({"chat_ts": -1}).limit(10).toArray((err, result) => {
        if (err) throw err;
        if(result.length != 0){
          db.close()
          resolve(result)
        }else{
          reject([])
        }

      })
    })
})
}

const dataFromMySQL = (data) => {
  return new Promise((resolve, reject) => {
    let json = []
    mysqlPool.getConnection((err, connection) => {
      data.map((mongo, i) => {
        var query = "SELECT u.fname , u.lname , u.user_img FROM user u WHERE u.user_id =  "+mongo.user_id+" ";
          connection.query(query, (error, rows, field) => {
            let mysqlData = JSON.parse(JSON.stringify(rows))[0]
            let mongoData = mongo
            let merge
            if(mysqlData !== undefined){
              merge =  Object.assign(mysqlData, mongoData)
              json.push(merge)
            }
            if(i == data.length - 1){
              connection.release()
              resolve(json)
            }

        })
      })
    })
  })
}


module.exports = app;
