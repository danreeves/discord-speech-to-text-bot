require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Transform } = require('stream');
const Discord = require('discord.js');
const SpeechService = require('ms-bing-speech-service');
const ffmpeg = require('fluent-ffmpeg');

ffmpeg.setFfmpegPath(path.resolve(__dirname, 'node_modules', '.bin', 'ffmpeg'));
ffmpeg.setFfprobePath(
  path.resolve(__dirname, 'node_modules', '.bin', 'ffprobe')
);

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

          const voiceStream = receiver.createOpusStream(message.member.user);
          voiceStream.on('data', chunk => {
            console.log(`Received ${chunk.length} bytes of data.`);
          });

          try {
            const out = fs.createWriteStream('./audio.wav');
            ffmpeg(voiceStream)
              .inputFormat('s32le')
              .audioFrequency(16000)
              .audioChannels(1)
              .audioCodec('pcm_s16le')
              .format('s16le')
              .on('error', console.error.bind(console))
              .pipe(out);
          } catch (error) {
            console.log(error);
          }
          // let utteranceStream;
          // let file;

          // connection.on('speaking', async (user, isSpeaking) => {
          // if (isSpeaking) {
          // console.log(`${user.tag} started speaking`);
          // // Create a temp stream to store the current utterance
          // // utteranceStream = new Transform({
          // // transform(chunk, encoding, callback) {
          // // this.push(chunk);
          // // callback();
          // // },
          // // });
          // file = fs.createWriteStream('./audiodata.pcm');
          // // Start sending the voice stream there
          // voiceStream.pipe(file);
          // } else {
          // console.log(`${user.tag} stopped speaking`);
          // if (file) {
          // voiceStream.unpipe(file);
          // file.end();
          // connection.playFile('./audiodata.pcm');
          // }
          // if (utteranceStream) {
          // // Stop sending the voice stream into the utterance
          // voiceStream.unpipe(utteranceStream);
          // // End the utterance stream
          // utteranceStream.end();

          // connection.playFile('./audiodata.pcm');

          // try {
          // const resp = await recogniser.sendStream(utteranceStream);
          // console.log('bing resp', resp);
          // // console.log(recogniser.telemetry);
          // } catch (err) {
          // console.log('bing err', err);
          // }
          // }
          // }
          // });
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

  // Start the Discord bot
  bot.login(process.env.DISCORD_BOT_TOKEN);

  // Start recogniser service
  try {
    await recogniser.start();
    console.log('> Recogniser ready');
    recogniser.on('recognition', e => {
      console.log(e);
    });
    recogniser.on('close', () => {
      console.log('Speech API connection closed');
    });
    recogniser.on('error', error => {
      console.log(error);
    });
  } catch (error) {
    console.error('> Error connecting to Bing', error);
  }
}

main();
