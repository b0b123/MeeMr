const Sequelize = require('sequelize')
const sequelize = new Sequelize('mysql://root@localhost:3306/meemr') // mysql://user:pass@localhost:3306/dbname

module.exports = {
	Post: sequelize.define('post', {
		title: Sequelize.STRING
	}),

	User: sequelize.define('user', {
		name: { type: Sequelize.STRING, unique: true },
		pass: Sequelize.STRING
	}),
	
	Vote: sequelize.define('vote', {
		upvote: Sequelize.BOOLEAN
	})
};

module.exports.Post.hasOne(module.exports.Vote, { foreignKey: 'postId', foreignKeyConstraint: true })
module.exports.User.hasOne(module.exports.Vote, { foreignKey: 'userId', foreignKeyConstraint: true })

sequelize.sync().then(() => {
	console.log("Database loaded")
})
