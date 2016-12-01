/* eslint-disable strict */'use strict';/* eslint-enable strict */
/* global Promise */
// TODO: We should convert this better

var $ = require('jquery');
var component = require('bedrock/component.js');

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
function getWrap(el) {
    return el.closest('.' + DEFAULTS.classes.wrap);
}

/**
 * Gets options from element
 * @param  {element} el
 * @return {array}
 */
function getOptions(el) {
    var optionsEl = el.find('option');
    var options = [];

    // Lets retrieve the options
    optionsEl.each(function () {
        var optionVal = $(this).attr('value');
        var optionName = $(this).text();

        // We need value
        if (!optionVal || optionVal === '') {
            return;
        }

        // Now lets cache it
        options.push({ val: optionVal, name: optionName });
    });

    return options;
}

/**
 * Gets placeholder
 * @param  {element} el
 * @return {string}
 */
function getPlaceholder(el) {
    var optionsEl = el.find('option');
    var possiblePlaceholder = optionsEl.filter('[value=""]').first().text();
    var placeholder = el.attr('data-placeholder') || possiblePlaceholder || '';

    return placeholder;
}

/**
 * Get initial value
 * @param  {element} el
 * @return {string}
 */
function getInitialValue(el) {
    var hasPlaceholder = el.attr('data-placeholder');
    var selectValue = el.attr('data-value') || '';
    var selectEl = el;

    // Check if there is a placeholder
    hasPlaceholder = !!hasPlaceholder && hasPlaceholder !== '';

    // We may still not have the right value
    if (!hasPlaceholder) {
        if (!selectValue || selectValue === '') {
            selectValue = selectEl.find('option:selected').attr('value') || '';
        }
    }

    return selectValue;
}

/**
 * Templates options
 * @param  {array} opts
 * @return {string}
 */
function tmplOptions(opts) {
    return opts.map(function (opt) {
        return '<li class="' + DEFAULTS.classes.option + '" data-value="' + opt.val + '">' + opt.name + '</li>';
    }).join('');
}

/**
 * Layouts the select
 * @param  {jquery} el
 * @return {jquery}
 */
function setLayout(el) {
    var hasError = el.hasClass(DEFAULTS.classes.error);
    var parent = el.parent();
    var placeholder = getPlaceholder(el);
    var options = getOptions(el);
    var layoutTmpl = '';
    var newEl;

    // Wrap the select element in a div
    if (!parent.hasClass(DEFAULTS.classes.wrap)) {
        el.wrap('<div class="' + DEFAULTS.classes.wrap + '"></div>');
    }

    el.addClass(DEFAULTS.classes.set);
    newEl = el.closest('.' + DEFAULTS.classes.wrap);

    hasError && el.addClass(DEFAULTS.classes.error);

    // Lets varruct the right layout
    layoutTmpl += '<div class="' + DEFAULTS.classes.placeholder + '">' + placeholder + '</div>';
    layoutTmpl += '<div class="' + DEFAULTS.classes.value + '"></div>';
    layoutTmpl += '<ul class="' + DEFAULTS.classes.options + '">' + tmplOptions(options) + '</ul>';

    // Finally add it
    newEl.append(layoutTmpl);

    return newEl;
}

/**
 * Open select
 * @param  {jquery} el
 */
function open(el) { el.addClass(DEFAULTS.classes.active); }

/**
 * Close select
 * @param  {jquery} el
 */
function close(el) { el.removeClass(DEFAULTS.classes.active); }

/**
 * Sets value
 * @param  {jquery} el
 * @param  {string} val
 * @param  {boolean} isFirst
 * @param  {boolean} force
 */
function setValue(el, val, isFirst, force) {
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
}

/**
 * Sets value empty
 * @param {jquery} el
 */
function setEmpty(el) {
    setValue(el, '', false, true);
}

/**
 * Select click handler
 * @param  {object} comp
 * @param  {event} evt
 */
