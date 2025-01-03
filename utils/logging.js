const colors = require('colors');

function debug(m) {
    const color = colors.grey;
    console.info(`  \t\t\t${color(m)}`);
}

function valid(m) {
    const color = colors.green;
    const time = new Date().toLocaleTimeString();
    console.info(`${color('\u2713')}\t${color(time)}\t${color(m)}`);
}

function invalid(m) {
    const color = colors.red;
    const time = new Date().toLocaleTimeString();
    console.info(`❌\t${color(time)}\t${color(m)}`);
}

function log(m) {
    const color = colors.grey;
    const time = new Date().toLocaleTimeString();
    console.info(`  \t${color(time)}\t${color(m)}`);
}

function warn(m) {
    const color = colors.yellow;
    const time = new Date().toLocaleTimeString();
    console.warn(`⚠️\t${color(time)}\t${color(m)}`);
}

function error(m) {
    const color = colors.red;
    const time = new Date().toLocaleTimeString();
    console.error(`❌\t${color(time)}\t${color(m)}`);
}

function commandError(name, stack) {
    const color = colors.red;
    const time = new Date().toLocaleTimeString();
    console.error(`❌\t${color(time)}\t${color(`Error executing ${name}:\n${stack}`)}`);
}

function done(m) {
    const color = colors.green;
    const time = new Date().toLocaleTimeString();
    console.info(`${color('\u2713')}\t${color(time)}\t${color(m)}`);
}

function red(m) {
    const color = colors.red;
    const time = new Date().toLocaleTimeString();
    console.info(`  \t${time.grey}\t${color(m)}`);
}

function blue(m) {
    const color = colors.blue;
    const time = new Date().toLocaleTimeString();
    console.info(`  \t${time.grey}\t${color(m)}`);
}

function magenta(m) {
    const color = colors.magenta;
    const time = new Date().toLocaleTimeString();
    console.info(`  \t${time.grey}\t${color(m)}`);
}

function green(m) {
    const color = colors.green;
    const time = new Date().toLocaleTimeString();
    console.info(`  \t${time.grey}\t${color(m)}`);
}

function yellow(m) {
    const color = colors.yellow;
    const time = new Date().toLocaleTimeString();
    console.info(`  \t${time.grey}\t${color(m)}`);
}

function version(m) {
    const color = colors.cyan;
    const time = new Date().toLocaleTimeString();
    console.info(`  \t${time.grey}\t${color(m)}`);
}

function removed(m) {
    const color = colors.red;
    const time = new Date().toLocaleTimeString();
    console.info(`${color('- ')}\t${color(time)}\t${color(m)}`);
}

function added(m) {
    const color = colors.green;
    const time = new Date().toLocaleTimeString();
    console.info(`${color('+ ')}\t${color(time)}\t${color(m)}`);
}

// NEW Custom

module.exports.CommandRegisterDone = function (m) {
    done(m);
};

module.exports.CommandRegisterSuccess = function (m) {
    done(m);
};

module.exports.CommandRegisterFailed = function (m) {
    error(m);
};

// old Custom

module.exports.Google = function (m) {
    magenta(m);
}

module.exports.attachmentDownload = function (m) {
    done(m);
};

module.exports.Version = function (m) {
    version(m);
};

module.exports.Info = function (m) {
    log(m);
};

module.exports.Debug = function (m) {
    debug(m);
};

module.exports.Valid = function (m) {
    valid(m);
};

module.exports.Invalid = function (m) {
    invalid(m);
};

module.exports.Done = function (m) {
    done(m);
};

module.exports.Error = function (m) {
    error(m);
};

module.exports.CommandError = function (commandName, stack) {
    commandError(commandName, stack);
};

module.exports.Warn = function (m) {
    warn(m);
};

module.exports.WarnNoDB = function (m) {
    warn(m);
};

module.exports.Presence = function (m) {
    log(m);
};

// Discord Events

module.exports.applicationCommandPermissionsUpdate = function (m) {
    warn(m);
};

module.exports.autoModerationActionExecution = function (m) {
    magenta(m);
};

module.exports.autoModerationRuleCreate = function (m) {
    done(m);
};

module.exports.autoModerationRuleDelete = function (m) {
    red(m);
};

module.exports.autoModerationRuleUpdate = function (m) {
    warn(m);
};

module.exports.cacheSweep = function (m) {
    done(m);
};

module.exports.channelCreate = function (m) {
    done(m);
};

module.exports.channelDelete = function (m) {
    red(m);
};

module.exports.channelPinsUpdate = function (m) {
    warn(m);
};

