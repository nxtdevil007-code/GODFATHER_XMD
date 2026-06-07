const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const fs = require('fs-extra');
const path = require('path');
const config = require('../config');

const commands = {
    sticker: cmdSticker,
    s: cmdSticker,
    toimg: cmdToImg,
    toimage: cmdToImg,
    steal: cmdSteal,
    attp: cmdAttp,
    emojimix: cmdEmojiMix,
    round: cmdRound
};

async function handle(ctx) {
    const { command } = ctx;
    if (commands[command]) {
        await commands[command](ctx);
        return true;
    }
    return false;
}

async function cmdSticker(ctx) {
    const { sock, msg, from, text } = ctx;
    
    const isImage = msg.type === 'imageMessage';
    const isVideo = msg.type === 'videoMessage';
    const isQuotedImage = msg.quoted?.message?.imageMessage;
    const isQuotedVideo = msg.quoted?.message?.videoMessage;
    
    if (!isImage && !isVideo && !isQuotedImage && !isQuotedVideo) {
        return msg.reply('❌ Send/reply to an image or video with .sticker');
    }
    
    await msg.react('⏳');
    
    try {
        let mediaMsg;
        if (isImage || isVideo) {
            mediaMsg = msg;
        } else {
            mediaMsg = { message: msg.quoted.message };
        }
        
        const media = await downloadMediaMessage(mediaMsg, 'buffer', {});
        
        // Parse pack name and author
        let packname = config.packname;
        let author = config.author;
        if (text) {
            const parts = text.split('|').map(p => p.trim());
            if (parts[0]) packname = parts[0];
            if (parts[1]) author = parts[1];
        }
        
        const tempFile = path.join(__dirname, '..', 'temp', `sticker_${Date.now()}`);
        const inputFile = tempFile + (isImage || isQuotedImage ? '.png' : '.mp4');
        const outputFile = tempFile + '.webp';
        
        fs.writeFileSync(inputFile, media);
        
        // Convert to webp using ffmpeg
        const ffmpeg = require('fluent-ffmpeg');
        
        await new Promise((resolve, reject) => {
            ffmpeg(inputFile)
                .outputOptions([
                    '-vcodec', 'libwebp',
                    '-vf', "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15,pad=320:320:-1:-1:color=white@0.0,split[a][b];[a]palettegen=reserve_transparent=on:transparency_color=ffffff[p];[b][p]paletteuse",
                    '-loop', '0',
                    '-ss', '00:00:00',
                    '-t', '00:00:05',
                    '-preset', 'default',
                    '-an',
                    '-vsync', '0'
                ])
                .toFormat('webp')
                .save(outputFile)
                .on('end', resolve)
                .on('error', reject);
        });
        
        const stickerBuffer = fs.readFileSync(outputFile);
        
        await sock.sendMessage(from, {
            sticker: stickerBuffer,
            packname: packname,
            author: author
        }, { quoted: msg });
        
        await msg.react('✅');
        
        // Cleanup
        fs.unlinkSync(inputFile);
        fs.unlinkSync(outputFile);
    } catch (e) {
        await msg.react('❌');
        await msg.reply(`❌ Error creating sticker: ${e.message}`);
    }
}

async function cmdToImg(ctx) {
    const { sock, msg, from } = ctx;
    
    const isSticker = msg.type === 'stickerMessage';
    const isQuotedSticker = msg.quoted?.message?.stickerMessage;
    
    if (!isSticker && !isQuotedSticker) {
        return msg.reply('❌ Reply to a sticker with .toimg');
    }
    
    await msg.react('⏳');
    
    try {
        let mediaMsg;
        if (isSticker) {
            mediaMsg = msg;
        } else {
            mediaMsg = { message: msg.quoted.message };
        }
        
        const media = await downloadMediaMessage(mediaMsg, 'buffer', {});
        
        await sock.sendMessage(from, {
            image: media,
            caption: '_© GODFATHER XMD | Powered by Soham_'
        }, { quoted: msg });
        
        await msg.react('✅');
    } catch (e) {
        await msg.react('❌');
        await msg.reply(`❌ Error: ${e.message}`);
    }
}

