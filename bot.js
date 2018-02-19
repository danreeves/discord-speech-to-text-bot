require('dotenv').config();
const { Transform } = require('stream');
const Discord = require('discord.js');
const SpeechService = require('ms-bing-speech-service');

async function main() {
  console.log('Starting...');

  const bot = new Discord.Client();
  const recogniser = new SpeechService({
    language: 'en-US',
    subscriptionKey: process.env.BING_SPEECH_API_KEY,
  });

  bot.on('ready', () => {
    console.log('> Bot ready');
  });

  bot.on('message', async message => {
    if (message.content === '/listen') {
      if (message.member.voiceChannel) {
        const channel = message.member.voiceChannel;
        const { name: channelName } = channel;
        const connection = await channel.join();

        if (connection) {
          message.react('👍');
          console.log(`>> Joined: ${channelName}`);

          connection.on('authenticated', console.log);
          connection.on('debug', console.log);
          connection.on('disconnect', console.log);
          connection.on('error', console.log);
          connection.on('failed', console.log);
          connection.on('newSession', console.log);
          connection.on('ready', console.log);
          connection.on('reconnecting', console.log);
          connection.on('warn', console.log);

          const receiver = connection.createReceiver();
          receiver.on('debug', console.log);

          const voiceStream = receiver.createStream(message.member, {
            mode: 'opus',
          });

          let utteranceStream;

          connection.on('speaking', async (user, isSpeaking) => {
            if (isSpeaking) {
              console.log(`${user.tag} started speaking`);
              // Create a temp stream to store the current utterance
              utteranceStream = new Transform({
                transform(chunk, encoding, callback) {
                  this.push(chunk);
                  callback();
                },
              });
              // Start sending the voice stream there
              voiceStream.pipe(utteranceStream);
            } else {
              console.log(`${user.tag} stopped speaking`);
              if (utteranceStream) {
                // Stop sending the voice stream into the utterance
                voiceStream.unpipe(utteranceStream);
                // End the utterance stream
                utteranceStream.end();
                // Echo through Discord
                connection.play(utteranceStream, {
                  type: 'opus',
                  volume: false,
                });
                try {
                  const resp = await recogniser.sendStream(utteranceStream);
                  console.log('bing resp', resp);
                  // console.log(recogniser.telemetry);
                } catch (err) {
                  console.log('bing err', err);
                }
              }
            }
          });
        } else {
          message.react('👎');
        }
      } else {
        message.react('👎');
      }
    }
    if (message.content === '/stop') {
      if (message.member.voiceChannel) {
        const channel = message.member.voiceChannel;
        const { name: channelName } = channel;
        console.log(`>> Leaving: ${channelName}`);
        channel.leave();
      }
    }
  });

  recogniser.on('recognition', e => {
    console.log(e);
  });

  // Start the Discord bot
  bot.login(process.env.DISCORD_BOT_TOKEN);

  // Start recogniser service
  try {
    await recogniser.start();
    console.log('> Recogniser ready');
  } catch (error) {
    console.error('> Error connecting to Bing', error);
  }
}

main();
