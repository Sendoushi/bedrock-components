'use strict';

/* @aflow */
/* ::
import type {CompData, Close, Open} from './_test/modal.flow.js'
*/

import $ from 'jquery';
import template from 'lodash/template.js';
import { Component as Comp } from 'bedrock/src/component/jquery.js';
import mailbox from 'bedrock/src/mailbox.js';
import defaultTmpl from './_assets/modal.html';

// -----------------------------------------
// Functions

/**
 * Close
 *
 * @param {element} $el
 * @param {object} $els
 * @param {object} classes
 * @param {event} evt
 */
const close = ($el, $els, classes, evt) => {
    evt && evt.preventDefault();

    for (let i = 0; i < $el.length; i += 1) {
        $el[i].className = $el[i].className.replace(classes.active, '');
    }

    for (let i = 0; i < $els.scroll.length; i += 1) {
        $els.scroll[i].className = $els.scroll[i].className.replace(classes.disableScroll, '');
    }
};

/**
 * Open
 * @param {element} $el
 * @param {object} $els
 * @param {object} classes
 */
const open = ($el, $els, classes) => {
    for (let i = 0; i < $el.length; i += 1) {
        $el[i].className += ` ${classes.active}`;
    }

    for (let i = 0; i < $els.scroll.length; i += 1) {
        $els.scroll[i].className += ` ${classes.disableScroll}`;
    }
};

// --------------------------------
// Class

class Component extends Comp {
    // Constructor
    constructor($el/* :: :?jQueryElement */, data/* :: :CompData */ = {}) {
        const templateOptions = { interpolate: /{{([\s\S]+?)}}/g };

        // Now the extension...
        super($el, {
            els: data.els,
            tmpl: typeof data.tmpl === undefined ? template(defaultTmpl, templateOptions) : data.tmpl,
            render: data.render,
            comps: data.comps,
            state: data.state
        });

        // Set DEFAULTS
        this._scrollEl = data.scrollEl || $(document.body);
        this._classes = {
            disableScroll: 'disable-scroll',
            active: 'is-in',
            closeButton: 'modal__close',
            ...(data.classes || {})
        };

        this._events = {
            in: 'modal.in',
            out: 'modal.out',
            clickClose: 'click.modal',
            ...(data.events || {})
        };
    }

    // Render
    render() {
        const onOpenBound = open.bind(null, this._$el, this._$els, this._classes);
        const onCloseBound = close.bind(null, this._$el, this._$els, this._classes);

        // Destroy old stuff
        this.destroy();

        // Render it out... Possibly again
        super.render();

        // Lets cache elements
        this._$els.close = this._$el.find(`.${this._classes.closeButton}`);

        // Set new events
        this._mbIn = mailbox.on(this._events.in, onOpenBound);
        this._mbOut = mailbox.on(this._events.out, onCloseBound);
        this._$el.on(this._events.in, onOpenBound);
        this._$el.on(this._events.out, onCloseBound);

        return this;
    }

    // Destroy
    destroy() {
        this._mbIn && mailbox.off(this._events.in, this._mbIn);
        this._mbOut && mailbox.off(this._events.out, this._mbOut);
        this._$el.off(this._events.in);
        this._$el.off(this._events.out);
        this._$els.close && this._$els.close.off(this._events.clickClose);

        super.destroy();

        return this;
    }
}
export { Component };
