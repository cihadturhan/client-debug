/**
 * Socket.io implementation on client-debug
 * @name 
 * @function
 */

userData = {
    user_id: Math.floor(1000 * Math.random()),
    user_name: 'myname',
    "you": "can assign any user data here"
};

function log(data) {
    var ul = document.getElementById('log');
    var li = document.createElement('li');
    li.innerHTML = data;
    ul.appendChild(li);
}

var clientDebug = (function() {
    var socket = io();
    socket.emit('register', userData);

    socket.on('eval', function(message) {
        var result = eval(message.text);
        socket.emit('response', result);
    });

    socket.on('get', function(message) {
        try {
            var obj = eval(message.text);
            var result = JSON.parse((JSON.pruned(obj, 2)));
        } catch (e) {
            var result = {};
        }
        var query = {method: 'response', result: result};
        send(JSON.stringify(query));
    });
})();


var socketWrapper = (function() {

    var socket = null;
    function init() {
        var host = "ws://127.0.0.1:9000/ws"; // SET THIS TO YOUR SERVER
        try {
            socket = new WebSocket(host);
            log('WebSocket - status ' + socket.readyState);
            socket.onopen = function(msg) {
                log("Welcome - status " + this.readyState);
                // kullanici bilgilerini dogrulama
                var url = window.location.pathname;
                var page = url.replace(/^.*[\\\/]/, '').replace(/.[^.]+$/, '');
                (page === '') && (page = 'index');
                var info = {method: 'register', user_id: userData.user_id, user_name: userData.user_name, sess: userData.sess, page: page};
                send(JSON.stringify(info));
            };
            socket.onmessage = function(msg) {
                var message = JSON.parse(msg.data);
                var result;
                switch (message.mode) {
                    case 'eval':
                        
                        break;
                    case 'get':
                        try {
                            var obj = eval(message.text);
                            result = JSON.parse((JSON.pruned(obj, 2)));
                        } catch (e) {
                            result = {};
                        }
                        var query = {method: 'response', result: result};
                        send(JSON.stringify(query));
                        break;
                }
            };
            socket.onclose = function(msg) {
                log("Disconnected - status " + this.readyState);
            };
        }
        catch (ex) {
            log(ex);
        }
    }

    function send(msg) {
        if (!msg) {
            msg = "Message can not be empty";
        }

        try {
            socket.send(msg);
        } catch (ex) {
            log(ex);
        }
    }
    function quit() {
        if (socket !== null) {
            socket.close();
            socket = null;
        }
    }

    function reconnect() {
        quit();
        init();
    }
    return {
        reconnect: reconnect,
        send: send
    };
})();

window.onload = function() {
    socketWrapper.reconnect();
};

window.onerror = function(e) {
    socketWrapper.send(JSON.pruned({method: 'response', result: e}));
};