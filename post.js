var db = require('./database')

module.exports = {
	create: function(params, callback) {				
		this.save(params, function(post) {
			callback(post)
		})
	},
	
	save: function(params, callback) {
		params.upvotes = 0
		params.downvotes = 0
		
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
	},
	
	vote: function(params, callback) {		
		db.Vote.findOne({
			where: {
				userId: params.userId,
				postId: params.postId
			}
		}).then(vote => {
			if(vote != null) {
				//vote exists
				if(vote.upvote != params.upvote && (params.upvote == 0 || params.upvote == 1)) {
					//update vote
					console.log("Updating vote " + vote.id)
					
					vote.updateAttributes({
						upvote: params.upvote
						
					}).then(function() {
						callback({ })
					})
					
				} else {
					callback({ })
				}
				
			} else {
				db.Vote.create(params).then(vote => {
					console.log('Placed vote ' + vote.id)
					
					callback({ })
					
				}).catch(function (err) {
					console.log(err)
					callback({ err: "An error occurred" })
				})
			}
		})
	},
	
	updateVotes: function(id, callback) {
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
			
				db.Post.findOne({
					where: {
						id: id
					}
					
				}).then(post => {
					post.updateAttributes({
						upvotes: upvotes,
						downvotes: downvotes
						
					}).then(function() {
						callback({ })
					})
				})
			});
		});
	}
}