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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21wb25lbnRzL2NvbXBsZXRlci5qcyJdLCJuYW1lcyI6WyJERUZBVUxUUyIsImlucHV0IiwidG1wbCIsImtleVRocm90dGxlIiwiYmx1clRocm90dGxlIiwibWF4UmVzdWx0cyIsIm1pbkNoYXJzIiwiZG9udEF1dG8iLCJkYXRhIiwic291cmNlcyIsInF1ZXJ5UGFyYW0iLCJjbGFzc2VzIiwic2hvd0FsbCIsInNob3dMZXNzIiwiaXRlbSIsImhhc0FsbCIsImhhc0Vycm9yIiwiaGFzRXJyb3JNaW5DaGFycyIsImhhc0Vycm9yTm9SZXN1bHRzIiwiaXNBY3RpdmUiLCJldmVudHMiLCJvcGVuIiwiYmx1ciIsImNsb3NlIiwiZGVzdHJveSIsInNlbGVjdGVkIiwicmVxdWlyZSIsInBvbHlmaWxsIiwiaXNRdWVyeSIsInZhbCIsInF1ZXJ5IiwidG9Mb3dlckNhc2UiLCJpbmRleE9mIiwicmVxRXh0ZXJuYWxEYXRhIiwiY29tcCIsInVybCIsImdldCIsInJlcGxhY2UiLCJyZXFJbnRlcm5hbERhdGEiLCJuZXdEYXRhIiwiZmlsdGVyIiwia2V5cyIsIk9iamVjdCIsImhhc093blByb3BlcnR5IiwiaSIsImxlbmd0aCIsInByb21pc2UiLCJQcm9taXNlIiwicmVzb2x2ZSIsImdldFJlbmRlckRhdGEiLCJzb3VyY2UiLCJyZXFEYXRhIiwicHVzaCIsInNvdXJjZUluZGV4IiwiZXJyIiwibWF4IiwiZWwiLCJyZW1vdmVDbGFzcyIsInRyaWdnZXIiLCJvbkl0ZW0iLCJldnQiLCJ0aHJvdHRsZXIiLCJjbGVhclRpbWVvdXQiLCJzdG9wUHJvcGFnYXRpb24iLCJjdXJyZW50VGFyZ2V0IiwiZGVmYXVsdFByZXZlbnRlZCIsIm9uU2hvd0FsbCIsInByZXZlbnREZWZhdWx0IiwiYWRkQ2xhc3MiLCJvblNob3dMZXNzIiwib2xkQ2xhc3NlcyIsIm5ld0NsYXNzZXMiLCJodG1sIiwiam9pbiIsImVscyIsIml0ZW1zIiwiZmluZCIsIm9uIiwiYmluZCIsInVwZGF0ZURhdGEiLCJzZXRPcGVuIiwicmVqZWN0IiwicHJvbWlzZUFsbCIsInByb21pc2VDb3VudCIsInByb21pc2VSZWplY3RlZCIsInByb21pc2VTb3VyY2UiLCJ0aGVuIiwiaW5kZXgiLCJjYXRjaCIsInByb21pc2VDb21wIiwib25DbGljayIsIm9uS2V5Iiwia2V5Q29kZSIsInNldFRpbWVvdXQiLCJvbkJsdXIiLCJvZmYiLCJkb2N1bWVudCIsImJvZHkiLCJpbml0IiwiYXR0ciIsImdldENvbXAiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7Ozs7Ozs7O0FBRUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7OztBQUVBLElBQU1BLFdBQVc7QUFDYkMsV0FBTyxJQURNO0FBRWJDLFVBQU0sRUFGTztBQUdiQyxpQkFBYSxHQUhBO0FBSWJDLGtCQUFjLEdBSkQ7QUFLYkMsZ0JBQVksQ0FMQztBQU1iQyxjQUFVLENBTkc7QUFPYkMsY0FBVSxLQVBHO0FBUWJDLFVBQU0sSUFSTztBQVNiQyxhQUFTLEVBVEk7QUFVYkMsZ0JBQVksT0FWQztBQVdiQyxhQUFTO0FBQ0xWLGVBQU8sa0JBREY7QUFFTFcsaUJBQVMsc0JBRko7QUFHTEMsa0JBQVUsdUJBSEw7QUFJTEMsY0FBTSxpQkFKRDtBQUtMQyxnQkFBUSxTQUxIO0FBTUxDLGtCQUFVLFdBTkw7QUFPTEMsMEJBQWtCLGdDQVBiO0FBUUxDLDJCQUFtQixpQ0FSZDtBQVNMQyxrQkFBVTtBQVRMLEtBWEk7QUFzQmJDLFlBQVE7QUFDSkMsY0FBTSxnQkFERjtBQUVKQyxjQUFNLGdCQUZGO0FBR0pDLGVBQU8saUJBSEg7QUFJSkMsaUJBQVMsbUJBSkw7QUFLSkMsa0JBQVU7QUFMTjtBQXRCSyxDQUFqQjs7QUErQkFDLFFBQVEsYUFBUixFQUF1QkMsUUFBdkI7O0FBRUE7QUFDQTs7QUFFQTs7Ozs7O0FBTUEsSUFBTUMsVUFBVSxTQUFWQSxPQUFVLENBQUNDLEdBQUQsRUFBTUMsS0FBTixFQUFnQjtBQUM1QixRQUFJLE9BQU9ELEdBQVAsS0FBZSxRQUFuQixFQUE2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QVgsRUFBaUJwQixFQUFqQixDQUFvQixpQkFBcEIsRUFBdUNpQixPQUFPaEIsSUFBUCxDQUFZLElBQVosRUFBa0I1QyxJQUFsQixDQUF2QztBQUNIOztBQUVELFdBQU9BLElBQVA7QUFDSCxDQXZCRDs7QUF5QkE7QUFDQTs7a0JBRWU7QUFDWGdFLFVBQU0sY0FBQzFDLEVBQUQsRUFBS2hELElBQUwsRUFBYztBQUNoQixZQUFJMEIsT0FBTyxvQkFBVWtFLE9BQVYsQ0FBa0I1RixJQUFsQixFQUF3QlIsUUFBeEIsQ0FBWDtBQUNBa0MsZUFBTyxvQkFBVWdFLElBQVYsQ0FBZTFDLEVBQWYsRUFBbUJ0QixJQUFuQixDQUFQOztBQUVBO0FBQ0FBLGFBQUtqQyxLQUFMLEdBQWFPLEtBQUtQLEtBQUwsSUFBY3VELEdBQUdvQixJQUFILE9BQVkxQyxLQUFLdkIsT0FBTCxDQUFhVixLQUF6QixDQUEzQjs7QUFFQSxlQUFRLENBQUN1RCxFQUFELElBQU8sQ0FBQ0EsR0FBR1gsTUFBWixHQUFzQlgsSUFBdEIsR0FBNkJnRSxNQUFLaEUsSUFBTCxDQUFwQztBQUNILEtBVFU7QUFVWFY7QUFWVyxDIiwiZmlsZSI6ImNvbXBsZXRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0Jztcbi8qIGdsb2JhbCBQcm9taXNlICovXG5cbmltcG9ydCAkIGZyb20gJ2pxdWVyeSc7XG5pbXBvcnQgYXhpb3MgZnJvbSAnYXhpb3MnO1xuaW1wb3J0IGNvbXBvbmVudCBmcm9tICdiZWRyb2NrL3NyYy9jb21wb25lbnQuanMnO1xuaW1wb3J0IG1lcmdlIGZyb20gJ2xvZGFzaC9tZXJnZS5qcyc7XG5cbmNvbnN0IERFRkFVTFRTID0ge1xuICAgIGlucHV0OiBudWxsLFxuICAgIHRtcGw6ICcnLFxuICAgIGtleVRocm90dGxlOiAyNTAsXG4gICAgYmx1clRocm90dGxlOiAyNTAsXG4gICAgbWF4UmVzdWx0czogNSxcbiAgICBtaW5DaGFyczogMyxcbiAgICBkb250QXV0bzogZmFsc2UsXG4gICAgZGF0YTogbnVsbCxcbiAgICBzb3VyY2VzOiBbXSxcbiAgICBxdWVyeVBhcmFtOiAnUVVFUlknLFxuICAgIGNsYXNzZXM6IHtcbiAgICAgICAgaW5wdXQ6ICdjb21wbGV0ZXJfX2lucHV0JyxcbiAgICAgICAgc2hvd0FsbDogJ2NvbXBsZXRlcl9fc2hvdy0tYWxsJyxcbiAgICAgICAgc2hvd0xlc3M6ICdjb21wbGV0ZXJfX3Nob3ctLWxlc3MnLFxuICAgICAgICBpdGVtOiAnY29tcGxldGVyX19pdGVtJyxcbiAgICAgICAgaGFzQWxsOiAnaGFzLWFsbCcsXG4gICAgICAgIGhhc0Vycm9yOiAnaGFzLWVycm9yJyxcbiAgICAgICAgaGFzRXJyb3JNaW5DaGFyczogJ2hhcy1lcnJvciBoYXMtZXJyb3ItLW1pbi1jaGFycycsXG4gICAgICAgIGhhc0Vycm9yTm9SZXN1bHRzOiAnaGFzLWVycm9yIGhhcy1lcnJvci0tbm8tcmVzdWx0cycsXG4gICAgICAgIGlzQWN0aXZlOiAnaXMtYWN0aXZlJ1xuICAgIH0sXG4gICAgZXZlbnRzOiB7XG4gICAgICAgIG9wZW46ICdjb21wbGV0ZXIub3BlbicsXG4gICAgICAgIGJsdXI6ICdjb21wbGV0ZXIuYmx1cicsXG4gICAgICAgIGNsb3NlOiAnY29tcGxldGVyLmNsb3NlJyxcbiAgICAgICAgZGVzdHJveTogJ2NvbXBsZXRlci5kZXN0cm95JyxcbiAgICAgICAgc2VsZWN0ZWQ6ICdjb21wbGV0ZXIuc2VsZWN0ZWQnXG4gICAgfVxufTtcblxucmVxdWlyZSgnZXM2LXByb21pc2UnKS5wb2x5ZmlsbCgpO1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gRnVuY3Rpb25zXG5cbi8qKlxuICogQ2hlY2tzIGlmIHF1ZXJ5IGlzIGluIHZhbFxuICogQHBhcmFtICB7c3RyaW5nfSB2YWxcbiAqIEBwYXJhbSAge3N0cmluZ30gcXVlcnlcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKi9cbmNvbnN0IGlzUXVlcnkgPSAodmFsLCBxdWVyeSkgPT4ge1xuICAgIGlmICh0eXBlb2YgdmFsICE9PSAnc3RyaW5nJykge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSBlbHNlIGlmIChxdWVyeSA9PT0gJycpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgdmFsID0gdmFsLnRvTG93ZXJDYXNlKCk7XG4gICAgcXVlcnkgPSBxdWVyeS50b0xvd2VyQ2FzZSgpO1xuXG4gICAgcmV0dXJuIHZhbC5pbmRleE9mKHF1ZXJ5KSAhPT0gLTE7XG59O1xuXG4vKipcbiAqIFJlcXVlc3QgZXh0ZXJuYWwgZGF0YVxuICogQHBhcmFtICB7b2JqZWN0fSBjb21wXG4gKiBAcGFyYW0gIHtzdHJpbmd9IHVybFxuICogQHBhcmFtICB7c3RyaW5nfSBxdWVyeVxuICogQHJldHVybiB7cHJvbWlzZX1cbiAqL1xuY29uc3QgcmVxRXh0ZXJuYWxEYXRhID0gKGNvbXAsIHVybCwgcXVlcnkpID0+IGF4aW9zLmdldCh1cmwucmVwbGFjZShjb21wLnF1ZXJ5UGFyYW0sIHF1ZXJ5KSk7XG5cbi8qKlxuICogUmVxdWVzdGVyIGludGVybmFsIGRhdGFcbiAqIEBwYXJhbSAge29iamVjdH0gY29tcFxuICogQHBhcmFtICB7YXJyYXl9IGRhdGFcbiAqIEBwYXJhbSAge3N0cmluZ30gcXVlcnlcbiAqIEByZXR1cm4ge3Byb21pc2V9XG4gKi9cbmNvbnN0IHJlcUludGVybmFsRGF0YSA9IChjb21wLCBkYXRhLCBxdWVyeSkgPT4ge1xuICAgIGNvbnN0IG5ld0RhdGEgPSBkYXRhLmZpbHRlcigodmFsKSA9PiB7XG4gICAgICAgIGxldCBrZXlzID0gT2JqZWN0LmtleXModmFsKTtcblxuICAgICAgICAvLyBDaGVjayBmb3IgdGhlIHF1ZXJ5IGluIHRoZSB2YXJpb3VzIHR5cGVzLi4uXG4gICAgICAgIGlmIChpc1F1ZXJ5KHZhbCwgcXVlcnkpKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsID09PSAnb2JqZWN0JyAmJiB2YWwuaGFzT3duUHJvcGVydHkoJ2xlbmd0aCcpKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHZhbC5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgIGlmIChpc1F1ZXJ5KHZhbFtpXSwgcXVlcnkpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAga2V5cyA9IE9iamVjdC5rZXlzKHZhbCk7XG5cbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgIGlmIChpc1F1ZXJ5KHZhbFtrZXlzW2ldXSwgcXVlcnkpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgY29uc3QgcHJvbWlzZSA9IG5ldyBQcm9taXNlKHJlc29sdmUgPT4gcmVzb2x2ZShuZXdEYXRhKSk7XG5cbiAgICByZXR1cm4gcHJvbWlzZTtcbn07XG5cbi8qKlxuICogR2V0cyByZW5kZXIgZGF0YVxuICogQHBhcmFtICB7b2JqZWN0fSBjb21wXG4gKiBAcmV0dXJuIHtvYmplY3R9XG4gKi9cbmNvbnN0IGdldFJlbmRlckRhdGEgPSAoY29tcCkgPT4ge1xuICAgIGNvbnN0IGRhdGEgPSBbXTtcblxuICAgIC8vIEdvIHRocm91Z2ggdGhlIHNvdXJjZXNcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvbXAuc291cmNlcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBjb25zdCBzb3VyY2UgPSBjb21wLnNvdXJjZXNbaV07XG5cbiAgICAgICAgaWYgKCFzb3VyY2UucmVxRGF0YSB8fCAhc291cmNlLnJlcURhdGEubGVuZ3RoKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIExldHMgY3JlYXRlIHRoZSBuZXcgb2JqZWN0XG4gICAgICAgIGRhdGEucHVzaChtZXJnZSh7fSwgeyBzb3VyY2VJbmRleDogaSwgZGF0YTogc291cmNlLnJlcURhdGEgfSwgc291cmNlKSk7XG4gICAgfVxuXG4gICAgLy8gQXJlIHRoZXJlIG5vIHJlc3VsdHM/XG4gICAgaWYgKCFjb21wLmVyciAmJiAhZGF0YS5sZW5ndGgpIHtcbiAgICAgICAgY29tcC5lcnIgPSBjb21wLmNsYXNzZXMuaGFzRXJyb3JOb1Jlc3VsdHM7XG4gICAgfVxuXG4gICAgLy8gQ2FjaGUgbmV3IGRhdGFcbiAgICBjb21wLmRhdGEgPSBkYXRhO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgbWF4OiBjb21wLm1heFJlc3VsdHMsXG4gICAgICAgIG1pbkNoYXJzOiBjb21wLm1pbkNoYXJzLFxuICAgICAgICBkYXRhOiBjb21wLmRhdGEsXG4gICAgICAgIHF1ZXJ5OiBjb21wLnF1ZXJ5LFxuICAgICAgICBlcnI6IGNvbXAuZXJyXG4gICAgfTtcbn07XG5cbi8qKlxuICogQ2xvc2VcbiAqIEBwYXJhbSAge29iamVjdH0gY29tcFxuICogQHJldHVybiB7b2JqZWN0fVxuICovXG5jb25zdCBjbG9zZSA9IChjb21wKSA9PiB7XG4gICAgY29tcC5lbC5yZW1vdmVDbGFzcyhjb21wLmNsYXNzZXMuaXNBY3RpdmUpO1xuICAgIGNvbXAuaW5wdXQudHJpZ2dlcihjb21wLmV2ZW50cy5jbG9zZSk7XG5cbiAgICByZXR1cm4gY29tcDtcbn07XG5cbi8qKlxuICogSGFuZGxlcyBpdGVtIHNlbGVjdFxuICogQHBhcmFtICB7b2JqZWN0fSBjb21wXG4gKiBAcGFyYW0gIHtldmVudH0gZXZ0XG4gKi9cbmNvbnN0IG9uSXRlbSA9IChjb21wLCBldnQpID0+IHtcbiAgICBjb21wLnRocm90dGxlciAmJiBjbGVhclRpbWVvdXQoY29tcC50aHJvdHRsZXIpO1xuXG4gICAgZXZ0LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgY29tcC5lbC50cmlnZ2VyKGNvbXAuZXZlbnRzLnNlbGVjdGVkLCAkKGV2dC5jdXJyZW50VGFyZ2V0KSk7XG5cbiAgICBpZiAoIWV2dC5kZWZhdWx0UHJldmVudGVkKSB7XG4gICAgICAgIGNsb3NlKGNvbXApO1xuICAgIH1cbn07XG5cbi8qKlxuICogSGFuZGxlcyBzaG93IGFsbCBjbGljayBldmVudFxuICogQHBhcmFtICB7b2JqZWN0fSBjb21wXG4gKiBAcGFyYW0gIHtldmVudH0gZXZ0XG4gKi9cbmNvbnN0IG9uU2hvd0FsbCA9IChjb21wLCBldnQpID0+IHtcbiAgICBjb21wLnRocm90dGxlciAmJiBjbGVhclRpbWVvdXQoY29tcC50aHJvdHRsZXIpO1xuXG4gICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG4gICAgZXZ0LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIGNvbXAuZWwuYWRkQ2xhc3MoY29tcC5jbGFzc2VzLmhhc0FsbCk7XG59O1xuXG4vKipcbiAqIEhhbmRsZXMgc2hvdyBhbGwgY2xpY2sgZXZlbnRcbiAqIEBwYXJhbSAge29iamVjdH0gY29tcFxuICogQHBhcmFtICB7ZXZlbnR9IGV2dFxuICovXG5jb25zdCBvblNob3dMZXNzID0gKGNvbXAsIGV2dCkgPT4ge1xuICAgIGNvbXAudGhyb3R0bGVyICYmIGNsZWFyVGltZW91dChjb21wLnRocm90dGxlcik7XG5cbiAgICBldnQucHJldmVudERlZmF1bHQoKTtcbiAgICBldnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgY29tcC5lbC5yZW1vdmVDbGFzcyhjb21wLmNsYXNzZXMuaGFzQWxsKTtcbn07XG5cbi8qKlxuICogT3BlbnNcbiAqIEBwYXJhbSAge29iamVjdH0gY29tcFxuICogQHJldHVybiB7b2JqZWN0fVxuICovXG5jb25zdCBvcGVuID0gKGNvbXApID0+IHtcbiAgICBjb25zdCB0bXBsID0gY29tcC50bXBsKGdldFJlbmRlckRhdGEoY29tcCkpO1xuICAgIGNvbnN0IG9sZENsYXNzZXMgPSBbXG4gICAgICAgIGNvbXAuY2xhc3Nlcy5oYXNFcnJvcixcbiAgICAgICAgY29tcC5jbGFzc2VzLmhhc0Vycm9yTWluQ2hhcnMsXG4gICAgICAgIGNvbXAuY2xhc3Nlcy5oYXNFcnJvck5vUmVzdWx0c1xuICAgIF07XG4gICAgY29uc3QgbmV3Q2xhc3NlcyA9IFtcbiAgICAgICAgKGNvbXAuZXJyID8gY29tcC5lcnIgOiAnJyksXG4gICAgICAgIGNvbXAuY2xhc3Nlcy5pc0FjdGl2ZVxuICAgIF07XG5cbiAgICBjb21wLnRocm90dGxlciAmJiBjbGVhclRpbWVvdXQoY29tcC50aHJvdHRsZXIpO1xuXG4gICAgY29tcC5lbC5odG1sKHRtcGwpO1xuICAgIGNvbXAuZWwucmVtb3ZlQ2xhc3Mob2xkQ2xhc3Nlcy5qb2luKCcgJykpO1xuICAgIGNvbXAuZWwuYWRkQ2xhc3MobmV3Q2xhc3Nlcy5qb2luKCcgJykpO1xuXG4gICAgLy8gQ2FjaGUgaXRlbXNcbiAgICBjb21wLmVscy5pdGVtcyA9IGNvbXAuZWwuZmluZChgLiR7Y29tcC5jbGFzc2VzLml0ZW19YCk7XG4gICAgY29tcC5lbHMuc2hvd0FsbCA9IGNvbXAuZWwuZmluZChgLiR7Y29tcC5jbGFzc2VzLnNob3dBbGx9YCk7XG4gICAgY29tcC5lbHMuc2hvd0xlc3MgPSBjb21wLmVsLmZpbmQoYC4ke2NvbXAuY2xhc3Nlcy5zaG93TGVzc31gKTtcblxuICAgIC8vIFNldCBpdGVtcyBldmVudFxuICAgIGNvbXAuZWxzLml0ZW1zLm9uKCdjbGljay5jb21wbGV0ZXInLCBvbkl0ZW0uYmluZChudWxsLCBjb21wKSk7XG4gICAgY29tcC5lbHMuc2hvd0FsbC5vbignY2xpY2suY29tcGxldGVyJywgb25TaG93QWxsLmJpbmQobnVsbCwgY29tcCkpO1xuICAgIGNvbXAuZWxzLnNob3dMZXNzLm9uKCdjbGljay5jb21wbGV0ZXInLCBvblNob3dMZXNzLmJpbmQobnVsbCwgY29tcCkpO1xuXG4gICAgLy8gSW5mb3JtXG4gICAgY29tcC5pbnB1dC50cmlnZ2VyKGNvbXAuZXZlbnRzLm9wZW4pO1xuXG4gICAgcmV0dXJuIGNvbXA7XG59O1xuXG4vKipcbiAqIFVwZGF0ZXMgZGF0YVxuICogQHBhcmFtICB7b2JqZWN0fSBjb21wXG4gKiBAcGFyYW0gIHtzdHJpbmd9IHF1ZXJ5XG4gKiBAcGFyYW0gIHtib29sZWFufSBzZXRPcGVuXG4gKiBAcmV0dXJuIHtwcm9taXNlfVxuICovXG5jb25zdCB1cGRhdGVEYXRhID0gKGNvbXAsIHF1ZXJ5LCBzZXRPcGVuKSA9PiB7XG4gICAgY29uc3QgcHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgbGV0IHByb21pc2VBbGwgPSAwO1xuICAgICAgICBsZXQgcHJvbWlzZUNvdW50ID0gMDtcbiAgICAgICAgbGV0IHByb21pc2VSZWplY3RlZDtcbiAgICAgICAgbGV0IHByb21pc2VTb3VyY2U7XG5cbiAgICAgICAgLy8gUmVzZXQgdmFyaWFibGVzXG4gICAgICAgIGNvbXAuZXJyID0gbnVsbDtcbiAgICAgICAgY29tcC5kYXRhID0gbnVsbDtcbiAgICAgICAgY29tcC5xdWVyeSA9IHF1ZXJ5O1xuXG4gICAgICAgIC8vIENoZWNrIGZvciBxdWVyeSBlcnJvcnNcbiAgICAgICAgaWYgKHF1ZXJ5Lmxlbmd0aCA8IGNvbXAubWluQ2hhcnMpIHtcbiAgICAgICAgICAgIGNvbXAuZXJyID0gY29tcC5jbGFzc2VzLmhhc0Vycm9yTWluQ2hhcnM7XG5cbiAgICAgICAgICAgIHJldHVybiByZXNvbHZlKGNvbXApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTGV0cyBnbyB0aHJvdWdoIHNvdXJjZXNcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb21wLnNvdXJjZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgIGNvbnN0IHNvdXJjZSA9IGNvbXAuc291cmNlc1tpXTtcblxuICAgICAgICAgICAgaWYgKHByb21pc2VSZWplY3RlZCkge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBwcm9taXNlQWxsICs9IDE7XG4gICAgICAgICAgICBpZiAoc291cmNlLnVybCkge1xuICAgICAgICAgICAgICAgIHByb21pc2VTb3VyY2UgPSByZXFFeHRlcm5hbERhdGEoY29tcCwgc291cmNlLnVybCwgcXVlcnkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBwcm9taXNlU291cmNlID0gcmVxSW50ZXJuYWxEYXRhKGNvbXAsIHNvdXJjZS5kYXRhLCBxdWVyeSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLWxvb3AtZnVuYywgcHJlZmVyLWFycm93LWNhbGxiYWNrICovXG4gICAgICAgICAgICBwcm9taXNlU291cmNlLnRoZW4oZnVuY3Rpb24gKGluZGV4LCBkYXRhKSB7XG4gICAgICAgICAgICAgICAgcHJvbWlzZUNvdW50ICs9IDE7XG4gICAgICAgICAgICAgICAgY29tcC5zb3VyY2VzW2luZGV4XS5yZXFEYXRhID0gZGF0YTtcblxuICAgICAgICAgICAgICAgIGlmIChwcm9taXNlQ291bnQgPT09IHByb21pc2VBbGwpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUoY29tcCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfS5iaW5kKG51bGwsIGkpKVxuICAgICAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICBwcm9taXNlUmVqZWN0ZWQgPSBlcnI7XG4gICAgICAgICAgICAgICAgY29tcC5lcnIgPSBlcnI7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlamVjdChjb21wKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLyogZXNsaW50LWVuYWJsZSBuby1sb29wLWZ1bmMsIHByZWZlci1hcnJvdy1jYWxsYmFjayAqL1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTWF5YmUgdGhlcmUgd2VyZW4ndCBwcm9taXNlcyB0byBjb21wbHlcbiAgICAgICAgaWYgKHByb21pc2VDb3VudCA9PT0gcHJvbWlzZUFsbCkge1xuICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUoY29tcCk7XG4gICAgICAgIH1cbiAgICB9KVxuICAgIC50aGVuKChwcm9taXNlQ29tcCkgPT4ge1xuICAgICAgICBzZXRPcGVuICYmIG9wZW4oY29tcCk7XG5cbiAgICAgICAgcmV0dXJuIHByb21pc2VDb21wO1xuICAgIH0pXG4gICAgLmNhdGNoKChwcm9taXNlQ29tcCkgPT4ge1xuICAgICAgICAvLyBUaGUgZXJyb3Igd2lsbCBoYW5kZWxlZCBieSB0aGUgdGVtcGxhdGVcbiAgICAgICAgc2V0T3BlbiAmJiBvcGVuKGNvbXApO1xuXG4gICAgICAgIHJldHVybiBwcm9taXNlQ29tcDtcbiAgICB9KTtcblxuICAgIHJldHVybiBwcm9taXNlO1xufTtcblxuLyoqXG4gKiBIYW5kbGVzIGNsaWNrIGV2ZW50XG4gKiBAcGFyYW0gIHtvYmplY3R9IGNvbXBcbiAqIEBwYXJhbSAge2V2ZW50fSBldnRcbiAqL1xuY29uc3Qgb25DbGljayA9IChjb21wLCBldnQpID0+IHtcbiAgICBjb25zdCB2YWwgPSBjb21wLmlucHV0LnZhbCgpO1xuXG4gICAgZXZ0LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgaWYgKCFldnQuZGVmYXVsdFByZXZlbnRlZCkge1xuICAgICAgICB1cGRhdGVEYXRhKGNvbXAsIHZhbCwgdHJ1ZSk7XG4gICAgfVxufTtcblxuLyoqXG4gKiBIYW5kbGVzIGtleSBldmVudFxuICogQHBhcmFtICB7b2JqZWN0fSBjb21wXG4gKiBAcGFyYW0gIHtldmVudH0gZXZ0XG4gKi9cbmNvbnN0IG9uS2V5ID0gKGNvbXAsIGV2dCkgPT4ge1xuICAgIGV2dC5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgIC8vIFRPRE86IE5lZWQgdG8gc29sdmUgdGhlIEVOVEVSISEhXG4gICAgaWYgKCFldnQuZGVmYXVsdFByZXZlbnRlZCAmJiBldnQua2V5Q29kZSA9PT0gMjcgfHwgIWV2dC5rZXlDb2RlKSB7XG4gICAgICAgIHJldHVybiBjbG9zZShjb21wKTtcbiAgICB9IGVsc2UgaWYgKCFldnQuZGVmYXVsdFByZXZlbnRlZCAmJiBldnQua2V5Q29kZSA9PT0gMTMpIHtcbiAgICAgICAgLy8gVE9ETzogTm90IHdvcmtpbmchXG4gICAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAvLyByZXR1cm4gY2xvc2UoY29tcCk7XG4gICAgfVxuXG4gICAgY29tcC50aHJvdHRsZXIgJiYgY2xlYXJUaW1lb3V0KGNvbXAudGhyb3R0bGVyKTtcbiAgICBjb21wLnRocm90dGxlciA9IHNldFRpbWVvdXQoKCkgPT4gb25DbGljayhjb21wLCBldnQpLCBjb21wLmtleVRocm90dGxlKTtcbn07XG5cbi8qKlxuICogSGFuZGxlcyBibHVyIGV2ZW50XG4gKiBAcGFyYW0gIHtvYmplY3R9IGNvbXBcbiAqIEBwYXJhbSAge2V2ZW50fSBldnRcbiAqL1xuY29uc3Qgb25CbHVyID0gKGNvbXAsIGV2dCkgPT4ge1xuICAgIGNvbXAudGhyb3R0bGVyICYmIGNsZWFyVGltZW91dChjb21wLnRocm90dGxlcik7XG4gICAgY29tcC50aHJvdHRsZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgaWYgKCFldnQuZGVmYXVsdFByZXZlbnRlZCkge1xuICAgICAgICAgICAgY29tcC5lbC50cmlnZ2VyKGNvbXAuZXZlbnRzLmJsdXIsIGNvbXApO1xuICAgICAgICAgICAgY2xvc2UoY29tcCk7XG4gICAgICAgIH1cbiAgICB9LCBjb21wLmJsdXJUaHJvdHRsZSk7XG59O1xuXG4vKipcbiAqIERlc3Ryb3lzXG4gKiBAcGFyYW0gIHtvYmplY3R9IGNvbXBcbiAqL1xuY29uc3QgZGVzdHJveSA9IChjb21wKSA9PiB7XG4gICAgY29tcC50aHJvdHRsZXIgJiYgY2xlYXJUaW1lb3V0KGNvbXAudGhyb3R0bGVyKTtcblxuICAgIGNvbXAuaW5wdXQub2ZmKCdrZXl1cC5jb21wbGV0ZXInKTtcbiAgICBjb21wLmlucHV0Lm9mZignZm9jdXMuY29tcGxldGVyJyk7XG4gICAgY29tcC5pbnB1dC5vZmYoJ2JsdXIuY29tcGxldGVyJyk7XG4gICAgY29tcC5pbnB1dC5vZmYoJ2NsaWNrLmNvbXBsZXRlcicpO1xuICAgIGNvbXAuZWwub2ZmKCdjbGljay5jb21wbGV0ZXInKTtcbiAgICAkKGRvY3VtZW50LmJvZHkpLm9mZignY2xpY2suY29tcGxldGVyJyk7XG5cbiAgICBjb21wLmlucHV0LnRyaWdnZXIoY29tcC5ldmVudHMuZGVzdHJveSk7XG4gICAgY29tcG9uZW50LmRlc3Ryb3koY29tcCk7XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBtb2RhbFxuICogQHBhcmFtICB7b2JqZWN0fSBjb21wXG4gKiBAcmV0dXJuIHtvYmplY3R9XG4gKi9cbmNvbnN0IGluaXQgPSAoY29tcCkgPT4ge1xuICAgIC8vIElucHV0IHNob3VsZG4ndCBoYXZlIGF1dG9jb21wbGV0aW9uIGZyb20gYnJvd3NlclxuICAgIGNvbXAuaW5wdXQuYXR0cignYXV0b2NvbXBsZXRlJywgJ29mZicpO1xuXG4gICAgLy8gU2V0IGV2ZW50c1xuICAgIGlmICghY29tcC5kb250QXV0bykge1xuICAgICAgICBjb21wLmlucHV0Lm9uKCdrZXl1cC5jb21wbGV0ZXInLCBvbktleS5iaW5kKG51bGwsIGNvbXApKTtcbiAgICAgICAgY29tcC5pbnB1dC5vbignZm9jdXMuY29tcGxldGVyJywgb25LZXkuYmluZChudWxsLCBjb21wKSk7XG4gICAgICAgIGNvbXAuaW5wdXQub24oJ2JsdXIuY29tcGxldGVyJywgb25CbHVyLmJpbmQobnVsbCwgY29tcCkpO1xuICAgICAgICBpZiAoY29tcC5taW5DaGFycyA9PT0gMCkge1xuICAgICAgICAgICAgY29tcC5pbnB1dC5vbignY2xpY2suY29tcGxldGVyJywgb25DbGljay5iaW5kKG51bGwsIGNvbXApKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbXAuZWwub24oJ2NsaWNrLmNvbXBsZXRlcicsIChldnQpID0+IHtcbiAgICAgICAgICAgIGNvbXAudGhyb3R0bGVyICYmIGNsZWFyVGltZW91dChjb21wLnRocm90dGxlcik7XG5cbiAgICAgICAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgZXZ0LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICB9KTtcbiAgICAgICAgJChkb2N1bWVudC5ib2R5KS5vbignY2xpY2suY29tcGxldGVyJywgb25CbHVyLmJpbmQobnVsbCwgY29tcCkpO1xuICAgIH1cblxuICAgIHJldHVybiBjb21wO1xufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEV4cG9ydFxuXG5leHBvcnQgZGVmYXVsdCB7XG4gICAgaW5pdDogKGVsLCBkYXRhKSA9PiB7XG4gICAgICAgIGxldCBjb21wID0gY29tcG9uZW50LmdldENvbXAoZGF0YSwgREVGQVVMVFMpO1xuICAgICAgICBjb21wID0gY29tcG9uZW50LmluaXQoZWwsIGNvbXApO1xuXG4gICAgICAgIC8vIEVsZW1lbnRzIG5lZWQgdG8gYmUgc2V0IG91dCBvdGhlciB3YXlcbiAgICAgICAgY29tcC5pbnB1dCA9IGRhdGEuaW5wdXQgfHwgZWwuZmluZChgLiR7Y29tcC5jbGFzc2VzLmlucHV0fWApO1xuXG4gICAgICAgIHJldHVybiAoIWVsIHx8ICFlbC5sZW5ndGgpID8gY29tcCA6IGluaXQoY29tcCk7XG4gICAgfSxcbiAgICBkZXN0cm95XG59O1xuIl19