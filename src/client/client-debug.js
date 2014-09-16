/**
 * Socket.io implementation on client-debug
 * @name 
 * @function
 */

userData = {
    userId: Math.floor(1000 * Math.random()),
    userName: ['John', 'George', 'Micheal', 'Jordan', 'David'][parseInt(5 * Math.random())],
    "you": "can assign any user data here"
};

function log(data) {
    var ul = document.getElementById('log');
    var li = document.createElement('li');
    li.innerHTML = data;
    ul.appendChild(li);
}
var socket,
        conf = config;
var clientDebug = (function() {
    socket = io('http://localhost:3000');
    socket.emit('register', userData);

    for (var key in conf) {
        if (conf[key].client) {
            var ev = conf[key].client;
            socket.on(key, ev);
        }
    }

})();