'use strict';

import $ from 'jquery';
import component from 'bedrock/src/component.js';
import mailbox from 'bedrock/src/mailbox.js';

const DEFAULTS = {
    headGutter: 100,
    gutter: 100,
    bottomGutter: 100,
    throttle: 50,
    els: {
        offset: null,
        items: null
    }
};

// --------------------------------
// Functions

/**
 * Handles scroll event
 * @param  {object} comp
 */
const onScroll = (comp) => {
    const headerHeight = comp.els.offset && comp.els.offset.height();
    const scroll = $(window).scrollTop();
    const scrollerHeight = $(window)[0].innerHeight;
    const docScrollHeight = document.body.scrollHeight;
    const scrollTo = scroll + headerHeight;
    const items = [];

    // Lets parse items as we need
    comp.els.items.each((i, el) => {
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
    if (scrollerHeight + scroll + comp.bottomGutter >= docScrollHeight) {
        mailbox.send('scrollspy.hitbottom');
    } else if (scroll <= comp.headGutter) {
        mailbox.send('scrollspy.hittop');
    }
};

/**
 * Scroll to target
 *
 * @param {object} comp
 * @param {string} target
 * @param {boolean} isDone
 * @returns
 */
const scrollToTarget = (comp, target, isDone) => {
    const block = comp.els.items.filter(target);
    let top;

    // Find the right block
    if (!block || !block.length) { return; }

    // Animate there...
    if (comp.els.offset) {
        if (typeof comp.els.offset === 'object') {
            top = block.offset().top - comp.els.offset.height();
        } else {
            top = block.offset().top - comp.els.offset;
        }
    } else {
        top = block.offset().top;
    }

    $('html, body').finish().animate({ scrollTop: top }, 500);

    // Lets check if it is on the right place
    if (isDone !== true) {
        comp.animThrottle && clearTimeout(comp.animThrottle);
        comp.animThrottle = setTimeout(scrollToTarget.bind(null, comp, target, true), 250);
    }
};

/**
 * Scrolls to current item
 *
 * @param {object} comp
 * @param {event} evt
 * @returns
 */
const scrollToCurrent = (comp, evt) => {
    const href = window.location.hash;

    if (!/^#[^ ]+$/.test(href)) {
        return false;
    }

    evt && evt.preventDefault();
    scrollToTarget(comp, `#${href.slice(1)}`, true);
};

/**
 * Destroys
 * @param  {object} comp
 */
const destroy = (comp) => {
    comp.animThrottle && clearTimeout(comp.animThrottle);
    comp.throttler && clearTimeout(comp.throttler);
    $(window).off('scroll.scrollspy');
    mailbox.off('scrollspy.target', comp.onId);

    component.destroy(comp);
};

/**
 * Creates a custom select
 * @param  {object} comp
 * @return {object}
*/
const init = (comp) => {
    // No need to go further
    if (!comp.els || !comp.els.items || !comp.els.items.length) {
        return comp;
    }

    // Set initial
    scrollToCurrent(comp);

    // Add events
    $(window).on('scroll.scrollspy', () => {
        comp.throttler && clearTimeout(comp.throttler);
        comp.throttler = setTimeout(() => window.requestAnimationFrame(onScroll.bind(null, comp)), comp.throttle);
    });

    comp.onId = mailbox.on('scrollspy.target', scrollToTarget.bind(null, comp));

    return comp;
};

// --------------------------------
// Export

export default {
    init: (data) => {
        let comp = component.getComp(data, DEFAULTS);
        comp = component.init(null, comp);

        // So that the elements get right
        comp.els = comp.els || {};
        if (data && data.els) {
            comp.els.offset = data.els.header || comp.els.offset;
            comp.els.items = data.els.items || comp.els.items;
        } else {
            comp.els.offset = DEFAULTS.els.header;
            comp.els.items = DEFAULTS.els.items;
        }

        return init(comp);
    },
    destroy
};
