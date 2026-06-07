const axios = require('axios');
const config = require('../config');
const { waifuImage, animeQuote } = require('../lib/scraper');

const commands = {
    waifu: cmdWaifu,
    neko: cmdAnimeImg,
    shinobu: cmdAnimeImg,
    megumin: cmdAnimeImg,
    cuddle: cmdAnimeImg,
    hug: cmdAnimeImg,
    pat: cmdAnimeImg,
    slap: cmdAnimeImg,
    smug: cmdAnimeImg,
    bonk: cmdAnimeImg,
    yeet: cmdAnimeImg,
    blush: cmdAnimeImg,
    smile: cmdAnimeImg,
    wave: cmdAnimeImg,
    highfive: cmdAnimeImg,
    handhold: cmdAnimeImg,
    nom: cmdAnimeImg,
    bite: cmdAnimeImg,
    glomp: cmdAnimeImg,
    kill: cmdAnimeImg,
    kick: null, // Don't override group kick
    happy: cmdAnimeImg,
    wink: cmdAnimeImg,
    poke: cmdAnimeImg,
    dance: cmdAnimeImg,
    cringe: cmdAnimeImg,
    animequote: cmdAnimeQuote,
    manga: cmdManga,
    anime: cmdAnimeSearch
};

async function handle(ctx) {
    const { command } = ctx;
    if (commands[command] && command !== 'kick') {
        await commands[command](ctx);
        return true;
    }
    return false;
}

async function cmdWaifu(ctx) {
    const { sock, msg, from } = ctx;
    
    await msg.react('🎌');
    
    try {
        const imageUrl = await waifuImage('waifu');
        
        await sock.sendMessage(from, {
            image: { url: imageUrl },
            caption: `🎌 *Waifu*\n\n_© GODFATHER XMD | Powered by Soham_`
        }, { quoted: msg });
        
        await msg.react('✅');
    } catch (e) {
        await msg.react('❌');
        await msg.reply(`❌ Error: ${e.message}`);
    }
}

async function cmdAnimeImg(ctx) {
    const { sock, msg, from, command } = ctx;
    
    await msg.react('🎌');
    
    const sfwCategories = [
        'waifu', 'neko', 'shinobu', 'megumin', 'cuddle', 'hug', 'pat', 
        'slap', 'smug', 'bonk', 'yeet', 'blush', 'smile', 'wave', 
        'highfive', 'handhold', 'nom', 'bite', 'glomp', 'kill',
        'happy', 'wink', 'poke', 'dance', 'cringe'
    ];
    
    const category = sfwCategories.includes(command) ? command : 'waifu';
    
    try {
        const { data } = await axios.get(`https://api.waifu.pics/sfw/${category}`);
        
        const target = msg.mentionedJid?.[0] || msg.quoted?.participant;
        let caption = `🎌 *${command.charAt(0).toUpperCase() + command.slice(1)}*`;
        
        if (target && ['hug', 'pat', 'slap', 'cuddle', 'bite', 'poke', 'kill', 'highfive', 'handhold', 'glomp', 'bonk', 'yeet', 'kick'].includes(command)) {
            const mentions = [ctx.sender, target];
            caption = `🎌 @${ctx.sender.split('@')[0]} *${command}s* @${target.split('@')[0]}!`;
            
            await sock.sendMessage(from, {
                image: { url: data.url },
                caption: `${caption}\n\n_© GODFATHER XMD_`,
                mentions
            }, { quoted: msg });
        } else {
            await sock.sendMessage(from, {
                image: { url: data.url },
                caption: `${caption}\n\n_© GODFATHER XMD | Powered by Soham_`
            }, { quoted: msg });
        }
        
        await msg.react('✅');
    } catch (e) {
        await msg.react('❌');
        await msg.reply(`❌ Error: ${e.message}`);
    }
}

async function cmdAnimeQuote(ctx) {
    const { msg } = ctx;
    
    try {
        const quote = await animeQuote();
        await msg.reply(`🎌 *Anime Quote*\n━━━━━━━━━━━━━━━\n\n"${quote.quote}"\n\n— *${quote.character}*\n📺 ${quote.anime}\n━━━━━━━━━━━━━━━\n_© GODFATHER XMD_`);
    } catch (e) {
        const fallbackQuotes = [
            { quote: "People's lives don't end when they die, it ends when they lose faith.", character: "Itachi Uchiha", anime: "Naruto" },
            { quote: "If you don't take risks, you can't create a future!", character: "Monkey D. Luffy", anime: "One Piece" },
            { quote: "The world isn't perfect. But it's there for us, doing the best it can.", character: "Roy Mustang", anime: "Fullmetal Alchemist" },
            { quote: "Power comes in response to a need, not a desire.", character: "Goku", anime: "Dragon Ball Z" },
            { quote: "Fear is not evil. It tells you what your weakness is.", character: "Gildarts Clive", anime: "Fairy Tail" }
        ];
        const q = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
        await msg.reply(`🎌 *Anime Quote*\n━━━━━━━━━━━━━━━\n\n"${q.quote}"\n\n— *${q.character}*\n📺 ${q.anime}\n━━━━━━━━━━━━━━━\n_© GODFATHER XMD_`);
    }
}

