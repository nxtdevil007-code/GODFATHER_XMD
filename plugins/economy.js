const { getUser, setUser, saveDatabase, db } = require('../lib/database');

const commands = {
    balance: cmdBalance,
    bal: cmdBalance,
    daily: cmdDaily,
    work: cmdWork,
    rob: cmdRob,
    deposit: cmdDeposit,
    dep: cmdDeposit,
    withdraw: cmdWithdraw,
    with: cmdWithdraw,
    transfer: cmdTransfer,
    pay: cmdTransfer,
    leaderboard: cmdLeaderboard,
    lb: cmdLeaderboard,
    top: cmdLeaderboard,
    shop: cmdShop,
    buy: cmdBuy,
    inventory: cmdInventory,
    inv: cmdInventory,
    profile: cmdProfile,
    register: cmdRegister,
    level: cmdLevel,
    xp: cmdLevel
};

async function handle(ctx) {
    const { command } = ctx;
    if (commands[command]) {
        await commands[command](ctx);
        return true;
    }
    return false;
}

async function cmdBalance(ctx) {
    const { sock, msg, from, sender } = ctx;
    const target = msg.mentionedJid?.[0] || sender;
    const user = getUser(target);
    
    await sock.sendMessage(from, {
        text: `💰 *Balance*
━━━━━━━━━━━━━━━
👤 User: @${target.split('@')[0]}
💵 Wallet: $${user.coins.toLocaleString()}
🏦 Bank: $${user.bank.toLocaleString()}
💎 Total: $${(user.coins + user.bank).toLocaleString()}
⭐ Level: ${user.level}
✨ XP: ${user.xp}
━━━━━━━━━━━━━━━
_© GODFATHER XMD | Powered by Soham_`,
        mentions: [target]
    }, { quoted: msg });
}

async function cmdDaily(ctx) {
    const { msg, sender } = ctx;
    const user = getUser(sender);
    
    const now = Date.now();
    const cooldown = 24 * 60 * 60 * 1000; // 24 hours
    
    if (now - user.lastDaily < cooldown) {
        const remaining = cooldown - (now - user.lastDaily);
        const hours = Math.floor(remaining / (60 * 60 * 1000));
        const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
        return msg.reply(`⏰ You already claimed your daily reward!\n\nCome back in *${hours}h ${minutes}m*\n\n_© GODFATHER XMD_`);
    }
    
    const amount = Math.floor(Math.random() * 5000) + 1000;
    user.coins += amount;
    user.lastDaily = now;
    saveDatabase();
    
    await msg.reply(`💰 *Daily Reward Claimed!*\n\n💵 You received: $${amount.toLocaleString()}\n💰 New Balance: $${user.coins.toLocaleString()}\n\n_Come back tomorrow for more!_\n_© GODFATHER XMD_`);
}

async function cmdWork(ctx) {
    const { msg, sender } = ctx;
    const user = getUser(sender);
    
    const now = Date.now();
    const cooldown = 30 * 60 * 1000; // 30 minutes
    
    if (now - user.lastWork < cooldown) {
        const remaining = cooldown - (now - user.lastWork);
        const minutes = Math.floor(remaining / (60 * 1000));
        return msg.reply(`⏰ You're tired! Rest for *${minutes} minutes* before working again.\n\n_© GODFATHER XMD_`);
    }
    
    const jobs = [
        { job: "🧑‍💻 Software Developer", min: 500, max: 3000 },
        { job: "🧑‍🍳 Chef", min: 300, max: 2000 },
        { job: "🧑‍🏫 Teacher", min: 400, max: 2500 },
        { job: "🧑‍⚕️ Doctor", min: 800, max: 4000 },
        { job: "🧑‍🌾 Farmer", min: 200, max: 1500 },
        { job: "🧑‍🎨 Artist", min: 300, max: 2000 },
        { job: "🧑‍🔧 Mechanic", min: 400, max: 2500 },
        { job: "📷 Photographer", min: 300, max: 1800 },
        { job: "🎵 Musician", min: 500, max: 3000 },
        { job: "✈️ Pilot", min: 1000, max: 5000 }
    ];
    
    const selectedJob = jobs[Math.floor(Math.random() * jobs.length)];
    const amount = Math.floor(Math.random() * (selectedJob.max - selectedJob.min)) + selectedJob.min;
    
    user.coins += amount;
    user.lastWork = now;
    saveDatabase();
    
    await msg.reply(`💼 *Work Complete!*\n\n${selectedJob.job}\n💵 Earned: $${amount.toLocaleString()}\n💰 Balance: $${user.coins.toLocaleString()}\n\n_© GODFATHER XMD_`);
}

