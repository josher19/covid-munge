#!/usr/bin/env node
const fs = require('fs');

const state = process.argv[2] === 'undefined' ? undefined : (process.argv[2] || "OR");
const stat = process.argv[3] || "positive";
const filename = process.argv[4] || "states_daily.json"
const dayz = Number(process.env.DAYS) || 4;

const datafile = JSON.parse(fs.readFileSync(filename, 'utf-8'));
const dailies = datafile.filter(s => !state || (s.state === state));
const stats = dailies.map(day => day[stat]).filter(id => id > 2);
const growthRatio = stats.map((val, iter, ra) => val / (ra[iter+1] || val));
const avgList = x => x.reduce( (a, b) => a + b, 0) / x.length;
const toPercent = (n, precision = 0) => Math.round(Math.pow(10, precision+2)*n)/Math.pow(10, precision);
const asPercent = p => toPercent(p - 1.0);
const recentGrowth = growthRatio[0];
const today = dailies[0];
const yesterday = dailies[1];

const sma = (data, period=data.length) => (data.slice(0,period)).reduce((a,b) => a + b)/period;
const ema = (rows, period=3, exponent=2/(period+1)) => rows.slice(period).reduce((prevEma,tick) => (tick - prevEma) * exponent + prevEma, sma(rows, period));
const wma = (values, period=values.length) => values.slice(0, period).reverse().map((v, iter) => v * (iter+1)).reduce((a,b) => (a+b)) / ((Math.min(values.length, period))*(Math.min(values.length, period) + 1)/2)
const sema = (rows, period=3, exponent=2/(period+1)) => rows.reduce((prevEma,tick) => (tick - prevEma) * exponent + prevEma)

const growthRatioRev = growthRatio.slice().reverse();
const semaGrowth = sema(growthRatioRev);
const wmaGrowth = wma(growthRatio, 7);

const format = new Intl.NumberFormat().format;

const predict = (growthRate, days=dayz, initial=today[stat]) => format(Math.round(Math.pow(growthRate, days)*initial))

if (process.env.DEBUG) {
    console.debug({stats, growthRatio, today, yesterday})
}

const dailyGrowth = (avgList(growthRatio));
const minDaily = Math.min(dailyGrowth, recentGrowth, semaGrowth, wmaGrowth, 1.41);

console.log(`
Date: ${today.dateChecked ? today.dateChecked.replace(/T.*/g, '') : today.date}

Deaths: ${format(today.death)}
Hospitalized: ${format(today.hospitalized)}
Positive Tests: ${format(today.positive)}
Negative Tests: ${format(today.negative)}

Positive: ${toPercent((today.positive / (today.positive + today.negative)), 1)}%
- Died: ${toPercent((today.death / today.positive), 1)}%
- Hospitalized: ${toPercent((today.hospitalized / today.positive), 1)}%
    - Died in hospital: ${toPercent((today.death / today.hospitalized), 1)}%

${stat}
---
Today: ${format(stats[0])}
Yesterday: ${format(stats[1])}
Recent Growth: ${asPercent(recentGrowth)}%
Predicted in ${dayz} days: ${predict(recentGrowth)}
Avg Daily Growth: ${asPercent(dailyGrowth)}%
Predicted in ${dayz} days: ${predict(dailyGrowth)}
Doubles every: ~ ${(72/asPercent(dailyGrowth)).toFixed(1)} days

emaStats = ${asPercent(semaGrowth)}% predicted: ${predict(semaGrowth)}
wmaStats = ${asPercent(wmaGrowth)}%, predicted: ${predict(wmaGrowth)}

Minimum: ${asPercent(minDaily)}%, prediction: ${predict(minDaily)}
`);

