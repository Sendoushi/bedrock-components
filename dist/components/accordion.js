'use strict';
// TODO: We should convert this better

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _jquery = require('jquery');

var _jquery2 = _interopRequireDefault(_jquery);

var _component = require('bedrock/src/component.js');

var _component2 = _interopRequireDefault(_component);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DEFAULTS = {
    targetClose: null,
    classes: {
        anchor: 'accordion__anchor',
        content: 'accordion__content',
        unactive: 'is-out'
    },
    events: {
        open: 'accordion.open',
        close: 'accordion.close',
        anchorClick: 'accordion.anchor-click'
    }
};

// --------------------------------
// Functions

/**
 * Check if accordion is open
 * @param  {element}  el
 * @return {Boolean}
 */
var isOpen = function isOpen(el) {
    return !el.hasClass(DEFAULTS.classes.unactive);
};

/**
 * Finds right height
 * @param {object} obj
 * @param  {boolean} force
 * @return {number}
 */
var findHeight = function findHeight(obj, force) {
    var el = obj.el;
    var content = obj.content;
    var oldOut = el.hasClass(DEFAULTS.classes.unactive);
    var height = el.attr('data-height');

    // Cache elements
    var oldStyle = content.attr('style');

    if (height && height !== '' && !force) {
        return height;
    }

    // Lets get the right height
    el.removeClass(DEFAULTS.classes.unactive);
    content.removeAttr('style');

    // Reforce the redraw
    content[0].offsetHeight;

    height = content.outerHeight() + 50;

    // Now lets cache
    el.attr('data-height', height);
    content.attr('style', oldStyle);

    if (oldOut) {
        el.addClass(DEFAULTS.classes.unactive);
    }

    // Reforce the redraw
    content[0].offsetHeight;

    return height;
};

/**
 * Sets the right height
 * @param {object} obj
 * @param  {boolean} force
 */
var setRightHeight = function setRightHeight(obj, force) {
    var findObjHeight = function findObjHeight(val) {
        var height = findHeight({
            el: obj.el,
            content: (0, _jquery2.default)(val)
        }, force);

        // We need to safecase because it isn't working sometimes...
        if (height !== 50) {
            (0, _jquery2.default)(val).attr('style', 'max-height: ' + height + 'px');
        } else {
            // setTimeout(findObjHeight, 500);
        }
    };

    // Set the new height
    obj.content.each(function (i, val) {
        return findObjHeight(val);
    });
};

/**
 * Updates accordion to the right size
 * @param {object} obj
 */
var updateSize = function updateSize(obj) {
    var el = obj.el;

    if (!isOpen(el)) {
        setRightHeight(obj, true);
        return;
    }

    // Set the new height
    obj.content.each(function (i, val) {
        return findHeight({
            el: obj.el,
            content: (0, _jquery2.default)(val)
        }, true);
    });
};

/**
 * Open accordion
 * @param  {element} el
 */
var open = function open(el) {
    var openEl = function openEl(val) {
        var anchorEl = val.find('.' + DEFAULTS.classes.anchor);
        var contentEl = val.find('.' + DEFAULTS.classes.content);
        var obj = {
            el: val,
            anchor: anchorEl,
            content: contentEl
        };

        setRightHeight(obj);
        val.removeClass(DEFAULTS.classes.unactive);

        // Announce the event
        val.trigger(DEFAULTS.events.open);
    };

    el.each(function (i, val) {
        return openEl((0, _jquery2.default)(val));
    });
};

/**
 * Close accordion
 * @param  {element} el
 */
var close = function close(el) {
    var closeEl = function closeEl(val) {
        var contentEl = val.find('.' + DEFAULTS.classes.content);

        contentEl.attr('style', 'max-height:0; padding-top:0; padding-bottom: 0');
        val.addClass(DEFAULTS.classes.unactive);

        // Announce the event
        val.trigger(DEFAULTS.events.close);
    };

    el.each(function (i, val) {
        return closeEl((0, _jquery2.default)(val));
    });
};

/**
 * Handler click
 * @param  {object} comp
 * @param  {event} evt
 */
