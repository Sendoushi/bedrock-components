/* eslint-disable strict */'use strict';/* eslint-enable strict */
// TODO: We should convert this better

var $ = require('jquery');
var component = require('bedrock/src/component.js');

var DEFAULTS = {
    targetClose: null,
    classes: {
        anchor: 'accordion__anchor',
        content: 'accordion__content',
        unactive: 'is-out'
    },
    events: {
        open: 'accordion.open',
        close: 'accordion.close',
        anchorClick: 'accordion.anchor-click'
    }
};

// --------------------------------
// Functions

/**
 * Check if accordion is open
 * @param  {element}  el
 * @return {Boolean}
 */
function isOpen(el) {
    return !el.hasClass(DEFAULTS.classes.unactive);
}

/**
 * Finds right height
 * @param {object} obj
 * @param  {boolean} force
 * @return {number}
 */
function findHeight(obj, force) {
    var el = obj.el;
    var content = obj.content;
    var oldOut = el.hasClass(DEFAULTS.classes.unactive);
    var height = el.attr('data-height');
    var oldStyle;

    // Cache elements
    oldStyle = content.attr('style');

    // Lets get the right height
    if (!height || height !== '' || force) {
        el.removeClass(DEFAULTS.classes.unactive);
        content.removeAttr('style');

        // Reforce the redraw
        content[0].offsetHeight;

        height = content.outerHeight() + 50;

        // Now lets cache
        el.attr('data-height', height);
        content.attr('style', oldStyle);

        if (oldOut) {
            el.addClass(DEFAULTS.classes.unactive);
        }

        // Reforce the redraw
        content[0].offsetHeight;
    }

    return height;
}

/**
 * Sets the right height
 * @param {object} obj
 * @param  {boolean} force
 */
function setRightHeight(obj, force) {
    // Set the new height
    obj.content.each(function (i, val) {
        var findObjHeight = function () {
            var height = findHeight({
                el: obj.el,
                content: $(val)
            }, force);

            // We need to safecase because it isn't working sometimes...
            if (height !== 50) {
                $(val).attr('style', 'max-height:' + height + 'px');
            } else {
                // setTimeout(findObjHeight, 500);
            }
        };

        // Find the height then...
        findObjHeight();
    });
}

/**
 * Updates accordion to the right size
 * @param {object} obj
 */
function updateSize(obj) {
    var el = obj.el;

    if (!isOpen(el)) {
        setRightHeight(obj, true);
    } else {
        // Set the new height
        obj.content.each(function (i, val) {
            findHeight({ el: obj.el, content: $(val) }, true);
        });
    }
}

/**
 * Open accordion
 * @param  {element} el
 */
function open(el) {
    el.each(function (i, val) {
        var $val = $(val);
        var anchorEl = $val.find('.' + DEFAULTS.classes.anchor);
        var contentEl = $val.find('.' + DEFAULTS.classes.content);
        var obj = {
            el: $val,
            anchor: anchorEl,
            content: contentEl
        };

        setRightHeight(obj);
        $val.removeClass(DEFAULTS.classes.unactive);

        // Announce the event
        $val.trigger(DEFAULTS.events.open);
    });
}

/**
 * Close accordion
 * @param  {element} el
 */
function close(el) {
    el.each(function (i, val) {
        var $val = $(val);
        var contentEl = $val.find('.' + DEFAULTS.classes.content);

        contentEl.attr('style', 'max-height:0; padding-top:0; padding-bottom: 0');
        $val.addClass(DEFAULTS.classes.unactive);

        // Announce the event
        $val.trigger(DEFAULTS.events.close);
    });
}

/**
 * Handler click
 * @param  {object} obj
 * @param  {event} evt
 */
function handleClick(obj, evt) {
    var el = obj.el;

    setRightHeight(obj);

    evt.preventDefault();
    evt.stopPropagation();

    // Now lets take care of the click
    !isOpen(el) ? open(el) : close(el);
    obj.closeAll && close(obj.closeAll.filter(function (i, element) {
        return !element.is(obj.el);
    }));

    // Announce the event
    el.trigger(DEFAULTS.events.anchorClick);
}

/**
 * Construct events for accordion
 * @param  {object} comp
 * @param  {object} obj
 */
function setEvents(comp, obj) {
    var throttler;

    // Force to remove the height
    obj.content.removeAttr('style');

    // Remove old event
    obj.anchor.off('click');

    // Now lets set the events
    obj.anchor.on('click', handleClick.bind(null, obj));
    $(window).on('resize', function () {
        throttler && clearTimeout(throttler);
        throttler = setTimeout(function () {
            var isItOpen = isOpen(obj.el);

            // No longer true
            obj.el.removeAttr('data-height');

            // Lets just reset
            if (isItOpen) {
                close(obj.el);
                open(obj.el);
            }
        });
    });

    // Check if it should be closed
    obj.el.hasClass(DEFAULTS.classes.unactive) && close(obj.el);
}

/**
 * Creates a custom select
 * @param  {object} comp
 * @return {object}
*/
function init(comp) {
    var targetClose = comp.targetClose;

    // Cache for later use
    // TODO: Close accordions
    comp.all = !!targetClose ? $(targetClose) : null;

    // Lets go per el
    comp.el.each(function () {
        var el = $(this);
        var anchorEl = el.find('.' + DEFAULTS.classes.anchor);
        var contentEl = el.find('.' + DEFAULTS.classes.content);

        // Set accordion events
        setEvents(comp, {
            el: el,
            anchor: anchorEl,
            content: contentEl,
            closeAll: comp.all
        });
    });

    return comp;
}

// --------------------------------
// Export

module.exports = {
    init: function (el, data) {
        var comp = component.getComp(data, DEFAULTS);
        comp = component.init(el, comp);
        return init(comp);
    },
    updateSize: updateSize,
    isOpen: isOpen,
    open: open,
    close: close,
    destroy: function () {}
};
