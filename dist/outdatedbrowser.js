var bedrockCompoutdatedbrowser=function(){"use strict";return function(t){function e(t){l.style.opacity=t/100,l.style.filter="alpha(opacity="+t+")"}function o(t){e(t),1==t&&(l.style.display="block"),100==t&&(d=!0)}function r(){var t=document.getElementById("btnCloseUpdateBrowser"),e=document.getElementById("btnUpdateBrowser");l.style.backgroundColor=s,l.style.color=i,l.children[0].style.color=i,l.children[1].style.color=i,e.style.color=i,e.style.borderColor&&(e.style.borderColor=i),t.style.color=i,t.onmousedown=function(){return l.style.display="none",!1},e.onmouseover=function(){this.style.color=s,this.style.backgroundColor=i},e.onmouseout=function(){this.style.color=i,this.style.backgroundColor=s}}function n(){var t=!1;if(window.XMLHttpRequest)t=new XMLHttpRequest;else if(window.ActiveXObject)try{t=new ActiveXObject("Msxml2.XMLHTTP")}catch(e){try{t=new ActiveXObject("Microsoft.XMLHTTP")}catch(e){t=!1}}return t}function a(t){var e=document.getElementById("outdated");return 4==t.readyState&&(200==t.status||304==t.status?e.innerHTML=t.responseText:e.innerHTML=f,r()),!1}var l=document.getElementById("outdated");this.defaultOpts={bgColor:"#f25648",color:"#ffffff",lowerThan:"transform",languagePath:"../outdatedbrowser/lang/en.html"},t&&("IE8"==t.lowerThan||"borderSpacing"==t.lowerThan?t.lowerThan="borderSpacing":"IE9"==t.lowerThan||"boxShadow"==t.lowerThan?t.lowerThan="boxShadow":"IE10"==t.lowerThan||"transform"==t.lowerThan||""==t.lowerThan||void 0===t.lowerThan?t.lowerThan="transform":"IE11"!=t.lowerThan&&"borderImage"!=t.lowerThan||(t.lowerThan="borderImage"),this.defaultOpts.bgColor=t.bgColor,this.defaultOpts.color=t.color,this.defaultOpts.lowerThan=t.lowerThan,this.defaultOpts.languagePath=t.languagePath);var s=this.defaultOpts.bgColor,i=this.defaultOpts.color,u=this.defaultOpts.lowerThan,c=this.defaultOpts.languagePath,d=!0;if(!function(){var t=document.createElement("div"),e="Khtml Ms O Moz Webkit".split(" "),o=e.length;return function(r){if(r in t.style)return!0;for(r=r.replace(/^[a-z]/,function(t){return t.toUpperCase()});o--;)if(e[o]+r in t.style)return!0;return!1}}()(""+u)){if(d&&"1"!==l.style.opacity){d=!1;for(var h=1;h<=100;h++)setTimeout(function(t){return function(){o(t)}}(h),8*h)}" "===c||0==c.length?r():function(t){var e=n();e&&(e.onreadystatechange=function(){a(e)},e.open("GET",t,!0),e.send(null))}(c);var f='<h6>Your browser is out-of-date!</h6><p>Update your browser to view this website correctly. <a id="btnUpdateBrowser" href="http://outdatedbrowser.com/">Update my browser now </a></p><p class="last"><a href="#" id="btnCloseUpdateBrowser" title="Close">&times;</a></p>'}}.bind({})}();