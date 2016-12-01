/* eslint-disable strict */'use strict';/* eslint-enable strict */

// --------------------------------
// Export

/**
 * Helper for icon
 *
 * @param {any} name
 * @param {any} classes
 * @param {any} size
 * @returns
 */
module.exports = function (name, classes, size) {
    var tmpl = '';

    classes = (!!classes) ? ' ' + classes : '';
    size = size || 200;

    if (!name) {
        throw new Error('Name is needed to use the icon helper');
    }

    tmpl += '<span class="icon-wrapper icon-wrapper-' + name + classes + '">';
    tmpl += '<svg viewBox="0 0 ' + size + ' ' + size + '" class="icon icon-' + name + '">';
    tmpl += '<use xlink:href="#' + name + '"></use>';
    tmpl += '</svg></span>';

    return tmpl;
};
