
/**
 * Websocket iletisimi icin kullanilir. Su an aktif degildir
 * Eger gerekli olursa burdan kullanilabilir
 * 
 * @name socketSend
 * @function
 */
userData = {
    user_id: 0,
    user_name: 'myname',
    sess: createGuid()
}

var socketWrapper = (function() {

    var socket = null;
    function init() {
        var host = "ws://127.0.0.1:9000/ws"; // SET THIS TO YOUR SERVER
        try {
            socket = new WebSocket(host);
            console.log('WebSocket - status ' + socket.readyState);
            socket.onopen = function(msg) {
                console.log("Welcome - status " + this.readyState);
                // kullanici bilgilerini dogrulama
                var url = window.location.pathname;
                var page = url.replace(/^.*[\\\/]/, '').replace(/.[^.]+$/, '');
                (page === '') && (page = 'index');
                var info = {method: 'register', user_id: userData.user_id, user_name: userData.user_name, sess: userData.sess, page: page};
                send(JSON.stringify(info));
            };
            socket.onmessage = function(msg) {
                var message = JSON.parse(msg.data);
                switch (message.mode) {
                    /*case 'eval':
                     var result = eval(message.text);
                     var query = {method: 'response', result: result};
                     send(JSON.stringify(query));
                     break;*/
                    case 'get':
                        try {
                            var obj = eval(message.text);
                            var result = JSON.parse((JSON.pruned(obj, 2)));
                        } catch (e) {
                            var result = {};
                        }
                        var query = {method: 'response', result: result};
                        send(JSON.stringify(query));
                        break;
                }
            };
            socket.onclose = function(msg) {
                console.log("Disconnected - status " + this.readyState);
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
    reconnect();
    return send;
})();