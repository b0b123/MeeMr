var post = require('./post')
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
		res.setHeader('Content-Type', 'application/json')
		post.read(id, function(obj) {
			res.send({ id: id, title: obj.title })
		})
	}
}