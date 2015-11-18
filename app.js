var express = require('express'),
    app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server),
	//to store various nicknames for checking
	nicknames = [];
	
server.listen(8080);

app.get('/', function (req, res){
    res.sendFile(__dirname + '/index.html');
});

//receive the message in the server sidebar
io.sockets.on('connection', function(socket){
	socket.on('new-user', function(data, callback){
		if(nicknames.indexOf(data)!= -1){ //if user exist in the array
			callback(false);
		}else{
			callback(true);
			//adding the nickname as socket
			socket.nickname = data;
			//put the new nickname in the array
			nicknames.push(socket.nickname);
            updateNicknames();
		}
	});
	
	function updateNicknames(){
		    //to show all other users, who joins the chat
			io.sockets.emit('usernames',nicknames);
	}
	//same name from the form in index.html
	socket.on('send-message', function (data){
		//send the message to other users including the sender without names
		//io.sockets.emit('new-message',data);
		//to display message with name
		io.sockets.emit('new-message',{msg: data, nick: socket.nickname});
		//send the data every user except the sender
		//socket.broadcast.emit('new-message',data);
	});
	
	//if user doesn't enter the chat
	socket.on('disconnect', function(data){
		if(!socket.nickname) return;
		// remove the user who went out
		nicknames.splice(nicknames.indexOf(socket.nickname),1);
		updateNicknames();
	});
});