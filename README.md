<div align="center">

# WhatzBot

## The best WhatsApp Bot framework out there

Create a WhatsApp bot **without any browser simulation**. Use it like an cli
with a clean code architecture.

</div>

## Usage

```sh
$ npm install whatzbot
```

```typescript
import {createBot, IMessage, ISender, IBot} from 'whatsbot';

const bot = createBot({logLevel: "info", pinnedChatsFirst: false, sessionFile: './auth_info.json'});

// bot.messages returns the initial messages and initial chats
const messages = bot.messages;

// Bare metal message handling
bot.subscribe("message-received", (message: IMessage, sender: ISender) => {
    // Triggered when a new message was received.
});

bot.subscribe("presence-updated", (sender: ISender) => {
    // When the recipient turns online, offline, or started typing.
});

// If you plan to create commands use a command handler
// availableForMe will handle sent messages as commands aswell. Default: false
const diceGameCommandHandler = createCommandHandler('!dice', {availableForMe: true});
diceGameCommandHandler.addSubCommand({
    subCommand: 'roll',
    paramsRequired: 0,
    handle: (params: string[], bot: IBot): string => {
	// returned string will be sent to the sender
	// return null if you don't want to send anything
	return params[0];
    },
});

// make the bot use the diceGameCommandHandler
bot.registerCommandHandler(diceGameCommandHandler);

// When I start the bot now I'll be able to receive a message

```

<div align="center">

Made with love and Typescript

</div>
