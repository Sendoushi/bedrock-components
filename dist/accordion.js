'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Component = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _jquery = require('jquery');

var _jquery2 = _interopRequireDefault(_jquery);

var _jquery3 = require('bedrock/src/component/jquery.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// --------------------------------
// Class

var Component = function (_Comp) {
    _inherits(Component, _Comp);

    // Constructor
    function Component($el) {
        var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        _classCallCheck(this, Component);

        $el = $el instanceof _jquery2.default ? $el : (0, _jquery2.default)($el);

        // Cache data
        var _this = _possibleConstructorReturn(this, (Component.__proto__ || Object.getPrototypeOf(Component)).call(this, $el, { noRender: true, tmpl: '' }));

        _this._all = data.targetClose || null;

        // Cache elements
        _this._$els.anchor = _this._$el.find('.accordion__anchor');
        _this._$els.content = _this._$el.find('.accordion__content');

        // Force to remove the height
        _this._$els.content.removeAttr('style');

        // Check if it should be closed
        !_this.isOpen() && _this.close();

        // Add events
        _this._$el.on('close.accordion', _this.close.bind(_this));
        _this._$els.anchor.on('click.accordion', _this._onHandleClick.bind(_this));
        (0, _jquery2.default)(window).on('resize.accordion', _this._onResize.bind(_this));
        return _this;
    }

    /**
     * Check if accordion is open
     * @return {Boolean}
     */


    _createClass(Component, [{
        key: 'isOpen',
        value: function isOpen() {
            return !this._$el.hasClass('is-out');
        }

        /**
         * Open accordion
         * @param  {element} el
         */

    }, {
        key: 'open',
        value: function open() {
            this._setRightHeight();
            this._$el.removeClass('is-out');

            // Announce the event
            this._$el.trigger('accordion.open');
        }

        /**
         * Close accordion
         * @param  {element} el
         */

    }, {
        key: 'close',
        value: function close() {
            this._$els.content.attr('style', 'max-height:0; padding-top:0; padding-bottom: 0');
            this._$el.addClass('is-out');

            // Announce the event
            this._$el.trigger('accordion.close');
        }

        /**
         * Destroy
         */

    }, {
        key: 'destroy',
        value: function destroy() {
            this._throttler && clearTimeout(this._throttler);

            this._$el.off('close.accordion');
            this._$els.anchor.off('click.accordion');
            (0, _jquery2.default)(window).off('resize.accordion');

            _get(Component.prototype.__proto__ || Object.getPrototypeOf(Component.prototype), 'destroy', this).call(this);

            return this;
        }

        // -----------------------------------------

        /**
         * Handler click
         * @param  {event} evt
         */

    }, {
        key: '_onHandleClick',
        value: function _onHandleClick(evt) {
            var _this2 = this;

            evt.preventDefault();
            evt.stopPropagation();

            this._setRightHeight();

            // Now lets take care of the click
            !this.isOpen() ? this.open() : this.close();

            // Should we close others?
            this._all && (0, _jquery2.default)(this._all).each(function (i, el) {
                var $el = (0, _jquery2.default)(el);

                if ($el.is(_this2._$el)) {
                    return;
                }

                // Trigger event to close
                $el.trigger('close.accordion');
            });

            // Announce the event
            this._$el.trigger('accordion.anchor-click');
        }

        /**
         * Handles resize
         *
         * @param {object} comp
         * @param {event} evt
         */

    }, {
        key: '_onResize',
        value: function _onResize() {
            var _this3 = this;

            this._throttler && clearTimeout(this._throttler);
            this._throttler = setTimeout(function () {
                return window.requestAnimationFrame(function () {
                    _this3._$el.removeAttr('data-height');

                    // No need to go further if it wasn't open
                    if (!_this3.isOpen()) {
                        return;
                    }

                    // Lets reset
                    _this3.close();
                    _this3.open();
                });
            }, 250);
        }

        /**
         * Finds right height
         * @param  {boolean} force
         * @return {number}
         */

    }, {
        key: '_findHeight',
        value: function _findHeight(force) {
            var oldOut = this._$el.hasClass('is-out');
            var height = this._$el.attr('data-height');

            // Cache elements
            var oldStyle = this._$els.content.attr('style');

            if (height && height !== '' && !force) {
                return height;
            }

            // Lets get the right height
            this._$el.removeClass('is-out');
            this._$els.content.removeAttr('style');

            // Reforce the redraw
            this._$els.content[0].offsetHeight;

            height = this._$els.content.outerHeight() + 50;

            // Now lets cache
            this._$el.attr('data-height', height);
            this._$els.content.attr('style', oldStyle);

            if (oldOut) {
                this._$el.addClass('is-out');
            }

            // Reforce the redraw
            this._$els.content[0].offsetHeight;

            return height;
        }

        /**
         * Updates accordion to the right size
         */

    }, {
        key: '_updateSize',
        value: function _updateSize() {
            if (!this.isOpen()) {
                this._setRightHeight(true);
                return;
            }

            // Set the new height
            this._findHeight(true);
        }

        /**
         * Sets the right height
         * @param  {boolean} force
         */

    }, {
        key: '_setRightHeight',
        value: function _setRightHeight(force) {
            var height = this._findHeight(force);

            // We need to safecase because it isn't working sometimes...
            if (height !== 50) {
                this._$els.content.attr('style', 'max-height: ' + height + 'px');
            } else {
                // setTimeout(findObjHeight, 500);
            }
        }
    }]);

    return Component;
}(_jquery3.Component);

exports.Component = Component;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9hY2NvcmRpb24uanMiXSwibmFtZXMiOlsiQ29tcG9uZW50IiwiJGVsIiwiZGF0YSIsIm5vUmVuZGVyIiwidG1wbCIsIl9hbGwiLCJ0YXJnZXRDbG9zZSIsIl8kZWxzIiwiYW5jaG9yIiwiXyRlbCIsImZpbmQiLCJjb250ZW50IiwicmVtb3ZlQXR0ciIsImlzT3BlbiIsImNsb3NlIiwib24iLCJiaW5kIiwiX29uSGFuZGxlQ2xpY2siLCJ3aW5kb3ciLCJfb25SZXNpemUiLCJoYXNDbGFzcyIsIl9zZXRSaWdodEhlaWdodCIsInJlbW92ZUNsYXNzIiwidHJpZ2dlciIsImF0dHIiLCJhZGRDbGFzcyIsIl90aHJvdHRsZXIiLCJjbGVhclRpbWVvdXQiLCJvZmYiLCJldnQiLCJwcmV2ZW50RGVmYXVsdCIsInN0b3BQcm9wYWdhdGlvbiIsIm9wZW4iLCJlYWNoIiwiaSIsImVsIiwiaXMiLCJzZXRUaW1lb3V0IiwicmVxdWVzdEFuaW1hdGlvbkZyYW1lIiwiZm9yY2UiLCJvbGRPdXQiLCJoZWlnaHQiLCJvbGRTdHlsZSIsIm9mZnNldEhlaWdodCIsIm91dGVySGVpZ2h0IiwiX2ZpbmRIZWlnaHQiXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7OztBQUVBOzs7O0FBQ0E7Ozs7Ozs7Ozs7QUFFQTtBQUNBOztJQUVNQSxTOzs7QUFDRjtBQUNBLHVCQUFZQyxHQUFaLEVBQTRCO0FBQUEsWUFBWEMsSUFBVyx1RUFBSixFQUFJOztBQUFBOztBQUN4QkQsY0FBTUEsa0NBQW1CQSxHQUFuQixHQUF5QixzQkFBRUEsR0FBRixDQUEvQjs7QUFJQTtBQUx3QiwwSEFHbEJBLEdBSGtCLEVBR2IsRUFBRUUsVUFBVSxJQUFaLEVBQWtCQyxNQUFNLEVBQXhCLEVBSGE7O0FBTXhCLGNBQUtDLElBQUwsR0FBWUgsS0FBS0ksV0FBTCxJQUFvQixJQUFoQzs7QUFFQTtBQUNBLGNBQUtDLEtBQUwsQ0FBV0MsTUFBWCxHQUFvQixNQUFLQyxJQUFMLENBQVVDLElBQVYsQ0FBZSxv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LEVBQUwsRUFBb0I7QUFDaEIscUJBQUtRLGVBQUwsQ0FBcUIsSUFBckI7QUFDQTtBQUNIOztBQUVEO0FBQ0EsaUJBQUt3QixXQUFMLENBQWlCLElBQWpCO0FBQ0g7O0FBRUQ7Ozs7Ozs7d0NBSWdCTixLLEVBQU87QUFDbkIsZ0JBQU1FLFNBQVMsS0FBS0ksV0FBTCxDQUFpQk4sS0FBakIsQ0FBZjs7QUFFQTtBQUNBLGdCQUFJRSxXQUFXLEVBQWYsRUFBbUI7QUFDZixxQkFBS2xDLEtBQUwsQ0FBV0ksT0FBWCxDQUFtQmEsSUFBbkIsQ0FBd0IsT0FBeEIsbUJBQWdEaUIsTUFBaEQ7QUFDSCxhQUZELE1BRU87QUFDSDtBQUNIO0FBQ0o7Ozs7OztRQUdJekMsUyxHQUFBQSxTIiwiZmlsZSI6ImFjY29yZGlvbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0ICQgZnJvbSAnanF1ZXJ5JztcbmltcG9ydCB7IENvbXBvbmVudCBhcyBDb21wIH0gZnJvbSAnYmVkcm9jay9zcmMvY29tcG9uZW50L2pxdWVyeS5qcyc7XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBDbGFzc1xuXG5jbGFzcyBDb21wb25lbnQgZXh0ZW5kcyBDb21wIHtcbiAgICAvLyBDb25zdHJ1Y3RvclxuICAgIGNvbnN0cnVjdG9yKCRlbCwgZGF0YSA9IHt9KSB7XG4gICAgICAgICRlbCA9ICRlbCBpbnN0YW5jZW9mICQgPyAkZWwgOiAkKCRlbCk7XG5cbiAgICAgICAgc3VwZXIoJGVsLCB7IG5vUmVuZGVyOiB0cnVlLCB0bXBsOiAnJyB9KTtcblxuICAgICAgICAvLyBDYWNoZSBkYXRhXG4gICAgICAgIHRoaXMuX2FsbCA9IGRhdGEudGFyZ2V0Q2xvc2UgfHwgbnVsbDtcblxuICAgICAgICAvLyBDYWNoZSBlbGVtZW50c1xuICAgICAgICB0aGlzLl8kZWxzLmFuY2hvciA9IHRoaXMuXyRlbC5maW5kKCcuYWNjb3JkaW9uX19hbmNob3InKTtcbiAgICAgICAgdGhpcy5fJGVscy5jb250ZW50ID0gdGhpcy5fJGVsLmZpbmQoJy5hY2NvcmRpb25fX2NvbnRlbnQnKTtcblxuICAgICAgICAvLyBGb3JjZSB0byByZW1vdmUgdGhlIGhlaWdodFxuICAgICAgICB0aGlzLl8kZWxzLmNvbnRlbnQucmVtb3ZlQXR0cignc3R5bGUnKTtcblxuICAgICAgICAvLyBDaGVjayBpZiBpdCBzaG91bGQgYmUgY2xvc2VkXG4gICAgICAgICF0aGlzLmlzT3BlbigpICYmIHRoaXMuY2xvc2UoKTtcblxuICAgICAgICAvLyBBZGQgZXZlbnRzXG4gICAgICAgIHRoaXMuXyRlbC5vbignY2xvc2UuYWNjb3JkaW9uJywgdGhpcy5jbG9zZS5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5fJGVscy5hbmNob3Iub24oJ2NsaWNrLmFjY29yZGlvbicsIHRoaXMuX29uSGFuZGxlQ2xpY2suYmluZCh0aGlzKSk7XG4gICAgICAgICQod2luZG93KS5vbigncmVzaXplLmFjY29yZGlvbicsIHRoaXMuX29uUmVzaXplLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIGFjY29yZGlvbiBpcyBvcGVuXG4gICAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICAgKi9cbiAgICBpc09wZW4oKSB7XG4gICAgICAgIHJldHVybiAhdGhpcy5fJGVsLmhhc0NsYXNzKCdpcy1vdXQnKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBPcGVuIGFjY29yZGlvblxuICAgICAqIEBwYXJhbSAge2VsZW1lbnR9IGVsXG4gICAgICovXG4gICAgb3BlbigpIHtcbiAgICAgICAgdGhpcy5fc2V0UmlnaHRIZWlnaHQoKTtcbiAgICAgICAgdGhpcy5fJGVsLnJlbW92ZUNsYXNzKCdpcy1vdXQnKTtcblxuICAgICAgICAvLyBBbm5vdW5jZSB0aGUgZXZlbnRcbiAgICAgICAgdGhpcy5fJGVsLnRyaWdnZXIoJ2FjY29yZGlvbi5vcGVuJyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2xvc2UgYWNjb3JkaW9uXG4gICAgICogQHBhcmFtICB7ZWxlbWVudH0gZWxcbiAgICAgKi9cbiAgICBjbG9zZSgpIHtcbiAgICAgICAgdGhpcy5fJGVscy5jb250ZW50LmF0dHIoJ3N0eWxlJywgJ21heC1oZWlnaHQ6MDsgcGFkZGluZy10b3A6MDsgcGFkZGluZy1ib3R0b206IDAnKTtcbiAgICAgICAgdGhpcy5fJGVsLmFkZENsYXNzKCdpcy1vdXQnKTtcblxuICAgICAgICAvLyBBbm5vdW5jZSB0aGUgZXZlbnRcbiAgICAgICAgdGhpcy5fJGVsLnRyaWdnZXIoJ2FjY29yZGlvbi5jbG9zZScpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIERlc3Ryb3lcbiAgICAgKi9cbiAgICBkZXN0cm95KCkge1xuICAgICAgICB0aGlzLl90aHJvdHRsZXIgJiYgY2xlYXJUaW1lb3V0KHRoaXMuX3Rocm90dGxlcik7XG5cbiAgICAgICAgdGhpcy5fJGVsLm9mZignY2xvc2UuYWNjb3JkaW9uJyk7XG4gICAgICAgIHRoaXMuXyRlbHMuYW5jaG9yLm9mZignY2xpY2suYWNjb3JkaW9uJyk7XG4gICAgICAgICQod2luZG93KS5vZmYoJ3Jlc2l6ZS5hY2NvcmRpb24nKTtcblxuICAgICAgICBzdXBlci5kZXN0cm95KCk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgIC8qKlxuICAgICAqIEhhbmRsZXIgY2xpY2tcbiAgICAgKiBAcGFyYW0gIHtldmVudH0gZXZ0XG4gICAgICovXG4gICAgX29uSGFuZGxlQ2xpY2soZXZ0KSB7XG4gICAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBldnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgICAgdGhpcy5fc2V0UmlnaHRIZWlnaHQoKTtcblxuICAgICAgICAvLyBOb3cgbGV0cyB0YWtlIGNhcmUgb2YgdGhlIGNsaWNrXG4gICAgICAgICF0aGlzLmlzT3BlbigpID8gdGhpcy5vcGVuKCkgOiB0aGlzLmNsb3NlKCk7XG5cbiAgICAgICAgLy8gU2hvdWxkIHdlIGNsb3NlIG90aGVycz9cbiAgICAgICAgdGhpcy5fYWxsICYmICQodGhpcy5fYWxsKS5lYWNoKChpLCBlbCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgJGVsID0gJChlbCk7XG5cbiAgICAgICAgICAgIGlmICgkZWwuaXModGhpcy5fJGVsKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gVHJpZ2dlciBldmVudCB0byBjbG9zZVxuICAgICAgICAgICAgJGVsLnRyaWdnZXIoJ2Nsb3NlLmFjY29yZGlvbicpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBBbm5vdW5jZSB0aGUgZXZlbnRcbiAgICAgICAgdGhpcy5fJGVsLnRyaWdnZXIoJ2FjY29yZGlvbi5hbmNob3ItY2xpY2snKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBIYW5kbGVzIHJlc2l6ZVxuICAgICAqXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGNvbXBcbiAgICAgKiBAcGFyYW0ge2V2ZW50fSBldnRcbiAgICAgKi9cbiAgICBfb25SZXNpemUoKSB7XG4gICAgICAgIHRoaXMuX3Rocm90dGxlciAmJiBjbGVhclRpbWVvdXQodGhpcy5fdGhyb3R0bGVyKTtcbiAgICAgICAgdGhpcy5fdGhyb3R0bGVyID0gc2V0VGltZW91dCgoKSA9PiB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuXyRlbC5yZW1vdmVBdHRyKCdkYXRhLWhlaWdodCcpO1xuXG4gICAgICAgICAgICAvLyBObyBuZWVkIHRvIGdvIGZ1cnRoZXIgaWYgaXQgd2Fzbid0IG9wZW5cbiAgICAgICAgICAgIGlmICghdGhpcy5pc09wZW4oKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gTGV0cyByZXNldFxuICAgICAgICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgICAgICAgdGhpcy5vcGVuKCk7XG4gICAgICAgIH0pLCAyNTApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZpbmRzIHJpZ2h0IGhlaWdodFxuICAgICAqIEBwYXJhbSAge2Jvb2xlYW59IGZvcmNlXG4gICAgICogQHJldHVybiB7bnVtYmVyfVxuICAgICAqL1xuICAgIF9maW5kSGVpZ2h0KGZvcmNlKSB7XG4gICAgICAgIGNvbnN0IG9sZE91dCA9IHRoaXMuXyRlbC5oYXNDbGFzcygnaXMtb3V0Jyk7XG4gICAgICAgIGxldCBoZWlnaHQgPSB0aGlzLl8kZWwuYXR0cignZGF0YS1oZWlnaHQnKTtcblxuICAgICAgICAvLyBDYWNoZSBlbGVtZW50c1xuICAgICAgICBjb25zdCBvbGRTdHlsZSA9IHRoaXMuXyRlbHMuY29udGVudC5hdHRyKCdzdHlsZScpO1xuXG4gICAgICAgIGlmIChoZWlnaHQgJiYgaGVpZ2h0ICE9PSAnJyAmJiAhZm9yY2UpIHtcbiAgICAgICAgICAgIHJldHVybiBoZWlnaHQ7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBMZXRzIGdldCB0aGUgcmlnaHQgaGVpZ2h0XG4gICAgICAgIHRoaXMuXyRlbC5yZW1vdmVDbGFzcygnaXMtb3V0Jyk7XG4gICAgICAgIHRoaXMuXyRlbHMuY29udGVudC5yZW1vdmVBdHRyKCdzdHlsZScpO1xuXG4gICAgICAgIC8vIFJlZm9yY2UgdGhlIHJlZHJhd1xuICAgICAgICB0aGlzLl8kZWxzLmNvbnRlbnRbMF0ub2Zmc2V0SGVpZ2h0O1xuXG4gICAgICAgIGhlaWdodCA9IHRoaXMuXyRlbHMuY29udGVudC5vdXRlckhlaWdodCgpICsgNTA7XG5cbiAgICAgICAgLy8gTm93IGxldHMgY2FjaGVcbiAgICAgICAgdGhpcy5fJGVsLmF0dHIoJ2RhdGEtaGVpZ2h0JywgaGVpZ2h0KTtcbiAgICAgICAgdGhpcy5fJGVscy5jb250ZW50LmF0dHIoJ3N0eWxlJywgb2xkU3R5bGUpO1xuXG4gICAgICAgIGlmIChvbGRPdXQpIHtcbiAgICAgICAgICAgIHRoaXMuXyRlbC5hZGRDbGFzcygnaXMtb3V0Jyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBSZWZvcmNlIHRoZSByZWRyYXdcbiAgICAgICAgdGhpcy5fJGVscy5jb250ZW50WzBdLm9mZnNldEhlaWdodDtcblxuICAgICAgICByZXR1cm4gaGVpZ2h0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFVwZGF0ZXMgYWNjb3JkaW9uIHRvIHRoZSByaWdodCBzaXplXG4gICAgICovXG4gICAgX3VwZGF0ZVNpemUoKSB7XG4gICAgICAgIGlmICghdGhpcy5pc09wZW4oKSkge1xuICAgICAgICAgICAgdGhpcy5fc2V0UmlnaHRIZWlnaHQodHJ1ZSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTZXQgdGhlIG5ldyBoZWlnaHRcbiAgICAgICAgdGhpcy5fZmluZEhlaWdodCh0cnVlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSByaWdodCBoZWlnaHRcbiAgICAgKiBAcGFyYW0gIHtib29sZWFufSBmb3JjZVxuICAgICAqL1xuICAgIF9zZXRSaWdodEhlaWdodChmb3JjZSkge1xuICAgICAgICBjb25zdCBoZWlnaHQgPSB0aGlzLl9maW5kSGVpZ2h0KGZvcmNlKTtcblxuICAgICAgICAvLyBXZSBuZWVkIHRvIHNhZmVjYXNlIGJlY2F1c2UgaXQgaXNuJ3Qgd29ya2luZyBzb21ldGltZXMuLi5cbiAgICAgICAgaWYgKGhlaWdodCAhPT0gNTApIHtcbiAgICAgICAgICAgIHRoaXMuXyRlbHMuY29udGVudC5hdHRyKCdzdHlsZScsIGBtYXgtaGVpZ2h0OiAke2hlaWdodH1weGApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gc2V0VGltZW91dChmaW5kT2JqSGVpZ2h0LCA1MDApO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgeyBDb21wb25lbnQgfTtcbiJdfQ==