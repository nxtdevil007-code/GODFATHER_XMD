const fs = require('fs');
const settings = require('../settings');
const dbPath = settings.databasePath;

function loadDb() {
    if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, '{}');
    return JSON.parse(fs.readFileSync(dbPath));
}
function saveDb(db) {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

module.exports = {
    name: 'antidelete',
    aliases: ['ad'],
    async execute({ sock, from, msg, args, isOwner }) {
        if (!isOwner) {
            return sock.sendMessage(from, {
                text: '❌ *Only the owner can use this command!*'
            }, { quoted: msg });
        }

        const db = loadDb();
        db.antidelete = db.antidelete || { enabled: false, mode: 'chat' };

        const option = (args[0] || '').toLowerCase();

        if (option === 'on') {
            db.antidelete.enabled = true;
            saveDb(db);
            return sock.sendMessage(from, {
                text: `╭───「 🛡️ *ANTI-DELETE* 」───
│ ✅ Status: *ENABLED*
│ 📍 Mode: *${db.antidelete.mode.toUpperCase()}*
╰────────────────
🎩 _GODFATHER XMD - Powered by Soham_`
            }, { quoted: msg });
        }

        if (option === 'off') {
            db.antidelete.enabled = false;
            saveDb(db);
            return sock.sendMessage(from, {
                text: `🛡️ *Anti-Delete:* ❌ DISABLED`
            }, { quoted: msg });
        }

        if (option === 'chat') {
            db.antidelete.mode = 'chat';
            saveDb(db);
            return sock.sendMessage(from, {
                text: '✅ Anti-Delete mode set to *CHAT* (recovers in same chat)'
            }, { quoted: msg });
        }

        if (option === 'owner' || option === 'inbox') {
            db.antidelete.mode = 'owner';
            saveDb(db);
            return sock.sendMessage(from, {
                text: '✅ Anti-Delete mode set to *OWNER* (sends to your DM)'
            }, { quoted: msg });
        }

        await sock.sendMessage(from, {
            text: `╭───「 🛡️ *ANTI-DELETE MENU* 」───
│ ${settings.prefix}antidelete on
│ ${settings.prefix}antidelete off
│ ${settings.prefix}antidelete chat
│ ${settings.prefix}antidelete owner
╰────────────────

📊 *Current Status:*
• Enabled: ${db.antidelete.enabled ? '✅' : '❌'}
• Mode: ${db.antidelete.mode.toUpperCase()}

🎩 _GODFATHER XMD_`
        }, { quoted: msg });
    }
};