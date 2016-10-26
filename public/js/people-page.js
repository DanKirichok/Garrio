getProfilePic(hb_profile_pic);
listProfilePics();
listHrefs();

$(document).ready(function() {
	if(isTouchDevice()===false){
		$("body").tooltip({ selector: '[data-toggle=tooltip]' });
	}
});

$(".submitLikedPost").click(function(){
	var btnId = "#" + this.id;
	var formId = "#" + this.id + "_form";
	var iconId = "#" + this.id + "_likeIcon";
	var labelId = "#" + this.id + "_label";
	
	//Sends the data to the server without having to refresh
	$.post('/like_post',{
		postID: $(btnId + "_likePostID").val(),
		from: $(btnId + "_likePostFrom").val(),
	})
			
	if ($(iconId).attr('class').indexOf("liked") >= 0){
		$(iconId).attr('class', 'fa fa-thumbs-o-up');
		$(labelId).text(Number($(labelId).text()) - 1);
		$(btnId).attr('data-original-title', 'Like')
	}else{
		$(iconId).attr('class', "fa fa-thumbs-up liked")
		$(labelId).text(Number($(labelId).text()) + 1)
		$(btnId).attr('data-original-title', 'Unlike')
	}
});

$(".commentSubmit").click(function(){	
	var btnId = "#" + this.id;
	var formId = "#" + this.id + "_form";
	var labelId = "#" + this.id + "_label";
	var commentsId = "#" + this.id + "_comments"
	
	var commentContent = $(btnId + "_commentContent").val().trim();
	var commentDate = getFormattedDate();
	
	if ($(btnId + "_commentContent").val().trim() != 0){			
		//Sends the data to the server without having to refresh
		$.post('/post_comment',{
			commentFrom: $(btnId + "_commentFrom").val(),
			content: commentContent,
			date: commentDate,
			postFrom: $(btnId + "_postFrom").val(),
			postID: $(btnId + "_postID").val(),
		})
		$(btnId + "_commentContent").val("");
		$(labelId).text(Number($(labelId).text()) + 1);
		
		//This adds the comment to the comment section on the screen of the poster
		//It is the html of a comment as can be found above
		$(commentsId).append('<div class="comment media"><a class="friendsBlock pull-left" name =' + hb_req_username + '><img class="list_pic" name = ' + hb_req_profile_pic + '></a><div class="media-body"><h3 class="post-comment-username panel-title">' + hb_req_username + '</h3>' + commentContent + '<h3 class="post-comment-date panel-title">' + commentDate + '</h3></div></div>')
		
		listProfilePics();
		listHrefs();
	}
	
	$(commentsId)[0].scrollTop = $(commentsId)[0].scrollHeight;
});

$('.statusSubmit').click(function(){
	console.log("POOP")
	$('#statusForm').submit();
})
