#!/usr/bin/env node

/** Fetch states/daily or us/daily from https://covidtracking.com/ API */
const fs = require('fs');

if (typeof fetch === 'undefined') {
    fetch = require('node-fetch');
}

const dataFeed = process.argv[2] || 'states/daily'
const filename = dataFeed.replace(/\W/g, '_') + '.json'; // "states_daily.json";
const dataUrl = `https://covidtracking.com/api/${dataFeed}`;

function backupFile(file) {
    if (fs.existsSync('./BAK') && fs.existsSync(file)) {
        const modTime = (fs.statSync(file).mtime || new Date()).toJSON()
        fs.copyFileSync(file, './BAK/' + modTime + '_' + file);
    }
}

function saveJSON(file, json) {
    fs.writeFileSync(file, JSON.stringify(json, null, 2), 'UTF-8');
}

async function fetchFile(file=filename, url=dataUrl) {
    const res = await fetch(url);
    const json = await res.json();
    console.log(json)
    backupFile(file);
    saveJSON(file, json);
    return json;
}

fetchFile();
