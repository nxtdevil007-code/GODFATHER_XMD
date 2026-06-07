const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const fs = require('fs-extra');
const path = require('path');

const commands = {
    toaudio: cmdToAudio,
    tomp3: cmdToAudio,
    tovideo: cmdToVideo,
    tomp4: cmdToVideo,
    togif: cmdToGif,
    toptt: cmdToPtt,
    tovn: cmdToPtt,
    toimage: cmdToImage
};

async function handle(ctx) {
    const { command } = ctx;
    if (commands[command]) {
        await commands[command](ctx);
        return true;
    }
    return false;
}

async function cmdToAudio(ctx) {
    const { sock, msg, from } = ctx;
    
    const isVideo = msg.type === 'videoMessage' || msg.quoted?.message?.videoMessage;
    const isAudio = msg.type === 'audioMessage' || msg.quoted?.message?.audioMessage;
    
    if (!isVideo && !isAudio) {
        return msg.reply('❌ Send/reply to a video or audio to convert to MP3!');
    }
    
    await msg.react('⏳');
    
    try {
        let mediaMsg;
        if (msg.type === 'videoMessage' || msg.type === 'audioMessage') {
            mediaMsg = msg;
        } else {
            mediaMsg = { message: msg.quoted.message };
        }
        
        const media = await downloadMediaMessage(mediaMsg, 'buffer', {});
        const tempInput = path.join(__dirname, '..', 'temp', `input_${Date.now()}.mp4`);
        const tempOutput = path.join(__dirname, '..', 'temp', `output_${Date.now()}.mp3`);
        
        fs.writeFileSync(tempInput, media);
        
        const ffmpeg = require('fluent-ffmpeg');
        
        await new Promise((resolve, reject) => {
            ffmpeg(tempInput)
                .toFormat('mp3')
                .audioBitrate(128)
                .save(tempOutput)
                .on('end', resolve)
                .on('error', reject);
        });
        
        const audioBuffer = fs.readFileSync(tempOutput);
        
        await sock.sendMessage(from, {
            audio: audioBuffer,
            mimetype: 'audio/mpeg',
            ptt: false
        }, { quoted: msg });
        
        await msg.react('✅');
        
        fs.unlinkSync(tempInput);
        fs.unlinkSync(tempOutput);
    } catch (e) {
        await msg.react('❌');
        await msg.reply(`❌ Error: ${e.message}`);
    }
}

async function cmdToVideo(ctx) {
    const { sock, msg, from } = ctx;
    
    const isGif = msg.type === 'videoMessage' && msg.message?.videoMessage?.gifPlayback;
    const isQuotedGif = msg.quoted?.message?.videoMessage?.gifPlayback;
    
    if (!isGif && !isQuotedGif) {
        return msg.reply('❌ Send/reply to a GIF to convert to video!');
    }
    
    await msg.react('⏳');
    
    try {
        let mediaMsg;
        if (isGif) {
            mediaMsg = msg;
        } else {
            mediaMsg = { message: msg.quoted.message };
        }
        
        const media = await downloadMediaMessage(mediaMsg, 'buffer', {});
        
        await sock.sendMessage(from, {
            video: media,
            caption: '_Converted by GODFATHER XMD_'
        }, { quoted: msg });
        
        await msg.react('✅');
    } catch (e) {
        await msg.react('❌');
        await msg.reply(`❌ Error: ${e.message}`);
    }
}

async function cmdToGif(ctx) {
    const { sock, msg, from } = ctx;
    
    const isVideo = msg.type === 'videoMessage' || msg.quoted?.message?.videoMessage;
    const isSticker = msg.type === 'stickerMessage' || msg.quoted?.message?.stickerMessage