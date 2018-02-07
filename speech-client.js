'use strict';
const record = require('node-record-lpcm16');
const Speaker = require('speaker');
const path = require('path');
const GoogleAssistant = require('google-assistant');
const speakerHelper = require('./speaker-helper'); // libreria scritta dall'autore di GoogleAssistant Node
var config = {};
var io = require('socket.io-client');
var socket = io.connect("http://localhost:3030/", {
    reconnection: true
});

socket.on('connect', () => {
    console.log('connected to localhost:3000');
});

socket.on('google_config', data => {

  config = {

    auth: {
      keyFilePath: path.resolve(__dirname, '/path/al/client_secret.json'),
      savedTokensPath: path.resolve(__dirname, 'tokens.json'), // salvataggio tokes utili per l'assistente
    },
    conversation: {
      audio: {
        sampleRateOut: 24000, // default a 24000
      },
      lang: data.language,
      deviceModelId: 'xxxxxxx', // deviceModelID ottenuto durante la Device Registration
      deviceId: 'xxxxxx' // id del dispositivo (Device Registration)
      //textQuery: 'Ciao'// se settata viene ignorato l'input audio ed eseguita questa query
    },

  }

  go();

})

function go(){
  const startConversation = (conversation) => {
    console.log('Puoi parlare.');
    let openMicAgain = false;

    conversation
      .on('audio-data', (data) => {
        speakerHelper.update(data); // buffer
      })

      .on('end-of-utterance', () => record.stop())

      .on('transcription', data => console.log('Transcription:', data.transcription, ' --- Done:', data.done))

      .on('response', text => {

        socket.emit('google', text); // viene mandato il testo di risposta al server, che lo stampa sul mirror
        console.log("-----------> to magicmirror");
        console.log('Assistant Text Response:', text)
      })

      .on('volume-percent', percent => console.log('New Volume Percent:', percent))

      .on('device-action', action => console.log('Device Action:', action))

      .on('ended', (error, continueConversation) => {
        if (error) console.log('Conversation Ended Error:', error);
        else console.log('Conversation Complete');
        openMicAgain = true; // il microfono riceve sempre audio, in ogni caso
      })

      .on('error', (error) => {
        console.log('Conversation Error:', error);
      });


    const mic = record.start({ threshold: 0 });
    mic.on('data', data => conversation.write(data));

    // setup dello speaker
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
  };

  const assistant = new GoogleAssistant(config.auth);
  assistant
    .on('ready', () => {

      assistant.start(config.conversation);
    })
    .on('started', startConversation)
    .on('error', (error) => {
      console.log('Assistant Error:', error);
    });

}
