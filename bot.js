require('dotenv').config();
const Eris = require('eris');
const SpeechService = require('ms-bing-speech-service');

async function main() {
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

  bot.on('messageCreate', async message => {
    if (message.content === '/listen') {
      // Only try to join the sender's voice channel
      // if they are in one themselves
      if (message.member.voiceState.channelID) {
        const { name: channelName } = bot.getChannel(
          message.member.voiceState.channelID
        );
        const connection = await bot.joinVoiceChannel(
          message.member.voiceState.channelID
        );
        if (connection) {
          // We've connected to the uses channel
          message.addReaction('👍');
          console.log(`>> Joined: ${channelName}`);

          connection.on('speakingStart', userId => {
            utterances[userId] = [];
          });
          connection.on('speakingEnd', userId => {
            console.log(userId);
            // Sort the buffers
            // Turn them into a stream
            // Recogniser.sendStream(stream)
          });
          // Start recieving the audio data
          const listener = connection.receive('pcm');
          listener.on('data', audioBuffer => {
            console.log(audioBuffer);
          });
        } else {
          message.addReaction('👎');
        }
      } else {
        message.addReaction('👎');
      }
    }
    if (message.content === '/stop') {
      if (message.member.voiceState.channelID) {
        try {
          bot.leaveVoiceChannel(message.member.voiceState.channelID);
        } catch (err) {
          // This errors because receieveStream has no destroy fn
        }
      }
    }
  });

  // Start recogniser service
  try {
    await recogniser.start();
    console.log('> Recogniser ready');
    recogniser.on('repognition', e => {
      console.log(e);
    });
    bot.connect();
  } catch (error) {
    console.error('> Error connecting to Bing', error);
  }
}

main();
