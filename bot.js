const { Client, Events, GatewayIntentBits, Collection } = require('discord.js');
const { token, host, port, server_password } = require('./config.json');

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
	],
});

var messageQueue = [];

client.on('ready', () => 
{
	console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', msg => 
{
	if(msg.author.bot) return;
	messageQueue.push(`{"name": "${msg.author.username}", "content": "${msg.content}"}`);

	console.log("The current queue is: ", messageQueue);
});

client.login(token);

const http = require('http');
const server = http.createServer((req, res) => 
{
  respondToRequest(req, res);
});

server.listen(port, host, () => 
{
  console.log(`Server running at http://${host}:${port}/`);
});

function respondToRequest (request, response)
{
	let res = "";
	if ("content-type" in request["headers"] && request["headers"]["content-type"] == "text/plain" && request.connection.remoteAddress == host)
	{
		let body = "";
		request.on('data', function(chunk)
		{ 
			body += chunk;
		});
	
		request.on('end', function()
		{
			if(body == server_password)
			{
				if(messageQueue.length > 0)
				{
					res = messageQueue.shift();
					response.writeHead(200, {"Content-Type": "application/json"}); 
					response.end(res);
				} 
				else
				{
					response.writeHead(201, {"Content-Type": "text/plain"}); 
					response.end("NO");
				}
			}
			else
			{
				response.writeHead(401, {"Content-Type": "text/plain"}); 
				response.end("wrong password");
			}
		});
	}
	else
	{
			response.writeHead(400, {"Content-Type": "text/plain"}); 
			response.end("wrong format");
	}
}




