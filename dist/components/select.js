'use strict';
/* global Promise */
// TODO: We should convert this better

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _jquery = require('jquery');

var _jquery2 = _interopRequireDefault(_jquery);

var _component = require('bedrock/src/component.js');

var _component2 = _interopRequireDefault(_component);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DEFAULTS = {
    targetClose: null,
    classes: {
        wrap: 'select__wrap',
        options: 'select__options',
        option: 'select__option',
        placeholder: 'select__placeholder',
        value: 'select__value',
        error: 'has-error',
        isSet: 'is-set',
        active: 'is-active',
        set: 'select__set'
    },
    events: {
        change: 'change'
    }
};

require('es6-promise').polyfill();

// --------------------------------
// Functions

/**
 * Gets wrapper
 * @param  {element} el
 * @return {element}
 */
var getWrap = function getWrap(el) {
    return el.closest('.' + DEFAULTS.classes.wrap);
};

/**
 * Gets options from element
 * @param  {element} el
 * @return {array}
 */
var getOptions = function getOptions(el) {
    var optionsEl = el.find('option');
    var options = [];

    // Lets retrieve the options
    optionsEl.each(function () {
        var optionVal = (0, _jquery2.default)(undefined).attr('value');
        var optionName = (0, _jquery2.default)(undefined).text();

        // We need value
        if (!optionVal || optionVal === '') {
            return;
        }

        // Now lets cache it
        options.push({ val: optionVal, name: optionName });
    });

    return options;
};

/**
 * Gets placeholder
 * @param  {element} el
 * @return {string}
 */
var getPlaceholder = function getPlaceholder(el) {
    var optionsEl = el.find('option');
    var possiblePlaceholder = optionsEl.filter('[value=""]').first().text();
    var placeholder = el.attr('data-placeholder') || possiblePlaceholder || '';

    return placeholder;
};

/**
 * Get initial value
 * @param  {element} el
 * @return {string}
 */
var getInitialValue = function getInitialValue(el) {
    var hasPlaceholder = el.attr('data-placeholder');
    var selectValue = el.attr('data-value') || '';

    // Check if there is a placeholder
    hasPlaceholder = !!hasPlaceholder && hasPlaceholder !== '';

    // We may still not have the right value
    if (!hasPlaceholder) {
        if (!selectValue || selectValue === '') {
            selectValue = el.find('option:selected').attr('value') || '';
        }
    }

    return selectValue;
};

/**
 * Templates options
 * @param  {array} opts
 * @return {string}
 */
var tmplOptions = function tmplOptions(opts) {
    return opts.map(function (opt) {
        return '<li class="' + DEFAULTS.classes.option + '" data-value="' + opt.val + '">' + opt.name + '</li>';
    }).join('');
};

/**
 * Layouts the select
 * @param  {jquery} el
 * @return {jquery}
 */
var setLayout = function setLayout(el) {
    var hasError = el.hasClass(DEFAULTS.classes.error);
    var parent = el.parent();
    var placeholder = getPlaceholder(el);
    var options = getOptions(el);
    var layoutTmpl = '';

    // Wrap the select element in a div
    if (!parent.hasClass(DEFAULTS.classes.wrap)) {
        el.wrap('<div class="' + DEFAULTS.classes.wrap + '"></div>');
    }

    el.addClass(DEFAULTS.classes.set);
    var newEl = el.closest('.' + DEFAULTS.classes.wrap);

    hasError && el.addClass(DEFAULTS.classes.error);

    // Lets varruct the right layout
    layoutTmpl += '<div class="' + DEFAULTS.classes.placeholder + '">' + placeholder + '</div>';
    layoutTmpl += '<div class="' + DEFAULTS.classes.value + '"></div>';
    layoutTmpl += '<ul class="' + DEFAULTS.classes.options + '">' + tmplOptions(options) + '</ul>';

    // Finally add it
    newEl.append(layoutTmpl);

    return newEl;
};

/**
 * Open select
 * @param  {jquery} el
 */
var _open = function _open(el) {
    return el.addClass(DEFAULTS.classes.active);
};

/**
 * Close select
 * @param  {jquery} el
 */
var _close = function _close(el) {
    el.removeClass(DEFAULTS.classes.active);
};

/**
 * Sets value
 * @param  {jquery} el
 * @param  {string} val
 * @param  {boolean} isFirst
 * @param  {boolean} force
 */
var _setValue = function _setValue(el, val, isFirst, force) {
    var valEl = el.find('.' + DEFAULTS.classes.value);
    var item = el.find('li[data-value="' + val + '"]').first();
    var itemText = item.text();
    var selectEl = el.find('select');
    var hasSelected = selectEl.attr('data-selected');
    var selectEmpty = selectEl.attr('data-empty') || '';
    var oldVal = selectEl.val();

    // Force existence on val
    val = val || '';

    // Check if it should be a placeholder
    if (selectEmpty.length && selectEmpty === val && !hasSelected && isFirst) {
        val = '';
        itemText = '';
    }

    // Maybe we don't need to go further
    if (oldVal === val && !isFirst && !force) {
        return;
    }

    valEl.attr('data-value', val);
    valEl.attr('data-text', itemText);
    valEl.text(itemText);

    if (!val || val === '' || !itemText || itemText === '') {
        el.removeClass(DEFAULTS.classes.isSet);
    } else {
        el.addClass(DEFAULTS.classes.isSet);
    }

    // Select the right option
    selectEl.attr('data-value', val);
    selectEl.val(val);
    !isFirst && selectEl.trigger(DEFAULTS.events.change);
};

/**
 * Sets value empty
 * @param {jquery} el
 */
var _setEmpty = function _setEmpty(el) {
    return _setValue(el, '', false, true);
};

