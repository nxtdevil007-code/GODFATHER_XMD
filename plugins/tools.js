const axios = require('axios');
const config = require('../config');
const { translate } = require('../lib/scraper');

const commands = {
    translate: cmdTranslate,
    tr: cmdTranslate,
    tts: cmdTTS,
    calc: cmdCalc,
    calculator: cmdCalc,
    math: cmdCalcMath,
    base64encode: cmdBase64Encode,
    base64decode: cmdBase64Decode,
    shorturl: cmdShortUrl,
    qr: cmdQR,
    removebg: cmdRemoveBG,
    ssweb: cmdScreenshot,
    ss: cmdScreenshot,
    whois: cmdWhois,
    tourl: cmdToUrl,
    ocr: cmdOCR,
    carbon: cmdCarbon,
    tempmail: cmdTempMail
};

async function handle(ctx) {
    const { command } = ctx;
    if (commands[command]) {
        await commands[command](ctx);
        return true;
    }
    return false;
}

async function cmdTranslate(ctx) {
    const { msg, args, text } = ctx;
    if (args.length < 2) return msg.reply('❌ Usage: .translate <lang> <text>\nExample: .translate en Hola mundo');
    
    const lang = args[0];
    const textToTranslate = args.slice(1).join(' ');
    
    try {
        const result = await translate(textToTranslate, lang);
        await msg.reply(`🌐 *Translation*\n━━━━━━━━━━━━━━━\n📝 Original: ${textToTranslate}\n🔄 Translated (${lang}): ${result}\n━━━━━━━━━━━━━━━\n_© GODFATHER XMD_`);
    } catch (e) {
        await msg.reply(`❌ Translation error: ${e.message}`);
    }
}

async function cmdTTS(ctx) {
    const { sock, msg, from, args, text } = ctx;
    if (!text) return msg.reply('❌ Please provide text!\nExample: .tts Hello World');
    
    const lang = args.length > 1 ? args[0] : 'en';
    const ttsText = args.length > 1 ? args.slice(1).join(' ') : text;
    
    try {
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(ttsText)}&tl=${lang}&client=tw-ob`;
        
        await sock.sendMessage(from, {
            audio: { url },
            mimetype: 'audio/mpeg',
            ptt: true
        }, { quoted: msg });
    } catch (e) {
        await msg.reply(`❌ TTS Error: ${e.message}`);
    }
}

async function cmdCalc(ctx) {
    const { msg, text } = ctx;
    if (!text) return msg.reply('❌ Please provide a math expression!\nExample: .calc 2+2*3');
    
    try {
        const math = require('mathjs');
        const result = math.evaluate(text);
        await msg.reply(`🧮 *Calculator*\n━━━━━━━━━━━━━━━\n📝 Expression: ${text}\n📊 Result: *${result}*\n━━━━━━━━━━━━━━━\n_© GODFATHER XMD_`);
    } catch (e) {
        await msg.reply(`❌ Invalid expression: ${e.message}`);
    }
}

async function cmdCalcMath(ctx) {
    return cmdCalc(ctx);
}

async function cmdBase64Encode(ctx) {
    const { msg, text } = ctx;
    if (!text) return msg.reply('❌ Please provide text to encode!');
    
    const encoded = Buffer.from(text).toString('base64');
    await msg.reply(`🔐 *Base64 Encode*\n━━━━━━━━━━━━━━━\n📝 Input: ${text}\n🔒 Encoded: ${encoded}\n━━━━━━━━━━━━━━━\n_© GODFATHER XMD_`);
}

async function cmdBase64Decode(ctx) {
    const { msg, text } = ctx;
    if (!text) return msg.reply('❌ Please provide base64 text to decode!');
    
    try {
        const decoded = Buffer.from(text, 'base64').toString('utf-8');
        await msg.reply(`🔓 *Base64 Decode*\n━━━━━━━━━━━━━━━\n🔒 Input: ${text}\n📝 Decoded: ${decoded}\n━━━━━━━━━━━━━━━\n_© GODFATHER XMD_`);
    } catch (e) {
        await msg.reply(`❌ Invalid base64 text!`);
    }
}

async function cmdShortUrl(ctx) {
    const { msg, text } = ctx;
    if (!text) return msg.reply('❌ Please provide a URL to shorten!');
    
    try {
        const { data } = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(text)}`);
        await msg.reply(`🔗 *URL Shortener*\n━━━━━━━━━━━━━━━\n📎 Original: ${text}\n🔗 Short: ${data}\n━━━━━━━━━━━━━━━\n_© GODFATHER XMD_`);
    } catch (e) {
        await msg.reply(`❌ Error: ${e.message}`);
    }
}

