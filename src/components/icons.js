/* @flow *//* :: import type {Render, Init} from './_test/icons.flow.js' */
'use strict';

import component from 'bedrock/src/component.js';
import doT from 'dot';

const DEFAULTS = {
    rawTmpl: '',
    tmpl: (comp, data) => comp.rawTmpl(data)
};

// -----------------------------------------
// Functions

/**
 * Renders the component
 * @param  {object} comp
 */
const render/* :: :Render */ = (comp) => component.render(comp, {});

/**
 * Initializes
 * @param  {object} comp
 * @return {object}
 */
const init/* :: :Init */ = (comp) => {
    // Lets remove any width, height and viewbox
    const rawTmpl = comp.rawTmpl
        .replace(/ width="([^"]+)"/g, '')
        .replace(/ height="([^"]+)"/g, '')
        .replace(/ viewBox="([^"]+)"/g, '')
        .replace(/ viewbox="([^"]+)"/g, '');

    comp.rawTmpl = doT.template(rawTmpl);

    return comp;
};

// -------------------------------------------
// EXPORT

export default {
    init: (el, data) => {
        let comp = component.getComp(data, DEFAULTS);
        comp = component.init(el, comp);

        return (!el || !el.length) ? comp : init(comp);
    },
    render,
    destroy: component.destroy
};
