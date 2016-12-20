'use strict';

/*--------------------------------------------------------------------
JAVASCRIPT "Outdated Browser"
Version:    1.1.0 - 2014
author:     Burocratik
website:    http://www.burocratik.com
* @preserve
-----------------------------------------------------------------------*/
var outdatedBrowser = function outdatedBrowser(options) {

    //Variable definition (before ajax)
    var outdated = document.getElementById("outdated");

    // Default settings
    this.defaultOpts = {
        bgColor: '#f25648',
        color: '#ffffff',
        lowerThan: 'transform',
        languagePath: '../outdatedbrowser/lang/en.html'
    };

    if (options) {
        //assign css3 property to IE browser version
        if (options.lowerThan == 'IE8' || options.lowerThan == 'borderSpacing') {
            options.lowerThan = 'borderSpacing';
        } else if (options.lowerThan == 'IE9' || options.lowerThan == 'boxShadow') {
            options.lowerThan = 'boxShadow';
        } else if (options.lowerThan == 'IE10' || options.lowerThan == 'transform' || options.lowerThan == '' || typeof options.lowerThan === "undefined") {
            options.lowerThan = 'transform';
        } else if (options.lowerThan == 'IE11' || options.lowerThan == 'borderImage') {
            options.lowerThan = 'borderImage';
        }
        //all properties
        this.defaultOpts.bgColor = options.bgColor;
        this.defaultOpts.color = options.color;
        this.defaultOpts.lowerThan = options.lowerThan;
        this.defaultOpts.languagePath = options.languagePath;
    }

    var bkgColor = this.defaultOpts.bgColor;
    var txtColor = this.defaultOpts.color;
    var cssProp = this.defaultOpts.lowerThan;
    var languagePath = this.defaultOpts.languagePath;

    //Define opacity and fadeIn/fadeOut functions
    var done = true;

    function function_opacity(opacity_value) {
        outdated.style.opacity = opacity_value / 100;
        outdated.style.filter = 'alpha(opacity=' + opacity_value + ')';
    }

    // function function_fade_out(opacity_value) {
    //     function_opacity(opacity_value);
    //     if (opacity_value == 1) {
    //         outdated.style.display = 'none';
    //         done = true;
    //     }
    // }

    function function_fade_in(opacity_value) {
        function_opacity(opacity_value);
        if (opacity_value == 1) {
            outdated.style.display = 'block';
        }
        if (opacity_value == 100) {
            done = true;
        }
    }

    //check if element has a particular class
    // function hasClass(element, cls) {
    //     return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
    // }

    var supports = function () {
        var div = document.createElement('div'),
            vendors = 'Khtml Ms O Moz Webkit'.split(' '),
            len = vendors.length;

        return function (prop) {
            if (prop in div.style) return true;

            prop = prop.replace(/^[a-z]/, function (val) {
                return val.toUpperCase();
            });

            while (len--) {
                if (vendors[len] + prop in div.style) {
                    return true;
                }
            }
            return false;
        };
    }();

    //if browser does not supports css3 property (transform=default), if does > exit all this
    if (!supports('' + cssProp + '')) {
        if (done && outdated.style.opacity !== '1') {
            done = false;
            for (var i = 1; i <= 100; i++) {
                setTimeout(function (x) {
                    return function () {
                        function_fade_in(x);
                    };
                }(i), i * 8);
            }
        }
    } else {
        return;
    }; //end if

    //Check AJAX Options: if languagePath == '' > use no Ajax way, html is needed inside <div id="outdated">
    if (languagePath === ' ' || languagePath.length == 0) {
        startStylesAndEvents();
    } else {
        grabFile(languagePath);
    }

    //events and colors
    function startStylesAndEvents() {
        var btnClose = document.getElementById("btnCloseUpdateBrowser");
        var btnUpdate = document.getElementById("btnUpdateBrowser");

        //check settings attributes
        outdated.style.backgroundColor = bkgColor;
        //way too hard to put !important on IE6
        outdated.style.color = txtColor;
        outdated.children[0].style.color = txtColor;
        outdated.children[1].style.color = txtColor;

        //check settings attributes
        btnUpdate.style.color = txtColor;
        // btnUpdate.style.borderColor = txtColor;
        if (btnUpdate.style.borderColor) btnUpdate.style.borderColor = txtColor;
        btnClose.style.color = txtColor;

        //close button
        btnClose.onmousedown = function () {
            outdated.style.display = 'none';
            return false;
        };

        //Override the update button color to match the background color
        btnUpdate.onmouseover = function () {
            this.style.color = bkgColor;
            this.style.backgroundColor = txtColor;
        };
        btnUpdate.onmouseout = function () {
            this.style.color = txtColor;
            this.style.backgroundColor = bkgColor;
        };
    } //end styles and events


    // IF AJAX with request ERROR > insert english default
    var ajaxEnglishDefault = '<h6>Your browser is out-of-date!</h6>' + '<p>Update your browser to view this website correctly. <a id="btnUpdateBrowser" href="http://outdatedbrowser.com/">Update my browser now </a></p>' + '<p class="last"><a href="#" id="btnCloseUpdateBrowser" title="Close">&times;</a></p>';

    //** AJAX FUNCTIONS - Bulletproof Ajax by Jeremy Keith **
    function getHTTPObject() {
        var xhr = false;
        if (window.XMLHttpRequest) {
            xhr = new XMLHttpRequest();
        } else if (window.ActiveXObject) {
            try {
                xhr = new ActiveXObject("Msxml2.XMLHTTP");
            } catch (e) {
                try {
                    xhr = new ActiveXObject("Microsoft.XMLHTTP");
                } catch (e) {
                    xhr = false;
                }
            }
        }
        return xhr;
    }; //end function

    function grabFile(file) {
        var request = getHTTPObject();
        if (request) {
            request.onreadystatechange = function () {
                displayResponse(request);
            };
            request.open("GET", file, true);
            request.send(null);
        }
        return false;
    }; //end grabFile

    function displayResponse(request) {
        var insertContentHere = document.getElementById("outdated");
        if (request.readyState == 4) {
            if (request.status == 200 || request.status == 304) {
                insertContentHere.innerHTML = request.responseText;
            } else {
                insertContentHere.innerHTML = ajaxEnglishDefault;
            }
            startStylesAndEvents();
        }
        return false;
    }; //end displayResponse

    ////////END of outdatedBrowser function
};

