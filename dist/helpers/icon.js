/* eslint-disable strict */'use strict'; /* eslint-enable strict */

// --------------------------------
// Export

/**
 * Helper for icon
 *
 * @param {any} name
 * @param {any} classes
 * @param {any} size
 * @returns
 */

module.exports = function (name, classes, size) {
    var tmpl = '';

    classes = !!classes ? ' ' + classes : '';
    size = size || 200;

    if (!name) {
        throw new Error('Name is needed to use the icon helper');
    }

    tmpl += '<span class="icon-wrapper icon-wrapper-' + name + classes + '">';
    tmpl += '<svg viewBox="0 0 ' + size + ' ' + size + '" class="icon icon-' + name + '">';
    tmpl += '<use xlink:href="#' + name + '"></use>';
    tmpl += '</svg></span>';

    return tmpl;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9oZWxwZXJzL2ljb24uanMiXSwibmFtZXMiOlsibW9kdWxlIiwiZXhwb3J0cyIsIm5hbWUiLCJjbGFzc2VzIiwic2l6ZSIsInRtcGwiLCJFcnJvciJdLCJtYXBwaW5ncyI6IkFBQUEsMkJBQTJCLGEsQ0FBYTs7QUFFeEM7QUFDQTs7QUFFQTs7Ozs7Ozs7O0FBUUFBLE9BQU9DLE9BQVAsR0FBaUIsVUFBVUMsSUFBVixFQUFnQkMsT0FBaEIsRUFBeUJDLElBQXpCLEVBQStCO0FBQzVDLFFBQUlDLE9BQU8sRUFBWDs7QUFFQUYsY0FBVyxDQUFDLENBQUNBLE9BQUgsR0FBYyxNQUFNQSxPQUFwQixHQUE4QixFQUF4QztBQUNBQyxXQUFPQSxRQUFRLEdBQWY7O0FBRUEsUUFBSSxDQUFDRixJQUFMLEVBQVc7QUFDUCxjQUFNLElBQUlJLEtBQUosQ0FBVSx1Q0FBVixDQUFOO0FBQ0g7O0FBRURELFlBQVEsNENBQTRDSCxJQUE1QyxHQUFtREMsT0FBbkQsR0FBNkQsSUFBckU7QUFDQUUsWUFBUSx1QkFBdUJELElBQXZCLEdBQThCLEdBQTlCLEdBQW9DQSxJQUFwQyxHQUEyQyxxQkFBM0MsR0FBbUVGLElBQW5FLEdBQTBFLElBQWxGO0FBQ0FHLFlBQVEsdUJBQXVCSCxJQUF2QixHQUE4QixVQUF0QztBQUNBRyxZQUFRLGVBQVI7O0FBRUEsV0FBT0EsSUFBUDtBQUNILENBaEJEIiwiZmlsZSI6Imljb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBlc2xpbnQtZGlzYWJsZSBzdHJpY3QgKi8ndXNlIHN0cmljdCc7LyogZXNsaW50LWVuYWJsZSBzdHJpY3QgKi9cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEV4cG9ydFxuXG4vKipcbiAqIEhlbHBlciBmb3IgaWNvblxuICpcbiAqIEBwYXJhbSB7YW55fSBuYW1lXG4gKiBAcGFyYW0ge2FueX0gY2xhc3Nlc1xuICogQHBhcmFtIHthbnl9IHNpemVcbiAqIEByZXR1cm5zXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG5hbWUsIGNsYXNzZXMsIHNpemUpIHtcbiAgICB2YXIgdG1wbCA9ICcnO1xuXG4gICAgY2xhc3NlcyA9ICghIWNsYXNzZXMpID8gJyAnICsgY2xhc3NlcyA6ICcnO1xuICAgIHNpemUgPSBzaXplIHx8IDIwMDtcblxuICAgIGlmICghbmFtZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05hbWUgaXMgbmVlZGVkIHRvIHVzZSB0aGUgaWNvbiBoZWxwZXInKTtcbiAgICB9XG5cbiAgICB0bXBsICs9ICc8c3BhbiBjbGFzcz1cImljb24td3JhcHBlciBpY29uLXdyYXBwZXItJyArIG5hbWUgKyBjbGFzc2VzICsgJ1wiPic7XG4gICAgdG1wbCArPSAnPHN2ZyB2aWV3Qm94PVwiMCAwICcgKyBzaXplICsgJyAnICsgc2l6ZSArICdcIiBjbGFzcz1cImljb24gaWNvbi0nICsgbmFtZSArICdcIj4nO1xuICAgIHRtcGwgKz0gJzx1c2UgeGxpbms6aHJlZj1cIiMnICsgbmFtZSArICdcIj48L3VzZT4nO1xuICAgIHRtcGwgKz0gJzwvc3ZnPjwvc3Bhbj4nO1xuXG4gICAgcmV0dXJuIHRtcGw7XG59O1xuIl19