const storage = require('node-persist');
const readline = require('readline');
var msgCounter;

start();

async function start(){
	await storage.init( /* options ... */ );
	msgCounter = await storage.length();

	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});

	rl.on('line', (input) => {
		findCmd = input.split(" ");
		if (findCmd[1] == null){
			ReadTimeline([findCmd[0]]);
		}else{
			switch(findCmd[1]){
				case "->":
					InsertPost(findCmd);
					break;
				case "follows":
					FollowUser(findCmd[0], findCmd[2]);
					break;
				case "wall":
					ShowWall(findCmd[0])
					break;
			}
		}
	});
}

async function InsertPost(cmdArgs){
	let messageCommand = cmdArgs[2];
	for (let i=3; i<cmdArgs.length; i++){
		messageCommand = messageCommand + " " + cmdArgs[i];
	}

	let messagePost = {
		user: cmdArgs[0],
		message: messageCommand,
		timestamp: new Date()
	}
	await storage.setItem(msgCounter.toString(), messagePost);
	msgCounter++;
}

async function ReadTimeline(userList){
	let numMessages = await storage.length();
	let today = new Date();

	for (let i=numMessages-1; i>=0; i--){
		let postMessage = await storage.getItem(i.toString());
		try{
			if (userList.includes(postMessage.user)){
				let timeSince = getTimeSince(today, postMessage.timestamp);
				let post = postMessage.message + " (" + timeSince + ")";
				if (userList.length > 1){
					post = postMessage.user + " - " + post
				}
				console.log(post);
			}
		} catch (error){
			continue;
		}
	}
}

async function FollowUser(user1, user2){
	let followList = await storage.getItem(user1);
	if (followList == undefined){
		followList = [];
	}
	if (!followList.includes(user2)){
		followList.push(user2);
		await storage.setItem(user1, followList);
	}
}

async function ShowWall(user){
	let followList = await storage.getItem(user);
	if (followList == undefined){
		ReadTimeline([user]);
	}else{
		followList.push(user);
		ReadTimeline(followList);
	}
}

function getTimeSince(date2Str, date1Str){
	const day = 1000*60*60*24;
	const hour = 1000*60*60;
	const minute = 1000*60;
	const second = 1000;
	let date2 = new Date(date2Str);
	let date1 = new Date(date1Str);
	let timeDiff = date2.getTime() - date1.getTime();
	if (timeDiff/second > 59){
		if (timeDiff/minute > 59){
			if (timeDiff/hour>23){
				if (Math.round(timeDiff/day) == 1){
					return Math.round(timeDiff/day) + " day ago";
				}
				return Math.round(timeDiff/day) + " days ago";
			}else{
				if (Math.round(timeDiff/hour) == 1){
					return Math.round(timeDiff/hour) + " hour ago";
				}
				return Math.round(timeDiff/hour) + " hours ago";
			}
		}else{
			if (Math.round(timeDiff/minute) == 1){
				return Math.round(timeDiff/minute) + " minute ago";
			}
			return Math.round(timeDiff/minute) + " minutes ago";
		}
	}else{
		if (Math.round(timeDiff/second) == 1){
			return Math.round(timeDiff/second) + " second ago";
		}
		return Math.round(timeDiff/second) + " seconds ago";
	}
}
