function getProfilePic(picName){
	for (var i = 0; i < document.getElementsByClassName("profile_pic").length; i++){
		document.getElementsByClassName("profile_pic")[0].src = "/profile_pics/" + picName;
	}
}

function listProfilePics(){
	for (var i = 0; i < document.getElementsByClassName("list_pic").length; i ++){
		document.getElementsByClassName("list_pic")[i].src = "/profile_pics/" + document.getElementsByClassName("list_pic")[i].getAttribute("name")
	}
}

function listHrefs(){
	for (var i = 0; i < document.getElementsByClassName("friendsBlock").length; i ++){
		document.getElementsByClassName("friendsBlock")[i].href = "/user_result?username=" + document.getElementsByClassName("friendsBlock")[i].getAttribute("name")
	}
}

//This presets the bio to the one the user has in edit profile page
function updateBio(bio){
	document.getElementById("update_bio_text").value = bio
}

//This presets the profile pic to the one the user has in edit profile page
function updateProfilePic(profile_pic){
	var picName = profile_pic.split(".")[0];
	var picNum = picName.slice(3, picName.length);
	
	document.getElementsByName("profile_pic_selector")[0].selectedIndex = picNum - 1
}

function sendUsernameFR(username){
	if (document.getElementById("usernameFR")){
		document.getElementById("usernameFR").value = username;
	}
}

//Selects the active window in the navbar
function selectActiveWindow(){
	var pageName = window.location.pathname;
	if (pageName == "/"){
		document.getElementById("profilePage").setAttribute("class", "active");
	}else if (pageName == "/friends"){
		document.getElementById("friendsPage").setAttribute("class", "active");
	}else if (pageName == "/notifications"){
		document.getElementById("notificationsPage").setAttribute("class", "active");
	}else if (pageName == "/messages"){
		document.getElementById("messagesPage").setAttribute("class", "active");
	}
}
