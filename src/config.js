var config = {
    "register": {
        //client doesn't listen a register event
        client: null,
        server: function(message) {
            var response = JSON.parse(message);
            this.clientData = {
                user_id: response.user_id,
                sess: response.sess,
                user_name: response.user_name,
                page: response.page,
                admin: (response.page === admin_page)
            };
        },
        admin: function() {
            //refresh user list
        }
    },
    "eval": {
        client: function(message) {
            var result = eval(message.text);
            socket.emit('response', result);
        },
        server: function(message) {
            if (this.clientData.admin && this.clientData.page === admin_page) {
                console.log("Forwarding...\n");
                var forwarded_user = null;
                for (var i = 0; i < that.clients.length; i++) {
                    if (that.clients[i].userData.user_id === response.id) {
                        return that.clients[i];
                    }
                }

                //verilen kullanici id'si bizde bulunmamis olabilir
                if (forwarded_user === null) {
                    console.log('Forwarded user not found!');
                    return;
                }

                var query = {
                    mode: response.mode,
                    text: response.text
                };

                try {
                    forwarded_user.send(JSON.stringify(query));
                } catch (e) {
                    console.log(e);
                }
            } else {
                console.log('Administration error!');
            }
        },
        //admin doesn't listen eval event
    },
    "response": {
        client: {
        },
        server: {
        },
        admin: {
        }
    },
    echo: {
        client: {
        },
        server: {
        },
        admin: {
        }
    }
}


