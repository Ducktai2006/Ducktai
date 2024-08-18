const chalkAnimation = require('chalk-animation');
const readline = require('readline');
const ProgressBar = require('progress');
const chalk = require('chalk');
const axios = require('axios');
const fs = require('fs');
const { spawn } = require('child_process');
const gradient = require('gradient-string');
const os = require('os');
const logger = require("./utils/log");
const http = require('http');

const str = '[ SERVER-LOADING ] » Đang tiến hành khởi động hệ thống, vui lòng chờ một chút.';
const rainbow = chalkAnimation.rainbow(str);
const progressBar = new ProgressBar('[:bar]', { total: 10 });

progressBar.width = process.stdout.columns - 20;

let progress = 0;
const intervalId = setInterval(() => {
  const ratio = progress / 10;
  rainbow.replace(`${str}`);
  progressBar.update(ratio);

  if (progress >= 10) {
    clearInterval(intervalId);
    runCustomCode();
  }

  progress++;
}, 300);

axios.get("https://raw.githubusercontent.com/nguyenductai206/nguyenductai206/main/package.json").then((res) => {
  console.log(chalk.bgRed.white.bold("『 NAME 』» ", res.data.name));
  console.log(chalk.bgGreen.white.bold("『 VERSION 』» ", res.data.version));
  console.log(chalk.bgBlue.white.bold("『 DESCRIPTION 』» ", res.data.description));
  console.log(chalk.bgGreen.white.bold("『 LOAD DATA 』» ", res.data['data-mitai']));
  console.log(chalk.bgRed.white.bold("『 DATA 』» ", res.data['data-mitai-project']));

  const colors = ["#FF9900", "#FFFF33", "#33FFFF", "#FF99FF", "#FF3366", "#FFFF66", "#FF00FF", "#66FF99", "#00CCFF", "#FF0099"];
  const random = colors[Math.floor(Math.random() * colors.length)];
  const random2 = colors[Math.floor(Math.random() * colors.length)];

  const logo = `
██████╗ ██╗   ██╗ █████╗     ████████╗ █████╗ ██╗ 
██╔══██╗██║   ██║██╔══██     ╚══██╔══╝██╔══██╗██║
██║  ██║██║   ██║██║  ╚═╝       ██║   ███████║██║
██║  ██║██║   ██║██║  ██╗       ██║   ██╔══██║██║
██████╔╝╚██████╔╝╚█████╔╝       ██║   ██║  ██║██║
╚═════╝  ╚═════╝  ╚════╝        ╚═╝   ╚═╝  ╚═╝╚═╝`;

  const randomColors = [random, random2];
  const coloredData = gradient(...randomColors).multiline(logo);

  const logoLines = logo.split('\n');
  const maxLength = Math.max(...logoLines.map(line => line.length));
  const horizontalPadding = ' '.repeat(Math.floor((process.stdout.columns - maxLength) / 2));

  console.log(coloredData.split('\n').map(line => horizontalPadding + line).join('\n'));

  const packageJson = require('./package.json');
  if (packageJson.dependencies) {
    const dependencies = Object.keys(packageJson.dependencies);
    console.log(chalk.bold.hex(random)('[ LOADER-PACKAGE ] » ') + chalk.bold.hex(random2)(`Load thành công ${dependencies.length} package`));
    console.log(chalk.bold.hex(random)(`[ LIST-PACKAGE] » `) + chalk.bold.hex(random2)(`Tổng package hiện có: ${dependencies.length}`));
  } else {
    console.log(chalk.bold.hex(random)('[ ERROR-PACKAGE ] » ') + chalk.bold.hex(random2)('Không thể load được package.'));
  }
});

const cpuUsage = os.loadavg()[0] * 100 / os.cpus().length;
const totalMemory = os.totalmem();
const freeMemory = os.freemem();
const memoryUsage = (totalMemory - freeMemory) * 100 / totalMemory;

const item = [
  {
    "thiết bị": "RAM",
    "dung lượng": `${(totalMemory / (1024 * 1024 * 1024)).toFixed(2)} GB`,
    "phần trăm": `${memoryUsage.toFixed(2)} %`
  },
  {
    "thiết bị": "CPU",
    "cores": `${os.cpus().length}`,
    "sử dụng": `${cpuUsage.toFixed(2)} %`
  }
];

function startBot(message) {
  if (message) console.log(chalk.green("[ Bắt đầu ] » ") + message);

  const child = spawn("node", ["mitai"], {
    cwd: __dirname,
    stdio: "inherit",
    shell: true
  });

  child.on("close", (codeExit) => {
    if (codeExit != 0 || (global.countRestart && global.countRestart < 5)) {
      startBot("Tiến hành khởi động lại...");
      global.countRestart += 1;
    }
  });

  child.on("error", function (error) {
    console.log(chalk.red("Đã xảy ra lỗi: " + JSON.stringify(error)));
  });
};

setTimeout(() => {
  console.table(item);
}, 3000);

startBot();
