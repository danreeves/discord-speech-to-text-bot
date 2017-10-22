const bot = require('discord.js').Client;
const SpeechService = require('ms-bing-speech-service');
const { last } = require('lodash');

const recogniser = new SpeechService({
  language: 'en-US',
  subscriptionKey: process.env.BING_SPEECH_API_KEY
});

bot.on('ready', () => console.log('🤖 Ready'));

bot.on('message', message => {
  // Voice only works in guilds, if the message does not come from a guild,
  // we ignore it
  if (!message.guild) return;

  if (message.content === '/join') {
    // Only try to join the sender's voice channel if they are in one themselves
    if (message.member.voiceChannel) {
      message.member.voiceChannel.join()
        .then(connection => { // Connection is an instance of VoiceConnection
          message.reply('I have successfully connected to the channel!');
        })
        .catch(console.log);
    } else {
      message.reply('You need to join a voice channel first!');
    }
  }
});

bot.login(process.env.DISCORD_BOT_TOKEN);
