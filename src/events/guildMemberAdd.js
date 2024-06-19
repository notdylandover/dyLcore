const { guildMemberAdd, Debug } = require('../../utils/logging');

module.exports = {
    name: 'guildMemberAdd',
    execute(member) {
        const guildName = member.guild.name;
        const pending = member.pending ? '(Pending...)'.yellow : '(Approved)';
        const userFlags = member.user.flags;

        userFlags.toArray().forEach(flag => {
            Debug(flag)
        });

        guildMemberAdd(`${guildName.cyan} - ${member.user.tag.cyan} Joined ${pending}`);
    }
};