async function cmdQR(ctx) {
    const { sock, msg, from, text } = ctx;
    if (!text) return msg.reply('❌ Please provide text to generate QR code!');
    
    try {
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(text)}`;
        
        await sock.sendMessage(from, {
            image: { url: qrUrl },
            caption: `📱 *QR Code*\n📝 Data: ${text}\n\n_© GODFATHER XMD_`
        }, { quoted: msg });
    } catch (e) {
        await msg.reply(`❌ Error: ${e.message}`);
    }
}

async function cmdRemoveBG(ctx) {
    const { sock, msg, from } = ctx;
    const { downloadMediaMessage } = require('@whiskeysockets/baileys');
    
    const isImage = msg.type === 'imageMessage';
    const isQuotedImage = msg.quoted?.message?.imageMessage;
    
    if (!isImage && !isQuotedImage) {
        return msg.reply('❌ Send/reply to an image with .removebg');
    }
    
    await msg.react('⏳');
    
    try {
        let mediaMsg;
        if (isImage) {
            mediaMsg = msg;
        } else {
            mediaMsg = { message: msg.quoted.message };
        }
        
        const media = await downloadMediaMessage(mediaMsg, 'buffer', {});
        
        const FormData = require('form-data');
        const formData = new FormData();
        formData.append('size', 'auto');
        formData.append('image_file', media, { filename: 'image.png' });
        
        const response = await axios.post('https://api.remove.bg/v1.0/removebg', formData, {
            headers: {
                ...formData.getHeaders(),
                'X-Api-Key': 'your_removebg_api_key'
            },
            responseType: 'arraybuffer'
        });
        
        await sock.sendMessage(from, {
            image: Buffer.from(response.data),
            caption: '✅ Background removed!\n\n_© GODFATHER XMD_'
        }, { quoted: msg });
        
        await msg.react('✅');
    } catch (e) {
        await msg.react('❌');
        await msg.reply(`❌ Error: ${e.message}\n\n_Note: Remove.bg API key required_`);
    }
}

async function cmdScreenshot(ctx) {
    const { sock, msg, from, text } = ctx;
    if (!text) return msg.reply('❌ Please provide a URL!\nExample: .ssweb https://google.com');
    
    await msg.react('📸');
    
    try {
        let url = text;
        if (!url.startsWith('http')) url = 'https://' + url;
        
        const ssUrl = `https://api.screenshotmachine.com/?key=your_key&url=${encodeURIComponent(url)}&dimension=1366x768`;
        
        // Alternative free API
        const altUrl = `https://image.thum.io/get/fullpage/${url}`;
        
        await sock.sendMessage(from, {
            image: { url: altUrl },
            caption: `📸 *Website Screenshot*\n🔗 ${url}\n\n_© GODFATHER XMD_`
        }, { quoted: msg });
        
        await msg.react('✅');
    } catch (e) {
        await msg.react('❌');
        await msg.reply(`❌ Error: ${e.message}`);
    }
}