async function cmdManga(ctx) {
    const { sock, msg, from, text } = ctx;
    if (!text) return msg.reply('❌ Please provide a manga name!\nExample: .manga One Piece');
    
    await msg.react('📚');
    
    try {
        const { data } = await axios.get(`https://api.jikan.moe/v4/manga?q=${encodeURIComponent(text)}&limit=1`);
        
        if (data.data && data.data.length > 0) {
            const manga = data.data[0];
            
            const mangaMsg = `📚 *Manga Info*
━━━━━━━━━━━━━━━
📛 *Title:* ${manga.title}
🇯🇵 *Japanese:* ${manga.title_japanese || 'N/A'}
📊 *Score:* ${manga.score || 'N/A'}/10
📖 *Chapters:* ${manga.chapters || 'Ongoing'}
📚 *Volumes:* ${manga.volumes || 'Ongoing'}
📌 *Status:* ${manga.status}
🏷️ *Type:* ${manga.type}
🎭 *Genres:* ${manga.genres.map(g => g.name).join(', ')}
📅 *Published:* ${manga.published?.string || 'N/A'}
📝 *Synopsis:*
${(manga.synopsis || 'No synopsis available').substring(0, 500)}...
🔗 *MAL:* ${manga.url}
━━━━━━━━━━━━━━━
_© GODFATHER XMD | Powered by Soham_`;

            if (manga.images?.jpg?.large_image_url) {
                await sock.sendMessage(from, {
                    image: { url: manga.images.jpg.large_image_url },
                    caption: mangaMsg
                }, { quoted: msg });
            } else {
                await msg.reply(mangaMsg);
            }
            
            await msg.react('✅');
        } else {
            await msg.reply('❌ Manga not found!');
        }
    } catch (e) {
        await msg.react('❌');
        await msg.reply(`❌ Error: ${e.message}`);
    }
}

async function cmdAnimeSearch(ctx) {
    const { sock, msg, from, text } = ctx;
    if (!text) return msg.reply('❌ Please provide an anime name!\nExample: .anime Naruto');
    
    await msg.react('🎌');
    
    try {
        const { data } = await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(text)}&limit=1`);
        
        if (data.data && data.data.length > 0) {
            const anime = data.data[0];
            
            const animeMsg = `🎌 *Anime Info*
━━━━━━━━━━━━━━━
📛 *Title:* ${anime.title}
🇯🇵 *Japanese:* ${anime.title_japanese || 'N/A'}
📊 *Score:* ${anime.score || 'N/A'}/10
📺 *Episodes:* ${anime.episodes || 'Ongoing'}
⏱️ *Duration:* ${anime.duration || 'N/A'}
📌 *Status:* ${anime.status}
🏷️ *Type:* ${anime.type}
🎭 *Genres:* ${anime.genres.map(g => g.name).join(', ')}
📅 *Aired:* ${anime.aired?.string || 'N/A'}
🏢 *Studio:* ${anime.studios.map(s => s.name).join(', ') || 'N/A'}
⭐ *Rating:* ${anime.rating || 'N/A'}
📝 *Synopsis:*
${(anime.synopsis || 'No synopsis available').substring(0, 500)}...
🔗 *MAL:* ${anime.url}
━━━━━━━━━━━━━━━
_© GODFATHER XMD | Powered by Soham_`;

            if (anime.images?.jpg?.large_image_url) {
                await sock.sendMessage(from, {
                    image: { url: anime.images.jpg.large_image_url },
                    caption: animeMsg
                }, { quoted: msg });
            } else {
                await msg.reply(animeMsg);
            }
            
            await msg.react('✅');
        } else {
            await msg.reply('❌ Anime not found!');
        }
    } catch (e) {
        await msg.react('❌');
        await msg.reply(`❌ Error: ${e.message}`);
    }
}

module.exports = { handle, commands };