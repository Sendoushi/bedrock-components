'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Component = undefined;

var _jquery = require('bedrock/src/component/jquery.js');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// -----------------------------------------
// Functions

/**
 * Gets template string
 *
 * @param {string} rawTmpl
 * @returns {string}
 */
var getTmplString = function getTmplString(rawTmpl) {
    var tmpl = rawTmpl;

    return tmpl.replace(/ width="([^"]+)"/g, '').replace(/ height="([^"]+)"/g, '').replace(/ viewBox="([^"]+)"/g, '').replace(/ viewbox="([^"]+)"/g, '');
};

/**
 * Gets template right
 *
 * @param {string} rawTmpl
 * @returns {string|function}
 */
var getTmpl = function getTmpl(rawTmpl) {
    if (rawTmpl === undefined) {
        return rawTmpl;
    }

    if (typeof rawTmpl === 'string') {
        return getTmplString(rawTmpl);
    }

    if (rawTmpl !== undefined && typeof rawTmpl === 'function' && typeof rawTmpl !== 'string') {
        return function (data) {
            return getTmplString(rawTmpl(data));
        };
    }

    return rawTmpl;
};

// --------------------------------
// Class

var Component = function (_Comp) {
    _inherits(Component, _Comp);

    // Constructor
    function Component($el) {
        var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        _classCallCheck(this, Component);

        return _possibleConstructorReturn(this, (Component.__proto__ || Object.getPrototypeOf(Component)).call(this, $el, {
            els: data.els,
            tmpl: getTmpl(data.tmpl),
            render: data.render,
            comps: data.comps,
            state: data.state
        }));
    }

    return Component;
}(_jquery.Component);