async function cmdWhois(ctx) {
    const { msg, text } = ctx;
    if (!text) return msg.reply('❌ Please provide a domain!\nExample: .whois google.com');
    
    try {
        const { data } = await axios.get(`https://api.lolhuman.xyz/api/whois?domain=${text}`);
        
        if (data && data.result) {
            const r = data.result;
            await msg.reply(`🌐 *WHOIS Lookup*\n━━━━━━━━━━━━━━━\n📛 Domain: ${r.domain || text}\n📅 Created: ${r.created || 'N/A'}\n📅 Updated: ${r.updated || 'N/A'}\n📅 Expires: ${r.expires || 'N/A'}\n🏢 Registrar: ${r.registrar || 'N/A'}\n━━━━━━━━━━━━━━━\n_© GODFATHER XMD_`);
        }
    } catch (e) {
        await msg.reply(`❌ Error: ${e.message}`);
    }
}

async function cmdToUrl(ctx) {
    const { sock, msg, from } = ctx;
    const { downloadMediaMessage } = require('@whiskeysockets/baileys');
    
    const hasMedia = msg.type === 'imageMessage' || msg.type === 'videoMessage' || 
                     msg.quoted?.message?.imageMessage || msg.quoted?.message?.videoMessage;
    
    if (!hasMedia) return msg.reply('❌ Send/reply to an image or video!');
    
    await msg.react('⏳');
    
    try {
        let mediaMsg;
        if (msg.type === 'imageMessage' || msg.type === 'videoMessage') {
            mediaMsg = msg;
        } else {
            mediaMsg = { message: msg.quoted.message };
        }
        
        const media = await downloadMediaMessage(mediaMsg, 'buffer', {});
        
        // Upload to telegraph or imgbb
        const FormData = require('form-data');
        const formData = new FormData();
        formData.append('image', media.toString('base64'));
        
        const { data } = await axios.post('https://api.imgbb.com/1/upload?key=your_imgbb_key', formData);
        
        if (data && data.data) {
            await msg.reply(`🔗 *Image URL*\n\n${data.data.url}\n\n_© GODFATHER XMD_`);
        }
        
        await msg.react('✅');
    } catch (e) {
        await msg.react('❌');
        await msg.reply(`❌ Error: ${e.message}`);
    }
}

async function cmdOCR(ctx) {
    const { msg } = ctx;
    
    const isImage = msg.type === 'imageMessage' || msg.quoted?.message?.imageMessage;
    if (!isImage) return msg.reply('❌ Send/reply to an image for OCR!');
    
    await msg.reply('📝 *OCR*\n\n_This feature requires an OCR API key. Configure it in settings._\n\n_© GODFATHER XMD_');
}

async function cmdCarbon(ctx) {
    const { sock, msg, from, text } = ctx;
    if (!text) return msg.reply('❌ Please provide code!\nExample: .carbon console.log("Hello")');
    
    await msg.react('⏳');
    
    try {
        const carbonUrl = `https://carbonnowsh.herokuapp.com/?code=${encodeURIComponent(text)}&theme=one-dark&bg=rgba(171,184,195,1)&t=one-dark&wt=none&l=auto&width=680&ds=true&dsyoff=20px&dsblur=68px&wc=true&wa=true&pv=56px&ph=56px&ln=false&fl=1&fm=Hack&fs=14px&lh=133%25&es=2x&wm=false`;
        
        await sock.sendMessage(from, {
            image: { url: carbonUrl },
            caption: '📝 *Code Snippet*\n\n_© GODFATHER XMD_'
        }, { quoted: msg });
        
        await msg.react('✅');
    } catch (e) {
        await msg.react('❌');
        await msg.reply(`❌ Error: ${e.message}`);
    }
}

async function cmdTempMail(ctx) {
    const { msg } = ctx;
    
    try {
        const { data } = await axios.get('https://api.guerrillamail.com/ajax.php?f=get_email_address');
        
        await msg.reply(`📧 *Temporary Email*\n━━━━━━━━━━━━━━━\n📬 Email: ${data.email_addr}\n⏱️ Valid for: 60 minutes\n━━━━━━━━━━━━━━━\n_© GODFATHER XMD_`);
    } catch (e) {
        await msg.reply(`❌ Error: ${e.message}`);
    }
}

module.exports = { handle, commands };