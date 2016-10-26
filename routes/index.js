var express = require('express');
var router = express.Router();

var User = require('../models/user');
var Main = require('../public/js/main')

/*
 * This gets all comment poster's profile pic and
 * attatches it to each comment in the given timeline
*/
function putProfilePicsIntoComments(timeline, callback){
	//This is also a big jumbled mess but I didn't know how else to do it
	var updated_timeline = timeline;
	
	var commentIds = [];
	if (updated_timeline.length > 0){
		//This loop cycles through all comments and attatches each comment poster's profile pic to the comment
		for (var post = 0; post < updated_timeline.length; post ++){
			if (updated_timeline[post].comments.length > 0){
				for (var comment = 0; comment < updated_timeline[post].comments.length; comment ++){
					commentIds.push(updated_timeline[post].comments[comment].id);
					var totalComments = commentIds.length;
					User.getUserByUsername(updated_timeline[post].comments[comment].from, function(err, user){				
						for (var newPost = 0; newPost < updated_timeline.length; newPost ++){
							for (var newComment = 0; newComment < updated_timeline[newPost].comments.length; newComment ++){
								if (commentIds[0] == updated_timeline[newPost].comments[newComment].id){
									user.profile_pic
									updated_timeline[newPost].comments[newComment].profile_pic = user.profile_pic;
									commentIds.shift()
									totalComments = commentIds.length;
									if (totalComments == 0){
										callback(updated_timeline);
									}
									break
								}
							}
						}
					})
				}
			}else{
				if (post == updated_timeline.length - 1){
					callback(updated_timeline);
				}
			}
		}
	}else{
		callback(updated_timeline);
	}
}

//This also puts profile_color into posts
function putProfilePicsIntoPosts(timeline, callback){
	//This is also a big jumbled mess but I didn't know how else to do it
	var updated_timeline = timeline;
	
	var pics_inserted = 0;
	
	if (updated_timeline.length > 0){
		for (var post = 0; post < updated_timeline.length; post ++){
			User.getUserByUsername(updated_timeline[post].from, function(err, user){
				if (pics_inserted < updated_timeline.length){
					for (var newPost = 0; newPost < updated_timeline.length; newPost ++){
						if (updated_timeline[newPost].from == user.username){
							updated_timeline[newPost].profile_pic = user.profile_pic;
							updated_timeline[newPost].profile_color = user.profile_color;
							pics_inserted ++;
							if (pics_inserted == updated_timeline.length){
								break;
							}
						}
					}
					/*
					console.log('')
					console.log('pics_inserted: ' + pics_inserted);
					console.log('updated_timeline.length: ' + updated_timeline.length);
					*/
					
					//This should only be run once when the looping is all done above
					if (pics_inserted == updated_timeline.length){
						callback(updated_timeline)
					}
				}
			})
		}
	}else{
		callback(updated_timeline);
	}
}

//Home page
router.get('/', ensureAuthenticated, function(req, res){
	//This updated timeline has each post specified if user has liked it or not
	var updated_timeline = Main.getLikedPostsInTimeline(req.user.user_timeline, req.user.liked_posts);	
		
	putProfilePicsIntoComments(updated_timeline, function(user_timeline){
		var context = {
			first_name: req.user.first_name,
			last_name: req.user.last_name,
			username: req.user.username,
			profile_pic: req.user.profile_pic,
			bio: req.user.bio,
			user_timeline: user_timeline,
			profile_color: req.user.profile_color,
		}

		res.render('index', context);
	});
});

