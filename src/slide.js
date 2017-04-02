'use strict';

import $ from 'jquery';
import { Component as Comp } from 'bedrock2/src/component/jquery.js';
import 'slick-carousel';

// --------------------------------
// Functions

// --------------------------------
// Class

class Component extends Comp {
    // Constructor
    constructor($el, data = {}) {
        $el = $el instanceof $ ? $el : $($el);

        super($el, { noRender: true, tmpl: '' });

        // TODO: Check attributes for the configs

        // Cache data
        this._$els = this._$els || {};
        this._comps = this._comps || {};

        // Set the slider
        // RAF just to actually have everything rendered
        window.requestAnimationFrame(() => {
            $el.slick(data);
            this._set = true;

            if (this._goto) {
                this.setSlide(this._goto.i, this._goto.dontAnimate);
                this._goto = null;
            }
        });

        // Add events
        data.onBeforeChange && $el.on('beforeChange', data.onBeforeChange);
        data.onAfterChange && $el.on('afterChange', data.onAfterChange);
    }

    /**
     * Sets slide
     *
     * @param {number} i
     * @param {boolean} dontAnimate
     */
    setSlide(i, dontAnimate) {
        if (this._set) {
            this._$el.slick('slickGoTo', i, dontAnimate);
        } else {
            this._goto = { i, dontAnimate };
        }
    }

    /**
     * Destroy
     */
    destroy() {
        this._$el.slick('unslick');
        super.destroy();

        return this;
    }

    // -----------------------------------------
}

export { Component };