var handleClick = function handleClick(comp, evt) {
    var anchorEl = (0, _jquery2.default)(evt.currentTarget);
    var el = comp.el.filter(function (i, val) {
        var possible = (0, _jquery2.default)(val).find('.' + DEFAULTS.classes.anchor);
        return possible.length && possible.is(anchorEl);
    });
    var contentEl = el.find('.' + DEFAULTS.classes.content);

    setRightHeight({
        el: el, anchor: anchorEl, content: contentEl
    });

    evt.preventDefault();
    evt.stopPropagation();

    // Now lets take care of the click
    !isOpen(el) ? open(el) : close(el);
    comp.all && close(comp.all.filter(function (i, item) {
        return !item.is(el);
    }));

    // Announce the event
    el.trigger(DEFAULTS.events.anchorClick);
};

/**
 * Handles resize
 *
 * @param {object} comp
 * @param {any} el
 */
var onResize = function onResize(comp) {
    comp.throttler && clearTimeout(comp.throttler);
    comp.throttler = setTimeout(function () {
        return window.requestAnimationFrame(function () {
            comp.el.each(function (i, val) {
                var el = (0, _jquery2.default)(val);
                var isItOpen = isOpen(el);
                el.removeAttr('data-height');

                // Lets just reset
                if (!isItOpen) {
                    return;
                }

                close(el);
                open(el);
            });
        });
    }, 250);
};

/**
 * Destroy component
 *
 * @param {object} comp
 */
var destroy = function destroy(comp) {
    var anchorEl = comp.el.find('.' + DEFAULTS.classes.anchor);

    comp.throttler && clearTimeout(comp.throttler);

    anchorEl.off('click.accordion');
    (0, _jquery2.default)(window).off('resize.accordion');

    _component2.default.destroy(comp);
};

/**
 * Creates a custom select
 * @param  {object} comp
 * @return {object}
*/
var _init = function _init(comp) {
    var targetClose = comp.targetClose;
    var anchorEl = comp.el.find('.' + DEFAULTS.classes.anchor);
    var contentEl = comp.el.find('.' + DEFAULTS.classes.content);

    // Cache for later use
    // TODO: Close accordions
    comp.all = !!targetClose ? (0, _jquery2.default)(targetClose) : null;

    // Force to remove the height
    contentEl.removeAttr('style');

    // Check if it should be closed
    comp.el.hasClass(DEFAULTS.classes.unactive) && close(comp.el);

    // Lets set events
    anchorEl.on('click.accordion', handleClick.bind(null, comp));
    (0, _jquery2.default)(window).on('resize.accordion', onResize.bind(null, comp));

    return comp;
};

// --------------------------------
// Export

