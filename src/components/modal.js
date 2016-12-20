'use strict';

import $ from 'jquery';
import component from 'bedrock/src/component.js';
import mailbox from 'bedrock/src/mailbox.js';

const DEFAULTS = {
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
const onClose = (comp, evt) => {
    evt.preventDefault();

    comp.el[0].className = comp.classes.wrap;
    $(document.body).removeClass(comp.classes.disableScroll);
};

/**
 * On modal open
 * @param  {object} comp
 * @param  {object} data
 */
const onOpen = (comp, data) => {
    comp.content.html(data.tmpl);

    comp.el[0].className = `${comp.classes.wrap} ${comp.classes.active} ${(data.class || '')}`;
    $(document.body).addClass(comp.classes.disableScroll);

    // Lets take care of other stuff
    const close = comp.el.find(`.${comp.classes.closeButton}`);

    // Add events
    close.on('click', onClose.bind(null, comp));
};

/**
 * Destroys
 * @param  {object} comp
 */
const destroy = (comp) => {
    mailbox.off(comp.events.in, comp.inMbId);
    mailbox.off(comp.events.out, comp.outMbId);
    comp.el.off(comp.events.in);
    comp.el.off(comp.events.out);

    component.destroy(comp);
};

/**
 * Creates a modal
 * @param  {object} comp
 * @return {object}
 */
const init = (comp) => {
    comp.content = comp.el.find(`.${comp.classes.content}`);

    // Add events
    comp.el.on('click', onClose.bind(null, comp));
    comp.content.on('click', evt => evt.stopPropagation());

    // Set of specific events
    comp.inMbId = mailbox.on(comp.events.in, onOpen.bind(null, comp));
    comp.outMbId = mailbox.on(comp.events.out, onClose.bind(null, comp));
    comp.el.on(comp.events.in, onOpen.bind(null, comp));
    comp.el.on(comp.events.out, onClose.bind(null, comp));

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
    destroy
};
