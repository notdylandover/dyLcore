const colors = require('colors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

function dbOutput(t, m) {
    const date = new Date();
    const formattedDate = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}-${date.getFullYear()}`;
    const time = date.toLocaleTimeString();
    const type = colors.stripColors(t);
    const content = colors.stripColors(m);

    const dataFolderPath = path.join(__dirname, '..', 'data');
    const dbPath = path.join(dataFolderPath, 'logs.db');

    require('fs').promises.mkdir(dataFolderPath, { recursive: true });

    const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('Error opening SQLite database:', err);
            return;
        }

        db.serialize(() => {
            const tableName = formattedDate;
            db.run(`CREATE TABLE IF NOT EXISTS "${tableName}" (time TEXT, type TEXT, content TEXT)`);
            const stmt = db.prepare(`INSERT INTO "${tableName}" (time, type, content) VALUES (?,?,?)`);
            stmt.run(time, type, content);
            stmt.finalize();
        });

        db.close((err) => {
            if (err) {
                console.error('Error closing SQLite database:', err);
            }
        });
    });
}

function info(m, c) {
    const time = new Date().toLocaleTimeString();
    console.log(`${time.grey}\t${c(m)}`);
}

module.exports.ServerLog = function(m) {
    const time = new Date().toLocaleTimeString();
    console.log(`${time.grey}\t${'[SERVER]'.cyan} ${m.grey}`);
}

module.exports.ServerError = function(m) {
    const time = new Date().toLocaleTimeString();
    console.log(`${time.red}\t${'[SERVER]'.red} ${m.red}`);
}

module.exports.ServerValid = function(m) {
    const time = new Date().toLocaleTimeString();
    console.log(`${time.grey}\t${'[SERVER]'.green} ${m.green}`);
}

module.exports.Live = function(m) {
    const time = new Date().toLocaleTimeString();
    console.log(`${time.grey}\t${m.magenta}`);
};

module.exports.Feedback = function(a, m) {
    const time = new Date().toLocaleTimeString();
    console.log(`${time.grey}\t${a.cyan} sent feedback: ${(' ' + m + ' ').black.bgGreen}`);
    dbOutput('Feedback', a + ' - ' + m);
};

module.exports.attachmentDownload = function(m) {
    const time = new Date().toLocaleTimeString();
    console.log(`${time.grey}\t${m.green}`);
    dbOutput('Attachment Download', m);
};

module.exports.DiscordJS = function(m) {
    console.log(m.cyan);
};

module.exports.Info = function(m) {
    const time = new Date().toLocaleTimeString();
    console.log(`${time.grey}\t${m.grey}`);
    dbOutput('Info', m);
};

module.exports.Debug = function(m) {
    console.log(m.grey);
};

module.exports.Valid = function(m) {
    console.log(m.green);
};

module.exports.Invalid = function(m) {
    console.log(m.red);
};

module.exports.Done = function(m) {
    const time = new Date().toLocaleTimeString();
    console.log(`${time.grey}\t${m.green}`);
};

module.exports.Error = function(m) {
    const time = new Date().toLocaleTimeString();
    console.log(`${time.red}\t${m.red}`);
    dbOutput('Error', m);
};

module.exports.CommandError = function(commandName, stack) {
    const time = new Date().toLocaleTimeString();
    console.log(`${time.red}\t${`Error executing ${commandName}: ${stack}`.red}`);
    dbOutput('Command Error', stack);
};

module.exports.Warn = function(m) {
    const time = new Date().toLocaleTimeString();
    console.log(`${time.yellow}\t${m.yellow}`);
    dbOutput('Warn', m);
};

module.exports.Presence = function(m) {
    const time = new Date().toLocaleTimeString();
    console.log(`${time.grey}\t${m.grey}`);
};

// Discord Events

module.exports.applicationCommandPermissionsUpdate = function(m) {
    info(m, colors.yellow);
    dbOutput('Application Command Permissions Updated', m);
};

module.exports.autoModerationActionExecution = function(m) {
    info(m, colors.magenta);
    dbOutput('AutoMod', m);
};

module.exports.autoModerationRuleCreate = function(m) {
    info(m, colors.green);
    dbOutput('AutoMod Rule Created', m);
};

module.exports.autoModerationRuleDelete = function(m) {
    info(m, colors.red);
    dbOutput('AutoMod Rule Deleted', m);
};

module.exports.autoModerationRuleUpdate = function(m) {
    info(m, colors.yellow);
    dbOutput('AutoMod Rule Updated', m);
};

module.exports.cacheSweep = function(m) {
    info(m, colors.green);
};

module.exports.channelCreate = function(m) {
    info(m, colors.green);
    dbOutput('Channel Created', m);
};

module.exports.channelDelete = function(m) {
    info(m, colors.red);
    dbOutput('Channel Deleted', m);
};

module.exports.channelPinsUpdate = function(m) {
    info(m, colors.yellow);
    dbOutput('Channel Pins Updated', m);
};

module.exports.channelUpdate = function(m) {
    info(m, colors.yellow);
    dbOutput('Channel Updated', m);
};

module.exports.debug = function(m) {
    console.log(`${m.grey}`);
};

module.exports.emojiCreate = function(m) {
    info(m, colors.green);
    dbOutput('Emoji Created', m);
};

module.exports.emojiDelete = function(m) {
    info(m, colors.red);
    dbOutput('Emoji Deleted', m);
};

module.exports.emojiUpdate = function(m) {
    info(m, colors.yellow);
    dbOutput('Emoji Updated', m);
};

module.exports.guildAuditLogEntryCreate = function(m) {
    info(m, colors.grey);
};

module.exports.guildAvailable = function(m) {
    info(m, colors.green);
};

module.exports.guildBanAdd = function(m) {
    info(m, colors.red);
    dbOutput('Guild Ban Added', m);
};

module.exports.guildBanRemove = function(m) {
    info(m, colors.green);
    dbOutput('Guild Ban Removed', m);
};

module.exports.guildCreate = function(m) {
    info(m, colors.green);
    dbOutput('Guild Created', m);
};

module.exports.guildDelete = function(m) {
    info(m, colors.red);
    dbOutput('Guild Deleted', m);
};

module.exports.guildIntegrationsUpdate = function(m) {
    info(m, colors.yellow);
    dbOutput('Guild Integrations Updated', m);
};

module.exports.guildMemberAdd = function(m) {
    info(m, colors.green);
    dbOutput('Member Joined', m);
};

module.exports.guildMemberAvailable = function(m) {
    info(m, colors.green);
    dbOutput('Member Available', m);
};

module.exports.guildMemberRemove = function(m) {
    info(m, colors.red);
    dbOutput('Member Removed', m);
};

module.exports.guildMembersChunk = function(m) {
    info(m, colors.grey);
};

module.exports.guildMemberUpdate = function(m) {
    info(m, colors.yellow);
    dbOutput('Member Updated', m);
};

module.exports.guildScheduledEventCreate = function(m) {
    info(m, colors.green);
    dbOutput('Guild Event Created', m);
};

module.exports.guildScheduledEventDelete = function(m) {
    info(m, colors.red);
    dbOutput('Guild Event Deleted', m);
};

module.exports.guildScheduledEventUpdate = function(m) {
    info(m, colors.yellow);
    dbOutput('Guild Event Updated', m);
};

module.exports.guildScheduledEventUserAdd = function(m) {
    info(m, colors.green);
    dbOutput('Guild Event User Added', m);
};

module.exports.guildScheduledEventUserRemove = function(m) {
    info(m, colors.red);
    dbOutput('Guild Event User Removed', m);
};

module.exports.guildUnavailable = function(m) {
    info(m, colors.red);
    dbOutput('Guild Unavailable', m);
};

module.exports.guildUpdate = function(m) {
    info(m, colors.yellow);
    dbOutput('Guild Updated', m);
};

module.exports.interactionCreate = function(m) {
    info(m, colors.magenta);
    dbOutput('Interaction', m);
};

module.exports.inviteCreate = function(m) {
    info(m, colors.green);
    dbOutput('Guild Invite Created', m);
};

module.exports.inviteDelete = function(m) {
    info(m, colors.red);
    dbOutput('Guild Invite Deleted', m);
};

module.exports.messageCreate = function(m) {
    info(m, colors.blue);
    dbOutput('Message Created', m);
};

module.exports.messageDelete = function(m) {
    info(m, colors.red);
    dbOutput('Message Deleted', m);
};

module.exports.messageDeleteBulk = function(m) {
    info(m, colors.red);
    dbOutput('Multiple Messages Deleted', m);
};

module.exports.messagePollVoteAdd = function(m) {
    info(m, colors.green);
    dbOutput('Poll Vote Added', m);
};

module.exports.messagePollVoteRemove = function(m) {
    info(m, colors.red);
    dbOutput('Poll Vote Removed', m);
};

module.exports.messageReactionAdd = function(m) {
    info(m, colors.green);
    dbOutput('Reaction Added', m);
};

module.exports.messageReactionRemove = function(m) {
    info(m, colors.red);
    dbOutput('Reaction Removed', m);
};

module.exports.messageReactionRemoveAll = function(m) {
    info(m, colors.red);
    dbOutput('All Reactions Removed', m);
};

module.exports.messageReactionRemoveEmoji = function(m) {
    info(m, colors.red);
    dbOutput('Emoji Reaction Removed', m);
};

module.exports.messageUpdate = function(m) {
    info(m, colors.yellow);
    dbOutput('Message Updated', m);
};

module.exports.presenceUpdate = function(m) {
    info(m, colors.grey);
};

module.exports.ready = function(m) {
    info(m, colors.green);
    dbOutput('Ready', m);
};

module.exports.roleCreate = function(m) {
    info(m, colors.green);
    dbOutput('Role Created', m);
};

module.exports.roleDelete = function(m) {
    info(m, colors.red);
    dbOutput('Role Deleted', m);
};

module.exports.roleUpdate = function(m) {
    info(m, colors.yellow);
    dbOutput('Role Updated', m);
};

module.exports.shardDisconnect = function(m) {
    info(m, colors.red);
};

module.exports.shardError = function(m) {
    info(m, colors.red);
    dbOutput('Shard Error', m);
};

module.exports.shardReady = function(m) {
    info(m, colors.green);
};

module.exports.shardReconnecting = function(m) {
    info(m, colors.yellow);
};

module.exports.shardResume = function(m) {
    info(m, colors.green);
};

module.exports.stageInstanceCreate = function(m) {
    info(m, colors.green);
    dbOutput('Stage Instance Created', m);
};

module.exports.stageInstanceDelete = function(m) {
    info(m, colors.red);
    dbOutput('Stage Instance Deleted', m);
};

module.exports.stageInstanceUpdate = function(m) {
    info(m, colors.yellow);
    dbOutput('Stage Instance Updated', m);
};

module.exports.stickerCreate = function(m) {
    info(m, colors.green);
    dbOutput('Sticker Created', m);
};

module.exports.stickerDelete = function(m) {
    info(m, colors.red);
    dbOutput('Sticker Deleted', m);
};

module.exports.stickerUpdate = function(m) {
    info(m, colors.yellow);
    dbOutput('Sticker Updated', m);
};

module.exports.threadCreate = function(m) {
    info(m, colors.green);
    dbOutput('Thread Created', m);
};

module.exports.threadDelete = function(m) {
    info(m, colors.red);
    dbOutput('Thread Deleted', m);
};

module.exports.threadListSync = function(m) {
    info(m, colors.green);
    dbOutput('Thread List Synced', m);
};

module.exports.threadMembersUpdate = function(m) {
    info(m, colors.yellow);
    dbOutput('Thread Members Updated', m);
};

module.exports.threadMemberUpdate = function(m) {
    info(m, colors.yellow);
    dbOutput('Thread Member Updated', m);
};

module.exports.typingStart = function(m) {
    info(m, colors.grey);
};

module.exports.userUpdate = function(m) {
    info(m, colors.green);
    dbOutput('User Updated', m);
};

module.exports.voiceStateUpdate = function(m) {
    info(m, colors.blue);
    dbOutput('Voice State Updated', m);
};

module.exports.threadUpdate = function(m) {
    info(m, colors.yellow);
    dbOutput('Thread Updated', m);
};

module.exports.webhooksUpdate = function(m) {
    info(m, colors.yellow);
    dbOutput('Webhooks Updated', m);
};