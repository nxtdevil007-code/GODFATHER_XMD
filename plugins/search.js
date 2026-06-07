const axios = require('axios');
const config = require('../config');
const { googleSearch, wikipedia, getWeather, getLyrics } = require('../lib/scraper');

const commands = {
    google: cmdGoogle,
    ytsearch: cmdYtSearch,
    image: cmdImage,
    img: cmdImage,
    wiki: cmdWiki,
    wikipedia: cmdWiki,
    weather: cmdWeather,
    lyrics: cmdLyrics,
    news: cmdNews,
    github: cmdGithub,
    pinterest: cmdPinterest
};

async function handle(ctx) {
    const { command } = ctx;
    if (commands[command]) {
        await commands[command](ctx);
        return true;
    }
    return false;
}

async function cmdGoogle(ctx) {
    const { msg, text } = ctx;
    if (!text) return msg.reply('❌ Please provide a search query!\nExample: .google What is AI');
    
    await msg.react('🔍');
    
    try {
        const results = await googleSearch(text);
        
        let response = `🔍 *Google Search Results*\n📝 Query: *${text}*\n━━━━━━━━━━━━━━━\n\n`;
        
        results.forEach((result, i) => {
            response += `*${i + 1}. ${result.title}*\n`;
            response += `📎 ${result.link}\n`;
            response += `📄 ${result.snippet || 'No description'}\n\n`;
        });
        
        response += `━━━━━━━━━━━━━━━\n_© GODFATHER XMD | Powered by Soham_`;
        
        await msg.reply(response);
        await msg.react('✅');
    } catch (e) {
        await msg.react('❌');
        await msg.reply(`❌ Error: ${e.message}`);
    }
}

async function cmdYtSearch(ctx) {
    const { sock, msg, from, text } = ctx;
    if (!text) return msg.reply('❌ Please provide a search query!');
    
    await msg.react('🔍');
    
    try {
        const yts = require('yt-search');
        const results = await yts(text);
        const videos = results.videos.slice(0, 10);
        
        let response = `🔍 *YouTube Search Results*\n📝 Query: *${text}*\n━━━━━━━━━━━━━━━\n\n`;
        
        videos.forEach((video, i) => {
            response += `*${i + 1}. ${video.title}*\n`;
            response += `⏱️ ${video.timestamp} | 👁️ ${video.views.toLocaleString()}\n`;
            response += `👤 ${video.author.name}\n`;
            response += `🔗 ${video.url}\n\n`;
        });
        
        response += `━━━━━━━━━━━━━━━\n_© GODFATHER XMD | Powered by Soham_`;
        
        await msg.reply(response);
        await msg.react('✅');
    } catch (e) {
        await msg.react('❌');
        await msg.reply(`❌ Error: ${e.message}`);
    }
}

async function cmdImage(ctx) {
    const { sock, msg, from, text } = ctx;
    if (!text) return msg.reply('❌ Please provide a search query!\nExample: .image cats');
    
    await msg.react('🔍');
    
    try {
        const apiUrl = `https://api.lolhuman.xyz/api/gimage?query=${encodeURIComponent(text)}`;
        const { data } = await axios.get(apiUrl);
        
        if (data && data.result) {
            const images = Array.isArray(data.result) ? data.result.slice(0, 5) : [data.result];
            
            for (const imageUrl of images) {
                await sock.sendMessage(from, {
                    image: { url: imageUrl },
                    caption: `🖼️ *${text}*\n\n_© GODFATHER XMD | Powered by Soham_`
                }, { quoted: msg });
            }
            await msg.react('✅');
        } else {
            // Fallback - use another API
            const fallbackUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(text)}&per_page=5&client_id=your_unsplash_key`;
            await msg.reply('❌ No images found. Try a different query.');
        }
    } catch (e) {
        await msg.react('❌');
        await msg.reply(`❌ Error: ${e.message}`);
    }
}

async function cmdWiki(ctx) {
    const { sock, msg, from, text } = ctx;
    if (!text) return msg.reply('❌ Please provide a search query!');
    
    await msg.react('🔍');
    
    try {
        const result = await wikipedia(text);
        
        const wikiMsg = `📚 *Wikipedia*
━━━━━━━━━━━━━━━
📌 *Title:* ${result.title}
📄 *Summary:*
${result.extract}

🔗 *Link:* ${result.content_urls?.desktop?.page || 'N/A'}
━━━━━━━━━━━━━━━
_© GODFATHER XMD | Powered by Soham_`;

        if (result.thumbnail) {
            await sock.sendMessage(from, {
                image: { url: result.thumbnail.source },
                caption: wikiMsg
            }, { quoted: msg });
        } else {
            await msg.reply(wikiMsg);
        }
        
        await msg.react('✅');
    } catch (e) {
        await msg.react('❌');
        await msg.reply(`❌ Error: ${e.message}`);
    }
}

async function cmdWeather(ctx) {
    const { msg, text } = ctx;
    if (!text) return msg.reply('❌ Please provide a city name!\nExample: .weather London');
    
    await msg.react('🌤️');
    
    try {
        const data = await getWeather(text);
        
        const weatherMsg = `🌤️ *Weather Report*
━━━━━━━━━━━━━━━
📍 *Location:* ${data.name}, ${data.sys.country}
🌡️ *Temperature:* ${data.main.temp}°C
🤒 *Feels Like:* ${data.main.feels_like}°C
💧 *Humidity:* ${data.main.humidity}%
🌬️ *Wind:* ${data.wind.speed} m/s
☁️ *Condition:* ${data.weather[0].description}
👁️ *Visibility:* ${(data.visibility / 1000).toFixed(1)} km
📊 *Pressure:* ${data.main.pressure} hPa
━━━━━━━━━━━━━━━
_© GODFATHER XMD | Powered by Soham_`;

        await msg.reply(weatherMsg);
        await msg.react('✅');
    } catch (e) {
        await msg.react('❌');
        await msg.reply(`❌ City not found or API error!`);
    }
}

async function cmdLyrics(ctx) {
    const { msg, text } = ctx;
    if (!text) return msg.reply('❌ Please provide a song name!\nExample: .lyrics Shape of You');
    
    await msg.react('🎵');
    
    try {
        const apiUrl = `https://api.lolhuman.xyz/api/lirik?query=${encodeURIComponent(text)}`;
        const { data } = await axios.get(apiUrl);
        
        if (data && data.result) {
            const lyrics = data.result;
            const lyricsMsg = `🎵 *Lyrics*
━━━━━━━━━━━━━━━
📌 *Song:* ${text}
━━━━━━━━━━━━━━━

${lyrics.substring(0, 4000)}

${lyrics.length > 4000 ? '\n...(truncated)' : ''}
━━━━━━━━━━━━━━━
_© GODFATHER XMD | Powered by Soham_`;

            await msg.reply(lyricsMsg);
            await msg.react('✅');
        } else {
            await msg.reply('❌ Lyrics not found!');
        }
    } catch (e) {
        await msg.react('❌');
        await msg.reply(`❌ Error: ${e.message}`);
    }
}

