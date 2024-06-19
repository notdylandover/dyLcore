module.exports.METADATA = Object.freeze({
    coinflip: {
        description: 'Flip a coin to get heads or tails',
        shortDescription: 'Flip a coin',
        category: 'fun',
        usage: '/coinflip',
        example: '/coinflip'
    },
    download: {
        description: 'Download a link as an MP3 or MP4 file',
        shortDescription: 'Download a link',
        category: 'util',
        usage: '/download {URL} {MP3|MP4}',
        example: '/download link:https://www.youtube.com/watch?v=dQw4w9WgXcQ format:MP3'
    },
    help: {
        description: 'Get a list of commands and their descriptions',
        shortDescription: 'Get a list of commands',
        category: 'util',
        usage: '/help',
        example: '/help'
    },
    me: {
        description: 'Send a message as dyLcore',
        shortDescription: 'Send a message as dyLcore',
        category: 'admin',
        usage: '/me {message}',
        example: '/me message:Hello World!'
    },
    ping: {
        description: 'Get the latency of the Websocket manager and the REST API',
        shortDescription: 'Get the latency of dyLcore',
        category: 'util',
        usage: '/ping',
        example: '/ping'
    },
    qr: {
        description: 'Convert a URL to a QR code',
        shortDescription: 'Convert a URL to a QR code',
        category: 'util',
        usage: '/qr {link} {background*} {foreground*}',
        example: '/qr link:https://google.com background:transparent foreground:#888'
    },
    restart: {
        description: 'Restart dyLcore',
        shortDescription: 'Restart dyLcore',
        category: 'admin',
        usage: '/restart',
        example: '/restart'
    },
    ss: {
        description: 'Take a screenshot of a webpage',
        shortDescription: 'Take a screenshot',
        category: 'util',
        usage: '/ss {URL}',
        example: '/ss url:https://google.com'
    },
    stats: {
        description: 'Get specific information about dyLcore',
        shortDescription: 'Get information about dyLcore',
        category: 'util',
        usage: '/stats',
        example: '/stats'
    },
    update: {
        description: 'Get the latest update notes of dyLcore',
        shortDescription: 'Get update notes',
        category: 'util',
        usage: '/update',
        example: '/update'
    },
    user: {
        description: 'Get specific information about a user',
        shortDescription: 'Get user info',
        category: 'util',
        usage: '/update',
        example: '/update'
    },
    weather: {
        description: 'Get the weather for a specific zip code (US Only)',
        shortDescription: 'Get the weather',
        category: 'util',
        usage: '/weather {ZIP}',
        example: '/weather zip:90210'
    },
    privacypolicy: {
        description: 'Get the privacy policy',
        shortDescription: 'Get the privacy policy',
        category: 'util',
        usage: '/privacypolicy',
        example: '/privacypolicy'
    },

    MakeItAQuote: {
        description: 'Convert a message to a quote',
        shortDescription: 'Convert a message to a quote',
        category: 'user',
        usage: 'Make It A Quote',
        example: 'Make It A Quote'
    },
    ViewMessageJSON: {
        description: 'Get all of the information about a message',
        shortDescription: 'Get message data',
        category: 'message',
        usage: 'View Message JSON',
        example: 'View Message JSON'
    },
    ViewUserAvatar: {
        description: 'Get a user\'s avatar',
        shortDescription: 'Get a user\'s avatar',
        category: 'user',
        usage: 'View User Avatar',
        example: 'View User Avatar'
    },
    ViewUserBanner: {
        description: 'Get a user\'s banner',
        shortDescription: 'Get a user\'s banner',
        category: 'user',
        usage: 'View User Banner',
        example: 'View User Banner'
    },
    ViewUserDetails: {
        description: 'Get specific information about a user',
        shortDescription: 'Get info about a user',
        category: 'user',
        usage: 'View User Details',
        example: 'View User Details'
    },
    ViewUserJSON: {
        description: 'Get all of the information about a user',
        shortDescription: 'Get all user data',
        category: 'user',
        usage: 'View User JSON',
        example: 'View User JSON'
    },
});