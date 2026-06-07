const axios = require('axios');
const config = require('../config');
const { ytSearch, ytMp3, ytMp4 } = require('../lib/scraper');

const commands = {
    play: cmdPlay,
    song: cmdSong,
    video: cmdVideo,
    ytmp3: cmdYtMp3,
    ytmp4: cmdYtMp4,
    tiktok: cmdTikTok,
    tt: cmdTikTok,
    instagram: cmdInstagram,
    ig: cmdInstagram,
    facebook: cmdFacebook,
    fb: cmdFacebook,
    mediafire: cmdMediafire,
    apk: cmdApk
};

async function handle(ctx) {
    const { command } = ctx;
    if (commands[command]) {
        await commands[command](ctx);
        return true;
    }
    return false;
}

async function cmdPlay(ctx) {
    const { sock, msg, from, text } = ctx;
    if (!text) return msg.reply('❌ Please provide a song name!\nExample: .play Shape of You');
    
    await msg.react('🔍');
    
    try {
        const yts = require('yt-search');
        const results = await yts(text);
        const video = results.videos[0];
        
        if (!video) return msg.reply('❌ No results found!');
        
        const infoMsg = `
🎵 *GODFATHER XMD - Music Player*
━━━━━━━━━━━━━━━━━━━
📌 *Title:* ${video.title}
⏱️ *Duration:* ${video.timestamp}
👤 *Channel:* ${video.author.name}
👁️ *Views:* ${video.views.toLocaleString()}
🔗 *URL:* ${video.url}
━━━━━━━━━━━━━━━━━━━
_Downloading audio..._

_© GODFATHER XMD | Powered by Soham_`;

        await sock.sendMessage(from, {
            image: { url: video.thumbnail },
            caption: infoMsg
        }, { quoted: msg });
        
        await msg.react('⬇️');
        
        // Download audio
        try {
            const apiUrl = `https://api.dreaded.site/api/ytdl/audio?url=${video.url}`;
            const response = await axios.get(apiUrl);
            
            if (response.data && response.data.result) {
                await sock.sendMessage(from, {
                    audio: { url: response.data.result },
                    mimetype: 'audio/mpeg',
                    ptt: false
                }, { quoted: msg });
                
                await msg.react('✅');
            } else {
                await msg.reply('❌ Failed to download audio. Try again later.');
            }
        } catch (e) {
            // Fallback
            await msg.reply(`❌ Download failed: ${e.message}\n\n🔗 You can download from: ${video.url}`);
        }
    } catch (e) {
        await msg.react('❌');
        await msg.reply(`❌ Error: ${e.message}`);
    }
}

async function cmdSong(ctx) {
    return cmdPlay(ctx);
}

async function cmdVideo(ctx) {
    const { sock, msg, from, text } = ctx;
    if (!text) return msg.reply('❌ Please provide a video name!\nExample: .video Shape of You');
    
    await msg.react('🔍');
    
    try {
        const yts = require('yt-search');
        const results = await yts(text);
        const video = results.videos[0];
        
        if (!video) return msg.reply('❌ No results found!');
        
        await sock.sendMessage(from, {
            image: { url: video.thumbnail },
            caption: `🎬 *${video.title}*\n⏱️ ${video.timestamp} | 👁️ ${video.views.toLocaleString()}\n\n_Downloading video..._\n\n_© GODFATHER XMD_`
        }, { quoted: msg });
        
        await msg.react('⬇️');
        
        try {
            const apiUrl = `https://api.dreaded.site/api/ytdl/video?url=${video.url}`;
            const response = await axios.get(apiUrl);
            
            if (response.data && response.data.result) {
                await sock.sendMessage(from, {
                    video: { url: response.data.result },
                    caption: `🎬 *${video.title}*\n\n_© GODFATHER XMD | Powered by Soham_`
                }, { quoted: msg });
                
                await msg.react('✅');
            }
        } catch (e) {
            await msg.reply(`❌ Download failed. Try: ${video.url}`);
        }
    } catch (e) {
        await msg.react('❌');
        await msg.reply(`❌ Error: ${e.message}`);
    }
}

async function cmdYtMp3(ctx) {
    const { sock, msg, from, text } = ctx;
    if (!text) return msg.reply('❌ Please provide a YouTube URL!');
    
    if (!text.includes('youtu')) return msg.reply('❌ Please provide a valid YouTube URL!');
    
    await msg.react('⬇️');
    
    try {
        const apiUrl = `https://api.dreaded.site/api/ytdl/audio?url=${text}`;
        const response = await axios.get(apiUrl);
        
        if (response.data && response.data.result) {
            await sock.sendMessage(from, {
                audio: { url: response.data.result },
                mimetype: 'audio/mpeg',
                ptt: false
            }, { quoted: msg });
            
            await msg.react('✅');
        } else {
            await msg.reply('❌ Failed to download!');
        }
    } catch (e) {
        await msg.react('❌');
        await msg.reply(`❌ Error: ${e.message}`);
    }
}

