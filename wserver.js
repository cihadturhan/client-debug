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
                break;
            case 'response':
                break;
            case 'get':
                var data = {
                    method: 'response',
                    result: that.clients
                };
                ws.send(JSON.pruned(data));
                break;
            case 'register':
                console.log("Registering user...\n");
                this.userData = {
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