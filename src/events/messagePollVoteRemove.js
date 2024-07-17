const { messagePollVoteRemove, Error } = require('../../utils/logging');

module.exports = {
    name: 'messagePollVoteRemove',
    async execute(pollAnswer, userId) {
        try {
            const pollQuestion = pollAnswer.poll.question.text;
            const pollText = pollAnswer.text;
            const voteCount = pollAnswer.voteCount;

            messagePollVoteRemove(`${userId.cyan} removed their vote ${pollText.cyan} to the poll ${String(pollQuestion).cyan}, now with ${String(voteCount).cyan} votes`);
            // Question and vote count output undefined for some reason. Also I hate that userId is the only option for a user.
        } catch (error) {
            Error(`Error executing ${module.exports.name}: ${error.message}`);
        }
    }
};