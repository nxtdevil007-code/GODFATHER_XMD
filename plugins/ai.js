const axios = require('axios');
const config = require('../config');

const commands = {
    ai: cmdAI,
    gpt: cmdAI,
    chatgpt: cmdAI,
    dalle: cmdDalle,
    imagine: cmdImagine,
    gemini: cmdGemini
};

async function handle(ctx) {
    const { command } = ctx;
    if (commands[command]) {
        await commands[command](ctx);
        return true;
    }
    return false;
}

async function cmdAI(ctx) {
    const { sock, msg, from, text } = ctx;
    if (!text) return msg.reply('❌ Please provide a question!\nExample: .ai What is artificial intelligence?');
    
    await msg.react('🤖');
    
    try {
        // Try OpenAI API first
        if (config.openaiKey) {
            const { OpenAI } = require('openai');
            const openai = new OpenAI({ apiKey: config.openaiKey });
            
            const completion = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    { 
                        role: 'system', 
                        content: 'You are GODFATHER XMD, an AI assistant powered by Soham. You are helpful, creative, and friendly. Always sign your responses with "- GODFATHER XMD"'
                    },
                    { role: 'user', content: text }
                ],
                max_tokens: 2000
            });
            
            const response = completion.choices[0].message.content;
            
            await msg.reply(`🤖 *GODFATHER XMD AI*\n━━━━━━━━━━━━━━━\n\n${response}\n\n━━━━━━━━━━━━━━━\n_Powered by Soham_`);
            await msg.react('✅');
        } else {
            // Free API fallback
            const apiUrl = `https://api.dreaded.site/api/chatgpt?text=${encodeURIComponent(text)}`;
            const { data } = await axios.get(apiUrl);
            
            if (data && data.result) {
                await msg.reply(`🤖 *GODFATHER XMD AI*\n━━━━━━━━━━━━━━━\n\n${data.result}\n\n━━━━━━━━━━━━━━━\n_Powered by Soham_`);
                await msg.react('✅');
            } else {
                // Another fallback
                const fallbackUrl = `https://api.lolhuman.xyz/api/openai?text=${encodeURIComponent(text)}`;
                const fallback = await axios.get(fallbackUrl);
                
                if (fallback.data && fallback.data.result) {
                    await msg.reply(`🤖 *GODFATHER XMD AI*\n━━━━━━━━━━━━━━━\n\n${fallback.data.result}\n\n━━━━━━━━━━━━━━━\n_Powered by Soham_`);
                    await msg.react('✅');
                }
            }
        }
    } catch (e) {
        await msg.react('❌');
        await msg.reply(`❌ AI Error: ${e.message}\n\n_Try setting up an OpenAI API key in config_`);
    }
}

async function cmdDalle(ctx) {
    const { sock, msg, from, text } = ctx;
    if (!text) return msg.reply('❌ Please provide an image description!\nExample: .dalle A sunset over the ocean');
    
    await msg.react('🎨');
    
    try {
        if (config.openaiKey) {
            const { OpenAI } = require('openai');
            const openai = new OpenAI({ apiKey: config.openaiKey });
            
            const image = await openai.images.generate({
                model: 'dall-e-3',
                prompt: text,
                n: 1,
                size: '1024x1024'
            });
            
            await sock.sendMessage(from, {
                image: { url: image.data[0].url },
                caption: `🎨 *DALL-E Image*\n📝 Prompt: ${text}\n\n_© GODFATHER XMD | Powered by Soham_`
            }, { quoted: msg });
            
            await msg.react('✅');
        } else {
            // Free alternative
            const apiUrl = `https://api.lolhuman.xyz/api/dall-e?text=${encodeURIComponent(text)}`;
            const { data } = await axios.get(apiUrl, { responseType: 'arraybuffer' });
            
            await sock.sendMessage(from, {
                image: Buffer.from(data),
                caption: `🎨 *AI Generated Image*\n📝 Prompt: ${text}\n\n_© GODFATHER XMD_`
            }, { quoted: msg });
            
            await msg.react('✅');
        }
    } catch (e) {
        await msg.react('❌');
        await msg.reply(`❌ Error: ${e.message}`);
    }
}

async function cmdImagine(ctx) {
    return cmdDalle(ctx);
}

async function cmdGemini(ctx) {
    const { msg, text } = ctx;
    if (!text) return msg.reply('❌ Please provide a question!\nExample: .gemini Explain quantum physics');
    
    await msg.react('🤖');
    
    try {
        const apiUrl = `https://api.dreaded.site/api/gemini?text=${encodeURIComponent(text)}`;
        const { data } = await axios.get(apiUrl);
        
        if (data && data.result) {
            await msg.reply(`🤖 *Gemini AI*\n━━━━━━━━━━━━━━━\n\n${data.result}\n\n━━━━━━━━━━━━━━━\n_© GODFATHER XMD | Powered by Soham_`);
            await msg.react('✅');
        } else {
            // Redirect to main AI
            return cmdAI(ctx);
        }
    } catch (e) {
        await msg.react('❌');
        await msg.reply(`❌ Error: ${e.message}`);
    }
}

module.exports = { handle, commands };