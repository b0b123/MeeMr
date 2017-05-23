var jsonfile = require('jsonfile')

module.exports = {
	create: function(params) {		
		params.id = (Math.random()+'').split('.')[1]
		console.log('Creating ' + params.id)
		
		this.save(params)
		
		return params.id
	},
	
	save: function(params) {
		jsonfile.writeFile('posts/' + params.id + '.json', params, function (err) {
			if(err != null) {
				console.error(err)
			}
		})
		
		console.log('Saved ' + params.id)
	},
	
	read: function(id, callback) {
		console.log('Reading ' + id)
		
		jsonfile.readFile('posts/' + id + '.json', function(err, obj) {
			callback(obj) //TODO handle null
		})
	}
}