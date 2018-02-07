/*

  Modulo scritto da Emiliano Maccaferri @ MakeItModena

*/

Module.register("room", {

	defaults: {
		username: 'username', // username per mqtt
		password: 'donotsaveinplaintext', // password per mqtt
		port: 00000, // porta mqtt
		host: 'host', // host mqtt
		showTemperature: true, // valore di default: visualizza la temperatura
		showHumidity: true, // valore di default: visualizza l'umidità
		fahrenheit: false, // valore di default: visualizzazione celsius
		temperature: "Temperatura in stanza: ", // valore di default: label davanti alla temperatura
		humidity: "Umidità rilevata: ", // valore di default: label davanti all'umidità
		icons: false // valore di default: se selezionato i due label vengono ignorati e vengono utilizzate le icone
		topic_temperature: 'sensore/temperatura',
		topic_humidity: 'sensore/umidita'
	},

	start: function() {
	        this.sendSocketNotification('START', {message: 'start connection'}); // una sorta di pacchetto di handshake, non documentato, ma necessario per far funzionare il modulo correttamente
					Log.log("Sending MQTT parameters")
					this.sendSocketNotification('MQTT_CONNECTION', {

						username: this.config.username,
						password: this.config.password,
						port: this.config.port,
						host: this.config.host,
						temp: this.config.topic_temperature,
						hum: this.config.topic_humidity

					}) /*
						I moduli comunicano fra di loro (internamente ed esternamente) tramite socket:
						mando dunque a "node_helper.js" la configurazione iniziale del modulo
					 */
	},

	socketNotificationReceived: function(notification, payload) {

		Log.log(notification, payload)

		// Qui vengono ricevute le notifiche da parte di node_helper, il comportamento del modulo è descritto dal codice sottostante

		switch(notification){

			case 'MQTT_DATA_TEMPERATURE':

				// sempre JS Vanilla
				var f = 0;
				var m = "°C"

				if(this.config.fahrenheit){ f += 32; m = "°F"; }

				if(this.config.showTemperature && !this.config.icons)
					document.getElementById("temperature").innerHTML = this.config.temperature + " " + (payload * 1 + parseInt(f)) + m; // *1 because JS has some kind of problems with number and string conversion
				else if(this.config.icons && this.config.showTemperature){

					// Per le icone viene utilizzato FontAwesome (http://fontawesome.com)
					var icon = '<i class="fa fa-thermometer-empty" aria-hidden="true"></i>'

					if(payload > 0 && payload < 10)
						icon = '<i class="fa fa-thermometer-quarter" aria-hidden="true"></i>'
					else if(payload > 10 && payload < 20 )
						icon = '<i class="fa fa-thermometer-half" aria-hidden="true"></i>'
					else if(payload > 20 && payload < 30)
						icon = '<i class="fa fa-thermometer-three-quarters" aria-hidden="true"></i>'
					else
						icon = '<i class="fa fa-thermometer-full" aria-hidden="true"></i>'

					document.getElementById("temperature").innerHTML =  String(icon) + " " + (payload * 1 + parseInt(f)) + m; // JS is still screwing string to number conversion

				}

			break;

			case 'MQTT_DATA_HUMIDITY':

				if(this.config.showHumidity && !this.config.icons)
					document.getElementById("humidity").innerHTML = this.config.humidity + " " + payload + "%";
				if(this.config.showHumidity && this.config.icons){

					var icon = '<i class="fa fa-tint" aria-hidden="true"></i>'
					document.getElementById("humidity").innerHTML =  String(icon) + " " + payload + "%";

				}

			break;

			default: break;

		}

	},

	getStyles: function() {
		// style.css viene utilizzato per stilizzare gli elementi nel DOM (metodo getDom)
		return ["style.css", "https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css"];
	},

	getDom: function(){

		/*
			Preparazione dei contenitori dei dati:
			per la modifica del DOM è stato utilizzato JavaScript Vanilla,
			ma è possibile integrare jQuery
		*/

    var wrapper = document.createElement("div");
		var temp = document.createElement("div");
		wrapper.setAttribute("id", "con")
		temp.setAttribute("id", "temperature")
		temp.appendChild(document.createTextNode(""));
		var hum = document.createElement("div");
		hum.setAttribute("id", "humidity")
		hum.appendChild(document.createTextNode(""));
		wrapper.appendChild(temp)
		wrapper.appendChild(hum)
		temp.innerHTML = '<i class="fa fa-refresh" id="round" aria-hidden="true"></i>'
		//wrapper.innerHTML = this.config.text + " " + temperature + "°C";
    return wrapper;

  },

});
