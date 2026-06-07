const { getGroup, setGroup } = require('../lib/database');

const commands = {
    kick: cmdKick,
    remove: cmdKick,
    add: cmdAdd,
    promote: cmdPromote,
    demote: cmdDemote,
    mute: cmdMute,
    unmute: cmdUnmute,
    antilink: cmdAntilink,
    antispam: cmdAntispam,
    welcome: cmdWelcome,
    goodbye: cmdGoodbye,
    hidetag: cmdHidetag,
    tagall: cmdTagall,
    group: cmdGroup,
    setname: cmdSetName,
    setdesc: cmdSetDesc,
    setgroupname: cmdSetName,
    setgroupdesc: cmdSetDesc,
    revoke: cmdRevoke,
    getlink: cmdGetLink,
    invite: cmdGetLink,
    warn: cmdWarn,
    unwarn: cmdUnwarn,
    warnlist: cmdWarnlist,
    poll: cmdPoll,
    setwelcome: cmdSetWelcome,
    setgoodbye: cmdSetGoodbye,
    groupinfo: cmdGroupInfo,
    admins: cmdAdmins
};

async function handle(ctx) {
    const { command } = ctx;
    if (commands[command]) {
        await commands[command](ctx);
        return true;
    }
    return false;
}

async function cmdKick(ctx) {
    const { sock, msg, from, isGroup, isAdmin, isBotAdmin, sender } = ctx;
    if (!isGroup) return msg.reply('❌ Group only command!');
    if (!isAdmin) return msg.reply('❌ Admin only command!');
    if (!isBotAdmin) return msg.reply('❌ Bot must be admin!');
    
    const target = msg.mentionedJid?.[0] || (msg.quoted?.participant);
    if (!target) return msg.reply('❌ Tag or reply to someone to kick!');
    
    try {
        await sock.groupParticipantsUpdate(from, [target], 'remove');
        await sock.sendMessage(from, {
            text: `✅ @${target.split('@')[0]} has been kicked!\n\n_© GODFATHER XMD_`,
            mentions: [target]
        });
    } catch (e) {
        await msg.reply(`❌ Failed to kick: ${e.message}`);
    }
}

async function cmdAdd(ctx) {
    const { sock, msg, from, text, isGroup, isAdmin, isBotAdmin } = ctx;
    if (!isGroup) return msg.reply('❌ Group only command!');
    if (!isAdmin) return msg.reply('❌ Admin only command!');
    if (!isBotAdmin) return msg.reply('❌ Bot must be admin!');
    if (!text) return msg.reply('❌ Please provide a phone number!');
    
    const number = text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
    
    try {
        await sock.groupParticipantsUpdate(from, [number], 'add');
        await msg.reply(`✅ Successfully added @${number.split('@')[0]}!`);
    } catch (e) {
        await msg.reply(`❌ Failed to add: ${e.message}`);
    }
}

async function cmdPromote(ctx) {
    const { sock, msg, from, isGroup, isAdmin, isBotAdmin } = ctx;
    if (!isGroup) return msg.reply('❌ Group only command!');
    if (!isAdmin) return msg.reply('❌ Admin only command!');
    if (!isBotAdmin) return msg.reply('❌ Bot must be admin!');
    
    const target = msg.mentionedJid?.[0] || (msg.quoted?.participant);
    if (!target) return msg.reply('❌ Tag or reply to someone to promote!');
    
    try {
        await sock.groupParticipantsUpdate(from, [target], 'promote');
        await sock.sendMessage(from, {
            text: `✅ @${target.split('@')[0]} has been *promoted* to admin! 🎖️\n\n_© GODFATHER XMD_`,
            mentions: [target]
        });
    } catch (e) {
        await msg.reply(`❌ Failed to promote: ${e.message}`);
    }
}

async function cmdDemote(ctx) {
    const { sock, msg, from, isGroup, isAdmin, isBotAdmin } = ctx;
    if (!isGroup) return msg.reply('❌ Group only command!');
    if (!isAdmin) return msg.reply('❌ Admin only command!');
    if (!isBotAdmin) return msg.reply('❌ Bot must be admin!');
    
    const target = msg.mentionedJid?.[0] || (msg.quoted?.participant);
    if (!target) return msg.reply('❌ Tag or reply to someone to demote!');
    
    try {
        await sock.groupParticipantsUpdate(from, [target], 'demote');
        await sock.sendMessage(from, {
            text: `✅ @${target.split('@')[0]} has been *demoted*! 📉\n\n_© GODFATHER XMD_`,
            mentions: [target]
        });
    } catch (e) {
        await msg.reply(`❌ Failed to demote: ${e.message}`);
    }
}

