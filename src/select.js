'use strict';

import $ from 'jquery';
import { Component as Comp } from 'bedrock2/src/component/jquery.js';

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

// --------------------------------
// Functions

/**
 * Gets options from element
 * @param  {element} el
 * @return {array}
 */
const getOptions = el => {
    const options = [];

    el.find('option').each((i, val) => {
        options.push({ val: val.getAttribute('value'), name: val.textContent });
    });

    return options.filter(val => val.val && val.val !== '');
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
    const type = el[0].getAttribute('data-type') || 'a';
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
    newEl.attr('data-type', type);

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
const close = (el) => { el.removeClass(DEFAULTS.classes.active); };

// --------------------------------
// Class

class Component extends Comp {
    // Constructor
    constructor($el, data = {}) {
        $el = $el instanceof $ ? $el : $($el);

        super($el, { noRender: true, tmpl: '' });

        // Cache for later use
        if (data.targetClose) {
            this._$els.all = data.targetClose instanceof $ ? data.targetClose : $(data.targetClose);
        }
        this._$els.newEl = setLayout(this._$el);
        this._cacheEls();

        // Set values
        this._id = Math.random() * 100000;
        const selectValue = getInitialValue(this._$el);
        this.setValue(selectValue, true);

        this._addEvents();
    }

    /**
     * Update data
     */
    updateData() {
        const ulEl = this._$els.newEl.find(`.${DEFAULTS.classes.options}`);
        const placeholderEl = this._$els.newEl.find(`.${DEFAULTS.classes.placeholder}`);
        const placeholder = getPlaceholder(this._$els.newEl);
        const layoutTmpl = tmplOptions(getOptions(this._$els.newEl));
        const selectValue = getInitialValue(this._$el);

        ulEl.html(layoutTmpl);
        placeholderEl.html(placeholder);

        this._addEvents();
        this.setValue(selectValue, true);

        return this;
    }

    /**
     * Sets value
     * @param  {string} val
     * @param  {boolean} isFirst
     * @param  {boolean} force
     */
    setValue(val = '', isFirst = false, force = false) {
        const valEl = this._$els.newEl.find(`.${DEFAULTS.classes.value}`);
        const item = this._$els.newEl.find(`li[data-value="${val}"]`).first();
        let itemText = item.text();
        const selectEl = this._$els.newEl.find('select');
        const hasSelected = selectEl.attr('data-selected');
        const selectEmpty = selectEl.attr('data-empty') || '';
        const oldVal = selectEl.val();

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
            this._$els.newEl.removeClass(DEFAULTS.classes.isSet);
        } else {
            this._$els.newEl.addClass(DEFAULTS.classes.isSet);
        }

        // Select the right option
        selectEl.attr('data-value', val);
        selectEl.val(val);
        !isFirst && selectEl.trigger(DEFAULTS.events.change);
    }

    /**
     * Sets value empty
     */
    setEmpty() { this.setValue('', false, true); }

    /**
     * Open select
     */
    open() { open(this._$els.newEl); }

    /**
     * Close select
     */
    close() { close(this._$els.newEl); }

    /**
     * Destroy
     */
    destroy() {
        // Off events
        this._rmEvents();

        // Lets get the old layout here...
        const placeholderEl = this._$els.newEl.find(`.${DEFAULTS.classes.placeholder}`);
        const valueEl = this._$els.newEl.find(`.${DEFAULTS.classes.value}`);
        const optionsEl = this._$els.newEl.find(`.${DEFAULTS.classes.options}`);

        placeholderEl.remove();
        valueEl.remove();
        optionsEl.remove();
        this._$el.unwrap(`.${DEFAULTS.classes.wrap}`);

        super.destroy();

        return this;
    }

    // -----------------------------------------

    // _cacheEls
    _cacheEls() {
        this._$els.valEl = this._$els.newEl.find(`.${DEFAULTS.classes.value}`);
        this._$els.listItems = this._$els.newEl.find('li');
    }

    // _addEvents
    _addEvents() {
        this._rmEvents();

        // Add events
        this._$els.valEl.on('click.select', this._onSelectClick.bind(this));
        this._$els.listItems.on('click.select', this._onItemClick.bind(this));
        $(document.body).on(`click.select-${this._id}`, close.bind(null, this._$els.newEl));
    }

    // _rmEvents
    _rmEvents() {
        // Off events
        this._$els.valEl.off('click.select');
        this._$els.listItems.off('click.select');
        $(document.body).off(`click.select-${this._id}`);
    }

    /**
     * Select click handler
     * @param  {event} evt
     */
    _onSelectClick(evt) {
        const el = this._$el;
        const newEl = this._$els.newEl;

        evt.stopPropagation();


        // Close all others
        this._$els.all && this._$els.all.each(function () {
            const elToClose = $(this);
            if (!elToClose.is(el)) {
                close(elToClose.closest(`.${DEFAULTS.classes.wrap}`));
            }
        });

        // Lets check the one
        if (!newEl.hasClass(DEFAULTS.classes.active)) {
            this.open();
        } else {
            this.close();
        }
    }

    /**
     * Item click handler
     * @param  {event} evt
     */
    _onItemClick(evt) {
        const clickVal = $(evt.currentTarget).attr('data-value');

        // Set values an close
        this.setValue(clickVal);
        this.close();
    }
}

export { Component };
