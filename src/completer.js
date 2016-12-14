/* eslint-disable strict */'use strict';/* eslint-enable strict */
/* global Promise */

var $ = require('jquery');
var deepMixIn = require('mout/object/deepMixIn.js');
var component = require('bedrock/src/component.js');
var req = require('bedrock/utils/req.js');

var DEFAULTS = {
    input: null,
    tmpl: '',
    keyThrottle: 250,
    blurThrottle: 250,
    maxResults: 5,
    minChars: 3,
    dontAuto: false,
    data: null,
    sources: [],
    queryParam: 'QUERY',
    classes: {
        input: 'completer__input',
        showAll: 'completer__show--all',
        showLess: 'completer__show--less',
        item: 'completer__item',
        hasAll: 'has-all',
        hasError: 'has-error',
        hasErrorMinChars: 'has-error has-error--min-chars',
        hasErrorNoResults: 'has-error has-error--no-results',
        isActive: 'is-active'
    },
    events: {
        open: 'completer.open',
        blur: 'completer.blur',
        close: 'completer.close',
        destroy: 'completer.destroy',
        selected: 'completer.selected'
    }
};

require('es6-promise').polyfill();

// --------------------------------
// Functions

/**
 * Checks if query is in val
 * @param  {string} val
 * @param  {string} query
 * @return {Boolean}
 */
function isQuery(val, query) {
    if (typeof val !== 'string') {
        return false;
    } else if (query === '') {
        return true;
    }

    val = val.toLowerCase();
    query = query.toLowerCase();

    return val.replace(query, '') !== val;
}

/**
 * Request external data
 * @param  {object} comp
 * @param  {string} url
 * @param  {string} query
 * @return {promise}
 */
function reqExternalData(comp, url, query) {
    return req.get(url.replace(comp.queryParam, query), 'GET');
}

/**
 * Requester internal data
 * @param  {object} comp
 * @param  {array} data
 * @param  {string} query
 * @return {promise}
 */
function reqInternalData(comp, data, query) {
    var newData = data.filter(function (val) {
        var keys = Object.keys(val);
        var i;

        // Check for the query in the various types...
        if (isQuery(val, query)) {
            return true;
        } else if (typeof val === 'object' && val.hasOwnProperty('length')) {
            for (i = 0; i < val.length; i += 1) {
                if (isQuery(val[i], query)) {
                    return true;
                }
            }
        } else if (typeof val === 'object') {
            keys = Object.keys(val);

            for (i = 0; i < keys.length; i += 1) {
                if (isQuery(val[keys[i]], query)) {
                    return true;
                }
            }
        }
    });

    var promise = new Promise(function (resolve) {
        resolve(newData);
    });

    return promise;
}

/**
 * Gets render data
 * @param  {object} comp
 * @return {object}
 */
function getRenderData(comp) {
    var data = [];
    var source;
    var i;

    // Go through the sources
    for (i = 0; i < comp.sources.length; i += 1) {
        source = comp.sources[i];

        if (!source.reqData || !source.reqData.length) {
            continue;
        }

        // Lets create the new object
        data.push(deepMixIn({}, {
            sourceIndex: i,
            data: source.reqData
        }, source));
    }

    // Are there no results?
    if (!comp.err && !data.length) {
        comp.err = comp.classes.hasErrorNoResults;
    }

    // Cache new data
    comp.data = data;

    return {
        max: comp.maxResults,
        minChars: comp.minChars,
        data: comp.data,
        query: comp.query,
        err: comp.err
    };
}

/**
 * Close
 * @param  {object} comp
 * @return {object}
 */
function close(comp) {
    comp.el.removeClass(comp.classes.isActive);
    comp.input.trigger(comp.events.close);

    return comp;
}

/**
 * Handles item select
 * @param  {object} comp
 * @param  {event} evt
 */
function onItem(comp, evt) {
    comp.throttler && clearTimeout(comp.throttler);

    evt.stopPropagation();

    comp.el.trigger(comp.events.selected, $(evt.currentTarget));

    if (!evt.defaultPrevented) {
        close(comp);
    }
}

/**
 * Handles show all click event
 * @param  {object} comp
 * @param  {event} evt
 */
function onShowAll(comp, evt) {
    comp.throttler && clearTimeout(comp.throttler);

    evt.preventDefault();
    evt.stopPropagation();
    comp.el.addClass(comp.classes.hasAll);
}

/**
 * Handles show all click event
 * @param  {object} comp
 * @param  {event} evt
 */
function onShowLess(comp, evt) {
    comp.throttler && clearTimeout(comp.throttler);

    evt.preventDefault();
    evt.stopPropagation();
    comp.el.removeClass(comp.classes.hasAll);
}

/**
 * Opens
 * @param  {object} comp
 * @return {object}
 */