async function cmdMute(ctx) {
    const { msg, from, isGroup, isAdmin } = ctx;
    if (!isGroup) return msg.reply('❌ Group only command!');
    if (!isAdmin) return msg.reply('❌ Admin only command!');
    
    setGroup(from, 'muted', true);
    await msg.reply('🔇 Group has been *muted*! Non-admins cannot use bot commands.\n\n_© GODFATHER XMD_');
}

async function cmdUnmute(ctx) {
    const { msg, from, isGroup, isAdmin } = ctx;
    if (!isGroup) return msg.reply('❌ Group only command!');
    if (!isAdmin) return msg.reply('❌ Admin only command!');
    
    setGroup(from, 'muted', false);
    await msg.reply('🔊 Group has been *unmuted*!\n\n_© GODFATHER XMD_');
}

async function cmdAntilink(ctx) {
    const { msg, from, text, isGroup, isAdmin } = ctx;
    if (!isGroup) return msg.reply('❌ Group only command!');
    if (!isAdmin) return msg.reply('❌ Admin only command!');
    
    if (!text || !['on', 'off'].includes(text.toLowerCase())) {
        return msg.reply('❌ Usage: .antilink on/off');
    }
    
    const status = text.toLowerCase() === 'on';
    setGroup(from, 'antilink', status);
    await msg.reply(`${status ? '✅ Anti-link *enabled*!' : '❌ Anti-link *disabled*!'}\n\n_© GODFATHER XMD_`);
}

async function cmdAntispam(ctx) {
    const { msg, from, text, isGroup, isAdmin } = ctx;
    if (!isGroup) return msg.reply('❌ Group only command!');
    if (!isAdmin) return msg.reply('❌ Admin only command!');
    
    if (!text || !['on', 'off'].includes(text.toLowerCase())) {
        return msg.reply('❌ Usage: .antispam on/off');
    }
    
    const status = text.toLowerCase() === 'on';
    setGroup(from, 'antispam', status);
    await msg.reply(`${status ? '✅ Anti-spam *enabled*!' : '❌ Anti-spam *disabled*!'}\n\n_© GODFATHER XMD_`);
}

async function cmdWelcome(ctx) {
    const { msg, from, text, isGroup, isAdmin } = ctx;
    if (!isGroup) return msg.reply('❌ Group only command!');
    if (!isAdmin) return msg.reply('❌ Admin only command!');
    
    if (!text || !['on', 'off'].includes(text.toLowerCase())) {
        return msg.reply('❌ Usage: .welcome on/off');
    }
    
    const status = text.toLowerCase() === 'on';
    setGroup(from, 'welcome', status);
    await msg.reply(`${status ? '✅ Welcome messages *enabled*!' : '❌ Welcome messages *disabled*!'}\n\n_© GODFATHER XMD_`);
}

async function cmdGoodbye(ctx) {
    const { msg, from, text, isGroup, isAdmin } = ctx;
    if (!isGroup) return msg.reply('❌ Group only command!');
    if (!isAdmin) return msg.reply('❌ Admin only command!');
    
    if (!text || !['on', 'off'].includes(text.toLowerCase())) {
        return msg.reply('❌ Usage: .goodbye on/off');
    }
    
    const status = text.toLowerCase() === 'on';
    setGroup(from, 'goodbye', status);
    await msg.reply(`${status ? '✅ Goodbye messages *enabled*!' : '❌ Goodbye messages *disabled*!'}\n\n_© GODFATHER XMD_`);
}

async function cmdHidetag(ctx) {
    const { sock, msg, from, text, isGroup, isAdmin, groupMembers } = ctx;
    if (!isGroup) return msg.reply('❌ Group only command!');
    if (!isAdmin) return msg.reply('❌ Admin only command!');
    if (!text) return msg.reply('❌ Please provide a message!');
    
    const members = groupMembers.map(m => m.id);
    await sock.sendMessage(from, {
        text: text,
        mentions: members
    });
}

async function cmdTagall(ctx) {
    const { sock, msg, from, text, isGroup, isAdmin, groupMembers, groupName } = ctx;
    if (!isGroup) return msg.reply('❌ Group only command!');
    if (!isAdmin) return msg.reply('❌ Admin only command!');
    
    let tagMsg = `╔══════════════════╗\n║  📢 *TAG ALL*          ║\n╠══════════════════╣\n\n`;
    tagMsg += text ? `📝 *Message:* ${text}\n\n` : '';
    tagMsg += `👥 *Group:* ${groupName}\n\n`;
    
    const members = groupMembers.map(m => m.id);
    members.forEach(m => {
        tagMsg += `│ 🏷️ @${m.split('@')[0]}\n`;
    });
    
    tagMsg += `\n╚══════════════════╝\n_© GODFATHER XMD_`;
    
    await sock.sendMessage(from, {
        text: tagMsg,
        mentions: members
    });
}

