var express = require('express');
var router = express.Router();

var User = require('../models/user');

//Get homepage
router.get('/', ensureAuthenticated, function(req, res){	
	var context = {
		first_name: req.user.first_name,
		last_name: req.user.last_name,
		username: req.user.username,
		profile_pic: req.user.profile_pic,
		bio: req.user.bio,
	}
	
	res.render('index', context);
});

//Edit Profile
router.get('/edit_profile', ensureAuthenticated, function(req, res){	
	var context = {
		bio: req.user.bio,
		profile_pic: req.user.profile_pic,
	}
	
	res.render('edit_profile', context);
});

//Posts the submitted data in edit profile
router.post('/', ensureAuthenticated, function(req, res){	
	var bio = req.body.bio;
	var profile_pic = req.body.profile_pic_selector;
		
	//This updates the bio of the user to what the user had input into the form
	User.update({_id: req.user._id}, {$set:{bio: bio}}, function(err, result){
		if (err) throw err;
	});
	
	//This updates the profile of the user
	User.update({_id: req.user._id}, {$set:{profile_pic: profile_pic}}, function(err, result){
		if (err) throw err;
	});
	
	var context = {
		first_name: req.user.first_name,
		last_name: req.user.last_name,
		username: req.user.username,
		profile_pic: profile_pic,
		bio: bio,
	}
	
	res.render('index', context)
});

//Posts the submitted data in edit profile
router.post('/user_result', ensureAuthenticated, function(req, res){		
	var username = req.body.username
	
	var first_name;
	var last_name;
	var profile_pic;
	var bio;
	
	User.getUserByUsername(username, function(err, user){
		if(err) throw err;
		if (user != null){
			first_name = user.first_name;
			last_name = user.last_name;
			profile_pic = user.profile_pic;
			bio = user.bio;
						
			var context = {
				username: username,
				first_name: first_name,
				last_name: last_name,
				username: username,
				profile_pic: profile_pic,
				bio: bio,
			}
			
			res.render('user_result', context)
		}else{
			req.flash('error_msg', username + ' was not found.');
			res.redirect('/');
		}
	})
});

function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}else{
		res.redirect('/users/login');
	}
}

module.exports = router;
