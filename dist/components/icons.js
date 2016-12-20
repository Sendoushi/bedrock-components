'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _component = require('bedrock/src/component.js');

var _component2 = _interopRequireDefault(_component);

var _dot = require('dot');

var _dot2 = _interopRequireDefault(_dot);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DEFAULTS = {
    rawTmpl: '',
    tmpl: function tmpl(comp, data) {
        return comp.rawTmpl(data);
    }
};

// -----------------------------------------
// Functions

/**
 * Renders the component
 * @param  {object} comp
 */
var render = function render(comp) {
    return _component2.default.render(comp, {});
};

/**
 * Initializes
 * @param  {object} comp
 * @return {object}
 */
var _init = function _init(comp) {
    // Lets remove any width, height and viewbox
    var rawTmpl = comp.rawTmpl.replace(/ width="([^"]+)"/g, '').replace(/ height="([^"]+)"/g, '').replace(/ viewBox="([^"]+)"/g, '').replace(/ viewbox="([^"]+)"/g, '');

    comp.rawTmpl = _dot2.default.template(rawTmpl);

    return comp;
};

// -------------------------------------------
// EXPORT

exports.default = {
    init: function init(el, data) {
        var comp = _component2.default.getComp(data, DEFAULTS);
        comp = _component2.default.init(el, comp);

        return !el || !el.length ? comp : _init(comp);
    },
    render: render,
    destroy: _component2.default.destroy
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21wb25lbnRzL2ljb25zLmpzIl0sIm5hbWVzIjpbIkRFRkFVTFRTIiwicmF3VG1wbCIsInRtcGwiLCJjb21wIiwiZGF0YSIsInJlbmRlciIsImluaXQiLCJyZXBsYWNlIiwidGVtcGxhdGUiLCJlbCIsImdldENvbXAiLCJsZW5ndGgiLCJkZXN0cm95Il0sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0FBRUE7Ozs7QUFDQTs7Ozs7O0FBRUEsSUFBTUEsV0FBVztBQUNiQyxhQUFTLEVBREk7QUFFYkMsVUFBTSxjQUFDQyxJQUFELEVBQU9DLElBQVA7QUFBQSxlQUFnQkQsS0FBS0YsT0FBTCxDQUFhRyxJQUFiLENBQWhCO0FBQUE7QUFGTyxDQUFqQjs7QUFLQTtBQUNBOztBQUVBOzs7O0FBSUEsSUFBTUMsU0FBUyxTQUFUQSxNQUFTLENBQUNGLElBQUQ7QUFBQSxXQUFVLG9CQUFVRSxNQUFWLENBQWlCRixJQUFqQixFQUF1QixFQUF2QixDQUFWO0FBQUEsQ0FBZjs7QUFFQTs7Ozs7QUFLQSxJQUFNRyxRQUFPLFNBQVBBLEtBQU8sQ0FBQ0gsSUFBRCxFQUFVO0FBQ25CO0FBQ0EsUUFBTUYsVUFBVUUsS0FBS0YsT0FBTCxDQUNYTSxPQURXLENBQ0gsbUJBREcsRUFDa0IsRUFEbEIsRUFFWEEsT0FGVyxDQUVILG9CQUZHLEVBRW1CLEVBRm5CLEVBR1hBLE9BSFcsQ0FHSCxxQkFIRyxFQUdvQixFQUhwQixFQUlYQSxPQUpXLENBSUgscUJBSkcsRUFJb0IsRUFKcEIsQ0FBaEI7O0FBTUFKLFNBQUtGLE9BQUwsR0FBZSxjQUFJTyxRQUFKLENBQWFQLE9BQWIsQ0FBZjs7QUFFQSxXQUFPRSxJQUFQO0FBQ0gsQ0FYRDs7QUFhQTtBQUNBOztrQkFFZTtBQUNYRyxVQUFNLGNBQUNHLEVBQUQsRUFBS0wsSUFBTCxFQUFjO0FBQ2hCLFlBQUlELE9BQU8sb0JBQVVPLE9BQVYsQ0FBa0JOLElBQWxCLEVBQXdCSixRQUF4QixDQUFYO0FBQ0FHLGVBQU8sb0JBQVVHLElBQVYsQ0FBZUcsRUFBZixFQUFtQk4sSUFBbkIsQ0FBUDs7QUFFQSxlQUFRLENBQUNNLEVBQUQsSUFBTyxDQUFDQSxHQUFHRSxNQUFaLEdBQXNCUixJQUF0QixHQUE2QkcsTUFBS0gsSUFBTCxDQUFwQztBQUNILEtBTlU7QUFPWEUsa0JBUFc7QUFRWE8sYUFBUyxvQkFBVUE7QUFSUixDIiwiZmlsZSI6Imljb25zLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgY29tcG9uZW50IGZyb20gJ2JlZHJvY2svc3JjL2NvbXBvbmVudC5qcyc7XG5pbXBvcnQgZG9UIGZyb20gJ2RvdCc7XG5cbmNvbnN0IERFRkFVTFRTID0ge1xuICAgIHJhd1RtcGw6ICcnLFxuICAgIHRtcGw6IChjb21wLCBkYXRhKSA9PiBjb21wLnJhd1RtcGwoZGF0YSlcbn07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBGdW5jdGlvbnNcblxuLyoqXG4gKiBSZW5kZXJzIHRoZSBjb21wb25lbnRcbiAqIEBwYXJhbSAge29iamVjdH0gY29tcFxuICovXG5jb25zdCByZW5kZXIgPSAoY29tcCkgPT4gY29tcG9uZW50LnJlbmRlcihjb21wLCB7fSk7XG5cbi8qKlxuICogSW5pdGlhbGl6ZXNcbiAqIEBwYXJhbSAge29iamVjdH0gY29tcFxuICogQHJldHVybiB7b2JqZWN0fVxuICovXG5jb25zdCBpbml0ID0gKGNvbXApID0+IHtcbiAgICAvLyBMZXRzIHJlbW92ZSBhbnkgd2lkdGgsIGhlaWdodCBhbmQgdmlld2JveFxuICAgIGNvbnN0IHJhd1RtcGwgPSBjb21wLnJhd1RtcGxcbiAgICAgICAgLnJlcGxhY2UoLyB3aWR0aD1cIihbXlwiXSspXCIvZywgJycpXG4gICAgICAgIC5yZXBsYWNlKC8gaGVpZ2h0PVwiKFteXCJdKylcIi9nLCAnJylcbiAgICAgICAgLnJlcGxhY2UoLyB2aWV3Qm94PVwiKFteXCJdKylcIi9nLCAnJylcbiAgICAgICAgLnJlcGxhY2UoLyB2aWV3Ym94PVwiKFteXCJdKylcIi9nLCAnJyk7XG5cbiAgICBjb21wLnJhd1RtcGwgPSBkb1QudGVtcGxhdGUocmF3VG1wbCk7XG5cbiAgICByZXR1cm4gY29tcDtcbn07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEVYUE9SVFxuXG5leHBvcnQgZGVmYXVsdCB7XG4gICAgaW5pdDogKGVsLCBkYXRhKSA9PiB7XG4gICAgICAgIGxldCBjb21wID0gY29tcG9uZW50LmdldENvbXAoZGF0YSwgREVGQVVMVFMpO1xuICAgICAgICBjb21wID0gY29tcG9uZW50LmluaXQoZWwsIGNvbXApO1xuXG4gICAgICAgIHJldHVybiAoIWVsIHx8ICFlbC5sZW5ndGgpID8gY29tcCA6IGluaXQoY29tcCk7XG4gICAgfSxcbiAgICByZW5kZXIsXG4gICAgZGVzdHJveTogY29tcG9uZW50LmRlc3Ryb3lcbn07XG4iXX0=