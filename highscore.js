var cookieName = "CyberAssassinHighScore";
function setHighScore() {
  document.cookie=cookieName + "=" + this.value +";expires=Thu, 18 Dec 2114 12:00:00 GMT;path=/;domain=" + document.location.hostname;
}

function getHighScore() {
	var cookies = document.cookie.split(";");
	var hs = 0;
	for (var i = 0;i < cookies.length; ++i) {
		var cookie = {name:cookies[i].split("=")[0], value:cookies[i].split("=")[1]};
		if (cookie.name == cookieName) {
			hs = cookie.value;
		}
	}
	return hs;
}