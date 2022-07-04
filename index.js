const express = require('express');
const bot = require('./bot.js');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello Express app! :D');
});

app.listen(3000, () => {
  console.log('server started');
});
