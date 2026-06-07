const axios = require('axios');
const { getJoke, getMeme, getTruth, getDare, quoteMaker } = require('../lib/scraper');

const commands = {
    joke: cmdJoke,
    meme: cmdMeme,
    quote: cmdQuote,
    fact: cmdFact,
    '8ball': cmd8Ball,
    roll: cmdRoll,
    flip: cmdFlip,
    truth: cmdTruth,
    dare: cmdDare,
    ship: cmdShip,
    roast: cmdRoast,
    pickup: cmdPickup,
    compliment: cmdCompliment,
    rate: cmdRate,
    pp: cmdPP,
    couple: cmdCouple,
    would: cmdWouldYouRather,
    insult: cmdInsult,
    hack: cmdHack
};

async function handle(ctx) {
    const { command } = ctx;
    if (commands[command]) {
        await commands[command](ctx);
        return true;
    }
    return false;
}

async function cmdJoke(ctx) {
    const { msg } = ctx;
    
    try {
        const joke = await getJoke();
        await msg.reply(`😂 *Random Joke*\n\n${joke.joke}\n\n_© GODFATHER XMD_`);
    } catch (e) {
        const fallbackJokes = [
            "Why don't scientists trust atoms? Because they make up everything!",
            "I told my wife she was drawing her eyebrows too high. She looked surprised.",
            "Why don't eggs tell jokes? They'd crack each other up!",
            "What do you call a fake noodle? An Impasta!",
            "Why did the scarecrow win an award? He was outstanding in his field!"
        ];
        await msg.reply(`😂 *Random Joke*\n\n${fallbackJokes[Math.floor(Math.random() * fallbackJokes.length)]}\n\n_© GODFATHER XMD_`);
    }
}

async function cmdMeme(ctx) {
    const { sock, msg, from } = ctx;
    
    try {
        const meme = await getMeme();
        
        await sock.sendMessage(from, {
            image: { url: meme.url },
            caption: `😂 *${meme.title}*\n👍 ${meme.ups} upvotes\n📌 r/${meme.subreddit}\n\n_© GODFATHER XMD_`
        }, { quoted: msg });
    } catch (e) {
        await msg.reply(`❌ Error: ${e.message}`);
    }
}