/**
 * Select click handler
 * @param  {object} comp
 * @param  {event} evt
 */
var onSelectClick = function onSelectClick(comp, evt) {
    evt.stopPropagation();

    // Close all others
    comp.all && comp.all.filter('.' + DEFAULTS.classes.set).each(function () {
        var wrapper = (0, _jquery2.default)(this).closest(DEFAULTS.classes.wrap);

        if (!wrapper.is(comp.newEl)) {
            _close(wrapper);
        }
    });

    // Lets check the one
    if (!comp.newEl.hasClass(DEFAULTS.classes.active)) {
        _open(comp.newEl);
    } else {
        _close(comp.newEl);
    }
};

/**
 * Item click handler
 * @param  {object} comp
 * @param  {event} evt
 */
var onItemClick = function onItemClick(comp, evt) {
    var clickVal = (0, _jquery2.default)(evt.currentTarget).attr('data-value');

    // Set values an close
    _setValue(comp.newEl, clickVal);
    _close(comp.newEl);
};

/**
 * Sets events in the element
 * @param  {object} comp
 */
var setEvents = function setEvents(comp) {
    var el = comp.newEl;
    var valEl = el.find('.' + DEFAULTS.classes.value);
    var listItems = el.find('li');

    // Off other events
    valEl.off('click');
    listItems.off('click');
    (0, _jquery2.default)(document).off('click.select');

    // Set event to open and close
    valEl.on('click', onSelectClick.bind(null, comp));

    // Takes care of click on the list
    listItems.on('click', onItemClick.bind(null, comp));

    // Hides the list when clicking outside of it
    (0, _jquery2.default)(document).on('click', _close.bind(null, el));
};

/**
 * Update data
 * @param  {element} el
 * @param  {element} newEl
 */
var _updateData = function _updateData(el, newEl) {
    var ulEl = newEl.find('.' + DEFAULTS.classes.options);
    var placeholderEl = newEl.find('.' + DEFAULTS.classes.placeholder);
    var placeholder = getPlaceholder(newEl);
    var layoutTmpl = tmplOptions(getOptions(newEl));
    var selectValue = getInitialValue(el);

    ulEl.html(layoutTmpl);
    placeholderEl.html(placeholder);

    // Set events
    // TODO: This shouldn't be like this! It should be a comp!
    setEvents({ el: el, newEl: newEl });

    // Set values
    _setValue(newEl, selectValue, true);
};

/**
 * Destroy
 * @param  {element} el
 * @param  {element} newEl
 */
var _destroy = function _destroy(el, newEl) {
    var placeholderEl = newEl.find('.' + DEFAULTS.classes.placeholder);
    var valueEl = newEl.find('.' + DEFAULTS.classes.value);
    var optionsEl = newEl.find('.' + DEFAULTS.classes.options);

    placeholderEl.remove();
    valueEl.remove();
    optionsEl.remove();
    el.unwrap('.' + DEFAULTS.classes.wrap);

    // TODO: ...
    // component.destroy(comp);
};

/**
 * Creates a custom select
 * @param  {object} comp
 * @return {object}
*/
var _init = function _init(comp) {
    var targetClose = comp.targetClose;
    var selectValue = getInitialValue(comp.el);

    // Cache for later use
    comp.all = !!targetClose ? (0, _jquery2.default)(targetClose) : null;
    comp.newEl = setLayout(comp.el);

    // Set events
    setEvents(comp);

    // Set values
    _setValue(comp.newEl, selectValue, true);

    return comp;
};

// --------------------------------
// Exports