module.exports.channelUpdate = function (m) {
    warn(m);
};

module.exports.debug = function (m) {
    debug(m);
};

module.exports.emojiCreate = function (m) {
    done(m);
};

module.exports.emojiDelete = function (m) {
    red(m);
};

module.exports.emojiUpdate = function (m) {
    warn(m);
};

module.exports.entitlementCreate = function (m) {
    done(m);
};

module.exports.entitlementDelete = function (m) {
    red(m);
};

module.exports.entitlementUpdate = function (m) {
    warn(m);
};

module.exports.guildAuditLogEntryCreate = function (m) {
    log(m);
};

module.exports.guildAvailable = function (m) {
    valid(m);
};

module.exports.guildBanAdd = function (m) {
    red(m);
};

module.exports.guildBanRemove = function (m) {
    done(m);
};

module.exports.guildCreate = function (m) {
    done(m);
};

module.exports.guildDelete = function (m) {
    red(m);
};

module.exports.guildIntegrationsUpdate = function (m) {
    warn(m);
};

module.exports.guildMemberAdd = function (m) {
    done(m);
};

module.exports.guildMemberAvailable = function (m) {
    done(m);
};

module.exports.guildMemberRemove = function (m) {
    red(m);
};

module.exports.guildMembersChunk = function (m) {
    log(m);
};

module.exports.guildMemberUpdate = function (m) {
    warn(m);
};

module.exports.guildScheduledEventCreate = function (m) {
    done(m);
};

module.exports.guildScheduledEventDelete = function (m) {
    red(m);
};

module.exports.guildScheduledEventUpdate = function (m) {
    warn(m);
};

module.exports.guildScheduledEventUserAdd = function (m) {
    done(m);
};

module.exports.guildScheduledEventUserRemove = function (m) {
    red(m);
};

module.exports.guildUnavailable = function (m) {
    invalid(m);
};

module.exports.guildUpdate = function (m) {
    warn(m);
};

module.exports.interactionCreate = function (m) {
    magenta(m);
};

module.exports.inviteCreate = function (m) {
    done(m);
};

module.exports.inviteDelete = function (m) {
    red(m);
};

module.exports.messageCreate = function (m) {
    blue(m);
};

module.exports.messageDelete = function (m) {
    removed(m);
};

module.exports.messageDeleteBulk = function (m) {
    removed(m);
};

module.exports.messagePollVoteAdd = function (m) {
    added(m);
};

module.exports.messagePollVoteRemove = function (m) {
    removed(m);
};

module.exports.messageReactionAdd = function (m) {
    added(m);
};

module.exports.messageReactionRemove = function (m) {
    removed(m);
};

module.exports.messageReactionRemoveAll = function (m) {
    removed(m);
};

module.exports.messageReactionRemoveEmoji = function (m) {
    removed(m);
};

module.exports.messageUpdate = function (m) {
    yellow(m);
};

module.exports.presenceUpdate = function (m) {
    log(m);
};

module.exports.ready = function (m) {
    done(m);
};

module.exports.roleCreate = function (m) {
    done(m);
};

module.exports.roleDelete = function (m) {
    red(m);
};

module.exports.roleUpdate = function (m) {
    warn(m);
};

module.exports.shardDisconnect = function (m) {
    red(m);
};

module.exports.shardError = function (m) {
    error(m);
};

module.exports.shardReady = function (m) {
    done(m);
};

module.exports.shardReconnecting = function (m) {
    warn(m);
};

module.exports.shardResume = function (m) {
    done(m);
};

module.exports.stageInstanceCreate = function (m) {
    done(m);
};

module.exports.stageInstanceDelete = function (m) {
    red(m);
};

module.exports.stageInstanceUpdate = function (m) {
    warn(m);
};

module.exports.stickerCreate = function (m) {
    done(m);
};

module.exports.stickerDelete = function (m) {
    red(m);
};

module.exports.stickerUpdate = function (m) {
    warn(m);
};

module.exports.threadCreate = function (m) {
    done(m);
};

module.exports.threadDelete = function (m) {
    red(m);
};

module.exports.threadListSync = function (m) {
    done(m);
};

module.exports.threadMembersUpdate = function (m) {
    warn(m);
};

module.exports.threadMemberUpdate = function (m) {
    warn(m);
};

module.exports.typingStart = function (m) {
    log(m);
};

module.exports.userUpdate = function (m) {
    done(m);
};

module.exports.voiceStateUpdate = function (m) {
    blue(m);
};

module.exports.threadUpdate = function (m) {
    warn(m);
};

module.exports.webhooksUpdate = function (m) {
    warn(m);
};