/* eslint-disable strict */'use strict';/* eslint-enable strict */

var $ = require('jquery');
var component = require('bedrock/src/component.js');
var mailbox = require('bedrock/src/mailbox.js');

var DEFAULTS = {
    classes: {
        wrap: 'modal',
        active: 'is-in',
        content: 'modal__content',
        disableScroll: 'disable-scroll',
        closeButton: 'modal__close'
    },
    events: {
        in: 'modal.in',
        out: 'modal.out'
    }
};

// --------------------------------
// Functions

/**
 * On toggle handler
 * @param  {object} comp
 * @param  {event} evt
 */
function onClose(comp, evt) {
    evt.preventDefault();

    comp.el[0].className = comp.classes.wrap;
    $(document.body).removeClass(comp.classes.disableScroll);
}

/**
 * On modal open
 * @param  {object} comp
 * @param  {object} data
 */
function onOpen(comp, data) {
    var close;

    comp.content.html(data.tmpl);

    comp.el[0].className = comp.classes.wrap + ' ' + comp.classes.active + ' ' + (data.class || '');
    $(document.body).addClass(comp.classes.disableScroll);

    // Lets take care of other stuff
    close = comp.el.find('.' + comp.classes.closeButton);

    // Add events
    close.on('click', onClose.bind(null, comp));
}

/**
 * Creates a modal
 * @param  {object} comp
 * @return {object}
 */
function init(comp) {
    comp.content = comp.el.find('.' + comp.classes.content);

    // Add events
    comp.el.on('click', onClose.bind(null, comp));
    comp.content.on('click', function (evt) {
        evt.stopPropagation();
    });

    // Set of specific events
    mailbox.on(comp.events.in, onOpen.bind(null, comp));
    comp.el.on(comp.events.in, onOpen.bind(null, comp));
    mailbox.on(comp.events.out, onClose.bind(null, comp));
    comp.el.on(comp.events.out, onClose.bind(null, comp));

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
    destroy: function () {}
};
