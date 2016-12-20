'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _jquery = require('jquery');

var _jquery2 = _interopRequireDefault(_jquery);

var _component = require('bedrock/src/component.js');

var _component2 = _interopRequireDefault(_component);

var _mailbox = require('bedrock/src/mailbox.js');

var _mailbox2 = _interopRequireDefault(_mailbox);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DEFAULTS = {
    headGutter: 100,
    gutter: 100,
    bottomGutter: 100,
    throttle: 50,
    els: {
        offset: null,
        items: null
    }
};

// --------------------------------
// Functions

/**
 * Handles scroll event
 * @param  {object} comp
 */
var onScroll = function onScroll(comp) {
    var headerHeight = comp.els.offset && comp.els.offset.height();
    var scroll = (0, _jquery2.default)(window).scrollTop();
    var scrollerHeight = (0, _jquery2.default)(window)[0].innerHeight;
    var docScrollHeight = document.body.scrollHeight;
    var scrollTo = scroll + headerHeight;
    var items = [];

    // Lets parse items as we need
    comp.els.items.each(function (i, el) {
        var top = (0, _jquery2.default)(el).offset().top;
        items.push({ top: top, el: el });
    });

    // No need to go further...
    if (!items.length) {
        return;
    }

    // Find the right item
    var item = items.reduce(function (a, b) {
        var aDiff = scrollTo - a.top;
        var bDiff = scrollTo - b.top;

        aDiff = aDiff < 0 ? aDiff * -1 : aDiff;
        bDiff = bDiff < 0 ? bDiff * -1 : aDiff;

        return aDiff < bDiff ? a : b;
    });

    // Now lets inform of the item
    (0, _jquery2.default)(item.el).trigger('scrollspy.hit');
    _mailbox2.default.send('scrollspy.hit', item.el);

    // Lets find if hit top or bottom
    if (scrollerHeight + scroll + comp.bottomGutter >= docScrollHeight) {
        _mailbox2.default.send('scrollspy.hitbottom');
    } else if (scroll <= comp.headGutter) {
        _mailbox2.default.send('scrollspy.hittop');
    }
};

/**
 * Scroll to target
 *
 * @param {object} comp
 * @param {string} target
 * @param {boolean} isDone
 * @returns
 */
var scrollToTarget = function scrollToTarget(comp, target, isDone) {
    var block = comp.els.items.filter(target);
    var top = void 0;

    // Find the right block
    if (!block || !block.length) {
        return;
    }

    // Animate there...
    if (comp.els.offset) {
        if (_typeof(comp.els.offset) === 'object') {
            top = block.offset().top - comp.els.offset.height();
        } else {
            top = block.offset().top - comp.els.offset;
        }
    } else {
        top = block.offset().top;
    }

    (0, _jquery2.default)('html, body').finish().animate({ scrollTop: top }, 500);

    // Lets check if it is on the right place
    if (isDone !== true) {
        comp.animThrottle && clearTimeout(comp.animThrottle);
        comp.animThrottle = setTimeout(scrollToTarget.bind(null, comp, target, true), 250);
    }
};

/**
 * Scrolls to current item
 *
 * @param {object} comp
 * @param {event} evt
 * @returns
 */
var scrollToCurrent = function scrollToCurrent(comp, evt) {
    var href = window.location.hash;

    if (!/^#[^ ]+$/.test(href)) {
        return false;
    }

    evt && evt.preventDefault();
    scrollToTarget(comp, '#' + href.slice(1), true);
};

/**
 * Destroys
 * @param  {object} comp
 */
var destroy = function destroy(comp) {
    comp.animThrottle && clearTimeout(comp.animThrottle);
    comp.throttler && clearTimeout(comp.throttler);
    (0, _jquery2.default)(window).off('scroll.scrollspy');
    _mailbox2.default.off('scrollspy.target', comp.onId);

    _component2.default.destroy(comp);
};

