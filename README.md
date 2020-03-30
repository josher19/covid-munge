# covid-munge

Check for daily and average change in number of Covid-19 cases in the USA or by State.

Source of Data: https://covidtracking.com/api/

## Usage

```
npm install

# Check USA
npm run usa # fetch us/daily and predict positive cases in 4 days
node fetch_data.js us/daily # fetch us/daily from the Covid Tracking API
DAYS=2 STAT=death npm run munge:usa # predict deaths in the next 2 days

# Check a State
npm run state -- WA negative # fetch state/daily and predict negative cases in state of WA
DEBUG=1 DAYS=2 npm run munge NY death # predict NY deaths in 2 days with debug details
```

### Notes

* ema = Exponential Moving Average
* wma = Weighted Moving Average

Exact number is not usally totally accurate, but the "Doubles every" stat has been pretty accurate for a ballpark of how quickly this Virus is spreading the the United States of America.
