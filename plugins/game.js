const config = require('../config');

// Game states
const tttGames = new Map();
const guessGames = new Map();
const hangmanGames = new Map();
const mathGames = new Map();

const commands = {
    tictactoe: cmdTicTacToe,
    ttt: cmdTicTacToe,
    guess: cmdGuess,
    slot: cmdSlot,
    slots: cmdSlot,
    rps: cmdRPS,
    quiz: cmdQuiz,
    trivia: cmdQuiz,
    hangman: cmdHangman,
    mathgame: cmdMathGame
};

async function handle(ctx) {
    const { command } = ctx;
    if (commands[command]) {
        await commands[command](ctx);
        return true;
    }
    return false;
}

async function cmdTicTacToe(ctx) {
    const { sock, msg, from, sender } = ctx;
    const target = msg.mentionedJid?.[0] || (msg.quoted?.participant);
    
    if (!target) return msg.reply('❌ Tag someone to play TicTacToe!\nExample: .ttt @user');
    if (target === sender) return msg.reply('❌ You can\'t play against yourself!');
    
    const gameId = from;
    
    if (tttGames.has(gameId)) return msg.reply('❌ A game is already in progress!');
    
    const board = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];
    
    tttGames.set(gameId, {
        board,
        players: [sender, target],
        turn: 0,
        symbols: ['❌', '⭕']
    });
    
    const boardStr = formatTTTBoard(board);
    
    await sock.sendMessage(from, {
        text: `🎮 *Tic Tac Toe*\n━━━━━━━━━━━━━━━\n❌ @${sender.split('@')[0]} vs ⭕ @${target.split('@')[0]}\n\n${boardStr}\n\n@${sender.split('@')[0]}'s turn (❌)\nReply with a number (1-9)\n━━━━━━━━━━━━━━━\n_© GODFATHER XMD_`,
        mentions: [sender, target]
    }, { quoted: msg });
}

function formatTTTBoard(board) {
    return `${board[0]} │ ${board[1]} │ ${board[2]}\n──┼──┼──\n${board[3]} │ ${board[4]} │ ${board[5]}\n──┼──┼──\n${board[6]} │ ${board[7]} │ ${board[8]}`;
}

async function cmdGuess(ctx) {
    const { sock, msg, from, text, sender } = ctx;
    
    const gameId = from;
    
    if (!guessGames.has(gameId)) {
        const number = Math.floor(Math.random() * 100) + 1;
        guessGames.set(gameId, { number, attempts: 0, maxAttempts: 10 });
        
        return msg.reply(`🔢 *Number Guessing Game*\n━━━━━━━━━━━━━━━\nI'm thinking of a number between 1-100!\nYou have 10 attempts.\n\nType *.guess <number>* to guess!\n━━━━━━━━━━━━━━━\n_© GODFATHER XMD_`);
    }
    
    if (!text) return msg.reply('❌ Please provide a number! Example: .guess 50');
    
    const game = guessGames.get(gameId);
    const guess = parseInt(text);
    
    if (isNaN(guess)) return msg.reply('❌ Please enter a valid number!');
    
    game.attempts++;
    
    if (guess === game.number) {
        guessGames.delete(gameId);
        const { getUser, saveDatabase } = require('../lib/database');
        const user = getUser(sender);
        const reward = 500;
        user.coins += reward;
        saveDatabase();
        
        return msg.reply(`🎉 *Correct!*\n\nThe number was *${game.number}*!\nAttempts: ${game.attempts}\n💰 Reward: $${reward}\n\n_© GODFATHER XMD_`);
    }
    
    if (game.attempts >= game.maxAttempts) {
        guessGames.delete(gameId);
        return msg.reply(`❌ *Game Over!*\n\nThe number was *${game.number}*!\nBetter luck next time!\n\n_© GODFATHER XMD_`);
    }
    
    const hint = guess < game.number ? '📈 Higher!' : '📉 Lower!';
    await msg.reply(`${hint}\nAttempts: ${game.attempts}/${game.maxAttempts}\n\n_© GODFATHER XMD_`);
}