async function cmdGroup(ctx) {
    const { sock, msg, from, text, isGroup, isAdmin, isBotAdmin } = ctx;
    if (!isGroup) return msg.reply('❌ Group only command!');
    if (!isAdmin) return msg.reply('❌ Admin only command!');
    if (!isBotAdmin) return msg.reply('❌ Bot must be admin!');
    
    if (!text || !['open', 'close'].includes(text.toLowerCase())) {
        return msg.reply('❌ Usage: .group open/close');
    }
    
    const isClose = text.toLowerCase() === 'close';
    await sock.groupSettingUpdate(from, isClose ? 'announcement' : 'not_announcement');
    await msg.reply(`✅ Group has been *${isClose ? 'closed' : 'opened'}*!\n\n_© GODFATHER XMD_`);
}

async function cmdSetName(ctx) {
    const { sock, msg, from, text, isGroup, isAdmin, isBotAdmin } = ctx;
    if (!isGroup) return msg.reply('❌ Group only command!');
    if (!isAdmin) return msg.reply('❌ Admin only command!');
    if (!isBotAdmin) return msg.reply('❌ Bot must be admin!');
    if (!text) return msg.reply('❌ Please provide a new group name!');
    
    await sock.groupUpdateSubject(from, text);
    await msg.reply(`✅ Group name changed to: *${text}*\n\n_© GODFATHER XMD_`);
}

async function cmdSetDesc(ctx) {
    const { sock, msg, from, text, isGroup, isAdmin, isBotAdmin } = ctx;
    if (!isGroup) return msg.reply('❌ Group only command!');
    if (!isAdmin) return msg.reply('❌ Admin only command!');
    if (!isBotAdmin) return msg.reply('❌ Bot must be admin!');
    if (!text) return msg.reply('❌ Please provide a new group description!');
    
    await sock.groupUpdateDescription(from, text);
    await msg.reply('✅ Group description updated!\n\n_© GODFATHER XMD_');
}

async function cmdRevoke(ctx) {
    const { sock, msg, from, isGroup, isAdmin, isBotAdmin } = ctx;
    if (!isGroup) return msg.reply('❌ Group only command!');
    if (!isAdmin) return msg.reply('❌ Admin only command!');
    if (!isBotAdmin) return msg.reply('❌ Bot must be admin!');
    
    await sock.groupRevokeInvite(from);
    await msg.reply('✅ Group invite link has been *revoked*!\n\n_© GODFATHER XMD_');
}

async function cmdGetLink(ctx) {
    const { sock, msg, from, isGroup, isAdmin, isBotAdmin } = ctx;
    if (!isGroup) return msg.reply('❌ Group only command!');
    if (!isAdmin) return msg.reply('❌ Admin only command!');
    if (!isBotAdmin) return msg.reply('❌ Bot must be admin!');
    
    const code = await sock.groupInviteCode(from);
    await msg.reply(`🔗 *Group Invite Link:*\n\nhttps://chat.whatsapp.com/${code}\n\n_© GODFATHER XMD_`);
}

async function cmdWarn(ctx) {
    const { sock, msg, from, isGroup, isAdmin, isBotAdmin } = ctx;
    if (!isGroup) return msg.reply('❌ Group only command!');
    if (!isAdmin) return msg.reply('❌ Admin only command!');
    
    const target = msg.mentionedJid?.[0] || (msg.quoted?.participant);
    if (!target) return msg.reply('❌ Tag or reply to someone to warn!');
    
    const groupData = getGroup(from);
    if (!groupData.warnings) groupData.warnings = {};
    if (!groupData.warnings[target]) groupData.warnings[target] = 0;
    groupData.warnings[target]++;
    
    const { saveDatabase } = require('../lib/database');
    saveDatabase();
    
    const warns = groupData.warnings[target];
    
    if (warns >= 3) {
        if (isBotAdmin) {
            await sock.groupParticipantsUpdate(from, [target], 'remove');
            await sock.sendMessage(from, {
                text: `🚫 @${target.split('@')[0]} has been *removed* after 3 warnings!\n\n_© GODFATHER XMD_`,
                mentions: [target]
            });
            groupData.warnings[target] = 0;
            saveDatabase();
        }
    } else {
        await sock.sendMessage(from, {
            text: `⚠️ @${target.split('@')[0]} has been *warned*!\n\n📊 Warnings: ${warns}/3\n\n_3 warnings = kick!_\n\n_© GODFATHER XMD_`,
            mentions: [target]
        });
    }
}

async function cmdUnwarn(ctx) {
    const { sock, msg, from, isGroup, isAdmin } = ctx;
    if (!isGroup) return msg.reply('❌ Group only command!');
    if (!isAdmin) return msg.reply('❌ Admin only command!');
    
    const target = msg.mentionedJid?.[0] || (msg.quoted?.participant);
    if (!target) return msg.reply('❌ Tag or reply to someone!');
    
    const groupData = getGroup(from);
    if (groupData.warnings && groupData.warnings[target]) {
        groupData.warnings[target] = 0;
        const { saveDatabase } = require('../lib/database');
        saveDatabase();
    }
    
    await sock.sendMessage(from, {
        text: `✅ Warnings cleared for @${target.split('@')[0]}!\n\n_© GODFATHER XMD_`,
        mentions: [target]
    });
}

