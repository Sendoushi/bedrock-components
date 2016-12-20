'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _jquery = require('jquery');

var _jquery2 = _interopRequireDefault(_jquery);

var _component = require('bedrock/src/component.js');

var _component2 = _interopRequireDefault(_component);

var _mailbox = require('bedrock/src/mailbox.js');

var _mailbox2 = _interopRequireDefault(_mailbox);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DEFAULTS = {
    classes: {
        wrap: 'modal',
        active: 'is-in',
        content: 'modal__content',
        disableScroll: 'disable-scroll',
        closeButton: 'modal__close'
    },
    events: {
        in: 'modal.in',
        out: 'modal.out'
    }
};

// --------------------------------
// Functions

/**
 * On toggle handler
 * @param  {object} comp
 * @param  {event} evt
 */
var onClose = function onClose(comp, evt) {
    evt.preventDefault();

    comp.el[0].className = comp.classes.wrap;
    (0, _jquery2.default)(document.body).removeClass(comp.classes.disableScroll);
};

/**
 * On modal open
 * @param  {object} comp
 * @param  {object} data
 */
var onOpen = function onOpen(comp, data) {
    comp.content.html(data.tmpl);

    comp.el[0].className = comp.classes.wrap + ' ' + comp.classes.active + ' ' + (data.class || '');
    (0, _jquery2.default)(document.body).addClass(comp.classes.disableScroll);

    // Lets take care of other stuff
    var close = comp.el.find('.' + comp.classes.closeButton);

    // Add events
    close.on('click', onClose.bind(null, comp));
};

/**
 * Destroys
 * @param  {object} comp
 */
var destroy = function destroy(comp) {
    _mailbox2.default.off(comp.events.in, comp.inMbId);
    _mailbox2.default.off(comp.events.out, comp.outMbId);
    comp.el.off(comp.events.in);
    comp.el.off(comp.events.out);

    _component2.default.destroy(comp);
};

/**
 * Creates a modal
 * @param  {object} comp
 * @return {object}
 */
