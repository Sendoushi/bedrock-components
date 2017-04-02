'use strict';

import $ from 'jquery';
import { Component as Comp } from 'bedrock/src/component/jquery.js';

// --------------------------------
// Class

class Component extends Comp {
    // Constructor
    constructor($el, data = {}) {
        $el = $el instanceof $ ? $el : $($el);

        super($el, { noRender: true, tmpl: '' });

        // Cache data
        this._all = data.targetClose || null;

        // Cache elements
        this._$els.anchor = this._$el.find('.accordion__anchor');
        this._$els.content = this._$el.find('.accordion__content');

        // Force to remove the height
        this._$els.content.removeAttr('style');

        // Check if it should be closed
        !this.isOpen() && this.close();

        // Add events
        this._$el.on('close.accordion', this.close.bind(this));
        this._$els.anchor.on('click.accordion', this._onHandleClick.bind(this));
        $(window).on('resize.accordion', this._onResize.bind(this));
    }

    /**
     * Check if accordion is open
     * @return {Boolean}
     */
    isOpen() {
        return !this._$el.hasClass('is-out');
    }

    /**
     * Open accordion
     * @param  {element} el
     */
    open() {
        this._setRightHeight();
        this._$el.removeClass('is-out');

        // Announce the event
        this._$el.trigger('accordion.open');
    }

    /**
     * Close accordion
     * @param  {element} el
     */
    close() {
        this._$els.content.attr('style', 'max-height:0; padding-top:0; padding-bottom: 0');
        this._$el.addClass('is-out');

        // Announce the event
        this._$el.trigger('accordion.close');
    }

    /**
     * Destroy
     */
    destroy() {
        this._throttler && clearTimeout(this._throttler);

        this._$el.off('close.accordion');
        this._$els.anchor.off('click.accordion');
        $(window).off('resize.accordion');

        super.destroy();

        return this;
    }

    // -----------------------------------------

    /**
     * Handler click
     * @param  {event} evt
     */
    _onHandleClick(evt) {
        evt.preventDefault();
        evt.stopPropagation();

        this._setRightHeight();

        // Now lets take care of the click
        !this.isOpen() ? this.open() : this.close();

        // Should we close others?
        this._all && $(this._all).each((i, el) => {
            const $el = $(el);

            if ($el.is(this._$el)) {
                return;
            }

            // Trigger event to close
            $el.trigger('close.accordion');
        });

        // Announce the event
        this._$el.trigger('accordion.anchor-click');
    }

    /**
     * Handles resize
     *
     * @param {object} comp
     * @param {event} evt
     */
    _onResize() {
        this._throttler && clearTimeout(this._throttler);
        this._throttler = setTimeout(() => window.requestAnimationFrame(() => {
            this._$el.removeAttr('data-height');

            // No need to go further if it wasn't open
            if (!this.isOpen()) {
                return;
            }

            // Lets reset
            this.close();
            this.open();
        }), 250);
    }

    /**
     * Finds right height
     * @param  {boolean} force
     * @return {number}
     */
    _findHeight(force) {
        const oldOut = this._$el.hasClass('is-out');
        let height = this._$el.attr('data-height');

        // Cache elements
        const oldStyle = this._$els.content.attr('style');

        if (height && height !== '' && !force) {
            return height;
        }

        // Lets get the right height
        this._$el.removeClass('is-out');
        this._$els.content.removeAttr('style');

        // Reforce the redraw
        this._$els.content[0].offsetHeight;

        height = this._$els.content.outerHeight() + 50;

        // Now lets cache
        this._$el.attr('data-height', height);
        this._$els.content.attr('style', oldStyle);

        if (oldOut) {
            this._$el.addClass('is-out');
        }

        // Reforce the redraw
        this._$els.content[0].offsetHeight;

        return height;
    }

    /**
     * Updates accordion to the right size
     */
    _updateSize() {
        if (!this.isOpen()) {
            this._setRightHeight(true);
            return;
        }

        // Set the new height
        this._findHeight(true);
    }

    /**
     * Sets the right height
     * @param  {boolean} force
     */
    _setRightHeight(force) {
        const height = this._findHeight(force);

        // We need to safecase because it isn't working sometimes...
        if (height !== 50) {
            this._$els.content.attr('style', `max-height: ${height}px`);
        } else {
            // setTimeout(findObjHeight, 500);
        }
    }
}

export { Component };