async function cmdWarnlist(ctx) {
    const { msg, from, isGroup } = ctx;
    if (!isGroup) return msg.reply('❌ Group only command!');
    
    const groupData = getGroup(from);
    if (!groupData.warnings || Object.keys(groupData.warnings).length === 0) {
        return msg.reply('✅ No warnings in this group!\n\n_© GODFATHER XMD_');
    }
    
    let text = '⚠️ *Warning List*\n━━━━━━━━━━━━━━━\n\n';
    for (const [jid, warns] of Object.entries(groupData.warnings)) {
        if (warns > 0) {
            text += `│ @${jid.split('@')[0]}: ${warns}/3 warnings\n`;
        }
    }
    text += '\n━━━━━━━━━━━━━━━\n_© GODFATHER XMD_';
    
    const mentions = Object.keys(groupData.warnings);
    await require('../connection').sock?.sendMessage?.(from, { text, mentions }) || await msg.reply(text);
}

async function cmdPoll(ctx) {
    const { sock, msg, from, text, isGroup } = ctx;
    if (!isGroup) return msg.reply('❌ Group only command!');
    if (!text) return msg.reply('❌ Usage: .poll Question | Option1 | Option2 | ...');
    
    const parts = text.split('|').map(p => p.trim());
    if (parts.length < 3) return msg.reply('❌ Need at least a question and 2 options!');
    
    const question = parts[0];
    const options = parts.slice(1);
    
    await sock.sendMessage(from, {
        poll: {
            name: question,
            values: options,
            selectableCount: 1
        }
    });
}

async function cmdSetWelcome(ctx) {
    const { msg, from, text, isGroup, isAdmin } = ctx;
    if (!isGroup) return msg.reply('❌ Group only command!');
    if (!isAdmin) return msg.reply('❌ Admin only command!');
    if (!text) return msg.reply('❌ Please provide a welcome message!');
    
    setGroup(from, 'welcomeMsg', text);
    await msg.reply('✅ Custom welcome message set!\n\n_© GODFATHER XMD_');
}

async function cmdSetGoodbye(ctx) {
    const { msg, from, text, isGroup, isAdmin } = ctx;
    if (!isGroup) return msg.reply('❌ Group only command!');
    if (!isAdmin) return msg.reply('❌ Admin only command!');
    if (!text) return msg.reply('❌ Please provide a goodbye message!');
    
    setGroup(from, 'goodbyeMsg', text);
    await msg.reply('✅ Custom goodbye message set!\n\n_© GODFATHER XMD_');
}

async function cmdGroupInfo(ctx) {
    const { msg, from, isGroup, groupName, groupDesc, groupMembers, groupAdmins } = ctx;
    if (!isGroup) return msg.reply('❌ Group only command!');
    
    const groupData = getGroup(from);
    
    const infoText = `
╔══════════════════════╗
║   *GROUP INFO*            ║
╠══════════════════════╣
║                            ║
║  📛 Name: ${groupName}
║  👥 Members: ${groupMembers?.length || 0}
║  👑 Admins: ${groupAdmins?.length || 0}
║                            ║
║  *Settings:*               ║
║  🔗 Anti-link: ${groupData.antilink ? '✅' : '❌'}
║  🚫 Anti-spam: ${groupData.antispam ? '✅' : '❌'}
║  👋 Welcome: ${groupData.welcome ? '✅' : '❌'}
║  🚪 Goodbye: ${groupData.goodbye ? '✅' : '❌'}
║  🔇 Muted: ${groupData.muted ? '✅' : '❌'}
║                            ║
║  📝 Description:           ║
║  ${groupDesc || 'None'}
║                            ║
╚══════════════════════╝
_© GODFATHER XMD | Powered by Soham_`;

    await msg.reply(infoText);
}

async function cmdAdmins(ctx) {
    const { sock, msg, from, isGroup, groupAdmins, groupName } = ctx;
    if (!isGroup) return msg.reply('❌ Group only command!');
    
    let text = `👑 *Admins of ${groupName}*\n━━━━━━━━━━━━━━━\n\n`;
    groupAdmins?.forEach((admin, i) => {
        text += `${i + 1}. @${admin.split('@')[0]}\n`;
    });
    text += `\n━━━━━━━━━━━━━━━\n_© GODFATHER XMD_`;
    
    await sock.sendMessage(from, { text, mentions: groupAdmins });
}

module.exports = { handle, commands };