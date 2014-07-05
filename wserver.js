var WebSocketServer = require('ws').Server
        , wss = new WebSocketServer({port: 9000});
require('./helper.js');


var home_webpage = 'index', admin_page = 'live_module';



wss.on('connection', function(ws) {
    var that = this;
    ws.on('message', function(message) {
        var response = JSON.parse(message);
        switch (response.method) {
            case 'forward':
                if (this.clientData.admin && this.clientData.page == admin_page) {
                    console.log("Forwarding...\n");
                    var forwarded_user = null;
                    for (var i = 0; i < that.clients.length; i++) {
                        if (that.clients[i].userData.user_id == response.id) {
                            return that.clients[i];
                        }
                    }

                    //verilen kullanici id'si bizde bulunmamis olabilir
                    if (forwarded_user === null) {
                        console.log('Forwarded user not found!');
                        break;
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
                this.clientData = {
                    user_id: response.user_id,
                    sess: response.sess,
                    user_name: response.user_name,
                    page: response.page,
                    admin: (response.page === admin_page)
                };
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
