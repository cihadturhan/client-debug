(function() {
    'use strict';
    var DEFAULT_MAX_DEPTH = 6;
    var DEFAULT_ARRAY_MAX_LENGTH = 50;
    var seen; // Same variable used for all stringifications

    Date.prototype.toPrunedJSON = Date.prototype.toJSON;
    String.prototype.toPrunedJSON = String.prototype.toJSON;

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
            escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
            meta = {// table of character substitutions
                '\b': '\\b',
                '\t': '\\t',
                '\n': '\\n',
                '\f': '\\f',
                '\r': '\\r',
                '"': '\\"',
                '\\': '\\\\'
            };

    function quote(string) {
        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function(a) {
            var c = meta[a];
            return typeof c === 'string'
                    ? c
                    : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }

    function str(key, holder, depthDecr, arrayMaxLength) {
        var i, // The loop counter.
                k, // The member key.
                v, // The member value.
                length,
                partial,
                value = holder[key];

        if (typeof jQuery !== 'undefined' && value instanceof jQuery)
            return '"-jQuery-"';

        if (isNode(value) || isElement(value))
            return '"-element-"';

        if (key === 'options' || key === 'plotOptions' || key === 'htmlContent' || key === 'ticks' || key === 'tooltipOptions' || key === 'renderer' || key === 'styles' || key === 'style')
            return '"-unnecessary-"';

        if (value && typeof value === 'object' && typeof value.toPrunedJSON === 'function') {
            value = value.toPrunedJSON(key);
        }



        switch (typeof value) {
            case 'string':
                return quote(value);
            case 'number':
                return isFinite(value) ? String(value) : 'null';
            case 'boolean':
            case 'null':
                return String(value);
            case 'object':
                if (!value) {
                    return 'null';
                }
                if (depthDecr <= 0 || seen.indexOf(value) !== -1) {
                    return '"-pruned-"';
                }
                seen.push(value);
                partial = [];
                if (Object.prototype.toString.apply(value) === '[object Array]') {
                    length = Math.min(value.length, arrayMaxLength);
                    for (i = 0; i < length; i += 1) {
                        partial[i] = str(i, value, depthDecr - 1, arrayMaxLength) || 'null';
                    }
                    v = partial.length === 0
                            ? '[]'
                            : '[' + partial.join(',') + ']';
                    return v;
                }
                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        try {
                            v = str(k, value, depthDecr - 1, arrayMaxLength);
                            if (v)
                                partial.push(quote(k) + ':' + v);
                        } catch (e) {
                            // this try/catch due to some "Accessing selectionEnd on an input element that cannot have a selection." on Chrome
                        }
                    }
                }
                v = partial.length === 0
                        ? '{}'
                        : '{' + partial.join(',') + '}';
                return v;
        }
    }

    JSON.pruned = function(value, depthDecr, arrayMaxLength) {
        seen = [];
        depthDecr = depthDecr || DEFAULT_MAX_DEPTH;
        arrayMaxLength = arrayMaxLength || DEFAULT_ARRAY_MAX_LENGTH;
        return str('', {'': value}, depthDecr, arrayMaxLength);
    };

}());

//Returns true if it is a DOM node
function isNode(o) {
    return (
            typeof Node === "object" ? o instanceof Node :
            o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName === "string"
            );
}

//Returns true if it is a DOM element    
function isElement(o) {
    return (
            typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
            o && typeof o === "object" && o.nodeType === 1 && typeof o.nodeName === "string"
            );
}


//sistemin offline olup olmadığını kontrol eden bir fonksiyon.
//Kullanım:
//networkListener(both);
//networkListener(online, 'online');
//networkListener(offline, 'offline');

function networkListener(a, b) {
    var offlineF, onlineF;
    if (a instanceof Function && b instanceof Function) {
        onlineF = a;
        offlineF = b;
    } else if (a instanceof Function) {
        if (typeof b === "string") {
            if (b === "online") {
                onlineF = a;
            } else if (b === "offline") {
                offlineF = a;
            }
        } else {
            onlineF = a;
            offlineF = a;
        }
    }
    if (typeof onlineF !== "undefined") {
        window.addEventListener('online', onlineF, false);
    }
    if (typeof offlineF !== "undefined") {
        window.addEventListener('offline', offlineF, false);
    }
}

createGuid = function() {
    return 'xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};