const Eris = require('eris');
const SpeechService = require('ms-bing-speech-service');
const pcm = require('pcm-util');

console.log('Starting...')

const bot = new Eris(process.env.DISCORD_BOT_TOKEN);
const recogniser = new SpeechService({
  language: 'en-US',
  subscriptionKey: process.env.BING_SPEECH_API_KEY
});

bot.on('ready', () => {
  console.log('🤖 Ready');
});

bot.on('messageCreate', message => {
  if (message.content === '/join') {
    // Only try to join the sender's voice channel if they are in one themselves
    if (message.member.voiceState.channelID) {
      bot.joinVoiceChannel(message.member.voiceState.channelID)
      .then(connection => { 
        message.addReaction('👍');
        console.log('Channel joined')
        const listener = connection.receive('pcm');
        listener.on('data', audioBuffer => {
          if (audioBuffer.toJSON().data.some(n => n)) {
            const currentFormat = pcm.format(audioBuffer);
            const formattedBuffer = Buffer.from(pcm.convert(audioBuffer, currentFormat, pcm.normalize({ channels: 1, bitDepth: 16, sampleRate: 16000 })))
            console.log(pcm.format(formattedBuffer))
            console.log('💌 Sending audio', formattedBuffer)
            recogniser.sendFile(formattedBuffer);
          }
        })
      })
      .catch(err => {
        console.log(err);
        message.addReaction('👎');
      });
    } else {
      message.addReaction('👎');
    }
  }
});

recogniser.start()
  .then((a) => {
    console.log('🗣️ Ready')
    recogniser.on('recognition', (e) => {
      console.log(e);
    });

    bot.connect();
  
  })
 .catch(console.error);