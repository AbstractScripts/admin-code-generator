const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { obsf } = require('../../utils/hash.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('codegen')
		.setDescription('Generates admin code')
		.addStringOption(option => 
			option
			.setName('username')
			.setDescription('The username to generate code for')
			.setRequired(true)
		),
		
	async execute(interaction) {
		try {
			const username = interaction.options.getString('username');
			const code = obsf(`$(${username})`);

			const embed = new EmbedBuilder()
				.setColor(0x57F287)
				.setTitle('Generated Admin Code')
				.setDescription(`\`\`\`\nExecute these commands in your world\n\\db set dev ${code}\n/tag @s add dev\n\`\`\``);

			await interaction.reply({ embeds: [embed], flags: 64 });
			
		} catch (e) {
			console.error(e);

			const errorEmbed = new EmbedBuilder()
				.setColor(0x57F287)
				.setTitle('Error')
				.setDescription('An error occurred while processing your request.');

			if (!interaction.replied && !interaction.deferred) {
				await interaction.reply({ embeds: [errorEmbed], flags: 64 });
			}
		}
	},
};
