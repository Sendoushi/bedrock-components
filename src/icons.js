'use strict';

import { Component as Comp } from 'bedrock/src/component/jquery.js';

// -----------------------------------------
// Functions

/**
 * Gets template string
 *
 * @param {string} rawTmpl
 * @returns {string}
 */
const getTmplString = (rawTmpl) => {
    const tmpl = rawTmpl;

    return tmpl
    .replace(/ width="([^"]+)"/g, '')
    .replace(/ height="([^"]+)"/g, '')
    .replace(/ viewBox="([^"]+)"/g, '')
    .replace(/ viewbox="([^"]+)"/g, '');
};

/**
 * Gets template right
 *
 * @param {string} rawTmpl
 * @returns {string|function}
 */
const getTmpl = (rawTmpl) => {
    if (rawTmpl === undefined) {
        return rawTmpl;
    }

    if (typeof rawTmpl === 'string') {
        return getTmplString(rawTmpl);
    }

    if (rawTmpl !== undefined && typeof rawTmpl === 'function' && typeof rawTmpl !== 'string') {
        return (data) => getTmplString(rawTmpl(data));
    }

    return rawTmpl;
};

// --------------------------------
// Class

class Component extends Comp {
    // Constructor
    constructor($el, data = {}) {
        super($el, {
            els: data.els,
            tmpl: getTmpl(data.tmpl),
            render: data.render,
            comps: data.comps,
            state: data.state
        });
    }
}
export { Component };