async function cmdQuote(ctx) {
    const { msg } = ctx;
    
    try {
        const quote = await quoteMaker();
        await msg.reply(`💭 *Quote of the Moment*\n\n"${quote.content}"\n\n— *${quote.author}*\n\n_© GODFATHER XMD_`);
    } catch (e) {
        const fallbackQuotes = [
            { content: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
            { content: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
            { content: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
            { content: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
            { content: "Be yourself; everyone else is already taken.", author: "Oscar Wilde" }
        ];
        const q = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
        await msg.reply(`💭 *Quote*\n\n"${q.content}"\n\n— *${q.author}*\n\n_© GODFATHER XMD_`);
    }
}

async function cmdFact(ctx) {
    const { msg } = ctx;
    
    try {
        const { data } = await axios.get('https://uselessfacts.jsph.pl/api/v2/facts/random');
        await msg.reply(`📚 *Random Fact*\n\n${data.text}\n\n_© GODFATHER XMD_`);
    } catch (e) {
        const facts = [
            "Honey never spoils. Archaeologists have found 3000-year-old honey in Egyptian tombs that was still edible!",
            "A group of flamingos is called a 'flamboyance'.",
            "The shortest war in history lasted 38 to 45 minutes between Britain and Zanzibar.",
            "Octopuses have three hearts and blue blood.",
            "Bananas are berries, but strawberries aren't."
        ];
        await msg.reply(`📚 *Random Fact*\n\n${facts[Math.floor(Math.random() * facts.length)]}\n\n_© GODFATHER XMD_`);
    }
}

async function cmd8Ball(ctx) {
    const { msg, text } = ctx;
    if (!text) return msg.reply('❌ Please ask a question!\nExample: .8ball Will I be rich?');
    
    const answers = [
        "🎱 It is certain.", "🎱 Without a doubt.", "🎱 Yes, definitely.",
        "🎱 You may rely on it.", "🎱 As I see it, yes.", "🎱 Most likely.",
        "🎱 Outlook good.", "🎱 Yes.", "🎱 Signs point to yes.",
        "🎱 Reply hazy, try again.", "🎱 Ask again later.", "🎱 Better not tell you now.",
        "🎱 Cannot predict now.", "🎱 Concentrate and ask again.",
        "🎱 Don't count on it.", "🎱 My reply is no.", "🎱 My sources say no.",
        "🎱 Outlook not so good.", "🎱 Very doubtful."
    ];
    
    const answer = answers[Math.floor(Math.random() * answers.length)];
    await msg.reply(`❓ *Question:* ${text}\n\n${answer}\n\n_© GODFATHER XMD_`);
}

async function cmdRoll(ctx) {
    const { msg, text } = ctx;
    const max = parseInt(text) || 6;
    const result = Math.floor(Math.random() * max) + 1;
    await msg.reply(`🎲 *Dice Roll (1-${max})*\n\nResult: *${result}*\n\n_© GODFATHER XMD_`);
}

async function cmdFlip(ctx) {
    const { msg } = ctx;
    const result = Math.random() < 0.5 ? 'Heads 🪙' : 'Tails 🪙';
    await msg.reply(`🪙 *Coin Flip*\n\nResult: *${result}*\n\n_© GODFATHER XMD_`);
}

async function cmdTruth(ctx) {
    const { msg } = ctx;
    const truth = getTruth();
    await msg.reply(`🤔 *Truth*\n\n${truth}\n\n_© GODFATHER XMD_`);
}

async function cmdDare(ctx) {
    const { msg } = ctx;
    const dare = getDare();
    await msg.reply(`😈 *Dare*\n\n${dare}\n\n_© GODFATHER XMD_`);
}

async function cmdShip(ctx) {
    const { sock, msg, from, isGroup, groupMembers } = ctx;
    if (!isGroup) return msg.reply('❌ This command can only be used in groups!');
    
    const members = groupMembers.map(m => m.id);
    const person1 = msg.mentionedJid?.[0] || members[Math.floor(Math.random() * members.length)];
    const person2 = msg.mentionedJid?.[1] || members[Math.floor(Math.random() * members.length)];
    
    const percentage = Math.floor(Math.random() * 101);
    let emoji;
    if (percentage >= 80) emoji = '💕💕💕';
    else if (percentage >= 60) emoji = '💖💖';
    else if (percentage >= 40) emoji = '💛';
    else if (percentage >= 20) emoji = '💔';
    else emoji = '💔💔💔';
    
    const shipMsg = `💘 *Love Ship*
━━━━━━━━━━━━━━━
@${person1.split('@')[0]} ❤️ @${person2.split('@')[0]}

Love Percentage: *${percentage}%* ${emoji}

${'█'.repeat(Math.floor(percentage/10))}${'░'.repeat(10 - Math.floor(percentage/10))}

━━━━━━━━━━━━━━━
_© GODFATHER XMD | Powered by Soham_`;

    await sock.sendMessage(from, {
        text: shipMsg,
        mentions: [person1, person2]
    }, { quoted: msg });
}

async function cmdRoast(ctx) {
    const { msg } = ctx;
    const roasts = [
        "You're the reason God created the middle finger. 🖕",
        "If laughter is the best medicine, your face must be curing the world. 😂",
        "You bring everyone so much joy when you leave the room. 🚪",
        "I'd agree with you but then we'd both be wrong. 🤷",
        "You're not stupid; you just have bad luck thinking. 🧠",
        "I'd explain it to you but I left my English-to-Dumb dictionary at home. 📖",
        "You're like a cloud. When you disappear, it's a beautiful day. ☁️",
        "You're proof that evolution CAN go in reverse. 🐒",
        "If you were any more inbred, you'd be a sandwich. 🥪",
        "You're so fake, Barbie is jealous. 💅"
    ];
    
    const roast = roasts[Math.floor(Math.random() * roasts.length)];
    await msg.reply(`🔥 *Roast*\n\n${roast}\n\n_© GODFATHER XMD_`);
}

async function cmdPickup(ctx) {
    const { msg } = ctx;
    const pickups = [
        "Are you a magician? Because whenever I look at you, everyone else disappears. ✨",
        "Do you have a map? I just got lost in your eyes. 🗺️",
        "Are you a parking ticket? Because you've got 'fine' written all over you. 💫",
        "Is your name Google? Because you have everything I've been searching for. 🔍",
        "Do you believe in love at first sight, or should I walk by again? 💘",
        "Are you a campfire? Because you're hot and I want s'more. 🔥",
        "If you were a vegetable, you'd be a cute-cumber. 🥒",
        "Are you a Wi-Fi signal? Because I'm feeling a connection. 📶",
        "Do you have a sunburn, or are you always this hot? ☀️",
        "I must be a snowflake, because I've fallen for you. ❄️"
    ];
    
    const pickup = pickups[Math.floor(Math.random() * pickups.length)];
    await msg.reply(`💝 *Pickup Line*\n\n${pickup}\n\n_© GODFATHER XMD_`);
}

async function cmdCompliment(ctx) {
    const { msg } = ctx;
    const compliments = [
        "You're more beautiful than a sunset over the ocean! 🌅",
        "Your smile lights up the entire room! 😊",
        "You have the most amazing personality! ✨",
        "You're one of a kind and that's what makes you special! 💎",
        "The world is a better place with you in it! 🌍",
        "You inspire everyone around you! 🌟",
        "Your kindness is contagious! 💕",
        "You make difficult things look easy! 💪",
        "Your creativity knows no bounds! 🎨",
        "You're braver than you believe and stronger than you seem! 🦁"
    ];
    
    const compliment = compliments[Math.floor(Math.random() * compliments.length)];
    await msg.reply(`💐 *Compliment*\n\n${compliment}\n\n_© GODFATHER XMD_`);
}

async function cmdRate(ctx) {
    const { sock, msg, from } = ctx;
    const target = msg.mentionedJid?.[0] || msg.sender;
    const rating = Math.floor(Math.random() * 11);
    
    const stars = '⭐'.repeat(Math.ceil(rating / 2));
    
    await sock.sendMessage(from, {
        text: `📊 *Rating*\n\n@${target.split('@')[0]}\n\nRating: *${rating}/10* ${stars}\n\n${'█'.repeat(rating)}${'░'.repeat(10 - rating)}\n\n_© GODFATHER XMD_`,
        mentions: [target]
    }, { quoted: msg });
}

async function cmdPP(ctx) {
    const { sock, msg, from } = ctx;
    const target = msg.mentionedJid?.[0] || (msg.quoted?.participant) || msg.sender;
    
    try {
        const ppUrl = await sock.profilePictureUrl(target, 'image');
        await sock.sendMessage(from, {
            image: { url: ppUrl },
            caption: `📸 *Profile Picture*\n@${target.split('@')[0]}\n\n_© GODFATHER XMD_`,
            mentions: [target]
        }, { quoted: msg });
    } catch (e) {
        await msg.reply('❌ Could not fetch profile picture!');
    }
}

async function cmdCouple(ctx) {
    const { sock, msg, from, isGroup, groupMembers } = ctx;
    if (!isGroup) return msg.reply('❌ Group only command!');
    
    const members = groupMembers.map(m => m.id);
    const person1 = members[Math.floor(Math.random() * members.length)];
    let person2 = members[Math.floor(Math.random() * members.length)];
    while (person2 === person1) {
        person2 = members[Math.floor(Math.random() * members.length)];
    }
    
    await sock.sendMessage(from, {
        text: `💑 *Couple of the Day*\n━━━━━━━━━━━━━━━\n\n@${person1.split('@')[0]} ❤️ @${person2.split('@')[0]}\n\n_Congratulations!_ 🎉\n━━━━━━━━━━━━━━━\n_© GODFATHER XMD_`,
        mentions: [person1, person2]
    }, { quoted: msg });
}

async function cmdWouldYouRather(ctx) {
    const { msg } = ctx;
    const questions = [
        "Would you rather be able to fly or be invisible?",
        "Would you rather have unlimited money or unlimited knowledge?",
        "Would you rather live without internet or without AC?",
        "Would you rather be the funniest person or the smartest person?",
        "Would you rather travel to the past or the future?",
        "Would you rather be famous or rich?",
        "Would you rather have super strength or super speed?",
        "Would you rather live in the city or countryside?",
        "Would you rather never use social media again or never watch another movie?",
        "Would you rather always be hot or always be cold?"
    ];
    
    const question = questions[Math.floor(Math.random() * questions.length)];
    await msg.reply(`🤔 *Would You Rather?*\n\n${question}\n\n_© GODFATHER XMD_`);
}

async function cmdInsult(ctx) {
    const { msg } = ctx;
    const insults = [
        "You're not pretty enough to be this dumb. 💀",
        "I'd roast you, but my mom said I'm not allowed to burn trash. 🗑️",
        "You're like a software update - whenever I see you, I think 'not now'. 💻",
        "You're the human equivalent of a participation award. 🏅",
        "If ignorance is bliss, you must be the happiest person alive. 😊"
    ];
    
    await msg.reply(`💀 *Insult*\n\n${insults[Math.floor(Math.random() * insults.length)]}\n\n_Just kidding! 😂_\n_© GODFATHER XMD_`);
}

async function cmdHack(ctx) {
    const { msg, sock, from } = ctx;
    const target = msg.mentionedJid?.[0] || (msg.quoted?.participant);
    if (!target) return msg.reply('❌ Tag someone to "hack"!');
    
    const messages = [
        `🔓 Hacking @${target.split('@')[0]}...`,
        '📱 Accessing device...',
        '📂 Downloading files...',
        '🔑 Cracking passwords...',
        '📧 Reading messages...',
        '📸 Downloading gallery...',
        '💰 Transferring balance...',
        `✅ Successfully hacked @${target.split('@')[0]}!\n\n_Just kidding! 😂_\n\n_© GODFATHER XMD_`
    ];
    
    for (const message of messages) {
        await sock.sendMessage(from, { 
            text: message, 
            mentions: [target] 
        });
        await new Promise(r => setTimeout(r, 1500));
    }
}

module.exports = { handle, commands };