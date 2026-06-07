const fs = require('fs-extra');
const path = require('path');
const config = require('../config');

const dbPath = config.dbPath;

let db = {
    users: {},
    groups: {},
    settings: {
        antilink: {},
        welcome: {},
        goodbye: {},
        antispam: {},
        muted: {}
    },
    economy: {},
    warnings: {}
};

function initDatabase() {
    try {
        if (fs.existsSync(dbPath)) {
            db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
        } else {
            saveDatabase();
        }
    } catch (e) {
        console.log('Database initialized fresh');
        saveDatabase();
    }
}

function saveDatabase() {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

function getUser(jid) {
    if (!db.users[jid]) {
        db.users[jid] = {
            name: '',
            xp: 0,
            level: 1,
            coins: 100,
            bank: 0,
            lastDaily: 0,
            lastWork: 0,
            lastRob: 0,
            inventory: [],
            warnings: 0,
            banned: false,
            registered: false,
            regTime: 0
        };
        saveDatabase();
    }
    return db.users[jid];
}

function getGroup(jid) {
    if (!db.groups[jid]) {
        db.groups[jid] = {
            antilink: false,
            antispam: false,
            welcome: true,
            goodbye: true,
            muted: false,
            antitoxic: false,
            antiforeign: false,
            welcomeMsg: '',
            goodbyeMsg: '',
            warnings: {}
        };
        saveDatabase();
    }
    return db.groups[jid];
}

function setGroup(jid, key, value) {
    if (!db.groups[jid]) getGroup(jid);
    db.groups[jid][key] = value;
    saveDatabase();
}

function setUser(jid, key, value) {
    if (!db.users[jid]) getUser(jid);
    db.users[jid][key] = value;
    saveDatabase();
}

function addXP(jid, amount) {
    const user = getUser(jid);
    user.xp += amount;
    const nextLevel = user.level * 500;
    if (user.xp >= nextLevel) {
        user.level += 1;
        user.xp = 0;
        saveDatabase();
        return true; // leveled up
    }
    saveDatabase();
    return false;
}

module.exports = {
    initDatabase,
    saveDatabase,
    getUser,
    getGroup,
    setGroup,
    setUser,
    addXP,
    db
};