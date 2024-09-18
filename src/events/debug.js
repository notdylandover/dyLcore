const { DebugNoDB } = require('../../utils/logging');

module.exports = {
    name: 'debug',
    execute(info) {
        const formattedInfo = reformatDebug(info);
        if (formattedInfo) {
            DebugNoDB(formattedInfo);
        }
    }
};

function reformatDebug(info) {
    if (info.includes('Fetched Gateway Information')) {
        return null;
    }

    if (info.includes('Session Limit Information')) {
        return null;
    }

    if (info.includes('Connecting to')) {
        return null;
    }

    if (info.includes('Waiting for event hello for')) {
        return null;
    }

    if (info.includes('Preparing first heartbeat of the connection with a jitter of')) {
        return null;
    }

    if (info.includes('Waiting for identify throttle')) {
        return null;
    }

    if (info.includes('Identifying')) {
        return null;
    }

    if (info.includes('Waiting for event ready')) {
        return formatWaitMessage(info);
    }

    if (info.includes('Shard received all its guilds.')) {
        return formatGuildMessage();
    }

    if (info.includes('First heartbeat sent')) {
        return formatHeartbeatMessage(info);
    }

    if (info.includes('Heartbeat acknowledged')) {
        return formatLatencyMessage(info);
    }

    if (info.includes('Manager was destroyed')) {
        return formatManagerDestroyMessage();
    }

    if (info.includes('Destroying shard')) {
        return formatShardDestroyMessage();
    }

    return info;
}

function formatWaitMessage(info) {
    const waitMatch = info.match(/for (\d+)ms/);
    if (waitMatch) {
        const time = waitMatch[1];
        return `Waiting ${time / 1000}s`;
    }
    return info;
}

function formatGuildMessage() {
    return `Marking shard as ready`;
}

function formatHeartbeatMessage(info) {
    const timeMatch = info.match(/every (\d+)ms/);
    if (timeMatch) {
        const time = timeMatch[1];
        return `Sending ping every ${time}ms`;
    }
    return info;
}

function formatLatencyMessage(info) {
    const latencyMatch = info.match(/latency of (\d+)ms/);
    if (latencyMatch) {
        const ping = latencyMatch[1];
        return `${(' ◢ ' + ping + 'ms ').bgBlue.white} `;
    }
    return info;
}

function formatManagerDestroyMessage() {
    return `Manager was destroyed`;
}

function formatShardDestroyMessage() {
    return `Shard was destroyed`;
}