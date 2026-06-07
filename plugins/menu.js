const config = require('../config');
const moment = require('moment-timezone');
const os = require('os');
const fs = require('fs');
const path = require('path');

const commands = {
    menu: showMenu,
    help: showMenu,
    list: showMenu,
    commands: showMenu,
    alive: showAlive,
    ping: showPing,
    info: showInfo,
    runtime: showRuntime,
    speed: showSpeed
};

async function handle(ctx) {
    const { command } = ctx;
    if (commands[command]) {
        await commands[command](ctx);
        return true;
    }
    return false;
}

async function showMenu(ctx) {
    const { sock, msg, from, pushName, prefix, config: cfg } = ctx;
    const time = moment().tz('Asia/Kolkata').format('HH:mm:ss');
    const date = moment().tz('Asia/Kolkata').format('DD/MM/YYYY');
    const uptime = formatUptime(process.uptime());

    let greeting;
    const hour = parseInt(moment().tz('Asia/Kolkata').format('HH'));
    if (hour >= 0 && hour < 5) greeting = '🌙 Good Night';
    else if (hour >= 5 && hour < 12) greeting = '🌅 Good Morning';
    else if (hour >= 12 && hour < 17) greeting = '☀️ Good Afternoon';
    else if (hour >= 17 && hour < 21) greeting = '🌆 Good Evening';
    else greeting = '🌙 Good Night';

    const menuText = `
╔══════════════════════════╗
║    ✦ *GODFATHER XMD* ✦        ║
║    _Powered by Soham_         ║
╠══════════════════════════╣
║                                ║
║  ${greeting}, *${pushName}*!
║                                ║
║  📅 Date: ${date}
║  ⏰ Time: ${time}
║  ⏱️ Uptime: ${uptime}
║  📌 Prefix: [ ${prefix} ]
║  👤 Owner: ${cfg.ownerName}
║  📡 Mode: ${cfg.mode}
║                                ║
╠══════════════════════════╣
║                                ║
║  ┌──「 *👑 OWNER MENU* 」
║  │ ${prefix}broadcast
║  │ ${prefix}ban / ${prefix}unban
║  │ ${prefix}block / ${prefix}unblock
║  │ ${prefix}setprefix
║  │ ${prefix}setmode
║  │ ${prefix}setbotname
║  │ ${prefix}shutdown
║  │ ${prefix}restart
║  │ ${prefix}join
║  │ ${prefix}leave
║  │ ${prefix}anticall
║  │ ${prefix}setpp
║  │ ${prefix}eval
║  └──────────────
║
║  ┌──「 *👥 GROUP MENU* 」
║  │ ${prefix}kick
║  │ ${prefix}add
║  │ ${prefix}promote
║  │ ${prefix}demote
║  │ ${prefix}mute / ${prefix}unmute
║  │ ${prefix}antilink on/off
║  │ ${prefix}antispam on/off
║  │ ${prefix}welcome on/off
║  │ ${prefix}goodbye on/off
║  │ ${prefix}hidetag
║  │ ${prefix}tagall
║  │ ${prefix}group open/close
║  │ ${prefix}setname
║  │ ${prefix}setdesc
║  │ ${prefix}revoke
║  │ ${prefix}warn
║  │ ${prefix}unwarn
║  │ ${prefix}warnlist
║  │ ${prefix}poll
║  │ ${prefix}getlink
║  └──────────────
║
║  ┌──「 *🖼️ STICKER MENU* 」
║  │ ${prefix}sticker / ${prefix}s
║  │ ${prefix}toimg
║  │ ${prefix}tourl
║  │ ${prefix}attp
║  │ ${prefix}emojimix
║  │ ${prefix}steal
║  │ ${prefix}round
║  └──────────────
║
║  ┌──「 *📥 DOWNLOADER MENU* 」
║  │ ${prefix}play
║  │ ${prefix}song
║  │ ${prefix}video
║  │ ${prefix}ytmp3
║  │ ${prefix}ytmp4
║  │ ${prefix}tiktok / ${prefix}tt
║  │ ${prefix}instagram / ${prefix}ig
║  │ ${prefix}facebook / ${prefix}fb
║  │ ${prefix}mediafire
║  │ ${prefix}apk
║  └──────────────
║
║  ┌──「 *🔍 SEARCH MENU* 」
║  │ ${prefix}google
║  │ ${prefix}ytsearch
║  │ ${prefix}image / ${prefix}img
║  │ ${prefix}wiki
║  │ ${prefix}weather
║  │ ${prefix}lyrics
║  │ ${prefix}news
║  │ ${prefix}github
║  │ ${prefix}pinterest
║  └──────────────
║
║  ┌──「 *🤖 AI MENU* 」
║  │ ${prefix}ai / ${prefix}gpt
║  │ ${prefix}dalle
║  │ ${prefix}imagine
║  │ ${prefix}chatgpt
║  │ ${prefix}gemini
║  └──────────────
║
║  ┌──「 *🎮 FUN MENU* 」
║  │ ${prefix}joke
║  │ ${prefix}meme
║  │ ${prefix}quote
║  │ ${prefix}fact
║  │ ${prefix}8ball
║  │ ${prefix}roll
║  │ ${prefix}flip
║  │ ${prefix}truth
║  │ ${prefix}dare
║  │ ${prefix}ship
║  │ ${prefix}roast
║  │ ${prefix}pickup
║  │ ${prefix}compliment
║  │ ${prefix}rate
║  │ ${prefix}pp
║  │ ${prefix}couple
║  └──────────────
║
║  ┌──「 *🛠️ TOOLS MENU* 」
║  │ ${prefix}translate / ${prefix}tr
║  │ ${prefix}tts
║  │ ${prefix}calc
║  │ ${prefix}base64encode
║  │ ${prefix}base64decode
║  │ ${prefix}shorturl
║  │ ${prefix}qr
║  │ ${prefix}ocr
║  │ ${prefix}removebg
║  │ ${prefix}ssweb
║  │ ${prefix}whois
║  │ ${prefix}ping
║  │ ${prefix}runtime
║  │ ${prefix}info
║  └──────────────
║
║  ┌──「 *🎌 ANIME MENU* 」
║  │ ${prefix}waifu
║  │ ${prefix}neko
║  │ ${prefix}shinobu
║  │ ${prefix}megumin
║  │ ${prefix}cuddle
║  │ ${prefix}hug
║  │ ${prefix}pat
║  │ ${prefix}slap
║  │ ${prefix}smug
║  │ ${prefix}animequote
║  │ ${prefix}manga
║  └──────────────
║
║  ┌──「 *💰 ECONOMY MENU* 」
║  │ ${prefix}balance / ${prefix}bal
║  │ ${prefix}daily
║  │ ${prefix}work
║  │ ${prefix}rob
║  │ ${prefix}deposit
║  │ ${prefix}withdraw
║  │ ${prefix}transfer / ${prefix}pay
║  │ ${prefix}leaderboard / ${prefix}lb
║  │ ${prefix}shop
║  │ ${prefix}buy
║  │ ${prefix}inventory
║  │ ${prefix}profile
║  │ ${prefix}register
║  └──────────────
║
║  ┌──「 *🎮 GAME MENU* 」
║  │ ${prefix}tictactoe / ${prefix}ttt
║  │ ${prefix}guess
║  │ ${prefix}slot
║  │ ${prefix}rps
║  │ ${prefix}quiz
║  │ ${prefix}trivia
║  │ ${prefix}hangman
║  │ ${prefix}math
║  └──────────────
║
║  ┌──「 *🔄 CONVERTER MENU* 」
║  │ ${prefix}toaudio
║  │ ${prefix}tomp3
║  │ ${prefix}tovideo
║  │ ${prefix}tomp4
║  │ ${prefix}togif
║  │ ${prefix}toptt
║  │ ${prefix}toimage
║  │ ${prefix}tovn
║  └──────────────
║                                ║
╠══════════════════════════╣
║  Total Commands: 120+          ║
║                                ║
║  _© GODFATHER XMD_             ║
║  _Powered by Soham_            ║
╚══════════════════════════╝`;

    const logoBuffer = cfg.botLogo;
    
    if (logoBuffer) {
        await sock.sendMessage(from, {
            image: logoBuffer,
            caption: menuText,
            mentions: [ctx.sender]
        }, { quoted: msg });
    } else {
        await sock.sendMessage(from, { text: menuText }, { quoted: msg });
    }
}

