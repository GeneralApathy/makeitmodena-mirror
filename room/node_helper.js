const NodeHelper = require("node_helper");
const MQTT = require("./mqttclient");

var data;
var mqtt;

module.exports = NodeHelper.create({

  start: function(){

    console.log("Module %s has been loaded", this.name);

  },

  socketNotificationReceived: function(notification, payload) {


    //  I socket ricevuti vengono trattati nel seguente metodo

    if(notification === "MQTT_CONNECTION"){

      console.log("Received MQTT parameters...")

      mqtt = new MQTT(

        payload.username,
        payload.password,
        payload.port,
        payload.host

      ); // costruttore tramite i parametri passati via socket
      mqtt.init()
        .then(client => {

          client.on('message', (topic, message) => {

            // "message" è un buffer, quindi effettuo la conversione utf8

            switch(topic){

              case "sensore/umidita":

                // ovviamente anche node_helper.js può mandare socket all'istanza principale del modulo
                this.sendSocketNotification('MQTT_DATA_HUMIDITY', message.toString())

              break;

              case "sensore/temperatura":

                this.sendSocketNotification('MQTT_DATA_TEMPERATURE', message.toString())

              break;

            }

          })

        })

    }

  }

})