async function cmdSteal(ctx) {
    const { sock, msg, from, text } = ctx;
    
    const isSticker = msg.type === 'stickerMessage';
    const isQuotedSticker = msg.quoted?.message?.stickerMessage;
    
    if (!isSticker && !isQuotedSticker) {
        return msg.reply('❌ Reply to a sticker with .steal packname | author');
    }
    
    let packname = config.packname;
    let author = config.author;
    if (text) {
        const parts = text.split('|').map(p => p.trim());
        if (parts[0]) packname = parts[0];
        if (parts[1]) author = parts[1];
    }
    
    try {
        let mediaMsg;
        if (isSticker) {
            mediaMsg = msg;
        } else {
            mediaMsg = { message: msg.quoted.message };
        }
        
        const media = await downloadMediaMessage(mediaMsg, 'buffer', {});
        
        await sock.sendMessage(from, {
            sticker: media,
            packname: packname,
            author: author
        }, { quoted: msg });
    } catch (e) {
        await msg.reply(`❌ Error: ${e.message}`);
    }
}

async function cmdAttp(ctx) {
    const { sock, msg, from, text } = ctx;
    if (!text) return msg.reply('❌ Please provide text! Example: .attp Hello');
    
    await msg.react('⏳');
    
    try {
        const axios = require('axios');
        const apiUrl = `https://api.lolhuman.xyz/api/attp?text=${encodeURIComponent(text)}`;
        
        const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
        
        await sock.sendMessage(from, {
            sticker: Buffer.from(response.data),
            packname: config.packname,
            author: config.author
        }, { quoted: msg });
        
        await msg.react('✅');
    } catch (e) {
        await msg.react('❌');
        // Fallback: create simple text sticker
        await msg.reply(`❌ Error creating animated text sticker: ${e.message}`);
    }
}

async function cmdEmojiMix(ctx) {
    const { sock, msg, from, text } = ctx;
    if (!text) return msg.reply('❌ Usage: .emojimix 😀+😎');
    
    const emojis = text.split('+').map(e => e.trim());
    if (emojis.length !== 2) return msg.reply('❌ Usage: .emojimix 😀+😎');
    
    await msg.react('⏳');
    
    try {
        const axios = require('axios');
        const url = `https://tenor.googleapis.com/v2/featured?key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&contentfilter=high&media_filter=png_transparent&component=proactive&collection=emoji_kitchen_v5&q=${encodeURIComponent(emojis[0])}_${encodeURIComponent(emojis[1])}`;
        
        const { data } = await axios.get(url);
        
        if (data.results && data.results.length > 0) {
            const imageUrl = data.results[0].media_formats.png_transparent.url;
            const imageRes = await axios.get(imageUrl, { responseType: 'arraybuffer' });
            
            await sock.sendMessage(from, {
                sticker: Buffer.from(imageRes.data),
                packname: config.packname,
                author: config.author
            }, { quoted: msg });
            
            await msg.react('✅');
        } else {
            await msg.reply('❌ Emoji combination not found!');
        }
    } catch (e) {
        await msg.react('❌');
        await msg.reply(`❌ Error: ${e.message}`);
    }
}

async function cmdRound(ctx) {
    const { sock, msg, from } = ctx;
    
    const isImage = msg.type === 'imageMessage';
    const isQuotedImage = msg.quoted?.message?.imageMessage;
    
    if (!isImage && !isQuotedImage) {
        return msg.reply('❌ Send/reply to an image with .round');
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
        const sharp = require('sharp');
        
        const image = sharp(media);
        const metadata = await image.metadata();
        const size = Math.min(metadata.width, metadata.height);
        
        const roundedCorners = Buffer.from(
            `<svg><rect x="0" y="0" width="${size}" height="${size}" rx="${size/2}" ry="${size/2}"/></svg>`
        );
        
        const roundedImage = await image
            .resize(size, size)
            .composite([{
                input: roundedCorners,
                blend: 'dest-in'
            }])
            .webp()
            .toBuffer();
        
        await sock.sendMessage(from, {
            sticker: roundedImage,
            packname: config.packname,
            author: config.author
        }, { quoted: msg });
        
        await msg.react('✅');
    } catch (e) {
        await msg.react('❌');
        await msg.reply(`❌ Error: ${e.message}`);
    }
}

module.exports = { handle, commands };