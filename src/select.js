'use strict';
/* global Promise */
// TODO: We should convert this better

import $ from 'jquery';
import component from 'bedrock/src/component.js';

const DEFAULTS = {
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
const getWrap = (el) => el.closest(`.${DEFAULTS.classes.wrap}`);

/**
 * Gets options from element
 * @param  {element} el
 * @return {array}
 */
const getOptions = (el) => {
    const optionsEl = el.find('option');
    const options = [];

    // Lets retrieve the options
    optionsEl.each(() => {
        const optionVal = $(this).attr('value');
        const optionName = $(this).text();

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
const getPlaceholder = (el) => {
    const optionsEl = el.find('option');
    const possiblePlaceholder = optionsEl.filter('[value=""]').first().text();
    const placeholder = el.attr('data-placeholder') || possiblePlaceholder || '';

    return placeholder;
};

/**
 * Get initial value
 * @param  {element} el
 * @return {string}
 */
const getInitialValue = (el) => {
    let hasPlaceholder = el.attr('data-placeholder');
    let selectValue = el.attr('data-value') || '';

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
const tmplOptions = (opts) => opts.map(
    (opt) => `<li class="${DEFAULTS.classes.option}" data-value="${opt.val}">${opt.name}</li>`
).join('');

/**
 * Layouts the select
 * @param  {jquery} el
 * @return {jquery}
 */
const setLayout = (el) => {
    const hasError = el.hasClass(DEFAULTS.classes.error);
    const parent = el.parent();
    const placeholder = getPlaceholder(el);
    const options = getOptions(el);
    let layoutTmpl = '';

    // Wrap the select element in a div
    if (!parent.hasClass(DEFAULTS.classes.wrap)) {
        el.wrap(`<div class="${DEFAULTS.classes.wrap}"></div>`);
    }

    el.addClass(DEFAULTS.classes.set);
    const newEl = el.closest(`.${DEFAULTS.classes.wrap}`);

    hasError && el.addClass(DEFAULTS.classes.error);

    // Lets varruct the right layout
    layoutTmpl += `<div class="${DEFAULTS.classes.placeholder}">${placeholder}</div>`;
    layoutTmpl += `<div class="${DEFAULTS.classes.value}"></div>`;
    layoutTmpl += `<ul class="${DEFAULTS.classes.options}">${tmplOptions(options)}</ul>`;

    // Finally add it
    newEl.append(layoutTmpl);

    return newEl;
};

/**
 * Open select
 * @param  {jquery} el
 */
const open = (el) => el.addClass(DEFAULTS.classes.active);

/**
 * Close select
 * @param  {jquery} el
 */
const close = (el) => { el.removeClass(DEFAULTS.classes.active); }

/**
 * Sets value
 * @param  {jquery} el
 * @param  {string} val
 * @param  {boolean} isFirst
 * @param  {boolean} force
 */
const setValue = (el, val, isFirst, force) => {
    const valEl = el.find(`.${DEFAULTS.classes.value}`);
    const item = el.find(`li[data-value="${val}"]`).first();
    let itemText = item.text();
    const selectEl = el.find('select');
    const hasSelected = selectEl.attr('data-selected');
    const selectEmpty = selectEl.attr('data-empty') || '';
    const oldVal = selectEl.val();

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
const setEmpty = (el) => setValue(el, '', false, true);

/**
 * Select click handler
 * @param  {object} comp
 * @param  {event} evt
 */
const onSelectClick = (comp, evt) => {
    evt.stopPropagation();

    // Close all others
    comp.all && comp.all.filter(`.${DEFAULTS.classes.set}`).each(function () {
        const wrapper = $(this).closest(DEFAULTS.classes.wrap);

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
};

/**
 * Item click handler
 * @param  {object} comp
 * @param  {event} evt
 */
const onItemClick = (comp, evt) => {
    const clickVal = $(evt.currentTarget).attr('data-value');

    // Set values an close
    setValue(comp.newEl, clickVal);
    close(comp.newEl);
};

/**
 * Sets events in the element
 * @param  {object} comp
 */
const setEvents = (comp) => {
    const el = comp.newEl;
    const valEl = el.find(`.${DEFAULTS.classes.value}`);
    const listItems = el.find('li');

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
};

/**
 * Update data
 * @param  {element} el
 * @param  {element} newEl
 */
const updateData = (el, newEl) => {
    const ulEl = newEl.find(`.${DEFAULTS.classes.options}`);
    const placeholderEl = newEl.find(`.${DEFAULTS.classes.placeholder}`);
    const placeholder = getPlaceholder(newEl);
    const layoutTmpl = tmplOptions(getOptions(newEl));
    const selectValue = getInitialValue(el);

    ulEl.html(layoutTmpl);
    placeholderEl.html(placeholder);

    // Set events
    // TODO: This shouldn't be like this! It should be a comp!
    setEvents({ el, newEl });

    // Set values
    setValue(newEl, selectValue, true);
};

/**
 * Destroy
 * @param  {element} el
 * @param  {element} newEl
 */
const destroy = (el, newEl) => {
    const placeholderEl = newEl.find(`.${DEFAULTS.classes.placeholder}`);
    const valueEl = newEl.find(`.${DEFAULTS.classes.value}`);
    const optionsEl = newEl.find(`.${DEFAULTS.classes.options}`);

    placeholderEl.remove();
    valueEl.remove();
    optionsEl.remove();
    el.unwrap(`.${DEFAULTS.classes.wrap}`);

    // TODO: ...
    // component.destroy(comp);
};

/**
 * Creates a custom select
 * @param  {object} comp
 * @return {object}
*/
const init = (comp) => {
    const targetClose = comp.targetClose;
    const selectValue = getInitialValue(comp.el);

    // Cache for later use
    comp.all = !!targetClose ? $(targetClose) : null;
    comp.newEl = setLayout(comp.el);

    // Set events
    setEvents(comp);

    // Set values
    setValue(comp.newEl, selectValue, true);

    return comp;
};

// --------------------------------
// Exports

export default {
    init: (el, data) => {
        let comp = component.getComp(data, DEFAULTS);
        comp = component.init(el, comp);
        return init(comp);
    },
    open: (el) => {
        const newEl = getWrap(el);
        newEl.length && open(newEl);
    },
    close: (el) => {
        const newEl = getWrap(el);
        newEl.length && close(newEl);
    },
    setValue: (el, val) => {
        const newEl = getWrap(el);
        newEl.length && setValue(newEl, val);
    },
    setEmpty: (el) => {
        const newEl = getWrap(el);
        newEl.length && setEmpty(newEl);
    },
    updateData: (el) => {
        const newEl = getWrap(el);
        newEl.length && updateData(el, newEl);
    },
    destroy: (el) => {
        const newEl = getWrap(el);
        newEl.length && destroy(el, newEl);
    }
};
