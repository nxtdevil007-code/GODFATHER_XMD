const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const settings = require('../settings');

// In-memory cache of recent messages
const messageStore = new Map();

function loadDb() {
    if (!fs.existsSync(settings.databasePath)) {
        fs.writeFileSync(settings.databasePath, '{}');
    }
    return JSON.parse(fs.readFileSync(settings.databasePath));
}

/**
 * Save every incoming message so we can recover it if deleted
 */
function saveMessage(msg) {
    try {
        if (!msg.key || !msg.key.id || !msg.message) return;
        // Ignore protocol/revoke messages
        if (msg.message.protocolMessage) return;

        messageStore.set(msg.key.id, {
            key: msg.key,
            message: msg.message,
            sender: msg.key.participant || msg.key.remoteJid,
            from: msg.key.remoteJid,
            timestamp: Date.now()
        });

        // Auto-cleanup: keep last 1000 messages or messages younger than 1 hour
        if (messageStore.size > 1000) {
            const firstKey = messageStore.keys().next().value;
            messageStore.delete(firstKey);
        }
    } catch (e) {
        console.log('AntiDelete save error:', e.message);
    }
}

/**
 * Handle a delete (revoke) event
 */
async function handleDelete(sock, msg) {
    try {
        const db = loadDb();
        if (!db.antidelete?.enabled) return;

        const protocol = msg.message?.protocolMessage;
        if (!protocol || protocol.type !== 0) return; // type 0 = REVOKE

        const deletedKey = protocol.key;
        if (!deletedKey?.id) return;

        const original = messageStore.get(deletedKey.id);
        if (!original) {
            console.log('⚠️ Deleted message not found in cache.');
            return;
        }

        const deletedBy = msg.key.participant || msg.key.remoteJid;
        const fromChat = original.from;
        const sender = original.sender;
        const mode = db.antidelete.mode || 'chat';
        const target = mode === 'owner' ? settings.ownerNumber : fromChat;

        const isGroup = fromChat.endsWith('@g.us');
        let chatName = fromChat;
        if (isGroup) {
            try {
                const meta = await sock.groupMetadata(fromChat);
                chatName = meta.subject;
            } catch {}
        }

        const header = `╭───「 🛡️ *ANTI-DELETE* 」───
│ 👤 *Sender:* @${sender.split('@')[0]}
│ 🗑️ *Deleted By:* @${deletedBy.split('@')[0]}
│ 💬 *Chat:* ${isGroup ? chatName : 'Private Chat'}
│ 🕒 *Time:* ${new Date().toLocaleString()}
╰────────────────
🎩 _GODFATHER XMD - Recovered Message_`;

        const mentions = [sender, deletedBy];
        const m = original.message;

        // ── TEXT ──
        if (m.conversation || m.extendedTextMessage?.text) {
            const text = m.conversation || m.extendedTextMessage.text;
            await sock.sendMessage(target, {
                text: `${header}\n\n📝 *Message:*\n${text}`,
                mentions
            });
            return;
        }

        // ── MEDIA (image / video / audio / sticker / document) ──
        const mediaTypes = ['imageMessage', 'videoMessage', 'audioMessage', 'stickerMessage', 'documentMessage'];
        const mediaType = mediaTypes.find(t => m[t]);

        if (mediaType) {
            try {
                const buffer = await downloadMediaMessage(
                    { key: original.key, message: m },
                    'buffer',
                    {}
                );
                const caption = m[mediaType].caption
                    ? `\n\n📝 *Caption:* ${m[mediaType].caption}`
                    : '';

                // Send header first
                await sock.sendMessage(target, {
                    text: `${header}${caption}`,
                    mentions
                });

                // Send recovered media
                if (mediaType === 'imageMessage') {
                    await sock.sendMessage(target, { image: buffer, caption: '🛡️ Recovered Image' });
                } else if (mediaType === 'videoMessage') {
                    await sock.sendMessage(target, { video: buffer, caption: '🛡️ Recovered Video' });
                } else if (mediaType === 'audioMessage') {
                    await sock.sendMessage(target, {
                        audio: buffer,
                        mimetype: 'audio/mp4',
                        ptt: m.audioMessage.ptt || false
                    });
                } else if (mediaType === 'stickerMessage') {
                    await sock.sendMessage(target, { sticker: buffer });
                } else if (mediaType === 'documentMessage') {
                    await sock.sendMessage(target, {
                        document: buffer,
                        mimetype: m.documentMessage.mimetype || 'application/octet-stream',
                        fileName: m.documentMessage.fileName || 'recovered_file'
                    });
                }
            } catch (err) {
                console.log('Media recovery failed:', err.message);
                await sock.sendMessage(target, {
                    text: `${header}\n\n⚠️ Could not recover media (${mediaType}).`,
                    mentions
                });
            }
            return;
        }

        // ── Fallback ──
        await sock.sendMessage(target, {
            text: `${header}\n\n⚠️ Deleted message type not supported.`,
            mentions
        });

    } catch (e) {
        console.log('AntiDelete handler error:', e.message);
    }
}

module.exports = { saveMessage, handleDelete, messageStore };