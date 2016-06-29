function getProfilePic(picName){
	document.getElementsByClassName("profile_pic")[0].src = "/profile_pics/" + picName
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
