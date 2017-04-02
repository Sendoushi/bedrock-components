'use strict';
/* global Promise */

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _jquery = require('jquery');

var _jquery2 = _interopRequireDefault(_jquery);

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _component = require('bedrock/src/component.js');

var _component2 = _interopRequireDefault(_component);

var _merge = require('lodash/merge.js');

var _merge2 = _interopRequireDefault(_merge);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
var isQuery = function isQuery(val, query) {
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
var reqExternalData = function reqExternalData(comp, url, query) {
    return _axios2.default.get(url.replace(comp.queryParam, query));
};

/**
 * Requester internal data
 * @param  {object} comp
 * @param  {array} data
 * @param  {string} query
 * @return {promise}
 */
var reqInternalData = function reqInternalData(comp, data, query) {
    var newData = data.filter(function (val) {
        var keys = Object.keys(val);

        // Check for the query in the various types...
        if (isQuery(val, query)) {
            return true;
        } else if ((typeof val === 'undefined' ? 'undefined' : _typeof(val)) === 'object' && val.hasOwnProperty('length')) {
            for (var i = 0; i < val.length; i += 1) {
                if (isQuery(val[i], query)) {
                    return true;
                }
            }
        } else if ((typeof val === 'undefined' ? 'undefined' : _typeof(val)) === 'object') {
            keys = Object.keys(val);

            for (var _i = 0; _i < keys.length; _i += 1) {
                if (isQuery(val[keys[_i]], query)) {
                    return true;
                }
            }
        }
    });

    var promise = new Promise(function (resolve) {
        return resolve(newData);
    });

    return promise;
};

/**
 * Gets render data
 * @param  {object} comp
 * @return {object}
 */
var getRenderData = function getRenderData(comp) {
    var data = [];

    // Go through the sources
    for (var i = 0; i < comp.sources.length; i += 1) {
        var source = comp.sources[i];

        if (!source.reqData || !source.reqData.length) {
            continue;
        }

        // Lets create the new object
        data.push((0, _merge2.default)({}, { sourceIndex: i, data: source.reqData }, source));
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
var close = function close(comp) {
    comp.el.removeClass(comp.classes.isActive);
    comp.input.trigger(comp.events.close);

    return comp;
};

/**
 * Handles item select
 * @param  {object} comp
 * @param  {event} evt
 */
var onItem = function onItem(comp, evt) {
    comp.throttler && clearTimeout(comp.throttler);

    evt.stopPropagation();

    comp.el.trigger(comp.events.selected, (0, _jquery2.default)(evt.currentTarget));

    if (!evt.defaultPrevented) {
        close(comp);
    }
};

/**
 * Handles show all click event
 * @param  {object} comp
 * @param  {event} evt
 */
var onShowAll = function onShowAll(comp, evt) {
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
var onShowLess = function onShowLess(comp, evt) {
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
var open = function open(comp) {
    var tmpl = comp.tmpl(getRenderData(comp));
    var oldClasses = [comp.classes.hasError, comp.classes.hasErrorMinChars, comp.classes.hasErrorNoResults];
    var newClasses = [comp.err ? comp.err : '', comp.classes.isActive];

    comp.throttler && clearTimeout(comp.throttler);

    comp.el.html(tmpl);
    comp.el.removeClass(oldClasses.join(' '));
    comp.el.addClass(newClasses.join(' '));

    // Cache items
    comp.els.items = comp.el.find('.' + comp.classes.item);
    comp.els.showAll = comp.el.find('.' + comp.classes.showAll);
    comp.els.showLess = comp.el.find('.' + comp.classes.showLess);

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
var updateData = function updateData(comp, query, setOpen) {
    var promise = new Promise(function (resolve, reject) {
        var promiseAll = 0;
        var promiseCount = 0;
        var promiseRejected = void 0;
        var promiseSource = void 0;

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
        for (var i = 0; i < comp.sources.length; i += 1) {
            var source = comp.sources[i];

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
            }.bind(null, i)).catch(function (err) {
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
    }).then(function (promiseComp) {
        setOpen && open(comp);

        return promiseComp;
    }).catch(function (promiseComp) {
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
var onClick = function onClick(comp, evt) {
    var val = comp.input.val();

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
var onKey = function onKey(comp, evt) {
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
        return onClick(comp, evt);
    }, comp.keyThrottle);
};

/**
 * Handles blur event
 * @param  {object} comp
 * @param  {event} evt
 */
var onBlur = function onBlur(comp, evt) {
    comp.throttler && clearTimeout(comp.throttler);
    comp.throttler = setTimeout(function () {
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
var destroy = function destroy(comp) {
    comp.throttler && clearTimeout(comp.throttler);

    comp.input.off('keyup.completer');
    comp.input.off('focus.completer');
    comp.input.off('blur.completer');
    comp.input.off('click.completer');
    comp.el.off('click.completer');
    (0, _jquery2.default)(document.body).off('click.completer');

    comp.input.trigger(comp.events.destroy);
    _component2.default.destroy(comp);
};

/**
 * Creates a modal
 * @param  {object} comp
 * @return {object}
 */
var _init = function _init(comp) {
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
        (0, _jquery2.default)(document.body).on('click.completer', onBlur.bind(null, comp));
    }

    return comp;
};

// --------------------------------
// Export

exports.default = {
    init: function init(el, data) {
        var comp = _component2.default.getComp(data, DEFAULTS);
        comp = _component2.default.init(el, comp);

        // Elements need to be set out other way
        comp.input = data.input || el.find('.' + comp.classes.input);

        return !el || !el.length ? comp : _init(comp);
    },
    destroy: destroy
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jb21wbGV0ZXIuanMiXSwibmFtZXMiOlsiREVGQVVMVFMiLCJpbnB1dCIsInRtcGwiLCJrZXlUaHJvdHRsZSIsImJsdXJUaHJvdHRsZSIsIm1heFJlc3VsdHMiLCJtaW5DaGFycyIsImRvbnRBdXRvIiwiZGF0YSIsInNvdXJjZXMiLCJxdWVyeVBhcmFtIiwiY2xhc3NlcyIsInNob3dBbGwiLCJzaG93TGVzcyIsIml0ZW0iLCJoYXNBbGwiLCJoYXNFcnJvciIsImhhc0Vycm9yTWluQ2hhcnMiLCJoYXNFcnJvck5vUmVzdWx0cyIsImlzQWN0aXZlIiwiZXZlbnRzIiwib3BlbiIsImJsdXIiLCJjbG9zZSIsImRlc3Ryb3kiLCJzZWxlY3RlZCIsInJlcXVpcmUiLCJwb2x5ZmlsbCIsImlzUXVlcnkiLCJ2YWwiLCJxdWVyeSIsInRvTG93ZXJDYXNlIiwiaW5kZXhPZiIsInJlcUV4dGVybmFsRGF0YSIsImNvbXAiLCJ1cmwiLCJnZXQiLCJyZXBsYWNlIiwicmVxSW50ZXJuYWxEYXRhIiwibmV3RGF0YSIsImZpbHRlciIsImtleXMiLCJPYmplY3QiLCJoYXNPd25Qcm9wZXJ0eSIsImkiLCJsZW5ndGgiLCJwcm9taXNlIiwiUHJvbWlzZSIsInJlc29sdmUiLCJnZXRSZW5kZXJEYXRhIiwic291cmNlIiwicmVxRGF0YSIsInB1c2giLCJzb3VyY2VJbmRleCIsImVyciIsIm1heCIsImVsIiwicmVtb3ZlQ2xhc3MiLCJ0cmlnZ2VyIiwib25JdGVtIiwiZXZ0IiwidGhyb3R0bGVyIiwiY2xlYXJUaW1lb3V0Iiwic3RvcFByb3BhZ2F0aW9uIiwiY3VycmVudFRhcmdldCIsImRlZmF1bHRQcmV2ZW50ZWQiLCJvblNob3dBbGwiLCJwcmV2ZW50RGVmYXVsdCIsImFkZENsYXNzIiwib25TaG93TGVzcyIsIm9sZENsYXNzZXMiLCJuZXdDbGFzc2VzIiwiaHRtbCIsImpvaW4iLCJlbHMiLCJpdGVtcyIsImZpbmQiLCJvbiIsImJpbmQiLCJ1cGRhdGVEYXRhIiwic2V0T3BlbiIsInJlamVjdCIsInByb21pc2VBbGwiLCJwcm9taXNlQ291bnQiLCJwcm9taXNlUmVqZWN0ZWQiLCJwcm9taXNlU291cmNlIiwidGhlbiIsImluZGV4IiwiY2F0Y2giLCJwcm9taXNlQ29tcCIsIm9uQ2xpY2siLCJvbktleSIsImtleUNvZGUiLCJzZXRUaW1lb3V0Iiwib25CbHVyIiwib2ZmIiwiZG9jdW1lbnQiLCJib2R5IiwiaW5pdCIsImF0dHIiLCJnZXRDb21wIl0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBOzs7Ozs7OztBQUVBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7QUFFQSxJQUFNQSxXQUFXO0FBQ2JDLFdBQU8sSUFETTtBQUViQyxVQUFNLEVBRk87QUFHYkMsaUJBQWEsR0FIQTtBQUliQyxrQkFBYyxHQUpEO0FBS2JDLGdCQUFZLENBTEM7QUFNYkMsY0FBVSxDQU5HO0FBT2JDLGNBQVUsS0FQRztBQVFiQyxVQUFNLElBUk87QUFTYkMsYUFBUyxFQVRJO0FBVWJDLGdCQUFZLE9BVkM7QUFXYkMsYUFBUztBQUNMVixlQUFPLGtCQURGO0FBRUxXLGlCQUFTLHNCQUZKO0FBR0xDLGtCQUFVLHVCQUhMO0FBSUxDLGNBQU0saUJBSkQ7QUFLTEMsZ0JBQVEsU0FMSDtBQU1MQyxrQkFBVSxXQU5MO0FBT0xDLDBCQUFrQixnQ0FQYjtBQVFMQywyQkFBbUIsaUNBUmQ7QUFTTEMsa0JBQVU7QUFUTCxLQVhJO0FBc0JiQyxZQUFRO0FBQ0pDLGNBQU0sZ0JBREY7QUFFSkMsY0FBTSxnQkFGRjtBQUdKQyxlQUFPLGlCQUhIO0FBSUpDLGlCQUFTLG1CQUpMO0FBS0pDLGtCQUFVO0FBTE47QUF0QkssQ0FBakI7O0FBK0JBQyxRQUFRLGFBQVIsRUFBdUJDLFFBQXZCOztBQUVBO0FBQ0E7O0FBRUE7Ozs7OztBQU1BLElBQU1DLFVBQVUsU0FBVkEsT0FBVSxDQUFDQyxHQUFELEVBQU1DLEtBQU4sRUFBZ0I7QUFDNUIsUUFBSSxPQUFPRCxHQUFQLEtBQWUsUUFBbkIsRUFBNkI7QUFDekIsZUFBTyxL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akIsQ0FBb0IsaUJBQXBCLEVBQXVDaUIsT0FBT2hCLElBQVAsQ0FBWSxJQUFaLEVBQWtCNUMsSUFBbEIsQ0FBdkM7QUFDSDs7QUFFRCxXQUFPQSxJQUFQO0FBQ0gsQ0F2QkQ7O0FBeUJBO0FBQ0E7O2tCQUVlO0FBQ1hnRSxVQUFNLGNBQUMxQyxFQUFELEVBQUtoRCxJQUFMLEVBQWM7QUFDaEIsWUFBSTBCLE9BQU8sb0JBQVVrRSxPQUFWLENBQWtCNUYsSUFBbEIsRUFBd0JSLFFBQXhCLENBQVg7QUFDQWtDLGVBQU8sb0JBQVVnRSxJQUFWLENBQWUxQyxFQUFmLEVBQW1CdEIsSUFBbkIsQ0FBUDs7QUFFQTtBQUNBQSxhQUFLakMsS0FBTCxHQUFhTyxLQUFLUCxLQUFMLElBQWN1RCxHQUFHb0IsSUFBSCxPQUFZMUMsS0FBS3ZCLE9BQUwsQ0FBYVYsS0FBekIsQ0FBM0I7O0FBRUEsZUFBUSxDQUFDdUQsRUFBRCxJQUFPLENBQUNBLEdBQUdYLE1BQVosR0FBc0JYLElBQXRCLEdBQTZCZ0UsTUFBS2hFLElBQUwsQ0FBcEM7QUFDSCxLQVRVO0FBVVhWO0FBVlcsQyIsImZpbGUiOiJjb21wbGV0ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG4vKiBnbG9iYWwgUHJvbWlzZSAqL1xuXG5pbXBvcnQgJCBmcm9tICdqcXVlcnknO1xuaW1wb3J0IGF4aW9zIGZyb20gJ2F4aW9zJztcbmltcG9ydCBjb21wb25lbnQgZnJvbSAnYmVkcm9jay9zcmMvY29tcG9uZW50LmpzJztcbmltcG9ydCBtZXJnZSBmcm9tICdsb2Rhc2gvbWVyZ2UuanMnO1xuXG5jb25zdCBERUZBVUxUUyA9IHtcbiAgICBpbnB1dDogbnVsbCxcbiAgICB0bXBsOiAnJyxcbiAgICBrZXlUaHJvdHRsZTogMjUwLFxuICAgIGJsdXJUaHJvdHRsZTogMjUwLFxuICAgIG1heFJlc3VsdHM6IDUsXG4gICAgbWluQ2hhcnM6IDMsXG4gICAgZG9udEF1dG86IGZhbHNlLFxuICAgIGRhdGE6IG51bGwsXG4gICAgc291cmNlczogW10sXG4gICAgcXVlcnlQYXJhbTogJ1FVRVJZJyxcbiAgICBjbGFzc2VzOiB7XG4gICAgICAgIGlucHV0OiAnY29tcGxldGVyX19pbnB1dCcsXG4gICAgICAgIHNob3dBbGw6ICdjb21wbGV0ZXJfX3Nob3ctLWFsbCcsXG4gICAgICAgIHNob3dMZXNzOiAnY29tcGxldGVyX19zaG93LS1sZXNzJyxcbiAgICAgICAgaXRlbTogJ2NvbXBsZXRlcl9faXRlbScsXG4gICAgICAgIGhhc0FsbDogJ2hhcy1hbGwnLFxuICAgICAgICBoYXNFcnJvcjogJ2hhcy1lcnJvcicsXG4gICAgICAgIGhhc0Vycm9yTWluQ2hhcnM6ICdoYXMtZXJyb3IgaGFzLWVycm9yLS1taW4tY2hhcnMnLFxuICAgICAgICBoYXNFcnJvck5vUmVzdWx0czogJ2hhcy1lcnJvciBoYXMtZXJyb3ItLW5vLXJlc3VsdHMnLFxuICAgICAgICBpc0FjdGl2ZTogJ2lzLWFjdGl2ZSdcbiAgICB9LFxuICAgIGV2ZW50czoge1xuICAgICAgICBvcGVuOiAnY29tcGxldGVyLm9wZW4nLFxuICAgICAgICBibHVyOiAnY29tcGxldGVyLmJsdXInLFxuICAgICAgICBjbG9zZTogJ2NvbXBsZXRlci5jbG9zZScsXG4gICAgICAgIGRlc3Ryb3k6ICdjb21wbGV0ZXIuZGVzdHJveScsXG4gICAgICAgIHNlbGVjdGVkOiAnY29tcGxldGVyLnNlbGVjdGVkJ1xuICAgIH1cbn07XG5cbnJlcXVpcmUoJ2VzNi1wcm9taXNlJykucG9seWZpbGwoKTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEZ1bmN0aW9uc1xuXG4vKipcbiAqIENoZWNrcyBpZiBxdWVyeSBpcyBpbiB2YWxcbiAqIEBwYXJhbSAge3N0cmluZ30gdmFsXG4gKiBAcGFyYW0gIHtzdHJpbmd9IHF1ZXJ5XG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5jb25zdCBpc1F1ZXJ5ID0gKHZhbCwgcXVlcnkpID0+IHtcbiAgICBpZiAodHlwZW9mIHZhbCAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0gZWxzZSBpZiAocXVlcnkgPT09ICcnKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHZhbCA9IHZhbC50b0xvd2VyQ2FzZSgpO1xuICAgIHF1ZXJ5ID0gcXVlcnkudG9Mb3dlckNhc2UoKTtcblxuICAgIHJldHVybiB2YWwuaW5kZXhPZihxdWVyeSkgIT09IC0xO1xufTtcblxuLyoqXG4gKiBSZXF1ZXN0IGV4dGVybmFsIGRhdGFcbiAqIEBwYXJhbSAge29iamVjdH0gY29tcFxuICogQHBhcmFtICB7c3RyaW5nfSB1cmxcbiAqIEBwYXJhbSAge3N0cmluZ30gcXVlcnlcbiAqIEByZXR1cm4ge3Byb21pc2V9XG4gKi9cbmNvbnN0IHJlcUV4dGVybmFsRGF0YSA9IChjb21wLCB1cmwsIHF1ZXJ5KSA9PiBheGlvcy5nZXQodXJsLnJlcGxhY2UoY29tcC5xdWVyeVBhcmFtLCBxdWVyeSkpO1xuXG4vKipcbiAqIFJlcXVlc3RlciBpbnRlcm5hbCBkYXRhXG4gKiBAcGFyYW0gIHtvYmplY3R9IGNvbXBcbiAqIEBwYXJhbSAge2FycmF5fSBkYXRhXG4gKiBAcGFyYW0gIHtzdHJpbmd9IHF1ZXJ5XG4gKiBAcmV0dXJuIHtwcm9taXNlfVxuICovXG5jb25zdCByZXFJbnRlcm5hbERhdGEgPSAoY29tcCwgZGF0YSwgcXVlcnkpID0+IHtcbiAgICBjb25zdCBuZXdEYXRhID0gZGF0YS5maWx0ZXIoKHZhbCkgPT4ge1xuICAgICAgICBsZXQga2V5cyA9IE9iamVjdC5rZXlzKHZhbCk7XG5cbiAgICAgICAgLy8gQ2hlY2sgZm9yIHRoZSBxdWVyeSBpbiB0aGUgdmFyaW91cyB0eXBlcy4uLlxuICAgICAgICBpZiAoaXNRdWVyeSh2YWwsIHF1ZXJ5KSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbCA9PT0gJ29iamVjdCcgJiYgdmFsLmhhc093blByb3BlcnR5KCdsZW5ndGgnKSkge1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB2YWwubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICBpZiAoaXNRdWVyeSh2YWxbaV0sIHF1ZXJ5KSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbCA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIGtleXMgPSBPYmplY3Qua2V5cyh2YWwpO1xuXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICBpZiAoaXNRdWVyeSh2YWxba2V5c1tpXV0sIHF1ZXJ5KSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGNvbnN0IHByb21pc2UgPSBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHJlc29sdmUobmV3RGF0YSkpO1xuXG4gICAgcmV0dXJuIHByb21pc2U7XG59O1xuXG4vKipcbiAqIEdldHMgcmVuZGVyIGRhdGFcbiAqIEBwYXJhbSAge29iamVjdH0gY29tcFxuICogQHJldHVybiB7b2JqZWN0fVxuICovXG5jb25zdCBnZXRSZW5kZXJEYXRhID0gKGNvbXApID0+IHtcbiAgICBjb25zdCBkYXRhID0gW107XG5cbiAgICAvLyBHbyB0aHJvdWdoIHRoZSBzb3VyY2VzXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb21wLnNvdXJjZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgY29uc3Qgc291cmNlID0gY29tcC5zb3VyY2VzW2ldO1xuXG4gICAgICAgIGlmICghc291cmNlLnJlcURhdGEgfHwgIXNvdXJjZS5yZXFEYXRhLmxlbmd0aCkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBMZXRzIGNyZWF0ZSB0aGUgbmV3IG9iamVjdFxuICAgICAgICBkYXRhLnB1c2gobWVyZ2Uoe30sIHsgc291cmNlSW5kZXg6IGksIGRhdGE6IHNvdXJjZS5yZXFEYXRhIH0sIHNvdXJjZSkpO1xuICAgIH1cblxuICAgIC8vIEFyZSB0aGVyZSBubyByZXN1bHRzP1xuICAgIGlmICghY29tcC5lcnIgJiYgIWRhdGEubGVuZ3RoKSB7XG4gICAgICAgIGNvbXAuZXJyID0gY29tcC5jbGFzc2VzLmhhc0Vycm9yTm9SZXN1bHRzO1xuICAgIH1cblxuICAgIC8vIENhY2hlIG5ldyBkYXRhXG4gICAgY29tcC5kYXRhID0gZGF0YTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIG1heDogY29tcC5tYXhSZXN1bHRzLFxuICAgICAgICBtaW5DaGFyczogY29tcC5taW5DaGFycyxcbiAgICAgICAgZGF0YTogY29tcC5kYXRhLFxuICAgICAgICBxdWVyeTogY29tcC5xdWVyeSxcbiAgICAgICAgZXJyOiBjb21wLmVyclxuICAgIH07XG59O1xuXG4vKipcbiAqIENsb3NlXG4gKiBAcGFyYW0gIHtvYmplY3R9IGNvbXBcbiAqIEByZXR1cm4ge29iamVjdH1cbiAqL1xuY29uc3QgY2xvc2UgPSAoY29tcCkgPT4ge1xuICAgIGNvbXAuZWwucmVtb3ZlQ2xhc3MoY29tcC5jbGFzc2VzLmlzQWN0aXZlKTtcbiAgICBjb21wLmlucHV0LnRyaWdnZXIoY29tcC5ldmVudHMuY2xvc2UpO1xuXG4gICAgcmV0dXJuIGNvbXA7XG59O1xuXG4vKipcbiAqIEhhbmRsZXMgaXRlbSBzZWxlY3RcbiAqIEBwYXJhbSAge29iamVjdH0gY29tcFxuICogQHBhcmFtICB7ZXZlbnR9IGV2dFxuICovXG5jb25zdCBvbkl0ZW0gPSAoY29tcCwgZXZ0KSA9PiB7XG4gICAgY29tcC50aHJvdHRsZXIgJiYgY2xlYXJUaW1lb3V0KGNvbXAudGhyb3R0bGVyKTtcblxuICAgIGV2dC5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgIGNvbXAuZWwudHJpZ2dlcihjb21wLmV2ZW50cy5zZWxlY3RlZCwgJChldnQuY3VycmVudFRhcmdldCkpO1xuXG4gICAgaWYgKCFldnQuZGVmYXVsdFByZXZlbnRlZCkge1xuICAgICAgICBjbG9zZShjb21wKTtcbiAgICB9XG59O1xuXG4vKipcbiAqIEhhbmRsZXMgc2hvdyBhbGwgY2xpY2sgZXZlbnRcbiAqIEBwYXJhbSAge29iamVjdH0gY29tcFxuICogQHBhcmFtICB7ZXZlbnR9IGV2dFxuICovXG5jb25zdCBvblNob3dBbGwgPSAoY29tcCwgZXZ0KSA9PiB7XG4gICAgY29tcC50aHJvdHRsZXIgJiYgY2xlYXJUaW1lb3V0KGNvbXAudGhyb3R0bGVyKTtcblxuICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGV2dC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICBjb21wLmVsLmFkZENsYXNzKGNvbXAuY2xhc3Nlcy5oYXNBbGwpO1xufTtcblxuLyoqXG4gKiBIYW5kbGVzIHNob3cgYWxsIGNsaWNrIGV2ZW50XG4gKiBAcGFyYW0gIHtvYmplY3R9IGNvbXBcbiAqIEBwYXJhbSAge2V2ZW50fSBldnRcbiAqL1xuY29uc3Qgb25TaG93TGVzcyA9IChjb21wLCBldnQpID0+IHtcbiAgICBjb21wLnRocm90dGxlciAmJiBjbGVhclRpbWVvdXQoY29tcC50aHJvdHRsZXIpO1xuXG4gICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG4gICAgZXZ0LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIGNvbXAuZWwucmVtb3ZlQ2xhc3MoY29tcC5jbGFzc2VzLmhhc0FsbCk7XG59O1xuXG4vKipcbiAqIE9wZW5zXG4gKiBAcGFyYW0gIHtvYmplY3R9IGNvbXBcbiAqIEByZXR1cm4ge29iamVjdH1cbiAqL1xuY29uc3Qgb3BlbiA9IChjb21wKSA9PiB7XG4gICAgY29uc3QgdG1wbCA9IGNvbXAudG1wbChnZXRSZW5kZXJEYXRhKGNvbXApKTtcbiAgICBjb25zdCBvbGRDbGFzc2VzID0gW1xuICAgICAgICBjb21wLmNsYXNzZXMuaGFzRXJyb3IsXG4gICAgICAgIGNvbXAuY2xhc3Nlcy5oYXNFcnJvck1pbkNoYXJzLFxuICAgICAgICBjb21wLmNsYXNzZXMuaGFzRXJyb3JOb1Jlc3VsdHNcbiAgICBdO1xuICAgIGNvbnN0IG5ld0NsYXNzZXMgPSBbXG4gICAgICAgIChjb21wLmVyciA/IGNvbXAuZXJyIDogJycpLFxuICAgICAgICBjb21wLmNsYXNzZXMuaXNBY3RpdmVcbiAgICBdO1xuXG4gICAgY29tcC50aHJvdHRsZXIgJiYgY2xlYXJUaW1lb3V0KGNvbXAudGhyb3R0bGVyKTtcblxuICAgIGNvbXAuZWwuaHRtbCh0bXBsKTtcbiAgICBjb21wLmVsLnJlbW92ZUNsYXNzKG9sZENsYXNzZXMuam9pbignICcpKTtcbiAgICBjb21wLmVsLmFkZENsYXNzKG5ld0NsYXNzZXMuam9pbignICcpKTtcblxuICAgIC8vIENhY2hlIGl0ZW1zXG4gICAgY29tcC5lbHMuaXRlbXMgPSBjb21wLmVsLmZpbmQoYC4ke2NvbXAuY2xhc3Nlcy5pdGVtfWApO1xuICAgIGNvbXAuZWxzLnNob3dBbGwgPSBjb21wLmVsLmZpbmQoYC4ke2NvbXAuY2xhc3Nlcy5zaG93QWxsfWApO1xuICAgIGNvbXAuZWxzLnNob3dMZXNzID0gY29tcC5lbC5maW5kKGAuJHtjb21wLmNsYXNzZXMuc2hvd0xlc3N9YCk7XG5cbiAgICAvLyBTZXQgaXRlbXMgZXZlbnRcbiAgICBjb21wLmVscy5pdGVtcy5vbignY2xpY2suY29tcGxldGVyJywgb25JdGVtLmJpbmQobnVsbCwgY29tcCkpO1xuICAgIGNvbXAuZWxzLnNob3dBbGwub24oJ2NsaWNrLmNvbXBsZXRlcicsIG9uU2hvd0FsbC5iaW5kKG51bGwsIGNvbXApKTtcbiAgICBjb21wLmVscy5zaG93TGVzcy5vbignY2xpY2suY29tcGxldGVyJywgb25TaG93TGVzcy5iaW5kKG51bGwsIGNvbXApKTtcblxuICAgIC8vIEluZm9ybVxuICAgIGNvbXAuaW5wdXQudHJpZ2dlcihjb21wLmV2ZW50cy5vcGVuKTtcblxuICAgIHJldHVybiBjb21wO1xufTtcblxuLyoqXG4gKiBVcGRhdGVzIGRhdGFcbiAqIEBwYXJhbSAge29iamVjdH0gY29tcFxuICogQHBhcmFtICB7c3RyaW5nfSBxdWVyeVxuICogQHBhcmFtICB7Ym9vbGVhbn0gc2V0T3BlblxuICogQHJldHVybiB7cHJvbWlzZX1cbiAqL1xuY29uc3QgdXBkYXRlRGF0YSA9IChjb21wLCBxdWVyeSwgc2V0T3BlbikgPT4ge1xuICAgIGNvbnN0IHByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGxldCBwcm9taXNlQWxsID0gMDtcbiAgICAgICAgbGV0IHByb21pc2VDb3VudCA9IDA7XG4gICAgICAgIGxldCBwcm9taXNlUmVqZWN0ZWQ7XG4gICAgICAgIGxldCBwcm9taXNlU291cmNlO1xuXG4gICAgICAgIC8vIFJlc2V0IHZhcmlhYmxlc1xuICAgICAgICBjb21wLmVyciA9IG51bGw7XG4gICAgICAgIGNvbXAuZGF0YSA9IG51bGw7XG4gICAgICAgIGNvbXAucXVlcnkgPSBxdWVyeTtcblxuICAgICAgICAvLyBDaGVjayBmb3IgcXVlcnkgZXJyb3JzXG4gICAgICAgIGlmIChxdWVyeS5sZW5ndGggPCBjb21wLm1pbkNoYXJzKSB7XG4gICAgICAgICAgICBjb21wLmVyciA9IGNvbXAuY2xhc3Nlcy5oYXNFcnJvck1pbkNoYXJzO1xuXG4gICAgICAgICAgICByZXR1cm4gcmVzb2x2ZShjb21wKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIExldHMgZ28gdGhyb3VnaCBzb3VyY2VzXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29tcC5zb3VyY2VzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICBjb25zdCBzb3VyY2UgPSBjb21wLnNvdXJjZXNbaV07XG5cbiAgICAgICAgICAgIGlmIChwcm9taXNlUmVqZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcHJvbWlzZUFsbCArPSAxO1xuICAgICAgICAgICAgaWYgKHNvdXJjZS51cmwpIHtcbiAgICAgICAgICAgICAgICBwcm9taXNlU291cmNlID0gcmVxRXh0ZXJuYWxEYXRhKGNvbXAsIHNvdXJjZS51cmwsIHF1ZXJ5KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcHJvbWlzZVNvdXJjZSA9IHJlcUludGVybmFsRGF0YShjb21wLCBzb3VyY2UuZGF0YSwgcXVlcnkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby1sb29wLWZ1bmMsIHByZWZlci1hcnJvdy1jYWxsYmFjayAqL1xuICAgICAgICAgICAgcHJvbWlzZVNvdXJjZS50aGVuKGZ1bmN0aW9uIChpbmRleCwgZGF0YSkge1xuICAgICAgICAgICAgICAgIHByb21pc2VDb3VudCArPSAxO1xuICAgICAgICAgICAgICAgIGNvbXAuc291cmNlc1tpbmRleF0ucmVxRGF0YSA9IGRhdGE7XG5cbiAgICAgICAgICAgICAgICBpZiAocHJvbWlzZUNvdW50ID09PSBwcm9taXNlQWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXNvbHZlKGNvbXApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0uYmluZChudWxsLCBpKSlcbiAgICAgICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgcHJvbWlzZVJlamVjdGVkID0gZXJyO1xuICAgICAgICAgICAgICAgIGNvbXAuZXJyID0gZXJyO1xuICAgICAgICAgICAgICAgIHJldHVybiByZWplY3QoY29tcCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8qIGVzbGludC1lbmFibGUgbm8tbG9vcC1mdW5jLCBwcmVmZXItYXJyb3ctY2FsbGJhY2sgKi9cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE1heWJlIHRoZXJlIHdlcmVuJ3QgcHJvbWlzZXMgdG8gY29tcGx5XG4gICAgICAgIGlmIChwcm9taXNlQ291bnQgPT09IHByb21pc2VBbGwpIHtcbiAgICAgICAgICAgIHJldHVybiByZXNvbHZlKGNvbXApO1xuICAgICAgICB9XG4gICAgfSlcbiAgICAudGhlbigocHJvbWlzZUNvbXApID0+IHtcbiAgICAgICAgc2V0T3BlbiAmJiBvcGVuKGNvbXApO1xuXG4gICAgICAgIHJldHVybiBwcm9taXNlQ29tcDtcbiAgICB9KVxuICAgIC5jYXRjaCgocHJvbWlzZUNvbXApID0+IHtcbiAgICAgICAgLy8gVGhlIGVycm9yIHdpbGwgaGFuZGVsZWQgYnkgdGhlIHRlbXBsYXRlXG4gICAgICAgIHNldE9wZW4gJiYgb3Blbihjb21wKTtcblxuICAgICAgICByZXR1cm4gcHJvbWlzZUNvbXA7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gcHJvbWlzZTtcbn07XG5cbi8qKlxuICogSGFuZGxlcyBjbGljayBldmVudFxuICogQHBhcmFtICB7b2JqZWN0fSBjb21wXG4gKiBAcGFyYW0gIHtldmVudH0gZXZ0XG4gKi9cbmNvbnN0IG9uQ2xpY2sgPSAoY29tcCwgZXZ0KSA9PiB7XG4gICAgY29uc3QgdmFsID0gY29tcC5pbnB1dC52YWwoKTtcblxuICAgIGV2dC5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgIGlmICghZXZ0LmRlZmF1bHRQcmV2ZW50ZWQpIHtcbiAgICAgICAgdXBkYXRlRGF0YShjb21wLCB2YWwsIHRydWUpO1xuICAgIH1cbn07XG5cbi8qKlxuICogSGFuZGxlcyBrZXkgZXZlbnRcbiAqIEBwYXJhbSAge29iamVjdH0gY29tcFxuICogQHBhcmFtICB7ZXZlbnR9IGV2dFxuICovXG5jb25zdCBvbktleSA9IChjb21wLCBldnQpID0+IHtcbiAgICBldnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAvLyBUT0RPOiBOZWVkIHRvIHNvbHZlIHRoZSBFTlRFUiEhIVxuICAgIGlmICghZXZ0LmRlZmF1bHRQcmV2ZW50ZWQgJiYgZXZ0LmtleUNvZGUgPT09IDI3IHx8ICFldnQua2V5Q29kZSkge1xuICAgICAgICByZXR1cm4gY2xvc2UoY29tcCk7XG4gICAgfSBlbHNlIGlmICghZXZ0LmRlZmF1bHRQcmV2ZW50ZWQgJiYgZXZ0LmtleUNvZGUgPT09IDEzKSB7XG4gICAgICAgIC8vIFRPRE86IE5vdCB3b3JraW5nIVxuICAgICAgICBldnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgLy8gcmV0dXJuIGNsb3NlKGNvbXApO1xuICAgIH1cblxuICAgIGNvbXAudGhyb3R0bGVyICYmIGNsZWFyVGltZW91dChjb21wLnRocm90dGxlcik7XG4gICAgY29tcC50aHJvdHRsZXIgPSBzZXRUaW1lb3V0KCgpID0+IG9uQ2xpY2soY29tcCwgZXZ0KSwgY29tcC5rZXlUaHJvdHRsZSk7XG59O1xuXG4vKipcbiAqIEhhbmRsZXMgYmx1ciBldmVudFxuICogQHBhcmFtICB7b2JqZWN0fSBjb21wXG4gKiBAcGFyYW0gIHtldmVudH0gZXZ0XG4gKi9cbmNvbnN0IG9uQmx1ciA9IChjb21wLCBldnQpID0+IHtcbiAgICBjb21wLnRocm90dGxlciAmJiBjbGVhclRpbWVvdXQoY29tcC50aHJvdHRsZXIpO1xuICAgIGNvbXAudGhyb3R0bGVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGlmICghZXZ0LmRlZmF1bHRQcmV2ZW50ZWQpIHtcbiAgICAgICAgICAgIGNvbXAuZWwudHJpZ2dlcihjb21wLmV2ZW50cy5ibHVyLCBjb21wKTtcbiAgICAgICAgICAgIGNsb3NlKGNvbXApO1xuICAgICAgICB9XG4gICAgfSwgY29tcC5ibHVyVGhyb3R0bGUpO1xufTtcblxuLyoqXG4gKiBEZXN0cm95c1xuICogQHBhcmFtICB7b2JqZWN0fSBjb21wXG4gKi9cbmNvbnN0IGRlc3Ryb3kgPSAoY29tcCkgPT4ge1xuICAgIGNvbXAudGhyb3R0bGVyICYmIGNsZWFyVGltZW91dChjb21wLnRocm90dGxlcik7XG5cbiAgICBjb21wLmlucHV0Lm9mZigna2V5dXAuY29tcGxldGVyJyk7XG4gICAgY29tcC5pbnB1dC5vZmYoJ2ZvY3VzLmNvbXBsZXRlcicpO1xuICAgIGNvbXAuaW5wdXQub2ZmKCdibHVyLmNvbXBsZXRlcicpO1xuICAgIGNvbXAuaW5wdXQub2ZmKCdjbGljay5jb21wbGV0ZXInKTtcbiAgICBjb21wLmVsLm9mZignY2xpY2suY29tcGxldGVyJyk7XG4gICAgJChkb2N1bWVudC5ib2R5KS5vZmYoJ2NsaWNrLmNvbXBsZXRlcicpO1xuXG4gICAgY29tcC5pbnB1dC50cmlnZ2VyKGNvbXAuZXZlbnRzLmRlc3Ryb3kpO1xuICAgIGNvbXBvbmVudC5kZXN0cm95KGNvbXApO1xufTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbW9kYWxcbiAqIEBwYXJhbSAge29iamVjdH0gY29tcFxuICogQHJldHVybiB7b2JqZWN0fVxuICovXG5jb25zdCBpbml0ID0gKGNvbXApID0+IHtcbiAgICAvLyBJbnB1dCBzaG91bGRuJ3QgaGF2ZSBhdXRvY29tcGxldGlvbiBmcm9tIGJyb3dzZXJcbiAgICBjb21wLmlucHV0LmF0dHIoJ2F1dG9jb21wbGV0ZScsICdvZmYnKTtcblxuICAgIC8vIFNldCBldmVudHNcbiAgICBpZiAoIWNvbXAuZG9udEF1dG8pIHtcbiAgICAgICAgY29tcC5pbnB1dC5vbigna2V5dXAuY29tcGxldGVyJywgb25LZXkuYmluZChudWxsLCBjb21wKSk7XG4gICAgICAgIGNvbXAuaW5wdXQub24oJ2ZvY3VzLmNvbXBsZXRlcicsIG9uS2V5LmJpbmQobnVsbCwgY29tcCkpO1xuICAgICAgICBjb21wLmlucHV0Lm9uKCdibHVyLmNvbXBsZXRlcicsIG9uQmx1ci5iaW5kKG51bGwsIGNvbXApKTtcbiAgICAgICAgaWYgKGNvbXAubWluQ2hhcnMgPT09IDApIHtcbiAgICAgICAgICAgIGNvbXAuaW5wdXQub24oJ2NsaWNrLmNvbXBsZXRlcicsIG9uQ2xpY2suYmluZChudWxsLCBjb21wKSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb21wLmVsLm9uKCdjbGljay5jb21wbGV0ZXInLCAoZXZ0KSA9PiB7XG4gICAgICAgICAgICBjb21wLnRocm90dGxlciAmJiBjbGVhclRpbWVvdXQoY29tcC50aHJvdHRsZXIpO1xuXG4gICAgICAgICAgICBldnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGV2dC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgfSk7XG4gICAgICAgICQoZG9jdW1lbnQuYm9keSkub24oJ2NsaWNrLmNvbXBsZXRlcicsIG9uQmx1ci5iaW5kKG51bGwsIGNvbXApKTtcbiAgICB9XG5cbiAgICByZXR1cm4gY29tcDtcbn07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBFeHBvcnRcblxuZXhwb3J0IGRlZmF1bHQge1xuICAgIGluaXQ6IChlbCwgZGF0YSkgPT4ge1xuICAgICAgICBsZXQgY29tcCA9IGNvbXBvbmVudC5nZXRDb21wKGRhdGEsIERFRkFVTFRTKTtcbiAgICAgICAgY29tcCA9IGNvbXBvbmVudC5pbml0KGVsLCBjb21wKTtcblxuICAgICAgICAvLyBFbGVtZW50cyBuZWVkIHRvIGJlIHNldCBvdXQgb3RoZXIgd2F5XG4gICAgICAgIGNvbXAuaW5wdXQgPSBkYXRhLmlucHV0IHx8IGVsLmZpbmQoYC4ke2NvbXAuY2xhc3Nlcy5pbnB1dH1gKTtcblxuICAgICAgICByZXR1cm4gKCFlbCB8fCAhZWwubGVuZ3RoKSA/IGNvbXAgOiBpbml0KGNvbXApO1xuICAgIH0sXG4gICAgZGVzdHJveVxufTtcbiJdfQ==