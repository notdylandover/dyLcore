const { messagePollVoteAdd } = require('../../utils/logging');

module.exports = {
    name: 'messagePollVoteAdd',
    async execute(pollAnswer, userId) {
        const pollQuestion = pollAnswer.poll.question.text;
        const pollText = pollAnswer.text;
        const voteCount = pollAnswer.voteCount;

        messagePollVoteAdd(`${userId.cyan} added their vote ${pollText.cyan} to the poll ${pollQuestion.cyan}, now with ${String(voteCount).cyan} votes`);
    }
};