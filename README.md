# MakeItModena Mirror
Documentazione del progetto riguardante MagicMirror @ MakeItModena.

### Premessa:
L'obiettivo di questo progetto è quello di creare uno "specchio intelligente" capace di ottenere informazioni dal web e di essere controllato tramite comando vocale.
Come base è stato utilizzato [MagicMirror](https://github.com/MichMich/MagicMirror), un software open source sviluppato in Node.js.
Il progetto è stato sviluppato con Node v9.4.0.
**N.B**: tutti i comandi che iniziano con `npm` vanno eseguiti all'interno della cartella di MagicMirror.

----
### Installazione di MagicMirror
E' possibile installare MagicMirror tramite i seguenti comandi:
```
wget https://raw.githubusercontent.com/MichMich/MagicMirror/master/installers/raspberry.sh

./raspberry.sh
```
L'installazione richiederà circa 5 minuti (su Raspberry Pi).

----
### Moduli:
(Fare riferimento alla [documentazione ufficiale](https://github.com/MichMich/MagicMirror/tree/master/modules)).
Saranno descritti i moduli presenti in questa repository, ovvero `room` e `speech` (`modules/default/room|speech`)
Il codice di entrambi è commentato, pertanto è possibile scaricarlo direttamente dalla repo e modificarlo.
Essendo moduli di default (perché l'obiettivo finale è quello di fornire una versione di MagicMirror personalizzata), i nomi dei moduli vanno registrati in `modules/default/defaultmodules.js`

### `room`
Il modulo fornisce un'implementazione personalizzabile del protocollo MQTT per la rilevazione di temperature e altri dati telemetrici.
La struttura del modulo è abbastanza semplice, il codice, come già detto, è commentato.
- Dipendenze
	`npm install --save mqtt`

- *Configurazione del modulo `room`* <br>
Per configurare il modulo, bisognerà aprire il file `config/config.js`.
<br>
La configurazione di default sarà la seguente: 

```
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
topic_temperature: 'sensore/temperatura', // topic dal quale viene ricavata la temperatura
topic_humidity: 'sensore/umidita' // topic dal quale viene ricavata l'umidità
```

Modificando i valori a piacere (e in base alle esigenze) si potrà configurare correttamente il proprio sensore MQTT, che invierà i dati al modulo `room`.

<br><br>
### `speech`
Il modulo fornisce un'implementazione personalizzabile di Google Assistant sulla propria versione di MagicMirror.
A differenza di `room` questo modulo è più complicato da realizzare, per via dell'integrazione con la GoogleAssistantAPI.
- *Creazione di un'utenza per l'API*
	Registrarsi presso [il seguente indirizzo](https://developers.google.com/assistant/sdk/guides/service/python/embed/config-dev-project-and-account) per configurare il proprio account da sviluppatore e successivamente [registrare il proprio device](https://developers.google.com/assistant/sdk/reference/device-registration/register-device-manual), in questo caso, il Raspberry Pi3.
La creazione dell'account da sviluppatore è molto intuitiva e semplice, per la registrazione del device, invece, qui sotto si potranno trovare piccoli aiuti che faranno risparmiare tempo in caso di difficoltà.
- *Installazione di un Python Virtual Environment*
Python Virtualenviroment è richiesto per l'installazione dei moduli dell'SDK di GoogleAssistant.
**N.B**: La versione di Python utilizzata è la *3*.
	1) Installare `python3-pip`: `sudo apt-get install python3-pip`
	2) Installare `virtualenv`: `python3 -m pip install --user virtualenv`
	3) Creare una cartella per il progetto GoogleAssistant: `mkdir esempio && cd esempio`
	4) Creare un nuovo virtualenv (dentro la cartella appena creata): `python3 -m virtualenv env`
	5) Attivare il virtualenv: `source env/bin/activate` (una volta attivato si può notare come sia apparita un prefisso `(env)` prima dell'hostname.
	Ora è possibile seguire la guida di Google Assistant per la registrazione di un dispositivo
- *Registrare il device*
	1) Seguire [Get an access token](https://developers.google.com/assistant/sdk/reference/device-registration/register-device-manual#get-access-token)
	2) Seguire [Define and register the device model](https://developers.google.com/assistant/sdk/reference/device-registration/register-device-manual#register-model)
	3) Seguire [Define and register a device istance](https://developers.google.com/assistant/sdk/reference/device-registration/register-device-manual#register-instance)
	Ottimo! è ora possibile installare il module di Google Assistant:
	`npm install --save google-assistant`
- *google-assistant: configurazione e troubleshooting*
Il modulo in questione non è molto seguito dalla community di _npm_, pertanto la documentazione sulla sua configurazione scarseggia.
Installare i seguenti moduli:
- `npm install --save speaker`
- `npm install --save node-record-lpcm16`
Per sicurezza, installare il seguente pacchetto: `sudo apt-get install sox` per la registrazione dell'audio ([link](https://packages.debian.org/it/sid/sox)).
Fare successivamente riferimento a [questo script](https://github.com/endoplasmic/google-assistant/blob/master/examples/mic-speaker.js) per provare a utilizzare google-assistant.
- *Finalmente il modulo `speech`*
	E' finalmente possibile utilizzare anche il modulo `speech` all'interno del proprio progetto di MagicMirror.<br>
	Anche questo modulo è commentato ed è pronto all'uso su questa repository.<br>

	Per utilizzarlo correttamente è necessario eseguire `speech-client.js` (che si trova nella repo), dato che non è stato possibile fare un'integrazione diretta nel mirror, perché a quanto pare ci sono problemi di utilizzo del microfono, pertanto è stato necessario creare una comunicazione tramite sockets.
	`speech.js` (che si trova nei moduli di MagicMirror) è il server, che riceve i dati dal client (ovviamente).




Emiliano Maccaferri - 06/02/2018 - https://emilianomaccaferri.com - Per qualsiasi informazione: inbox@emilianomaccaferri.com