/**
 * Creates a custom select
 * @param  {object} comp
 * @return {object}
*/
var _init = function _init(comp) {
    // No need to go further
    if (!comp.els || !comp.els.items || !comp.els.items.length) {
        return comp;
    }

    // Set initial
    scrollToCurrent(comp);

    // Add events
    (0, _jquery2.default)(window).on('scroll.scrollspy', function () {
        comp.throttler && clearTimeout(comp.throttler);
        comp.throttler = setTimeout(function () {
            return window.requestAnimationFrame(onScroll.bind(null, comp));
        }, comp.throttle);
    });

    comp.onId = _mailbox2.default.on('scrollspy.target', scrollToTarget.bind(null, comp));

    return comp;
};

// --------------------------------
// Export

exports.default = {
    init: function init(data) {
        var comp = _component2.default.getComp(data, DEFAULTS);
        comp = _component2.default.init(null, comp);

        // So that the elements get right
        comp.els = comp.els || {};
        if (data && data.els) {
            comp.els.offset = data.els.header || comp.els.offset;
            comp.els.items = data.els.items || comp.els.items;
        } else {
            comp.els.offset = DEFAULTS.els.header;
            comp.els.items = DEFAULTS.els.items;
        }

        return _init(comp);
    },
    destroy: destroy
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21wb25lbnRzL3Njcm9sbHNweS5qcyJdLCJuYW1lcyI6WyJERUZBVUxUUyIsImhlYWRHdXR0ZXIiLCJndXR0ZXIiLCJib3R0b21HdXR0ZXIiLCJ0aHJvdHRsZSIsImVscyIsIm9mZnNldCIsIml0ZW1zIiwib25TY3JvbGwiLCJjb21wIiwiaGVhZGVySGVpZ2h0IiwiaGVpZ2h0Iiwic2Nyb2xsIiwid2luZG93Iiwic2Nyb2xsVG9wIiwic2Nyb2xsZXJIZWlnaHQiLCJpbm5lckhlaWdodCIsImRvY1Njcm9sbEhlaWdodCIsImRvY3VtZW50IiwiYm9keSIsInNjcm9sbEhlaWdodCIsInNjcm9sbFRvIiwiZWFjaCIsImkiLCJlbCIsInRvcCIsInB1c2giLCJsZW5ndGgiLCJpdGVtIiwicmVkdWNlIiwiYSIsImIiLCJhRGlmZiIsImJEaWZmIiwidHJpZ2dlciIsInNlbmQiLCJzY3JvbGxUb1RhcmdldCIsInRhcmdldCIsImlzRG9uZSIsImJsb2NrIiwiZmlsdGVyIiwiZmluaXNoIiwiYW5pbWF0ZSIsImFuaW1UaHJvdHRsZSIsImNsZWFyVGltZW91dCIsInNldFRpbWVvdXQiLCJiaW5kIiwic2Nyb2xsVG9DdXJyZW50IiwiZXZ0IiwiaHJlZiIsImxvY2F0aW9uIiwiaGFzaCIsInRlc3QiLCJwcmV2ZW50RGVmYXVsdCIsInNsaWNlIiwiZGVzdHJveSIsInRocm90dGxlciIsIm9mZiIsIm9uSWQiLCJpbml0Iiwib24iLCJyZXF1ZXN0QW5pbWF0aW9uRnJhbWUiLCJkYXRhIiwiZ2V0Q29tcCIsImhlYWRlciJdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7O0FBRUE7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7QUFFQSxJQUFNQSxXQUFXO0FBQ2JDLGdCQUFZLEdBREM7QUFFYkMsWUFBUSxHQUZLO0FBR2JDLGtCQUFjLEdBSEQ7QUFJYkMsY0FBVSxFQUpHO0FBS2JDLFNBQUs7QUFDREMsZ0JBQVEsSUFEUDtBQUVEQyxlQUFPO0FBRk47QUFMUSxDQUFqQjs7QUFXQTtBQUNBOztBQUVBOzs7O0FBSUEsSUFBTUMsV0FBVyxTQUFYQSxRQUFXLENBQUNDLElBQUQsRUFBVTtBQUN2QixRQUFNQyxlQUFlRCxLQUFLSixHQUFMLENBQVNDLE1BQVQsSUFBbUJHLEtBQUtKLEdBQUwsQ0FBU0MsTUFBVCxDQUFnQkssTUFBaEIsRUFBeEM7QUFDQSxRQUFNQyxTQUFTLHNCQUFFQyxNQUFGLEVBQVVDLFNBQVYsRUFBZjtBQUNBLFFBQU1DLGlCQUFpQixzQkFBRUYsTUFBRixFQUFVLENBQVYsRUFBYUcsV0FBcEM7QUFDQSxRQUFNQyxrQkFBa0JDLFNBQVNDLElBQVQsQ0FBY0MsWUFBdEM7QUFDQSxRQUFNQyxXQUFXVCxTQUFTRixZQUExQjtBQUNBLFFBQU1ILFFBQVEsRUFBZDs7QUFFQTtBQUNBRSxTQUFLSixHQUFMLENBQVNFLEtBQVQsQ0FBZWUsSUFBZixDQUFvQixVQUFDQyxDQUFELEVBQUlDLEVBQUosRUFBVztBQUMzQixZQUFNQyxNQUFNLHNCQUFFRCxFQUFGLEVBQU1sQixNQUFOLEdBQWVtQixHQUEzQjtBQUNBbEIsY0FBTW1CLElBQU4sQ0FBVyxFQUFFRCxRQUFGLEVBQU9ELE1BQVAsRUFBWDtBQUNILEtBSEQ7O0FBS0E7QUFDQSxRQUFJLENBQUNqQixNQUFNb0IsTUFBWCxFQUFtQjtBQUFFO0FBQVM7O0FBRTlCO0FBQ0EsUUFBTUMsT0FBT3JCLE1BQU1zQixNQUFOLENBQWEsVUFBQ0MsQ0FBRCxFQUFJQyxDQUFKLEVBQVU7QUFDaEMsWUFBSUMsUUFBUVgsV0FBV1MsRUFBRUwsR0FBekI7QUFDQSxZQUFJUSxRQUFRWixXQUFXVSxFQUFFTixHQUF6Qjs7QUFFQU8sZ0JBQVNBLFFBQVEsQ0FBVCxHQUFjQSxRQUFRLENBQUMsQ0FBdkIsR0FBMkJBLEtBQW5DO0FBQ0FDLGdCQUFTQSxRQUFRLENBQVQsR0FBY0EsUUFBUSxDQUFDLENBQXZCLEdBQTJCRCxLQUFuQzs7QUFFQSxlQUFPQSxRQUFRQyxLQUFSLEdBQWdCSCxDQUFoQixHQUFvQkMsQ0FBM0I7QUFDSCxLQVJZLENBQWI7O0FBVUE7QUFDQSwwQkFBRUgsS0FBS0osRUFBUCxFQUFXVSxPQUFYLENBQW1CLGVBQW5CO0FBQ0Esc0JBQVFDLElBQVIsQ0FBYSxlQUFiLEVBQThCUCxLQUFLSixFQUFuQzs7QUFFQTtBQUNBLFFBQUlULGlCQUFpQkgsTUFBakIsR0FBMEJILEtBQUtOLFlBQS9CLElBQStDYyxlQUFuRCxFQUFvRTtBQUNoRSwwQkFBUWtCLElBQVIsQ0FBYSxxQkFBYjtBQUNILEtBRkQsTUFFTyxJQUFJdkIsVUFBVUgsS0FBS1IsVUFBbkIsRUFBK0I7QUFDbEMsMEJBQVFrQyxJQUFSLENBQWEsa0JBQWI7QUFDSDtBQUNKLENBdENEOztBQXdDQTs7Ozs7Ozs7QUFRQSxJQUFNQyxpQkFBaUIsU0FBakJBLGNBQWlCLENBQUMzQixJQUFELEVBQU80QixNQUFQLEVBQWVDLE1BQWYsRUFBMEI7QUFDN0MsUUFBTUMsUUFBUTlCLEtBQUtKLEdBQUwsQ0FBU0UsS0FBVCxDQUFlaUMsTUFBZixDQUFzQkgsTUFBdEIsQ0FBZDtBQUNBLFFBQUlaLFlBQUo7O0FBRUE7QUFDQSxRQUFJLENBQUNjLEtBQUQsSUFBVSxDQUFDQSxNQUFNWixNQUFyQixFQUE2QjtBQUFFO0FBQVM7O0FBRXhDO0FBQ0EsUUFBSWxCLEtBQUtKLEdBQUwsQ0FBU0MsTUFBYixFQUFxQjtBQUNqQixZQUFJLFFBQU9HLEtBQUtKLEdBQUwsQ0FBU0MsTUFBaEIsTUFBMkIsUUFBL0IsRUFBeUM7QUFDckNtQixrQkFBTWMsTUFBTWpDLE1BQU4sR0FBZW1CLEdBQWYsR0FBcUJoQixLQUFLSixHQUFMLENBQVNDLE1BQVQsQ0FBZ0JLLE1BQWhCLEVBQTNCO0FBQ0gsU0FGRCxNQUVPO0FBQ0hjLGtCQUFNYyxNQUFNakMsTUFBTixHQUFlbUIsR0FBZixHQUFxQmhCLEtBQUtKLEdBQUwsQ0FBU0MsTUFBcEM7QUFDSDtBQUNKLEtBTkQsTUFNTztBQUNIbUIsY0FBTWMsTUFBTWpDLE1BQU4sR0FBZW1CLEdBQXJCO0FBQ0g7O0FBRUQsMEJBQUUsWUFBRixFQUFnQmdCLE1BQWhCLEdBQXlCQyxPQUF6QixDQUFpQyxFQUFFNUIsV0FBV1csR0FBYixFQUFqQyxFQUFxRCxHQUFyRDs7QUFFQTtBQUNBLFFBQUlhLFdBQVcsSUFBZixFQUFxQjtBQUNqQjdCLGFBQUtrQyxZQUFMLElBQXFCQyxhQUFhbkMsS0FBS2tDLFlBQWxCLENBQXJCO0FBQ0FsQyxhQUFLa0MsWUFBTCxHQUFvQkUsV0FBV1QsZUFBZVUsSUFBZixDQUFvQixJQUFwQixFQUEwQnJDLElBQTFCLEVBQWdDNEIsTUFBaEMsRUFBd0MsSUFBeEMsQ0FBWCxFQUEwRCxHQUExRCxDQUFwQjtBQUNIO0FBQ0osQ0F6QkQ7O0FBMkJBOzs7Ozs7O0FBT0EsSUFBTVUsa0JBQWtCLFNBQWxCQSxlQUFrQixDQUFDdEMsSUFBRCxFQUFPdUMsR0FBUCxFQUFlO0FBQ25DLFFBQU1DLE9BQU9wQyxPQUFPcUMsUUFBUCxDQUFnQkMsSUFBN0I7O0FBRUEsUUFBSSxDQUFDLFdBQVdDLElBQVgsQ0FBZ0JILElBQWhCLENBQUwsRUFBNEI7QUFDeEIsZUFBTyxLQUFQO0FBQ0g7O0FBRURELFdBQU9BLElBQUlLLGNBQUosRUFBUDtBQUNBakIsbUJBQWUzQixJQUFmLFFBQXlCd0MsS0FBS0ssS0FBTCxDQUFXLENBQVgsQ0FBekIsRUFBMEMsSUFBMUM7QUFDSCxDQVREOztBQVdBOzs7O0FBSUEsSUFBTUMsVUFBVSxTQUFWQSxPQUFVLENBQUM5QyxJQUFELEVBQVU7QUFDdEJBLFNBQUtrQyxZQUFMLElBQXFCQyxhQUFhbkMsS0FBS2tDLFlBQWxCLENBQXJCO0FBQ0FsQyxTQUFLK0MsU0FBTCxJQUFrQlosYUFBYW5DLEtBQUsrQyxTQUFsQixDQUFsQjtBQUNBLDBCQUFFM0MsTUFBRixFQUFVNEMsR0FBVixDQUFjLGtCQUFkO0FBQ0Esc0JBQVFBLEdBQVIsQ0FBWSxrQkFBWixFQUFnQ2hELEtBQUtpRCxJQUFyQzs7QUFFQSx3QkFBVUgsT0FBVixDQUFrQjlDLElBQWxCO0FBQ0gsQ0FQRDs7QUFTQTs7Ozs7QUFLQSxJQUFNa0QsUUFBTyxTQUFQQSxLQUFPLENBQUNsRCxJQUFELEVBQVU7QUFDbkI7QUFDQSxRQUFJLENBQUNBLEtBQUtKLEdBQU4sSUFBYSxDQUFDSSxLQUFLSixHQUFMLENBQVNFLEtBQXZCLElBQWdDLENBQUNFLEtBQUtKLEdBQUwsQ0FBU0UsS0FBVCxDQUFlb0IsTUFBcEQsRUFBNEQ7QUFDeEQsZUFBT2xCLElBQVA7QUFDSDs7QUFFRDtBQUNBc0Msb0JBQWdCdEMsSUFBaEI7O0FBRUE7QUFDQSwwQkFBRUksTUFBRixFQUFVK0MsRUFBVixDQUFhLGtCQUFiLEVBQWlDLFlBQU07QUFDbkNuRCxhQUFLK0MsU0FBTCxJQUFrQlosYUFBYW5DLEtBQUsrQyxTQUFsQixDQUFsQjtBQUNBL0MsYUFBSytDLFNBQUwsR0FBaUJYLFdBQVc7QUFBQSxtQkFBTWhDLE9BQU9nRCxxQkFBUCxDQUE2QnJELFNBQVNzQyxJQUFULENBQWMsSUFBZCxFQUFvQnJDLElBQXBCLENBQTdCLENBQU47QUFBQSxTQUFYLEVBQTBFQSxLQUFLTCxRQUEvRSxDQUFqQjtBQUNILEtBSEQ7O0FBS0FLLFNBQUtpRCxJQUFMLEdBQVksa0JBQVFFLEVBQVIsQ0FBVyxrQkFBWCxFQUErQnhCLGVBQWVVLElBQWYsQ0FBb0IsSUFBcEIsRUFBMEJyQyxJQUExQixDQUEvQixDQUFaOztBQUVBLFdBQU9BLElBQVA7QUFDSCxDQWxCRDs7QUFvQkE7QUFDQTs7a0JBRWU7QUFDWGtELFVBQU0sY0FBQ0csSUFBRCxFQUFVO0FBQ1osWUFBSXJELE9BQU8sb0JBQVVzRCxPQUFWLENBQWtCRCxJQUFsQixFQUF3QjlELFFBQXhCLENBQVg7QUFDQVMsZUFBTyxvQkFBVWtELElBQVYsQ0FBZSxJQUFmLEVBQXFCbEQsSUFBckIsQ0FBUDs7QUFFQTtBQUNBQSxhQUFLSixHQUFMLEdBQVdJLEtBQUtKLEdBQUwsSUFBWSxFQUF2QjtBQUNBLFlBQUl5RCxRQUFRQSxLQUFLekQsR0FBakIsRUFBc0I7QUFDbEJJLGlCQUFLSixHQUFMLENBQVNDLE1BQVQsR0FBa0J3RCxLQUFLekQsR0FBTCxDQUFTMkQsTUFBVCxJQUFtQnZELEtBQUtKLEdBQUwsQ0FBU0MsTUFBOUM7QUFDQUcsaUJBQUtKLEdBQUwsQ0FBU0UsS0FBVCxHQUFpQnVELEtBQUt6RCxHQUFMLENBQVNFLEtBQVQsSUFBa0JFLEtBQUtKLEdBQUwsQ0FBU0UsS0FBNUM7QUFDSCxTQUhELE1BR087QUFDSEUsaUJBQUtKLEdBQUwsQ0FBU0MsTUFBVCxHQUFrQk4sU0FBU0ssR0FBVCxDQUFhMkQsTUFBL0I7QUFDQXZELGlCQUFLSixHQUFMLENBQVNFLEtBQVQsR0FBaUJQLFNBQVNLLEdBQVQsQ0FBYUUsS0FBOUI7QUFDSDs7QUFFRCxlQUFPb0QsTUFBS2xELElBQUwsQ0FBUDtBQUNILEtBaEJVO0FBaUJYOEM7QUFqQlcsQyIsImZpbGUiOiJzY3JvbGxzcHkuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbmltcG9ydCAkIGZyb20gJ2pxdWVyeSc7XG5pbXBvcnQgY29tcG9uZW50IGZyb20gJ2JlZHJvY2svc3JjL2NvbXBvbmVudC5qcyc7XG5pbXBvcnQgbWFpbGJveCBmcm9tICdiZWRyb2NrL3NyYy9tYWlsYm94LmpzJztcblxuY29uc3QgREVGQVVMVFMgPSB7XG4gICAgaGVhZEd1dHRlcjogMTAwLFxuICAgIGd1dHRlcjogMTAwLFxuICAgIGJvdHRvbUd1dHRlcjogMTAwLFxuICAgIHRocm90dGxlOiA1MCxcbiAgICBlbHM6IHtcbiAgICAgICAgb2Zmc2V0OiBudWxsLFxuICAgICAgICBpdGVtczogbnVsbFxuICAgIH1cbn07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBGdW5jdGlvbnNcblxuLyoqXG4gKiBIYW5kbGVzIHNjcm9sbCBldmVudFxuICogQHBhcmFtICB7b2JqZWN0fSBjb21wXG4gKi9cbmNvbnN0IG9uU2Nyb2xsID0gKGNvbXApID0+IHtcbiAgICBjb25zdCBoZWFkZXJIZWlnaHQgPSBjb21wLmVscy5vZmZzZXQgJiYgY29tcC5lbHMub2Zmc2V0LmhlaWdodCgpO1xuICAgIGNvbnN0IHNjcm9sbCA9ICQod2luZG93KS5zY3JvbGxUb3AoKTtcbiAgICBjb25zdCBzY3JvbGxlckhlaWdodCA9ICQod2luZG93KVswXS5pbm5lckhlaWdodDtcbiAgICBjb25zdCBkb2NTY3JvbGxIZWlnaHQgPSBkb2N1bWVudC5ib2R5LnNjcm9sbEhlaWdodDtcbiAgICBjb25zdCBzY3JvbGxUbyA9IHNjcm9sbCArIGhlYWRlckhlaWdodDtcbiAgICBjb25zdCBpdGVtcyA9IFtdO1xuXG4gICAgLy8gTGV0cyBwYXJzZSBpdGVtcyBhcyB3ZSBuZWVkXG4gICAgY29tcC5lbHMuaXRlbXMuZWFjaCgoaSwgZWwpID0+IHtcbiAgICAgICAgY29uc3QgdG9wID0gJChlbCkub2Zmc2V0KCkudG9wO1xuICAgICAgICBpdGVtcy5wdXNoKHsgdG9wLCBlbCB9KTtcbiAgICB9KTtcblxuICAgIC8vIE5vIG5lZWQgdG8gZ28gZnVydGhlci4uLlxuICAgIGlmICghaXRlbXMubGVuZ3RoKSB7IHJldHVybjsgfVxuXG4gICAgLy8gRmluZCB0aGUgcmlnaHQgaXRlbVxuICAgIGNvbnN0IGl0ZW0gPSBpdGVtcy5yZWR1Y2UoKGEsIGIpID0+IHtcbiAgICAgICAgbGV0IGFEaWZmID0gc2Nyb2xsVG8gLSBhLnRvcDtcbiAgICAgICAgbGV0IGJEaWZmID0gc2Nyb2xsVG8gLSBiLnRvcDtcblxuICAgICAgICBhRGlmZiA9IChhRGlmZiA8IDApID8gYURpZmYgKiAtMSA6IGFEaWZmO1xuICAgICAgICBiRGlmZiA9IChiRGlmZiA8IDApID8gYkRpZmYgKiAtMSA6IGFEaWZmO1xuXG4gICAgICAgIHJldHVybiBhRGlmZiA8IGJEaWZmID8gYSA6IGI7XG4gICAgfSk7XG5cbiAgICAvLyBOb3cgbGV0cyBpbmZvcm0gb2YgdGhlIGl0ZW1cbiAgICAkKGl0ZW0uZWwpLnRyaWdnZXIoJ3Njcm9sbHNweS5oaXQnKTtcbiAgICBtYWlsYm94LnNlbmQoJ3Njcm9sbHNweS5oaXQnLCBpdGVtLmVsKTtcblxuICAgIC8vIExldHMgZmluZCBpZiBoaXQgdG9wIG9yIGJvdHRvbVxuICAgIGlmIChzY3JvbGxlckhlaWdodCArIHNjcm9sbCArIGNvbXAuYm90dG9tR3V0dGVyID49IGRvY1Njcm9sbEhlaWdodCkge1xuICAgICAgICBtYWlsYm94LnNlbmQoJ3Njcm9sbHNweS5oaXRib3R0b20nKTtcbiAgICB9IGVsc2UgaWYgKHNjcm9sbCA8PSBjb21wLmhlYWRHdXR0ZXIpIHtcbiAgICAgICAgbWFpbGJveC5zZW5kKCdzY3JvbGxzcHkuaGl0dG9wJyk7XG4gICAgfVxufTtcblxuLyoqXG4gKiBTY3JvbGwgdG8gdGFyZ2V0XG4gKlxuICogQHBhcmFtIHtvYmplY3R9IGNvbXBcbiAqIEBwYXJhbSB7c3RyaW5nfSB0YXJnZXRcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNEb25lXG4gKiBAcmV0dXJuc1xuICovXG5jb25zdCBzY3JvbGxUb1RhcmdldCA9IChjb21wLCB0YXJnZXQsIGlzRG9uZSkgPT4ge1xuICAgIGNvbnN0IGJsb2NrID0gY29tcC5lbHMuaXRlbXMuZmlsdGVyKHRhcmdldCk7XG4gICAgbGV0IHRvcDtcblxuICAgIC8vIEZpbmQgdGhlIHJpZ2h0IGJsb2NrXG4gICAgaWYgKCFibG9jayB8fCAhYmxvY2subGVuZ3RoKSB7IHJldHVybjsgfVxuXG4gICAgLy8gQW5pbWF0ZSB0aGVyZS4uLlxuICAgIGlmIChjb21wLmVscy5vZmZzZXQpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBjb21wLmVscy5vZmZzZXQgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICB0b3AgPSBibG9jay5vZmZzZXQoKS50b3AgLSBjb21wLmVscy5vZmZzZXQuaGVpZ2h0KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0b3AgPSBibG9jay5vZmZzZXQoKS50b3AgLSBjb21wLmVscy5vZmZzZXQ7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICB0b3AgPSBibG9jay5vZmZzZXQoKS50b3A7XG4gICAgfVxuXG4gICAgJCgnaHRtbCwgYm9keScpLmZpbmlzaCgpLmFuaW1hdGUoeyBzY3JvbGxUb3A6IHRvcCB9LCA1MDApO1xuXG4gICAgLy8gTGV0cyBjaGVjayBpZiBpdCBpcyBvbiB0aGUgcmlnaHQgcGxhY2VcbiAgICBpZiAoaXNEb25lICE9PSB0cnVlKSB7XG4gICAgICAgIGNvbXAuYW5pbVRocm90dGxlICYmIGNsZWFyVGltZW91dChjb21wLmFuaW1UaHJvdHRsZSk7XG4gICAgICAgIGNvbXAuYW5pbVRocm90dGxlID0gc2V0VGltZW91dChzY3JvbGxUb1RhcmdldC5iaW5kKG51bGwsIGNvbXAsIHRhcmdldCwgdHJ1ZSksIDI1MCk7XG4gICAgfVxufTtcblxuLyoqXG4gKiBTY3JvbGxzIHRvIGN1cnJlbnQgaXRlbVxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBjb21wXG4gKiBAcGFyYW0ge2V2ZW50fSBldnRcbiAqIEByZXR1cm5zXG4gKi9cbmNvbnN0IHNjcm9sbFRvQ3VycmVudCA9IChjb21wLCBldnQpID0+IHtcbiAgICBjb25zdCBocmVmID0gd2luZG93LmxvY2F0aW9uLmhhc2g7XG5cbiAgICBpZiAoIS9eI1teIF0rJC8udGVzdChocmVmKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgZXZ0ICYmIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHNjcm9sbFRvVGFyZ2V0KGNvbXAsIGAjJHtocmVmLnNsaWNlKDEpfWAsIHRydWUpO1xufTtcblxuLyoqXG4gKiBEZXN0cm95c1xuICogQHBhcmFtICB7b2JqZWN0fSBjb21wXG4gKi9cbmNvbnN0IGRlc3Ryb3kgPSAoY29tcCkgPT4ge1xuICAgIGNvbXAuYW5pbVRocm90dGxlICYmIGNsZWFyVGltZW91dChjb21wLmFuaW1UaHJvdHRsZSk7XG4gICAgY29tcC50aHJvdHRsZXIgJiYgY2xlYXJUaW1lb3V0KGNvbXAudGhyb3R0bGVyKTtcbiAgICAkKHdpbmRvdykub2ZmKCdzY3JvbGwuc2Nyb2xsc3B5Jyk7XG4gICAgbWFpbGJveC5vZmYoJ3Njcm9sbHNweS50YXJnZXQnLCBjb21wLm9uSWQpO1xuXG4gICAgY29tcG9uZW50LmRlc3Ryb3koY29tcCk7XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBjdXN0b20gc2VsZWN0XG4gKiBAcGFyYW0gIHtvYmplY3R9IGNvbXBcbiAqIEByZXR1cm4ge29iamVjdH1cbiovXG5jb25zdCBpbml0ID0gKGNvbXApID0+IHtcbiAgICAvLyBObyBuZWVkIHRvIGdvIGZ1cnRoZXJcbiAgICBpZiAoIWNvbXAuZWxzIHx8ICFjb21wLmVscy5pdGVtcyB8fCAhY29tcC5lbHMuaXRlbXMubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBjb21wO1xuICAgIH1cblxuICAgIC8vIFNldCBpbml0aWFsXG4gICAgc2Nyb2xsVG9DdXJyZW50KGNvbXApO1xuXG4gICAgLy8gQWRkIGV2ZW50c1xuICAgICQod2luZG93KS5vbignc2Nyb2xsLnNjcm9sbHNweScsICgpID0+IHtcbiAgICAgICAgY29tcC50aHJvdHRsZXIgJiYgY2xlYXJUaW1lb3V0KGNvbXAudGhyb3R0bGVyKTtcbiAgICAgICAgY29tcC50aHJvdHRsZXIgPSBzZXRUaW1lb3V0KCgpID0+IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUob25TY3JvbGwuYmluZChudWxsLCBjb21wKSksIGNvbXAudGhyb3R0bGUpO1xuICAgIH0pO1xuXG4gICAgY29tcC5vbklkID0gbWFpbGJveC5vbignc2Nyb2xsc3B5LnRhcmdldCcsIHNjcm9sbFRvVGFyZ2V0LmJpbmQobnVsbCwgY29tcCkpO1xuXG4gICAgcmV0dXJuIGNvbXA7XG59O1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gRXhwb3J0XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgICBpbml0OiAoZGF0YSkgPT4ge1xuICAgICAgICBsZXQgY29tcCA9IGNvbXBvbmVudC5nZXRDb21wKGRhdGEsIERFRkFVTFRTKTtcbiAgICAgICAgY29tcCA9IGNvbXBvbmVudC5pbml0KG51bGwsIGNvbXApO1xuXG4gICAgICAgIC8vIFNvIHRoYXQgdGhlIGVsZW1lbnRzIGdldCByaWdodFxuICAgICAgICBjb21wLmVscyA9IGNvbXAuZWxzIHx8IHt9O1xuICAgICAgICBpZiAoZGF0YSAmJiBkYXRhLmVscykge1xuICAgICAgICAgICAgY29tcC5lbHMub2Zmc2V0ID0gZGF0YS5lbHMuaGVhZGVyIHx8IGNvbXAuZWxzLm9mZnNldDtcbiAgICAgICAgICAgIGNvbXAuZWxzLml0ZW1zID0gZGF0YS5lbHMuaXRlbXMgfHwgY29tcC5lbHMuaXRlbXM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb21wLmVscy5vZmZzZXQgPSBERUZBVUxUUy5lbHMuaGVhZGVyO1xuICAgICAgICAgICAgY29tcC5lbHMuaXRlbXMgPSBERUZBVUxUUy5lbHMuaXRlbXM7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gaW5pdChjb21wKTtcbiAgICB9LFxuICAgIGRlc3Ryb3lcbn07XG4iXX0=