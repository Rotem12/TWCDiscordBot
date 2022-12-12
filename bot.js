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
	
	let name    = checkString(msg.member.nickname ? msg.member.nickname : msg.author.username, 18);
	let content = checkString(msg.cleanContent, 350)
	
	if(content != "")
	{
		messageQueue.push(`{"name": "${name}", "content": "${content}"}`);
	}

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

function checkString(s, charLimit=0)
{
	// links
	var pattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
	var pattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
	
	var pattern3 = /<a?:.+?:\d{18}>|\p{Extended_Pictographic}/gu // unicode emoji
	var pattern4 = /<a?:.+:\d+>/gm // custom emoji
	
    s = s.replace(pattern1, '');
	s = s.replace(pattern2, '');
	s = s.replace(pattern3, '');
	s = s.replace(pattern4, '');
	
	if(charLimit > 0)
	{
		return s.substring(0, charLimit)
	}
	return s
}

function respondToRequest (request, response)
{
	let res = "";
	if (!("content-type" in request["headers"]) || request["headers"]["content-type"] != "text/plain" || request.connection.remoteAddress != host)
	{
		response.writeHead(400, {"Content-Type": "text/plain"}); 
		response.end("wrong format");
		return;
	}
	
	let body = "";
	request.on('data', function(chunk)
	{ 
		body += chunk;
	});

	request.on('end', function()
	{
		if(body != server_password)
		{
			response.writeHead(401, {"Content-Type": "text/plain"}); 
			response.end("wrong password");
			return;
		}
			
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
	});
}




