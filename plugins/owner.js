const config = require('../config');
const { setGroup, saveDatabase, db } = require('../lib/database');
const fs = require('fs-extra');

const commands = {
    broadcast: cmdBroadcast,
    bc: cmdBroadcast,
    ban: cmdBan,
    unban: cmdUnban,
    block: cmdBlock,
    unblock: cmdUnblock,
    setprefix: cmdSetPrefix,
    setmode: cmdSetMode,
    setbotname: cmdSetBotName,
    shutdown: cmdShutdown,
    restart: cmdRestart,
    join: cmdJoin,
    leave: cmdLeave,
    setpp: cmdSetPP,
    eval: cmdEval,
    exec: cmdExec,
    clearsession: cmdClearSession,
    setowner: cmdSetOwner
};

async function handle(ctx) {
    const { command } = ctx;
    if (commands[command]) {
        await commands[command](ctx);
        return true;
    }
    return false;
}

async function cmdBroadcast(ctx) {
    const { sock, msg, text, isOwner } = ctx;
    if (!isOwner) return msg.reply('❌ Owner only command!');
    if (!text) return msg.reply('❌ Please provide a message to broadcast!');

    const groups = await sock.groupFetchAllParticipating();
    const groupIds = Object.keys(groups);
    
    await msg.reply(`📢 Broadcasting to ${groupIds.length} groups...`);
    
    let success = 0;
    for (const id of groupIds) {
        try {
            await sock.sendMessage(id, {
                text: `╔══════════════════╗\n║  📢 *BROADCAST*       ║\n╠══════════════════╣\n\n${text}\n\n_© GODFATHER XMD | Powered by Soham_`
            });
            success++;
        } catch (e) {}
    }
    
    await msg.reply(`✅ Broadcast sent to ${success}/${groupIds.length} groups!`);
}

async function cmdBan(ctx) {
    const { sock, msg, text, isOwner, from } = ctx;
    if (!isOwner) return msg.reply('❌ Owner only command!');
    
    const target = msg.mentionedJid?.[0] || (text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);
    if (!target) return msg.reply('❌ Tag or mention someone to ban!');
    
    const { getUser, setUser } = require('../lib/database');
    setUser(target, 'banned', true);
    
    await msg.reply(`✅ @${target.split('@')[0]} has been *banned* from using the bot!`);
}

async function cmdUnban(ctx) {
    const { sock, msg, text, isOwner } = ctx;
    if (!isOwner) return msg.reply('❌ Owner only command!');
    
    const target = msg.mentionedJid?.[0] || (text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);
    if (!target) return msg.reply('❌ Tag or mention someone to unban!');
    
    const { setUser } = require('../lib/database');
    setUser(target, 'banned', false);
    
    await msg.reply(`✅ @${target.split('@')[0]} has been *unbanned*!`);
}

async function cmdBlock(ctx) {
    const { sock, msg, text, isOwner } = ctx;
    if (!isOwner) return msg.reply('❌ Owner only command!');
    
    const target = msg.mentionedJid?.[0] || (text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);
    if (!target) return msg.reply('❌ Tag or mention someone to block!');
    
    await sock.updateBlockStatus(target, 'block');
    await msg.reply(`✅ @${target.split('@')[0]} has been *blocked*!`);
}

async function cmdUnblock(ctx) {
    const { sock, msg, text, isOwner } = ctx;
    if (!isOwner) return msg.reply('❌ Owner only command!');
    
    const target = msg.mentionedJid?.[0] || (text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);
    if (!target) return msg.reply('❌ Tag or mention someone to unblock!');
    
    await sock.updateBlockStatus(target, 'unblock');
    await msg.reply(`✅ @${target.split('@')[0]} has been *unblocked*!`);
}

async function cmdSetPrefix(ctx) {
    const { msg, text, isOwner } = ctx;
    if (!isOwner) return msg.reply('❌ Owner only command!');
    if (!text) return msg.reply('❌ Please provide a new prefix!');
    
    config.prefix = text;
    process.env.PREFIX = text;
    await msg.reply(`✅ Prefix changed to: *${text}*`);
}

async function cmdSetMode(ctx) {
    const { msg, text, isOwner } = ctx;
    if (!isOwner) return msg.reply('❌ Owner only command!');
    if (!text || !['public', 'private', 'group'].includes(text.toLowerCase())) {
        return msg.reply('❌ Please specify mode: public, private, or group');
    }
    
    config.mode = text.toLowerCase();
    process.env.MODE = text.toLowerCase();
    await msg.reply(`✅ Bot mode changed to: *${text.toLowerCase()}*`);
}

async function cmdSetBotName(ctx) {
    const { msg, text, isOwner } = ctx;
    if (!isOwner) return msg.reply('❌ Owner only command!');
    if (!text) return msg.reply('❌ Please provide a new bot name!');
    
    config.botName = text;
    await msg.reply(`✅ Bot name changed to: *${text}*`);
}

