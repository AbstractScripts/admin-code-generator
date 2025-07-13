const { Client, Events, GatewayIntentBits, Collection } = require('discord.js');
const { REST, Routes } = require('discord.js');
const { clientId, guildIds, token } = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

const rest = new REST().setToken(token);

async function registerCommands(guildId, commands) {
    let retries = 3;
    while (retries > 0) {
        try {
            const data = await rest.put(
                Routes.applicationGuildCommands(clientId, guildId),
                { body: commands.map(command => command.data.toJSON()) }
            );
            console.log(`[Guild: ${guildId}] Successfully reloaded ${data.length} application (/) commands.`);
            return;
        } catch (error) {
            console.error(`[Guild: ${guildId}] Retry ${4 - retries}/3 failed:`, error);
            retries--;
            if (retries === 0) throw error;
            await new Promise(resolve => setTimeout(resolve, 2000)); // Attesa di 2 secondi prima del retry
        }
    }
}

(async () => {
    try {
        console.log('Commands to register:', commands.map(command => command.data.toJSON()));
        for (const guildId of guildIds) {
            console.log(`[Guild: ${guildId}] Started refreshing ${commands.size} application (/) commands.`);
            await registerCommands(guildId, commands);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Ritardo di 1 secondo tra guild
        }
    } catch (error) {
        console.error('Error registering commands:', error);
    }
})();

client.addListener(Events.InteractionCreate, async interaction => {
    if (!interaction.isCommand()) return;
    console.log(`Processing interaction: ${interaction.id}, command: ${interaction.commandName}`);
    const command = commands.get(interaction.commandName);
    if (!command) {
        console.log(`Command ${interaction.commandName} not found`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(`Error executing command ${interaction.commandName} (ID: ${interaction.id}):`, error);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
});

client.login(token);