exports.Component = Component;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pY29ucy5qcyJdLCJuYW1lcyI6WyJnZXRUbXBsU3RyaW5nIiwicmF3VG1wbCIsInRtcGwiLCJyZXBsYWNlIiwiZ2V0VG1wbCIsInVuZGVmaW5lZCIsImRhdGEiLCJDb21wb25lbnQiLCIkZWwiLCJlbHMiLCJyZW5kZXIiLCJjb21wcyIsInN0YXRlIl0sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7OztBQUVBOzs7Ozs7OztBQUVBO0FBQ0E7O0FBRUE7Ozs7OztBQU1BLElBQU1BLGdCQUFnQixTQUFoQkEsYUFBZ0IsQ0FBQ0MsT0FBRCxFQUFhO0FBQy9CLFFBQU1DLE9BQU9ELE9BQWI7O0FBRUEsV0FBT0MsS0FDTkMsT0FETSxDQUNFLG1CQURGLEVBQ3VCLEVBRHZCLEVBRU5BLE9BRk0sQ0FFRSxvQkFGRixFQUV3QixFQUZ4QixFQUdOQSxPQUhNLENBR0UscUJBSEYsRUFHeUIsRUFIekIsRUFJTkEsT0FKTSxDQUlFLHFCQUpGLEVBSXlCLEVBSnpCLENBQVA7QUFLSCxDQVJEOztBQVVBOzs7Ozs7QUFNQSxJQUFNQyxVQUFVLFNBQVZBLE9BQVUsQ0FBQ0gsT0FBRCxFQUFhO0FBQ3pCLFFBQUlBLFlBQVlJLFNBQWhCLEVBQTJCO0FBQ3ZCLGVBQU9KLE9BQVA7QUFDSDs7QUFFRCxRQUFJLE9BQU9BLE9BQVAsS0FBbUIsUUFBdkIsRUFBaUM7QUFDN0IsZUFBT0QsY0FBY0MsT0FBZCxDQUFQO0FBQ0g7O0FBRUQsUUFBSUEsWUFBWUksU0FBWixJQUF5QixPQUFPSixPQUFQLEtBQW1CLFVBQTVDLElBQTBELE9BQU9BLE9BQVAsS0FBbUIsUUFBakYsRUFBMkY7QUFDdkYsZUFBTyxVQUFDSyxJQUFEO0FBQUEsbUJBQVVOLGNBQWNDLFFBQVFLLElBQVIsQ0FBZCxDQUFWO0FBQUEsU0FBUDtBQUNIOztBQUVELFdBQU9MLE9BQVA7QUFDSCxDQWREOztBQWdCQTtBQUNBOztJQUVNTSxTOzs7QUFDRjtBQUNBLHVCQUFZQyxHQUFaLEVBQTRCO0FBQUEsWUFBWEYsSUFBVyx1RUFBSixFQUFJOztBQUFBOztBQUFBLHFIQUNsQkUsR0FEa0IsRUFDYjtBQUNQQyxpQkFBS0gsS0FBS0csR0FESDtBQUVQUCxrQkFBTUUsUUFBUUUsS0FBS0osSUFBYixDQUZDO0FBR1BRLG9CQUFRSixLQUFLSSxNQUhOO0FBSVBDLG1CQUFPTCxLQUFLSyxLQUpMO0FBS1BDLG1CQUFPTixLQUFLTTtBQUxMLFNBRGE7QUFRM0I7Ozs7O1FBRUlMLFMsR0FBQUEsUyIsImZpbGUiOiJpY29ucy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IHsgQ29tcG9uZW50IGFzIENvbXAgfSBmcm9tICdiZWRyb2NrL3NyYy9jb21wb25lbnQvanF1ZXJ5LmpzJztcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEZ1bmN0aW9uc1xuXG4vKipcbiAqIEdldHMgdGVtcGxhdGUgc3RyaW5nXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHJhd1RtcGxcbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cbmNvbnN0IGdldFRtcGxTdHJpbmcgPSAocmF3VG1wbCkgPT4ge1xuICAgIGNvbnN0IHRtcGwgPSByYXdUbXBsO1xuXG4gICAgcmV0dXJuIHRtcGxcbiAgICAucmVwbGFjZSgvIHdpZHRoPVwiKFteXCJdKylcIi9nLCAnJylcbiAgICAucmVwbGFjZSgvIGhlaWdodD1cIihbXlwiXSspXCIvZywgJycpXG4gICAgLnJlcGxhY2UoLyB2aWV3Qm94PVwiKFteXCJdKylcIi9nLCAnJylcbiAgICAucmVwbGFjZSgvIHZpZXdib3g9XCIoW15cIl0rKVwiL2csICcnKTtcbn07XG5cbi8qKlxuICogR2V0cyB0ZW1wbGF0ZSByaWdodFxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSByYXdUbXBsXG4gKiBAcmV0dXJucyB7c3RyaW5nfGZ1bmN0aW9ufVxuICovXG5jb25zdCBnZXRUbXBsID0gKHJhd1RtcGwpID0+IHtcbiAgICBpZiAocmF3VG1wbCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiByYXdUbXBsO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgcmF3VG1wbCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgcmV0dXJuIGdldFRtcGxTdHJpbmcocmF3VG1wbCk7XG4gICAgfVxuXG4gICAgaWYgKHJhd1RtcGwgIT09IHVuZGVmaW5lZCAmJiB0eXBlb2YgcmF3VG1wbCA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgcmF3VG1wbCAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgcmV0dXJuIChkYXRhKSA9PiBnZXRUbXBsU3RyaW5nKHJhd1RtcGwoZGF0YSkpO1xuICAgIH1cblxuICAgIHJldHVybiByYXdUbXBsO1xufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIENsYXNzXG5cbmNsYXNzIENvbXBvbmVudCBleHRlbmRzIENvbXAge1xuICAgIC8vIENvbnN0cnVjdG9yXG4gICAgY29uc3RydWN0b3IoJGVsLCBkYXRhID0ge30pIHtcbiAgICAgICAgc3VwZXIoJGVsLCB7XG4gICAgICAgICAgICBlbHM6IGRhdGEuZWxzLFxuICAgICAgICAgICAgdG1wbDogZ2V0VG1wbChkYXRhLnRtcGwpLFxuICAgICAgICAgICAgcmVuZGVyOiBkYXRhLnJlbmRlcixcbiAgICAgICAgICAgIGNvbXBzOiBkYXRhLmNvbXBzLFxuICAgICAgICAgICAgc3RhdGU6IGRhdGEuc3RhdGVcbiAgICAgICAgfSk7XG4gICAgfVxufVxuZXhwb3J0IHsgQ29tcG9uZW50IH07XG4iXX0=