function getProfilePic(picName){
	document.getElementsByClassName("profile_pic")[0].src = "/profile_pics/" + picName
}

function updateBio(bio){
	document.getElementById("update_bio_text").value = bio
}