async function cmdYtMp4(ctx) {
    const { sock, msg, from, text } = ctx;
    if (!text) return msg.reply('❌ Please provide a YouTube URL!');
    
    if (!text.includes('youtu')) return msg.reply('❌ Please provide a valid YouTube URL!');
    
    await msg.react('⬇️');
    
    try {
        const apiUrl = `https://api.dreaded.site/api/ytdl/video?url=${text}`;
        const response = await axios.get(apiUrl);
        
        if (response.data && response.data.result) {
            await sock.sendMessage(from, {
                video: { url: response.data.result },
                caption: '_© GODFATHER XMD | Powered by Soham_'
            }, { quoted: msg });
            
            await msg.react('✅');
        }
    } catch (e) {
        await msg.react('❌');
        await msg.reply(`❌ Error: ${e.message}`);
    }
}

async function cmdTikTok(ctx) {
    const { sock, msg, from, text } = ctx;
    if (!text) return msg.reply('❌ Please provide a TikTok URL!');
    
    await msg.react('⬇️');
    
    try {
        const apiUrl = `https://api.dreaded.site/api/tiktok?url=${text}`;
        const response = await axios.get(apiUrl);
        
        if (response.data && response.data.result) {
            await sock.sendMessage(from, {
                video: { url: response.data.result },
                caption: '_© GODFATHER XMD | Powered by Soham_'
            }, { quoted: msg });
            
            await msg.react('✅');
        } else {
            await msg.reply('❌ Failed to download TikTok video!');
        }
    } catch (e) {
        await msg.react('❌');
        await msg.reply(`❌ Error: ${e.message}`);
    }
}

async function cmdInstagram(ctx) {
    const { sock, msg, from, text } = ctx;
    if (!text) return msg.reply('❌ Please provide an Instagram URL!');
    
    await msg.react('⬇️');
    
    try {
        const apiUrl = `https://api.dreaded.site/api/igdl?url=${text}`;
        const response = await axios.get(apiUrl);
        
        if (response.data && response.data.result) {
            const mediaUrl = response.data.result;
            
            // Try sending as video first, then image
            try {
                await sock.sendMessage(from, {
                    video: { url: mediaUrl },
                    caption: '_© GODFATHER XMD | Powered by Soham_'
                }, { quoted: msg });
            } catch {
                await sock.sendMessage(from, {
                    image: { url: mediaUrl },
                    caption: '_© GODFATHER XMD | Powered by Soham_'
                }, { quoted: msg });
            }
            
            await msg.react('✅');
        } else {
            await msg.reply('❌ Failed to download Instagram post!');
        }
    } catch (e) {
        await msg.react('❌');
        await msg.reply(`❌ Error: ${e.message}`);
    }
}

async function cmdFacebook(ctx) {
    const { sock, msg, from, text } = ctx;
    if (!text) return msg.reply('❌ Please provide a Facebook URL!');
    
    await msg.react('⬇️');
    
    try {
        const apiUrl = `https://api.dreaded.site/api/fbdl?url=${text}`;
        const response = await axios.get(apiUrl);
        
        if (response.data && response.data.result) {
            await sock.sendMessage(from, {
                video: { url: response.data.result },
                caption: '_© GODFATHER XMD | Powered by Soham_'
            }, { quoted: msg });
            
            await msg.react('✅');
        }
    } catch (e) {
        await msg.react('❌');
        await msg.reply(`❌ Error: ${e.message}`);
    }
}

async function cmdMediafire(ctx) {
    const { sock, msg, from, text } = ctx;
    if (!text) return msg.reply('❌ Please provide a Mediafire URL!');
    
    await msg.react('⬇️');
    
    try {
        const response = await axios.get(text);
        const cheerio = require('cheerio');
        const $ = cheerio.load(response.data);
        
        const downloadUrl = $('a#downloadButton').attr('href');
        const fileName = $('div.filename').text().trim();
        const fileSize = $('span.dl-btn-label').text().trim();
        
        if (downloadUrl) {
            await sock.sendMessage(from, {
                document: { url: downloadUrl },
                fileName: fileName,
                caption: `📁 *${fileName}*\n📊 ${fileSize}\n\n_© GODFATHER XMD_`
            }, { quoted: msg });
            
            await msg.react('✅');
        }
    } catch (e) {
        await msg.react('❌');
        await msg.reply(`❌ Error: ${e.message}`);
    }
}

async function cmdApk(ctx) {
    const { sock, msg, from, text } = ctx;
    if (!text) return msg.reply('❌ Please provide an app name!\nExample: .apk WhatsApp');
    
    await msg.react('🔍');
    
    try {
        await msg.reply(`🔍 Searching for *${text}* APK...\n\n_This feature requires an APK API. Please provide a direct APK download link instead._\n\n_© GODFATHER XMD_`);
    } catch (e) {
        await msg.reply(`❌ Error: ${e.message}`);
    }
}

module.exports = { handle, commands };