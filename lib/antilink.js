const { getGroup } = require('./database');

const linkPatterns = [
    /https?:\/\/[^\s]+/gi,
    /wa\.me\/[^\s]+/gi,
    /chat\.whatsapp\.com\/[^\s]+/gi,
    /t\.me\/[^\s]+/gi,
    /discord\.gg\/[^\s]+/gi,
    /instagram\.com\/[^\s]+/gi,
    /facebook\.com\/[^\s]+/gi,
    /tiktok\.com\/[^\s]+/gi,
    /youtu\.be\/[^\s]+/gi,
    /youtube\.com\/[^\s]+/gi
];

async function checkAntilink(sock, msg, from, sender, isBotAdmin) {
    const body = msg.body || '';
    const groupData = getGroup(from);
    
    if (!groupData.antilink) return false;

    for (const pattern of linkPatterns) {
        if (pattern.test(body)) {
            if (isBotAdmin) {
                try {
                    await sock.sendMessage(from, {
                        text: `⚠️ *ANTI-LINK DETECTED*\n\n@${sender.split('@')[0]}, links are not allowed in this group!\n\n_Message deleted by GODFATHER XMD_`,
                        mentions: [sender]
                    });
                    await sock.sendMessage(from, { delete: msg.key });
                    
                    // Warn the user
                    if (!groupData.warnings) groupData.warnings = {};
                    if (!groupData.warnings[sender]) groupData.warnings[sender] = 0;
                    groupData.warnings[sender]++;
                    
                    if (groupData.warnings[sender] >= 3) {
                        await sock.groupParticipantsUpdate(from, [sender], 'remove');
                        await sock.sendMessage(from, {
                            text: `🚫 @${sender.split('@')[0]} has been removed after 3 warnings for sending links.`,
                            mentions: [sender]
                        });
                        groupData.warnings[sender] = 0;
                    }
                } catch (e) {
                    console.log('Anti-link error:', e.message);
                }
            }
            return true;
        }
    }
    return false;
}

module.exports = { checkAntilink };