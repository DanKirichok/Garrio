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
	}
	
	res.render('edit_profile', context);
});

//Posts the submitted data in edit profile
router.post('/', ensureAuthenticated, function(req, res){	
	var bio = req.body.bio;
	var profile_pic = req.body.profile_pic_selector;
	
	console.log(profile_pic);
	
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

function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}else{
		res.redirect('/users/login');
	}
}

module.exports = router;