//Friends Page
router.get('/friends', ensureAuthenticated, function(req, res){	
	//These are the 3 different types of friends lists you have
	//acceptedFriendsList is where the full friends are where one has requested and the other has accepted 
	//These only contain the usernames of the friends and nothing else
	var requestedFriendsList = req.user.requested_friends;
	var pendingFriendsList = req.user.pending_friends;
	var acceptedFriendsList = req.user.accepted_friends;
	
	var totalFriends = requestedFriendsList.length + pendingFriendsList.length + acceptedFriendsList.length
		
	//This is where the data of the full friends list is stored
	//It gets populated in the big loop below
	var newRequestedFriendsList = [];
	var newPendingFriendsList = [];
	var newAcceptedFriendsList = [];
	
	//DO NOT CHANGE ORDER OF THIS
	var friends = [requestedFriendsList, pendingFriendsList, acceptedFriendsList];
	
	//This is a big jumbled mess but I couldn't think of another way to do it
	
	var totalFriends = requestedFriendsList.length + pendingFriendsList.length + acceptedFriendsList.length 
		
	var friendsSorted = 0;
	
	if (totalFriends > 0){
		//This loops once through all the lists to get all of the usernames of the friends
		for (var listNum = 0; listNum < friends.length; listNum ++){
			for (var listUser = 0; listUser < friends[listNum].length; listUser ++){
				
				//This queries the db to find the whole data set for the users with the specified username			
				User.getUserByUsername(friends[listNum][listUser], function(err, user){
					
					/*Starts looping again to find the position of
					where the user was because if loses it
					because the query is slower than the loop 
					and as a result the numbers cannot be reused*/
					for (var newListNum = 0; newListNum < friends.length; newListNum ++){
						for (var newListUser = 0; newListUser < friends[newListNum].length; newListUser ++){
							if (friends[newListNum][newListUser] == user.username){
								friendsSorted ++;
								
								//These numbers are based off the position of each list in the friends list
								if (newListNum == 0){
									newRequestedFriendsList[newListUser] = user;
								}else if (newListNum == 1){
									newPendingFriendsList[newListUser] = user;
								}else if (newListNum == 2){
									newAcceptedFriendsList[newListUser] = user;
								}
							}
						}
						
						//This is to help debug
						
						/*
						console.log("friends.length: " + friends.length);
						console.log("newListNum: " + newListNum);
						
						console.log("Friends sorted: " + friendsSorted);
						console.log('');
						*/
						
						if (friendsSorted == totalFriends){
							//Page is rendered with the friends list filled with appropriate info
							var context = {
								requestedFriendsList: newRequestedFriendsList,
								pendingFriendsList: newPendingFriendsList,
								acceptedFriendsList: newAcceptedFriendsList,
								amnt_friends: acceptedFriendsList.length,
							}
							
							res.render('friends', context);
							
							break;
						}
					}
				});
			}
		}
	}else if (totalFriends == 0){
		//This runs when user has no friends
		var context = {
			requestedFriendsList: newRequestedFriendsList,
			pendingFriendsList: newPendingFriendsList,
			acceptedFriendsList: newAcceptedFriendsList,
		}
		
		res.render('friends', context);
	}
});

//Notifications Page
router.get('/notifications', ensureAuthenticated, function(req, res){	
	var context = {}
	
	res.render('notifications', context);
});

//Messages Page
router.get('/messages', ensureAuthenticated, function(req, res){	
	var context = {}
	
	res.render('messages', context);
});

router.get('/user_result', function(req, res){
	var username = req.query['username']
	if (username != null){
		username = username.toLowerCase();
	}
	var first_name;
	var last_name;
	var profile_pic;
	var bio;
	var user_timeline;
	var profile_color;
	
	var requestedFriendsList = req.user.requested_friends;
	var pendingFriendsList = req.user.pending_friends;
	var acceptedFriendsList = req.user.accepted_friends;
	
	//KEEP THIS ORDER
	var friends = [requestedFriendsList, pendingFriendsList, acceptedFriendsList];			
	
	if (username == req.user.username){
		res.redirect('/');
	}else{		
		User.getUserByUsername(username, function(err, user){
			if(err) throw err;
			if (user != null){
				first_name = user.first_name;
				last_name = user.last_name;
				profile_pic = user.profile_pic;
				bio = user.bio;
				user_timeline = user.user_timeline;
				profile_color = user.profile_color
				
				//This updated timeline has each post specified if user has liked it or not
				var updated_timeline = Main.getLikedPostsInTimeline(user_timeline, req.user.liked_posts);
				
				putProfilePicsIntoComments(updated_timeline, function(user_timeline){
					var context = {
						username: username,
						first_name: first_name,
						last_name: last_name,
						username: username,
						profile_pic: profile_pic,
						bio: bio,
						not_friend: true,
						requested_friend: false,
						pending_friend: false,
						accepted_friend: false,
						user_timeline: updated_timeline,
						profile_color: profile_color,
						req_username: req.user.username,
						req_profile_pic: req.user.profile_pic,		
					}
													
					for (var listNum = 0; listNum < friends.length; listNum ++){
						for (var userNum = 0; userNum < friends[listNum].length; userNum ++){
							if (friends[listNum][userNum] == username){
								context.not_friend = false;
								
								if (listNum == 0){
									context.requested_friend = true;
								}else if (listNum == 1){
									context.pending_friend = true;
								}else if (listNum == 2){
									context.accepted_friend = true;
								}
							}
						}
					}
					res.render('user_result', context)
				})
			}else{
				req.flash('error_msg', username + ' was not found.');
				res.redirect('/');
			}
		})
	}
})

