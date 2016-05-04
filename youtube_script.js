chrome.runtime.onMessage.addListener(
	function ( request, sender, sendResponse) {
		if (request.command == "play-pause") {
			var video = document.getElementsByClassName("video-stream html5-main-video")[0];
			if (video) {
				if (video.paused) {
					video.play();
				}
				else {
					video.pause();
				}
			}
		}
		else if (request.command == "player-search") {
			document.getElementById("masthead-search-term").select();
		}
	}
);