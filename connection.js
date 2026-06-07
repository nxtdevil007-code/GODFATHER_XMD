const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion, 
    makeCacheableSignalKeyStore,
    makeInMemoryStore,
    Browsers,
    delay,
    proto,
    getContentType
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs-extra');
const chalk = require('chalk');
const NodeCache = require('node-cache');
const config = require('./config');
const { handleMessage } = require('./lib/functions');
const { handleGroupUpdate, handleGroupParticipantsUpdate } = require('./lib/greeting');
const { initDatabase } = require('./lib/database');

const logger = pino({ level: 'silent' });
const msgRetryCounterCache = new NodeCache();
const store = makeInMemoryStore({ logger });

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger,
        printQRInTerminal: true,
        browser: Browsers.ubuntu('GODFATHER XMD'),
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, logger)
        },
        msgRetryCounterCache,
        defaultQueryTimeoutMs: undefined,
        generateHighQualityLinkPreview: true,
        syncFullHistory: false,
        markOnlineOnConnect: true
    });

    store.bind(sock.ev);

    // Initialize database
    initDatabase();

    // Connection updates
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log(chalk.yellow('\n📱 Scan the QR code above to connect GODFATHER XMD'));
        }

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log(chalk.red('Connection closed. Reconnecting...'), shouldReconnect);
            if (shouldReconnect) {
                startBot();
            } else {
                console.log(chalk.red('Connection logged out. Please delete session folder and restart.'));
            }
        }

        if (connection === 'open') {
            console.log(chalk.green('\n✅ GODFATHER XMD Connected Successfully!'));
            console.log(chalk.hex('#FFD700')('━'.repeat(50)));
            console.log(chalk.hex('#FFD700')(`  Bot Name: ${config.botName}`));
            console.log(chalk.hex('#FFD700')(`  Owner: ${config.ownerName}`));
            console.log(chalk.hex('#FFD700')(`  Prefix: ${config.prefix}`));
            console.log(chalk.hex('#FFD700')(`  Mode: ${config.mode}`));
            console.log(chalk.hex('#FFD700')(`  Version: ${config.version}`));
            console.log(chalk.hex('#FFD700')('━'.repeat(50)));

            // Send connection message to owner
            try {
                const ownerJid = config.ownerNumber;
                const logoBuffer = config.botLogo;
                
                const connMsg = `╔══════════════════════╗
║  *GODFATHER XMD*          ║
║  _Powered by Soham_       ║
╠══════════════════════╣
║                            ║
║ ✅ Bot Connected!          ║
║                            ║
║ 📛 Bot: ${config.botName}
║ 👤 Owner: ${config.ownerName}
║ 🔧 Prefix: ${config.prefix}
║ 📡 Mode: ${config.mode}
║ 📌 Version: ${config.version}
║                            ║
║ Type ${config.prefix}menu for  ║
║ command list               ║
║                            ║
╚══════════════════════╝

_© GODFATHER XMD | Powered by Soham_`;

                if (logoBuffer) {
                    await sock.sendMessage(ownerJid, { 
                        image: logoBuffer, 
                        caption: connMsg 
                    });
                } else {
                    await sock.sendMessage(ownerJid, { text: connMsg });
                }
            } catch (e) {
                console.log(chalk.yellow('Could not send connection message to owner'));
            }
        }
    });

    // Save credentials
    sock.ev.on('creds.update', saveCreds);

    // Handle messages
    sock.ev.on('messages.upsert', async (m) => {
        if (m.type !== 'notify') return;
        const msg = m.messages[0];
        if (!msg.message) return;
        if (msg.key && msg.key.remoteJid === 'status@broadcast') return;

        try {
            await handleMessage(sock, msg, store);
        } catch (e) {
            console.error(chalk.red('Error handling message:'), e);
        }
    });

    // Group updates
    sock.ev.on('groups.update', async (updates) => {
        for (const update of updates) {
            await handleGroupUpdate(sock, update);
        }
    });

    // Group participants updates (welcome/goodbye)
    sock.ev.on('group-participants.update', async (update) => {
        await handleGroupParticipantsUpdate(sock, update);
    });

    // Auto-read messages
    if (config.autoRead) {
        sock.ev.on('messages.upsert', async (m) => {
            if (m.type === 'notify') {
                await sock.readMessages([m.messages[0].key]);
            }
        });
    }

    return sock;
}

module.exports = { startBot };