function open(comp) {
    var tmpl = comp.tmpl(getRenderData(comp));
    var oldClasses = [
        comp.classes.hasError,
        comp.classes.hasErrorMinChars,
        comp.classes.hasErrorNoResults
    ];
    var newClasses = [
        (comp.err ? comp.err : ''),
        comp.classes.isActive
    ];

    comp.throttler && clearTimeout(comp.throttler);

    comp.el.html(tmpl);
    comp.el.removeClass(oldClasses.join(' '));
    comp.el.addClass(newClasses.join(' '));

    // Cache items
    comp.els.items = comp.el.find('.' + comp.classes.item);
    comp.els.showAll = comp.el.find('.' + comp.classes.showAll);
    comp.els.showLess = comp.el.find('.' + comp.classes.showLess);

    // Set items event
    comp.els.items.on('click', onItem.bind(null, comp));
    comp.els.showAll.on('click', onShowAll.bind(null, comp));
    comp.els.showLess.on('click', onShowLess.bind(null, comp));

    // Inform
    comp.input.trigger(comp.events.open);

    return comp;
}

/**
 * Updates data
 * @param  {object} comp
 * @param  {string} query
 * @param  {boolean} setOpen
 * @return {promise}
 */
function updateData(comp, query, setOpen) {
    var promise = new Promise(function (resolve, reject) {
        var promiseAll = 0;
        var promiseCount = 0;
        var promiseRejected;
        var promiseSource;
        var source;
        var i;

        // Reset variables
        comp.err = null;
        comp.data = null;
        comp.query = query;

        // Check for query errors
        if (query.length < comp.minChars) {
            comp.err = comp.classes.hasErrorMinChars;

            return resolve(comp);
        }

        // Lets go through sources
        for (i = 0; i < comp.sources.length; i += 1) {
            source = comp.sources[i];

            if (promiseRejected) {
                break;
            }

            promiseAll += 1;
            if (source.url) {
                promiseSource = reqExternalData(comp, source.url, query);
            } else {
                promiseSource = reqInternalData(comp, source.data, query);
            }

            /* eslint-disable no-loop-func */
            promiseSource.then(function (index, data) {
                promiseCount += 1;
                comp.sources[index].reqData = data;

                if (promiseCount === promiseAll) {
                    return resolve(comp);
                }
            }.bind(null, i))
            .catch(function (err) {
                promiseRejected = err;
                comp.err = err;
                return reject(comp);
            });
            /* eslint-enable no-loop-func */
        }

        // Maybe there weren't promises to comply
        if (promiseCount === promiseAll) {
            return resolve(comp);
        }
    })
    .then(function (promiseComp) {
        setOpen && open(comp);

        return promiseComp;
    })
    .catch(function (promiseComp) {
        // The error will handeled by the template
        setOpen && open(comp);

        return promiseComp;
    });

    return promise;
}

/**
 * Handles click event
 * @param  {object} comp
 * @param  {event} evt
 */
function onClick(comp, evt) {
    var val = comp.input.val();

    evt.stopPropagation();

    if (!evt.defaultPrevented) {
        updateData(comp, val, true);
    }
}

/**
 * Handles key event
 * @param  {object} comp
 * @param  {event} evt
 */
function onKey(comp, evt) {
    evt.stopPropagation();

    // TODO: Need to solve the ENTER!!!
    if (!evt.defaultPrevented && evt.keyCode === 27 || !evt.keyCode) {
        return close(comp);
    } else if (!evt.defaultPrevented && evt.keyCode === 13) {
        // TODO: Not working!
        evt.preventDefault();
        // return close(comp);
    }

    comp.throttler && clearTimeout(comp.throttler);
    comp.throttler = setTimeout(function () {
        // Let click handle as usual
        onClick(comp, evt);
    }, comp.keyThrottle);
}

/**
 * Handles blur event
 * @param  {object} comp
 * @param  {event} evt
 */
function onBlur(comp, evt) {
    comp.throttler && clearTimeout(comp.throttler);
    comp.throttler = setTimeout(function () {
        if (!evt.defaultPrevented) {
            comp.el.trigger(comp.events.blur, comp);
            close(comp);
        }
    }, comp.blurThrottle);
}

/**
 * Destroys
 * @param  {object} comp
 */
function destroy(comp) {
    comp.throttler && clearTimeout(comp.throttler);

    comp.input.off('keyup.completer');
    comp.input.off('focus.completer');
    comp.input.off('blur.completer');
    comp.input.off('click.completer');
    comp.el.off('click.completer');
    $(document.body).off('click.completer');

    comp.input.trigger(comp.events.destroy);
    component.destroy(comp);
}

/**
 * Creates a modal
 * @param  {object} comp
 * @return {object}
 */
function init(comp) {
    // Input shouldn't have autocompletion from browser
    comp.input.attr('autocomplete', 'off');

    // Set events
    if (!comp.dontAuto) {
        comp.input.on('keyup.completer', onKey.bind(null, comp));
        comp.input.on('focus.completer', onKey.bind(null, comp));
        comp.input.on('blur.completer', onBlur.bind(null, comp));
        if (comp.minChars === 0) {
            comp.input.on('click.completer', onClick.bind(null, comp));
        }

        comp.el.on('click.completer', function (evt) {
            comp.throttler && clearTimeout(comp.throttler);

            evt.preventDefault();
            evt.stopPropagation();
        });
        $(document.body).on('click.completer', onBlur.bind(null, comp));
    }

    return comp;
}

// --------------------------------
// Export

module.exports = {
    init: function (el, data) {
        var comp = component.getComp(data, DEFAULTS);
        comp = component.init(el, comp);

        // Elements need to be set out other way
        comp.input = data.input || el.find('.' + comp.classes.input);

        return init(comp);
    },
    destroy: destroy
};
