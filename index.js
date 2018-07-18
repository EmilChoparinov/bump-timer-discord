const Discord = require('discord.js');
const client = new Discord.Client();
const { readFileSync } = require('fs');
const { join } = require('path');

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

let timerIds = [];

const createNewTimer = (command, channel) => {
    let commands = command.slice(command.indexOf(' ') + 1).split(',');
    for (let i = 0; i < commands.length - 1; i++) {
        commands[i] = parseInt(commands[i]);
    }
    commands[0] = commands[0] * 3600000; // hours to ms
    commands[1] = commands[1] * 60000; // minutes to ms
    commands[2] = commands[2] * 1000; // seconds to ms
    const time = commands[0] + commands[1] + commands[2];
    const timerId = setInterval(() => {
        channel.send(commands[3]);
    }, time);
    timerIds.push(timerId);
    channel.send(`Timer setup for ${commands[0] / 36000000}:${commands[1] * 60000}:${commands[2] / 1000} to send the message '${commands[3]}'`);
}

client.on('message', msg => {

    // sample command: `timerstart 0,30,0,hello world` will print every 30 mins hello world
    // format: `timerstart hours,minutes,seconds,the message`
    if (msg.content.startsWith('timerstart')) {
        createNewTimer(msg.content, msg.channel);
    }

    // sample command: `timerstop`
    // will terminate all current timers
    if (msg.content.startsWith('timerstop')) {
        timerIds.forEach(timer => {
            clearInterval(timer);
        });
        msg.channel.send(`All (${timerIds.length}) timers cleared`);
        timerIds = [];
    }
});

const token = readFileSync(
    join(__dirname, 'token'), { encoding: 'UTF-8' }
);

client.login(token).then(() => {
    const precommands = JSON.parse(readFileSync(join(__dirname, 'commandlist.json')));
    precommands.commands.forEach((command) => {
        client.guilds.forEach(guild => {
            const channel = guild.channels.find('id', command.channel);
            if (channel) {
                createNewTimer(command.command, channel);
            }
        });
    });
});