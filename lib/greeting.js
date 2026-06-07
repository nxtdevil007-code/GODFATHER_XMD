const config = require('../config');
const { getGroup } = require('./database');
const fs = require('fs');
const path = require('path');

async function handleGroupUpdate(sock, update) {
    // Handle group setting changes
}

async function handleGroupParticipantsUpdate(sock, update) {
    const { id, participants, action } = update;
    const groupData = getGroup(id);

    try {
        const metadata = await sock.groupMetadata(id);
        const groupName = metadata.subject;

        for (const participant of participants) {
            const ppUrl = await getPP(sock, participant);
            const username = participant.split('@')[0];

            if (action === 'add' && groupData.welcome) {
                const welcomeMsg = groupData.welcomeMsg || 
`╔══════════════════════╗
║   *GODFATHER XMD*         ║
╠══════════════════════╣
║                            ║
║  👋 *WELCOME*              ║
║                            ║
║  Hello @${username}!       
║                            ║
║  Welcome to *${groupName}* 
║                            ║
║  📌 Please read the group  ║
║     description & rules    ║
║                            ║
║  🎉 Enjoy your stay!       ║
║                            ║
╚══════════════════════╝
_© GODFATHER XMD | Powered by Soham_`;

                const logoBuffer = config.botLogo;
                
                if (logoBuffer) {
                    await sock.sendMessage(id, {
                        image: logoBuffer,
                        caption: welcomeMsg,
                        mentions: [participant]
                    });
                } else {
                    await sock.sendMessage(id, {
                        text: welcomeMsg,
                        mentions: [participant]
                    });
                }
            }

            if (action === 'remove' && groupData.goodbye) {
                const goodbyeMsg = groupData.goodbyeMsg || 
`╔══════════════════════╗
║   *GODFATHER XMD*         ║
╠══════════════════════╣
║                            ║
║  👋 *GOODBYE*              ║
║                            ║
║  @${username} has left      
║  *${groupName}*            
║                            ║
║  We'll miss you! 😢        ║
║                            ║
╚══════════════════════╝
_© GODFATHER XMD | Powered by Soham_`;

                await sock.sendMessage(id, {
                    text: goodbyeMsg,
                    mentions: [participant]
                });
            }

            if (action === 'promote') {
                await sock.sendMessage(id, {
                    text: `🎖️ @${username} has been *promoted* to admin!\n\n_© GODFATHER XMD_`,
                    mentions: [participant]
                });
            }

            if (action === 'demote') {
                await sock.sendMessage(id, {
                    text: `📉 @${username} has been *demoted* from admin!\n\n_© GODFATHER XMD_`,
                    mentions: [participant]
                });
            }
        }
    } catch (e) {
        console.log('Greeting error:', e.message);
    }
}

async function getPP(sock, jid) {
    try {
        return await sock.profilePictureUrl(jid, 'image');
    } catch {
        return 'https://i.ibb.co/Tq7d7TZ/default.jpg';
    }
}

module.exports = { handleGroupUpdate, handleGroupParticipantsUpdate };