const { saveMessage, handleDelete } = require('./lib/antiDeleteHandler');
const fs = require('fs');
const path = require('path');
const settings = require('./settings');

const commands = new Map();

// Load all commands
const commandsPath = path.join(__dirname, 'commands');
fs.readdirSync(commandsPath).forEach(file => {
    if (file.endsWith('.js')) {
        const cmd = require(path.join(commandsPath, file));
        if (cmd.name) commands.set(cmd.name, cmd);
        if (cmd.aliases) cmd.aliases.forEach(a => commands.set(a, cmd));
    }
});

console.log(`✅ Loaded ${commands.size} commands`);

async function handleMessage(sock, msg) {
    try {
        // 🛡️ ANTI-DELETE: store all messages
        saveMessage(msg);

        // 🛡️ Detect deletions (revoke)
        if (msg.message?.protocolMessage?.type === 0) {
            await handleDelete(sock, msg);
            return;
        }

        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const isGroup = from.endsWith('@g.us');
        const body =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text ||
            msg.message.imageMessage?.caption ||
            msg.message.videoMessage?.caption || '';

        if (!body.startsWith(settings.prefix)) return;

        const args = body.slice(settings.prefix.length).trim().split(/ +/);
        const cmdName = args.shift().toLowerCase();
        const command = commands.get(cmdName);
        if (!command) return;

        const isOwner = sender === settings.ownerNumber;
        await command.execute({
            sock, msg, from, sender, isGroup, args, body, isOwner, settings
        });
    } catch (err) {
        console.error('Message handler error:', err);
    }
}