async function cmdShutdown(ctx) {
    const { msg, isOwner } = ctx;
    if (!isOwner) return msg.reply('❌ Owner only command!');
    
    await msg.reply('🔴 *GODFATHER XMD* is shutting down...\n\n_Powered by Soham_');
    process.exit(0);
}

async function cmdRestart(ctx) {
    const { msg, isOwner } = ctx;
    if (!isOwner) return msg.reply('❌ Owner only command!');
    
    await msg.reply('🔄 *GODFATHER XMD* is restarting...\n\n_Powered by Soham_');
    process.exit(1);
}

async function cmdJoin(ctx) {
    const { sock, msg, text, isOwner } = ctx;
    if (!isOwner) return msg.reply('❌ Owner only command!');
    if (!text) return msg.reply('❌ Please provide a group link!');
    
    const linkMatch = text.match(/chat\.whatsapp\.com\/([a-zA-Z0-9]+)/);
    if (!linkMatch) return msg.reply('❌ Invalid group link!');
    
    try {
        await sock.groupAcceptInvite(linkMatch[1]);
        await msg.reply('✅ Successfully joined the group!');
    } catch (e) {
        await msg.reply(`❌ Failed to join: ${e.message}`);
    }
}

async function cmdLeave(ctx) {
    const { sock, msg, from, isOwner, isGroup } = ctx;
    if (!isOwner) return msg.reply('❌ Owner only command!');
    if (!isGroup) return msg.reply('❌ This command can only be used in groups!');
    
    await msg.reply('👋 Leaving group...\n\n_© GODFATHER XMD | Powered by Soham_');
    await sock.groupLeave(from);
}

async function cmdSetPP(ctx) {
    const { sock, msg, from, isOwner } = ctx;
    if (!isOwner) return msg.reply('❌ Owner only command!');
    
    const { downloadMediaMessage } = require('@whiskeysockets/baileys');
    
    if (msg.type === 'imageMessage' || (msg.quoted && msg.quoted.message?.imageMessage)) {
        try {
            const media = msg.type === 'imageMessage' 
                ? await downloadMediaMessage(msg, 'buffer', {})
                : await downloadMediaMessage({ message: msg.quoted.message }, 'buffer', {});
            
            await sock.updateProfilePicture(sock.user.id, media);
            await msg.reply('✅ Bot profile picture updated!');
        } catch (e) {
            await msg.reply(`❌ Error: ${e.message}`);
        }
    } else {
        await msg.reply('❌ Please send/reply to an image!');
    }
}

async function cmdEval(ctx) {
    const { sock, msg, text, isOwner, from } = ctx;
    if (!isOwner) return msg.reply('❌ Owner only command!');
    if (!text) return msg.reply('❌ Please provide code to evaluate!');
    
    try {
        const result = eval(text);
        await msg.reply(`✅ *Result:*\n\`\`\`${JSON.stringify(result, null, 2)}\`\`\``);
    } catch (e) {
        await msg.reply(`❌ *Error:*\n\`\`\`${e.message}\`\`\``);
    }
}

async function cmdExec(ctx) {
    const { msg, text, isOwner } = ctx;
    if (!isOwner) return msg.reply('❌ Owner only command!');
    if (!text) return msg.reply('❌ Please provide a command to execute!');
    
    const { exec } = require('child_process');
    exec(text, (err, stdout, stderr) => {
        if (err) return msg.reply(`❌ Error:\n${err.message}`);
        if (stderr) return msg.reply(`⚠️ Stderr:\n${stderr}`);
        msg.reply(`✅ Output:\n${stdout}`);
    });
}

async function cmdClearSession(ctx) {
    const { msg, isOwner } = ctx;
    if (!isOwner) return msg.reply('❌ Owner only command!');
    
    const sessionDir = './session';
    const files = fs.readdirSync(sessionDir);
    let cleared = 0;
    
    files.forEach(file => {
        if (file !== 'creds.json') {
            fs.unlinkSync(`${sessionDir}/${file}`);
            cleared++;
        }
    });
    
    await msg.reply(`✅ Cleared ${cleared} session files!`);
}

async function cmdSetOwner(ctx) {
    const { msg, text, isOwner } = ctx;
    if (!isOwner) return msg.reply('❌ Owner only command!');
    if (!text) return msg.reply('❌ Please provide a number!');
    
    const number = text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
    if (!config.ownerNumbers.includes(number)) {
        config.ownerNumbers.push(number);
        await msg.reply(`✅ Added ${text} as co-owner!`);
    } else {
        await msg.reply('❌ This number is already an owner!');
    }
}

module.exports = { handle, commands };