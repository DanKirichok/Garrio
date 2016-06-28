var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

// User Schema
var UserSchema = mongoose.Schema({
	username: {
		type: String,
		index: true,
		required: true,
		unique: true,
	},
	password: {
		type: String
	},
	email: {
		type: String,
		required: true,
		unique: true,
	},
	first_name: {
		type: String
	},
	last_name: {
		type: String
	},
	friends: {
		type: []
	},
	profile_pic: {
		type: String,
		default: "pic1.jpg",
	},
	bio: {
		type: String,
		default: "Hello!"
	}
	
});

var User = module.exports = mongoose.model('User', UserSchema);

module.exports.createUser = function(newUser, callback){
	bcrypt.genSalt(10, function(err, salt) {
	    bcrypt.hash(newUser.password, salt, function(err, hash) {
	        newUser.password = hash;
	        newUser.friends = [];
	        newUser.save(callback);
	    });
	});
}

module.exports.getUserByUsername = function(username, callback){
	var query = {username: username};
	User.findOne(query, callback);
}

module.exports.getUserById = function(id, callback){
	User.findById(id, callback);
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    	if(err) throw err;
    	callback(null, isMatch);
	});
}
