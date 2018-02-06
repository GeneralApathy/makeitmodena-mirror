'use strict';

const record = require('node-record-lpcm16');
const Speaker = require('speaker');
const path = require('path');
const GoogleAssistant = require('google-assistant');
const speakerHelper = require('./speaker-helper');

const config = {
  auth: {
    keyFilePath: path.resolve('/path/to/clientsecret.json'), // durante la registrazione del device
    savedTokensPath: path.resolve(__dirname, 'tokens.json'), // tokens utili al modulo
  },
  conversation: {
    audio: {
      sampleRateOut: 24000,
    },
    lang: 'it-IT',
    //textQuery: 'Che ore sono?' // se viene definito questo valore l'assistente ignora l'input audio e si concentra a rispondere a questa query.
  },
};

var Speech = function(language){

  this.lang = language;

}

Speech.prototype.init = () => {

  // Promise che risolve al GoogleAssistant client
  return new Promise(

    (resolve, reject) => {

      const assistant = new GoogleAssistant(config.auth);
      assistant
        .on('ready', () => {

          assistant.start(config.conversation);

        })
        .on('started', (conversation) => {

          console.log(conversation)
          return resolve({conversation: conversation, assistant: assistant, config: config})

        })
        .on('error', (error) => {
          console.log('Assistant Error:', error);
        });

    }

)

}

module.exports = Speech;
