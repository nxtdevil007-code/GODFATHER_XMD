const axios = require('axios');
const cheerio = require('cheerio');
const yts = require('yt-search');
const fetch = require('node-fetch');

// YouTube Search
async function ytSearch(query) {
    try {
        const results = await yts(query);
        return results.videos.slice(0, 10);
    } catch (e) {
        throw new Error('YouTube search failed');
    }
}

// YouTube Download (Audio)
async function ytMp3(url) {
    try {
        const apiUrl = `https://api.lolhuman.xyz/api/ytaudio?url=${url}`;
        const res = await axios.get(apiUrl);
        return res.data;
    } catch (e) {
        // Fallback
        const apiUrl = `https://api.dreaded.site/api/ytdl/audio?url=${url}`;
        const res = await axios.get(apiUrl);
        return res.data;
    }
}

// YouTube Download (Video)
async function ytMp4(url) {
    try {
        const apiUrl = `https://api.lolhuman.xyz/api/ytvideo?url=${url}`;
        const res = await axios.get(apiUrl);
        return res.data;
    } catch (e) {
        const apiUrl = `https://api.dreaded.site/api/ytdl/video?url=${url}`;
        const res = await axios.get(apiUrl);
        return res.data;
    }
}

// TikTok Downloader
async function tiktokDl(url) {
    try {
        const apiUrl = `https://api.lolhuman.xyz/api/tiktok?url=${url}`;
        const res = await axios.get(apiUrl);
        return res.data;
    } catch (e) {
        throw new Error('TikTok download failed');
    }
}

// Instagram Downloader
async function instaDl(url) {
    try {
        const apiUrl = `https://api.lolhuman.xyz/api/instagram?url=${url}`;
        const res = await axios.get(apiUrl);
        return res.data;
    } catch (e) {
        throw new Error('Instagram download failed');
    }
}

// Facebook Downloader
async function fbDl(url) {
    try {
        const apiUrl = `https://api.lolhuman.xyz/api/facebook?url=${url}`;
        const res = await axios.get(apiUrl);
        return res.data;
    } catch (e) {
        throw new Error('Facebook download failed');
    }
}

// Google Search
async function googleSearch(query) {
    try {
        const googleIt = require('google-it');
        const results = await googleIt({ query });
        return results.slice(0, 10);
    } catch (e) {
        throw new Error('Google search failed');
    }
}

// Wikipedia
async function wikipedia(query) {
    try {
        const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
        const res = await axios.get(url);
        return res.data;
    } catch (e) {
        throw new Error('Wikipedia search failed');
    }
}

// Weather
async function getWeather(city) {
    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=060a6bcfa19809c2cd4d97a212b19273&units=metric`;
        const res = await axios.get(url);
        return res.data;
    } catch (e) {
        throw new Error('Weather fetch failed');
    }
}

// Lyrics
async function getLyrics(song) {
    try {
        const url = `https://api.lolhuman.xyz/api/lirik?query=${encodeURIComponent(song)}`;
        const res = await axios.get(url);
        return res.data;
    } catch (e) {
        throw new Error('Lyrics not found');
    }
}

// Anime Quote
async function animeQuote() {
    try {
        const res = await axios.get('https://animechan.xyz/api/random');
        return res.data;
    } catch (e) {
        throw new Error('Could not fetch anime quote');
    }
}

// Waifu Image
async function waifuImage(category = 'waifu') {
    try {
        const res = await axios.get(`https://api.waifu.pics/sfw/${category}`);
        return res.data.url;
    } catch (e) {
        throw new Error('Could not fetch waifu image');
    }
}

// Translate
async function translate(text, lang) {
    try {
        const translateGoogle = require('translate-google');
        const result = await translateGoogle(text, { to: lang });
        return result;
    } catch (e) {
        throw new Error('Translation failed');
    }
}

// Quote Maker
async function quoteMaker() {
    try {
        const res = await axios.get('https://api.quotable.io/random');
        return res.data;
    } catch (e) {
        throw new Error('Could not fetch quote');
    }
}

// Jokes
async function getJoke() {
    try {
        const res = await axios.get('https://v2.jokeapi.dev/joke/Any?type=single');
        return res.data;
    } catch (e) {
        throw new Error('Could not fetch joke');
    }
}

// Meme
async function getMeme() {
    try {
        const res = await axios.get('https://meme-api.com/gimme');
        return res.data;
    } catch (e) {
        throw new Error('Could not fetch meme');
    }
}

// Truth or Dare
function getTruth() {
    const truths = [
        "What is your biggest fear?",
        "What is the most embarrassing thing you've ever done?",
        "What is your biggest secret?",
        "Have you ever lied to your best friend?",
        "What's the worst thing you've ever done?",
        "Who do you have a crush on?",
        "What is your most embarrassing moment?",
        "Have you ever cheated on a test?",
        "What's the biggest lie you've ever told?",
        "What are you most insecure about?",
        "What's the most childish thing you still do?",
        "Have you ever stolen anything?",
        "What's the worst date you've been on?",
        "What's the most embarrassing thing in your phone?",
        "Have you ever had a crush on a teacher?"
    ];
    return truths[Math.floor(Math.random() * truths.length)];
}

function getDare() {
    const dares = [
        "Send your last selfie to this group!",
        "Type with your eyes closed for 1 minute!",
        "Send a voice note singing your favorite song!",
        "Change your profile picture to a funny photo for 1 hour!",
        "Send 'I love you' to the 5th person in your contacts!",
        "Do 10 pushups and send a video!",
        "Send your screen time screenshot!",
        "Send the last photo in your gallery!",
        "Call someone and tell them a joke!",
        "Send a paragraph in a language you don't speak!",
        "Make your status 'I'm a bot' for 1 hour!",
        "Send a voice message with a funny accent!",
        "Text your crush 'Hey gorgeous'!",
        "Change your name to 'Godfather's Servant' for 1 hour!",
        "Send the oldest photo in your gallery!"
    ];
    return dares[Math.floor(Math.random() * dares.length)];
}

module.exports = {
    ytSearch,
    ytMp3,
    ytMp4,
    tiktokDl,
    instaDl,
    fbDl,
    googleSearch,
    wikipedia,
    getWeather,
    getLyrics,
    animeQuote,
    waifuImage,
    translate,
    quoteMaker,
    getJoke,
    getMeme,
    getTruth,
    getDare
};