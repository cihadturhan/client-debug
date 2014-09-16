var userData = {
    userId: Math.floor(1000 * Math.random()),
    userName: 'admin',
    "you": "some data",
    admin: 1
};

var userIds = [],
        CM; //codemirror instance;

var socket = io('http://localhost:3000');
socket.emit('register', userData);
socket.emit('userlist', null);

for (var key in config) {
    if (config[key].admin) {
        var ev = config[key].admin;
        socket.on(key, ev);
    }
}


function contenateOutput(text) {
    var inputText = CM.getValue()?CM.getValue():'';
    CM.setValue('');
    var outputText = $('#output').val();
    $('#output').val(
            (outputText.trim() === '' ? '' : outputText + '\n') +
            (inputText.trim() === '' ? '' : inputText + '\n') +
            text
            );
}

function printUsers(userData) {
    $('#user-list').html('');
    var disabledAttr = '',
            template = '<label class="uk-margin-small-top"><input type="checkbox" {DA}> {UN}</label>'
    userData.forEach(function(d) {
        if (d) {
            disabledAttr = d.admin ? 'disabled="disabled"' : '';

            var li = $('<div class="uk-form-row"></div>');
            var user = $(template
                    .replace('{UN}', d.userName)
                    .replace('{DA}', disabledAttr)
                    )
                    .data('user', d);
            user.find('input').on('change', function() {
                var data = user.data('user');
                if (!$(this).prop('checked')) {
                    userIds.removeElement(data.userId);
                } else {
                    userIds.push(data.userId);
                }
            });
            $('#user-list').append(li.append(user));
        }
    });

    //$('#user-list li:eq(0)').click();
}

(function() {
    var cdnLink = 'http://api.cdnjs.com/libraries';
    $.getJSON(cdnLink, function(data) {
        data.results.filter(function(d) {
            return /\.js$/i.test(d.latest);
        }).forEach(function(d, i) {
            var el = $('<a href="#" target="_self">' + d.name + '</a>');
            $('#js-list')
                    .append($('<li>').append(el));
            el.on('click', function(e) {
                e.preventDefault();
                var command = $('#lazyload').text().replace('__src__', d.latest);
                socket.emit('eval', command, userIds.slice());
            });

        });
    });

})();


$().ready(function() {
    //JSON inspector
    viewer = new InspectorJSON({
        element: 'json',
        collapsed: false
    });
    
    $('#input-form').submit(function(e){
        e.preventDefault();
    })

    //initialize code input
    CM = CodeMirror.fromTextArea($('#input')[0]);
    var cmElem = $(CM.getWrapperElement());
    var w = $('#io').width() - 14;
    cmElem.css('width', w + 'px');

    //Search script

    $('#script-search-text').on('keyup', function() {
        var text = $(this).val();
        var reg = new RegExp(text, 'i');
        $('#js-list li').css('display', '');
        $('#js-list li a').filter(function(i, el) {
            return !(reg.test($(el).text()));
        }).parent().css('display', 'none');
    });


    //Listen send button click
    $('#send-btn').on('click', function(e) {
        var text = CM.getValue();
        socket.emit('eval', text, userIds.slice()); // TO-DO: Find the bug which assigns userIds empty array
    });
});

$(window).resize(function() {
    var cmElem = $(CM.getWrapperElement());
    var w = $('#io').width() - 14;
    cmElem.css('width', w + 'px');

});

function previewHTML(html) {
    var iframe = $('#html-preview>iframe');
    iframe.attr('src', 'data:text/html;charset=utf-8,' + encodeURI(html));
    $('#html-preview').append(iframe);
}
