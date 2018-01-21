require('dotenv').config();
const Eris = require('eris');
const SpeechService = require('ms-bing-speech-service');
const pcm = require('pcm-util');

console.log('Starting...');

const bot = new Eris(process.env.DISCORD_BOT_TOKEN);
const recogniser = new SpeechService({
  language: 'en-US',
  subscriptionKey: process.env.BING_SPEECH_API_KEY,
});
const utterances = {};

bot.on('ready', () => {
  console.log('> Bot ready');
});

bot.on('messageCreate', message => {
  if (message.content === '/join') {
    // Only try to join the sender's voice channel
    // if they are in one themselves
    if (message.member.voiceState.channelID) {
      bot
        .joinVoiceChannel(message.member.voiceState.channelID)
        .then(connection => {
          // We've connected to the uses channel
          message.addReaction('👍');
          console.log('>> Channel joined');

          connection.on('speakingStart', userId => {
            utterances[userId] = [];
          });
          connection.on('speakingEnd', userId => {
            // sort the buffers
            // turn them into a stream
            // recogniser.sendStream(stream)
          });
          // Start recieving the audio data
          const listener = connection.receive('pcm');
          listener.on('data', audioBuffer => {});
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

// Start connect to recogniser service
recogniser
  .start()
  .then(a => {
    console.log('> Recogniser ready');
    recogniser.on('repognition', e => {
      console.log(e);
    });
    bot.connect();
  })
  .catch(error => console.error('> Error connecting to Bing', error));
