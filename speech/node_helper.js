// server

// Il server ascolta sulla porta 3030 e riceve i dati da speech-client.js

const socket = require("socket.io").listen(3030);
const NodeHelper = require("node_helper");
var config;

module.exports = NodeHelper.create({

  start: function() {

    socket.on('connection', (sock) => {
      console.log("%s has connected", sock.client.id);
      socket.emit('google_config', config); // non appena si connette un client, il server gli manda la lingua dell'assistente
      sock.on('google', (response) => {
        console.log(response)
        this.sendSocketNotification("ASSISTANT_MESSAGE", response)
      })
    })

  },

  socketNotificationReceived: function(notification, payload) {

    if(notification === "SPEECH_DEFAULTS"){
      config = payload; // utile per la configurazione
    }

  }

})