async function cmdNews(ctx) {
    const { msg, text } = ctx;
    
    await msg.react('📰');
    
    try {
        const query = text || 'technology';
        const apiUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&pageSize=5&apiKey=your_newsapi_key`;
        
        // Fallback to basic news
        let newsMsg = `📰 *Latest News*\n━━━━━━━━━━━━━━━\n\n`;
        newsMsg += `_Use Google News for latest updates:_\n`;
        newsMsg += `🔗 https://news.google.com/search?q=${encodeURIComponent(query)}\n\n`;
        newsMsg += `━━━━━━━━━━━━━━━\n_© GODFATHER XMD | Powered by Soham_`;
        
        await msg.reply(newsMsg);
        await msg.react('✅');
    } catch (e) {
        await msg.reply(`❌ Error: ${e.message}`);
    }
}

async function cmdGithub(ctx) {
    const { sock, msg, from, text } = ctx;
    if (!text) return msg.reply('❌ Please provide a GitHub username!\nExample: .github torvalds');
    
    await msg.react('🔍');
    
    try {
        const { data } = await axios.get(`https://api.github.com/users/${text}`);
        
        const ghMsg = `🐙 *GitHub Profile*
━━━━━━━━━━━━━━━
📛 *Name:* ${data.name || 'N/A'}
👤 *Username:* ${data.login}
📝 *Bio:* ${data.bio || 'N/A'}
📍 *Location:* ${data.location || 'N/A'}
🏢 *Company:* ${data.company || 'N/A'}
📦 *Repos:* ${data.public_repos}
👥 *Followers:* ${data.followers}
👤 *Following:* ${data.following}
🔗 *Profile:* ${data.html_url}
📅 *Joined:* ${new Date(data.created_at).toLocaleDateString()}
━━━━━━━━━━━━━━━
_© GODFATHER XMD | Powered by Soham_`;

        await sock.sendMessage(from, {
            image: { url: data.avatar_url },
            caption: ghMsg
        }, { quoted: msg });
        
        await msg.react('✅');
    } catch (e) {
        await msg.react('❌');
        await msg.reply(`❌ GitHub user not found!`);
    }
}

async function cmdPinterest(ctx) {
    const { sock, msg, from, text } = ctx;
    if (!text) return msg.reply('❌ Please provide a search query!');
    
    await msg.react('🔍');
    
    try {
        const apiUrl = `https://api.lolhuman.xyz/api/pinterest?query=${encodeURIComponent(text)}`;
        const { data } = await axios.get(apiUrl);
        
        if (data && data.result) {
            const images = Array.isArray(data.result) ? data.result.slice(0, 5) : [data.result];
            
            for (const imageUrl of images) {
                await sock.sendMessage(from, {
                    image: { url: imageUrl },
                    caption: `📌 *Pinterest:* ${text}\n\n_© GODFATHER XMD_`
                }, { quoted: msg });
            }
            await msg.react('✅');
        }
    } catch (e) {
        await msg.react('❌');
        await msg.reply(`❌ Error: ${e.message}`);
    }
}

module.exports = { handle, commands };