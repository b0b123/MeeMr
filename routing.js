var post = require('./post')
var user = require('./user')
var db = require('./database')
var fs = require('fs')
const Sequelize = require('sequelize')

//Uploading
var multer = require('multer');
var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'public/img')
	},
	filename: function (req, file, cb) {
		cb(null, (Math.random().toString(36)+'00000000000000000').slice(2, 10) + Date.now())
	}
});
var upload = multer({ storage: storage })

module.exports = function(app) {
	//Creating new posts
	app.post('/post/create', function(req, res) {		
		if(typeof(req.session.userId) == 'undefined') {
			returnJSON(res, { err: "Not logged in" })
			return
		}
		
		var uploadFile = upload.single('file')
		
		uploadFile(req, res, function(err) {
			if(err) {
				console.log(err)
				res.send("Error uploading file.")
			} else {
				post.create(req.body, function(post) {
					fs.rename(req.file.path, 'public/img/' + post.id, function(err) { })

					returnPost(res, post.id)
				})
			}
		})
	})
	
	//View existing post
	app.get('/post/:id', function (req, res) {
		var id = req.params.id
		
		returnPost(res, id)
	})
	
	//View random post
	app.get('/randompost', function (req, res) {		
		db.Post.findOne({
			order: [
				Sequelize.fn( 'RAND' ),
			]
		}).then(post => {		
			returnPost(res, post.id)
		})
	})
	
	function returnPost(res, id) {
		post.read(id, function(obj) {
			db.Vote.findAndCountAll({
				where: {
					postId: id,
					upvote: 1
				}
			}).then(upvoteResult => {
				var upvotes = upvoteResult.count
				
				db.Vote.findAndCountAll({
					where: {
						postId: id,
						upvote: 0
					}
				}).then(downvoteResult => {
					var downvotes = downvoteResult.count
				
					returnJSON(res, { id: id, title: obj.title, upvotes: upvotes, downvotes: downvotes })
				});
			});
		})
	}
	
	//Vote on post
	app.post('/vote', function(req, res) {
		if(typeof(req.session.userId) == 'undefined') {
			//returnJSON(res, { err: "Not logged in" })
			returnPost(res, req.body.postId)
			return
		}
		
		req.body.userId = req.session.userId;
		
		post.vote(req.body, function(data) {
			returnPost(res, req.body.postId)
		})
	})
	
	//Register user
	app.post('/user/create', function(req, res) {
		user.create(req.body, function(data) {
			if(typeof(data.err) == 'undefined') {
				user.createSession(req, req.body, data.user.id)
			}
			
			returnJSON(res, data)
		})
	})
	
	//Login user
	app.post('/user/login', function(req, res) {
		user.checkLogin(req.body, function(success, u) {
			if(success) {
				user.createSession(req, req.body, u.id)
			}
			
			returnJSON(res, { response: success })
		})
	})
	
	//Logout user
	app.post('/user/logout', function(req, res) {
		req.session.destroy()
		returnJSON(res, { })
	})
	
	//Get user session
	app.get('/user/session', function(req, res) {
		returnJSON(res, { name: req.session.name })
	})
	
	function returnJSON(res, json) {
		res.setHeader('Content-Type', 'application/json')
		res.send(json)
	}
}