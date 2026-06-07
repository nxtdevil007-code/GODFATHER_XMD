require('dotenv').config();
const fs = require('fs');
const path = require('path');

const config = {
    botName: process.env.BOT_NAME || 'GODFATHER XMD',
    ownerName: process.env.OWNER_NAME || 'Soham',
    ownerNumber: (process.env.OWNER_NUMBER || '919876543210') + '@s.whatsapp.net',
    ownerNumbers: [
        (process.env.OWNER_NUMBER || '919876543210') + '@s.whatsapp.net'
    ],
    prefix: process.env.PREFIX || '.',
    mode: process.env.MODE || 'public', // public, private, group
    antilink: process.env.ANTILINK === 'true',
    welcome: process.env.WELCOME === 'true',
    autoRead: process.env.AUTO_READ === 'true',
    autoTyping: process.env.AUTO_TYPING === 'true',
    autoRecording: process.env.AUTO_RECORDING === 'true',
    openaiKey: process.env.OPENAI_API_KEY || '',
    sessionId: process.env.SESSION_ID || '',
    
    // Bot branding
    footer: '© GODFATHER XMD | Powered by Soham',
    botLogo: fs.existsSync(path.join(__dirname, 'media', 'godfather.jpg')) 
        ? fs.readFileSync(path.join(__dirname, 'media', 'godfather.jpg'))
        : null,
    
    // Sticker pack info
    packname: 'GODFATHER',
    author: 'XMD by Soham',
    
    // Database
    dbPath: path.join(__dirname, 'database', 'db.json'),
    
    // Timeouts
    timeout: 60000,
    
    // Version
    version: '2.0.0'
};

module.exports = config;