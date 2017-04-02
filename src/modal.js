'use strict';

import $ from 'jquery';
import { Component as Comp } from 'bedrock2/src/component/jquery.js';

// --------------------------------
// Variables / Functions

/**
 * Gets default content template
 *
 * @param {object} data
 * @returns {string}
 */
const defaultContentTmpl = (data = {}) => {
    const title = data.title && `<div class="h3 modal__title">${data.title}</div>` || '';
    const caption = data.caption && `<div class="ss-b-rg modal__caption">${data.caption}</div>` || '';
    const paragraph = data.paragraph && `<div class="modal__paragraph">${data.paragraph}</div>` || '';
    const tmpl = data.contentTmpl || (title + caption + paragraph);

    return tmpl;
};

/**
 * Gets default template
 *
 * @param {object} data
 * @returns {string}
 */
const defaultTmpl = (data = {}) => `
    <div class="modal__type ${data.class || ''}">
        <div class="align-middle__wrapper">
            <div class="align-middle wrapper">
                <div class="modal__content">
                    <span class="icon__wrapper icon__wrapper--cross modal__close">
                        <svg class="icon icon--cross"><use xlink:href="#icon-cross"></use></svg>
                    </span>
                    ${data.contentFn && data.contentFn(data) || defaultContentTmpl(data)}
                </div>
            </div>
        </div>
    </div>
`;

/**
 * Gets data from element
 *
 * @param {element} el
 * @returns {object}
 */
const getData = (el) => ({
    class: el.getAttribute('data-class'),
    contentTmpl: el.getAttribute('data-content'),
    title: el.getAttribute('data-title'),
    caption: el.getAttribute('data-caption'),
    paragraph: el.getAttribute('data-paragraph')
});

// --------------------------------
// Class

class Component extends Comp {
    // Constructor
    constructor($el, data = {}) {
        $el = $el instanceof $ ? $el : $($el);

        super($el, { noRender: true, tmpl: '' });

        // Set defaults
        data.tmpl = data.tmpl || defaultTmpl;
        data.class = data.class || 'modal__default';

        // Lets render
        this.render(data);
    }

    /**
     * Renders
     */
    render(data) {
        // Lets build the modal
        const tmpl = data.tmpl(data);

        // Render it out...
        this._$el.html(tmpl);

        // Cache elements
        this._$els.content = this._$el.find('.modal__content');
        this._$els.close = this._$el.find('.modal__close');

        // Now lets open the modal...
        this._$el[0].classList.add('is-in');
        document.body.classList.add('disable-scroll');

        // Add events
        this._$el.on('click', evt => {
            evt.preventDefault();
            this.destroy();
        });
        this._$els.close.on('click', evt => {
            evt.preventDefault();
            this.destroy();
        });
        this._$els.content.on('click', evt => evt.stopPropagation());

        return this;
    }

    /**
     * Destroy
     */
    destroy() {
        this._$el[0].classList.remove('is-in');
        document.body.classList.remove('disable-scroll');
        this._$el.html('');

        // Finally destroy the component
        super.destroy();

        return this;
    }

    // -----------------------------------------
}

export { Component };
export { getData };