//Edit Profile Page
router.get('/edit_profile', ensureAuthenticated, function(req, res){	
	var context = {
		bio: req.user.bio,
		profile_pic: req.user.profile_pic,
		profile_color: req.user.profile_color,
	}
	
	res.render('edit_profile', context);
});

router.get('/timeline', ensureAuthenticated, function(req, res){
	//This is where each accepted_friends timeline will go
	var posts = [];
	
	var friends_sorted = 0;
	if (req.user.accepted_friends.length > 0){
		for (var friendUsername = 0; friendUsername < req.user.accepted_friends.length; friendUsername++){
			var username = req.user.accepted_friends[friendUsername];
			User.getUserByUsername(username, function(err, user){
				var friendTimeline = user.user_timeline;
				for (var timelineItem = 0; timelineItem < friendTimeline.length; timelineItem ++){
					posts.push(friendTimeline[timelineItem]);
				}
				
				//For debugging
				/*
				console.log("friends_sorted: " + friends_sorted);
				console.log("req.user.accepted_friends.length: " + req.user.accepted_friends.length);
				
				console.log("timelineItem: " + timelineItem);
				console.log("friendTimeline.length: " + friendTimeline.length);
				*/
				
				if (friends_sorted == req.user.accepted_friends.length - 1 && timelineItem == friendTimeline.length){
					//This function sorts all the posts based on time created from most recent to oldest
					var sorted_posts = posts.sort(function(a, b) {
						a = new Date(a.time);
						b = new Date(b.time);
						return a>b ? -1 : a<b ? 1 : 0;
					})
					
					putProfilePicsIntoPosts(sorted_posts, function(posts){
						putProfilePicsIntoComments(posts, function(finished_timeline){
							var context = {
								timeline: Main.getLikedPostsInTimeline(finished_timeline, req.user.liked_posts),
								req_username: req.user.username,
								req_profile_pic: req.user.profile_pic,
							};
			
							res.render('timeline', context);
						})
					});
				}
				
				friends_sorted ++; 
			})
		}
	}else{
		var context = {
			message: "It looks like your timeline is empty. Fill it up by adding friends."
		};
		res.render('timeline', context);
	}
});

router.post('/fr_accept', ensureAuthenticated, function(req, res){
	var username = req.body.user
	
	//This removes the user who friend requested you from requested_friends list
	User.update({username: req.user.username}, {$pull:{requested_friends: username}}, function(err, result){
		if (err) throw err;
	});
	//This adds the user you friend requested to accepted_friends list
	User.update({username: req.user.username}, {$push:{accepted_friends: username}}, function(err, result){
		if (err) throw err;
	});
	
	//Removes accepted friend from pending friend list to accepted friend list
	User.update({username: username}, {$pull:{pending_friends: req.user.username}}, function(err, result){
		if (err) throw err;
	});
	User.update({username: username}, {$push:{accepted_friends: req.user.username}}, function(err, result){
		if (err) throw err;
	});
	
	var context = {}

	req.flash('success_msg', 'Accepted ' + username + ' as a friend.');
	res.redirect('/friends');
})

router.post('/remove_friend', ensureAuthenticated, function(req, res){
	var username = req.body.user
	
	//Removs each other from accepted_friends list
	User.update({username: req.user.username}, {$pull:{accepted_friends: username}}, function(err, result){
		if (err) throw err;
	});
	User.update({username: username}, {$pull:{accepted_friends: req.user.username}}, function(err, result){
		if (err) throw err;
	});
	
	var context = {}
	
	
	req.flash('success_msg', 'Removed ' + username + ' as a friend.');
	res.redirect('/');
})

router.post('/new_status', ensureAuthenticated, function(req, res){
	var status = req.body.status
	
	var user_timeline = req.user.user_timeline
	var new_user_timeline = []
		
	var fullPost = {
		id: req.user.amnt_posts,
		type: "status",
		time: Main.getFormattedDate(),
		from: req.user.username,
		content: status,
		likes: 0,
		comments: [],
		amnt_comments: 0,
	}
	
	new_user_timeline.push(fullPost)
	
	for (var i = 0; i < user_timeline.length; i++){
		new_user_timeline.push(user_timeline[i])
	}
		
	User.update({username: req.user.username}, {user_timeline: new_user_timeline}, function(err, result){
		if (err) throw err;
	});
	
	User.update({username: req.user.username}, {amnt_posts: req.user.amnt_posts + 1}, function(err, result){
		if (err) throw err;
	});
	
	var context = {};
	
	res.redirect('/');
})

