const { ReadableStreamBuffer } = require('stream-buffers');
const Eris = require('eris');
const SpeechService = require('ms-bing-speech-service');
const { last } = require('lodash');

const bot = new Eris(process.env.DISCORD_BOT_TOKEN);
const recogniser = new SpeechService({
  language: 'en-US',
  subscriptionKey: process.env.BING_SPEECH_API_KEY
});

bot.on('ready', () => {
    console.log('🤖 Ready');

    const server = last(bot.guilds.filter(g => g.name === 'MSN Messenger')); // This is the name of my Discord server, 
                                                                             // because bots can be members of multiple "guilds"
                                                                             // You should change this to the name of your server

    const voiceChannel = last(server.channels.filter(c => c.name === 'MSN Notification')); // This is the name of the channel I want the bot to join

  
    bot.joinVoiceChannel(voiceChannel.id).then(voiceConnection => {
        console.log('📞 Joined', voiceChannel.name);
        
        // Log errors
        voiceConnection.on('error', console.log.bind(console));
        // Log warnings
        voiceConnection.on('warn', console.log.bind(console));
        // Log info
        voiceConnection.on('debug', console.log.bind(console));
      
        voiceConnection.setVolume(1);
      
        // This is our audio connection to discord
        // It's an EventEmitter that emits data events containing a Buffer of audio
        const audioEmitter = voiceConnection.receive('pcm');
      
        let audioStream = new ReadableStreamBuffer({
          frequency: 960,   // in milliseconds.
          chunkSize: 3840   // in bytes.
        });
      
        audioEmitter.on('data', (...args) => {
          const [ data, userID, timestamp, sequence ] = args;
          audioStream.put(data);
        });
      
      
        
//         recogniser.start((err, service) => {
//           if (err) {
//             console.warn(err);
//             return;
//           }
          
//           console.log('🎤 Starting Speech Service')
          
//           service.on('recognition', recognitionEvent => {
//             console.log(recognitionEvent)
//           })
//           service.on('error', (error) => {
//             console.log(error);
//           });
//           service.on('close', () => {
//             console.log('Speech API connection closed');
//           });
  
//           recogniser.sendStream(audioStream);

//         });
      
    });
});

bot.connect();
