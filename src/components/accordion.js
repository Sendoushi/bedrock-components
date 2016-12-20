'use strict';
// TODO: We should convert this better

import $ from 'jquery';
import component from 'bedrock/src/component.js';

const DEFAULTS = {
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
const isOpen = (el) => !el.hasClass(DEFAULTS.classes.unactive);

/**
 * Finds right height
 * @param {object} obj
 * @param  {boolean} force
 * @return {number}
 */
const findHeight = (obj, force) => {
    const el = obj.el;
    const content = obj.content;
    const oldOut = el.hasClass(DEFAULTS.classes.unactive);
    let height = el.attr('data-height');

    // Cache elements
    const oldStyle = content.attr('style');

    if (height && height !== '' && !force) {
        return height;
    }

    // Lets get the right height
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

    return height;
};

/**
 * Sets the right height
 * @param {object} obj
 * @param  {boolean} force
 */
const setRightHeight = (obj, force) => {
    const findObjHeight = (val) => {
        const height = findHeight({
            el: obj.el,
            content: $(val)
        }, force);

        // We need to safecase because it isn't working sometimes...
        if (height !== 50) {
            $(val).attr('style', `max-height: ${height}px`);
        } else {
            // setTimeout(findObjHeight, 500);
        }
    };

    // Set the new height
    obj.content.each((i, val) => findObjHeight(val));
};

/**
 * Updates accordion to the right size
 * @param {object} obj
 */
const updateSize = (obj) => {
    const el = obj.el;

    if (!isOpen(el)) {
        setRightHeight(obj, true);
        return;
    }

    // Set the new height
    obj.content.each((i, val) => findHeight({
        el: obj.el,
        content: $(val)
    }, true));
};

/**
 * Open accordion
 * @param  {element} el
 */
const open = (el) => {
    const openEl = (val) => {
        const anchorEl = val.find(`.${DEFAULTS.classes.anchor}`);
        const contentEl = val.find(`.${DEFAULTS.classes.content}`);
        const obj = {
            el: val,
            anchor: anchorEl,
            content: contentEl
        };

        setRightHeight(obj);
        val.removeClass(DEFAULTS.classes.unactive);

        // Announce the event
        val.trigger(DEFAULTS.events.open);
    };

    el.each((i, val) => openEl($(val)));
};

/**
 * Close accordion
 * @param  {element} el
 */
const close = (el) => {
    const closeEl = (val) => {
        const contentEl = val.find(`.${DEFAULTS.classes.content}`);

        contentEl.attr('style', 'max-height:0; padding-top:0; padding-bottom: 0');
        val.addClass(DEFAULTS.classes.unactive);

        // Announce the event
        val.trigger(DEFAULTS.events.close);
    };

    el.each((i, val) => closeEl($(val)));
};

/**
 * Handler click
 * @param  {object} comp
 * @param  {event} evt
 */
const handleClick = (comp, evt) => {
    const anchorEl = $(evt.currentTarget);
    const el = comp.el.filter((i, val) => {
        const possible = $(val).find(`.${DEFAULTS.classes.anchor}`);
        return (possible.length && possible.is(anchorEl));
    });
    const contentEl = el.find(`.${DEFAULTS.classes.content}`);

    setRightHeight({
        el, anchor: anchorEl, content: contentEl
    });

    evt.preventDefault();
    evt.stopPropagation();

    // Now lets take care of the click
    !isOpen(el) ? open(el) : close(el);
    comp.all && close(comp.all.filter((i, item) => !item.is(el)));

    // Announce the event
    el.trigger(DEFAULTS.events.anchorClick);
};

/**
 * Handles resize
 *
 * @param {object} comp
 * @param {any} el
 */
const onResize = (comp) => {
    comp.throttler && clearTimeout(comp.throttler);
    comp.throttler = setTimeout(() => window.requestAnimationFrame(() => {
        comp.el.each((i, val) => {
            const el = $(val);
            const isItOpen = isOpen(el);
            el.removeAttr('data-height');

            // Lets just reset
            if (!isItOpen) {
                return;
            }

            close(el);
            open(el);
        });
    }), 250);
};

/**
 * Destroy component
 *
 * @param {object} comp
 */
const destroy = (comp) => {
    const anchorEl = comp.el.find(`.${DEFAULTS.classes.anchor}`);

    comp.throttler && clearTimeout(comp.throttler);

    anchorEl.off('click.accordion');
    $(window).off('resize.accordion');

    component.destroy(comp);
};

/**
 * Creates a custom select
 * @param  {object} comp
 * @return {object}
*/
const init = (comp) => {
    const targetClose = comp.targetClose;
    const anchorEl = comp.el.find(`.${DEFAULTS.classes.anchor}`);
    const contentEl = comp.el.find(`.${DEFAULTS.classes.content}`);

    // Cache for later use
    // TODO: Close accordions
    comp.all = !!targetClose ? $(targetClose) : null;

    // Force to remove the height
    contentEl.removeAttr('style');

    // Check if it should be closed
    comp.el.hasClass(DEFAULTS.classes.unactive) && close(comp.el);

    // Lets set events
    anchorEl.on('click.accordion', handleClick.bind(null, comp));
    $(window).on('resize.accordion', onResize.bind(null, comp));

    return comp;
};

// --------------------------------
// Export

export default {
    init: (el, data) => {
        let comp = component.getComp(data, DEFAULTS);
        comp = component.init(el, comp);

        return (!el || !el.length) ? comp : init(comp);
    },
    updateSize, isOpen, open, close, destroy
};
