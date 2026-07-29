((window._iconfont_svg_string_ =
  '<svg><symbol id="icon-bianji3" viewBox="0 0 1024 1024"><path d="M938.666667 832a42.666667 42.666667 0 0 1 4.992 85.034667L938.666667 917.333333H85.333333a42.666667 42.666667 0 0 1-4.992-85.034666L85.333333 832h853.333334zM625.877333 55.168L147.584 534.058667a42.666667 42.666667 0 0 0-12.458667 30.122666v168.277334a42.666667 42.666667 0 0 0 42.666667 42.666666H346.88a42.666667 42.666667 0 0 0 30.165333-12.501333L855.082667 284.416a42.666667 42.666667 0 0 0 0-60.330667l-168.832-168.917333a42.666667 42.666667 0 0 0-60.373334 0z m30.208 90.496l108.458667 108.544L329.173333 689.749333H220.416v-107.904L656.085333 145.664z" fill="#000000" ></path></symbol></svg>'),
  (function (n) {
    var t = (t = document.getElementsByTagName("script"))[t.length - 1],
      e = t.getAttribute("data-injectcss"),
      t = t.getAttribute("data-disable-injectsvg");
    if (!t) {
      var i,
        o,
        a,
        d,
        c,
        s = function (t, e) {
          e.parentNode.insertBefore(t, e);
        };
      if (e && !n.__iconfont__svg__cssinject__) {
        n.__iconfont__svg__cssinject__ = !0;
        try {
          document.write(
            "<style>.svgfont {display: inline-block;width: 1em;height: 1em;fill: currentColor;vertical-align: -0.1em;font-size:16px;}</style>",
          );
        } catch (t) {
          console && console.log(t);
        }
      }
      ((i = function () {
        var t,
          e = document.createElement("div");
        ((e.innerHTML = n._iconfont_svg_string_),
          (e = e.getElementsByTagName("svg")[0]) &&
            (e.setAttribute("aria-hidden", "true"),
            (e.style.position = "absolute"),
            (e.style.width = 0),
            (e.style.height = 0),
            (e.style.overflow = "hidden"),
            (e = e),
            (t = document.body).firstChild
              ? s(e, t.firstChild)
              : t.appendChild(e)));
      }),
        document.addEventListener
          ? ~["complete", "loaded", "interactive"].indexOf(document.readyState)
            ? setTimeout(i, 0)
            : ((o = function () {
                (document.removeEventListener("DOMContentLoaded", o, !1), i());
              }),
              document.addEventListener("DOMContentLoaded", o, !1))
          : document.attachEvent &&
            ((a = i),
            (d = n.document),
            (c = !1),
            r(),
            (d.onreadystatechange = function () {
              "complete" == d.readyState &&
                ((d.onreadystatechange = null), l());
            })));
    }
    function l() {
      c || ((c = !0), a());
    }
    function r() {
      try {
        d.documentElement.doScroll("left");
      } catch (t) {
        return void setTimeout(r, 50);
      }
      l();
    }
  })(window));
