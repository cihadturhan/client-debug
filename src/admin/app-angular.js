var userData = {
    userId: Math.floor(1000 * Math.random()),
    userName: 'admin',
    "you": "some data",
    admin: 1
};

'use strict';

var app = angular.module('admin', ['gd.ui.jsonexplorer']);
// Directives
app.directive('enterSubmit', function() {
    return {
        restrict: 'A',
        link: function(scope, elem, attrs) {
            elem.bind('keydown', function(event) {
                var code = event.keyCode || event.which;
                if (code === 13) {
                    if (!event.shiftKey) {
                        event.preventDefault();
                        scope.$apply(attrs.enterSubmit);
                    }
                }
            });
        }
    };
});

//Factories
app.factory('socket', function($rootScope) {
    var socket = io('http://localhost:3000');
    socket.emit('register', userData);

    return {
        on: function(eventName, callback) {
            socket.on(eventName, function() {
                var args = arguments;
                $rootScope.$apply(function() {
                    callback.apply(socket, args);
                });
            });
        },
        emit: function(eventName, data, callback) {
            socket.emit(eventName, data, function() {
                var args = arguments;
                $rootScope.$apply(function() {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            });
        }
    };
});


app.factory('jsListFactory', function($http) {
    //use cdnjs api to get available javascript libaries
    var cdnLink = 'http://api.cdnjs.com/libraries';
    var factory = {
        get: function() {
            return $http.get(cdnLink);
        }
    };
    return factory;
});

app.factory('userFactory', function($http, socket) {
    var factory = {
        'get': function(callback) {
            socket.emit('get', 'users');
        }
    };
    return factory;
});

app.controller('jsList', function($rootScope, $scope, jsListFactory) {
    $scope.search = {};
    jsListFactory.get().success(function(response) {
        $scope.jsList = response.results;
    });
    $scope.loadJS = loadJS;
});

app.controller('io', function($rootScope, $scope, socket) {
    $scope.input = '';
    $scope.output = '';
    $scope.submit = function() {

    };
    //send request
    //return result
    socket.on('response', function(message) {
        var result = JSON.retrocycle(message);
        console.log(result);
        var userData = result.map(function(d, i) {
            return d.clientData;
        });

        $rootScope.$broadcast('userData', userData);
        $scope.output += ($scope.output === '' ? '' : '\n') + $scope.input + '\n' + 'User Data Retrieved';
        $scope.input = '';
    });
});

app.controller('json', function($rootScope, $scope) {
    $scope.data = {};

    $rootScope.$on('userData', function(sender, data) {
        $scope.data = data;
    });
});

app.controller('user', function($rootScope, $scope, userFactory) {
    $scope.userList = [];
    userFactory.get();
    $rootScope.$on('userData', function(sender, data) {
        $scope.userList = data;
    });
    
    $scope.selectUser = function(user){
        $scope.selectedUser = user;
        console.log($scope.selectedUser);
    };
});

function loadJS(src) {
    var command = document.getElementById('lazyload').innerHTML;
    alert(command);
}

/*var clientDebug = (function() {
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
 })();*/

/*
 // Create a websocket wrapper
 var sock = (function() {
 
 var socket = null;
 function init() {
 var host = "ws://127.0.0.1:9000";
 try {
 socket = new WebSocket(host);
 console.log('WebSocket - status ' + socket.readyState);
 socket.onopen = function(msg) {
 console.log("Welcome - status " + this.readyState);
 var url = window.location.pathname;
 var page = url.replace(/^.*[\\\/]/, '').replace(/.[^.]+$/, '');
 (page === '') && (page = 'index');
 var info = {method: 'register', user_id: user_id, user_name: user_name, sess: 'abc', page: page};
 send(JSON.stringify(info));
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
 alert("Message can not be empty");
 }
 
 msg.guid = createGuid();
 try {
 socket.send(JSON.stringif(msg));
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
 */
function eval_on(user_id, text) {
    sock.send({method: 'forward', mode: 'eval', id: user_id, text: text});
}

function get_from(user_id, text) {
    sock.send({method: 'forward', mode: 'get', id: user_id, text: text});
}