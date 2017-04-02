'use strict';

import $ from 'jquery';
import { Component as Slide } from './slide.js';
import { Component as Comp, getData as getDataModal } from './modal.js';

// --------------------------------
// Variables / Functions

/**
 * Gets vimeo template
 * @param  {object} item
 * @return {string}
 */
const getVimeoTmpl = (item) => {
    const regExp = /https?:\/\/(?:www\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/;
    const match = item.video.match(regExp);
    const id = match[3];
    const tmplVideo = `
        <div class="modal__gallery__raw">
            <iframe src="https://player.vimeo.com/video/${id}" width="640" height="360"
            frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>
        </div>
    `;

    return tmplVideo;
};

/**
 * Gets youtube template
 * @param  {object} item
 * @return {string}
 */
const getYoutubeTmpl = (item) => {
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = item.video.match(regExp);
    const id = match[2];
    const tmplVideo = `
        <div class="modal__gallery__raw">
            <iframe id="ytplayer" type="text/html" width="640" height="360" src="https://www.youtube.com/embed/${id}?autoplay=1&rel=0&origin=http://www.thinkshift.com" frameborder="0"></iframe>
        </div>
    `;

    return tmplVideo;
};

/**
 * Gets image template
 * @param  {object} item
 * @return {string}
 */
const getImgTmpl = (item) => `<div class="modal__gallery__raw" style=background-image:url(${item.img})></div>`;

/**
 * Is url vimeo?
 *
 * @param {string} url
 * @returns {string}
 */
const isVimeo = (url) => url.replace(/vimeo/g, '') !== url;

/**
 * Is url youtube?
 *
 * @param {string} url
 * @returns {string}
 */
const isYoutube = (url) => url.replace(/youtube/g, '') !== url;

/**
 * Gets default content template
 *
 * @param {object} data
 * @returns {string}
 */
const defaultContentTmpl = (data = {}) => {
    const targetImg = data.target && data.target.getAttribute('data-img');
    const targetVideo = data.target && data.target.getAttribute('data-video');
    let tmpl = '';

    // Lets add the gallery items
    if (data.gallery && data.gallery.length) {
        tmpl += '<div class="modal__gallery__content">';

        // Now lets iterate per the gallery
        for (let i = 0; i < data.gallery.length; i += 1) {
            const item = data.gallery[i];
            let newTmpl = '';

            if (item.video) {
                newTmpl = `
                    <div class="modal__gallery__item modal__gallery__video ${(targetVideo === item.video) ? 'is-target' : ''}">
                        ${isYoutube(item.video) && getYoutubeTmpl(item) || isVimeo(item.video) && getVimeoTmpl(item) || ''}
                    </div>
                `;
            } else if (item.img) {
                newTmpl = `
                    <div class="modal__gallery__item modal__gallery__img ${(targetImg === item.img) ? 'is-target' : ''}">
                        ${getImgTmpl(item)}
                    </div>
                `;
            }

            // Add the item...
            tmpl += newTmpl;
        }

        tmpl += '</div>';
    }

    return tmpl;
};

/**
 * Gets data from element
 *
 * @param {element} el
 * @returns {object}
 */
const getData = (el) => {
    const data = getDataModal(el);

    // Lets get specifics
    data.gallery = el.getAttribute('data-gallery');
    data.img = el.getAttribute('data-img');
    data.video = el.getAttribute('data-video');

    return data;
};

// --------------------------------
// Class

class Component extends Comp {
    // Constructor
    constructor($el, data = {}) {
        $el = $el instanceof $ ? $el : $($el);

        // Set defaults for render
        data.class = data.class || 'modal__gallery';
        data.contentFn = data.contentFn || defaultContentTmpl;
        data.gallery = (data.gallery && typeof data.gallery === 'string') ? JSON.parse(data.gallery) : [];

        // Lets get data from actions
        if (!data.gallery.length && data.actions && data.actions.length) {
            data.actions.each((i, val) => data.gallery.push(getData(val)));
        }

        super(data.modal, data);

        // Cache elements
        this._$els = this._$els || {};
        this._comps = this._comps || {};
        this._$els.actions = data.actions;
    }

    /**
     * Renders
     */
    render(data) {
        super.render(data);

        // Cache elements
        this._$els.galleryContent = this._$el.find('.modal__gallery__content');
        this._$els.galleryItems = this._$els.galleryContent.find('.modal__gallery__item');

        // Only set the slider if there are items
        if (this._$els.galleryItems.length) {
            let initialSlide = 0;

            // Lets go to the clicked and right slide item
            this._$els.galleryItems.each((i, val) => {
                if (val.className.indexOf('is-target') === -1) {
                    return;
                }

                // Cache the initial slide so that Slide knows it
                initialSlide = i;
            });

            // Now we'll do the slider
            this._slide = new Slide(this._$els.galleryContent, {
                initialSlide,
                prevArrow: `
                    <button type="button" class="slick-prev"><span class="icon__wrapper icon__wrapper--arrow--left">
                        <svg class="icon icon--arrow--left"><use xlink:href="#icon-arrow--left"></use></svg>
                    </span></button>
                `,
                nextArrow: `
                    <button type="button" class="slick-next"><span class="icon__wrapper icon__wrapper--arrow--right">
                        <svg class="icon icon--arrow--right"><use xlink:href="#icon-arrow--right"></use></svg>
                    </span></button>
                `,
                onBeforeChange: (evt, slick, currentSlide) => {
                    const target = this._$els.galleryItems[currentSlide];

                    // Pause any kind of iframe
                    $(target).find('iframe').attr('src', $('iframe').attr('src'));
                }
            });
        }

        return this;
    }

    /**
     * Destroy
     */
    destroy() {
        // Bedrock isn't verifying nulls so we can't add it to the components
        this._slide && this._slide.destroy();
        this._slide = null;

        // Finally destroy the component
        super.destroy();

        return this;
    }

    // -----------------------------------------
}

export { Component };
export { getData };
export { isVimeo };
export { isYoutube };