async function cmdRob(ctx) {
    const { sock, msg, from, sender } = ctx;
    const target = msg.mentionedJid?.[0] || (msg.quoted?.participant);
    if (!target) return msg.reply('❌ Tag someone to rob!');
    if (target === sender) return msg.reply('❌ You can\'t rob yourself!');
    
    const user = getUser(sender);
    const victim = getUser(target);
    
    const now = Date.now();
    const cooldown = 60 * 60 * 1000; // 1 hour
    
    if (now - user.lastRob < cooldown) {
        const remaining = cooldown - (now - user.lastRob);
        const minutes = Math.floor(remaining / (60 * 1000));
        return msg.reply(`⏰ Wait *${minutes} minutes* before robbing again!\n\n_© GODFATHER XMD_`);
    }
    
    if (victim.coins < 100) return msg.reply('❌ They\'re too poor to rob!');
    
    const success = Math.random() < 0.5;
    
    if (success) {
        const amount = Math.floor(Math.random() * Math.min(victim.coins, 2000)) + 100;
        user.coins += amount;
        victim.coins -= amount;
        user.lastRob = now;
        saveDatabase();
        
        await sock.sendMessage(from, {
            text: `🔫 *Rob Successful!*\n\n@${sender.split('@')[0]} robbed $${amount.toLocaleString()} from @${target.split('@')[0]}!\n\n_© GODFATHER XMD_`,
            mentions: [sender, target]
        }, { quoted: msg });
    } else {
        const fine = Math.floor(Math.random() * 500) + 100;
        user.coins -= fine;
        user.lastRob = now;
        saveDatabase();
        
        await sock.sendMessage(from, {
            text: `🚔 *Caught!*\n\n@${sender.split('@')[0]} tried to rob @${target.split('@')[0]} but got caught!\nFine: $${fine.toLocaleString()}\n\n_© GODFATHER XMD_`,
            mentions: [sender, target]
        }, { quoted: msg });
    }
}

async function cmdDeposit(ctx) {
    const { msg, sender, text } = ctx;
    const user = getUser(sender);
    
    if (!text) return msg.reply('❌ Usage: .deposit <amount/all>');
    
    const amount = text.toLowerCase() === 'all' ? user.coins : parseInt(text);
    if (isNaN(amount) || amount <= 0) return msg.reply('❌ Invalid amount!');
    if (amount > user.coins) return msg.reply('❌ Insufficient wallet balance!');
    
    user.coins -= amount;
    user.bank += amount;
    saveDatabase();
    
    await msg.reply(`🏦 *Deposit Successful!*\n\n💵 Deposited: $${amount.toLocaleString()}\n💰 Wallet: $${user.coins.toLocaleString()}\n🏦 Bank: $${user.bank.toLocaleString()}\n\n_© GODFATHER XMD_`);
}

async function cmdWithdraw(ctx) {
    const { msg, sender, text } = ctx;
    const user = getUser(sender);
    
    if (!text) return msg.reply('❌ Usage: .withdraw <amount/all>');
    
    const amount = text.toLowerCase() === 'all' ? user.bank : parseInt(text);
    if (isNaN(amount) || amount <= 0) return msg.reply('❌ Invalid amount!');
    if (amount > user.bank) return msg.reply('❌ Insufficient bank balance!');
    
    user.bank -= amount;
    user.coins += amount;
    saveDatabase();
    
    await msg.reply(`🏦 *Withdrawal Successful!*\n\n💵 Withdrawn: $${amount.toLocaleString()}\n💰 Wallet: $${user.coins.toLocaleString()}\n🏦 Bank: $${user.bank.toLocaleString()}\n\n_© GODFATHER XMD_`);
}

