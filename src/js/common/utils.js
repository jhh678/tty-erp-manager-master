(function () {
  var o = {};
  /**
   * 封装操作localStorage的对象，包含设置（set）、获取（get）、删除（remove）、清空（clear）等方法
   */
  o.localStore = {
    /**
     * 设置localStorage的方法
     * @param {String} key - 键，必传
     * @param {Object | String | Number | Boolean} value - 值，必传
     * @param {Number} time - 过期时间（单位秒），选传，默认值0（不过期）
     */
    set: function (key, value, time) {
      time = time || 0;
      var expiringDate = time === 0 ? 0 : (new Date().getTime() + time * 1000);
      if (typeof value === 'object') {
        value = JSON.stringify(value);
        value = 'obj-' + value;
      } else {
        value = 'str-' + value;
      }
      value = JSON.stringify({
        data: value,
        time: expiringDate
      });
      window.localStorage.setItem(key, value);
    },
    /**
     * 获取localStorage的方法
     * @param {String} key - 键，必传
     * @return {Object | String}
     */
    get: function (key) {
      var ls = window.localStorage.getItem(key);
      if (!ls) {

      } else {
        var store = JSON.parse(ls);
        var value = store.data;
        var time = +store.time;
        if ((time !== 0) && (new Date().getTime() - time > 0)) {
          window.localStorage.removeItem(key);
          return undefined;
        } else {
          if (value.indexOf('obj-') === 0) {
            value = value.slice(4);
            return JSON.parse(value);
          } else if (value.indexOf('str-') === 0) {
            return value.slice(4);
          }
        }
      }
    },
    /**
     * 删除localStorage的方法
     * @param {String} key - 键，必传
     */
    remove: function (key) {
      if (!key) {
        return;
      }
      window.localStorage.removeItem(key);
    },
    /**
     * 清空localStorage的方法
     */
    clear: function () {
      window.localStorage.clear();
    }
  };

  /**
   * 封装操作sessionStorage的对象，包含设置（set）、获取（get）、删除（remove）、清空（clear）等方法
   */
  o.sessionStore = {
    /**
     * 设置sessionStorage的方法
     * @param {String} key - 键，必传
     * @param {Object | String | Number | Boolean} value - 值，必传
     */
    set: function (key, value) {
      if (typeof value === 'object') {
        value = JSON.stringify(value);
        value = 'obj-' + value;
      } else {
        value = 'str-' + value;
      }
      window.sessionStorage.setItem(key, value);
    },
    /**
     * 获取sessionStorage的方法
     * @param {String} key - 键，必传
     * @return {Object | String}
     */
    get: function (key) {
      var value = window.sessionStorage.getItem(key);
      if (!value) {
        return;
      }
      if (value.indexOf('obj-') === 0) {
        value = value.slice(4);
        return JSON.parse(value);
      } else if (value.indexOf('str-') === 0) {
        return value.slice(4);
      }
    },

    /**
     * 删除sessionStorage的方法
     * @param {String} key - 键，必传
     */
    remove: function (key) {
      if (!key) {
        return;
      }
      window.sessionStorage.removeItem(key);
    },

    /**
     * 清空sessionStorage的方法
     */
    clear: function () {
      window.sessionStorage.clear();
    }
  };

  /**
   * 封装操作cookie的对象，包含设置（set）、获取（get）、删除（remove）、清空（clear）等方法
   */
  o.cookieStore = {
    /**
     * 设置cookie的方法
     */
    set: function (name, value, iDay) {
      var oDate = new Date();
      var host = location.host;
      var domain;
      iDay = iDay || 30;
      oDate.setDate(oDate.getDate() + iDay); // 设置Date对象内部时间，iDay表示几天后。
      domain = host.substring(host.indexOf('.'), host.length);
      document.cookie = name + '=' + encodeURIComponent(value) + ';expires=' + oDate.toUTCString() + ';path=/;domain=' + domain;
    },

    /**
     * 获取cookie的方法
     */
    get: function (name) {
      var arr = document.cookie.split('; '); // cookie是以键值对形式存在，用“分号空格” 隔开的，比如 a=1; b=2 ; c=3;
      for (var i = 0, len = arr.length; i < len; i++) {
        var arr2 = arr[i].split('=');
        if (arr2[0] === name) {
          return decodeURIComponent(arr2[1]);
        }
      }
      return ''; // 遍历完都没找到cookie,返回空字符串
    },

    /**
     * 删除某个cookie的方法
     */
    remove: function (name) {
      this.set(name, '', -1); // 设置一个过去的时间即可
    },

    /**
     * 清空cookie的方法
     */
    clear: function () {
      var keys = document.cookie.match(/[^ =;]+(?=\=)/g);
      if (keys) {
        for (var i = keys.length; i--;) {
          document.cookie = keys[i] + '=0;expires=' + new Date(0).toUTCString();
        }
      }
    }
  };

  /**
   * 去除字符串两端空格
   * @param {String} str - 需要处理的字符串
   */
  o.strTrim = function (str) {
    var reg = new RegExp('(^[\\s\\t\\xa0\\u3000]+)|([\\u3000\\xa0\\s\\t]+\x24)', 'g');
    return str.replace(reg, '');
  };

  /**
   * 树状结构数组扁平化
   * @param {Array} Arr  传入的树状结构的数组
   * @param {key} key 需要平扁化的 key
   * @returns Boolean
   */
  o.flattenTree = function (Arr, key) {
    var arr = [];

    function cycle(data) {
      var i = 0;
      var len = data.length;
      for (; i < len; i++) {
        var obj = {};
        for (var k in data[i]) {
          if (k !== key) {
            obj[k] = data[i][k];
          } else {
            if (data[i][k].length > 0) {
              cycle(data[i][k]);
            }
          }
        }
        arr.push(obj);
      }
    }
    cycle(Arr);
    return arr;
  };

  /**
   * 判断Dom元素是否有滚动条
   * @param {node} el - Dom节点
   * @returns {Object} - 返回水平和垂直方向是否有工滚动条
   */
  o.hasScroll = function (el) {
    // test targets
    el = el instanceof jQuery ? el[0] : el.jTool ? el.DOMList[0] : el;
    var elems = el ? [el] : [document.documentElement, document.body];
    var scrollX = false,
      scrollY = false;
    for (var i = 0, len = elems.length; i < len; i++) {
      var o = elems[i];
      // test horizontal
      var sl = o.scrollLeft;
      o.scrollLeft += (sl > 0) ? -1 : 1;
      o.scrollLeft !== sl && (scrollX = scrollX || true);
      o.scrollLeft = sl;
      // test vertical
      var st = o.scrollTop;
      o.scrollTop += (st > 0) ? -1 : 1;
      o.scrollTop !== st && (scrollY = scrollY || true);
      o.scrollTop = st;
    }

    return {
      scrollX: scrollX,
      scrollY: scrollY
    };
  };

  /**
   * 获取元素滚动条可滚动区域宽度或高度
   * @returns {Number} - 返回滚动条宽度
   */
  o.getScrollAreaWidth = function (el) {
    var scrollXWidth = 0,
      scrollYHeith = 0;
    if (typeof el === 'undefined') {
      var scrollWidth = document.documentElement.scrollWidth || document.body.scrollWidth;
      var clientWidth = document.documentElement.clientWidth || document.body.clientWidth;
      var scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
      var clientHeight = document.documentElement.clientHeight || document.body.clientHeight;
      scrollXWidth = scrollWidth - clientWidth;
      scrollYHeith = scrollHeight - clientHeight;
    } else {
      el = el instanceof jQuery ? el[0] : el;
      if (el) {
        scrollXWidth = el.scrollWidth - el.clientWidth;
        scrollYHeith = el.scrollHeight - el.clientHeight;
      }
    }

    return {
      x: scrollXWidth,
      y: scrollYHeith
    };
  };

  /**
   * 获取浏览器滚动条宽度
   * @returns {Number} - 返回滚动条宽度
   */
  o.getScrollBarWidth = function () {
    var oP = document.createElement('p'),
      styles = {
        width: '100px',
        height: '100px',
        overflowY: 'scroll'
      },
      i, scrollBarWidth;
    for (i in styles) {
      oP.style[i] = styles[i];
    }
    document.body.appendChild(oP);
    scrollBarWidth = oP.offsetWidth - oP.clientWidth;
    oP.remove();
    return scrollBarWidth;
  };

  /**
   * 判断窗口是否在iframe中
   * @returns {Boolean} - 返回 true|false
   */
  o.isInIframe = function () {
    return window.frames.length !== parent.frames.length;
  };

  /**
   * 父元素获取当前打开iframe子窗口
   * @returns {Boolean} - 返回 true|false
   */
  o.getActivedIframe = function () {
    var index = $('.sub-page-content>iframe').index($('.sub-page-content>iframe.active'));
    return window.frames[index];
  };

  /**
   * URL参数操作对象
   */
  o.urlUtils = {
    // 获取url参数
    getQueryString: function (name, url) {
      url = url || window.location.search;
      var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
      var r = url.substr(1).match(reg);
      if (r != null) {
        return unescape(r[2]);
      }
      return null;
    },
    // 对象转url参数
    toQueryPair: function (key, value) {
      if (typeof value === 'undefined') {
        return key;
      }
      return key + '=' + encodeURIComponent(value === null ? '' : String(value));
    },
    toQueryString: function (obj, joinStr) {
      joinStr = joinStr || '&';
      var ret = [];
      for (var key in obj) {
        key = encodeURIComponent(key);
        var values = obj[key];
        if (values && values.constructor === Array) {
          // 数组
          var queryValues = [];
          for (var i = 0, len = values.length, value; i < len; i++) {
            value = values[i];
            queryValues.push(this.toQueryPair(key, value));
          }
          ret = ret.concat(queryValues);
        } else {
          // 字符串
          ret.push(this.toQueryPair(key, values));
        }
      }
      return ret.join(joinStr);
    },
    // 添加URL参数
    updateURLParams: function (url, name, value) {
      var r = url || location.href;
      if (r) {
        value = encodeURIComponent(value);
        var reg = new RegExp('(^|)' + name + '=([^&]*)(|$)');
        var tmp = name + '=' + value;
        if (url.match(reg) !== null) {
          r = url.replace(eval(reg), tmp);
        } else {
          if (url.match('[\?]')) {
            r = url + '&' + tmp;
          } else {
            r = url + '?' + tmp;
          }
        }
      }
      return r;
    }
  };

  window.$utils = o;
})(window);