exports.default = {
    init: function init(el, data) {
        var comp = _component2.default.getComp(data, DEFAULTS);
        comp = _component2.default.init(el, comp);

        return !el || !el.length ? comp : _init(comp);
    },
    updateSize: updateSize, isOpen: isOpen, open: open, close: close, destroy: destroy
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21wb25lbnRzL2FjY29yZGlvbi5qcyJdLCJuYW1lcyI6WyJERUZBVUxUUyIsInRhcmdldENsb3NlIiwiY2xhc3NlcyIsImFuY2hvciIsImNvbnRlbnQiLCJ1bmFjdGl2ZSIsImV2ZW50cyIsIm9wZW4iLCJjbG9zZSIsImFuY2hvckNsaWNrIiwiaXNPcGVuIiwiZWwiLCJoYXNDbGFzcyIsImZpbmRIZWlnaHQiLCJvYmoiLCJmb3JjZSIsIm9sZE91dCIsImhlaWdodCIsImF0dHIiLCJvbGRTdHlsZSIsInJlbW92ZUNsYXNzIiwicmVtb3ZlQXR0ciIsIm9mZnNldEhlaWdodCIsIm91dGVySGVpZ2h0IiwiYWRkQ2xhc3MiLCJzZXRSaWdodEhlaWdodCIsImZpbmRPYmpIZWlnaHQiLCJ2YWwiLCJlYWNoIiwiaSIsInVwZGF0ZVNpemUiLCJvcGVuRWwiLCJhbmNob3JFbCIsImZpbmQiLCJjb250ZW50RWwiLCJ0cmlnZ2VyIiwiY2xvc2VFbCIsImhhbmRsZUNsaWNrIiwiY29tcCIsImV2dCIsImN1cnJlbnRUYXJnZXQiLCJmaWx0ZXIiLCJwb3NzaWJsZSIsImxlbmd0aCIsImlzIiwicHJldmVudERlZmF1bHQiLCJzdG9wUHJvcGFnYXRpb24iLCJhbGwiLCJpdGVtIiwib25SZXNpemUiLCJ0aHJvdHRsZXIiLCJjbGVhclRpbWVvdXQiLCJzZXRUaW1lb3V0Iiwid2luZG93IiwicmVxdWVzdEFuaW1hdGlvbkZyYW1lIiwiaXNJdE9wZW4iLCJkZXN0cm95Iiwib2ZmIiwiaW5pdCIsIm9uIiwiYmluZCIsImRhdGEiLCJnZXRDb21wIl0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBOzs7Ozs7QUFFQTs7OztBQUNBOzs7Ozs7QUFFQSxJQUFNQSxXQUFXO0FBQ2JDLGlCQUFhLElBREE7QUFFYkMsYUFBUztBQUNMQyxnQkFBUSxtQkFESDtBQUVMQyxpQkFBUyxvQkFGSjtBQUdMQyxrQkFBVTtBQUhMLEtBRkk7QUFPYkMsWUFBUTtBQUNKQyxjQUFNLGdCQURGO0FB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QTtBQUNBO0FBQ0FrQyxTQUFLUyxHQUFMLEdBQVcsQ0FBQyxDQUFDOUMsV0FBRixHQUFnQixzQkFBRUEsV0FBRixDQUFoQixHQUFpQyxJQUE1Qzs7QUFFQTtBQUNBaUMsY0FBVWIsVUFBVixDQUFxQixPQUFyQjs7QUFFQTtBQUNBaUIsU0FBSzNCLEVBQUwsQ0FBUUMsUUFBUixDQUFpQlosU0FBU0UsT0FBVCxDQUFpQkcsUUFBbEMsS0FBK0NHLE1BQU04QixLQUFLM0IsRUFBWCxDQUEvQzs7QUFFQTtBQUNBcUIsYUFBUzJCLEVBQVQsQ0FBWSxpQkFBWixFQUErQnRCLFlBQVl1QixJQUFaLENBQWlCLElBQWpCLEVBQXVCdEIsSUFBdkIsQ0FBL0I7QUFDQSwwQkFBRWUsTUFBRixFQUFVTSxFQUFWLENBQWEsa0JBQWIsRUFBaUNWLFNBQVNXLElBQVQsQ0FBYyxJQUFkLEVBQW9CdEIsSUFBcEIsQ0FBakM7O0FBRUEsV0FBT0EsSUFBUDtBQUNILENBcEJEOztBQXNCQTtBQUNBOztrQkFFZTtBQUNYb0IsVUFBTSxjQUFDL0MsRUFBRCxFQUFLa0QsSUFBTCxFQUFjO0FBQ2hCLFlBQUl2QixPQUFPLG9CQUFVd0IsT0FBVixDQUFrQkQsSUFBbEIsRUFBd0I3RCxRQUF4QixDQUFYO0FBQ0FzQyxlQUFPLG9CQUFVb0IsSUFBVixDQUFlL0MsRUFBZixFQUFtQjJCLElBQW5CLENBQVA7O0FBRUEsZUFBUSxDQUFDM0IsRUFBRCxJQUFPLENBQUNBLEdBQUdnQyxNQUFaLEdBQXNCTCxJQUF0QixHQUE2Qm9CLE1BQUtwQixJQUFMLENBQXBDO0FBQ0gsS0FOVTtBQU9YUiwwQkFQVyxFQU9DcEIsY0FQRCxFQU9TSCxVQVBULEVBT2VDLFlBUGYsRUFPc0JnRDtBQVB0QixDIiwiZmlsZSI6ImFjY29yZGlvbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0Jztcbi8vIFRPRE86IFdlIHNob3VsZCBjb252ZXJ0IHRoaXMgYmV0dGVyXG5cbmltcG9ydCAkIGZyb20gJ2pxdWVyeSc7XG5pbXBvcnQgY29tcG9uZW50IGZyb20gJ2JlZHJvY2svc3JjL2NvbXBvbmVudC5qcyc7XG5cbmNvbnN0IERFRkFVTFRTID0ge1xuICAgIHRhcmdldENsb3NlOiBudWxsLFxuICAgIGNsYXNzZXM6IHtcbiAgICAgICAgYW5jaG9yOiAnYWNjb3JkaW9uX19hbmNob3InLFxuICAgICAgICBjb250ZW50OiAnYWNjb3JkaW9uX19jb250ZW50JyxcbiAgICAgICAgdW5hY3RpdmU6ICdpcy1vdXQnXG4gICAgfSxcbiAgICBldmVudHM6IHtcbiAgICAgICAgb3BlbjogJ2FjY29yZGlvbi5vcGVuJyxcbiAgICAgICAgY2xvc2U6ICdhY2NvcmRpb24uY2xvc2UnLFxuICAgICAgICBhbmNob3JDbGljazogJ2FjY29yZGlvbi5hbmNob3ItY2xpY2snXG4gICAgfVxufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEZ1bmN0aW9uc1xuXG4vKipcbiAqIENoZWNrIGlmIGFjY29yZGlvbiBpcyBvcGVuXG4gKiBAcGFyYW0gIHtlbGVtZW50fSAgZWxcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKi9cbmNvbnN0IGlzT3BlbiA9IChlbCkgPT4gIWVsLmhhc0NsYXNzKERFRkFVTFRTLmNsYXNzZXMudW5hY3RpdmUpO1xuXG4vKipcbiAqIEZpbmRzIHJpZ2h0IGhlaWdodFxuICogQHBhcmFtIHtvYmplY3R9IG9ialxuICogQHBhcmFtICB7Ym9vbGVhbn0gZm9yY2VcbiAqIEByZXR1cm4ge251bWJlcn1cbiAqL1xuY29uc3QgZmluZEhlaWdodCA9IChvYmosIGZvcmNlKSA9PiB7XG4gICAgY29uc3QgZWwgPSBvYmouZWw7XG4gICAgY29uc3QgY29udGVudCA9IG9iai5jb250ZW50O1xuICAgIGNvbnN0IG9sZE91dCA9IGVsLmhhc0NsYXNzKERFRkFVTFRTLmNsYXNzZXMudW5hY3RpdmUpO1xuICAgIGxldCBoZWlnaHQgPSBlbC5hdHRyKCdkYXRhLWhlaWdodCcpO1xuXG4gICAgLy8gQ2FjaGUgZWxlbWVudHNcbiAgICBjb25zdCBvbGRTdHlsZSA9IGNvbnRlbnQuYXR0cignc3R5bGUnKTtcblxuICAgIGlmIChoZWlnaHQgJiYgaGVpZ2h0ICE9PSAnJyAmJiAhZm9yY2UpIHtcbiAgICAgICAgcmV0dXJuIGhlaWdodDtcbiAgICB9XG5cbiAgICAvLyBMZXRzIGdldCB0aGUgcmlnaHQgaGVpZ2h0XG4gICAgZWwucmVtb3ZlQ2xhc3MoREVGQVVMVFMuY2xhc3Nlcy51bmFjdGl2ZSk7XG4gICAgY29udGVudC5yZW1vdmVBdHRyKCdzdHlsZScpO1xuXG4gICAgLy8gUmVmb3JjZSB0aGUgcmVkcmF3XG4gICAgY29udGVudFswXS5vZmZzZXRIZWlnaHQ7XG5cbiAgICBoZWlnaHQgPSBjb250ZW50Lm91dGVySGVpZ2h0KCkgKyA1MDtcblxuICAgIC8vIE5vdyBsZXRzIGNhY2hlXG4gICAgZWwuYXR0cignZGF0YS1oZWlnaHQnLCBoZWlnaHQpO1xuICAgIGNvbnRlbnQuYXR0cignc3R5bGUnLCBvbGRTdHlsZSk7XG5cbiAgICBpZiAob2xkT3V0KSB7XG4gICAgICAgIGVsLmFkZENsYXNzKERFRkFVTFRTLmNsYXNzZXMudW5hY3RpdmUpO1xuICAgIH1cblxuICAgIC8vIFJlZm9yY2UgdGhlIHJlZHJhd1xuICAgIGNvbnRlbnRbMF0ub2Zmc2V0SGVpZ2h0O1xuXG4gICAgcmV0dXJuIGhlaWdodDtcbn07XG5cbi8qKlxuICogU2V0cyB0aGUgcmlnaHQgaGVpZ2h0XG4gKiBAcGFyYW0ge29iamVjdH0gb2JqXG4gKiBAcGFyYW0gIHtib29sZWFufSBmb3JjZVxuICovXG5jb25zdCBzZXRSaWdodEhlaWdodCA9IChvYmosIGZvcmNlKSA9PiB7XG4gICAgY29uc3QgZmluZE9iakhlaWdodCA9ICh2YWwpID0+IHtcbiAgICAgICAgY29uc3QgaGVpZ2h0ID0gZmluZEhlaWdodCh7XG4gICAgICAgICAgICBlbDogb2JqLmVsLFxuICAgICAgICAgICAgY29udGVudDogJCh2YWwpXG4gICAgICAgIH0sIGZvcmNlKTtcblxuICAgICAgICAvLyBXZSBuZWVkIHRvIHNhZmVjYXNlIGJlY2F1c2UgaXQgaXNuJ3Qgd29ya2luZyBzb21ldGltZXMuLi5cbiAgICAgICAgaWYgKGhlaWdodCAhPT0gNTApIHtcbiAgICAgICAgICAgICQodmFsKS5hdHRyKCdzdHlsZScsIGBtYXgtaGVpZ2h0OiAke2hlaWdodH1weGApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gc2V0VGltZW91dChmaW5kT2JqSGVpZ2h0LCA1MDApO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIFNldCB0aGUgbmV3IGhlaWdodFxuICAgIG9iai5jb250ZW50LmVhY2goKGksIHZhbCkgPT4gZmluZE9iakhlaWdodCh2YWwpKTtcbn07XG5cbi8qKlxuICogVXBkYXRlcyBhY2NvcmRpb24gdG8gdGhlIHJpZ2h0IHNpemVcbiAqIEBwYXJhbSB7b2JqZWN0fSBvYmpcbiAqL1xuY29uc3QgdXBkYXRlU2l6ZSA9IChvYmopID0+IHtcbiAgICBjb25zdCBlbCA9IG9iai5lbDtcblxuICAgIGlmICghaXNPcGVuKGVsKSkge1xuICAgICAgICBzZXRSaWdodEhlaWdodChvYmosIHRydWUpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gU2V0IHRoZSBuZXcgaGVpZ2h0XG4gICAgb2JqLmNvbnRlbnQuZWFjaCgoaSwgdmFsKSA9PiBmaW5kSGVpZ2h0KHtcbiAgICAgICAgZWw6IG9iai5lbCxcbiAgICAgICAgY29udGVudDogJCh2YWwpXG4gICAgfSwgdHJ1ZSkpO1xufTtcblxuLyoqXG4gKiBPcGVuIGFjY29yZGlvblxuICogQHBhcmFtICB7ZWxlbWVudH0gZWxcbiAqL1xuY29uc3Qgb3BlbiA9IChlbCkgPT4ge1xuICAgIGNvbnN0IG9wZW5FbCA9ICh2YWwpID0+IHtcbiAgICAgICAgY29uc3QgYW5jaG9yRWwgPSB2YWwuZmluZChgLiR7REVGQVVMVFMuY2xhc3Nlcy5hbmNob3J9YCk7XG4gICAgICAgIGNvbnN0IGNvbnRlbnRFbCA9IHZhbC5maW5kKGAuJHtERUZBVUxUUy5jbGFzc2VzLmNvbnRlbnR9YCk7XG4gICAgICAgIGNvbnN0IG9iaiA9IHtcbiAgICAgICAgICAgIGVsOiB2YWwsXG4gICAgICAgICAgICBhbmNob3I6IGFuY2hvckVsLFxuICAgICAgICAgICAgY29udGVudDogY29udGVudEVsXG4gICAgICAgIH07XG5cbiAgICAgICAgc2V0UmlnaHRIZWlnaHQob2JqKTtcbiAgICAgICAgdmFsLnJlbW92ZUNsYXNzKERFRkFVTFRTLmNsYXNzZXMudW5hY3RpdmUpO1xuXG4gICAgICAgIC8vIEFubm91bmNlIHRoZSBldmVudFxuICAgICAgICB2YWwudHJpZ2dlcihERUZBVUxUUy5ldmVudHMub3Blbik7XG4gICAgfTtcblxuICAgIGVsLmVhY2goKGksIHZhbCkgPT4gb3BlbkVsKCQodmFsKSkpO1xufTtcblxuLyoqXG4gKiBDbG9zZSBhY2NvcmRpb25cbiAqIEBwYXJhbSAge2VsZW1lbnR9IGVsXG4gKi9cbmNvbnN0IGNsb3NlID0gKGVsKSA9PiB7XG4gICAgY29uc3QgY2xvc2VFbCA9ICh2YWwpID0+IHtcbiAgICAgICAgY29uc3QgY29udGVudEVsID0gdmFsLmZpbmQoYC4ke0RFRkFVTFRTLmNsYXNzZXMuY29udGVudH1gKTtcblxuICAgICAgICBjb250ZW50RWwuYXR0cignc3R5bGUnLCAnbWF4LWhlaWdodDowOyBwYWRkaW5nLXRvcDowOyBwYWRkaW5nLWJvdHRvbTogMCcpO1xuICAgICAgICB2YWwuYWRkQ2xhc3MoREVGQVVMVFMuY2xhc3Nlcy51bmFjdGl2ZSk7XG5cbiAgICAgICAgLy8gQW5ub3VuY2UgdGhlIGV2ZW50XG4gICAgICAgIHZhbC50cmlnZ2VyKERFRkFVTFRTLmV2ZW50cy5jbG9zZSk7XG4gICAgfTtcblxuICAgIGVsLmVhY2goKGksIHZhbCkgPT4gY2xvc2VFbCgkKHZhbCkpKTtcbn07XG5cbi8qKlxuICogSGFuZGxlciBjbGlja1xuICogQHBhcmFtICB7b2JqZWN0fSBjb21wXG4gKiBAcGFyYW0gIHtldmVudH0gZXZ0XG4gKi9cbmNvbnN0IGhhbmRsZUNsaWNrID0gKGNvbXAsIGV2dCkgPT4ge1xuICAgIGNvbnN0IGFuY2hvckVsID0gJChldnQuY3VycmVudFRhcmdldCk7XG4gICAgY29uc3QgZWwgPSBjb21wLmVsLmZpbHRlcigoaSwgdmFsKSA9PiB7XG4gICAgICAgIGNvbnN0IHBvc3NpYmxlID0gJCh2YWwpLmZpbmQoYC4ke0RFRkFVTFRTLmNsYXNzZXMuYW5jaG9yfWApO1xuICAgICAgICByZXR1cm4gKHBvc3NpYmxlLmxlbmd0aCAmJiBwb3NzaWJsZS5pcyhhbmNob3JFbCkpO1xuICAgIH0pO1xuICAgIGNvbnN0IGNvbnRlbnRFbCA9IGVsLmZpbmQoYC4ke0RFRkFVTFRTLmNsYXNzZXMuY29udGVudH1gKTtcblxuICAgIHNldFJpZ2h0SGVpZ2h0KHtcbiAgICAgICAgZWwsIGFuY2hvcjogYW5jaG9yRWwsIGNvbnRlbnQ6IGNvbnRlbnRFbFxuICAgIH0pO1xuXG4gICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG4gICAgZXZ0LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgLy8gTm93IGxldHMgdGFrZSBjYXJlIG9mIHRoZSBjbGlja1xuICAgICFpc09wZW4oZWwpID8gb3BlbihlbCkgOiBjbG9zZShlbCk7XG4gICAgY29tcC5hbGwgJiYgY2xvc2UoY29tcC5hbGwuZmlsdGVyKChpLCBpdGVtKSA9PiAhaXRlbS5pcyhlbCkpKTtcblxuICAgIC8vIEFubm91bmNlIHRoZSBldmVudFxuICAgIGVsLnRyaWdnZXIoREVGQVVMVFMuZXZlbnRzLmFuY2hvckNsaWNrKTtcbn07XG5cbi8qKlxuICogSGFuZGxlcyByZXNpemVcbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gY29tcFxuICogQHBhcmFtIHthbnl9IGVsXG4gKi9cbmNvbnN0IG9uUmVzaXplID0gKGNvbXApID0+IHtcbiAgICBjb21wLnRocm90dGxlciAmJiBjbGVhclRpbWVvdXQoY29tcC50aHJvdHRsZXIpO1xuICAgIGNvbXAudGhyb3R0bGVyID0gc2V0VGltZW91dCgoKSA9PiB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgICAgY29tcC5lbC5lYWNoKChpLCB2YWwpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGVsID0gJCh2YWwpO1xuICAgICAgICAgICAgY29uc3QgaXNJdE9wZW4gPSBpc09wZW4oZWwpO1xuICAgICAgICAgICAgZWwucmVtb3ZlQXR0cignZGF0YS1oZWlnaHQnKTtcblxuICAgICAgICAgICAgLy8gTGV0cyBqdXN0IHJlc2V0XG4gICAgICAgICAgICBpZiAoIWlzSXRPcGVuKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjbG9zZShlbCk7XG4gICAgICAgICAgICBvcGVuKGVsKTtcbiAgICAgICAgfSk7XG4gICAgfSksIDI1MCk7XG59O1xuXG4vKipcbiAqIERlc3Ryb3kgY29tcG9uZW50XG4gKlxuICogQHBhcmFtIHtvYmplY3R9IGNvbXBcbiAqL1xuY29uc3QgZGVzdHJveSA9IChjb21wKSA9PiB7XG4gICAgY29uc3QgYW5jaG9yRWwgPSBjb21wLmVsLmZpbmQoYC4ke0RFRkFVTFRTLmNsYXNzZXMuYW5jaG9yfWApO1xuXG4gICAgY29tcC50aHJvdHRsZXIgJiYgY2xlYXJUaW1lb3V0KGNvbXAudGhyb3R0bGVyKTtcblxuICAgIGFuY2hvckVsLm9mZignY2xpY2suYWNjb3JkaW9uJyk7XG4gICAgJCh3aW5kb3cpLm9mZigncmVzaXplLmFjY29yZGlvbicpO1xuXG4gICAgY29tcG9uZW50LmRlc3Ryb3koY29tcCk7XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBjdXN0b20gc2VsZWN0XG4gKiBAcGFyYW0gIHtvYmplY3R9IGNvbXBcbiAqIEByZXR1cm4ge29iamVjdH1cbiovXG5jb25zdCBpbml0ID0gKGNvbXApID0+IHtcbiAgICBjb25zdCB0YXJnZXRDbG9zZSA9IGNvbXAudGFyZ2V0Q2xvc2U7XG4gICAgY29uc3QgYW5jaG9yRWwgPSBjb21wLmVsLmZpbmQoYC4ke0RFRkFVTFRTLmNsYXNzZXMuYW5jaG9yfWApO1xuICAgIGNvbnN0IGNvbnRlbnRFbCA9IGNvbXAuZWwuZmluZChgLiR7REVGQVVMVFMuY2xhc3Nlcy5jb250ZW50fWApO1xuXG4gICAgLy8gQ2FjaGUgZm9yIGxhdGVyIHVzZVxuICAgIC8vIFRPRE86IENsb3NlIGFjY29yZGlvbnNcbiAgICBjb21wLmFsbCA9ICEhdGFyZ2V0Q2xvc2UgPyAkKHRhcmdldENsb3NlKSA6IG51bGw7XG5cbiAgICAvLyBGb3JjZSB0byByZW1vdmUgdGhlIGhlaWdodFxuICAgIGNvbnRlbnRFbC5yZW1vdmVBdHRyKCdzdHlsZScpO1xuXG4gICAgLy8gQ2hlY2sgaWYgaXQgc2hvdWxkIGJlIGNsb3NlZFxuICAgIGNvbXAuZWwuaGFzQ2xhc3MoREVGQVVMVFMuY2xhc3Nlcy51bmFjdGl2ZSkgJiYgY2xvc2UoY29tcC5lbCk7XG5cbiAgICAvLyBMZXRzIHNldCBldmVudHNcbiAgICBhbmNob3JFbC5vbignY2xpY2suYWNjb3JkaW9uJywgaGFuZGxlQ2xpY2suYmluZChudWxsLCBjb21wKSk7XG4gICAgJCh3aW5kb3cpLm9uKCdyZXNpemUuYWNjb3JkaW9uJywgb25SZXNpemUuYmluZChudWxsLCBjb21wKSk7XG5cbiAgICByZXR1cm4gY29tcDtcbn07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBFeHBvcnRcblxuZXhwb3J0IGRlZmF1bHQge1xuICAgIGluaXQ6IChlbCwgZGF0YSkgPT4ge1xuICAgICAgICBsZXQgY29tcCA9IGNvbXBvbmVudC5nZXRDb21wKGRhdGEsIERFRkFVTFRTKTtcbiAgICAgICAgY29tcCA9IGNvbXBvbmVudC5pbml0KGVsLCBjb21wKTtcblxuICAgICAgICByZXR1cm4gKCFlbCB8fCAhZWwubGVuZ3RoKSA/IGNvbXAgOiBpbml0KGNvbXApO1xuICAgIH0sXG4gICAgdXBkYXRlU2l6ZSwgaXNPcGVuLCBvcGVuLCBjbG9zZSwgZGVzdHJveVxufTtcbiJdfQ==