/* eslint-disable strict */'use strict';/* eslint-enable strict */

var $ = require('jquery');
var component = require('bedrock/src/component.js');
var mailbox = require('bedrock/src/mailbox.js');

var DEFAULTS = {
    headGutter: 100,
    gutter: 100,
    bottomGutter: 100,
    throttle: 50,
    els: {
        scroller: $(window),
        header: null,
        items: null
    }
};

// --------------------------------
// Functions

/**
 * Handles scroll event
 * @param  {object} comp
 */
function onScroll(comp) {
    var headerHeight = comp.els.header && comp.els.header.height();
    var scroll = comp.els.scroller.scrollTop();
    var scrollerHeight = comp.els.scroller[0].innerHeight;
    var docScrollHeight = document.body.scrollHeight;
    var scrollTo = scroll + headerHeight;
    var items = [];
    var item;

    // Lets parse items as we need
    comp.els.items.each(function (i, el) {
        var top = $(el).offset().top;
        (top < scrollTo + comp.gutter) && items.push({ top: top, el: el });
    });

    item = items.reduce(function (a, b) {
        return (scrollTo - a.top) > (scrollTo - b.top) ? b : a;
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
}

/**
 * Creates a custom select
 * @param  {object} comp
 * @return {object}
*/
function init(comp) {
    // No need to go further
    if (!comp.els || !comp.els.items || !comp.els.items.length) {
        return comp;
    }

    // Set initial
    onScroll(comp);

    // Add events
    comp.els.scroller.on('scroll.scrollspy', function () {
        comp.throttler && clearTimeout(comp.throttler);
        comp.throttler = setTimeout(function () {
            window.requestAnimationFrame(onScroll.bind(null, comp));
        }, comp.throttle);
    });

    return comp;
}

// --------------------------------
// Export

module.exports = {
    init: function (data) {
        var comp = component.getComp(data, DEFAULTS);
        comp = component.init(null, comp);

        // So that the elements get right
        comp.els = comp.els || {};
        if (data && data.els) {
            comp.els.scroller = data.els.scroller || comp.els.scroller;
            comp.els.header = data.els.header || comp.els.header;
            comp.els.items = data.els.items || comp.els.items;
        } else {
            comp.els.scroller = DEFAULTS.els.scroller;
            comp.els.header = DEFAULTS.els.header;
            comp.els.items = DEFAULTS.els.items;
        }

        return init(comp);
    },
    destroy: function (comp) {
        comp.throttler && clearTimeout(comp.throttler);
        comp.els.scroller.off('scroll.scrollspy');
    }
};
