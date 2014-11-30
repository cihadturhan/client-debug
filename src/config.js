config = {
    "register": {
//client doesn't listen a register event
        client: null,
        server: function(message) {
            this.clientData = message;

            this.leave('unregistered');
            //Implement here your own admin verification
            if (this.clientData.admin) {
                this.join('admin');
            } else {
                this.join('client');
            }

            //send new data to admins
            var userData = this.server.of('/').sockets.map(function(d) {
                return d.clientData;
            });

            this.nsp.in('admin').emit('userlist', JSON.decycle(userData));
        },
        admin: function() {
            //refresh user list
        }
    },
    disconnect: {
        server: function() {
            var userData = this.server.of('/').sockets.map(function(d) {
                return d.clientData;
            });

            this.nsp.in('admin').emit('userlist', JSON.decycle(userData));
        }
    },
    /*
     * admin emits ping command with a user list to server 
     * and server emits ping to a list of clients
     *                                
     * admin (id1,id2...) -> server -> client1(id1)
     *                              -> client2(id2)
     *                                 . . .
     */

    ping: {
        client: function() {

        },
        server: function(message, userIds) {
            if (this.rooms.indexOf('admin') > -1) {

                //TO-DO: Check message before it is sent to user

                console.log("Eval command is forwarding...\n");
                var clients = this.nsp.in('client').sockets;

                //Loop for all clients
                var foundClients = clients.filter(function(d) {
                    // Check if the current user id is inside the list sent from admin
                    return userIds.indexOf(d.clientData.userId) > -1;
                });
                //TO-DO
            } else {
                console.log('Administration error!');
            }
        },
        //admin doesn't listen pong event, it just emits 
        admin: null
    },
    /*
     * 
     * client1(id1) -> server (id1:ping1,id2:ping2...) -> admin
     * client2(id2) ->
     * . . .
     *
     */
    pong: {
        //client doesn't listen pong event, it just emits 
        client: null,
        server: function() {

        },
        admin: {
        }
    },
    "eval": {
        client: function(message, remote) {
            var data, resp;
            try {
                data = eval(message);
                if (typeof data === 'function') {
                    data = data.toString();
                }
            } catch (e) {
                data = {
                    message: e.message,
                    stack: e.stack
                };
            }

            resp = new Response(JSON.decycle(data), remote.requestId, remote.subrequestId);

            this.emit('response', resp);
        },
        server: function(message, userIds) {
            if (this.rooms.indexOf('admin') > -1) {

                //TO-DO: Check message before it is sent to user

                console.log("Eval command is forwarding...\n");
                var clients = this.nsp.in('client').sockets;

                //Loop for all clients
                var foundClients = clients.filter(function(d) {
                    // Check if the current user id is inside the list sent from admin
                    return userIds.indexOf(d.clientData.userId) > -1;
                });

                // emit code to selected users
                for (var i = 0; i < foundClients.length; i++) {
                    foundClients[i].emit('eval', message);
                }
            } else {
                console.log('Administration error!');
            }
        },
        //admin doesn't listen eval event
        admin: null
    },
    "response": {
        client: null,
        server: function(message) {
            console.log('response...');
            var admins = this.nsp.in('admin');
            admins.emit('response', message);
        },
        admin: function(message) {
            console.log('response', message);
            if (message && typeof message === 'object') {
                switch (message.type) {
                    case 'json':
                        var text = message.data;
                        (typeof text === 'undefined') && (text = 'undefined');
                        (typeof text === 'string' || typeof text === 'number') && (text = {"": text });
                        var jsonText = JSON.stringify(text);
                        try {
                            viewer.view(jsonText);
                        } catch (e) {
                            console.log(e);
                        }
                        break;
                    case 'html':
                        var html = message.data;
                        var iframe = $('#html-preview>iframe');
                        iframe.attr('src', 'data:text/html;charset=utf-8,' + encodeURI(html));
                        $('#html-preview').append(iframe);
                        break;
                    case 'text':
                        var text = message.data;
                        contenateOutput(text);
                        break;
                    default:
                        console.error('Unknown message type');
                        break;
                }
            }
        }
    },
    userlist: {
        client: null,
        server: function(message) {
            this.emit('userlist', JSON.decycle(this.server.of('/').sockets.map(function(d) {
                return d.clientData;
            })));
        },
        admin: function(message) {
            var userData = JSON.retrocycle(message);
            console.log(userData);
            printUsers(userData);
            contenateOutput('User Data Retrieved');
        }
    },
    domSnapshot: {
        client: function(message, remoteData) {
            var data = document.documentElement.serializeWithStyles();
            var resp = new Response(data, remoteData.requestId, remoteData.subrequestId);
            this.emit('response', resp);
        },
        server: function() {
            config.eval.server.call(this, arguments);
        }
    },
    echo: {
        client: function(message) {
            console.log(message);
        },
        server: function(message) {
            console.log(message);
        },
        admin: function(message) {
            console.log(message);
        }
    }
};