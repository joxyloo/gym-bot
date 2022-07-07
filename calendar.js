// const fs = require('fs');
// const bot = require('./bot.js')
// const notion = require('./notion.js')
// const readline = require('readline');
// const {google} = require('googleapis');
// const { v4: uuidv4} = require('uuid')
// const webhookToken = process.env.WEBHOOK_TOKEN;

// // If modifying these scopes, delete token.json.
// const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
// const TOKEN_PATH = 'token.json';

// // Load client secrets from a local file.
// fs.readFile('credentials.json', (err, content) => {
//   if (err) return console.log('Error loading client secret file:', err);

//   authorize(JSON.parse(content));
// });

// function authorize(credentials) {
//   const {client_secret, client_id, redirect_uris} = credentials.web;
//   const oAuth2Client = new google.auth.OAuth2(
//       client_id, client_secret, redirect_uris[0]);

//   // Check if we have previously stored a token.
//   fs.readFile(TOKEN_PATH, (err, token) => {
//     if (err) return getAccessToken(oAuth2Client);
//     oAuth2Client.setCredentials(JSON.parse(token));
//     google.options({auth: oAuth2Client})
//     setInterval(() => listEvents(), 60000)
//   });
// }

// function getAccessToken(oAuth2Client) {
//   const authUrl = oAuth2Client.generateAuthUrl({
//     access_type: 'offline',
//     scope: SCOPES,
//   });
//   console.log('Authorize this app by visiting this url:', authUrl);
//   const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout,
//   });
//   rl.question('Enter the code from that page here: ', (code) => {
//     rl.close();
//     oAuth2Client.getToken(code, (err, token) => {
//       if (err) return console.error('Error retrieving access token', err);
//       oAuth2Client.setCredentials(token);
//       // Store the token to disk for later program executions
//       fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
//         if (err) return console.error(err);
//         console.log('Token stored to', TOKEN_PATH);
//       });
//     });
//   });
// }

// function listEvents() {
//   const calendar = google.calendar({version: 'v3'});
//   const today = new Date();
//   const tomorrow = new Date(today);
//   tomorrow.setDate(tomorrow.getDate() + 1);
//   calendar.events.list({
//     calendarId: 'primary',
//     timeMin: today.toISOString(),
//     timeMax: tomorrow.toISOString(),
//     singleEvents: true,
//     orderBy: 'startTime',
//   }, (err, res) => {
//     if (err) return console.log('The API returned an error: ' + err);
//     const events = res.data.items;
//     var filteredEvent;
//     if (events.length) {
//       console.log('Upcoming events:');

//       filteredEvent = events.filter((event, i) => {
//         const start = event.start.dateTime || event.start.date;
//         console.log(`${start} - ${event.summary}`);

//         return event.summary.includes('Krissy')
//       });
//       if(filteredEvent.length) {
//         checkKrissyEventStart(filteredEvent)
//       }
//     } else {
//       console.log('No upcoming events found.');
//     }

//   });
// }

// async function checkKrissyEventStart(events) {
//   console.log('checking event')
//   const today = new Date();
//   const minBefore = 15;
//   events.forEach(async event => {
//     const start = event.start.dateTime || event.start.date;

//     var eventTime = new Date(event.start.dateTime);

//     const diff = Math.round(((eventTime-today)/1000)/60);
//     console.log(`${diff} min more till event starts`)

//     if(diff == minBefore) {
//       const {msg, imgUrl, tag} = await notion.getWorkoutProgram(start);
//       bot.notifyChannel(msg, imgUrl, tag)
//     }
//   })

// }

exports.getLocalDate = function () {};

exports.getDay = function () {
  const localDate = new Date().toLocaleDateString('en-US', { timeZone: 'Asia/Kuala_Lumpur' });
  const day = new Date(localDate).getDay();
  return day;
};

exports.getDayString = function (day) {
  switch (day) {
    case 1:
      return 'Monday';
    case 2:
      return 'Tuesday';
    case 3:
      return 'Wednesday';
    case 4:
      return 'Thursday';
    case 5:
      return 'Friday';
    case 6:
      return 'Saturday';
    default:
      return 'Sunday';
  }
};

exports.getDaysThisMonth = function (date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};
