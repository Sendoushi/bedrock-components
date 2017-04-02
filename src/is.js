'use strict';
/* global window, document, module, process, navigator */

import $ from 'jQuery';

// -----------------------------------------
// Functions

/**
 * Is it ie?
 * @return {boolean}
 */
const ie = () => !!(navigator.userAgent.toLowerCase().match(/trident\/7\./));

/**
 * Is edge
 * @return {Boolean}
 */
const edge = () => !!(/edge\/\d./i.test(navigator.userAgent.toLowerCase()));

/**
 * Is android
 * @return {Boolean}
 */
const android = () => !!(navigator.userAgent.toLowerCase().match(/android/));

/**
 * Is ios
 * @return {Boolean}
 */
const ios = () => !!(navigator.userAgent.toLowerCase().match(/(ipod|iphone|ipad)/));

/**
 * Is it mobile?
 * @return {boolean}
 */
const mobile = () => {
    /* eslint-disable max-len */
    if (/Android|Tablet PC|PalmOS|PalmSource|smartphone|GT-P1000|SGH-T849|SHW-M180S|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows CE|Windows Mobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)) {
        return true;
    } else if (!!(navigator.userAgent.toLowerCase().match(/(mobile)/))) {
        return true;
    }
    /* eslint-enable max-len */

    return false;
};

/**
 * Check if device is touch
 * @return {boolean}
 */
const touch = () => !!('ontouchstart' in window) || !!('msmaxtouchpoints' in window.navigator);

/**
 * Check if media is...
 * @param {string} target
 * @return {boolean}
 */
const media = (target) => {
    const body = $('body');

    if (target === 'mobile') {
        return !!(body.find('> .is-mobile').is(':visible'));
    } else if (target === 'tablet') {
        return !!(body.find('> .is-tablet').is(':visible'));
    } else if (target === 'desktop') {
        return !(body.find('> .is-mobile').is(':visible')) &&
               !(body.find('> .is-tablet').is(':visible'));
    } else if (target === 'over') {
        return !!(body.find('> .is-over').is(':visible'));
    }

    return false;
};

/**
 * Check if url is valid
 *
 * @param {string} urlTest
 * @returns {boolean}
 */
const url = (urlTest) => !!(/(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/.test(urlTest));

// ------------------------------------
// Export

export default { ie, edge, ios, android, mobile, touch, media, url };
