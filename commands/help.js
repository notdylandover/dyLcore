const { PermissionFlagsBits, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { METADATA } = require('../utils/metadata');
const { ICONS, LINKS } = require('../utils/constants');
const { DetailedHelpEmbed, ErrorEmbed, HelpEmbed } = require('../utils/embeds');

function renderCommandList(commands, descriptions) {
    let maxLength = Math.max(...(commands.map(el => el.length))) + 3;
    let render = [];
    let i = 0;

    for (const c of commands) {
        let pad = maxLength - c.length;
        let desc = descriptions[i];
        if (desc.includes('\n')) desc = desc.split('\n')[0];
        if (desc.length >= 41) desc = desc.slice(0, 40) + '...';

        render.push(`\` ${c}${' '.repeat(pad)}\` ${desc}`);
        i++;
    }

    return render.join('\n');
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Get a list of commands')
        .addStringOption(option => option
            .setName('command')
            .setDescription('The specific command')
            .setRequired(false)
        )
        .setDMPermission(true)
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),
    async execute(interaction) {
        await interaction.deferReply();

        try {
            const commandName = interaction.options.getString('command');

            if (commandName) {
                const commandMeta = METADATA[commandName];
                if (!commandMeta) {
                    throw new Error(`Command "${commandName}" not found.`);
                }

                const commandTitle = `${ICONS[commandMeta.category] || '❓'} \` ${commandName} \``;
                const commandDescription = commandMeta.longDescription || commandMeta.shortDescription;
                const commandUsage = commandMeta.usage;
                const commandExample = commandMeta.example;
                const description = `**Description:**\n\` ${commandDescription} \`\n\n**Usage:**\n\`\`\`${commandUsage}\`\`\`\n**Example:**\n\`\`\`${commandExample}\`\`\``;
                const detailedHelpMessage = `${ICONS.discord} Need more help? Join the support server: ${LINKS.server}`;

                const helpEmbed = DetailedHelpEmbed(commandTitle, description, detailedHelpMessage);
                return await interaction.editReply({ embeds: [helpEmbed] });
            }

            const categories = {};
            for (const [commandName, commandMeta] of Object.entries(METADATA)) {
                const { category } = commandMeta;
                if (!categories[category]) {
                    categories[category] = [];
                }
                categories[category].push({ name: commandName, description: commandMeta.shortDescription });
            }

            const categoryKeys = Object.keys(categories);
            let currentPage = 0;

            const generateEmbed = (page) => {
                const category = categoryKeys[page];
                const commands = categories[category];
                const commandNames = commands.map(cmd => cmd.name);
                const commandDescriptions = commands.map(cmd => cmd.description);

                const title = `${ICONS[category] || '❓'} \` ${category.charAt(0).toUpperCase() + category.slice(1)} Commands \``;
                const description = renderCommandList(commandNames, commandDescriptions);
                const helpMessage = `${ICONS.question} Use \` /help {command} \` for specific help about a command.\n${ICONS.discord} Need more help? Join the support server: ${LINKS.server}`;

                return HelpEmbed(title, description, helpMessage);
            };

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('previouspage')
                        .setEmoji(ICONS.left)
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(currentPage === 0),
                    new ButtonBuilder()
                        .setCustomId('nextpage')
                        .setEmoji(ICONS.right)
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(currentPage === categoryKeys.length - 1)
                );

            const message = await interaction.editReply({ embeds: [generateEmbed(currentPage)], components: [row], fetchReply: true });

            const filter = i => i.customId === 'previouspage' || i.customId === 'nextpage';
            const collector = message.createMessageComponentCollector({ filter, time: 5 * 60000 });

            collector.on('collect', async i => {
                if (i.customId === 'previouspage') {
                    currentPage--;
                } else if (i.customId === 'nextpage') {
                    currentPage++;
                }

                await i.update({ embeds: [generateEmbed(currentPage)], components: [new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('previouspage')
                            .setEmoji(ICONS.left)
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(currentPage === 0),
                        new ButtonBuilder()
                            .setCustomId('nextpage')
                            .setEmoji(ICONS.right)
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(currentPage === categoryKeys.length - 1)
                    )] });
            });

            collector.on('end', async collected => {
                try {
                    await message.edit({ components: [] });
                } catch (error) {
                    Error(`Failed to edit message: ${error.message}`);
                }
            });
        } catch(error) {
            const errorEmbed = ErrorEmbed(`Error executing ${interaction.commandName}`, error.message);
            Error(`Error executing ${interaction.commandName}: ${error.message}`);

            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    }
};