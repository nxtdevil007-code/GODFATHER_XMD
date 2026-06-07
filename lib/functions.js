const { getContentType, downloadMediaMessage, proto } = require('@whiskeysockets/baileys');
const fs = require('fs-extra');
const path = require('path');
const config = require('../config');
const { getGroup, addXP, getUser } = require('./database');
const { checkAntilink } = require('./antilink');

// Import all plugins
const ownerPlugin = require('../plugins/owner');
const groupPlugin = require('../plugins/group');
const stickerPlugin = require('../plugins/sticker');
const downloaderPlugin = require('../plugins/downloader');
const searchPlugin = require('../plugins/search');
const funPlugin = require('../plugins/fun');
const toolsPlugin = require('../plugins/tools');
const aiPlugin = require('../plugins/ai');
const menuPlugin = require('../plugins/menu');
const animePlugin = require('../plugins/anime');
const economyPlugin = require('../plugins/economy');
const gamePlugin = require('../plugins/game');
const converterPlugin = require('../plugins/converter');

// All plugin handlers
const allPlugins = [
    menuPlugin,
    ownerPlugin,
    groupPlugin,
    stickerPlugin,
    downloaderPlugin,
    searchPlugin,
    funPlugin,
    toolsPlugin,
    aiPlugin,
    animePlugin,
    economyPlugin,
    gamePlugin,
    converterPlugin
];

function serialize(msg, sock) {
    if (msg.key) {
        msg.id = msg.key.id;
        msg.isGroup = msg.key.remoteJid.endsWith('@g.us');
        msg.chat = msg.key.remoteJid;
        msg.from = msg.key.remoteJid;
        msg.fromMe = msg.key.fromMe;
        msg.sender = msg.isGroup 
            ? (msg.key.participant || msg.key.remoteJid) 
            : msg.key.remoteJid;
        msg.pushName = msg.pushName || 'User';
    }

    const type = getContentType(msg.message);
    msg.type = type;

    if (type === 'conversation') {
        msg.body = msg.message.conversation;
    } else if (type === 'extendedTextMessage') {
        msg.body = msg.message.extendedTextMessage.text;
    } else if (type === 'imageMessage') {
        msg.body = msg.message.imageMessage.caption || '';
    } else if (type === 'videoMessage') {
        msg.body = msg.message.videoMessage.caption || '';
    } else if (type === 'documentMessage') {
        msg.body = msg.message.documentMessage.caption || '';
    } else if (type === 'buttonsResponseMessage') {
        msg.body = msg.message.buttonsResponseMessage.selectedButtonId || '';
    } else if (type === 'listResponseMessage') {
        msg.body = msg.message.listResponseMessage.singleSelectReply.selectedRowId || '';
    } else if (type === 'templateButtonReplyMessage') {
        msg.body = msg.message.templateButtonReplyMessage.selectedId || '';
    } else {
        msg.body = '';
    }

    // Quoted message
    if (type === 'extendedTextMessage' && msg.message.extendedTextMessage.contextInfo) {
        msg.quoted = msg.message.extendedTextMessage.contextInfo;
        msg.mentionedJid = msg.message.extendedTextMessage.contextInfo.mentionedJid || [];
    } else {
        msg.quoted = null;
        msg.mentionedJid = [];
    }

    // Reply function
    msg.reply = async (text) => {
        return await sock.sendMessage(msg.chat, { text }, { quoted: msg });
    };

    // React function
    msg.react = async (emoji) => {
        return await sock.sendMessage(msg.chat, {
            react: { text: emoji, key: msg.key }
        });
    };

    return msg;
}

async function handleMessage(sock, msg, store) {
    msg = serialize(msg, sock);
    
    const body = msg.body || '';
    const prefix = config.prefix;
    const isCmd = body.startsWith(prefix);
    const command = isCmd ? body.slice(prefix.length).trim().split(' ')[0].toLowerCase() : '';
    const args = body.trim().split(/ +/).slice(1);
    const text = args.join(' ');
    const from = msg.chat;
    const sender = msg.sender;
    const isGroup = msg.isGroup;
    const pushName = msg.pushName;
    const isOwner = config.ownerNumbers.includes(sender) || msg.fromMe;

    // Mode check
    if (config.mode === 'private' && !isOwner) return;
    if (config.mode === 'group' && !isGroup && !isOwner) return;

    // Get group metadata
    let groupMetadata, groupName, groupDesc, groupMembers, groupAdmins, isAdmin, isBotAdmin;
    if (isGroup) {
        try {
            groupMetadata = await sock.groupMetadata(from);
            groupName = groupMetadata.subject;
            groupDesc = groupMetadata.desc || '';
            groupMembers = groupMetadata.participants;
            groupAdmins = groupMembers.filter(v => v.admin !== null).map(v => v.id);
            isAdmin = groupAdmins.includes(sender);
            isBotAdmin = groupAdmins.includes(sock.user.id.split(':')[0] + '@s.whatsapp.net');
        } catch (e) {
            groupMetadata = {};
            groupName = '';
            groupDesc = '';
            groupMembers = [];
            groupAdmins = [];
            isAdmin = false;
            isBotAdmin = false;
        }
    }

    // Auto-typing indicator
    if (config.autoTyping && isCmd) {
        await sock.sendPresenceUpdate('composing', from);
    }

    // Auto-recording indicator
    if (config.autoRecording && isCmd) {
        await sock.sendPresenceUpdate('recording', from);
    }

    // Add XP for messages
    if (sender && !msg.fromMe) {
        const leveled = addXP(sender, Math.floor(Math.random() * 10) + 1);
        if (leveled) {
            const user = getUser(sender);
            await sock.sendMessage(from, {
                text: `🎉 Congratulations @${sender.split('@')[0]}! You leveled up to *Level ${user.level}*!`,
                mentions: [sender]
            });
        }
    }

    // Anti-link check
    if (isGroup) {
        const groupData = getGroup(from);
        if (groupData.antilink && !isAdmin && !isOwner) {
            const linkDetected = await checkAntilink(sock, msg, from, sender, isBotAdmin);
            if (linkDetected) return;
        }

        // Mute check
        if (groupData.muted && !isAdmin && !isOwner) return;
    }

    if (!isCmd) return;

    console.log(`[CMD] ${pushName} (${sender.split('@')[0]}) > ${prefix}${command} ${text}`);

    // Process command through all plugins
    const context = {
        sock,
        msg,
        from,
        sender,
        isGroup,
        isAdmin,
        isBotAdmin,
        isOwner,
        pushName,
        command,
        args,
        text,
        prefix,
        groupMetadata,
        groupName,
        groupDesc,
        groupMembers,
        groupAdmins,
        config,
        store
    };

    for (const plugin of allPlugins) {
        try {
            const handled = await plugin.handle(context);
            if (handled) break;
        } catch (e) {
            console.error(`Plugin error:`, e);
            await msg.reply(`❌ Error: ${e.message}`);
        }
    }
}

module.exports = { handleMessage, serialize };