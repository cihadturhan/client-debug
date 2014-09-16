io = require('socket.io')();

require('../helper.js');
require('../config.js');


var admin_page = 'live_module';

io.on('connection', function(socket) {
    console.log('a user connected');
    socket.join('unregistered');

    var conf = config;

    for (var key in conf) {
        if (conf[key].server) {
            var ev = conf[key].server;
            socket.on(key, ev);
        }
    }
});

//io.set('close timeout', 60 * 60 * 24); // 24h time out

//io.set('log level', 1);
//io.set('heartbeat interval', 2000); //see https://github.com/Automattic/socket.io/issues/777#issuecomment-33331283
//io.set('heartbeat timeout', 1000); //see https://github.com/Automattic/socket.io/issues/777#issuecomment-33331283
io.listen(3000);
console.log(io,
        {
            log: true
            , "close timeout": 120
            , "heartbeat timeout": 120
            , "heartbeat interval": 30
            , "transports": ["websocket"]
        }
);
