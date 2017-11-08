`NOTE: It doesn't work yet :(`

# Discord Speech to Text Bot 🎤

A Discord bot that uses the Bing Speech to Text API to transcribe what's said.

For a simpler example see: [discord-bot-example](https://glitch.com/~discord-bot-example)

## Prerequisites

You'll need:
 - A [Discord account](https://discordapp.com/register)
 - Permission to add accounts to a server, or your own server

## Steps to set up:

1. Create an App here: [https://discordapp.com/developers/applications/me](https://discordapp.com/developers/applications/me)
2. Create an App Bot User for your App by clicking "Create a Bot User"
3. Add the App Bot User to your Discord server using this link: `https://discordapp.com/oauth2/authorize?&client_id=<CLIENT ID>&scope=bot&permissions=0` replacing `<CLIENT_ID>` with the Client ID found on the page of your App
4. Set the `DISCORD_BOT_ID` value in `.env` using the A[[ Bot User token ("click to reveal" in the App page under the bot username)

## The code

Check out `server.js` to see how it works ✨

We're using the [Eris](https://npm.im/eris) library to interact with the Discord API.

If it's working you should see "Ready!" in the logs.
