import { Bot, createConnection, IMessage } from './bot';
import { WAConnection } from '@adiwajshing/baileys';
import { exec } from 'child_process';
import * as express from 'express';
import * as bodyparser from 'body-parser';

// Creates an API server to retrieve contact information
// And send a message to a specified contact.
export class WhatsAppTerm extends Bot {
	constructor(connection: WAConnection) {
		super(connection);
		const app = express();
		app.use(bodyparser.json());
		app.get('/contacts', (_, res) => {
			res.json(this.contacts.filter(c => c.displayName != null));
		});
		app.post('/send', (req, res) => {
			let repeat = req.body.repeat;
			if (repeat == null || repeat == "") {
				repeat = 1;
			}
			for (let i = 0; i < repeat; i++) {
				this.sendMessage(req.body.message, req.body.jid);
			}
			res.json("OK");
		});
		app.listen(5000, () => {
			console.log("started api")
		});
	}

	onMessageReceived(msg: IMessage) {
		if (msg.sender == 'me')
			return;
		const senderDisplayName = this.contacts.find(c => c.jid == msg.sender).displayName;
		const command = `dunstify '${senderDisplayName}' "${msg.message}"`;
		exec(command);
	}
}

async function start() {
	const connection = await createConnection({
		logLevel: 'info',
		pinnedChatsFirst: true,
		sessionFile: './auth_info.json'
	});
	const mBot = new WhatsAppTerm(connection);
	mBot.listen();
}

start();
