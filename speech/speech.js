Module.register("speech", {

	defaults: {
		language: 'it-IT' // lingua italiana, default
	},

	start: function() {
	        this.sendSocketNotification('START', {message: 'start connection'}); // handshake
					Log.log("Speech module starting...")
					this.sendSocketNotification('SPEECH_DEFAULTS', {

						// inizia la configurazione dell'assistente vocale, viene mandato tramite socket (a node_helper.js) la lingua selezionata
						language: this.config.language

					})
	},

	socketNotificationReceived: function(notification, payload) {

		switch (notification) {
			case "ASSISTANT_MESSAGE":

				// la risposta viene stampata a video, ma c'è anche un playback audio
				document.getElementById("response").innerHTML = payload

				break;
			default: break;

		}

	},

	getStyles: function() {
		// style.css è vuoto, personalizzabile
		return ["style.css", "https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css"];
	},

	getDom: function(){

    var wrapper = document.createElement("div");
		var temp = document.createElement("div");
		wrapper.setAttribute("id", "response")
    return wrapper;

  },

});
