module.exports = function ({ api, models }) {

  setInterval(function () {
    if (global.config.NOTIFICATION) {
      require("./handle/handleNotification.js")({ api });
      console.log('---LOADER NOTIFICATION SECURITI---');
    }
  }, 1000 * 60);

  const Users = require("./controllers/users")({ models, api }),
    Threads = require("./controllers/threads")({ models, api }),
    Currencies = require("./controllers/currencies")({ models });
  const logger = require("../utils/log.js");
  const fs = require("fs");
  const moment = require('moment-timezone');
  let day = moment.tz("Asia/Ho_Chi_Minh").day();

  const checkttDataPath = __dirname + '/../modules/commands/-checktt/';
  setInterval(async () => {
    const day_now = moment.tz("Asia/Ho_Chi_Minh").day();
    if (day != day_now) {
      day = day_now;
      const checkttData = fs.readdirSync(checkttDataPath);
      console.log('--> CHECKTT: Ngày Mới');
      checkttData.forEach(async (checkttFile) => {
        const checktt = JSON.parse(fs.readFileSync(checkttDataPath + checkttFile));
        let storage = [], count = 1;
        for (const item of checktt.day) {
          const userName = await Users.getNameUser(item.id) || 'Facebook User';
          const itemToPush = { ...item, name: userName };
          storage.push(itemToPush);
        }
        storage.sort((a, b) => {
          if (a.count > b.count) {
            return -1;
          } else if (a.count < b.count) {
            return 1;
          } else {
            return a.name.localeCompare(b.name);
          }
        });
        let checkttBody = '📆══『𝐓𝐎𝐏 𝟏𝟎 𝐓𝐔̛𝐎̛𝐍𝐆 𝐓𝐀́𝐂 𝐍𝐆𝐀̀𝐘』══📆\n━━━━━━━━━━━━━━━━━\n→ 𝗧𝗵𝗼̂𝗻𝗴 𝗯𝗮́𝗼 𝘃𝗮̀𝗼 𝗹𝘂́𝗰 𝟬:𝟬𝟬:𝟬𝟬 𝗔𝗠 𝗵𝗮̆̀𝗻𝗴 𝗻𝗴𝗮̀𝘆\n━━━━━━━━━━━━━━━━━\n\n';
        checkttBody += storage.slice(0, 10).map(item => `${count++}. ${item.name} (${item.count})`).join('\n');
        api.sendMessage(checkttBody, checkttFile.replace('.json', ''), (err) => err ? console.log(err) : '');

        checktt.day.forEach(e => {
          e.count = 0;
        });
        checktt.time = day_now;

        fs.writeFileSync(checkttDataPath + checkttFile, JSON.stringify(checktt, null, 4));
      });
      if (day_now == 1) {
        console.log('--> CHECKTT: Tuần Mới');
        checkttData.forEach(async (checkttFile) => {
          const checktt = JSON.parse(fs.readFileSync(checkttDataPath + checkttFile));
          let storage = [], count = 1;
          for (const item of checktt.week) {
            const userName = await Users.getNameUser(item.id) || 'Facebook User';
            const itemToPush = { ...item, name: userName };
            storage.push(itemToPush);
          }
          storage.sort((a, b) => {
            if (a.count > b.count) {
              return -1;
            } else if (a.count < b.count) {
              return 1;
            } else {
              return a.name.localeCompare(b.name);
            }
          });
          let checkttBody = '📆══『𝐓𝐎𝐏 𝟐𝟎 𝐓𝐔̛𝐎̛𝐍𝐆 𝐓𝐀́𝐂 𝐓𝐔𝐀̂̀𝐍』══📆\n━━━━━━━━━━━━━━━━━\n→ 𝗧𝗵𝗼̂𝗻𝗴 𝗯𝗮́𝗼 𝘃𝗮̀𝗼 𝗹𝘂́𝗰 𝟬:𝟬𝟬:𝟬𝟬 𝗔𝗠 𝗵𝗮̆̀𝗻𝗴 𝐭𝐮𝐚̂̀𝐧\n━━━━━━━━━━━━━━━━━\n\n';
          checkttBody += storage.slice(0, 20).map(item => `${count++}.${item.name}\n→ Tổng số tin nhắn: ${item.count}`).join('\n');
          api.sendMessage(checkttBody, checkttFile.replace('.json', ''), (err) => err ? console.log(err) : '');
          checktt.week.forEach(e => {
            e.count = 0;
          });

          fs.writeFileSync(checkttDataPath + checkttFile, JSON.stringify(checktt, null, 4));
        });
      }
      global.client.sending_top = false;
    }
  }, 1000 * 10);

  (async function () {

    try {
      logger(global.getText('listen', 'startLoadEnvironment'), '[ DATABASE ]');
      let threads = await Threads.getAll(),
        users = await Users.getAll(['userID', 'name', 'data']),
        currencies = await Currencies.getAll(['userID']);
      for (const data of threads) {
        const idThread = String(data.threadID);
        global.data.allThreadID.push(idThread);
        global.data.threadData.set(idThread, data['data'] || {});
        global.data.threadInfo.set(idThread, data.threadInfo || {});
        if (data['data'] && data['data']['banned'] == true)
          global.data.threadBanned.set(idThread, {
            'reason': data['data']['reason'] || '',
            'dateAdded': data['data']['dateAdded'] || ''
          });
        if (data['data'] && data['data']['commandBanned'] && data['data']['commandBanned'].length != 0)
          global['data']['commandBanned']['set'](idThread, data['data']['commandBanned']);
        if (data['data'] && data['data']['NSFW']) global['data']['threadAllowNSFW']['push'](idThread);
      }
      logger.loader(global.getText('listen', 'loadedEnvironmentThread'));
      for (const dataU of users) {
        const idUsers = String(dataU['userID']);
        global.data['allUserID']['push'](idUsers);
        if (dataU.name && dataU.name.length != 0) global.data.userName['set'](idUsers, dataU.name);
        if (dataU.data && dataU.data.banned == 1) global.data['userBanned']['set'](idUsers, {
          'reason': dataU['data']['reason'] || '',
          'dateAdded': dataU['data']['dateAdded'] || ''
        });
        if (dataU['data'] && dataU.data['commandBanned'] && dataU['data']['commandBanned'].length != 0)
          global['data']['commandBanned']['set'](idUsers, dataU['data']['commandBanned']);
      }
      for (const dataC of currencies) global.data.allCurrenciesID.push(String(dataC['userID']));
      logger.loader(global.getText('listen', 'loadedEnvironmentUser')), logger(global.getText('listen', 'successLoadEnvironment'), '[ DATABASE ]');
    } catch (error) {
      return logger.loader(global.getText('listen', 'failLoadEnvironment', error), 'error');
    }
  })();

  logger(`${api.getCurrentUserID()} - 『 ${global.config.PREFIX} 』 • ${(!global.config.BOTNAME) ? "This bot was made by CatalizCS and SpermLord" : global.config.BOTNAME}`, "『 BOT INFO 』");

  const handleCommand = require("./handle/handleCommand")({ api, models, Users, Threads, Currencies });
  const handleCommandEvent = require("./handle/handleCommandEvent")({ api, models, Users, Threads, Currencies });
  const handleReply = require("./handle/handleReply")({ api, models, Users, Threads, Currencies });
  const handleReaction = require("./handle/handleReaction")({ api, models, Users, Threads, Currencies });
  const handleEvent = require("./handle/handleEvent")({ api, models, Users, Threads, Currencies });
  const handleRefresh = require("./handle/handleRefresh")({ api, models, Users, Threads, Currencies });
  const handleCreateDatabase = require("./handle/handleCreateDatabase")({ api, Threads, Users, Currencies, models });
  api.sendMessage(`
  [</>] • Khởi chạy bot thành công ✅,
  [</>] • Prefix hiện tại là: ${global.config.PREFIX},
  [</>] • Tên bot: ${global.config.BOTNAME},
  [</>] • Uid bot: ${api.getCurrentUserID()},
  [</>] • Uid admin: ${global.config.ADMC[0]},  `, global.config.ADMC[0]);
  logger.loader(`====== ${Date.now() - global.client.timeStart}ms ======`);

  return (event) => {
    switch (event.type) {
      case "message":
      case "message_reply":
      case "message_unsend":
        handleCommand({ event });
        handleCommandEvent({ event });
        handleReply({ event });
        break;
      case "event":
        handleEvent({ event });
        break;
      case "message_reaction":
        handleReaction({ event });
        break;
      case "presence":
        handleRefresh({ event });
        break;
    }
  };
};