async function cmdSlot(ctx) {
    const { msg, sender, text } = ctx;
    const { getUser, saveDatabase } = require('../lib/database');
    const user = getUser(sender);
    
    const bet = parseInt(text) || 100;
    if (bet <= 0) return msg.reply('❌ Invalid bet amount!');
    if (bet > user.coins) return msg.reply(`❌ Insufficient balance! You have $${user.coins.toLocaleString()}`);
    
    const symbols = ['🍒', '🍋', '🍊', '🍇', '💎', '7️⃣', '🔔', '⭐'];
    const result = [
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)]
    ];
    
    let winMultiplier = 0;
    
    if (result[0] === result[1] && result[1] === result[2]) {
        winMultiplier = result[0] === '7️⃣' ? 10 : result[0] === '💎' ? 7 : 5;
    } else if (result[0] === result[1] || result[1] === result[2] || result[0] === result[2]) {
        winMultiplier = 2;
    }
    
    const winnings = bet * winMultiplier;
    user.coins += winnings - bet;
    saveDatabase();
    
    const slotText = `🎰 *Slot Machine*
━━━━━━━━━━━━━━━
┌─────────┐
│ ${result[0]} │ ${result[1]} │ ${result[2]} │
└─────────┘

${winMultiplier > 0 ? `🎉 *YOU WIN!*\n💰 Winnings: $${winnings.toLocaleString()} (${winMultiplier}x)` : `😢 *You Lost!*\n💸 Lost: $${bet.toLocaleString()}`}

💰 Balance: $${user.coins.toLocaleString()}
━━━━━━━━━━━━━━━
_© GODFATHER XMD | Powered by Soham_`;

    await msg.reply(slotText);
}

async function cmdRPS(ctx) {
    const { msg, text, sender } = ctx;
    if (!text) return msg.reply('❌ Usage: .rps rock/paper/scissors');
    
    const choices = ['rock', 'paper', 'scissors'];
    const emojis = { rock: '🪨', paper: '📄', scissors: '✂️' };
    
    const playerChoice = text.toLowerCase();
    if (!choices.includes(playerChoice)) return msg.reply('❌ Choose: rock, paper, or scissors!');
    
    const botChoice = choices[Math.floor(Math.random() * choices.length)];
    
    let result;
    if (playerChoice === botChoice) {
        result = "🤝 It's a *tie*!";
    } else if (
        (playerChoice === 'rock' && botChoice === 'scissors') ||
        (playerChoice === 'paper' && botChoice === 'rock') ||
        (playerChoice === 'scissors' && botChoice === 'paper')
    ) {
        result = "🎉 You *win*!";
        const { getUser, saveDatabase } = require('../lib/database');
        const user = getUser(sender);
        user.coins += 200;
        saveDatabase();
        result += " (+$200)";
    } else {
        result = "😢 You *lose*!";
    }
    
    await msg.reply(`🎮 *Rock Paper Scissors*\n━━━━━━━━━━━━━━━\n\nYou: ${emojis[playerChoice]} ${playerChoice}\nBot: ${emojis[botChoice]} ${botChoice}\n\n${result}\n━━━━━━━━━━━━━━━\n_© GODFATHER XMD_`);
}

async function cmdQuiz(ctx) {
    const { sock, msg, from } = ctx;
    const axios = require('axios');
    
    try {
        const { data } = await axios.get('https://opentdb.com/api.php?amount=1&type=multiple');
        
        if (data.results && data.results.length > 0) {
            const question = data.results[0];
            const answers = [...question.incorrect_answers, question.correct_answer].sort(() => Math.random() - 0.5);
            
            let quizText = `🧠 *Quiz Time!*\n━━━━━━━━━━━━━━━\n\n📝 *${decodeHTML(question.question)}*\n\n🏷️ Category: ${question.category}\n⭐ Difficulty: ${question.difficulty}\n\n`;
            
            answers.forEach((answer, i) => {
                quizText += `${['A', 'B', 'C', 'D'][i]}. ${decodeHTML(answer)}\n`;
            });
            
            quizText += `\n✅ Correct Answer: ||${decodeHTML(question.correct_answer)}||\n━━━━━━━━━━━━━━━\n_© GODFATHER XMD_`;
            
            await msg.reply(quizText);
        }
    } catch (e) {
        // Fallback quiz
        const quizzes = [
            { q: "What is the capital of France?", a: "Paris" },
            { q: "What is 15 × 15?", a: "225" },
            { q: "Who created JavaScript?", a: "Brendan Eich" },
            { q: "What planet is known as the Red Planet?", a: "Mars" },
            { q: "What is the largest ocean on Earth?", a: "Pacific Ocean" }
        ];
        
        const quiz = quizzes[Math.floor(Math.random() * quizzes.length)];
        await msg.reply(`🧠 *Quiz*\n\n${quiz.q}\n\nAnswer: *${quiz.a}*\n\n_© GODFATHER XMD_`);
    }
}

