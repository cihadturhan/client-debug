io = require('socket.io')();

require('../helper.js');
require('../config.js');


var admin_page = 'live_module';

var requestPool = {};
var maxTimeout = 30;//seconds

var Request = function(id){
  this.id = id;
  this.took = 0;
  this.createdAt = +new Date();
  this.finishedAt = null;
  this.subrequests = {};
  this.numOfFinishedSR = 0;
  return this;
};

Request.prototype = {
    createSubrequests:function(clients){
        if(clients && clients.length){
            clients.forEach(function(d){
               var guid = createGuid();
               this.subrequests[guid] = new Subrequest(guid, this);
               this.numOfFinishedSR++;
            });
        }else{
            console.log('no clients defined');
        }
    },
    sendAndKill: function(){
        var admins = io.of('/').in('admin');
        admins.emit('response', message);
        var id = this.id;
        setTimeout(function(){
            delete requestPool[id];
        },0);
    }
};

var Subrequest = function(id, parent){
    this.parent = parent;
    this.id = id;
    this.finished = false;
    this.took = 0;
    this.response = null;
    return this;
};

function createRequest(guid, userIds){
    var currRequest = requestPool[guid] = new Request(guid);
    
    var clients = io.of('/').in('client');

    //Loop for all clients
    var foundClients = clients.filter(function(d) {
        // Check if the current user id is inside the list sent from admin
        return userIds.indexOf(d.clientData.userId) > -1;
    });
    
    currRequest.createSubrequests(foundClients);
}


io.on('connection', function(socket) {
    console.log('a user connected');
    socket.join('unregistered');

    var conf = config;

    for (var key in conf) {
        if (conf[key].server) {
            var ev = conf[key].server;
            
            socket.on(key, 
            function(message){
                
                ev.prototype.call(this, arguments)
            });
        }
    }
});

function startTimeoutHandler() {
    var timer = setInterval(function(){
        for(var key in requestPool){
            var currRequest = requestPool[key];
            if(currRequest.took > maxTimeout){
                currRequest.sendAndKill();
            }
        }
    },1000);
}

//io.set('close timeout', 60 * 60 * 24); // 24h time out

//io.set('log level', 1);
//io.set('heartbeat interval', 2000); //see https://github.com/Automattic/socket.io/issues/777#issuecomment-33331283
//io.set('heartbeat timeout', 1000); //see https://github.com/Automattic/socket.io/issues/777#issuecomment-33331283
io.listen(3000);