async function cmdTransfer(ctx) {
    const { sock, msg, from, sender, args } = ctx;
    const target = msg.mentionedJid?.[0] || (msg.quoted?.participant);
    if (!target) return msg.reply('❌ Tag someone to transfer money!');
    
    const amount = parseInt(args[args.length - 1]);
    if (isNaN(amount) || amount <= 0) return msg.reply('❌ Invalid amount!\nUsage: .transfer @user 1000');
    
    const user = getUser(sender);
    if (amount > user.coins) return msg.reply('❌ Insufficient balance!');
    
    const recipient = getUser(target);
    user.coins -= amount;
    recipient.coins += amount;
    saveDatabase();
    
    await sock.sendMessage(from, {
        text: `💸 *Transfer Successful!*\n\n@${sender.split('@')[0]} ➜ @${target.split('@')[0]}\n💵 Amount: $${amount.toLocaleString()}\n\n_© GODFATHER XMD_`,
        mentions: [sender, target]
    }, { quoted: msg });
}

async function cmdLeaderboard(ctx) {
    const { msg } = ctx;
    
    const users = Object.entries(db.users || {})
        .map(([jid, data]) => ({ jid, total: (data.coins || 0) + (data.bank || 0) }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);
    
    let text = `🏆 *Leaderboard - Top 10*\n━━━━━━━━━━━━━━━\n\n`;
    
    const medals = ['🥇', '🥈', '🥉'];
    users.forEach((user, i) => {
        const medal = medals[i] || `${i + 1}.`;
        text += `${medal} @${user.jid.split('@')[0]} - $${user.total.toLocaleString()}\n`;
    });
    
    text += `\n━━━━━━━━━━━━━━━\n_© GODFATHER XMD | Powered by Soham_`;
    
    const mentions = users.map(u => u.jid);
    await require('./menu').handle({ ...ctx, command: null }) || await msg.reply(text);
}

async function cmdShop(ctx) {
    const { msg, prefix } = ctx;
    
    const shopItems = [
        { id: 1, name: '🎣 Fishing Rod', price: 5000, desc: 'Catch fish for money' },
        { id: 2, name: '⛏️ Pickaxe', price: 8000, desc: 'Mine ores for money' },
        { id: 3, name: '🔫 Gun', price: 15000, desc: 'Increases rob success rate' },
        { id: 4, name: '🛡️ Shield', price: 10000, desc: 'Protects from robbery' },
        { id: 5, name: '💍 Ring', price: 50000, desc: 'Propose to someone' },
        { id: 6, name: '🎰 Lucky Charm', price: 20000, desc: 'Increases slot luck' },
        { id: 7, name: '📱 Phone', price: 3000, desc: 'Required for some commands' },
        { id: 8, name: '🚗 Car', price: 100000, desc: 'Flex item' }
    ];
    
    let text = `🛒 *GODFATHER Shop*\n━━━━━━━━━━━━━━━\n\n`;
    
    shopItems.forEach(item => {
        text += `*${item.id}.* ${item.name}\n`;
        text += `   💵 Price: $${item.price.toLocaleString()}\n`;
        text += `   📝 ${item.desc}\n\n`;
    });
    
    text += `━━━━━━━━━━━━━━━\nUse *${prefix}buy <id>* to purchase\n_© GODFATHER XMD_`;
    
    await msg.reply(text);
}

async function cmdBuy(ctx) {
    const { msg, sender, text } = ctx;
    if (!text) return msg.reply('❌ Usage: .buy <item id>');
    
    const shopItems = [
        { id: 1, name: '🎣 Fishing Rod', price: 5000 },
        { id: 2, name: '⛏️ Pickaxe', price: 8000 },
        { id: 3, name: '🔫 Gun', price: 15000 },
        { id: 4, name: '🛡️ Shield', price: 10000 },
        { id: 5, name: '💍 Ring', price: 50000 },
        { id: 6, name: '🎰 Lucky Charm', price: 20000 },
        { id: 7, name: '📱 Phone', price: 3000 },
        { id: 8, name: '🚗 Car', price: 100000 }
    ];
    
    const itemId = parseInt(text);
    const item = shopItems.find(i => i.id === itemId);
    if (!item) return msg.reply('❌ Item not found! Check .shop');
    
    const user = getUser(sender);
    if (user.coins < item.price) return msg.reply(`❌ You need $${item.price.toLocaleString()} to buy ${item.name}!`);
    
    if (user.inventory.includes(item.name)) return msg.reply('❌ You already own this item!');
    
    user.coins -= item.price;
    user.inventory.push(item.name);
    saveDatabase();
    
    await msg.reply(`✅ Purchased ${item.name} for $${item.price.toLocaleString()}!\n💰 Remaining: $${user.coins.toLocaleString()}\n\n_© GODFATHER XMD_`);
}

async function cmdInventory(ctx) {
    const { msg, sender } = ctx;
    const target = msg.mentionedJid?.[0] || sender;
    const user = getUser(target);
    
    if (user.inventory.length === 0) {
        return msg.reply('🎒 *Inventory is empty!*\n\nBuy items from .shop\n\n_© GODFATHER XMD_');
    }
    
    let text = `🎒 *Inventory*\n━━━━━━━━━━━━━━━\n\n`;
    user.inventory.forEach((item, i) => {
        text += `${i + 1}. ${item}\n`;
    });
    text += `\n━━━━━━━━━━━━━━━\n_© GODFATHER XMD_`;
    
    await msg.reply(text);
}

async function cmdProfile(ctx) {
    const { sock, msg, from, sender, pushName } = ctx;
    const target = msg.mentionedJid?.[0] || sender;
    const user = getUser(target);
    
    const profileMsg = `👤 *User Profile*
━━━━━━━━━━━━━━━
📛 Name: @${target.split('@')[0]}
📝 Registered: ${user.registered ? '✅' : '❌'}
⭐ Level: ${user.level}
✨ XP: ${user.xp}/${user.level * 500}
💰 Wallet: $${user.coins.toLocaleString()}
🏦 Bank: $${user.bank.toLocaleString()}
🎒 Items: ${user.inventory.length}
⚠️ Warnings: ${user.warnings}
🚫 Banned: ${user.banned ? '✅' : '❌'}
━━━━━━━━━━━━━━━
_© GODFATHER XMD | Powered by Soham_`;

    try {
        const ppUrl = await sock.profilePictureUrl(target, 'image');
        await sock.sendMessage(from, {
            image: { url: ppUrl },
            caption: profileMsg,
            mentions: [target]
        }, { quoted: msg });
    } catch {
        await sock.sendMessage(from, {
            text: profileMsg,
            mentions: [target]
        }, { quoted: msg });
    }
}

async function cmdRegister(ctx) {
    const { msg, sender, text } = ctx;
    const user = getUser(sender);
    
    if (user.registered) return msg.reply('❌ You are already registered!');
    if (!text) return msg.reply('❌ Usage: .register <name>');
    
    user.registered = true;
    user.name = text;
    user.regTime = Date.now();
    user.coins += 500; // Registration bonus
    saveDatabase();
    
    await msg.reply(`✅ *Registration Successful!*\n\n📛 Name: ${text}\n🎁 Bonus: $500\n💰 Balance: $${user.coins.toLocaleString()}\n\n_Welcome to GODFATHER XMD!_\n_© Powered by Soham_`);
}

async function cmdLevel(ctx) {
    const { sock, msg, from, sender } = ctx;
    const target = msg.mentionedJid?.[0] || sender;
    const user = getUser(target);
    
    const nextLevel = user.level * 500;
    const progress = Math.floor((user.xp / nextLevel) * 20);
    const progressBar = '█'.repeat(progress) + '░'.repeat(20 - progress);
    
    await sock.sendMessage(from, {
        text: `⭐ *Level Info*
━━━━━━━━━━━━━━━
👤 @${target.split('@')[0]}
⭐ Level: ${user.level}
✨ XP: ${user.xp}/${nextLevel}

[${progressBar}] ${Math.floor((user.xp / nextLevel) * 100)}%

━━━━━━━━━━━━━━━
_© GODFATHER XMD_`,
        mentions: [target]
    }, { quoted: msg });
}

module.exports = { handle, commands };