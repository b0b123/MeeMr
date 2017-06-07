var db = require('./database')
var crypto = require('crypto')

module.exports = {
	create: function(params, callback) {
		params.pass = encryptPass(params.name, params.pass)
	
		this.save(params, function(err, post) {
			callback(err, post)
		})
	},
	
	save: function(params, callback) {
		db.User.create(params).then(user => {
			callback(undefined, user)
			
		}).catch(function (err) {
			console.log(err)
			callback("User already registered", undefined)
		})		
	},
	
	read: function(name, callback) {
		db.User.findOne({
			where: {
				name: name
			}
		}).then(user => {
			callback(user)
		})
	},
	
	checkLogin: function(params, callback) {
		var pass = encryptPass(params.name, params.pass)
		
		this.read(params.name, function(user) {
			callback(user != null && user.pass == pass)
		})
	}
}

function encryptPass(salt, pass) {
	return crypto.createHash('md5').update(salt + "" + pass).digest('hex')
}