const NodeHelper = require("node_helper");
var Speech = require("./assistant");
const record = require('node-record-lpcm16');
const Speaker = require('speaker');
const speakerHelper = require('./speaker-helper');
const fs = require("fs")

module.exports = NodeHelper.create({

  start: function(){

    console.log("Module %s has been loaded", this.name);

  },

  socketNotificationReceived: function(notification, payload) {

    if(notification === "SPEECH_DEFAULTS"){
      // configurazione dell'assistente
      console.log("Received Speech parameters...")
      console.log(payload.language)
      var speech = new Speech(payload.language);

      speech.init()
        .then((stuff) => {

          // 'stuff' contiene il necessario per poter iniziare ad usare l'assistente
          var conversation = stuff.conversation,
              assistant = stuff.assistant,
              config = stuff.config,
              //shouldContinue = false; // questa variabile viene usata (non testato) per verificare che sia stata la parola che attiva l'assistente

          console.log("Speech module has been started!");
            var openMicAgain = false;

            conversation
              .on('audio-data', (data) => {
                speakerHelper.update(data);
              })

              .on('end-of-utterance', () => record.stop())

              .on('transcription', (data) => {

                /*if(data.transcription.includes("mirror").toLowerCase())
                  shouldContinue = true;*/

              })

              .on('response', (text) => {

                /*if(!shouldContinue)
                  return false;*/

                console.log("Response: %s", text);
                // la risposta viene mandata all'istanza principale
                this.sendSocketNotification('ASSISTANT_MESSAGE', text)

              })

              .on('volume-percent', percent => console.log('New Volume Percent:', percent))

              .on('device-action', action => console.log('Device Action:', action))

              .on('ended', (error, continueConversation) => {
                if (error){
                   console.log('Conversation Ended Error:', error);
                   assistant.start(config.conversation);
                 }
                else if (continueConversation) openMicAgain = true;
                else console.log('Conversation Complete');
              })

              .on('error', (error) => {
                console.log('Conversation Error:', error);
                assistant.start(config.conversation);
              });

            const mic = record.start({ sampleRate: 16000, threshold: 0, recordProgram: 'rec', device: 'hw:1,0' })
              //.pipe(file);

            mic.on('data', data => {
              //console.log(data)
              conversation.write(data)
            });

            // setup dello speaker, tramite il quale l'assistente ci risponde
            const speaker = new Speaker({
              channels: 1,
              sampleRate: config.conversation.audio.sampleRateOut,
            });
            speakerHelper.init(speaker);
            speaker
              .on('open', () => {
                console.log('Assistant Speaking');
                speakerHelper.open();
              })
              .on('close', () => {
                console.log('Assistant Finished Speaking');
                openMicAgain = true;
                if (openMicAgain) assistant.start(config.conversation);
              });

        })

  }

  }

})
