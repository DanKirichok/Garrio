var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');

//Register
router.get('/register', function(req, res){
	res.render('register');
});

//Login
router.get('/login', function(req, res){
	res.render('login');
});

//Register
router.post('/register', function(req, res){
	var first_name = req.body.first_name;
	var last_name = req.body.last_name;
	var email = req.body.email;
	var username = req.body.username;
	var password = req.body.password;
	var password2 = req.body.password2;
	
	//Validation
	req.checkBody('first_name', 'First Name is required').notEmpty();
	req.checkBody('last_name', 'Last Name is required').notEmpty();
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('username', 'Username is required').notEmpty();
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password2', 'Passwords do not match').equals(req.body.password);
	
	var errors = req.validationErrors();
	
	var usernameExists = false;

	if (errors){
		console.log(errors)
		res.render('register', {
			errors: errors
		});
	}else{
		User.findOne({
		'username': username,
		'email': email}, function(err, user){
			//This checks database and sees if user.email is in database and sends an error
			if(user != null && user.email){
				req.flash('error_msg', user.email + ' is already associated with an account.');
				res.redirect('/users/register');	
			}else{
				//This runs if the email is not yet taken and registers the account
				var newUser = new User({
					first_name: first_name,
					last_name: last_name,
					email: email,
					username: username,
					password: password,
				});
			
				User.createUser(newUser, function(err, user){
					if (err) throw err;
				});
				
				req.flash('success_msg', 'You are registered and can now login.');
				res.redirect('/users/login');
			}
		})
	}
});

passport.use(new LocalStrategy(
	function(username, password, done) {
		User.getUserByUsername(username, function(err, user){
			if(err) throw err;
			if(!user){
				return done(null, false, {message: 'Unknown User'});
			}

			User.comparePassword(password, user.password, function(err, isMatch){
				if(err) throw err;
				if(isMatch){
					return done(null, user);
				} else {
					return done(null, false, {message: 'Invalid password'});
				}
			});
		});
	}
));

passport.serializeUser(function(user, done) {
	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	User.getUserById(id, function(err, user) {
		done(err, user);
	});
});

router.post('/login',
	passport.authenticate('local', {successRedirect:'/', failureRedirect:'/users/login',failureFlash: true}),
	function(req, res) {
		res.redirect('/');
	}
);

router.get('/logout', function(req, res){
	req.logout();
	req.flash('success_msg', 'You are logged out.');
	res.redirect('/users/login');
});

module.exports = router;
