import * as fs from 'fs';
import {
	WAConnection,
	ReconnectMode,
	MessageType,
	waChatKey,
} from '@adiwajshing/baileys';

export interface IConnectionOptions {
	logLevel: 'info' | 'debug' | 'error';
	pinnedChatsFirst: boolean;
	sessionFile: string;
}

export interface IMessage {
	receiver: 'me' | string;
	sender: 'me' | string;
	message: (string | null);
}

export interface IContact {
	jid: string;
	displayName: string;
}

export async function createConnection(options: IConnectionOptions): Promise<WAConnection> {

	const conn = new WAConnection();
	conn.autoReconnect = ReconnectMode.onConnectionLost;

	conn.logger.level = options.logLevel;
	conn.connectOptions.maxRetries = 10;
	conn.chatOrderingKey = waChatKey(options.pinnedChatsFirst);

	if (fs.existsSync(options.sessionFile)) {
		conn.loadAuthInfo(options.sessionFile);
	}

	await conn.connect();

	const authInfo = conn.base64EncodedAuthInfo();

	fs.writeFileSync(options.sessionFile, JSON.stringify(authInfo, null, "\t"));

	return conn;
}

export abstract class Bot {

	protected contacts: IContact[] = [];

	constructor(private connection: WAConnection) {
	}

	abstract onMessageReceived(message: IMessage): void;

	onChatsReceived(): void {
	}

	sendMessage(message: string, receiver: string) {
		this.connection.sendMessage(receiver, message, MessageType.text);
	}

	listen() {
		this.connection.on("contacts-received", async ({ updatedContacts }) => {
			Object.keys(updatedContacts).forEach((key) => {
				if (this.contacts.find(c => c.jid === updatedContacts[key].jid)) {
					return;
				}
				this.contacts.push({
					jid: updatedContacts[key].jid,
					displayName: updatedContacts[key].name,
				});
				this.onChatsReceived();
			});
		});
		this.connection.on("chat-update", async (chat) => {
			if (!chat.hasNewMessage) {
				return;
			}
			const messageObject = chat.messages.all()[0]; // pull the new message from the update
			const realMessage = messageObject.message.conversation == "" ? messageObject.message.extendedTextMessage.text ?? '' : messageObject.message.conversation;
			this.onMessageReceived({
				message: realMessage,
				sender: messageObject.key.fromMe ? 'me' : messageObject.key.remoteJid,
				receiver: messageObject.key.fromMe ? messageObject.key.remoteJid : 'me',
			});
		});
	}
}

