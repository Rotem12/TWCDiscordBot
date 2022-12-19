const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('who')
		.setDescription('List of players online.'),
	async execute(interaction, players) {
		await interaction.reply({ content: players, ephemeral: true });
	},
};