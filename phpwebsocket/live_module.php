<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <title>Admin Page</title>
        
        <script src="jquery-1.9.0/jquery-1.8.3.min.js"> </script>
        <script src="cookieManager.js"> </script>
        
        <title> <?php echo $list[0]; ?>  </title>
        <script>
<?php echo '
            var user_id = 1;
            var user_name = "admin";'
?>
            var sock = (function() {

                var socket = null;

                function init() {
                    var host = "ws://127.0.0.1:9000/ws"; // SET THIS TO YOUR SERVER
                    try {
                        socket = new WebSocket(host);
                        console.log('WebSocket - status ' + socket.readyState);
                        socket.onopen = function(msg) {
                            console.log("Welcome - status " + this.readyState);
                            var url = window.location.pathname;
                            var page = url.substring(url.lastIndexOf('/') + 1);
                            var info = {method: 'register', user_id: user_id, user_name: user_name, sess: 'abc', page: page};
                            send(JSON.stringify(info));
                        };
                        socket.onmessage = function(msg) {
                            var message = JSON.parse(msg.data);
                            switch (message.method) {
                                case 'response':
                                    console.log(message.result);
                                    break;
                            }
                        };
                        socket.onclose = function(msg) {
                            console.log("Disconnected - status " + this.readyState);
                        };
                    }
                    catch (ex) {
                        console.log(ex);
                    }
                    //$("msg").focus();
                }

                function send(msg) {
                    if (!msg) {
                        msg = "Message can not be empty";
                    }

                    try {
                        socket.send(msg);
                    } catch (ex) {
                        console.log(ex);
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
                return {send: send, reconnect: reconnect, socket: socket};
            })();

            function getUsers() {
                sock.send(JSON.stringify({method: 'get', mode: 'users'}));
            }

            function eval_on(user_id, text) {
                sock.send(JSON.stringify({method: 'forward', mode: 'eval', id: user_id, text: text}));
            }

            function get_from(user_id, text) {
                sock.send(JSON.stringify({method: 'forward', mode: 'get', id: user_id, text: text}));
            }

        </script>

    </head>
    <body>
        <?php
        // put your code here
        ?>
    </body>
</html>
