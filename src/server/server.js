var io = require('socket.io')();

require('../helper.js');

var config = {
    "register": {
        server: function(message) {
            this.join('registered');
            this.clientData = message;

            var clients = this.server.of('/').sockets;
            for (var i = 0; i < clients.length; i++) {
                var client = clients[i];
                if (client.clientData) {
                    client.emit('response', JSON.decycle(this.server.of('/').sockets));
                } else {
                    console.log('no client data');
                }
            }
        }
    },
    check: {
        server: function() {
            console.log(this.server.of('/unregistered').sockets.length);
            console.log(this.server.of('/registered').sockets.length);
            //console.log(typeof this.clientData);
        }
    }
};


io.on('connection', function(socket) {
    socket.join('unregistered');
    console.log('a user connected');

    socket.on('register', config.register.server);

    socket.on('check', config.check.server);

});

io.listen(3000);
