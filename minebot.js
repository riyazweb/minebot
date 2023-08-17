const mineflayer = require('mineflayer');
const pathfinder = require('mineflayer-pathfinder').pathfinder;
const armorManager = require('mineflayer-armor-manager');
const Movements = require('mineflayer-pathfinder').Movements;
const { GoalNear, GoalBlock } = require('mineflayer-pathfinder').goals;
const pvp = require('mineflayer-pvp').plugin


const bot = mineflayer.createBot({
    host: 'RIYAZISNOOB.aternos.me', // Replace with the server hostname or IP
    port: 25565, // Replace with the server port
    username: 'baebibot' // Replace with your bot's username
});


bot.loadPlugin(pathfinder);

bot.loadPlugin(pvp)
bot.loadPlugin(armorManager); // Load the armor manager plugin

let defaultMove;
let targetPosition = null;

bot.once('spawn', () => {
    defaultMove = new Movements(bot);
    bot.armorManager.equipAll(); // Equip armor when the bot spawns
});

bot.on('chat', function(username, message) {
    if (username === bot.username) return;

    const target = bot.players[username] ? bot.players[username].entity : null;

    if (message === 'come') {
        if (!target) {
            bot.chat('I don\'t see you !');
            return;
        }
        const p = target.position;

        bot.pathfinder.setMovements(defaultMove);
        bot.pathfinder.setGoal(new GoalNear(p.x, p.y, p.z, 1));
    } else if (message === 'stop') {
        bot.pathfinder.setGoal(null);
        bot.chat('Stopped');
    } else if (message === 'goto') {
        bot.chat('Moving to target coordinates...');
        targetPosition = new GoalBlock(-888, 65, 406);
        bot.pathfinder.setMovements(defaultMove);
        bot.pathfinder.setGoal(targetPosition);
    } else if (message === 'sleep') {
        bot.chat('Going to target coordinates before sleeping...');
        targetPosition = new GoalBlock(-903, 65, 400); // Replace with your desired coordinates
        bot.pathfinder.setMovements(defaultMove);
        bot.pathfinder.setGoal(targetPosition);

        setTimeout(() => {
            const time = bot.time.timeOfDay;
            if (time >= 13000 && time <= 23000) { // Nighttime range
                const bed = bot.findBlock({
                    matching: block => bot.isABed(block),
                    maxDistance: 64
                });

                if (bed) {
                    bot.chat('Trying to sleep...');
                    bot.sleep(bed, err => {
                        if (err) {
                            bot.chat('Unable to sleep: ' + err.message);
                        } else {
                            bot.chat('Successfully slept!');
                        }
                    });
                } else {
                    bot.chat('No beds found nearby.');
                }
            } else {
                bot.chat("It's not night. I'll sleep when it's dark.");
            }
        }, 5000); 
    } else if (message === 'setrespawn') {
        const time = bot.time.timeOfDay;
        if (time >= 0 && time <= 1000) { // Daytime range
            bot.chat('Setting respawn point...');
            const bed = bot.findBlock({
                matching: block => bot.isABed(block),
                maxDistance: 64
            });

            if (bed) {
                bot.setControlState('sneak', true);
                bot.on('entitySleep', entity => {
                    if (entity === bot.entity) {
                        bot.chat('Respawn point set to the bed.');
                        bot.setControlState('sneak', false);
                    }
                });
                bot.sleep(bed);
            } else {
                bot.chat('No beds found nearby.');
            }
        } else {
            bot.chat("It's not day. I'll set the respawn point when it's daytime.");
        }}
        else if (message === 'mine x') {
        bot.chat('Mining 10 blocks straight ahead...');
        
        for (let i = 0; i < 10; i++) {
            const blockToMine = bot.blockAt(bot.entity.position.offset(0, 0, i + 1)); // Assuming the blocks are in front of the bot

            if (blockToMine) {
                bot.dig(blockToMine, (err) => {
                    if (err) {
                        bot.chat('Error mining block: ' + err.message);
                    } else {
                        bot.chat('Mined a block.');
                    }
                });
            } else {
                bot.chat('No more blocks to mine.');
                break;
            }
        }
    } else if (message === 'mine y') {
        bot.chat('Mining downward...');
        
        for (let i = 0; i < 10; i++) {
            const blockToMine = bot.blockAt(bot.entity.position.offset(0, -i - 1, 0)); // Assuming the blocks are below the bot

            if (blockToMine) {
                bot.dig(blockToMine, (err) => {
                    if (err) {
                        bot.chat('Error mining block: ' + err.message);
                    } else {
                        bot.chat('Mined a block below.');
                    }
                });
            } else {
                bot.chat('No more blocks to mine below.');
                break;
            }
        }}else if (message === 'equip') {
        bot.chat('Equipping armor...');
        bot.armorManager.equipAll();
    }    
    else if (message === 'fight me') {
        if (!target) {
            bot.chat("I can't see you.");
            return;
        }

        bot.pvp.attack(target);
    }      
        }

);
