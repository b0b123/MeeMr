var db = require('./database')

module.exports = {
	create: function(params, callback) {				
		this.save(params, function(post) {
			callback(post)
		})
	},
	
	save: function(params, callback) {
		db.Post.create(params).then(post => {
			console.log('Saved ' + post.id)
			
			callback(post)
			
		}).catch(function (err) {
			console.log(err)
		})		
	},
	
	read: function(id, callback) {
		console.log('Reading ' + id)
		
		db.Post.findOne({
			where: {
				id: id
			}
		}).then(post => {
			callback(post)
		})
	}
}