exports.default = {
    init: function init(el, data) {
        var comp = _component2.default.getComp(data, DEFAULTS);
        comp = _component2.default.init(el, comp);
        return _init(comp);
    },
    open: function open(el) {
        var newEl = getWrap(el);
        newEl.length && _open(newEl);
    },
    close: function close(el) {
        var newEl = getWrap(el);
        newEl.length && _close(newEl);
    },
    setValue: function setValue(el, val) {
        var newEl = getWrap(el);
        newEl.length && _setValue(newEl, val);
    },
    setEmpty: function setEmpty(el) {
        var newEl = getWrap(el);
        newEl.length && _setEmpty(newEl);
    },
    updateData: function updateData(el) {
        var newEl = getWrap(el);
        newEl.length && _updateData(el, newEl);
    },
    destroy: function destroy(el) {
        var newEl = getWrap(el);
        newEl.length && _destroy(el, newEl);
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21wb25lbnRzL3NlbGVjdC5qcyJdLCJuYW1lcyI6WyJERUZBVUxUUyIsInRhcmdldENsb3NlIiwiY2xhc3NlcyIsIndyYXAiLCJvcHRpb25zIiwib3B0aW9uIiwicGxhY2Vob2xkZXIiLCJ2YWx1ZSIsImVycm9yIiwiaXNTZXQiLCJhY3RpdmUiLCJzZXQiLCJldmVudHMiLCJjaGFuZ2UiLCJyZXF1aXJlIiwicG9seWZpbGwiLCJnZXRXcmFwIiwiZWwiLCJjbG9zZXN0IiwiZ2V0T3B0aW9ucyIsIm9wdGlvbnNFbCIsImZpbmQiLCJlYWNoIiwib3B0aW9uVmFsIiwiYXR0ciIsIm9wdGlvbk5hbWUiLCJ0ZXh0IiwicHVzaCIsInZhbCIsIm5hbWUiLCJnZXRQbGFjZWhvbGRlciIsInBvc3NpYmxlUGxhY2Vob2xkZXIiLCJmaWx0ZXIiLCJmaXJzdCIsImdldEluaXRpYWxWYWx1ZSIsImhhc1BsYWNlaG9sZGVyIiwic2VsZWN0VmFsdWUiLCJ0bXBsT3B0aW9ucyIsIm9wdHMiLCJtYXAiLCJvcHQiLCJqb2luIiwic2V0TGF5b3V0IiwiaGFzRXJyb3IiLCJoYXNDbGFzcyIsInBhcmVudCIsImxheW91dFRtcGwiLCJhZGRDbGFzcyIsIm5ld0VsIiwiYXBwZW5kIiwib3BlbiIsImNsb3NlIiwicmVtb3ZlQ2xhc3MiLCJzZXRWYWx1ZSIsImlzRmlyc3QiLCJmb3JjZSIsInZhbEVsIiwiaXRlbSIsIml0ZW1UZXh0Iiwic2VsZWN0RWwiLCJoYXNTZWxlY3RlZCIsInNlbGVjdEVtcHR5Iiwib2xkVmFsIiwibGVuZ3RoIiwidHJpZ2dlciIsInNldEVtcHR5Iiwib25TZWxlY3RDbGljayIsImNvbXAiLCJldnQiLCJzdG9wUHJvcGFnYXRpb24iLCJhbGwiLCJ3cmFwcGVyIiwiaXMiLCJvbkl0ZW1DbGljayIsImNsaWNrVmFsIiwiY3VycmVudFRhcmdldCIsInNldEV2ZW50cyIsImxpc3RJdGVtcyIsIm9mZiIsImRvY3VtZW50Iiwib24iLCJiaW5kIiwidXBkYXRlRGF0YSIsInVsRWwiLCJwbGFjZWhvbGRlckVsIiwiaHRtbCIsImRlc3Ryb3kiLCJ2YWx1ZUVsIiwicmVtb3ZlIiwidW53cmFwIiwiaW5pdCIsImRhdGEiLCJnZXRDb21wIl0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7Ozs7OztBQUVBOzs7O0FBQ0E7Ozs7OztBQUVBLElBQU1BLFdBQVc7QUFDYkMsaUJBQWEsSUFEQTtBQUViQyxhQUFTO0FBQ0xDLGNBQU0sY0FERDtBQUVMQyxpQkFBUyxpQkFGSjtBQUdMQyxnQkFBUSxnQkFISDtBQUlMQyxxQkFBYSxxQkFKUjtBQUtMQyxlQUFPLGVBTEY7QUFNTEMsZUFBTyxXQU5GO0FBT0xDLGVBQU8sUUFQRjtBQVFMQyxnQkFBUSxXQVJIO0FBU0xDLGFBQUs7QUFUQSxLQUZJO0FBYWJDLFlBQVE7QUFDSkMsZ0JBQVE7QUFESjtBQWJLLENBQWpCOztBQWtCQUMsUUFBUSxhQUFSLEVBQXVCQyxRQUF2Qjs7QUFFQTtBQUNBOztBQUVBOzs7OztBQUtBLElBQU1DLFVBQVUsU0FBVkEsT0FBVSxDQUFDQyxFQUFEO0FBQUEsV0FBUUEsR0FBR0MsT0FBSCxPQUFlbEIsU0FBU0UsT0FBVCxDQUFpQkMsSUFBaEMsQ0FBUjtBQUFBLENBQWhCOztBQUVBOzs7OztBQUtBLElBQU1nQixhQUFhLFNBQWJBLFVBQWEsQ0FBQ0YsRUFBRCxFQUFRO0FBQ3ZCLFFBQU1HLFlBQVlILEdBQUdJLElBQUgsQ0FBUSxRQUFSLENBQWxCO0FBQ0EsUUFBTWpCLFVBQVUsRUFBaEI7O0FBRUE7QUFDQWdCLGNBQVVFLElBQVYsQ0FBZSxZQUFNO0FBQ2pCLFlBQU1DLFlBQVksaUNBQVFDLElBQVIsQ0FBYSxPQUFiLENBQWxCO0FBQ0EsWUFBTUMsYUFBYSxpQ0FBUUMsSUFBUixFQUFuQjs7QUFFQTtBQUNBLFlBQUksQ0FBQ0gsU0FBRCxJQUFjQSxjQUFjLEVBQWhDLEVBQW9DO0FBQ2hDO0FBQ0g7O0FBRUQ7QUFDQW5CLGdCQUFRdUIsSUFBUixDQUFhLEVBQUVDLEtBQUtMLFNBQVAsRUFBa0JN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QUNILEtBYlU7QUFjWEssY0FBVSxrQkFBQ3BDLEVBQUQsRUFBS1csR0FBTCxFQUFhO0FBQ25CLFlBQU1vQixRQUFRaEMsUUFBUUMsRUFBUixDQUFkO0FBQ0ErQixjQUFNZSxNQUFOLElBQWdCVixVQUFTTCxLQUFULEVBQWdCcEIsR0FBaEIsQ0FBaEI7QUFDSCxLQWpCVTtBQWtCWHFDLGNBQVUsa0JBQUNoRCxFQUFELEVBQVE7QUFDZCxZQUFNK0IsUUFBUWhDLFFBQVFDLEVBQVIsQ0FBZDtBQUNBK0IsY0FBTWUsTUFBTixJQUFnQkUsVUFBU2pCLEtBQVQsQ0FBaEI7QUFDSCxLQXJCVTtBQXNCWGtDLGdCQUFZLG9CQUFDakUsRUFBRCxFQUFRO0FBQ2hCLFlBQU0rQixRQUFRaEMsUUFBUUMsRUFBUixDQUFkO0FBQ0ErQixjQUFNZSxNQUFOLElBQWdCbUIsWUFBV2pFLEVBQVgsRUFBZStCLEtBQWYsQ0FBaEI7QUFDSCxLQXpCVTtBQTBCWHNDLGFBQVMsaUJBQUNyRSxFQUFELEVBQVE7QUFDYixZQUFNK0IsUUFBUWhDLFFBQVFDLEVBQVIsQ0FBZDtBQUNBK0IsY0FBTWUsTUFBTixJQUFnQnVCLFNBQVFyRSxFQUFSLEVBQVkrQixLQUFaLENBQWhCO0FBQ0g7QUE3QlUsQyIsImZpbGUiOiJzZWxlY3QuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG4vKiBnbG9iYWwgUHJvbWlzZSAqL1xuLy8gVE9ETzogV2Ugc2hvdWxkIGNvbnZlcnQgdGhpcyBiZXR0ZXJcblxuaW1wb3J0ICQgZnJvbSAnanF1ZXJ5JztcbmltcG9ydCBjb21wb25lbnQgZnJvbSAnYmVkcm9jay9zcmMvY29tcG9uZW50LmpzJztcblxuY29uc3QgREVGQVVMVFMgPSB7XG4gICAgdGFyZ2V0Q2xvc2U6IG51bGwsXG4gICAgY2xhc3Nlczoge1xuICAgICAgICB3cmFwOiAnc2VsZWN0X193cmFwJyxcbiAgICAgICAgb3B0aW9uczogJ3NlbGVjdF9fb3B0aW9ucycsXG4gICAgICAgIG9wdGlvbjogJ3NlbGVjdF9fb3B0aW9uJyxcbiAgICAgICAgcGxhY2Vob2xkZXI6ICdzZWxlY3RfX3BsYWNlaG9sZGVyJyxcbiAgICAgICAgdmFsdWU6ICdzZWxlY3RfX3ZhbHVlJyxcbiAgICAgICAgZXJyb3I6ICdoYXMtZXJyb3InLFxuICAgICAgICBpc1NldDogJ2lzLXNldCcsXG4gICAgICAgIGFjdGl2ZTogJ2lzLWFjdGl2ZScsXG4gICAgICAgIHNldDogJ3NlbGVjdF9fc2V0J1xuICAgIH0sXG4gICAgZXZlbnRzOiB7XG4gICAgICAgIGNoYW5nZTogJ2NoYW5nZSdcbiAgICB9XG59O1xuXG5yZXF1aXJlKCdlczYtcHJvbWlzZScpLnBvbHlmaWxsKCk7XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBGdW5jdGlvbnNcblxuLyoqXG4gKiBHZXRzIHdyYXBwZXJcbiAqIEBwYXJhbSAge2VsZW1lbnR9IGVsXG4gKiBAcmV0dXJuIHtlbGVtZW50fVxuICovXG5jb25zdCBnZXRXcmFwID0gKGVsKSA9PiBlbC5jbG9zZXN0KGAuJHtERUZBVUxUUy5jbGFzc2VzLndyYXB9YCk7XG5cbi8qKlxuICogR2V0cyBvcHRpb25zIGZyb20gZWxlbWVudFxuICogQHBhcmFtICB7ZWxlbWVudH0gZWxcbiAqIEByZXR1cm4ge2FycmF5fVxuICovXG5jb25zdCBnZXRPcHRpb25zID0gKGVsKSA9PiB7XG4gICAgY29uc3Qgb3B0aW9uc0VsID0gZWwuZmluZCgnb3B0aW9uJyk7XG4gICAgY29uc3Qgb3B0aW9ucyA9IFtdO1xuXG4gICAgLy8gTGV0cyByZXRyaWV2ZSB0aGUgb3B0aW9uc1xuICAgIG9wdGlvbnNFbC5lYWNoKCgpID0+IHtcbiAgICAgICAgY29uc3Qgb3B0aW9uVmFsID0gJCh0aGlzKS5hdHRyKCd2YWx1ZScpO1xuICAgICAgICBjb25zdCBvcHRpb25OYW1lID0gJCh0aGlzKS50ZXh0KCk7XG5cbiAgICAgICAgLy8gV2UgbmVlZCB2YWx1ZVxuICAgICAgICBpZiAoIW9wdGlvblZhbCB8fCBvcHRpb25WYWwgPT09ICcnKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBOb3cgbGV0cyBjYWNoZSBpdFxuICAgICAgICBvcHRpb25zLnB1c2goeyB2YWw6IG9wdGlvblZhbCwgbmFtZTogb3B0aW9uTmFtZSB9KTtcbiAgICB9KTtcblxuICAgIHJldHVybiBvcHRpb25zO1xufTtcblxuLyoqXG4gKiBHZXRzIHBsYWNlaG9sZGVyXG4gKiBAcGFyYW0gIHtlbGVtZW50fSBlbFxuICogQHJldHVybiB7c3RyaW5nfVxuICovXG5jb25zdCBnZXRQbGFjZWhvbGRlciA9IChlbCkgPT4ge1xuICAgIGNvbnN0IG9wdGlvbnNFbCA9IGVsLmZpbmQoJ29wdGlvbicpO1xuICAgIGNvbnN0IHBvc3NpYmxlUGxhY2Vob2xkZXIgPSBvcHRpb25zRWwuZmlsdGVyKCdbdmFsdWU9XCJcIl0nKS5maXJzdCgpLnRleHQoKTtcbiAgICBjb25zdCBwbGFjZWhvbGRlciA9IGVsLmF0dHIoJ2RhdGEtcGxhY2Vob2xkZXInKSB8fCBwb3NzaWJsZVBsYWNlaG9sZGVyIHx8ICcnO1xuXG4gICAgcmV0dXJuIHBsYWNlaG9sZGVyO1xufTtcblxuLyoqXG4gKiBHZXQgaW5pdGlhbCB2YWx1ZVxuICogQHBhcmFtICB7ZWxlbWVudH0gZWxcbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xuY29uc3QgZ2V0SW5pdGlhbFZhbHVlID0gKGVsKSA9PiB7XG4gICAgbGV0IGhhc1BsYWNlaG9sZGVyID0gZWwuYXR0cignZGF0YS1wbGFjZWhvbGRlcicpO1xuICAgIGxldCBzZWxlY3RWYWx1ZSA9IGVsLmF0dHIoJ2RhdGEtdmFsdWUnKSB8fCAnJztcblxuICAgIC8vIENoZWNrIGlmIHRoZXJlIGlzIGEgcGxhY2Vob2xkZXJcbiAgICBoYXNQbGFjZWhvbGRlciA9ICEhaGFzUGxhY2Vob2xkZXIgJiYgaGFzUGxhY2Vob2xkZXIgIT09ICcnO1xuXG4gICAgLy8gV2UgbWF5IHN0aWxsIG5vdCBoYXZlIHRoZSByaWdodCB2YWx1ZVxuICAgIGlmICghaGFzUGxhY2Vob2xkZXIpIHtcbiAgICAgICAgaWYgKCFzZWxlY3RWYWx1ZSB8fCBzZWxlY3RWYWx1ZSA9PT0gJycpIHtcbiAgICAgICAgICAgIHNlbGVjdFZhbHVlID0gZWwuZmluZCgnb3B0aW9uOnNlbGVjdGVkJykuYXR0cigndmFsdWUnKSB8fCAnJztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBzZWxlY3RWYWx1ZTtcbn07XG5cbi8qKlxuICogVGVtcGxhdGVzIG9wdGlvbnNcbiAqIEBwYXJhbSAge2FycmF5fSBvcHRzXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbmNvbnN0IHRtcGxPcHRpb25zID0gKG9wdHMpID0+IG9wdHMubWFwKFxuICAgIChvcHQpID0+IGA8bGkgY2xhc3M9XCIke0RFRkFVTFRTLmNsYXNzZXMub3B0aW9ufVwiIGRhdGEtdmFsdWU9XCIke29wdC52YWx9XCI+JHtvcHQubmFtZX08L2xpPmBcbikuam9pbignJyk7XG5cbi8qKlxuICogTGF5b3V0cyB0aGUgc2VsZWN0XG4gKiBAcGFyYW0gIHtqcXVlcnl9IGVsXG4gKiBAcmV0dXJuIHtqcXVlcnl9XG4gKi9cbmNvbnN0IHNldExheW91dCA9IChlbCkgPT4ge1xuICAgIGNvbnN0IGhhc0Vycm9yID0gZWwuaGFzQ2xhc3MoREVGQVVMVFMuY2xhc3Nlcy5lcnJvcik7XG4gICAgY29uc3QgcGFyZW50ID0gZWwucGFyZW50KCk7XG4gICAgY29uc3QgcGxhY2Vob2xkZXIgPSBnZXRQbGFjZWhvbGRlcihlbCk7XG4gICAgY29uc3Qgb3B0aW9ucyA9IGdldE9wdGlvbnMoZWwpO1xuICAgIGxldCBsYXlvdXRUbXBsID0gJyc7XG5cbiAgICAvLyBXcmFwIHRoZSBzZWxlY3QgZWxlbWVudCBpbiBhIGRpdlxuICAgIGlmICghcGFyZW50Lmhhc0NsYXNzKERFRkFVTFRTLmNsYXNzZXMud3JhcCkpIHtcbiAgICAgICAgZWwud3JhcChgPGRpdiBjbGFzcz1cIiR7REVGQVVMVFMuY2xhc3Nlcy53cmFwfVwiPjwvZGl2PmApO1xuICAgIH1cblxuICAgIGVsLmFkZENsYXNzKERFRkFVTFRTLmNsYXNzZXMuc2V0KTtcbiAgICBjb25zdCBuZXdFbCA9IGVsLmNsb3Nlc3QoYC4ke0RFRkFVTFRTLmNsYXNzZXMud3JhcH1gKTtcblxuICAgIGhhc0Vycm9yICYmIGVsLmFkZENsYXNzKERFRkFVTFRTLmNsYXNzZXMuZXJyb3IpO1xuXG4gICAgLy8gTGV0cyB2YXJydWN0IHRoZSByaWdodCBsYXlvdXRcbiAgICBsYXlvdXRUbXBsICs9IGA8ZGl2IGNsYXNzPVwiJHtERUZBVUxUUy5jbGFzc2VzLnBsYWNlaG9sZGVyfVwiPiR7cGxhY2Vob2xkZXJ9PC9kaXY+YDtcbiAgICBsYXlvdXRUbXBsICs9IGA8ZGl2IGNsYXNzPVwiJHtERUZBVUxUUy5jbGFzc2VzLnZhbHVlfVwiPjwvZGl2PmA7XG4gICAgbGF5b3V0VG1wbCArPSBgPHVsIGNsYXNzPVwiJHtERUZBVUxUUy5jbGFzc2VzLm9wdGlvbnN9XCI+JHt0bXBsT3B0aW9ucyhvcHRpb25zKX08L3VsPmA7XG5cbiAgICAvLyBGaW5hbGx5IGFkZCBpdFxuICAgIG5ld0VsLmFwcGVuZChsYXlvdXRUbXBsKTtcblxuICAgIHJldHVybiBuZXdFbDtcbn07XG5cbi8qKlxuICogT3BlbiBzZWxlY3RcbiAqIEBwYXJhbSAge2pxdWVyeX0gZWxcbiAqL1xuY29uc3Qgb3BlbiA9IChlbCkgPT4gZWwuYWRkQ2xhc3MoREVGQVVMVFMuY2xhc3Nlcy5hY3RpdmUpO1xuXG4vKipcbiAqIENsb3NlIHNlbGVjdFxuICogQHBhcmFtICB7anF1ZXJ5fSBlbFxuICovXG5jb25zdCBjbG9zZSA9IChlbCkgPT4geyBlbC5yZW1vdmVDbGFzcyhERUZBVUxUUy5jbGFzc2VzLmFjdGl2ZSk7IH1cblxuLyoqXG4gKiBTZXRzIHZhbHVlXG4gKiBAcGFyYW0gIHtqcXVlcnl9IGVsXG4gKiBAcGFyYW0gIHtzdHJpbmd9IHZhbFxuICogQHBhcmFtICB7Ym9vbGVhbn0gaXNGaXJzdFxuICogQHBhcmFtICB7Ym9vbGVhbn0gZm9yY2VcbiAqL1xuY29uc3Qgc2V0VmFsdWUgPSAoZWwsIHZhbCwgaXNGaXJzdCwgZm9yY2UpID0+IHtcbiAgICBjb25zdCB2YWxFbCA9IGVsLmZpbmQoYC4ke0RFRkFVTFRTLmNsYXNzZXMudmFsdWV9YCk7XG4gICAgY29uc3QgaXRlbSA9IGVsLmZpbmQoYGxpW2RhdGEtdmFsdWU9XCIke3ZhbH1cIl1gKS5maXJzdCgpO1xuICAgIGxldCBpdGVtVGV4dCA9IGl0ZW0udGV4dCgpO1xuICAgIGNvbnN0IHNlbGVjdEVsID0gZWwuZmluZCgnc2VsZWN0Jyk7XG4gICAgY29uc3QgaGFzU2VsZWN0ZWQgPSBzZWxlY3RFbC5hdHRyKCdkYXRhLXNlbGVjdGVkJyk7XG4gICAgY29uc3Qgc2VsZWN0RW1wdHkgPSBzZWxlY3RFbC5hdHRyKCdkYXRhLWVtcHR5JykgfHwgJyc7XG4gICAgY29uc3Qgb2xkVmFsID0gc2VsZWN0RWwudmFsKCk7XG5cbiAgICAvLyBGb3JjZSBleGlzdGVuY2Ugb24gdmFsXG4gICAgdmFsID0gdmFsIHx8ICcnO1xuXG4gICAgLy8gQ2hlY2sgaWYgaXQgc2hvdWxkIGJlIGEgcGxhY2Vob2xkZXJcbiAgICBpZiAoc2VsZWN0RW1wdHkubGVuZ3RoICYmIHNlbGVjdEVtcHR5ID09PSB2YWwgJiYgIWhhc1NlbGVjdGVkICYmIGlzRmlyc3QpIHtcbiAgICAgICAgdmFsID0gJyc7XG4gICAgICAgIGl0ZW1UZXh0ID0gJyc7XG4gICAgfVxuXG4gICAgLy8gTWF5YmUgd2UgZG9uJ3QgbmVlZCB0byBnbyBmdXJ0aGVyXG4gICAgaWYgKG9sZFZhbCA9PT0gdmFsICYmICFpc0ZpcnN0ICYmICFmb3JjZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFsRWwuYXR0cignZGF0YS12YWx1ZScsIHZhbCk7XG4gICAgdmFsRWwuYXR0cignZGF0YS10ZXh0JywgaXRlbVRleHQpO1xuICAgIHZhbEVsLnRleHQoaXRlbVRleHQpO1xuXG4gICAgaWYgKCF2YWwgfHwgdmFsID09PSAnJyB8fCAhaXRlbVRleHQgfHwgaXRlbVRleHQgPT09ICcnKSB7XG4gICAgICAgIGVsLnJlbW92ZUNsYXNzKERFRkFVTFRTLmNsYXNzZXMuaXNTZXQpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGVsLmFkZENsYXNzKERFRkFVTFRTLmNsYXNzZXMuaXNTZXQpO1xuICAgIH1cblxuICAgIC8vIFNlbGVjdCB0aGUgcmlnaHQgb3B0aW9uXG4gICAgc2VsZWN0RWwuYXR0cignZGF0YS12YWx1ZScsIHZhbCk7XG4gICAgc2VsZWN0RWwudmFsKHZhbCk7XG4gICAgIWlzRmlyc3QgJiYgc2VsZWN0RWwudHJpZ2dlcihERUZBVUxUUy5ldmVudHMuY2hhbmdlKTtcbn07XG5cbi8qKlxuICogU2V0cyB2YWx1ZSBlbXB0eVxuICogQHBhcmFtIHtqcXVlcnl9IGVsXG4gKi9cbmNvbnN0IHNldEVtcHR5ID0gKGVsKSA9PiBzZXRWYWx1ZShlbCwgJycsIGZhbHNlLCB0cnVlKTtcblxuLyoqXG4gKiBTZWxlY3QgY2xpY2sgaGFuZGxlclxuICogQHBhcmFtICB7b2JqZWN0fSBjb21wXG4gKiBAcGFyYW0gIHtldmVudH0gZXZ0XG4gKi9cbmNvbnN0IG9uU2VsZWN0Q2xpY2sgPSAoY29tcCwgZXZ0KSA9PiB7XG4gICAgZXZ0LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgLy8gQ2xvc2UgYWxsIG90aGVyc1xuICAgIGNvbXAuYWxsICYmIGNvbXAuYWxsLmZpbHRlcihgLiR7REVGQVVMVFMuY2xhc3Nlcy5zZXR9YCkuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNvbnN0IHdyYXBwZXIgPSAkKHRoaXMpLmNsb3Nlc3QoREVGQVVMVFMuY2xhc3Nlcy53cmFwKTtcblxuICAgICAgICBpZiAoIXdyYXBwZXIuaXMoY29tcC5uZXdFbCkpIHtcbiAgICAgICAgICAgIGNsb3NlKHdyYXBwZXIpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBMZXRzIGNoZWNrIHRoZSBvbmVcbiAgICBpZiAoIWNvbXAubmV3RWwuaGFzQ2xhc3MoREVGQVVMVFMuY2xhc3Nlcy5hY3RpdmUpKSB7XG4gICAgICAgIG9wZW4oY29tcC5uZXdFbCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgY2xvc2UoY29tcC5uZXdFbCk7XG4gICAgfVxufTtcblxuLyoqXG4gKiBJdGVtIGNsaWNrIGhhbmRsZXJcbiAqIEBwYXJhbSAge29iamVjdH0gY29tcFxuICogQHBhcmFtICB7ZXZlbnR9IGV2dFxuICovXG5jb25zdCBvbkl0ZW1DbGljayA9IChjb21wLCBldnQpID0+IHtcbiAgICBjb25zdCBjbGlja1ZhbCA9ICQoZXZ0LmN1cnJlbnRUYXJnZXQpLmF0dHIoJ2RhdGEtdmFsdWUnKTtcblxuICAgIC8vIFNldCB2YWx1ZXMgYW4gY2xvc2VcbiAgICBzZXRWYWx1ZShjb21wLm5ld0VsLCBjbGlja1ZhbCk7XG4gICAgY2xvc2UoY29tcC5uZXdFbCk7XG59O1xuXG4vKipcbiAqIFNldHMgZXZlbnRzIGluIHRoZSBlbGVtZW50XG4gKiBAcGFyYW0gIHtvYmplY3R9IGNvbXBcbiAqL1xuY29uc3Qgc2V0RXZlbnRzID0gKGNvbXApID0+IHtcbiAgICBjb25zdCBlbCA9IGNvbXAubmV3RWw7XG4gICAgY29uc3QgdmFsRWwgPSBlbC5maW5kKGAuJHtERUZBVUxUUy5jbGFzc2VzLnZhbHVlfWApO1xuICAgIGNvbnN0IGxpc3RJdGVtcyA9IGVsLmZpbmQoJ2xpJyk7XG5cbiAgICAvLyBPZmYgb3RoZXIgZXZlbnRzXG4gICAgdmFsRWwub2ZmKCdjbGljaycpO1xuICAgIGxpc3RJdGVtcy5vZmYoJ2NsaWNrJyk7XG4gICAgJChkb2N1bWVudCkub2ZmKCdjbGljay5zZWxlY3QnKTtcblxuICAgIC8vIFNldCBldmVudCB0byBvcGVuIGFuZCBjbG9zZVxuICAgIHZhbEVsLm9uKCdjbGljaycsIG9uU2VsZWN0Q2xpY2suYmluZChudWxsLCBjb21wKSk7XG5cbiAgICAvLyBUYWtlcyBjYXJlIG9mIGNsaWNrIG9uIHRoZSBsaXN0XG4gICAgbGlzdEl0ZW1zLm9uKCdjbGljaycsIG9uSXRlbUNsaWNrLmJpbmQobnVsbCwgY29tcCkpO1xuXG4gICAgLy8gSGlkZXMgdGhlIGxpc3Qgd2hlbiBjbGlja2luZyBvdXRzaWRlIG9mIGl0XG4gICAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgY2xvc2UuYmluZChudWxsLCBlbCkpO1xufTtcblxuLyoqXG4gKiBVcGRhdGUgZGF0YVxuICogQHBhcmFtICB7ZWxlbWVudH0gZWxcbiAqIEBwYXJhbSAge2VsZW1lbnR9IG5ld0VsXG4gKi9cbmNvbnN0IHVwZGF0ZURhdGEgPSAoZWwsIG5ld0VsKSA9PiB7XG4gICAgY29uc3QgdWxFbCA9IG5ld0VsLmZpbmQoYC4ke0RFRkFVTFRTLmNsYXNzZXMub3B0aW9uc31gKTtcbiAgICBjb25zdCBwbGFjZWhvbGRlckVsID0gbmV3RWwuZmluZChgLiR7REVGQVVMVFMuY2xhc3Nlcy5wbGFjZWhvbGRlcn1gKTtcbiAgICBjb25zdCBwbGFjZWhvbGRlciA9IGdldFBsYWNlaG9sZGVyKG5ld0VsKTtcbiAgICBjb25zdCBsYXlvdXRUbXBsID0gdG1wbE9wdGlvbnMoZ2V0T3B0aW9ucyhuZXdFbCkpO1xuICAgIGNvbnN0IHNlbGVjdFZhbHVlID0gZ2V0SW5pdGlhbFZhbHVlKGVsKTtcblxuICAgIHVsRWwuaHRtbChsYXlvdXRUbXBsKTtcbiAgICBwbGFjZWhvbGRlckVsLmh0bWwocGxhY2Vob2xkZXIpO1xuXG4gICAgLy8gU2V0IGV2ZW50c1xuICAgIC8vIFRPRE86IFRoaXMgc2hvdWxkbid0IGJlIGxpa2UgdGhpcyEgSXQgc2hvdWxkIGJlIGEgY29tcCFcbiAgICBzZXRFdmVudHMoeyBlbCwgbmV3RWwgfSk7XG5cbiAgICAvLyBTZXQgdmFsdWVzXG4gICAgc2V0VmFsdWUobmV3RWwsIHNlbGVjdFZhbHVlLCB0cnVlKTtcbn07XG5cbi8qKlxuICogRGVzdHJveVxuICogQHBhcmFtICB7ZWxlbWVudH0gZWxcbiAqIEBwYXJhbSAge2VsZW1lbnR9IG5ld0VsXG4gKi9cbmNvbnN0IGRlc3Ryb3kgPSAoZWwsIG5ld0VsKSA9PiB7XG4gICAgY29uc3QgcGxhY2Vob2xkZXJFbCA9IG5ld0VsLmZpbmQoYC4ke0RFRkFVTFRTLmNsYXNzZXMucGxhY2Vob2xkZXJ9YCk7XG4gICAgY29uc3QgdmFsdWVFbCA9IG5ld0VsLmZpbmQoYC4ke0RFRkFVTFRTLmNsYXNzZXMudmFsdWV9YCk7XG4gICAgY29uc3Qgb3B0aW9uc0VsID0gbmV3RWwuZmluZChgLiR7REVGQVVMVFMuY2xhc3Nlcy5vcHRpb25zfWApO1xuXG4gICAgcGxhY2Vob2xkZXJFbC5yZW1vdmUoKTtcbiAgICB2YWx1ZUVsLnJlbW92ZSgpO1xuICAgIG9wdGlvbnNFbC5yZW1vdmUoKTtcbiAgICBlbC51bndyYXAoYC4ke0RFRkFVTFRTLmNsYXNzZXMud3JhcH1gKTtcblxuICAgIC8vIFRPRE86IC4uLlxuICAgIC8vIGNvbXBvbmVudC5kZXN0cm95KGNvbXApO1xufTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgY3VzdG9tIHNlbGVjdFxuICogQHBhcmFtICB7b2JqZWN0fSBjb21wXG4gKiBAcmV0dXJuIHtvYmplY3R9XG4qL1xuY29uc3QgaW5pdCA9IChjb21wKSA9PiB7XG4gICAgY29uc3QgdGFyZ2V0Q2xvc2UgPSBjb21wLnRhcmdldENsb3NlO1xuICAgIGNvbnN0IHNlbGVjdFZhbHVlID0gZ2V0SW5pdGlhbFZhbHVlKGNvbXAuZWwpO1xuXG4gICAgLy8gQ2FjaGUgZm9yIGxhdGVyIHVzZVxuICAgIGNvbXAuYWxsID0gISF0YXJnZXRDbG9zZSA/ICQodGFyZ2V0Q2xvc2UpIDogbnVsbDtcbiAgICBjb21wLm5ld0VsID0gc2V0TGF5b3V0KGNvbXAuZWwpO1xuXG4gICAgLy8gU2V0IGV2ZW50c1xuICAgIHNldEV2ZW50cyhjb21wKTtcblxuICAgIC8vIFNldCB2YWx1ZXNcbiAgICBzZXRWYWx1ZShjb21wLm5ld0VsLCBzZWxlY3RWYWx1ZSwgdHJ1ZSk7XG5cbiAgICByZXR1cm4gY29tcDtcbn07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBFeHBvcnRzXG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgICBpbml0OiAoZWwsIGRhdGEpID0+IHtcbiAgICAgICAgbGV0IGNvbXAgPSBjb21wb25lbnQuZ2V0Q29tcChkYXRhLCBERUZBVUxUUyk7XG4gICAgICAgIGNvbXAgPSBjb21wb25lbnQuaW5pdChlbCwgY29tcCk7XG4gICAgICAgIHJldHVybiBpbml0KGNvbXApO1xuICAgIH0sXG4gICAgb3BlbjogKGVsKSA9PiB7XG4gICAgICAgIGNvbnN0IG5ld0VsID0gZ2V0V3JhcChlbCk7XG4gICAgICAgIG5ld0VsLmxlbmd0aCAmJiBvcGVuKG5ld0VsKTtcbiAgICB9LFxuICAgIGNsb3NlOiAoZWwpID0+IHtcbiAgICAgICAgY29uc3QgbmV3RWwgPSBnZXRXcmFwKGVsKTtcbiAgICAgICAgbmV3RWwubGVuZ3RoICYmIGNsb3NlKG5ld0VsKTtcbiAgICB9LFxuICAgIHNldFZhbHVlOiAoZWwsIHZhbCkgPT4ge1xuICAgICAgICBjb25zdCBuZXdFbCA9IGdldFdyYXAoZWwpO1xuICAgICAgICBuZXdFbC5sZW5ndGggJiYgc2V0VmFsdWUobmV3RWwsIHZhbCk7XG4gICAgfSxcbiAgICBzZXRFbXB0eTogKGVsKSA9PiB7XG4gICAgICAgIGNvbnN0IG5ld0VsID0gZ2V0V3JhcChlbCk7XG4gICAgICAgIG5ld0VsLmxlbmd0aCAmJiBzZXRFbXB0eShuZXdFbCk7XG4gICAgfSxcbiAgICB1cGRhdGVEYXRhOiAoZWwpID0+IHtcbiAgICAgICAgY29uc3QgbmV3RWwgPSBnZXRXcmFwKGVsKTtcbiAgICAgICAgbmV3RWwubGVuZ3RoICYmIHVwZGF0ZURhdGEoZWwsIG5ld0VsKTtcbiAgICB9LFxuICAgIGRlc3Ryb3k6IChlbCkgPT4ge1xuICAgICAgICBjb25zdCBuZXdFbCA9IGdldFdyYXAoZWwpO1xuICAgICAgICBuZXdFbC5sZW5ndGggJiYgZGVzdHJveShlbCwgbmV3RWwpO1xuICAgIH1cbn07XG4iXX0=