function onSelectClick(comp, evt) {
    evt.stopPropagation();

    // Close all others
    comp.all && comp.all.filter('.' + DEFAULTS.classes.set).each(function () {
        var wrapper = $(this).closest(DEFAULTS.classes.wrap);

        if (!wrapper.is(comp.newEl)) {
            close(wrapper);
        }
    });

    // Lets check the one
    if (!comp.newEl.hasClass(DEFAULTS.classes.active)) {
        open(comp.newEl);
    } else {
        close(comp.newEl);
    }
}

/**
 * Item click handler
 * @param  {object} comp
 * @param  {event} evt
 */
function onItemClick(comp, evt) {
    var clickVal = $(evt.currentTarget).attr('data-value');

    // Set values an close
    setValue(comp.newEl, clickVal);
    close(comp.newEl);
}

/**
 * Sets events in the element
 * @param  {object} comp
 */
function setEvents(comp) {
    var el = comp.newEl;
    var valEl = el.find('.' + DEFAULTS.classes.value);
    var listItems = el.find('li');

    // Off other events
    valEl.off('click');
    listItems.off('click');
    $(document).off('click.select');

    // Set event to open and close
    valEl.on('click', onSelectClick.bind(null, comp));

    // Takes care of click on the list
    listItems.on('click', onItemClick.bind(null, comp));

    // Hides the list when clicking outside of it
    $(document).on('click', close.bind(null, el));
}

/**
 * Update data
 * @param  {element} el
 * @param  {element} newEl
 */
function updateData(el, newEl) {
    var ulEl = newEl.find('.' + DEFAULTS.classes.options);
    var placeholderEl = newEl.find('.' + DEFAULTS.classes.placeholder);
    var placeholder = getPlaceholder(newEl);
    var layoutTmpl = tmplOptions(getOptions(newEl));
    var selectValue = getInitialValue(el);

    ulEl.html(layoutTmpl);
    placeholderEl.html(placeholder);

    // Set events
    // TODO: This shouldn't be like this! It should be a comp!
    setEvents({
        el: el,
        newEl: newEl
    });

    // Set values
    setValue(newEl, selectValue, true);
}

/**
 * Destroy
 * @param  {element} el
 * @param  {element} newEl
 */
function destroy(el, newEl) {
    var placeholderEl = newEl.find('.' + DEFAULTS.classes.placeholder);
    var valueEl = newEl.find('.' + DEFAULTS.classes.value);
    var optionsEl = newEl.find('.' + DEFAULTS.classes.options);

    placeholderEl.remove();
    valueEl.remove();
    optionsEl.remove();
    el.unwrap('.' + DEFAULTS.classes.wrap);
}

/**
 * Creates a custom select
 * @param  {object} comp
 * @return {object}
*/
function init(comp) {
    var targetClose = comp.targetClose;
    var selectValue = getInitialValue(comp);

    // Cache for later use
    comp.all = !!targetClose ? $(targetClose) : null;
    comp.newEl = setLayout(comp);

    // Set events
    setEvents(comp);

    // Set values
    setValue(comp.newEl, selectValue, true);

    return comp;
}

// --------------------------------
// Exports

module.exports = {
    init: function (el, data) {
        var comp = component.getComp(data, DEFAULTS);
        comp = component.init(el, comp);
        return init(comp);
    },
    open: function (el) {
        var newEl = getWrap(el);
        newEl.length && open(newEl);
    },
    close: function (el) {
        var newEl = getWrap(el);
        newEl.length && close(newEl);
    },
    setValue: function (el, val) {
        var newEl = getWrap(el);
        newEl.length && setValue(newEl, val);
    },
    setEmpty: function (el) {
        var newEl = getWrap(el);
        newEl.length && setEmpty(newEl);
    },
    updateData: function (el) {
        var newEl = getWrap(el);
        newEl.length && updateData(el, newEl);
    },
    destroy: function (el) {
        var newEl = getWrap(el);
        newEl.length && destroy(el, newEl);
    }
};