var _init = function _init(comp) {
    comp.content = comp.el.find('.' + comp.classes.content);

    // Add events
    comp.el.on('click', onClose.bind(null, comp));
    comp.content.on('click', function (evt) {
        return evt.stopPropagation();
    });

    // Set of specific events
    comp.inMbId = _mailbox2.default.on(comp.events.in, onOpen.bind(null, comp));
    comp.outMbId = _mailbox2.default.on(comp.events.out, onClose.bind(null, comp));
    comp.el.on(comp.events.in, onOpen.bind(null, comp));
    comp.el.on(comp.events.out, onClose.bind(null, comp));

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
    destroy: destroy
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21wb25lbnRzL21vZGFsLmpzIl0sIm5hbWVzIjpbIkRFRkFVTFRTIiwiY2xhc3NlcyIsIndyYXAiLCJhY3RpdmUiLCJjb250ZW50IiwiZGlzYWJsZVNjcm9sbCIsImNsb3NlQnV0dG9uIiwiZXZlbnRzIiwiaW4iLCJvdXQiLCJvbkNsb3NlIiwiY29tcCIsImV2dCIsInByZXZlbnREZWZhdWx0IiwiZWwiLCJjbGFzc05hbWUiLCJkb2N1bWVudCIsImJvZHkiLCJyZW1vdmVDbGFzcyIsIm9uT3BlbiIsImRhdGEiLCJodG1sIiwidG1wbCIsImNsYXNzIiwiYWRkQ2xhc3MiLCJjbG9zZSIsImZpbmQiLCJvbiIsImJpbmQiLCJkZXN0cm95Iiwib2ZmIiwiaW5NYklkIiwib3V0TWJJZCIsImluaXQiLCJzdG9wUHJvcGFnYXRpb24iLCJnZXRDb21wIiwibGVuZ3RoIl0sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0FBRUE7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7QUFFQSxJQUFNQSxXQUFXO0FBQ2JDLGFBQVM7QUFDTEMsY0FBTSxPQUREO0FBRUxDLGdCQUFRLE9BRkg7QUFHTEMsaUJBQVMsZ0JBSEo7QUFJTEMsdUJBQWUsZ0JBSlY7QUFLTEMscUJBQWE7QUFMUixLQURJO0FBUWJDLFlBQVE7QUFDSkMsWUFBSSxVQURBO0FBRUpDLGFBQUs7QUFGRDtBQVJLLENBQWpCOztBQWNBO0FBQ0E7O0FBRUE7Ozs7O0FBS0EsSUFBTUMsVUFBVSxTQUFWQSxPQUFVLENBQUNDLElBQUQsRUFBT0MsR0FBUCxFQUFlO0FBQzNCQSxRQUFJQyxjQUFKOztBQUVBRixTQUFLRyxFQUFMLENBQVEsQ0FBUixFQUFXQyxTQUFYLEdBQXVCSixLQUFLVixPQUFMLENBQWFDLElBQXBDO0FBQ0EsMEJBQUVjLFNBQVNDLElBQVgsRUFBaUJDLFdBQWpCLENBQTZCUCxLQUFLVixPQUFMLENBQWFJLGFBQTFDO0FBQ0gsQ0FMRDs7QUFPQTs7Ozs7QUFLQSxJQUFNYyxTQUFTLFNBQVRBLE1B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QUFPLENBQUNBLEdBQUdzQixNQUFaLEdBQXNCekIsSUFBdEIsR0FBNkJzQixNQUFLdEIsSUFBTCxDQUFwQztBQUNILEtBTlU7QUFPWGtCO0FBUFcsQyIsImZpbGUiOiJtb2RhbC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0ICQgZnJvbSAnanF1ZXJ5JztcbmltcG9ydCBjb21wb25lbnQgZnJvbSAnYmVkcm9jay9zcmMvY29tcG9uZW50LmpzJztcbmltcG9ydCBtYWlsYm94IGZyb20gJ2JlZHJvY2svc3JjL21haWxib3guanMnO1xuXG5jb25zdCBERUZBVUxUUyA9IHtcbiAgICBjbGFzc2VzOiB7XG4gICAgICAgIHdyYXA6ICdtb2RhbCcsXG4gICAgICAgIGFjdGl2ZTogJ2lzLWluJyxcbiAgICAgICAgY29udGVudDogJ21vZGFsX19jb250ZW50JyxcbiAgICAgICAgZGlzYWJsZVNjcm9sbDogJ2Rpc2FibGUtc2Nyb2xsJyxcbiAgICAgICAgY2xvc2VCdXR0b246ICdtb2RhbF9fY2xvc2UnXG4gICAgfSxcbiAgICBldmVudHM6IHtcbiAgICAgICAgaW46ICdtb2RhbC5pbicsXG4gICAgICAgIG91dDogJ21vZGFsLm91dCdcbiAgICB9XG59O1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gRnVuY3Rpb25zXG5cbi8qKlxuICogT24gdG9nZ2xlIGhhbmRsZXJcbiAqIEBwYXJhbSAge29iamVjdH0gY29tcFxuICogQHBhcmFtICB7ZXZlbnR9IGV2dFxuICovXG5jb25zdCBvbkNsb3NlID0gKGNvbXAsIGV2dCkgPT4ge1xuICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgY29tcC5lbFswXS5jbGFzc05hbWUgPSBjb21wLmNsYXNzZXMud3JhcDtcbiAgICAkKGRvY3VtZW50LmJvZHkpLnJlbW92ZUNsYXNzKGNvbXAuY2xhc3Nlcy5kaXNhYmxlU2Nyb2xsKTtcbn07XG5cbi8qKlxuICogT24gbW9kYWwgb3BlblxuICogQHBhcmFtICB7b2JqZWN0fSBjb21wXG4gKiBAcGFyYW0gIHtvYmplY3R9IGRhdGFcbiAqL1xuY29uc3Qgb25PcGVuID0gKGNvbXAsIGRhdGEpID0+IHtcbiAgICBjb21wLmNvbnRlbnQuaHRtbChkYXRhLnRtcGwpO1xuXG4gICAgY29tcC5lbFswXS5jbGFzc05hbWUgPSBgJHtjb21wLmNsYXNzZXMud3JhcH0gJHtjb21wLmNsYXNzZXMuYWN0aXZlfSAkeyhkYXRhLmNsYXNzIHx8ICcnKX1gO1xuICAgICQoZG9jdW1lbnQuYm9keSkuYWRkQ2xhc3MoY29tcC5jbGFzc2VzLmRpc2FibGVTY3JvbGwpO1xuXG4gICAgLy8gTGV0cyB0YWtlIGNhcmUgb2Ygb3RoZXIgc3R1ZmZcbiAgICBjb25zdCBjbG9zZSA9IGNvbXAuZWwuZmluZChgLiR7Y29tcC5jbGFzc2VzLmNsb3NlQnV0dG9ufWApO1xuXG4gICAgLy8gQWRkIGV2ZW50c1xuICAgIGNsb3NlLm9uKCdjbGljaycsIG9uQ2xvc2UuYmluZChudWxsLCBjb21wKSk7XG59O1xuXG4vKipcbiAqIERlc3Ryb3lzXG4gKiBAcGFyYW0gIHtvYmplY3R9IGNvbXBcbiAqL1xuY29uc3QgZGVzdHJveSA9IChjb21wKSA9PiB7XG4gICAgbWFpbGJveC5vZmYoY29tcC5ldmVudHMuaW4sIGNvbXAuaW5NYklkKTtcbiAgICBtYWlsYm94Lm9mZihjb21wLmV2ZW50cy5vdXQsIGNvbXAub3V0TWJJZCk7XG4gICAgY29tcC5lbC5vZmYoY29tcC5ldmVudHMuaW4pO1xuICAgIGNvbXAuZWwub2ZmKGNvbXAuZXZlbnRzLm91dCk7XG5cbiAgICBjb21wb25lbnQuZGVzdHJveShjb21wKTtcbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhIG1vZGFsXG4gKiBAcGFyYW0gIHtvYmplY3R9IGNvbXBcbiAqIEByZXR1cm4ge29iamVjdH1cbiAqL1xuY29uc3QgaW5pdCA9IChjb21wKSA9PiB7XG4gICAgY29tcC5jb250ZW50ID0gY29tcC5lbC5maW5kKGAuJHtjb21wLmNsYXNzZXMuY29udGVudH1gKTtcblxuICAgIC8vIEFkZCBldmVudHNcbiAgICBjb21wLmVsLm9uKCdjbGljaycsIG9uQ2xvc2UuYmluZChudWxsLCBjb21wKSk7XG4gICAgY29tcC5jb250ZW50Lm9uKCdjbGljaycsIGV2dCA9PiBldnQuc3RvcFByb3BhZ2F0aW9uKCkpO1xuXG4gICAgLy8gU2V0IG9mIHNwZWNpZmljIGV2ZW50c1xuICAgIGNvbXAuaW5NYklkID0gbWFpbGJveC5vbihjb21wLmV2ZW50cy5pbiwgb25PcGVuLmJpbmQobnVsbCwgY29tcCkpO1xuICAgIGNvbXAub3V0TWJJZCA9IG1haWxib3gub24oY29tcC5ldmVudHMub3V0LCBvbkNsb3NlLmJpbmQobnVsbCwgY29tcCkpO1xuICAgIGNvbXAuZWwub24oY29tcC5ldmVudHMuaW4sIG9uT3Blbi5iaW5kKG51bGwsIGNvbXApKTtcbiAgICBjb21wLmVsLm9uKGNvbXAuZXZlbnRzLm91dCwgb25DbG9zZS5iaW5kKG51bGwsIGNvbXApKTtcblxuICAgIHJldHVybiBjb21wO1xufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEV4cG9ydFxuXG5leHBvcnQgZGVmYXVsdCB7XG4gICAgaW5pdDogKGVsLCBkYXRhKSA9PiB7XG4gICAgICAgIGxldCBjb21wID0gY29tcG9uZW50LmdldENvbXAoZGF0YSwgREVGQVVMVFMpO1xuICAgICAgICBjb21wID0gY29tcG9uZW50LmluaXQoZWwsIGNvbXApO1xuXG4gICAgICAgIHJldHVybiAoIWVsIHx8ICFlbC5sZW5ndGgpID8gY29tcCA6IGluaXQoY29tcCk7XG4gICAgfSxcbiAgICBkZXN0cm95XG59O1xuIl19