async function showAlive(ctx) {
    const { sock, msg, from, config: cfg } = ctx;
    const uptime = formatUptime(process.uptime());
    
    const aliveMsg = `
╔══════════════════════╗
║   *GODFATHER XMD*         ║
║   _is ALIVE!_ ✅          ║
╠══════════════════════╣
║                            ║
║  🤖 Bot: ${cfg.botName}
║  👤 Owner: ${cfg.ownerName}
║  ⏱️ Uptime: ${uptime}
║  📌 Version: ${cfg.version}
║  📡 Mode: ${cfg.mode}
║                            ║
║  _Powered by Soham_ ⚡     ║
╚══════════════════════╝`;

    const logoBuffer = cfg.botLogo;
    if (logoBuffer) {
        await sock.sendMessage(from, {
            image: logoBuffer,
            caption: aliveMsg
        }, { quoted: msg });
    } else {
        await msg.reply(aliveMsg);
    }
}

async function showPing(ctx) {
    const { msg } = ctx;
    const start = Date.now();
    await msg.reply('🏓 Pinging...');
    const end = Date.now();
    await msg.reply(`🏓 *Pong!*\n📊 Speed: *${end - start}ms*\n\n_© GODFATHER XMD | Powered by Soham_`);
}

async function showInfo(ctx) {
    const { msg, config: cfg } = ctx;
    const used = process.memoryUsage();
    const cpus = os.cpus();
    const uptime = formatUptime(process.uptime());

    const infoMsg = `
╔══════════════════════╗
║   *BOT INFORMATION*       ║
╠══════════════════════╣
║                            ║
║  🤖 Name: ${cfg.botName}
║  👤 Owner: ${cfg.ownerName}
║  📌 Version: ${cfg.version}
║  📡 Mode: ${cfg.mode}
║  ⏱️ Uptime: ${uptime}
║                            ║
║  *System Info:*            ║
║  💻 Platform: ${os.platform()}
║  🖥️ OS: ${os.type()}
║  📦 RAM: ${formatBytes(os.totalmem())}
║  💾 Used RAM: ${formatBytes(used.heapUsed)}
║  🔧 CPU: ${cpus[0]?.model || 'Unknown'}
║  📊 Cores: ${cpus.length}
║  📂 Node: ${process.version}
║                            ║
╚══════════════════════╝
_© GODFATHER XMD | Powered by Soham_`;

    await msg.reply(infoMsg);
}

async function showRuntime(ctx) {
    const { msg } = ctx;
    const uptime = formatUptime(process.uptime());
    await msg.reply(`⏱️ *Bot Runtime:* ${uptime}\n\n_© GODFATHER XMD | Powered by Soham_`);
}

async function showSpeed(ctx) {
    const { msg } = ctx;
    const start = Date.now();
    const used = process.memoryUsage();
    const end = Date.now();
    
    await msg.reply(`
⚡ *Speed Test*
━━━━━━━━━━━━━━━
📊 Response: ${end - start}ms
💾 RAM Usage: ${formatBytes(used.heapUsed)}
📦 Total RAM: ${formatBytes(used.heapTotal)}
━━━━━━━━━━━━━━━
_© GODFATHER XMD | Powered by Soham_`);
}

function formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${days}d ${hours}h ${minutes}m ${secs}s`;
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

module.exports = { handle, commands };