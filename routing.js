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
				returnJSON(res, { err: "Error uploading file" })
				
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
			order: [ Sequelize.fn( 'RAND' ) ]
			
		}).then(post => {
			if(post == null) {
				returnJSON(res, { err: "No posts found" })
				return
			}
			
			returnPost(res, post.id)
		})
	})
	
	//Get next post
	app.get('/nextpost', function (req, res) {
		var token = req.query.token
		var sort = req.query.sort
		var search = req.query.search
				
		var session = user.getSession(token)
		
		//If search and sort requirements are still the same, continue in feed, else start at the start of the feed
		if(typeof(session.lastSort) == 'undefined' || session.lastSort != sort || typeof(session.lastSearch) == 'undefined' || session.lastSearch != search) {
			session.currentIndex = 0
		} else {
			session.currentIndex += 1
		}
		
		var order;
		if(sort.toLowerCase() == "recent") {
			order = [['createdAt', 'DESC']]
		}
		if(sort.toLowerCase() == "hot") {
			order = [['upvotes', 'DESC']]
		}
		
		db.Post.findAll({
			order: order,
			where: {
				title: {
					$like: "%" + search + "%"
				}
			}
			
		}).then(posts => {
			if(posts.length == 0 || posts.length <= session.currentIndex) {
				returnJSON(res, { err: "No posts found" })
				return
			}
			
			returnPost(res, posts[session.currentIndex].id)
			
			session.lastSort = sort
			session.lastSearch = search
		})
	})
	
	function returnPost(res, id) {
		post.read(id, function(obj) {
			returnJSON(res, { id: id, title: obj.title, upvotes: obj.upvotes, downvotes: obj.downvotes })
		})
	}
	
	//Vote on post
	app.post('/vote', function(req, res) {		
		if(typeof(user.store[req.body.token]) == 'undefined') {
			returnJSON(res, { err: "Not logged in" })
			return
		}
		
		req.body.userId = user.store[req.body.token].userId
		
		post.vote(req.body, function(data) {
			post.updateVotes(req.body.postId, function() {
				returnPost(res, req.body.postId)			
			})
		})
	})
	
	//Register user
	app.post('/user/create', function(req, res) {
		user.create(req.body, function(data) {
			if(typeof(data.err) == 'undefined') {
				user.createSession(req, req.body, data.user.id)
				returnJSON(res, { token: req.session.token })
				
			} else {
				returnJSON(res, { err: data.err })
			}
		})
	})
	
	//Change user password
	app.post('/user/changePass', function(req, res) {		
		user.changePass(req.body, function(data) {
			returnJSON(res, data)
		})
	})
	
	//Login user
	app.post('/user/login', function(req, res) {
		user.checkLogin(req.body, function(data) {
			if(data.success) {
				user.createSession(req, req.body, data.user.id)
			}
			
			returnJSON(res, { success: data.success, token: req.session.token })
		})
	})
	
	//Logout user
	app.post('/user/logout', function(req, res) {
		delete user.store[req.session.token]
		req.session.destroy()
		returnJSON(res, { })
	})
	
	//Get user session
	app.get('/user/session', function(req, res) {
		user.createGenericSession(req)
		
		returnJSON(res, { name: req.session.name, token: req.session.token })
	})
	
	function returnJSON(res, json) {
		res.setHeader('Content-Type', 'application/json')
		res.send(json)
	}
}