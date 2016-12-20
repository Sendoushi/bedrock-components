'use strict';
/* global Promise */

import $ from 'jquery';
import axios from 'axios';
import component from 'bedrock/src/component.js';
import merge from 'lodash/merge.js';

const DEFAULTS = {
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
const isQuery = (val, query) => {
    if (typeof val !== 'string') {
        return false;
    } else if (query === '') {
        return true;
    }

    val = val.toLowerCase();
    query = query.toLowerCase();

    return val.indexOf(query) !== -1;
};

/**
 * Request external data
 * @param  {object} comp
 * @param  {string} url
 * @param  {string} query
 * @return {promise}
 */
const reqExternalData = (comp, url, query) => axios.get(url.replace(comp.queryParam, query));

/**
 * Requester internal data
 * @param  {object} comp
 * @param  {array} data
 * @param  {string} query
 * @return {promise}
 */
const reqInternalData = (comp, data, query) => {
    const newData = data.filter((val) => {
        let keys = Object.keys(val);

        // Check for the query in the various types...
        if (isQuery(val, query)) {
            return true;
        } else if (typeof val === 'object' && val.hasOwnProperty('length')) {
            for (let i = 0; i < val.length; i += 1) {
                if (isQuery(val[i], query)) {
                    return true;
                }
            }
        } else if (typeof val === 'object') {
            keys = Object.keys(val);

            for (let i = 0; i < keys.length; i += 1) {
                if (isQuery(val[keys[i]], query)) {
                    return true;
                }
            }
        }
    });

    const promise = new Promise(resolve => resolve(newData));

    return promise;
};

/**
 * Gets render data
 * @param  {object} comp
 * @return {object}
 */
const getRenderData = (comp) => {
    const data = [];

    // Go through the sources
    for (let i = 0; i < comp.sources.length; i += 1) {
        const source = comp.sources[i];

        if (!source.reqData || !source.reqData.length) {
            continue;
        }

        // Lets create the new object
        data.push(merge({}, { sourceIndex: i, data: source.reqData }, source));
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
};

/**
 * Close
 * @param  {object} comp
 * @return {object}
 */
const close = (comp) => {
    comp.el.removeClass(comp.classes.isActive);
    comp.input.trigger(comp.events.close);

    return comp;
};

/**
 * Handles item select
 * @param  {object} comp
 * @param  {event} evt
 */
const onItem = (comp, evt) => {
    comp.throttler && clearTimeout(comp.throttler);

    evt.stopPropagation();

    comp.el.trigger(comp.events.selected, $(evt.currentTarget));

    if (!evt.defaultPrevented) {
        close(comp);
    }
};

/**
 * Handles show all click event
 * @param  {object} comp
 * @param  {event} evt
 */
const onShowAll = (comp, evt) => {
    comp.throttler && clearTimeout(comp.throttler);

    evt.preventDefault();
    evt.stopPropagation();
    comp.el.addClass(comp.classes.hasAll);
};

/**
 * Handles show all click event
 * @param  {object} comp
 * @param  {event} evt
 */
const onShowLess = (comp, evt) => {
    comp.throttler && clearTimeout(comp.throttler);

    evt.preventDefault();
    evt.stopPropagation();
    comp.el.removeClass(comp.classes.hasAll);
};

/**
 * Opens
 * @param  {object} comp
 * @return {object}
 */
const open = (comp) => {
    const tmpl = comp.tmpl(getRenderData(comp));
    const oldClasses = [
        comp.classes.hasError,
        comp.classes.hasErrorMinChars,
        comp.classes.hasErrorNoResults
    ];
    const newClasses = [
        (comp.err ? comp.err : ''),
        comp.classes.isActive
    ];

    comp.throttler && clearTimeout(comp.throttler);

    comp.el.html(tmpl);
    comp.el.removeClass(oldClasses.join(' '));
    comp.el.addClass(newClasses.join(' '));

    // Cache items
    comp.els.items = comp.el.find(`.${comp.classes.item}`);
    comp.els.showAll = comp.el.find(`.${comp.classes.showAll}`);
    comp.els.showLess = comp.el.find(`.${comp.classes.showLess}`);

    // Set items event
    comp.els.items.on('click.completer', onItem.bind(null, comp));
    comp.els.showAll.on('click.completer', onShowAll.bind(null, comp));
    comp.els.showLess.on('click.completer', onShowLess.bind(null, comp));

    // Inform
    comp.input.trigger(comp.events.open);

    return comp;
};

/**
 * Updates data
 * @param  {object} comp
 * @param  {string} query
 * @param  {boolean} setOpen
 * @return {promise}
 */
const updateData = (comp, query, setOpen) => {
    const promise = new Promise((resolve, reject) => {
        let promiseAll = 0;
        let promiseCount = 0;
        let promiseRejected;
        let promiseSource;

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
        for (let i = 0; i < comp.sources.length; i += 1) {
            const source = comp.sources[i];

            if (promiseRejected) {
                break;
            }

            promiseAll += 1;
            if (source.url) {
                promiseSource = reqExternalData(comp, source.url, query);
            } else {
                promiseSource = reqInternalData(comp, source.data, query);
            }

            /* eslint-disable no-loop-func, prefer-arrow-callback */
            promiseSource.then(function (index, data) {
                promiseCount += 1;
                comp.sources[index].reqData = data;

                if (promiseCount === promiseAll) {
                    return resolve(comp);
                }
            }.bind(null, i))
            .catch((err) => {
                promiseRejected = err;
                comp.err = err;
                return reject(comp);
            });
            /* eslint-enable no-loop-func, prefer-arrow-callback */
        }

        // Maybe there weren't promises to comply
        if (promiseCount === promiseAll) {
            return resolve(comp);
        }
    })
    .then((promiseComp) => {
        setOpen && open(comp);

        return promiseComp;
    })
    .catch((promiseComp) => {
        // The error will handeled by the template
        setOpen && open(comp);

        return promiseComp;
    });

    return promise;
};

/**
 * Handles click event
 * @param  {object} comp
 * @param  {event} evt
 */
const onClick = (comp, evt) => {
    const val = comp.input.val();

    evt.stopPropagation();

    if (!evt.defaultPrevented) {
        updateData(comp, val, true);
    }
};

/**
 * Handles key event
 * @param  {object} comp
 * @param  {event} evt
 */
const onKey = (comp, evt) => {
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
    comp.throttler = setTimeout(() => onClick(comp, evt), comp.keyThrottle);
};

/**
 * Handles blur event
 * @param  {object} comp
 * @param  {event} evt
 */
const onBlur = (comp, evt) => {
    comp.throttler && clearTimeout(comp.throttler);
    comp.throttler = setTimeout(() => {
        if (!evt.defaultPrevented) {
            comp.el.trigger(comp.events.blur, comp);
            close(comp);
        }
    }, comp.blurThrottle);
};

/**
 * Destroys
 * @param  {object} comp
 */
const destroy = (comp) => {
    comp.throttler && clearTimeout(comp.throttler);

    comp.input.off('keyup.completer');
    comp.input.off('focus.completer');
    comp.input.off('blur.completer');
    comp.input.off('click.completer');
    comp.el.off('click.completer');
    $(document.body).off('click.completer');

    comp.input.trigger(comp.events.destroy);
    component.destroy(comp);
};

/**
 * Creates a modal
 * @param  {object} comp
 * @return {object}
 */
const init = (comp) => {
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

        comp.el.on('click.completer', (evt) => {
            comp.throttler && clearTimeout(comp.throttler);

            evt.preventDefault();
            evt.stopPropagation();
        });
        $(document.body).on('click.completer', onBlur.bind(null, comp));
    }

    return comp;
};

// --------------------------------
// Export

export default {
    init: (el, data) => {
        let comp = component.getComp(data, DEFAULTS);
        comp = component.init(el, comp);

        // Elements need to be set out other way
        comp.input = data.input || el.find(`.${comp.classes.input}`);

        return (!el || !el.length) ? comp : init(comp);
    },
    destroy
};
