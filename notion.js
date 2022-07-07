const { Client } = require('@notionhq/client');
const fetch = require('node-fetch');
const calendar = require('./calendar.js');
const notion = new Client({ auth: process.env.NOTION_KEY });
const databaseId = process.env.NOTION_DATABASE_ID;
const programDatabaseId = process.env.NOTION_PROGRAM_DATABASE_ID;
const habitDatabaseId = process.env.HABIT_DATABASE_ID;
const mealDatabaseId = process.env.MEAL_DATABSE_ID;

exports.getPR = async function (tag) {
  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: 'Tag',
      select: {
        equals: tag,
      },
    },
    sorts: [
      {
        timestamp: 'last_edited_time',
        direction: 'descending',
      },
    ],
  });

  var str = 'Last updated: ' + new Date(response.results[0].last_edited_time).toLocaleDateString('en-GB') + '\n\n';
  response.results.forEach((result) => {
    str += result.properties['Name'].title[0].plain_text;
    str += ' - ';
    str += result.properties['Weight'].rich_text[0].plain_text;
    str += '\n';
  });

  return str;
};

exports.getWorkout = async function (tag) {
  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: 'Tag',
      select: {
        equals: tag,
      },
    },
    sorts: [
      {
        timestamp: 'last_edited_time',
        direction: 'descending',
      },
    ],
  });
  return response.results;
};

exports.getWorkoutProgram = async function (eventDate) {
  eventDate = new Date(eventDate).toISOString().split('T')[0];
  const response = await notion.databases.query({
    database_id: programDatabaseId,
    filter: {
      property: 'Date',
      date: {
        equals: eventDate,
      },
    },
  });

  if (response.results.length < 1) {
    //rest day
    return { msg: 'Today is rest day~ 😮‍💨' };
  }

  const result = response.results[0]; //should only have one
  const imgUrl = result.properties['Image URL'].url;
  const week = result.properties['Week'].rich_text[0].plain_text;
  const day = result.properties['Day'].rich_text[0].plain_text;
  const name = result.properties['Name'].select.name;
  const tag = result.properties['Tag'].select.name;
  var msg = `Week ${week} Day ${day} \n*${name}*`;
  return {
    msg: msg,
    imgUrl: imgUrl,
    tag: tag,
  };
};

exports.updatePR = async function (workout, record) {
  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: 'Name',
      title: {
        equals: workout,
      },
    },
  });

  var newProperties = response.results[0].properties;
  const pageId = response.results[0].id;

  try {
    const updateResponse = await notion.pages.update({
      page_id: pageId,
      properties: {
        Weight: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: record,
              },
            },
          ],
        },
      },
    });

    return 'Updated successfully!';
  } catch (error) {
    console.log('error');
    return 'Update faliled :(';
  }
};

exports.getDailyWorkoutProgram = async function () {
  const localDate = new Date().toLocaleDateString('en-US', { timeZone: 'Asia/Kuala_Lumpur' });
  const date = new Date(localDate).toISOString().split('T')[0];
  const response = await notion.databases.query({
    database_id: programDatabaseId,
    filter: {
      property: 'Date',
      date: {
        equals: date,
      },
    },
  });

  if (response.results.length < 1) {
    //rest day
    return { msg: 'Today is rest day~ 🤗' };
  }

  const result = response.results[0]; //should only have one
  const imgUrl = result.properties['Image URL'].url;
  const week = result.properties['Week'].rich_text[0].plain_text;
  const day = result.properties['Day'].rich_text[0].plain_text;
  const name = result.properties['Name'].select.name;
  const tag = result.properties['Tag'].select.name;
  var msg = `<b>Week ${week} Day ${day} \n<i>${name}</i></b>`;
  return {
    msg: msg,
    imgUrl: imgUrl,
    tag: tag,
  };
};

exports.doneWorkout = async function () {
  await doneWorkoutHabit();
  const date = new Date().toISOString().split('T')[0];
  const response = await notion.databases.query({
    database_id: programDatabaseId,
    filter: {
      property: 'Date',
      date: {
        equals: date,
      },
    },
  });

  if (response.results.length < 1) {
    //rest day
    return 'Today is rest day~ 🤗';
  }

  const pageId = response.results[0].id;

  try {
    const updateResponse = await notion.pages.update({
      page_id: pageId,
      properties: {
        Done: {
          checkbox: true,
        },
      },
    });

    return 'Updated successfully!';
  } catch (error) {
    console.log('error');
    return 'Update faliled :(';
  }
};

exports.getProgress = async function () {
  const response = await notion.databases.query({
    database_id: programDatabaseId,
    sorts: [
      {
        property: 'Date',
        direction: 'ascending',
      },
    ],
  });
  var string = "<b><i>Let's get it!</i></b> 💪🏻\n";
  response.results.forEach((day, i) => {
    if (i % 4 === 0) {
      string += '\n';
    }
    if (day.properties['Done'].checkbox) {
      string += '🌼';
    } else {
      string += '🌱';
    }
  });
  return string;
};

exports.getWater = async function () {
  const response = await notion.databases.query({
    database_id: habitDatabaseId,
    sorts: [
      {
        property: 'Date',
        direction: 'ascending',
      },
    ],
  });
  var string = "<b><i>Let's get it!</i></b> 💪🏻\n";
  response.results.forEach((day, i) => {
    if (i % 7 === 0) {
      string += '\n';
    }
    if (day.properties['Water'].checkbox) {
      string += '💧';
    } else {
      string += '⚪️';
    }
  });
  return string;
};

exports.updateHydration = async function (ans) {
  const date = new Date().toISOString().split('T')[0];

  const response = await notion.databases.query({
    database_id: habitDatabaseId,
    filter: {
      property: 'Date',
      date: {
        equals: date,
      },
    },
  });

  const pageId = response.results[0].id;

  try {
    const updateResponse = await notion.pages.update({
      page_id: pageId,
      properties: {
        Water: {
          checkbox: true,
        },
      },
    });

    return 'Updated successfully!';
  } catch (error) {
    console.log('error');
    return 'Update faliled :(';
  }
};

async function doneWorkoutHabit() {
  const date = new Date().toISOString().split('T')[0];

  const response = await notion.databases.query({
    database_id: habitDatabaseId,
    filter: {
      property: 'Date',
      date: {
        equals: date,
      },
    },
  });

  const pageId = response.results[0].id;

  try {
    const updateResponse = await notion.pages.update({
      page_id: pageId,
      properties: {
        Workout: {
          checkbox: true,
        },
      },
    });

    return 'Updated successfully!';
  } catch (error) {
    console.log('error');
    return 'Update faliled :(';
  }
}

exports.getMeal = async function () {
  const day = calendar.getDay();
  const response = await notion.databases.query({
    database_id: mealDatabaseId,
    filter: {
      property: 'Day',
      select: {
        equals: day.toString(),
      },
    },
  });

  const result = response.results[0];
  var string = `<b>${calendar.getDayString(day)}</b>\n`;
  string += '<b><i>🔆 Lunch</i></b>\n';
  string += result.properties['Lunch'].rich_text[0].plain_text + '\n\n';
  string += '<b><i>🌙 Dinner</i></b>\n';
  string += result.properties['Dinner'].rich_text[0].plain_text;

  return string;
};