async function cmdHangman(ctx) {
    const { msg, from, text } = ctx;
    
    const words = ['javascript', 'python', 'programming', 'computer', 'godfather', 'whatsapp', 'algorithm', 'database', 'internet', 'software'];
    
    const gameId = from;
    
    if (!hangmanGames.has(gameId)) {
        const word = words[Math.floor(Math.random() * words.length)];
        hangmanGames.set(gameId, {
            word,
            guessed: [],
            lives: 6,
            maxLives: 6
        });
        
        const display = word.split('').map(() => '_ ').join('');
        return msg.reply(`🎮 *Hangman*\n━━━━━━━━━━━━━━━\n\n${display}\n\n❤️ Lives: ${'❤️'.repeat(6)}\n\nGuess a letter with *.hangman <letter>*\n━━━━━━━━━━━━━━━\n_© GODFATHER XMD_`);
    }
    
    if (!text || text.length !== 1) return msg.reply('❌ Guess one letter at a time!');
    
    const game = hangmanGames.get(gameId);
    const letter = text.toLowerCase();
    
    if (game.guessed.includes(letter)) return msg.reply('❌ Already guessed that letter!');
    
    game.guessed.push(letter);
    
    if (!game.word.includes(letter)) {
        game.lives--;
    }
    
    const display = game.word.split('').map(l => game.guessed.includes(l) ? l : '_').join(' ');
    
    if (game.lives <= 0) {
        hangmanGames.delete(gameId);
        return msg.reply(`💀 *Game Over!*\n\nThe word was: *${game.word}*\n\n_© GODFATHER XMD_`);
    }
    
    if (!display.includes('_')) {
        hangmanGames.delete(gameId);
        return msg.reply(`🎉 *You Won!*\n\nThe word was: *${game.word}*\n\n_© GODFATHER XMD_`);
    }
    
    await msg.reply(`🎮 *Hangman*\n\n${display}\n\n❤️ Lives: ${'❤️'.repeat(game.lives)}${'🖤'.repeat(game.maxLives - game.lives)}\n📝 Guessed: ${game.guessed.join(', ')}\n\n_© GODFATHER XMD_`);
}

async function cmdMathGame(ctx) {
    const { msg, from, text, sender } = ctx;
    
    const gameId = from;
    
    if (!mathGames.has(gameId) || !text) {
        const num1 = Math.floor(Math.random() * 50) + 1;
        const num2 = Math.floor(Math.random() * 50) + 1;
        const ops = ['+', '-', '×'];
        const op = ops[Math.floor(Math.random() * ops.length)];
        
        let answer;
        switch (op) {
            case '+': answer = num1 + num2; break;
            case '-': answer = num1 - num2; break;
            case '×': answer = num1 * num2; break;
        }
        
        mathGames.set(gameId, { answer, timestamp: Date.now() });
        
        return msg.reply(`🔢 *Math Challenge!*\n━━━━━━━━━━━━━━━\n\nWhat is *${num1} ${op} ${num2}* = ?\n\nReply with *.mathgame <answer>*\n━━━━━━━━━━━━━━━\n_© GODFATHER XMD_`);
    }
    
    const game = mathGames.get(gameId);
    const answer = parseInt(text);
    
    if (answer === game.answer) {
        mathGames.delete(gameId);
        const { getUser, saveDatabase } = require('../lib/database');
        const user = getUser(sender);
        user.coins += 300;
        saveDatabase();
        
        return msg.reply(`✅ *Correct!*\n\nThe answer was *${game.answer}*!\n💰 Reward: $300\n\n_© GODFATHER XMD_`);
    } else {
        mathGames.delete(gameId);
        return msg.reply(`❌ *Wrong!*\n\nThe correct answer was *${game.answer}*\n\n_© GODFATHER XMD_`);
    }
}

function decodeHTML(html) {
    return html
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'");
}

module.exports = { handle, commands };