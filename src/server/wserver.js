var io = require('socket.io');

var WebSocketServer = require('ws').Server
        , wss = new WebSocketServer({port: 9000});
require('./helper.js');


var admin_page = 'live_module';


var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res) {
    res.sendfile('index.html');
});

io.on('connection', function(socket) {
    console.log('a user connected');
    socket.on('disconnect', function() {
        console.log('user disconnected');
    });

    socket.emit('register', 'yeah');
    //socket.broadcast.emit('hi');

});

io.listen(3000);


wss.on('connection', function(ws) {
    var that = this;
    ws.on('message', function(message) {
        var response = JSON.parse(message);
        switch (response.method) {
            case 'forward':
                
                break;
            case 'response':
                for (var i = 0; i < that.clients.length; i++) {
                    var t_user = that.clients[i];
                    if (t_user.userData.admin && t_user.userData.page === admin_page) {
                        console.log("Getting forwarded response...\n");
                        t_user.send(message);
                    }
                }
                break;
            case 'get':
                if (this.clientData.admin && this.clientData.page === admin_page) {
                    var data = {
                        method: 'response',
                        result: that.clients
                    };
                    ws.send(JSON.pruned(data));
                } else {
                    console.log('Administration error!');
                }
                break;
            case 'register':
                console.log("Registering user...\n");
                
            case 'echo':
                break;
            default:
                console.log('Wrong method! : ' + response.method + '\n');
        }

        //console.log(this.client)
        /*console.log(that.clients.length, 'clients');
         console.log('received: %s', message);*/
    });
    //console.log(this.clients);
    //ws.send('something');
});
