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
				returnJSON(res, { err: "Error uploading file" })
			} else if(typeof(req.file) == 'undefined') {
				returnJSON(res, { err: "Error uploading file" })
			} else if(typeof(req.body.title) == 'undefined' || req.body.title.trim().length == 0) {
				returnJSON(res, { err: "Please set a title" })
			} else if(typeof(req.body.category) == 'undefined' || req.body.category.trim().length == 0) {
				returnJSON(res, { err: "Please set a category" })
				
			} else {
				req.body.title = escapeHTML(req.body.title)
				req.body.category = escapeHTML(req.body.category)
				
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
		var up = req.query.up
		
		var session = user.getSession(token)
		
		//If search and sort requirements are still the same, continue in feed, else start at the start of the feed
		if(typeof(session.lastSort) == 'undefined' || session.lastSort != sort || typeof(session.lastSearch) == 'undefined' || session.lastSearch != search) {
			session.currentIndex = 0
		} else {
			session.currentIndex += (up == "true" ? -1 : 1)
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
				$or: {
					title: {
						$like: "%" + search + "%"
					},
					category: {
						$like: "%" + search + "%"
					}
				}
			}
			
		}).then(posts => {
			if(posts.length == 0 || posts.length <= session.currentIndex || session.currentIndex < 0) {
				if(posts.length <= session.currentIndex) {
					session.currentIndex = posts.length
					returnJSON(res, { err: "No posts found", top: false })
				}
				if(session.currentIndex < 0) {
					session.currentIndex = -1
					returnJSON(res, { err: "No posts found", top: true })
				}
				
				return
			}
			
			returnPost(res, posts[session.currentIndex].id)
			
			session.lastSort = sort
			session.lastSearch = search
		})
	})
	
	function returnPost(res, id) {
		post.read(id, function(obj) {
			returnJSON(res, { id: id, title: obj.title, category: obj.category, upvotes: obj.upvotes, downvotes: obj.downvotes })
		})
	}
	
	//Vote on post
	app.post('/vote', function(req, res) {		
		if(typeof(user.store[req.body.token]) == 'undefined' || typeof(user.store[req.body.token].name) == 'undefined') {
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
		
		returnJSON(res, { name: (typeof(req.session.name) != 'undefined' ? escapeHTML(req.session.name) : undefined), token: req.session.token })
	})
	
	function returnJSON(res, json) {
		res.setHeader('Content-Type', 'application/json')
		res.send(json)
	}
}

function escapeHTML(s) { 
    return s.replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
}