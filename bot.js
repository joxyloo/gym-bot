const { Telegraf } = require('telegraf');
const notion = require('./notion.js');
const bot = new Telegraf(process.env.BOT_TOKEN);
var chatId = process.env.TG_CHAT_ID;
var workout;

async function getWorkout() {
  const { msg, imgUrl, tag } = await notion.getDailyWorkoutProgram();
  notifyChannel(msg, imgUrl, tag);
}

async function notifyChannel(msg, imgUrl, tag) {
  bot.telegram.sendMessage(chatId, msg, { parse_mode: 'HTML' });
  if (imgUrl) {
    bot.telegram.sendPhoto(chatId, { url: imgUrl });
  }
  if (tag) {
    msg = await notion.getPR(tag);
    bot.telegram.sendMessage(chatId, msg);
  }
}

function sendHydrationBot() {
  bot.telegram.sendMessage(chatId, '💧 Finish 2l water today?', {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '😎 Yes!',
            callback_data: 'hydration_yes',
          },
          {
            text: '😥 No',
            callback_data: 'hydration_no',
          },
        ],
      ],
    },
  });
}

function sendWorkoutCheck() {
  bot.telegram.sendMessage(chatId, '🏋🏻‍♀️ Done your workout?', {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '😎 Yes!',
            callback_data: 'workout_yes',
          },
          {
            text: '😥 No',
            callback_data: 'workout_no',
          },
        ],
      ],
    },
  });
}
exports.notifyChannel = notifyChannel;

setInterval(async () => {
  var time = new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Kuala_Lumpur' });

  if (time === '7:00:00 AM') {
    bot.telegram.sendMessage(chatId, '🌻☀️ Good morning~ ');
    getWorkout();
  }
  if (time === '11:00:00 AM') {
    bot.telegram.sendMessage(chatId, await notion.getMeal(), { parse_mode: 'HTML' });
  }
  if (time === '10:00:00 PM') {
    sendHydrationBot();
  }
}, 1000); //run every minute

bot.start((ctx) => {
  chatId = ctx.chat.id;
  bot.telegram.sendMessage(chatId, '<b>Hello</b>', { parse_mode: 'HTML' });
});

bot.hears('water', (ctx) => sendHydrationBot());
bot.command('water', async (ctx) => {
  bot.telegram.sendMessage(chatId, await notion.getWater(), { parse_mode: 'HTML' });
});
bot.command('workout', (ctx) => getWorkout());
bot.command('pr', (ctx) => {
  const message = 'Please select one';
  bot.telegram.sendMessage(ctx.chat.id, message, {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '💪🏻 Upper Body',
            callback_data: 'pr_Upper Body',
          },
          {
            text: '🍑 Lower Body',
            callback_data: 'pr_Lower Body',
          },
        ],
      ],
    },
  });
});
bot.command('updatepr', (ctx) => {
  const message = 'Please select one';
  bot.telegram.sendMessage(ctx.chat.id, message, {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '💪🏻 Upper Body',
            callback_data: 'updatechoose_Upper Body',
          },
          {
            text: '🍑 Lower Body',
            callback_data: 'updatechoose_Lower Body',
          },
        ],
      ],
    },
  });
});
bot.command('progress', async (ctx) => {
  bot.telegram.sendMessage(chatId, await notion.getProgress(), { parse_mode: 'HTML' });
});
bot.command('done', async (ctx) => {
  const result = await notion.doneWorkout();

  bot.telegram.sendMessage(chatId, await notion.getProgress(), { parse_mode: 'HTML' });
  if (result === 'Updated successfully!') {
    ctx.reply('Great job. Keep going! 💪🏻');
  } else {
    ctx.reply(result);
  }
});
bot.command('meal', async (ctx) => {
  bot.telegram.sendMessage(chatId, await notion.getMeal(), { parse_mode: 'HTML' });
});

bot.action(/pr_.*/gm, async (ctx) => {
  const tag = ctx.match[0].split('_')[1];
  bot.telegram.sendMessage(chatId, await notion.getPR(tag), { parse_mode: 'HTML' });
  //
  // return ctx.reply(await notion.getPR(tag));
});
bot.action(/updatechoose_.*/gm, async (ctx) => {
  const message = 'Please select one';
  const tag = ctx.match[0].split('_')[1];
  var workouts = await notion.getWorkout(tag);
  const menu = workouts.map((workout) => {
    const workoutName = workout.properties['Name'].title[0].plain_text;
    return {
      text: workoutName,
      callback_data: `update_${workoutName}`,
    };
  });
  bot.telegram.sendMessage(ctx.chat.id, message, {
    reply_markup: {
      inline_keyboard: [menu],
    },
  });
});
bot.action(/update_.*/gm, (ctx) => {
  workout = ctx.match[0].split('_')[1];
  ctx.reply('Please send your new record');
});
bot.action(/hydration_.*/gm, async (ctx) => {
  const ans = (workout = ctx.match[0].split('_')[1]);
  if (ans === 'yes') {
    await notion.updateHydration(ans);
    bot.telegram.sendMessage(chatId, await notion.getWater(), { parse_mode: 'HTML' });
    ctx.reply('Good job! 👏🏻');
  } else {
    ctx.reply('Remember to drink more water ehhhh 🌝');
  }
});
bot.hears(/.*kg(.|\w)*/gm, async (ctx) => {
  var record = ctx.match[0];
  const result = await notion.updatePR(workout, record);
  this.notifyChannel(result);
});

bot.launch();
