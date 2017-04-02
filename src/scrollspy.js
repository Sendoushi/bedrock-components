'use strict';

import $ from 'jQuery';
import mailbox from 'bedrock2/src/mailbox.js';
import { Component as Comp } from 'bedrock2/src/component/jquery.js';

// --------------------------------
// Class

class Component extends Comp {
    // Constructor
    constructor($el, data = {}) {
        $el = $el instanceof $ ? $el : $($el);

        super($el, { noRender: true, tmpl: '' });

        // Cache initial data
        this._data = {
            headGutter: data.headGutter || 100,
            gutter: data.gutter || 100,
            bottomGutter: data.bottomGutter || 100,
            throttle: data.throttle || 50
        };

        // Cache elements
        this._$els.items = data.$els.items || [];
        this._$els.offset = data.$els.offset || [];

        // Set initial
        this._scrollToCurrent();

        // Add events
        $(window).on('scroll.scrollspy', () => {
            this._throttler && clearTimeout(this._throttler);
            this._throttler = setTimeout(() => window.requestAnimationFrame(this._onScroll.bind(this)), this._data.throttle);
        });

        this._mbId = mailbox.on('scrollspy.target', this._scrollToTarget.bind(this));
    }

    /**
     * Destroy
     */
    destroy() {
        this._animThrottle && clearTimeout(this._animThrottle);
        this._throttler && clearTimeout(this._throttler);
        $(window).off('scroll.scrollspy');
        mailbox.off('scrollspy.target', this._mbId);

        super.destroy();

        return this;
    }

    // -----------------------------------------

    /**
     * Handles scroll event
     * @param  {object} comp
     */
    _onScroll() {
        const offsetHeight = this._$els.offset ? this._$els.offset.height() : 0;
        const scroll = $(window).scrollTop();
        const scrollerHeight = $(window)[0].innerHeight;
        const docScrollHeight = document.body.scrollHeight;
        const scrollTo = scroll + offsetHeight;
        const items = [];

        // Lets parse items as we need
        this._$els.items.each((i, el) => {
            const top = $(el).offset().top;
            items.push({ top, el });
        });

        // No need to go further...
        if (!items.length) { return; }

        // Find the right item
        const item = items.reduce((a, b) => {
            let aDiff = scrollTo - a.top;
            let bDiff = scrollTo - b.top;

            aDiff = (aDiff < 0) ? aDiff * -1 : aDiff;
            bDiff = (bDiff < 0) ? bDiff * -1 : aDiff;

            return aDiff < bDiff ? a : b;
        });

        // Now lets inform of the item
        $(item.el).trigger('scrollspy.hit');
        mailbox.send('scrollspy.hit', item.el);

        // Lets find if hit top or bottom
        if (scrollerHeight + scroll + this._data.bottomGutter >= docScrollHeight) {
            mailbox.send('scrollspy.hitbottom');
        } else if (scroll <= this._data.headGutter) {
            mailbox.send('scrollspy.hittop');
        }
    }

    /**
     * Scroll to target
     *
     * @param {object} comp
     * @param {boolean} isDone
     * @returns
     */
    _scrollToTarget(target, isDone) {
        const block = this._$els.items.filter(target);
        let top;

        // Find the right block
        if (!block || !block.length) { return; }

        // Animate there...
        if (this._$els.offset) {
            if (typeof this._$els.offset === 'object') {
                top = block.offset().top - this._$els.offset.height();
            } else {
                top = block.offset().top - this._$els.offset;
            }
        } else {
            top = block.offset().top;
        }

        $('html, body').finish().animate({ scrollTop: top }, 500);

        // Lets check if it is on the right place
        if (isDone !== true) {
            this._animThrottle && clearTimeout(this._animThrottle);
            this._animThrottle = setTimeout(this._scrollToTarget.bind(this, target, true), 250);
        }
    }

    /**
     * Scrolls to current item
     *
     * @param {event} evt
     * @returns
     */
    _scrollToCurrent(evt) {
        const href = window.location.hash;

        if (!/^#[^ ]+$/.test(href)) {
            return false;
        }

        evt && evt.preventDefault();
        this._scrollToTarget(`#${href.slice(1)}`, true);
    }
}

export { Component };