// Return the function
module.exports = outdatedBrowser.bind({});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9vdXRkYXRlZGJyb3dzZXIuanMiXSwibmFtZXMiOlsib3V0ZGF0ZWRCcm93c2VyIiwib3B0aW9ucyIsIm91dGRhdGVkIiwiZG9jdW1lbnQiLCJnZXRFbGVtZW50QnlJZCIsImRlZmF1bHRPcHRzIiwiYmdDb2xvciIsImNvbG9yIiwibG93ZXJUaGFuIiwibGFuZ3VhZ2VQYXRoIiwiYmtnQ29sb3IiLCJ0eHRDb2xvciIsImNzc1Byb3AiLCJkb25lIiwiZnVuY3Rpb25fb3BhY2l0eSIsIm9wYWNpdHlfdmFsdWUiLCJzdHlsZSIsIm9wYWNpdHkiLCJmaWx0ZXIiLCJmdW5jdGlvbl9mYWRlX2luIiwiZGlzcGxheSIsInN1cHBvcnRzIiwiZGl2IiwiY3JlYXRlRWxlbWVudCIsInZlbmRvcnMiLCJzcGxpdCIsImxlbiIsImxlbmd0aCIsInByb3AiLCJyZXBsYWNlIiwidmFsIiwidG9VcHBlckNhc2UiLCJpIiwic2V0VGltZW91dCIsIngiLCJzdGFydFN0eWxlc0FuZEV2ZW50cyIsImdyYWJGaWxlIiwiYnRuQ2xvc2UiLCJidG5VcGRhdGUiLCJiYWNrZ3JvdW5kQ29sb3IiLCJjaGlsZHJlbiIsImJvcmRlckNvbG9yIiwib25tb3VzZWRvd24iLCJvbm1vdXNlb3ZlciIsIm9ubW91c2VvdXQiLCJhamF4RW5nbGlzaERlZmF1bHQiLCJnZXRIVFRQT2JqZWN0IiwieGhyIiwid2luZG93IiwiWE1MSHR0cFJlcXVlc3QiLCJBY3RpdmVYT2JqZWN0IiwiZSIsImZpbGUiLCJyZXF1ZXN0Iiwib25yZWFkeXN0YXRlY2hhbmdlIiwiZGlzcGxheVJlc3BvbnNlIiwib3BlbiIsInNlbmQiLCJpbnNlcnRDb250ZW50SGVyZSIsInJlYWR5U3RhdGUiLCJzdGF0dXMiLCJpbm5lckhUTUwiLCJyZXNwb25zZVRleHQiLCJtb2R1bGUiLCJleHBvcnRzIiwiYmluZCJdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQU9BLElBQUlBLGtCQUFrQixTQUFsQkEsZUFB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Q0FBakIiLCJmaWxlIjoib3V0ZGF0ZWRicm93c2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuSkFWQVNDUklQVCBcIk91dGRhdGVkIEJyb3dzZXJcIlxuVmVyc2lvbjogICAgMS4xLjAgLSAyMDE0XG5hdXRob3I6ICAgICBCdXJvY3JhdGlrXG53ZWJzaXRlOiAgICBodHRwOi8vd3d3LmJ1cm9jcmF0aWsuY29tXG4qIEBwcmVzZXJ2ZVxuLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xudmFyIG91dGRhdGVkQnJvd3NlciA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcblxuICAgIC8vVmFyaWFibGUgZGVmaW5pdGlvbiAoYmVmb3JlIGFqYXgpXG4gICAgdmFyIG91dGRhdGVkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJvdXRkYXRlZFwiKTtcblxuICAgIC8vIERlZmF1bHQgc2V0dGluZ3NcbiAgICB0aGlzLmRlZmF1bHRPcHRzID0ge1xuICAgICAgICBiZ0NvbG9yOiAnI2YyNTY0OCcsXG4gICAgICAgIGNvbG9yOiAnI2ZmZmZmZicsXG4gICAgICAgIGxvd2VyVGhhbjogJ3RyYW5zZm9ybScsXG4gICAgICAgIGxhbmd1YWdlUGF0aDogJy4uL291dGRhdGVkYnJvd3Nlci9sYW5nL2VuLmh0bWwnXG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbnMpIHtcbiAgICAgICAgLy9hc3NpZ24gY3NzMyBwcm9wZXJ0eSB0byBJRSBicm93c2VyIHZlcnNpb25cbiAgICAgICAgaWYob3B0aW9ucy5sb3dlclRoYW4gPT0gJ0lFOCcgfHwgb3B0aW9ucy5sb3dlclRoYW4gPT0gJ2JvcmRlclNwYWNpbmcnKSB7XG4gICAgICAgICAgICBvcHRpb25zLmxvd2VyVGhhbiA9ICdib3JkZXJTcGFjaW5nJztcbiAgICAgICAgfSBlbHNlIGlmIChvcHRpb25zLmxvd2VyVGhhbiA9PSAnSUU5JyB8fCBvcHRpb25zLmxvd2VyVGhhbiA9PSAnYm94U2hhZG93Jykge1xuICAgICAgICAgICAgb3B0aW9ucy5sb3dlclRoYW4gPSAnYm94U2hhZG93JztcbiAgICAgICAgfSBlbHNlIGlmIChvcHRpb25zLmxvd2VyVGhhbiA9PSAnSUUxMCcgfHwgb3B0aW9ucy5sb3dlclRoYW4gPT0gJ3RyYW5zZm9ybScgfHwgb3B0aW9ucy5sb3dlclRoYW4gPT0gJycgfHwgdHlwZW9mIG9wdGlvbnMubG93ZXJUaGFuID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICBvcHRpb25zLmxvd2VyVGhhbiA9ICd0cmFuc2Zvcm0nO1xuICAgICAgICB9IGVsc2UgaWYgKG9wdGlvbnMubG93ZXJUaGFuID09ICdJRTExJyB8fCBvcHRpb25zLmxvd2VyVGhhbiA9PSAnYm9yZGVySW1hZ2UnKSB7XG4gICAgICAgICAgICBvcHRpb25zLmxvd2VyVGhhbiA9ICdib3JkZXJJbWFnZSc7XG4gICAgICAgIH1cbiAgICAgICAgLy9hbGwgcHJvcGVydGllc1xuICAgICAgICB0aGlzLmRlZmF1bHRPcHRzLmJnQ29sb3IgPSBvcHRpb25zLmJnQ29sb3I7XG4gICAgICAgIHRoaXMuZGVmYXVsdE9wdHMuY29sb3IgPSBvcHRpb25zLmNvbG9yO1xuICAgICAgICB0aGlzLmRlZmF1bHRPcHRzLmxvd2VyVGhhbiA9IG9wdGlvbnMubG93ZXJUaGFuO1xuICAgICAgICB0aGlzLmRlZmF1bHRPcHRzLmxhbmd1YWdlUGF0aCA9IG9wdGlvbnMubGFuZ3VhZ2VQYXRoO1xuICAgIH1cblxuICAgIHZhciBia2dDb2xvciA9IHRoaXMuZGVmYXVsdE9wdHMuYmdDb2xvcjtcbiAgICB2YXIgdHh0Q29sb3IgPSB0aGlzLmRlZmF1bHRPcHRzLmNvbG9yO1xuICAgIHZhciBjc3NQcm9wID0gdGhpcy5kZWZhdWx0T3B0cy5sb3dlclRoYW47XG4gICAgdmFyIGxhbmd1YWdlUGF0aCA9IHRoaXMuZGVmYXVsdE9wdHMubGFuZ3VhZ2VQYXRoO1xuXG4gICAgLy9EZWZpbmUgb3BhY2l0eSBhbmQgZmFkZUluL2ZhZGVPdXQgZnVuY3Rpb25zXG4gICAgdmFyIGRvbmUgPSB0cnVlO1xuXG4gICAgZnVuY3Rpb24gZnVuY3Rpb25fb3BhY2l0eShvcGFjaXR5X3ZhbHVlKSB7XG4gICAgICAgIG91dGRhdGVkLnN0eWxlLm9wYWNpdHkgPSBvcGFjaXR5X3ZhbHVlIC8gMTAwO1xuICAgICAgICBvdXRkYXRlZC5zdHlsZS5maWx0ZXIgPSAnYWxwaGEob3BhY2l0eT0nICsgb3BhY2l0eV92YWx1ZSArICcpJztcbiAgICB9XG5cbiAgICAvLyBmdW5jdGlvbiBmdW5jdGlvbl9mYWRlX291dChvcGFjaXR5X3ZhbHVlKSB7XG4gICAgLy8gICAgIGZ1bmN0aW9uX29wYWNpdHkob3BhY2l0eV92YWx1ZSk7XG4gICAgLy8gICAgIGlmIChvcGFjaXR5X3ZhbHVlID09IDEpIHtcbiAgICAvLyAgICAgICAgIG91dGRhdGVkLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgLy8gICAgICAgICBkb25lID0gdHJ1ZTtcbiAgICAvLyAgICAgfVxuICAgIC8vIH1cblxuICAgIGZ1bmN0aW9uIGZ1bmN0aW9uX2ZhZGVfaW4ob3BhY2l0eV92YWx1ZSkge1xuICAgICAgICBmdW5jdGlvbl9vcGFjaXR5KG9wYWNpdHlfdmFsdWUpO1xuICAgICAgICBpZiAob3BhY2l0eV92YWx1ZSA9PSAxKSB7XG4gICAgICAgICAgICBvdXRkYXRlZC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICAgICAgfVxuICAgICAgICBpZiAob3BhY2l0eV92YWx1ZSA9PSAxMDApIHtcbiAgICAgICAgICAgIGRvbmUgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy9jaGVjayBpZiBlbGVtZW50IGhhcyBhIHBhcnRpY3VsYXIgY2xhc3NcbiAgICAvLyBmdW5jdGlvbiBoYXNDbGFzcyhlbGVtZW50LCBjbHMpIHtcbiAgICAvLyAgICAgcmV0dXJuICgnICcgKyBlbGVtZW50LmNsYXNzTmFtZSArICcgJykuaW5kZXhPZignICcgKyBjbHMgKyAnICcpID4gLTE7XG4gICAgLy8gfVxuXG4gICAgdmFyIHN1cHBvcnRzID0gKGZ1bmN0aW9uKCkge1xuICAgICAgIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKSxcbiAgICAgICAgICB2ZW5kb3JzID0gJ0todG1sIE1zIE8gTW96IFdlYmtpdCcuc3BsaXQoJyAnKSxcbiAgICAgICAgICBsZW4gPSB2ZW5kb3JzLmxlbmd0aDtcblxuICAgICAgIHJldHVybiBmdW5jdGlvbihwcm9wKSB7XG4gICAgICAgICAgaWYgKCBwcm9wIGluIGRpdi5zdHlsZSApIHJldHVybiB0cnVlO1xuXG4gICAgICAgICAgcHJvcCA9IHByb3AucmVwbGFjZSgvXlthLXpdLywgZnVuY3Rpb24odmFsKSB7XG4gICAgICAgICAgICAgcmV0dXJuIHZhbC50b1VwcGVyQ2FzZSgpO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgd2hpbGUobGVuLS0pIHtcbiAgICAgICAgICAgICBpZiAoIHZlbmRvcnNbbGVuXSArIHByb3AgaW4gZGl2LnN0eWxlICkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgIH07XG4gICAgfSkoKTtcblxuICAgIC8vaWYgYnJvd3NlciBkb2VzIG5vdCBzdXBwb3J0cyBjc3MzIHByb3BlcnR5ICh0cmFuc2Zvcm09ZGVmYXVsdCksIGlmIGRvZXMgPiBleGl0IGFsbCB0aGlzXG4gICAgaWYgKCAhc3VwcG9ydHMoJycrIGNzc1Byb3AgKycnKSApIHtcbiAgICAgICAgaWYgKGRvbmUgJiYgb3V0ZGF0ZWQuc3R5bGUub3BhY2l0eSAhPT0gJzEnKSB7XG4gICAgICAgICAgICBkb25lID0gZmFsc2U7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8PSAxMDA7IGkrKykge1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKGZ1bmN0aW9uICh4KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbl9mYWRlX2luKHgpO1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0pKGkpLCBpICogOCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9ZWxzZXtcbiAgICAgICAgcmV0dXJuO1xuICAgIH07Ly9lbmQgaWZcblxuICAgIC8vQ2hlY2sgQUpBWCBPcHRpb25zOiBpZiBsYW5ndWFnZVBhdGggPT0gJycgPiB1c2Ugbm8gQWpheCB3YXksIGh0bWwgaXMgbmVlZGVkIGluc2lkZSA8ZGl2IGlkPVwib3V0ZGF0ZWRcIj5cbiAgICBpZiggbGFuZ3VhZ2VQYXRoID09PSAnICcgfHwgbGFuZ3VhZ2VQYXRoLmxlbmd0aCA9PSAwICl7XG4gICAgICAgIHN0YXJ0U3R5bGVzQW5kRXZlbnRzKCk7XG4gICAgfWVsc2V7XG4gICAgICAgIGdyYWJGaWxlKGxhbmd1YWdlUGF0aCk7XG4gICAgfVxuXG4gICAgLy9ldmVudHMgYW5kIGNvbG9yc1xuICAgIGZ1bmN0aW9uIHN0YXJ0U3R5bGVzQW5kRXZlbnRzKCl7XG4gICAgICAgIHZhciBidG5DbG9zZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYnRuQ2xvc2VVcGRhdGVCcm93c2VyXCIpO1xuICAgICAgICB2YXIgYnRuVXBkYXRlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJidG5VcGRhdGVCcm93c2VyXCIpO1xuXG4gICAgICAgIC8vY2hlY2sgc2V0dGluZ3MgYXR0cmlidXRlc1xuICAgICAgICBvdXRkYXRlZC5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBia2dDb2xvcjtcbiAgICAgICAgLy93YXkgdG9vIGhhcmQgdG8gcHV0ICFpbXBvcnRhbnQgb24gSUU2XG4gICAgICAgIG91dGRhdGVkLnN0eWxlLmNvbG9yID0gdHh0Q29sb3I7XG4gICAgICAgIG91dGRhdGVkLmNoaWxkcmVuWzBdLnN0eWxlLmNvbG9yID0gdHh0Q29sb3I7XG4gICAgICAgIG91dGRhdGVkLmNoaWxkcmVuWzFdLnN0eWxlLmNvbG9yID0gdHh0Q29sb3I7XG5cbiAgICAgICAgLy9jaGVjayBzZXR0aW5ncyBhdHRyaWJ1dGVzXG4gICAgICAgIGJ0blVwZGF0ZS5zdHlsZS5jb2xvciA9IHR4dENvbG9yO1xuICAgICAgICAvLyBidG5VcGRhdGUuc3R5bGUuYm9yZGVyQ29sb3IgPSB0eHRDb2xvcjtcbiAgICAgICAgaWYgKGJ0blVwZGF0ZS5zdHlsZS5ib3JkZXJDb2xvcikgYnRuVXBkYXRlLnN0eWxlLmJvcmRlckNvbG9yID0gdHh0Q29sb3I7XG4gICAgICAgIGJ0bkNsb3NlLnN0eWxlLmNvbG9yID0gdHh0Q29sb3I7XG5cbiAgICAgICAgLy9jbG9zZSBidXR0b25cbiAgICAgICAgYnRuQ2xvc2Uub25tb3VzZWRvd24gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIG91dGRhdGVkLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy9PdmVycmlkZSB0aGUgdXBkYXRlIGJ1dHRvbiBjb2xvciB0byBtYXRjaCB0aGUgYmFja2dyb3VuZCBjb2xvclxuICAgICAgICBidG5VcGRhdGUub25tb3VzZW92ZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuc3R5bGUuY29sb3IgPSBia2dDb2xvcjtcbiAgICAgICAgICAgIHRoaXMuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gdHh0Q29sb3I7XG4gICAgICAgIH07XG4gICAgICAgIGJ0blVwZGF0ZS5vbm1vdXNlb3V0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLnN0eWxlLmNvbG9yID0gdHh0Q29sb3I7XG4gICAgICAgICAgICB0aGlzLnN0eWxlLmJhY2tncm91bmRDb2xvciA9IGJrZ0NvbG9yO1xuICAgICAgICB9O1xuICAgIH0vL2VuZCBzdHlsZXMgYW5kIGV2ZW50c1xuXG5cbiAgICAvLyBJRiBBSkFYIHdpdGggcmVxdWVzdCBFUlJPUiA+IGluc2VydCBlbmdsaXNoIGRlZmF1bHRcbiAgICB2YXIgYWpheEVuZ2xpc2hEZWZhdWx0ID0gJzxoNj5Zb3VyIGJyb3dzZXIgaXMgb3V0LW9mLWRhdGUhPC9oNj4nXG4gICAgICAgICsgJzxwPlVwZGF0ZSB5b3VyIGJyb3dzZXIgdG8gdmlldyB0aGlzIHdlYnNpdGUgY29ycmVjdGx5LiA8YSBpZD1cImJ0blVwZGF0ZUJyb3dzZXJcIiBocmVmPVwiaHR0cDovL291dGRhdGVkYnJvd3Nlci5jb20vXCI+VXBkYXRlIG15IGJyb3dzZXIgbm93IDwvYT48L3A+J1xuICAgICAgICArICc8cCBjbGFzcz1cImxhc3RcIj48YSBocmVmPVwiI1wiIGlkPVwiYnRuQ2xvc2VVcGRhdGVCcm93c2VyXCIgdGl0bGU9XCJDbG9zZVwiPiZ0aW1lczs8L2E+PC9wPic7XG5cblxuICAgIC8vKiogQUpBWCBGVU5DVElPTlMgLSBCdWxsZXRwcm9vZiBBamF4IGJ5IEplcmVteSBLZWl0aCAqKlxuICAgIGZ1bmN0aW9uIGdldEhUVFBPYmplY3QoKSB7XG4gICAgICB2YXIgeGhyID0gZmFsc2U7XG4gICAgICBpZiAod2luZG93LlhNTEh0dHBSZXF1ZXN0KSB7XG4gICAgICAgIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgICAgfSBlbHNlIGlmICh3aW5kb3cuQWN0aXZlWE9iamVjdCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHhociA9IG5ldyBBY3RpdmVYT2JqZWN0KFwiTXN4bWwyLlhNTEhUVFBcIik7XG4gICAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICB4aHIgPSBuZXcgQWN0aXZlWE9iamVjdChcIk1pY3Jvc29mdC5YTUxIVFRQXCIpO1xuICAgICAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICAgICAgeGhyID0gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4geGhyO1xuICAgIH07Ly9lbmQgZnVuY3Rpb25cblxuICAgIGZ1bmN0aW9uIGdyYWJGaWxlKGZpbGUpIHtcbiAgICAgICAgdmFyIHJlcXVlc3QgPSBnZXRIVFRQT2JqZWN0KCk7XG4gICAgICAgICAgICBpZiAocmVxdWVzdCkge1xuICAgICAgICAgICAgICAgIHJlcXVlc3Qub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgZGlzcGxheVJlc3BvbnNlKHJlcXVlc3QpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICByZXF1ZXN0Lm9wZW4oXCJHRVRcIiwgZmlsZSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgcmVxdWVzdC5zZW5kKG51bGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfTsvL2VuZCBncmFiRmlsZVxuXG4gICAgZnVuY3Rpb24gZGlzcGxheVJlc3BvbnNlKHJlcXVlc3QpIHtcbiAgICAgICAgdmFyIGluc2VydENvbnRlbnRIZXJlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJvdXRkYXRlZFwiKTtcbiAgICAgICAgaWYgKHJlcXVlc3QucmVhZHlTdGF0ZSA9PSA0KSB7XG4gICAgICAgICAgICBpZiAocmVxdWVzdC5zdGF0dXMgPT0gMjAwIHx8IHJlcXVlc3Quc3RhdHVzID09IDMwNCkge1xuICAgICAgICAgICAgICAgIGluc2VydENvbnRlbnRIZXJlLmlubmVySFRNTCA9IHJlcXVlc3QucmVzcG9uc2VUZXh0O1xuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgaW5zZXJ0Q29udGVudEhlcmUuaW5uZXJIVE1MID0gYWpheEVuZ2xpc2hEZWZhdWx0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3RhcnRTdHlsZXNBbmRFdmVudHMoKTtcbiAgICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH07Ly9lbmQgZGlzcGxheVJlc3BvbnNlXG5cbi8vLy8vLy8vRU5EIG9mIG91dGRhdGVkQnJvd3NlciBmdW5jdGlvblxufTtcblxuLy8gUmV0dXJuIHRoZSBmdW5jdGlvblxubW9kdWxlLmV4cG9ydHMgPSBvdXRkYXRlZEJyb3dzZXIuYmluZCh7fSk7XG4iXX0=