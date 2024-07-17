const { guildMemberAdd, Debug, Error } = require('../../utils/logging');
const { ICONS } = require('../../utils/constants');

module.exports = {
    name: 'guildMemberAdd',
    execute(member) {
        try {
            const client = member.client;
            const guildName = member.guild.name;
            const pending = member.pending ? '(Pending...)'.yellow : '(Approved)';
            const userFlags = member.user.flags;

            userFlags.toArray().forEach(flag => {
                Debug(flag)
            });

            guildMemberAdd(`${guildName.cyan} - ${member.user.tag.cyan} Joined ${pending}`);

            const warningFlags = {
                'Quarantined': ICONS.exclamation,
                'RestrictedCollaborator': ICONS.exclamation,
                'Spammer': ICONS.exclamation
            };

            const messageListener = async (message) => {
                if (message.author.id === member.user.id) {
                    let emoji;
                    if (userFlags.length > 0) {
                        const userFlag = userFlags.find(flag => warningFlags[flag]);
                        emoji = userFlag ? warningFlags[userFlag] : ICONS.trusted;
                    } else {
                        emoji = ICONS.trusted;
                    }
                    await message.react(emoji);

                    client.removeListener('messageCreate', messageListener);
                }
            };

            client.on('messageCreate', messageListener);
            
        } catch (error) {
            Error(`Error executing guildMemberAdd event: ${error.message}`);
        }
    }
};