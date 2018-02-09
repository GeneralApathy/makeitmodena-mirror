'use strict';
const record = require('node-record-lpcm16');
const Speaker = require('speaker');
const path = require('path');
const GoogleAssistant = require('google-assistant');
const speakerHelper = require('./speaker-helper'); // libreria scritta dall'autore di GoogleAssistant Node
const child_process = require('child_process');
const gpio = require('rpi-gpio'); // modulo per controllare il GPIO di RaspBerry Pi
var config = {};
var io = require('socket.io-client');
var socket = io.connect("http://localhost:3030/", {
    reconnection: true
});
var pressed = false;
var commands = {

  /*
    dentro questo oggetto vengono definiti tutti i comandi che l'assistente può eseguire
    la sintassi è semplicemente: comando: ['che cosa accendo']
  */


  accendi: ['luce'], // qui andranno tutte le cose "accendibili"
  avvia: ['browser'] // qui andranno tutte le cose avviabili (software)
  // altre keys a piacere
}
var what = {

  /*
   qui sotto il codice viene eseguito,
   basta definire una funzione che ha come nome uno degli argomenti prima definiti (ad esempio luce o browser) e poi definirne il comportamento
  */
  luce: () => {

    console.log("sto accendendo la luce...")
    // processo di accensione luce

  },

  browser: () => {

    console.log("Sto avviando il browser...")
    // avvia il browser
    var browse = child_process.spawn('chromium-browser') // raspberryPi ha chromium integrato

    browse.on('data', (stuff) => {

      console.log(stuff); // debug di chromium

    })

  }

}

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

  gpio.on('change', function(channel, value) {
    // quando nota che il PIN5 è stato modificato (quindi bottone premuto) allora fa partire l'assistente
      if(!pressed){
        if(value){
          go();
          pressed = true; // variabile utile per evitare frequenti pressioni del tasto
        }
      }
  });
  gpio.setup(5, gpio.DIR_IN, gpio.EDGE_FALLING);

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

      .on('transcription', data => {

        console.log('Transcription:', data.transcription, ' --- Done:', data.done)
        var transcr = data.transcription.split(' '); // ogni parola della frase detta
        if(data.done && transcr.length >= 2){
          var command = transcr[0].toLowerCase(); // comando da eseguire, si trova nell'oggetto 'commands'
          var execute = transcr[1].toLowerCase(); // quello che c'è da eseguire

          if(!commands.hasOwnProperty(command) || !what.hasOwnProperty(execute))
            console.log("comando inesistente.") // se quello che viene detto è un'altra cosa allora ciao
          else{
            var index = commands[command].indexOf(execute);
            var whatToDo = commands[command][index];
            what[whatToDo](); // è una funzione da eseguire che fa parte di un oggetto
            /*
              spiegazione:
              commands è un oggetto che contiene tante proprietà (che sono i comandi, ovvero la prima parola detta)
              coi corrispondenti argomenti (ovvero la seconda parola detta).
              se esistono sia il comando che l'argomento allora esegue il comando (vai a linea 16 per sapere come accade tutto questo),
              altrimenti continua normalmente
            */
          }

        }

      })

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