router.post('/post_comment', ensureAuthenticated, function(req, res){
	var datePosted = req.body.date;
	var content = req.body.content;
	var commentFrom = req.user.username;
	var postFrom = req.body.postFrom;
	var postID = req.body.postID;
	
	//Each comment has a unique comment id
	var commentID = Main.getRandomInt(1, 10000000);
	
	var comment = {date: datePosted, content: content, from: commentFrom, id: commentID}
	
	User.getUserByUsername(postFrom, function(err, user){
		var user_timeline = user.user_timeline;
		
		for (var i = 0; i < user_timeline.length; i++){
			if (user_timeline[i].id == postID){
				user_timeline[i].comments.push(comment);
				user_timeline[i].amnt_comments ++;		
				break
			}
		}
		
		User.update({username: user.username}, {user_timeline: user_timeline}, function(err, result){
			if (err) throw err;
		});
	});
})

router.post('/like_post', ensureAuthenticated, function(req, res){
	var from = req.body.from;
	var postID = req.body.postID;
	var liked_posts = req.user.liked_posts;
	User.getUserByUsername(from, function(err, user){
		var user_timeline = user.user_timeline;
		
		var postLiked = false;
				
		for (var i = 0; i < user_timeline.length; i++){
			if (user_timeline[i].id == postID){
				if (liked_posts.length > 0){
					for (var x = 0; x < liked_posts.length; x ++){
						if (liked_posts[x].id == postID && liked_posts[x].from == from){
							postLiked = true;
						}
					}
				}
				break
			}
		}
				
		if (!postLiked){
			user_timeline[i].likes ++;
			User.update({username: req.user.username}, {$push:{liked_posts: user_timeline[i]}}, function(err, result){
				if (err) throw err;
			});
		}else if (postLiked){
			user_timeline[i].likes --;
			User.update({username: req.user.username}, {$pull:{liked_posts: {id: user_timeline[i].id}}}, function(err, result){
				if (err) throw err;
			});
		}
		
		
		User.update({username: from}, {user_timeline: user_timeline}, function(err, result){
			if (err) throw err;
		});
		
		
	})
})

router.post('/remove_post', ensureAuthenticated, function(req, res){
	//This is because new values are stored at beginning of array so you have to find the opposite value of id
	var postID = Number(req.body.postID)

	//Removes post from respective user's timeline
	User.update({username: req.user.username}, {$pull:{user_timeline: { id: postID } } }, function(err, result){
		if (err) throw err;
	});	
	var context = {}

	req.flash('success_msg', 'Post Removed!');
	res.redirect('/');
})

router.post('/fr_decline', ensureAuthenticated, function(req, res){
	var username = req.body.user
	
	//Removes friend request from both users
	User.update({username: req.user.username}, {$pull:{requested_friends: username}}, function(err, result){
		if (err) throw err;
	});
	
	User.update({username: username}, {$pull:{pending_friends: req.user.username}}, function(err, result){
		if (err) throw err;
	});
	
	var context = {}

	req.flash('success_msg', 'Declined ' + username + ' as a friend.');
	res.redirect('/friends');
})

//Runs when send friend request is pressed
router.post('/processing', ensureAuthenticated, function(req, res){
	var username = req.body.user;
	
	//This adds the user to requested friends requested_friend list
	User.getUserByUsername(username, function(err, user){
		User.update({_id: user._id}, {$push:{requested_friends: req.user.username}}, function(err, result){
			if (err) throw err;
		});
	})
	
	//This adds the user you friend requested to pending_friends list
	User.update({_id: req.user._id}, {$push:{pending_friends: username}}, function(err, result){
		if (err) throw err;
	});

	context = {}

	req.flash('success_msg', 'Friend Request Sent!');
	res.redirect('/user_result?username=' + username);
});

//Posts the submitted data in edit profile
router.post('/', ensureAuthenticated, function(req, res){
	var bio = req.body.bio;
	var profile_pic = req.body.profile_pic_selector;
	var profile_color = req.body.profile_color;
		
	//This updates the bio of the user to what the user had input into the form
	User.update({_id: req.user._id}, {$set:{bio: bio}}, function(err, result){
		if (err) throw err;
	});
	
	//This updates the profile of the user
	User.update({_id: req.user._id}, {$set:{profile_pic: profile_pic}}, function(err, result){
		if (err) throw err;
	});
	
	//This updates the profile of the user
	User.update({_id: req.user._id}, {$set:{profile_color: profile_color}}, function(err, result){
		if (err) throw err;
	});
	
	var context = {
		first_name: req.user.first_name,
		last_name: req.user.last_name,
		username: req.user.username,
		profile_pic: profile_pic,
		bio: bio,
	}
	
	res.redirect('/')
});

function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}else{
		res.redirect('/users/welcome');
	}
}

module.exports = router;
