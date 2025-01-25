const { SlashCommandBuilder } = require('discord.js');
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
		try{
			let username = interaction.options.getString('username')
			let code = obsf(`$(${username})`)
			await interaction.reply(`\`\`\`\n
				Execute these commands in your world\n
				\\db set dev ${code}\n
				\/tag @s add dev
				\`\`\``,
				{ ephemeral: true }
			);
		}catch(e){
			console.error(e)
			await interaction.reply('An error occurred while processing your request.', { ephemeral: true });
		}
	},
};