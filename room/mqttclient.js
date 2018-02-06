const mqtt = require("mqtt");
const Promise = require("promise")

var MQTT = function(username, password, port, host){

  this.username = username;
  this.password = password;
  this.host = host;
  this.port = port;

  this.init = function(){

    // Promise che risolve il client finale, che viene utilizzato per la trasmissione dei dati
    return new Promise(

      (resolve, reject) => {

        console.log("Initiating MQTT...")

        // fare riferimento a https://www.npmjs.com/package/mqtt

        var client = mqtt.connect({

          username: this.username,
          password: this.password,
          port: this.port,
          host: this.host

        });

        client.on('connect', function(){

          console.log("MQTT client has been created successfully!");

          // configurare questi topic
          client.subscribe("sensore/temperatura");
          client.subscribe("sensore/umidita");

          return resolve(client);

        })


      }

    )

  }

}

module.exports = MQTT;
