const storage = require('node-persist');

async function start(){
	await storage.init( /* options ... */ );
	await storage.setItem('name','Juan')
	console.log(await storage.getItem('name')); // yourname
}

start();