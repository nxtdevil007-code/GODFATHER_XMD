const { startBot } = require('./connection');
const config = require('./config');
const chalk = require('chalk');
const figlet = require('figlet');
const fs = require('fs-extra');

// Ensure directories exist
fs.ensureDirSync('./session');
fs.ensureDirSync('./database');
fs.ensureDirSync('./media');
fs.ensureDirSync('./temp');

console.log(chalk.bold.hex('#FFD700')(
`
╔══════════════════════════════════════╗
║                                      ║
║       ██████   ██████  ██████        ║
║      ██       ██    ██ ██   ██       ║
║      ██   ███ ██    ██ ██   ██       ║
║      ██    ██ ██    ██ ██   ██       ║
║       ██████   ██████  ██████        ║
║                                      ║
║    ███████  █████  ████████          ║
║    ██      ██   ██    ██             ║
║    █████   ███████    ██             ║
║    ██      ██   ██    ██             ║
║    ██      ██   ██    ██             ║
║                                      ║
║    ██   ██ ███    ███ ██████         ║
║     ██ ██  ████  ████ ██   ██       ║
║      ███   ██ ████ ██ ██   ██       ║
║     ██ ██  ██  ██  ██ ██   ██       ║
║    ██   ██ ██      ██ ██████         ║
║                                      ║
║      Powered by Soham                ║
║      Version: ${config.version}               ║
╚══════════════════════════════════════╝
`
));

console.log(chalk.green('Starting GODFATHER XMD Bot...'));
console.log(chalk.cyan(`Bot Name: ${config.botName}`));
console.log(chalk.cyan(`Owner: ${config.ownerName}`));
console.log(chalk.cyan(`Prefix: ${config.prefix}`));
console.log(chalk.cyan(`Mode: ${config.mode}`));
console.log(chalk.yellow('─'.repeat(50)));

// Start the bot
startBot();

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error(chalk.red('Uncaught Exception:'), err);
});

process.on('unhandledRejection', (err) => {
    console.error(chalk.red('Unhandled Rejection:'), err);
});