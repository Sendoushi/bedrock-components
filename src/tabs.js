'use strict';

import $ from 'jquery';
import { Component as Comp } from 'bedrock2/src/component/jquery.js';

// --------------------------------
// Class

class Component extends Comp {
    // Constructor
    constructor($el) {
        $el = $el instanceof $ ? $el : $($el);

        super($el, { noRender: true, tmpl: '' });

        // Cache data
        this._$els = this._$els || {};
        this._comps = this._comps || {};

        // Cache elements
        this._$els.menu = this._$el.find('.tabs__menu');
        this._$els.items = this._$els.menu.find('.tabs__item');
        this._$els.content = this._$el.find('.tabs__content');

        // Set the active one
        const initActive = $el[0].getAttribute('data-init');
        initActive && initActive.length && this.setActive(initActive);

        // Set resize basics
        this._onResize();

        // Add events
        this._$els.items.on('click', this._onItem.bind(this));
        $el.on('tab.getactive', (evt, cb) => {
            cb($el[0].getAttribute('data-tab'));
        });
        $el.on('tab.setactive', (evt, tab) => this.setActive(tab));
    }

    /**
     * Sets tab active
     *
     * @param {string} target
     */
    setActive(target) {
        // Remove active from other content
        this._$els.items.removeClass('is-active');
        this._$els.content.removeClass('is-active');

        if (!target || !target.length) {
            return;
        }

        // Add active to the right content
        this._$el[0].setAttribute('data-tab', target);
        this._$els.items.filter(`[data-tab="${target}"]`).addClass('is-active');
        this._$els.content.filter(`[data-tab="${target}"]`).addClass('is-active');
    }

    // -----------------------------------------

    /**
     * On item handler
     *
     * @param {event} evt
     */
    _onItem(evt) {
        evt.preventDefault();

        const tab = evt.currentTarget.getAttribute('data-tab');

        // Set the right active
        this.setActive(tab);

        // Inform
        this._$el.trigger('tab.click', tab);
    }
}

export { Component };
