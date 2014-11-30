(function() {

    if (typeof JSON.decycle !== 'function') {
        JSON.decycle = function decycle(object, maxDepth) {
            'use strict';

            var DEFAULT_MAX_DEPTH = 3;
            var DEFAULT_ARRAY_MAX_LENGTH = 50;

            var objects = [],
                    paths = [],
                    maxDepth = maxDepth ? maxDepth : DEFAULT_MAX_DEPTH;

            return (function derez(value, path, currDepth) {
                if (currDepth === 0)
                    return '...';

                var i, // The loop counter
                        name, // Property name
                        nu;         // The new object or array

                //On chrome document.all return undefined and creates circular ref
                if (typeof value === 'undefined')
                    return undefined;

                if (typeof value === 'object' && value !== null && !(value instanceof Boolean) && !(value instanceof Date) && !(value instanceof Number) && !(value instanceof RegExp) && !(value instanceof String)) {


                    for (i = 0; i < objects.length; i += 1) {
                        if (objects[i] === value) {
                            return {$ref: paths[i]};
                        }
                    }

                    objects.push(value);
                    paths.push(path);

                    if (Object.prototype.toString.apply(value) === '[object Array]') {
                        nu = [];
                        for (i = 0; i < value.length; i += 1) {
                            nu[i] = derez(value[i], path + '[' + i + ']', currDepth - 1);
                        }
                    } else {

                        nu = {};
                        for (name in value) {
                            if (Object.prototype.hasOwnProperty.call(value, name)) {
                                nu[name] = derez(value[name],
                                        path + '[' + JSON.stringify(name) + ']', currDepth - 1);
                            }
                        }
                    }
                    return nu;
                }
                return value;
            }(object, '$', maxDepth));
        };
    }


    if (typeof JSON.retrocycle !== 'function') {
        JSON.retrocycle = function retrocycle($) {
            'use strict';

            var px =
                    /^\$(?:\[(?:\d+|\"(?:[^\\\"\u0000-\u001f]|\\([\\\"\/bfnrt]|u[0-9a-zA-Z]{4}))*\")\])*$/;

            (function rez(value) {

                var i, item, name, path;

                if (value && typeof value === 'object') {
                    if (Object.prototype.toString.apply(value) === '[object Array]') {
                        for (i = 0; i < value.length; i += 1) {
                            item = value[i];
                            if (item && typeof item === 'object') {
                                path = item.$ref;
                                if (typeof path === 'string' && px.test(path)) {
                                    value[i] = eval(path);
                                } else {
                                    rez(item);
                                }
                            }
                        }
                    } else {
                        for (name in value) {
                            if (typeof value[name] === 'object') {
                                item = value[name];
                                if (item) {
                                    path = item.$ref;
                                    if (typeof path === 'string' && px.test(path)) {
                                        value[name] = eval(path);
                                    } else {
                                        rez(item);
                                    }
                                }
                            }
                        }
                    }
                }
            }($));
            return $;
        };
    }
})();


(function() {
    if (typeof Element !== 'undefined') {
        Element.prototype.serializeWithStyles = function() {

            // Mapping between tag names and css default values lookup tables. This allows to exclude default values in the result.
            var defaultStylesByTagName = {};

            // Styles inherited from style sheets will not be rendered for elements with these tag names
            var noStyleTags = {"BASE": true, "HEAD": true, "HTML": true, "META": true, "NOFRAME": true, "NOSCRIPT": true, "PARAM": true, "SCRIPT": true, "STYLE": true, "TITLE": true};

            // This list determines which css default values lookup tables are precomputed at load time
            // Lookup tables for other tag names will be automatically built at runtime if needed
            var tagNames = ["A", "ABBR", "ADDRESS", "AREA", "ARTICLE", "ASIDE", "AUDIO", "B", "BASE", "BDI", "BDO", "BLOCKQUOTE", "BODY", "BR", "BUTTON", "CANVAS", "CAPTION", "CENTER", "CITE", "CODE", "COL", "COLGROUP", "COMMAND", "DATALIST", "DD", "DEL", "DETAILS", "DFN", "DIV", "DL", "DT", "EM", "EMBED", "FIELDSET", "FIGCAPTION", "FIGURE", "FONT", "FOOTER", "FORM", "H1", "H2", "H3", "H4", "H5", "H6", "HEAD", "HEADER", "HGROUP", "HR", "HTML", "I", "IFRAME", "IMG", "INPUT", "INS", "KBD", "KEYGEN", "LABEL", "LEGEND", "LI", "LINK", "MAP", "MARK", "MATH", "MENU", "META", "METER", "NAV", "NOBR", "NOSCRIPT", "OBJECT", "OL", "OPTION", "OPTGROUP", "OUTPUT", "P", "PARAM", "PRE", "PROGRESS", "Q", "RP", "RT", "RUBY", "S", "SAMP", "SCRIPT", "SECTION", "SELECT", "SMALL", "SOURCE", "SPAN", "STRONG", "STYLE", "SUB", "SUMMARY", "SUP", "SVG", "TABLE", "TBODY", "TD", "TEXTAREA", "TFOOT", "TH", "THEAD", "TIME", "TITLE", "TR", "TRACK", "U", "UL", "VAR", "VIDEO", "WBR"];

            // Precompute the lookup tables.
            for (var i = 0; i < tagNames.length; i++) {
                if (!noStyleTags[tagNames[i]]) {
                    defaultStylesByTagName[tagNames[i]] = computeDefaultStyleByTagName(tagNames[i]);
                }
            }

            function computeDefaultStyleByTagName(tagName) {
                var defaultStyle = {};
                var element = document.body.appendChild(document.createElement(tagName));
                var computedStyle = getComputedStyle(element);
                for (var i = 0; i < computedStyle.length; i++) {
                    defaultStyle[computedStyle[i]] = computedStyle[computedStyle[i]];
                }
                document.body.removeChild(element);
                return defaultStyle;
            }

            function getDefaultStyleByTagName(tagName) {
                tagName = tagName.toUpperCase();
                if (!defaultStylesByTagName[tagName]) {
                    defaultStylesByTagName[tagName] = computeDefaultStyleByTagName(tagName);
                }
                return defaultStylesByTagName[tagName];
            }

            return function serializeWithStyles() {
                if (this.nodeType !== Node.ELEMENT_NODE) {
                    throw new TypeError();
                }
                var cssTexts = [];
                var elements = this.querySelectorAll("*");
                for (var i = 0; i < elements.length; i++) {
                    var e = elements[i];
                    if (!noStyleTags[e.tagName]) {
                        var computedStyle = getComputedStyle(e);
                        var defaultStyle = getDefaultStyleByTagName(e.tagName);
                        cssTexts[i] = e.style.cssText;
                        for (var ii = 0; ii < computedStyle.length; ii++) {
                            var cssPropName = computedStyle[ii];
                            if (computedStyle[cssPropName] !== defaultStyle[cssPropName]) {
                                e.style[cssPropName] = computedStyle[cssPropName];
                            }
                        }
                    }
                }
                var result = this.outerHTML;
                for (var i = 0; i < elements.length; i++) {
                    elements[i].style.cssText = cssTexts[i];
                }
                return result;
            }
        };
    }
})();

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


createGuid = function() {
    return 'xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};


/*
 * Finds the element in array and removes
 * @param {mixed} elem Elements itself
 * @param {boolean} splice if true removes completely and shifts the index of others
 * @returns {undefined}
 */
Array.prototype.removeElement = function(elem, splice) {
    splice = typeof splice !== 'undefined' ? splice : true;
    var index = this.indexOf(elem);
    if (index != -1)
        if (splice)
            this.splice(index, 1);
        else
            delete this[index];
};
/**
 * Finds an element according to given function when returns true
 
 
 */

if (!Array.prototype.find) {
    Array.prototype.find = function(f) {
        for (var i = 0; i < this.length; i++) {
            if (f(this[i], i)) {
                return this[i];
            }
        }
        return false;
    };
}

Array.prototype.diff = function(that) {
    return {
        enter: $(that).not(this).get(),
        exit: $(this).not(that).get()
    };
};