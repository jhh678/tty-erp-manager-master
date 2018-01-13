// 表单获取数据方法
$.fn.extend({
  // 获取表单数据，输出格式为对象
  serializeObject: function () {
    var o = {};
    var a = $(this).serializeArray();
    $.each(a, function () {
      if (o[this.name] !== undefined) {
        if (!o[this.name].push) {
          o[this.name] = [o[this.name]];
        }
        o[this.name].push(this.value || '');
      } else {
        o[this.name] = this.value || '';
      }
    });
    return o;
  },
  // 初始化表单控件方法
  initFormControls: function (data) {
    var $this = $(this);
    for (var key in data) {
      var control = $this.find('#' + key);
      if (control.attr('id')) {
        var tagName = control.get(0).tagName;
        var type = '';
        switch (tagName) {
          case 'INPUT':
            type = control.attr('type');
            break;
          case 'SELECT':
            type = 'select';
            break;
          default:
            type = 'text';
            break;
        }
        // if (control.data('type') === 'datepicker') {
        //   type = 'datepicker';
        // }
        var value = $.trim(data[key]).replace(/&nbsp;/g, '');
        switch (type) {
          case 'checkbox':
            if (value) {
              control.attr('checked', 'checked');
            } else {
              control.removeAttr('checked');
            }
            break;
          case 'select':
            control.selectpicker('val', value);
            break;
          case 'selectTree':
            // id.ComboBoxTreeSetValue(value);
            break;
            // case 'datepicker':
            //   control.val(formatDate(value, 'yyyy-MM-dd'));
            //   break;
          default:
            control.val(value);
            break;
        }
      }
    }
    return this;
  },
  // 重置表单方法
  resetFormControls: function () {
    var $this = $(this);
    $this[0].reset();
    $this.find('.selectpicker').selectpicker('refresh');
    return this;
  },
  // 初始化表单方法
  initForm: function (type, title, data, callback) {
    var $this = $(this);
    var $modalTitle = $this.closest('.modal').find('.modal-title');
    $modalTitle.text(title);
    $this.resetFormControls();
    $this.data('formValidation').resetForm();
    if (type === 'edit') {
      $this.initFormControls(data);
      $this.find('.btn[data-type="saveAndAdd"]').hide();
      $this.find('.btn[data-type="save"]').addClass('btn-primary');
    } else {
      $this.find('.btn[data-type="saveAndAdd"]').show();
      $this.find('.btn[data-type="save"]').removeClass('btn-primary');
    }
    callback && callback();
    return this;
  }
});

$.extend({
  /*
   * ttyAjax 请求
   * @param {Object} options - 需要的传参
   * @param {String} options.url  - 必传 请求的url
   * @param {Object} options.param  - 必传 请求的参数
   * @param {String} options.type  - 选传 请求的类型
   * @param {function} options.success  - 选传 请求成功的回调
   * */
  ttyAjax: function (options) {
    var defaults = {
      url: '',
      param: {},
      type: 'post',
      dataType: 'json',
      async: true,
      success: null,
      traditional: false
    };
    options = $.extend(defaults, options);
    var postdata = options.param;
    if ($('[name=__RequestVerificationToken]').length > 0) {
      postdata['__RequestVerificationToken'] = $('[name=__RequestVerificationToken]').val();
    }
    $.ajax({
      url: options.url,
      data: postdata,
      type: options.type,
      async: options.async,
      traditional: options.traditional,
      dataType: options.dataType,
      success: options.success,
      error: options.error,
      beforeSend: function () {},
      complete: function () {}
    });
  },
  /*
   * operationMessage 删除，启用，停用操作
   * @param {Object} options - 需要的传参
   * @param {String} options.url  - 必传 请求的url
   * @param {Object} options.param  - 必传 请求的参数
   * @param {String} options.type  - 选传 请求成功的类型
   * @param {function} options.success  - 选传 请求成功的回调
   * @param {String} options.operationType  - 选传 操作类型（默认为删除）
   * */
  operationMessage: function (options) {
    var defaults = {
      url: '',
      param: {},
      type: 'post',
      dataType: 'json',
      success: null,
      traditional: false,
      operationType: 'remove',
      title: '删除提示',
      content: '删除后数据不可恢复',
      cancelContent: '确定要删除吗？'
    };
    switch (options.operationType) {
      case 'enable':
        defaults.title = '启用提示',
          defaults.content = ' ',
          defaults.cancelContent = '确认要启用吗？';
        break;
      case 'disable':
        defaults.title = '停用提示',
          defaults.content = ' ',
          defaults.cancelContent = '确认要停用吗？';
        break;
    }
    options = $.extend(defaults, options);
    $.messageBox.confirm({
      'title': options.title,
      'content': options.content,
      'cancelContent': options.cancelContent,
      'onConfirm': function () {
        $.ttyAjax({
          url: options.url,
          type: options.type,
          param: options.param,
          async: options.async,
          traditional: options.traditional,
          dataType: options.dataType,
          success: function (data) {
            options.success(data);
          },
          error: options.error
        });
      }
    });
  }
});

// 初始化操作
$(function () {
  // 初始化内容页面高度，滚动条在内容页面上
  (function () {
    function setSubPageMinHeight() {
      var scrollHeight = document.documentElement.clientWidth < 1260 ? window.$utils.getScrollBarWidth() : 0;
      var subPageMinHeight = document.documentElement.clientHeight - $('.header').outerHeight() - scrollHeight;
      $('.sub-page').outerHeight(subPageMinHeight);
    }
    setSubPageMinHeight();
    $(window).resize(function () {
      setSubPageMinHeight();
    });

    $('.page-sidebar > ul > li').each(function () {
      if (location.href.indexOf($(this).data('module')) !== -1) {
        $(this).addClass('active');
      }
    });
  })();
});

// tabs扩展插件
(function ($) {
  var tabs = {};
  var config = {
    menuLinkSelector: '.page-sidebar',
    tabsLinkSelector: '.tab-page',
    iframeContainerSelector: '.sub-page-content',
    iframeKey: 'iframe_',
    homeName: '首页',
    homePath: 'html/home.html'
  };

  /**
   * 初始化tab标签页面,以及打开相应iframe页面
   */
  tabs.init = function (options) {
    $.extend(config, options);
    var openedTabs = window.$utils.sessionStore.get('openedTabs');
    var currentTabIndex = +window.$utils.sessionStore.get('currentTabIndex');
    if (!openedTabs || !openedTabs.length) {
      openedTabs = [{
        name: config.homeName,
        path: config.homePath
      }];
      currentTabIndex = 0;

      window.$utils.sessionStore.set('openedTabs', openedTabs);
      window.$utils.sessionStore.set('currentTabIndex', currentTabIndex);
    }

    createIframeDom(currentTabIndex, openedTabs[currentTabIndex].path, true);

    for (var i = 0, length = openedTabs.length; i < length; i++) {
      var isActive = i === currentTabIndex;
      createTabLinkDom(openedTabs[i].path, openedTabs[i].name, isActive);
    }
  };

  /**
   * 打开标签页操作方法
   * @param {String} path - 要打开标签页路由路径，必传
   * @param {String} name - 要打开标签页显示名称，必传
   */
  tabs.openTab = function (path, name) {
    if (window.$utils.isInIframe()) {
      parent.$.tabs.openTab(path, name);
    } else {
      var openedTabs = window.$utils.sessionStore.get('openedTabs');
      var currentTabIndex = +window.$utils.sessionStore.get('currentTabIndex');
      var tabIndex = queryTabInOpenedTabs(path);
      if (tabIndex === undefined) {
        if (openedTabs.length >= 10) {
          $.message('为保证系统效率,只允许同时运行10个功能窗口,请关闭一些窗口后重试！');
          return false;
        }
        openedTabs.push({
          name: name,
          path: path
        });
        createTabLinkDom(path, name, true);
        createIframeDom(openedTabs.length - 1, path, true);
        window.$utils.sessionStore.set('openedTabs', openedTabs);
        window.$utils.sessionStore.set('currentTabIndex', openedTabs.length - 1);
      } else {
        if (tabIndex !== currentTabIndex) {
          $(config.tabsLinkSelector + ' ul li').removeClass('active');
          $(config.tabsLinkSelector + ' ul li').eq(tabIndex).addClass('active');
          window.$utils.sessionStore.set('currentTabIndex', tabIndex);
        }

        if ($('#' + config.iframeKey + tabIndex).length) {
          $(config.iframeContainerSelector + '>iframe').removeClass('active');
          $('#' + config.iframeKey + tabIndex).attr('src', path);
          $('#' + config.iframeKey + tabIndex).addClass('active');
          fixIframeSize($('#' + config.iframeKey + tabIndex));
        } else {
          createIframeDom(tabIndex, path, true);
        }
      }

      $(config.menuLinkSelector + '>ul>li').removeClass('active');
      $(config.menuLinkSelector + ' a[href= "' + path + '"]').closest(config.menuLinkSelector + '>ul>li').addClass('active');
    }

    return true;
  };

  /**
   * 关闭标签页操作方法
   * @param {String} path - 标签页路由路径，不传默认为当前打开标签页面
   */
  tabs.closeTab = function (path) {
    if (window.$utils.isInIframe()) {
      parent.$.tabs.closeTab(path);
    } else {
      path = path || $(config.tabsLinkSelector + ' li.active a').attr('href');
      closeTabPage(path);
    }
    return true;
  };

  // 点击菜单|tabs链接事件
  $(config.menuLinkSelector + ', ' + config.tabsLinkSelector).on('click', 'a', function () {
    var $this = $(this);
    var path = $this.attr('href');
    var name = $this.data('name');
    tabs.openTab(path, name);
    return false;
  });

  // 关闭标签页事件
  $(config.tabsLinkSelector).on('click', '.icon-close', function (event) {
    event.preventDefault();
    event.stopPropagation();
    var closeTabPath = $(this).closest('a').attr('href');
    closeTabPage(closeTabPath);
    return false;
  });

  // 生成tab link dom元素
  function createTabLinkDom(path, name, isActive) {
    var tabLiStr;
    if (isActive) {
      $(config.tabsLinkSelector + ' ul li').removeClass('active');
      tabLiStr = '<li class="hover-layer active"><a href=' + '"' + path + '" data-name=' + '"' + name + '"><span class="tab-name">' + name + '</span><i class="iconfont icon-close hover-layer"></i></a></li>';
    } else {
      tabLiStr = '<li class="hover-layer"><a href=' + '"' + path + '" data-name=' + '"' + name + '"><span class="tab-name">' + name + '</span><i class="iconfont icon-close hover-layer"></i></a></li>';
    }
    $(tabLiStr).appendTo($(config.tabsLinkSelector + ' ul'));
    return true;
  }

  // 生成iframe dom元素
  function createIframeDom(index, path, isActive) {
    var iframeKey = config.iframeKey + index;
    var iframe = $('<iframe></iframe>');
    iframe.attr('id', iframeKey);
    iframe.attr('name', iframeKey);
    iframe.attr('src', path);
    iframe.attr('frameborder', '0');
    iframe.addClass('sub-page-iframe');
    iframe.css('height', $(config.iframeContainerSelector).height());
    if (isActive) {
      $(config.iframeContainerSelector + '>iframe').removeClass('active');
      iframe.addClass('active');
      fixIframeSize(iframe);
    }
    iframe.appendTo($(config.iframeContainerSelector));
    return true;
  }

  // 查找打开页面路径在已打开缓存中索引
  function queryTabInOpenedTabs(path) {
    var openedTabs = window.$utils.sessionStore.get('openedTabs');
    var tabIndex;

    for (var i = 0, len = openedTabs.length; i < len; i++) {
      if (openedTabs[i].path.split('?')[0] === path.split('?')[0]) {
        openedTabs[i].path = path;
        tabIndex = i;
        window.$utils.sessionStore.set('openedTabs', openedTabs);
        break;
      }
    }
    return tabIndex;
  }

  // 关闭tab标签页后更新iframe id与name
  function updateIframeKeys(closedTabIndex) {
    $(config.iframeContainerSelector + '>iframe').each(function () {
      var $this = $(this);
      var iframeOldIndex = +$this.attr('id').split(config.iframeKey)[1];
      if (iframeOldIndex && iframeOldIndex > closedTabIndex) {
        iframeOldIndex--;
        $this.attr('id', config.iframeKey + iframeOldIndex);
        $this.attr('name', config.iframeKey + iframeOldIndex);
      }
    });
  }

  // 关闭tab标签操作
  function closeTabPage(path) {
    var tabIndex = queryTabInOpenedTabs(path);
    var openedTabs = window.$utils.sessionStore.get('openedTabs');
    var currentTabIndex = +window.$utils.sessionStore.get('currentTabIndex');
    if (tabIndex !== undefined) {
      openedTabs.splice(tabIndex, 1);
      window.$utils.sessionStore.set('openedTabs', openedTabs);
      $(config.tabsLinkSelector + ' ul li').eq(tabIndex).remove();
      if (currentTabIndex === tabIndex) {
        currentTabIndex = tabIndex - 1;
        window.$utils.sessionStore.set('currentTabIndex', tabIndex - 1);
        $(config.tabsLinkSelector + ' ul li').eq(currentTabIndex).addClass('active');
        $('#' + config.iframeKey + tabIndex).remove();
        tabs.openTab(openedTabs[currentTabIndex].path, openedTabs[currentTabIndex].name);
      } else if (currentTabIndex > tabIndex) {
        currentTabIndex--;
        window.$utils.sessionStore.set('currentTabIndex', currentTabIndex);
        $('#' + config.iframeKey + tabIndex).attr('id', config.iframeKey + currentTabIndex);
      } else {
        $('#' + config.iframeKey + tabIndex).remove();
      }
      updateIframeKeys(tabIndex);
    }
  }

  // 修复chrome浏览器iframe兼容性问题-隐藏起来再显示滚动条消失
  function fixIframeSize(iframe) {
    iframe.css('height', iframe.height() - 1);
    iframe.css('height', iframe.height() + 1);
  }

  // 扩展jQuery
  $.extend({
    tabs: tabs
  });
})(jQuery);

(function () {
  var min, max, checkArr;
  $('.b-opt input[type=checkbox]').on('click', function () {
    checkArr = [];
    var parentSelector = $(this).parent().parent();
    min = parentSelector.attr('min') * 1;
    max = parentSelector.attr('max') * 1;
    for (var i = 0, len = parentSelector.find('input[type=checkbox]').length; i < len; i++) {
      if (parentSelector.find('input[type=checkbox]')[i].checked) {
        checkArr.push(parentSelector.find('input[type=checkbox]')[i]);
      }
    }
    if (checkArr.length > max) {
      $(this)[0].checked = false;
    }
    if (checkArr.length < min) {
      $(this)[0].checked = true;
    }
  });
})();

(function ($) {
  var messageBox = {
    containerClass: 'postbird-box-container active',
    textTemplate: {
      title: '提示信息',
      content: '提示内容',
      cancelContent: '',
      okBtn: '确认',
      cancelBtn: '否',
      contentColor: '#000000',
      okBtnColor: '#fff',
      promptTitle: '请输入内容',
      promptOkBtn: '是',
      closeBtn: ''
    },
    getAlertTemplate: function () {
      var temp = '<div class="postbird-box-dialog">' + '<div class="postbird-box-content">' + '<div class="postbird-box-header">' + '<span class="postbird-box-close-btn iconfont icon-close' + this.textTemplate.closeBtn + '"></span>' + '<span class="postbird-box-title">' + '<span >' + this.textTemplate.title + '</span>' + '</span>' + '</div>' + '<div class="postbird-box-text">' + '<div class="content-wrap">' + '<span style="color:' + this.textTemplate.contentColor + ';">' + this.textTemplate.content + '</span>' + '</div>' + '</div>' + '<div class="postbird-box-footer">' + '<button class="btn-footer btn-block-footer btn-footer-ok btn" style="color:' + this.textTemplate.okBtnColor + ';">' + this.textTemplate.okBtn + '</button>' + '</div>' + '</div>' + '</div>';
      return temp;
    },
    getConfirmTemplate: function () {
      return '<div class="postbird-box-container">' + '<div class="postbird-box-dialog">' + '<div class="postbird-box-content">' + '<div class="postbird-box-header">' + '<span class="postbird-box-close-btn iconfont icon-close' + this.textTemplate.closeBtn + '"></span>' + '<span class="postbird-box-title">' + '<span >' + this.textTemplate.title + '</span>' + '</span>' + '</div>' + '<div class="postbird-box-text">' + '<div class="content-wrap">' + '<span style="color:' + this.textTemplate.contentColor + ';">' + this.textTemplate.content + '</span>' + '<span class="cancel-content" style="color:' + this.textTemplate.contentColor + ';">' + this.textTemplate.cancelContent + '</span>' + '</div>' + '</div>' + '<div class="postbird-box-footer">' + '<button class="btn-footer btn-left-footer btn-footer-cancel btn" style="color:' + this.textTemplate.cancelBtnColor + ';">' + this.textTemplate.cancelBtn + '</button>' + '<button class="btn-footer btn-right-footer btn-footer-ok btn"  style="color:' + this.textTemplate.okBtnColor + ';">' + this.textTemplate.okBtn + '</button>' + '</div>' + '</div>' + '</div>' + '</div>';
    },
    getPromptTemplate: function () {
      return '<div class="postbird-box-container">' + '<div class="postbird-box-dialog">' + '<div class="postbird-box-content">' + '<div class="postbird-box-header">' + '<span class="postbird-box-close-btn iconfont icon-close' + this.textTemplate.closeBtn + '"></span>' + '<span class="postbird-box-title">' + '<span >' + this.textTemplate.title + '</span>' + '</span>' + '</div>' + '<div class="postbird-box-text">' + '<input type="text" class="postbird-prompt-input" autofocus="true" >' + '</div>' + '<div class="postbird-box-footer">' + '<button class="btn-footer btn-left-footer btn-footer-cancel btn" style="color:' + this.textTemplate.cancelBtnColor + ';">' + this.textTemplate.cancelBtn + '</button>' + '<button class="btn-footer btn-right-footer btn-footer-ok btn"  style="color:' + this.textTemplate.okBtnColor + ';">' + this.textTemplate.okBtn + '</button>' + '</div>' + '</div>' + '</div>' + '</div>';
    },
    alert: function (opt) {
      this.textTemplate.closeBtn = opt.closeBtn || this.textTemplate.closeBtn;
      this.textTemplate.title = opt.title || this.textTemplate.title;
      this.textTemplate.content = opt.content || this.textTemplate.content;
      this.textTemplate.okBtn = opt.okBtn || this.textTemplate.okBtn;
      this.textTemplate.okBtnColor = opt.okBtnColor || this.textTemplate.okBtnColor;
      this.textTemplate.contentColor = opt.contentColor || this.textTemplate.contentColor;
      var box = document.createElement('div'),
        _this = this;
      box.className = this.containerClass;
      box.innerHTML = this.getAlertTemplate();
      document.body.appendChild(box);
      var btn = document.getElementsByClassName('btn-footer-ok');
      btn[btn.length - 1].onclick = function () {
        if (opt.onConfirm) {
          opt.onConfirm();
        }
        _this.removeBox(box);
      };
      var closeBtn = document.getElementsByClassName('postbird-box-close-btn');
      closeBtn[closeBtn.length - 1].onclick = function () {
        _this.removeBox(box);
      };
    },
    confirm: function (opt) {
      this.textTemplate.cancelContent = opt.cancelContent || this.textTemplate.cancelContent;
      this.textTemplate.closeBtn = opt.closeBtn || this.textTemplate.closeBtn;
      this.textTemplate.title = opt.title || this.textTemplate.promptTitle;
      this.textTemplate.promptPlaceholder = opt.promptPlaceholder || this.textTemplate.promptPlaceholder;
      this.textTemplate.okBtn = opt.okBtn || this.textTemplate.promptOkBtn;
      this.textTemplate.okBtnColor = opt.okBtnColor || this.textTemplate.okBtnColor;
      this.textTemplate.cancelBtn = opt.cancelBtn || this.textTemplate.cancelBtn;
      this.textTemplate.cancelBtnColor = opt.cancelBtnColor || this.textTemplate.cancelBtnColor;
      this.textTemplate.content = opt.content || this.textTemplate.content;
      var box = document.createElement('div'),
        _this = this;
      box.className = this.containerClass;
      box.innerHTML = this.getConfirmTemplate();
      document.body.appendChild(box);
      var okBtn = document.getElementsByClassName('btn-footer-ok');
      okBtn[okBtn.length - 1].onclick = function () {
        if (opt.onConfirm) {
          opt.onConfirm();
        }
        _this.removeBox(box);
      };
      var cancelBtn = document.getElementsByClassName('btn-footer-cancel');
      cancelBtn[cancelBtn.length - 1].onclick = function () {
        if (opt.onCancel) {
          opt.onCancel();
        }
        _this.removeBox(box);
      };
      var closeBtn = document.getElementsByClassName('postbird-box-close-btn');
      closeBtn[closeBtn.length - 1].onclick = function () {
        _this.removeBox(box);
      };
    },
    prompt: function (opt) {
      this.textTemplate.closeBtn = opt.closeBtn || this.textTemplate.closeBtn;
      this.textTemplate.title = opt.title || this.textTemplate.title;
      this.textTemplate.content = opt.content || this.textTemplate.content;
      this.textTemplate.contentColor = opt.contentColor || this.textTemplate.contentColor;
      this.textTemplate.okBtn = opt.okBtn || this.textTemplate.okBtn;
      this.textTemplate.okBtnColor = opt.okBtnColor || this.textTemplate.okBtnColor;
      this.textTemplate.cancelBtn = opt.cancelBtn || this.textTemplate.cancelBtn;
      this.textTemplate.cancelBtnColor = opt.cancelBtnColor || this.textTemplate.cancelBtnColor;
      var box = document.createElement('div'),
        _this = this;
      box.className = this.containerClass;
      box.innerHTML = this.getPromptTemplate();
      document.body.appendChild(box);
      var promptInput = document.getElementsByClassName('postbird-prompt-input');
      promptInput = promptInput[promptInput.length - 1];
      promptInput.focus();
      var okBtn = document.getElementsByClassName('btn-footer-ok');
      var inputData = promptInput.value;
      okBtn[okBtn.length - 1].onclick = function () {
        if (opt.onConfirm) {
          opt.onConfirm(promptInput.value);
        }
        _this.removeBox(box);
      };
      var cancelBtn = document.getElementsByClassName('btn-footer-cancel');
      cancelBtn[cancelBtn.length - 1].onclick = function () {
        if (opt.onCancel) {
          opt.onCancel(promptInput.value);
        }
        _this.removeBox(box);
      };
    },
    removeBox: function (box) {
      var $box = $(box) || $(document.getElementsByClassName(this.containerClass));
      $box.eq($box.length - 1).remove();
    }
  };

  $.messageBox = messageBox;
})($);

$.extend({
  message: function (options) {
    var defaults = {
      message: ' 操作成功',
      time: '3000',
      type: 'info',
      showClose: false,
      onClose: function () {}
    };

    if (typeof options === 'string') {
      defaults.message = options;
    }
    if (typeof options === 'object') {
      defaults = $.extend({}, defaults, options);
    }
    // message模版
    var templateClose = defaults.showClose ? '<a class="b-message__closeBtn iconfont icon-close hover-layer"></a>' : '';
    var template = '<div class="b-message messageFadeInDown b-message-' + defaults.type + '">' +
      templateClose +
      '<div class="b-message-tip">' + defaults.message + '</div>' +
      '</div>';
    var _this = this;
    var $body = $('body');
    var $message = $(template);
    var timer;
    var closeFn, removeFn;
    $body.append($message);
    // 关闭
    closeFn = function () {
      removeFn();
    };
    // 移除
    removeFn = function () {
      $message.remove();
      defaults.onClose(defaults);
      clearTimeout(timer);
    };
    // 点击关闭
    $body.on('click', '.b-message__closeBtn', function (e) {
      closeFn();
    });
    // 自动关闭
    if (defaults.time) {
      timer = setTimeout(function () {
        closeFn();
      }, defaults.time);
    }
  }
});



(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module unless amdModuleId is set
    define(['jquery'], function (a0) {
      return (factory(a0));
    });
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory(require('jquery'));
  } else {
    factory(jQuery);
  }
}(this, function () {
  (function ($) {
    'use strict';

    // <editor-fold desc="Shims">
    if (!String.prototype.includes) {
      (function () {
        'use strict'; // needed to support `apply`/`call` with `undefined`/`null`
        var toString = {}.toString;
        var defineProperty = (function () {
          // IE 8 only supports `Object.defineProperty` on DOM elements
          try {
            var object = {};
            var $defineProperty = Object.defineProperty;
            var result = $defineProperty(object, object, object) && $defineProperty;
          } catch (error) {}
          return result;
        }());
        var indexOf = ''.indexOf;
        var includes = function (search) {
          if (this == null) {
            throw TypeError();
          }
          var string = String(this);
          if (search && toString.call(search) == '[object RegExp]') {
            throw TypeError();
          }
          var stringLength = string.length;
          var searchString = String(search);
          var searchLength = searchString.length;
          var position = arguments.length > 1 ? arguments[1] : undefined;
          // `ToInteger`
          var pos = position ? Number(position) : 0;
          if (pos != pos) { // better `isNaN`
            pos = 0;
          }
          var start = Math.min(Math.max(pos, 0), stringLength);
          // Avoid the `indexOf` call if no match is possible
          if (searchLength + start > stringLength) {
            return false;
          }
          return indexOf.call(string, searchString, pos) != -1;
        };
        if (defineProperty) {
          defineProperty(String.prototype, 'includes', {
            'value': includes,
            'configurable': true,
            'writable': true
          });
        } else {
          String.prototype.includes = includes;
        }
      }());
    }

    if (!String.prototype.startsWith) {
      (function () {
        'use strict'; // needed to support `apply`/`call` with `undefined`/`null`
        var defineProperty = (function () {
          // IE 8 only supports `Object.defineProperty` on DOM elements
          try {
            var object = {};
            var $defineProperty = Object.defineProperty;
            var result = $defineProperty(object, object, object) && $defineProperty;
          } catch (error) {}
          return result;
        }());
        var toString = {}.toString;
        var startsWith = function (search) {
          if (this == null) {
            throw TypeError();
          }
          var string = String(this);
          if (search && toString.call(search) == '[object RegExp]') {
            throw TypeError();
          }
          var stringLength = string.length;
          var searchString = String(search);
          var searchLength = searchString.length;
          var position = arguments.length > 1 ? arguments[1] : undefined;
          // `ToInteger`
          var pos = position ? Number(position) : 0;
          if (pos != pos) { // better `isNaN`
            pos = 0;
          }
          var start = Math.min(Math.max(pos, 0), stringLength);
          // Avoid the `indexOf` call if no match is possible
          if (searchLength + start > stringLength) {
            return false;
          }
          var index = -1;
          while (++index < searchLength) {
            if (string.charCodeAt(start + index) != searchString.charCodeAt(index)) {
              return false;
            }
          }
          return true;
        };
        if (defineProperty) {
          defineProperty(String.prototype, 'startsWith', {
            'value': startsWith,
            'configurable': true,
            'writable': true
          });
        } else {
          String.prototype.startsWith = startsWith;
        }
      }());
    }

    if (!Object.keys) {
      Object.keys = function (
        o, // object
        k, // key
        r // result array
      ) {
        // initialize object and result
        r = [];
        // iterate over object keys
        for (k in o)
        // fill result array with non-prototypical keys
        {
          r.hasOwnProperty.call(o, k) && r.push(k);
        }
        // return result
        return r;
      };
    }
    // </editor-fold>

    // Case insensitive contains search
    $.expr[':'].icontains = function (obj, index, meta) {
      var $obj = $(obj);
      var haystack = ($obj.data('tokens') || $obj.text()).toUpperCase();
      return haystack.includes(meta[3].toUpperCase());
    };

    // Case insensitive begins search
    $.expr[':'].ibegins = function (obj, index, meta) {
      var $obj = $(obj);
      var haystack = ($obj.data('tokens') || $obj.text()).toUpperCase();
      return haystack.startsWith(meta[3].toUpperCase());
    };

    // Case and accent insensitive contains search
    $.expr[':'].aicontains = function (obj, index, meta) {
      var $obj = $(obj);
      var haystack = ($obj.data('tokens') || $obj.data('normalizedText') || $obj.text()).toUpperCase();
      return haystack.includes(meta[3].toUpperCase());
    };

    // Case and accent insensitive begins search
    $.expr[':'].aibegins = function (obj, index, meta) {
      var $obj = $(obj);
      var haystack = ($obj.data('tokens') || $obj.data('normalizedText') || $obj.text()).toUpperCase();
      return haystack.startsWith(meta[3].toUpperCase());
    };

    /**
     * Remove all diatrics from the given text.
     * @access private
     * @param {String} text
     * @returns {String}
     */
    function normalizeToBase(text) {
      var rExps = [{
          re: /[\xC0-\xC6]/g,
          ch: 'A'
        },
        {
          re: /[\xE0-\xE6]/g,
          ch: 'a'
        },
        {
          re: /[\xC8-\xCB]/g,
          ch: 'E'
        },
        {
          re: /[\xE8-\xEB]/g,
          ch: 'e'
        },
        {
          re: /[\xCC-\xCF]/g,
          ch: 'I'
        },
        {
          re: /[\xEC-\xEF]/g,
          ch: 'i'
        },
        {
          re: /[\xD2-\xD6]/g,
          ch: 'O'
        },
        {
          re: /[\xF2-\xF6]/g,
          ch: 'o'
        },
        {
          re: /[\xD9-\xDC]/g,
          ch: 'U'
        },
        {
          re: /[\xF9-\xFC]/g,
          ch: 'u'
        },
        {
          re: /[\xC7-\xE7]/g,
          ch: 'c'
        },
        {
          re: /[\xD1]/g,
          ch: 'N'
        },
        {
          re: /[\xF1]/g,
          ch: 'n'
        }
      ];
      $.each(rExps, function () {
        text = text.replace(this.re, this.ch);
      });
      return text;
    }

    function htmlEscape(html) {
      var escapeMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '`': '&#x60;'
      };
      var source = '(?:' + Object.keys(escapeMap).join('|') + ')',
        testRegexp = new RegExp(source),
        replaceRegexp = new RegExp(source, 'g'),
        string = html == null ? '' : '' + html;
      return testRegexp.test(string) ? string.replace(replaceRegexp, function (match) {
        return escapeMap[match];
      }) : string;
    }

    var Selectpicker = function (element, options, e) {
      // if (e) {
      //   e.stopPropagation();
      //   e.preventDefault();
      // }
      // console.log(e);

      this.$element = $(element);
      this.$newElement = null;
      this.$button = null;
      this.$menu = null;
      this.$lis = null;
      this.options = options;

      // If we have no title yet, try to pull it from the html title attribute (jQuery doesnt' pick it up as it's not a
      // data-attribute)
      if (this.options.title === null) {
        this.options.title = this.$element.attr('title');
      }

      // Expose public methods
      this.val = Selectpicker.prototype.val;
      this.render = Selectpicker.prototype.render;
      this.refresh = Selectpicker.prototype.refresh;
      this.setStyle = Selectpicker.prototype.setStyle;
      this.selectAll = Selectpicker.prototype.selectAll;
      this.deselectAll = Selectpicker.prototype.deselectAll;
      this.destroy = Selectpicker.prototype.remove;
      this.remove = Selectpicker.prototype.remove;
      this.show = Selectpicker.prototype.show;
      this.hide = Selectpicker.prototype.hide;
      this.edit = Selectpicker.prototype.edit;
      this.editValue = Selectpicker.prototype.editValue;
      this.ajaxRequest = Selectpicker.prototype.ajaxRequest;
      this.init();
    };

    Selectpicker.VERSION = '1.7.2';

    // part of this is duplicated in i18n/defaults-en_US.js. Make sure to update both.
    Selectpicker.DEFAULTS = {
      noneSelectedText: '请选择',
      noneResultsText: '无匹配数据',
      countSelectedText: function (numSelected, numTotal) {
        return (numSelected == 1) ? '{0} item selected' : '{0} items selected';
      },
      maxOptionsText: function (numAll, numGroup) {
        return [
          (numAll == 1) ? 'Limit reached ({n} item max)' : 'Limit reached ({n} items max)',
          (numGroup == 1) ? 'Group limit reached ({n} item max)' : 'Group limit reached ({n} items max)'
        ];
      },
      selectAllText: 'Select All',
      deselectAllText: 'Deselect All',
      doneButton: false,
      doneButtonText: 'Close',
      multipleSeparator: ', ',
      styleBase: 'btn',
      style: 'btn-default',
      size: 'auto',
      title: null,
      selectedTextFormat: 'values',
      width: false,
      container: false,
      hideDisabled: false,
      showSubtext: false,
      showIcon: true,
      showContent: true,
      dropupAuto: true,
      header: false,
      liveSearch: false,
      liveSearchPlaceholder: null,
      liveSearchNormalize: false,
      liveSearchStyle: 'contains',
      actionsBox: false,
      iconBase: 'glyphicon',
      tickIcon: 'glyphicon-ok',
      maxOptions: false,
      mobile: false,
      selectOnTab: false,
      dropdownAlignRight: false
    };

    Selectpicker.prototype = {

      constructor: Selectpicker,

      init: function () {
        var that = this,
          id = this.$element.attr('id');

        this.$element.addClass('bs-select-hidden');
        this.$selectBtb = this.$element.attr('data-done-button');
        // store originalIndex (key) and newIndex (value) in this.liObj for fast accessibility
        // allows us to do this.$lis.eq(that.liObj[index]) instead of this.$lis.filter('[data-original-index="' + index + '"]')
        this.liObj = {};
        this.multiple = this.$element.prop('multiple');
        this.autofocus = this.$element.prop('autofocus');
        this.$newElement = this.createView();
        this.$element.after(this.$newElement);
        this.$button = this.$newElement.children('button');
        this.$menu = this.$newElement.children('.dropdown-menu');
        this.$menuInner = this.$menu.children('.inner');
        this.$searchbox = this.$menu.find('input');
        if (this.options.dropdownAlignRight) {
          this.$menu.addClass('dropdown-menu-right');
        }
        if (typeof id !== 'undefined') {
          this.$button.attr('data-id', id);
          $('label[for="' + id + '"]').click(function (e) {
            e.preventDefault();
            that.$button.focus();
          });
        }

        this.checkDisabled();
        this.clickListener();
        if (this.options.liveSearch) this.liveSearchListener();
        this.render();
        this.setStyle();
        this.setWidth();
        if (this.options.container) this.selectPosition();
        this.$menu.data('this', this);
        this.$newElement.data('this', this);
        if (this.options.mobile) this.mobile();

        this.$newElement.on('hide.bs.dropdown', function (e) {
          that.$element.trigger('hide.bs.select', e);
        });

        this.$newElement.on('hidden.bs.dropdown', function (e) {
          that.$element.trigger('hidden.bs.select', e);
        });

        this.$newElement.on('show.bs.dropdown', function (e) {
          that.$element.trigger('show.bs.select', e);
        });

        this.$newElement.on('shown.bs.dropdown', function (e) {
          that.$element.trigger('shown.bs.select', e);
        });

        setTimeout(function () {
          that.$element.trigger('loaded.bs.select');
        });
      },
      createDropdown: function () {
        // Options
        // If we are multiple, then add the show-tick class by default
        var multiple = this.multiple ? ' show-tick' : '',
          inputGroup = this.$element.parent().hasClass('input-group') ? ' input-group-btn' : '',
          autofocus = this.autofocus ? ' autofocus' : '';
        // Elements
        var header = this.options.header ? '<div class="popover-title"><button type="button" class="close" aria-hidden="true">&times;</button>' + this.options.header + '</div>' : '';
        var searchbox = this.options.liveSearch
          ? '<div class="bs-searchbox">' +
          '<i class="iconfont icon-search"></i>' +
          '<input type="text" class="form-control" autocomplete="off"' +
          (this.options.liveSearchPlaceholder === null ? '' : ' placeholder="' + htmlEscape(this.options.liveSearchPlaceholder) + '"') + '>' +
          '<div class="b-query-button">检索</div>' +
          '</div>'
          : '';
        var actionsbox = this.multiple && this.options.actionsBox
          ? '<div class="bs-actionsbox">' +
          '<div class="btn-group btn-group-sm btn-block">' +
          '<button type="button" class="actions-btn bs-select-all btn btn-default">' +
          this.options.selectAllText +
          '</button>' +
          '<button type="button" class="actions-btn bs-deselect-all btn btn-default">' +
          this.options.deselectAllText +
          '</button>' +
          '</div>' +
          '</div>'
          : '';
        var editBtn = this.$selectBtb ? '<div class="b-select-create__option">' +
          '<button type="button" class="b-select-create__btn btn btn-default">添加</button>' +
          '</div>' : '';
        var donebutton = this.multiple && this.options.doneButton
          ? '<div class="bs-donebutton">' +
          '<div class="btn-group btn-block">' +
          '<button type="button" class="btn btn-sm btn-default">' +
          this.options.doneButtonText +
          '</button>' +
          '</div>' +
          '</div>'
          : '';
        var drop =
          '<div class="btn-group bootstrap-select' + multiple + inputGroup + '">' +
          '<button type="button" class="' + this.options.styleBase + ' dropdown-toggle" data-toggle="dropdown"' + autofocus + '>' +
          '<span class="filter-option pull-left"></span>&nbsp;' +
          '<span class="b-input__icon iconfont input-group-inner-addon icon-zhankai"></span>' +
          '</button>' +
          '<div class="dropdown-menu open">' +
          header +
          searchbox +
          actionsbox +
          '<ul class="dropdown-menu inner" role="menu">' +
          '</ul>' +
          donebutton +
          editBtn +
          '</div>' +
          '</div>';

        return $(drop);
      },

      createView: function () {
        var $drop = this.createDropdown(),
          li = this.createLi();

        $drop.find('ul')[0].innerHTML = li;
        return $drop;
      },

      reloadLi: function () {
        // Remove all children.
        this.destroyLi();
        // Re build
        var li = this.createLi();
        this.$menuInner[0].innerHTML = li;
      },

      destroyLi: function () {
        this.$menu.find('li').remove();
      },

      createLi: function () {
        var that = this,
          _li = [],
          optID = 0,
          titleOption = document.createElement('option'),
          liIndex = -1; // increment liIndex whenever a new <li> element is created to ensure liObj is correct

        // Helper functions
        /**
         * @param content
         * @param [index]
         * @param [classes]
         * @param [optgroup]
         * @returns {string}
         */
        var isMultiple = this.multiple;
        var generateLI = function (content, index, classes, optgroup) {
          var liData;
          if (isMultiple) {
            liData = '<li' +
              ((typeof classes !== 'undefined' & classes !== '') ? ' class="' + classes + '"' : '') +
              ((typeof index !== 'undefined' & index !== null) ? ' data-original-index="' + index + '"' : '') +
              ((typeof optgroup !== 'undefined' & optgroup !== null) ? 'data-optgroup="' + optgroup + '"' : '') +
              ' class="b-multiple"' +
              '>' + content + '</li>';
          } else {
            liData = '<li' +
              ((typeof classes !== 'undefined' & classes !== '') ? ' class="' + classes + '"' : '') +
              ((typeof index !== 'undefined' & index !== null) ? ' data-original-index="' + index + '"' : '') +
              ((typeof optgroup !== 'undefined' & optgroup !== null) ? 'data-optgroup="' + optgroup + '"' : '') +
              '>' + content + '</li>';
          }
          return liData;
        };
        /**
         * @param text
         * @param [classes]
         * @param [inline]
         * @param [tokens]
         * @returns {string}
         */
        var generateA = function (text, classes, inline, tokens) {
          return '<a tabindex="0"' +
            (typeof classes !== 'undefined' ? ' class="' + classes + '"' : '') +
            (typeof inline !== 'undefined' ? ' style="' + inline + '"' : '') +
            (that.options.liveSearchNormalize ? ' data-normalized-text="' + normalizeToBase(htmlEscape(text)) + '"' : '') +
            (typeof tokens !== 'undefined' || tokens !== null ? ' data-tokens="' + tokens + '"' : '') +
            '>' + text +
            '<span class="' + that.options.iconBase + ' ' + that.options.tickIcon + ' check-mark"></span>' +
            '</a>';
        };

        if (this.options.title && !this.multiple) {
          // this option doesn't create a new <li> element, but does add a new option, so liIndex is decreased
          // since liObj is recalculated on every refresh, liIndex needs to be decreased even if the titleOption is already appended
          liIndex--;

          if (!this.$element.find('.bs-title-option').length) {
            // Use native JS to prepend option (faster)
            var element = this.$element[0];
            titleOption.className = 'bs-title-option';
            titleOption.appendChild(document.createTextNode(this.options.title));
            titleOption.value = '';
            element.insertBefore(titleOption, element.firstChild);
            // Check if selected attribute is already set on an option. If not, select the titleOption option.
            if (element.options[element.selectedIndex].getAttribute('selected') === null) titleOption.selected = true;
          }
        }
        this.$element.find('option').each(function (index) {
          var $this = $(this);
          liIndex++;

          if ($this.hasClass('bs-title-option')) return;

          // Get the class and text for the option
          var optionClass = this.className || '',
            inline = this.style.cssText,
            text = $this.data('content') ? $this.data('content') : $this.html(),
            tokens = $this.data('tokens') ? $this.data('tokens') : null,
            subtext = typeof $this.data('subtext') !== 'undefined' ? '<small class="text-muted">' + $this.data('subtext') + '</small>' : '',
            icon = typeof $this.data('icon') !== 'undefined' ? '<span class="' + that.options.iconBase + ' ' + $this.data('icon') + '"></span> ' : '',
            isDisabled = this.disabled || this.parentElement.tagName === 'OPTGROUP' && this.parentElement.disabled;

          if (icon !== '' && isDisabled) {
            icon = '<span>' + icon + '</span>';
          }

          if (that.options.hideDisabled && isDisabled) {
            liIndex--;
            return;
          }

          if (!$this.data('content')) {
            // Prepend any icon and append any subtext to the main text.
            text = icon + '<span class="text">' + text + subtext + '</span>';
          }
          if (this.parentElement.tagName === 'OPTGROUP' && $this.data('divider') !== true) {
            if ($this.index() === 0) { // Is it the first option of the optgroup?
              optID += 1;

              // Get the opt group label
              var label = this.parentElement.label,
                labelSubtext = typeof $this.parent().data('subtext') !== 'undefined' ? '<small class="text-muted">' + $this.parent().data('subtext') + '</small>' : '',
                labelIcon = $this.parent().data('icon') ? '<span class="' + that.options.iconBase + ' ' + $this.parent().data('icon') + '"></span> ' : '',
                optGroupClass = ' ' + this.parentElement.className || '';

              label = labelIcon + '<span class="text">' + label + labelSubtext + '</span>';
              if (index !== 0 && _li.length > 0) { // Is it NOT the first option of the select && are there elements in the dropdown?
                liIndex++;
                _li.push(generateLI('', null, 'divider', optID + 'div'));
              }
              liIndex++;
              _li.push(generateLI(label, null, 'dropdown-header' + optGroupClass, optID));
            }
            _li.push(generateLI(generateA(text, 'opt ' + optionClass + optGroupClass, inline, tokens), index, '', optID));
          } else if ($this.data('divider') === true) {
            _li.push(generateLI('', index, 'divider'));
          } else if ($this.data('hidden') === true) {
            _li.push(generateLI(generateA(text, optionClass, inline, tokens), index, 'hidden is-hidden'));
          } else {
            if (this.previousElementSibling && this.previousElementSibling.tagName === 'OPTGROUP') {
              liIndex++;
              _li.push(generateLI('', null, 'divider', optID + 'div'));
            }
            _li.push(generateLI(generateA(text, optionClass, inline, tokens), index));
          }
          that.liObj[index] = liIndex;
        });

        // If we are not multiple, we don't have a selected item, and we don't have a title, select the first element so something is set in the button
        if (!this.multiple && this.$element.find('option:selected').length === 0 && !this.options.title) {
          this.$element.find('option').eq(0).prop('selected', true).attr('selected', 'selected');
        }
        return _li.join('');
      },

      findLis: function () {
        if (this.$lis == null) this.$lis = this.$menu.find('li');
        return this.$lis;
      },

      /**
       * @param [updateLi] defaults to true
       */
      render: function (updateLi) {
        var that = this,
          notDisabled;

        // Update the LI to match the SELECT
        if (updateLi !== false) {
          this.$element.find('option').each(function (index) {
            var $lis = that.findLis().eq(that.liObj[index]);

            that.setDisabled(index, this.disabled || this.parentElement.tagName === 'OPTGROUP' && this.parentElement.disabled, $lis);
            that.setSelected(index, this.selected, $lis);
          });
        }

        this.tabIndex();

        var selectedItems = this.$element.find('option').map(function () {
          if (this.selected) {
            if (that.options.hideDisabled && (this.disabled || this.parentElement.tagName === 'OPTGROUP' && this.parentElement.disabled)) return false;
            var $this = $(this),
              icon = $this.data('icon') && that.options.showIcon ? '<i class="' + that.options.iconBase + ' ' + $this.data('icon') + '"></i> ' : '',
              subtext;
            if (that.options.showSubtext && $this.data('subtext') && !that.multiple) {
              subtext = ' <small class="text-muted">' + $this.data('subtext') + '</small>';
            } else {
              subtext = '';
            }
            if (typeof $this.attr('title') !== 'undefined') {
              return $this.attr('title');
            } else if ($this.data('content') && that.options.showContent) {
              return $this.data('content');
            } else {
              return icon + $this.html() + subtext;
            }
          }
        }).toArray();

        // Fixes issue in IE10 occurring when no default option is selected and at least one option is disabled
        // Convert all the values into a comma delimited string
        var title = !this.multiple ? selectedItems[0] : selectedItems.join(this.options.multipleSeparator);
        // If this is multi select, and the selectText type is count, the show 1 of 2 selected etc..
        if (this.multiple && this.options.selectedTextFormat.indexOf('count') > -1) {
          var max = this.options.selectedTextFormat.split('>');
          if ((max.length > 1 && selectedItems.length > max[1]) || (max.length == 1 && selectedItems.length >= 2)) {
            notDisabled = this.options.hideDisabled ? ', [disabled]' : '';
            var totalCount = this.$element.find('option').not('[data-divider="true"], [data-hidden="true"]' + notDisabled).length,
              tr8nText = (typeof this.options.countSelectedText === 'function') ? this.options.countSelectedText(selectedItems.length, totalCount) : this.options.countSelectedText;
            title = tr8nText.replace('{0}', selectedItems.length.toString()).replace('{1}', totalCount.toString());
          }
        }

        if (this.options.title == undefined) {
          this.options.title = this.$element.attr('title');
        }

        if (this.options.selectedTextFormat == 'static') {
          title = this.options.title;
        }

        // If we dont have a title, then use the default, or if nothing is set at all, use the not selected text
        if (!title) {
          title = typeof this.options.title !== 'undefined' ? this.options.title : this.options.noneSelectedText;
        }

        // strip all html-tags and trim the result
        // this.$button.attr('title', $.trim(title.replace(/<[^>]*>?/g, '')));
        // 判断是单选还是多选
        if (!this.multiple || title === '请选择') {
          this.$button.children('.filter-option').html(title);
        } else {
          var titleTem = '';
          title = title.split(',');
          for (var i = 0, len = title.length; i < len; i++) {
            titleTem += '<span class="b-tag">' +
              '<span class="b-select__tags-text">' + title[i] + '</span>' +
              '<i class="b-tag-close iconfont icon-close"></i>' +
              '</span>';
          }
          this.$button.children('.filter-option').html(titleTem);
        }

        // 点击关闭tag
        $('.b-tag-close').on('click', function () {
          $(this).parent().remove();
          var selectText = $(this).prev().text();
          for (var j = 0, selectLen = $('.b-multiple').length; j < selectLen; j++) {
            if ($('.b-multiple')[j]) {
              if ($('.b-multiple')[j].innerText.trim() === selectText.trim()) {
                that.$element.find('option').eq(j).prop('selected', false);
                that.setSelected(j, false);
              }
            }
          }
        });
        this.$element.trigger('rendered.bs.select');
      },

      /**
       * @param [style]
       * @param [status]
       */
      setStyle: function (style, status) {
        if (this.$element.attr('class')) {
          this.$newElement.addClass(this.$element.attr('class').replace(/selectpicker|mobile-device|bs-select-hidden|validate\[.*\]/gi, ''));
        }

        var buttonClass = style || this.options.style;

        if (status == 'add') {
          this.$button.addClass(buttonClass);
        } else if (status == 'remove') {
          this.$button.removeClass(buttonClass);
        } else {
          this.$button.removeClass(this.options.style);
          this.$button.addClass(buttonClass);
        }
      },

      liHeight: function (refresh) {
        if (!refresh && (this.options.size === false || this.sizeInfo)) return;

        var newElement = document.createElement('div'),
          menu = document.createElement('div'),
          menuInner = document.createElement('ul'),
          divider = document.createElement('li'),
          li = document.createElement('li'),
          a = document.createElement('a'),
          text = document.createElement('span'),
          header = this.options.header ? this.$menu.find('.popover-title')[0].cloneNode(true) : null,
          search = this.options.liveSearch ? document.createElement('div') : null,
          actions = this.options.actionsBox && this.multiple ? this.$menu.find('.bs-actionsbox')[0].cloneNode(true) : null,
          doneButton = this.options.doneButton && this.multiple ? this.$menu.find('.bs-donebutton')[0].cloneNode(true) : null;

        text.className = 'text';
        newElement.className = this.$menu[0].parentNode.className + ' open';
        menu.className = 'dropdown-menu open';
        menuInner.className = 'dropdown-menu inner';
        divider.className = 'divider';

        text.appendChild(document.createTextNode('Inner text'));
        a.appendChild(text);
        li.appendChild(a);
        menuInner.appendChild(li);
        menuInner.appendChild(divider);
        if (header) menu.appendChild(header);
        if (search) {
          // create a span instead of input as creating an input element is slower
          var input = document.createElement('span');
          search.className = 'bs-searchbox';
          input.className = 'form-control';
          search.appendChild(input);
          menu.appendChild(search);
        }
        if (actions) menu.appendChild(actions);
        menu.appendChild(menuInner);
        if (doneButton) menu.appendChild(doneButton);
        newElement.appendChild(menu);

        document.body.appendChild(newElement);

        var liHeight = a.offsetHeight,
          headerHeight = header ? header.offsetHeight : 0,
          searchHeight = search ? search.offsetHeight : 0,
          actionsHeight = actions ? actions.offsetHeight : 0,
          doneButtonHeight = doneButton ? doneButton.offsetHeight : 0,
          dividerHeight = $(divider).outerHeight(true),
          // fall back to jQuery if getComputedStyle is not supported
          menuStyle = getComputedStyle ? getComputedStyle(menu) : false,
          $menu = menuStyle ? $(menu) : null,
          menuPadding = parseInt(menuStyle ? menuStyle.paddingTop : $menu.css('paddingTop')) +
          parseInt(menuStyle ? menuStyle.paddingBottom : $menu.css('paddingBottom')) +
          parseInt(menuStyle ? menuStyle.borderTopWidth : $menu.css('borderTopWidth')) +
          parseInt(menuStyle ? menuStyle.borderBottomWidth : $menu.css('borderBottomWidth')),
          menuExtras = menuPadding +
          parseInt(menuStyle ? menuStyle.marginTop : $menu.css('marginTop')) +
          parseInt(menuStyle ? menuStyle.marginBottom : $menu.css('marginBottom')) + 2;

        document.body.removeChild(newElement);

        this.sizeInfo = {
          liHeight: liHeight,
          headerHeight: headerHeight,
          searchHeight: searchHeight,
          actionsHeight: actionsHeight,
          doneButtonHeight: doneButtonHeight,
          dividerHeight: dividerHeight,
          menuPadding: menuPadding,
          menuExtras: menuExtras
        };
      },

      setSize: function () {
        this.findLis();
        this.liHeight();
        var that = this,
          $menu = this.$menu,
          $menuInner = this.$menuInner,
          $window = $(window),
          selectHeight = this.$newElement[0].offsetHeight,
          liHeight = this.sizeInfo['liHeight'],
          headerHeight = this.sizeInfo['headerHeight'],
          searchHeight = this.sizeInfo['searchHeight'],
          actionsHeight = this.sizeInfo['actionsHeight'],
          doneButtonHeight = this.sizeInfo['doneButtonHeight'],
          divHeight = this.sizeInfo['dividerHeight'],
          menuPadding = this.sizeInfo['menuPadding'],
          menuExtras = this.sizeInfo['menuExtras'],
          notDisabled = this.options.hideDisabled ? '.disabled' : '',
          menuHeight,
          getHeight,
          selectOffsetTop,
          selectOffsetBot,
          posVert = function () {
            selectOffsetTop = that.$newElement.offset().top - $window.scrollTop();
            selectOffsetBot = $window.height() - selectOffsetTop - selectHeight;
          };

        posVert();

        if (this.options.header) $menu.css('padding-top', 0);

        if (this.options.size === 'auto') {
          var getSize = function () {
            var minHeight,
              hasClass = function (className, include) {
                return function (element) {
                  if (include) {
                    return (element.classList ? element.classList.contains(className) : $(element).hasClass(className));
                  } else {
                    return !(element.classList ? element.classList.contains(className) : $(element).hasClass(className));
                  }
                };
              },
              lis = that.$menuInner[0].getElementsByTagName('li'),
              lisVisible = Array.prototype.filter ? Array.prototype.filter.call(lis, hasClass('hidden', false)) : that.$lis.not('.hidden'),
              optGroup = Array.prototype.filter ? Array.prototype.filter.call(lisVisible, hasClass('dropdown-header', true)) : lisVisible.filter('.dropdown-header');

            posVert();
            menuHeight = selectOffsetBot - menuExtras;

            if (that.options.container) {
              if (!$menu.data('height')) $menu.data('height', $menu.height());
              getHeight = $menu.data('height');
            } else {
              getHeight = $menu.height();
            }

            if (that.options.dropupAuto) {
              that.$newElement.toggleClass('dropup', selectOffsetTop > selectOffsetBot && (menuHeight - menuExtras) < getHeight);
            }
            if (that.$newElement.hasClass('dropup')) {
              menuHeight = selectOffsetTop - menuExtras;
            }

            if ((lisVisible.length + optGroup.length) > 3) {
              minHeight = liHeight * 3 + menuExtras - 2;
            } else {
              minHeight = 0;
            }

            $menu.css({
              'max-height': menuHeight + 'px',
              'overflow': 'hidden',
              'min-height': minHeight + headerHeight + searchHeight + actionsHeight + doneButtonHeight + 'px'
            });
            $menuInner.css({
              'max-height': menuHeight - headerHeight - searchHeight - actionsHeight - doneButtonHeight - menuPadding + 'px',
              'overflow-y': 'auto',
              'min-height': Math.max(minHeight - menuPadding, 0) + 'px'
            });
          };
          getSize();
          this.$searchbox.off('input.getSize propertychange.getSize').on('input.getSize propertychange.getSize', getSize);
          $window.off('resize.getSize scroll.getSize').on('resize.getSize scroll.getSize', getSize);
        } else if (this.options.size && this.options.size != 'auto' && this.$lis.not(notDisabled).length > this.options.size) {
          var optIndex = this.$lis.not('.divider').not(notDisabled).children().slice(0, this.options.size).last().parent().index(),
            divLength = this.$lis.slice(0, optIndex + 1).filter('.divider').length;
          menuHeight = liHeight * this.options.size + divLength * divHeight + menuPadding;

          if (that.options.container) {
            if (!$menu.data('height')) $menu.data('height', $menu.height());
            getHeight = $menu.data('height');
          } else {
            getHeight = $menu.height();
          }

          if (that.options.dropupAuto) {
            // noinspection JSUnusedAssignment
            this.$newElement.toggleClass('dropup', selectOffsetTop > selectOffsetBot && (menuHeight - menuExtras) < getHeight);
          }
          $menu.css({
            'max-height': menuHeight + headerHeight + searchHeight + actionsHeight + doneButtonHeight + 'px',
            'overflow': 'hidden',
            'min-height': ''
          });
          $menuInner.css({
            'max-height': menuHeight - menuPadding + 'px',
            'overflow-y': 'auto',
            'min-height': ''
          });
        }
      },

      setWidth: function () {
        if (this.options.width === 'auto') {
          this.$menu.css('min-width', '0');

          // Get correct width if element is hidden
          var $selectClone = this.$menu.parent().clone().appendTo('body'),
            $selectClone2 = this.options.container ? this.$newElement.clone().appendTo('body') : $selectClone,
            ulWidth = $selectClone.children('.dropdown-menu').outerWidth(),
            btnWidth = $selectClone2.css('width', 'auto').children('button').outerWidth();

          $selectClone.remove();
          $selectClone2.remove();

          // Set width to whatever's larger, button title or longest option
          this.$newElement.css('width', Math.max(ulWidth, btnWidth) + 'px');
        } else if (this.options.width === 'fit') {
          // Remove inline min-width so width can be changed from 'auto'
          this.$menu.css('min-width', '');
          this.$newElement.css('width', '').addClass('fit-width');
        } else if (this.options.width) {
          // Remove inline min-width so width can be changed from 'auto'
          this.$menu.css('min-width', '');
          this.$newElement.css('width', this.options.width);
        } else {
          // Remove inline min-width/width so width can be changed
          this.$menu.css('min-width', '');
          this.$newElement.css('width', '');
        }
        // Remove fit-width class if width is changed programmatically
        if (this.$newElement.hasClass('fit-width') && this.options.width !== 'fit') {
          this.$newElement.removeClass('fit-width');
        }
      },

      selectPosition: function () {
        var that = this,
          drop = '<div />',
          $drop = $(drop),
          pos,
          actualHeight,
          getPlacement = function ($element) {
            $drop.addClass($element.attr('class').replace(/form-control|fit-width/gi, '')).toggleClass('dropup', $element.hasClass('dropup'));
            pos = $element.offset();
            actualHeight = $element.hasClass('dropup') ? 0 : $element[0].offsetHeight;
            $drop.css({
              'top': pos.top + actualHeight,
              'left': pos.left,
              'width': $element[0].offsetWidth,
              'position': 'absolute'
            });
          };

        this.$newElement.on('click', function () {
          if (that.isDisabled()) {
            return;
          }
          getPlacement($(this));
          $drop.appendTo(that.options.container);
          $drop.toggleClass('open', !$(this).hasClass('open'));
          $drop.append(that.$menu);
        });

        $(window).on('resize scroll', function () {
          getPlacement(that.$newElement);
        });

        this.$element.on('hide.bs.select', function () {
          that.$menu.data('height', that.$menu.height());
          $drop.detach();
        });
      },

      setSelected: function (index, selected, $lis) {
        if (!$lis) {
          var $lis = this.findLis().eq(this.liObj[index]);
        }

        $lis.toggleClass('selected', selected);
      },

      setDisabled: function (index, disabled, $lis) {
        if (!$lis) {
          var $lis = this.findLis().eq(this.liObj[index]);
        }

        if (disabled) {
          $lis.addClass('disabled').children('a').attr('href', '#').attr('tabindex', -1);
        } else {
          $lis.removeClass('disabled').children('a').removeAttr('href').attr('tabindex', 0);
        }
      },

      isDisabled: function () {
        return this.$element[0].disabled;
      },

      checkDisabled: function () {
        var that = this;

        if (this.isDisabled()) {
          this.$newElement.addClass('disabled');
          this.$button.addClass('disabled').attr('tabindex', -1);
        } else {
          if (this.$button.hasClass('disabled')) {
            this.$newElement.removeClass('disabled');
            this.$button.removeClass('disabled');
          }

          if (this.$button.attr('tabindex') == -1 && !this.$element.data('tabindex')) {
            this.$button.removeAttr('tabindex');
          }
        }

        this.$button.click(function () {
          return !that.isDisabled();
        });
      },

      tabIndex: function () {
        if (this.$element.is('[tabindex]')) {
          this.$element.data('tabindex', this.$element.attr('tabindex'));
          this.$button.attr('tabindex', this.$element.data('tabindex'));
        }
      },

      clickListener: function () {
        var that = this,
          $document = $(document);

        this.$newElement.on('touchstart.dropdown', '.dropdown-menu', function (e) {
          e.stopPropagation();
        });

        $document.data('spaceSelect', false);

        this.$button.on('keyup', function (e) {
          if (/(32)/.test(e.keyCode.toString(10)) && $document.data('spaceSelect')) {
            e.preventDefault();
            $document.data('spaceSelect', false);
          }
        });

        this.$newElement.on('click', function () {
          that.setSize();
          that.$element.on('shown.bs.select', function () {
            if (!that.options.liveSearch && !that.multiple) {
              that.$menu.find('.selected a').focus();
            } else if (!that.multiple) {
              var selectedIndex = that.liObj[that.$element[0].selectedIndex];

              if (typeof selectedIndex !== 'number') return;

              // scroll to selected option
              var offset = that.$lis.eq(selectedIndex)[0].offsetTop - that.$menuInner[0].offsetTop;
              offset = offset - that.$menuInner[0].offsetHeight / 2 + that.sizeInfo.liHeight / 2;
              that.$menuInner[0].scrollTop = offset;
            }
          });
        });

        this.$menu.on('click', 'li a', function (e) {
          var $this = $(this),
            clickedIndex = $this.parent().data('originalIndex'),
            prevValue = that.$element.val(),
            prevIndex = that.$element.prop('selectedIndex');
          // Don't close on multi choice menu
          if (that.multiple) {
            e.stopPropagation();
          }

          e.preventDefault();

          // Don't run if we have been disabled
          if (!that.isDisabled() && !$this.parent().hasClass('disabled')) {
            var $options = that.$element.find('option'),
              $option = $options.eq(clickedIndex),
              state = $option.prop('selected'),
              $optgroup = $option.parent('optgroup'),
              maxOptions = that.options.maxOptions,
              maxOptionsGrp = $optgroup.data('maxOptions') || false;
            if (!that.multiple) { // Deselect all others if not multi select box
              $options.prop('selected', false);
              $option.prop('selected', true);
              that.$menu.find('.selected').removeClass('selected');
              that.setSelected(clickedIndex, true);
            } else { // Toggle the one we have chosen if we are multi select.
              $option.prop('selected', !state);
              that.setSelected(clickedIndex, !state);
              $this.blur();
              if (maxOptions !== false || maxOptionsGrp !== false) {
                var maxReached = maxOptions < $options.filter(':selected').length,
                  maxReachedGrp = maxOptionsGrp < $optgroup.find('option:selected').length;

                if ((maxOptions && maxReached) || (maxOptionsGrp && maxReachedGrp)) {
                  if (maxOptions && maxOptions == 1) {
                    $options.prop('selected', false);
                    $option.prop('selected', true);
                    that.$menu.find('.selected').removeClass('selected');
                    that.setSelected(clickedIndex, true);
                  } else if (maxOptionsGrp && maxOptionsGrp == 1) {
                    $optgroup.find('option:selected').prop('selected', false);
                    $option.prop('selected', true);
                    var optgroupID = $this.parent().data('optgroup');
                    that.$menu.find('[data-optgroup="' + optgroupID + '"]').removeClass('selected');
                    that.setSelected(clickedIndex, true);
                  } else {
                    var maxOptionsArr = (typeof that.options.maxOptionsText === 'function')
                      ? that.options.maxOptionsText(maxOptions, maxOptionsGrp) : that.options.maxOptionsText,
                      maxTxt = maxOptionsArr[0].replace('{n}', maxOptions),
                      maxTxtGrp = maxOptionsArr[1].replace('{n}', maxOptionsGrp),
                      $notify = $('<div class="notify"></div>');
                    // If {var} is set in array, replace it
                    /** @deprecated */
                    if (maxOptionsArr[2]) {
                      maxTxt = maxTxt.replace('{var}', maxOptionsArr[2][maxOptions > 1 ? 0 : 1]);
                      maxTxtGrp = maxTxtGrp.replace('{var}', maxOptionsArr[2][maxOptionsGrp > 1 ? 0 : 1]);
                    }

                    $option.prop('selected', false);

                    that.$menu.append($notify);

                    if (maxOptions && maxReached) {
                      $notify.append($('<div>' + maxTxt + '</div>'));
                      that.$element.trigger('maxReached.bs.select');
                    }

                    if (maxOptionsGrp && maxReachedGrp) {
                      $notify.append($('<div>' + maxTxtGrp + '</div>'));
                      that.$element.trigger('maxReachedGrp.bs.select');
                    }

                    setTimeout(function () {
                      that.setSelected(clickedIndex, false);
                    }, 10);

                    $notify.delay(750).fadeOut(300, function () {
                      $(this).remove();
                    });
                  }
                }
              }
            }

            if (!that.multiple) {
              that.$button.focus();
            } else if (that.options.liveSearch) {
              that.$searchbox.focus();
            }

            // Trigger select 'change'
            if ((prevValue !== that.$element.val() && that.multiple) || (prevIndex !== that.$element.prop('selectedIndex') && !that.multiple)) {
              that.$element.change();
              // $option.prop('selected') is current option state (selected/unselected). state is previous option state.
              that.$element.trigger('changed.bs.select', [clickedIndex, $option.prop('selected'), state]);
            }
          }
        });

        this.$menu.on('click', 'li.disabled a, .popover-title, .popover-title :not(.close)', function (e) {
          if (e.currentTarget == this) {
            e.preventDefault();
            e.stopPropagation();
            if (that.options.liveSearch && !$(e.target).hasClass('close')) {
              that.$searchbox.focus();
            } else {
              that.$button.focus();
            }
          }
        });

        this.$menu.on('click', 'li.divider, li.dropdown-header', function (e) {
          e.preventDefault();
          e.stopPropagation();
          if (that.options.liveSearch) {
            that.$searchbox.focus();
          } else {
            that.$button.focus();
          }
        });

        this.$menu.on('click', '.popover-title .close', function () {
          that.$button.click();
        });

        this.$searchbox.on('click', function (e) {
          e.stopPropagation();
        });

        this.$menu.on('click', '.actions-btn', function (e) {
          if (that.options.liveSearch) {
            that.$searchbox.focus();
          } else {
            that.$button.focus();
          }

          e.preventDefault();
          e.stopPropagation();

          if ($(this).hasClass('bs-select-all')) {
            that.selectAll();
          } else {
            that.deselectAll();
          }
          that.$element.change();
        });
        this.$element.change(function () {
          that.render(false);
        });
        this.$menu.on('click', '.b-select-create__option', function (e) {
          e.preventDefault();
          e.stopPropagation();
        });
      },

      liveSearchListener: function () {
        var that = this,
          $no_results = $('<li class="no-results"></li>');

        this.$newElement.on('click.dropdown.data-api touchstart.dropdown.data-api', function () {
          that.$menuInner.find('.active').removeClass('active');
          if (that.$searchbox.val()) {
            that.$searchbox.val('');
            that.$lis.not('.is-hidden').removeClass('hidden');
            if ($no_results.parent().length) $no_results.remove();
          }
          if (!that.multiple) that.$menuInner.find('.selected').addClass('active');
          setTimeout(function () {
            that.$searchbox.focus();
          }, 10);
        });

        this.$searchbox.on('click.dropdown.data-api focus.dropdown.data-api touchend.dropdown.data-api', function (e) {
          e.stopPropagation();
        });

        this.$searchbox.on('input propertychange', function () {
          if (that.$searchbox.val()) {
            var $searchBase = that.$lis.not('.is-hidden').removeClass('hidden').children('a');
            if (that.options.liveSearchNormalize) {
              $searchBase = $searchBase.not(':a' + that._searchStyle() + '(' + normalizeToBase(that.$searchbox.val()) + ')');
            } else {
              $searchBase = $searchBase.not(':' + that._searchStyle() + '(' + that.$searchbox.val() + ')');
            }
            $searchBase.parent().addClass('hidden');

            that.$lis.filter('.dropdown-header').each(function () {
              var $this = $(this),
                optgroup = $this.data('optgroup');

              if (that.$lis.filter('[data-optgroup=' + optgroup + ']').not($this).not('.hidden').length === 0) {
                $this.addClass('hidden');
                that.$lis.filter('[data-optgroup=' + optgroup + 'div]').addClass('hidden');
              }
            });

            var $lisVisible = that.$lis.not('.hidden');

            // hide divider if first or last visible, or if followed by another divider
            $lisVisible.each(function (index) {
              var $this = $(this);

              if ($this.hasClass('divider') && (
                  $this.index() === $lisVisible.eq(0).index() ||
                  $this.index() === $lisVisible.last().index() ||
                  $lisVisible.eq(index + 1).hasClass('divider'))) {
                $this.addClass('hidden');
              }
            });

            if (!that.$lis.not('.hidden, .no-results').length) {
              if ($no_results.parent().length) {
                $no_results.remove();
              }
              $no_results.html(that.options.noneResultsText.replace('{0}', '"' + htmlEscape(that.$searchbox.val()) + '"')).show();
              that.$menuInner.append($no_results);
            } else if ($no_results.parent().length) {
              $no_results.remove();
            }
          } else {
            that.$lis.not('.is-hidden').removeClass('hidden');
            if ($no_results.parent().length) {
              $no_results.remove();
            }
          }

          that.$lis.filter('.active').removeClass('active');
          that.$lis.not('.hidden, .divider, .dropdown-header').eq(0).addClass('active').children('a').focus();
          $(this).focus();
        });
      },

      _searchStyle: function () {
        var style = 'icontains';
        switch (this.options.liveSearchStyle) {
          case 'begins':
          case 'startsWith':
            style = 'ibegins';
            break;
          case 'contains':
          default:
            break; // no need to change the default
        }

        return style;
      },

      val: function (value) {
        if (typeof value !== 'undefined') {
          this.$element.val(value);
          this.render();

          return this.$element;
        } else {
          return this.$element.val();
        }
      },

      selectAll: function () {
        this.findLis();
        this.$element.find('option:enabled').not('[data-divider], [data-hidden]').prop('selected', true);
        this.$lis.not('.divider, .dropdown-header, .disabled, .hidden').addClass('selected');
        this.render(false);
      },

      deselectAll: function () {
        this.findLis();
        this.$element.find('option:enabled').not('[data-divider], [data-hidden]').prop('selected', false);
        this.$lis.not('.divider, .dropdown-header, .disabled, .hidden').removeClass('selected');
        this.render(false);
      },

      keydown: function (e) {
        var $this = $(this),
          $parent = $this.is('input') ? $this.parent().parent() : $this.parent(),
          $items,
          that = $parent.data('this'),
          index,
          next,
          first,
          last,
          prev,
          nextPrev,
          prevIndex,
          isActive,
          selector = ':not(.disabled, .hidden, .dropdown-header, .divider)',
          keyCodeMap = {
            32: ' ',
            48: '0',
            49: '1',
            50: '2',
            51: '3',
            52: '4',
            53: '5',
            54: '6',
            55: '7',
            56: '8',
            57: '9',
            59: ';',
            65: 'a',
            66: 'b',
            67: 'c',
            68: 'd',
            69: 'e',
            70: 'f',
            71: 'g',
            72: 'h',
            73: 'i',
            74: 'j',
            75: 'k',
            76: 'l',
            77: 'm',
            78: 'n',
            79: 'o',
            80: 'p',
            81: 'q',
            82: 'r',
            83: 's',
            84: 't',
            85: 'u',
            86: 'v',
            87: 'w',
            88: 'x',
            89: 'y',
            90: 'z',
            96: '0',
            97: '1',
            98: '2',
            99: '3',
            100: '4',
            101: '5',
            102: '6',
            103: '7',
            104: '8',
            105: '9'
          };
        if (that.options.liveSearch) $parent = $this.parent().parent();

        if (that.options.container) $parent = that.$menu;

        $items = $('[role=menu] li a', $parent);

        isActive = that.$menu.parent().hasClass('open');
        if (!isActive && (e.keyCode >= 48 && e.keyCode <= 57 || event.keyCode >= 65 && event.keyCode <= 90)) {
          if (!that.options.container) {
            that.setSize();
            that.$menu.parent().addClass('open');
            isActive = true;
          } else {
            that.$newElement.trigger('click');
          }
          that.$searchbox.focus();
        }

        if (that.options.liveSearch) {
          if (/(^9$|27)/.test(e.keyCode.toString(10)) && isActive && that.$menu.find('.active').length === 0) {
            e.preventDefault();
            that.$menu.parent().removeClass('open');
            if (that.options.container) that.$newElement.removeClass('open');
            that.$button.focus();
          }
          // $items contains li elements when liveSearch is enabled
          $items = $('[role=menu] li:not(.disabled, .hidden, .dropdown-header, .divider)', $parent);
          if (!$this.val() && !/(38|40)/.test(e.keyCode.toString(10))) {
            if ($items.filter('.active').length === 0) {
              $items = that.$newElement.find('li');
              if (that.options.liveSearchNormalize) {
                $items = $items.filter(':a' + that._searchStyle() + '(' + normalizeToBase(keyCodeMap[e.keyCode]) + ')');
              } else {
                $items = $items.filter(':' + that._searchStyle() + '(' + keyCodeMap[e.keyCode] + ')');
              }
            }
          }
        }

        if (!$items.length) return;

        if (/(38|40)/.test(e.keyCode.toString(10))) {
          index = $items.index($items.filter(':focus'));
          first = $items.parent(selector).first().data('originalIndex');
          last = $items.parent(selector).last().data('originalIndex');
          next = $items.eq(index).parent().nextAll(selector).eq(0).data('originalIndex');
          prev = $items.eq(index).parent().prevAll(selector).eq(0).data('originalIndex');
          nextPrev = $items.eq(next).parent().prevAll(selector).eq(0).data('originalIndex');

          if (that.options.liveSearch) {
            $items.each(function (i) {
              if (!$(this).hasClass('disabled')) {
                $(this).data('index', i);
              }
            });
            index = $items.index($items.filter('.active'));
            first = $items.first().data('index');
            last = $items.last().data('index');
            next = $items.eq(index).nextAll().eq(0).data('index');
            prev = $items.eq(index).prevAll().eq(0).data('index');
            nextPrev = $items.eq(next).prevAll().eq(0).data('index');
          }

          prevIndex = $this.data('prevIndex');

          if (e.keyCode == 38) {
            if (that.options.liveSearch) index -= 1;
            if (index != nextPrev && index > prev) index = prev;
            if (index < first) index = first;
            if (index == prevIndex) index = last;
          } else if (e.keyCode == 40) {
            if (that.options.liveSearch) index += 1;
            if (index == -1) index = 0;
            if (index != nextPrev && index < next) index = next;
            if (index > last) index = last;
            if (index == prevIndex) index = first;
          }

          $this.data('prevIndex', index);

          if (!that.options.liveSearch) {
            $items.eq(index).focus();
          } else {
            e.preventDefault();
            if (!$this.hasClass('dropdown-toggle')) {
              $items.removeClass('active').eq(index).addClass('active').children('a').focus();
              $this.focus();
            }
          }
        } else if (!$this.is('input')) {
          var keyIndex = [],
            count,
            prevKey;

          $items.each(function () {
            if (!$(this).parent().hasClass('disabled')) {
              if ($.trim($(this).text().toLowerCase()).substring(0, 1) == keyCodeMap[e.keyCode]) {
                keyIndex.push($(this).parent().index());
              }
            }
          });

          count = $(document).data('keycount');
          count++;
          $(document).data('keycount', count);

          prevKey = $.trim($(':focus').text().toLowerCase()).substring(0, 1);

          if (prevKey != keyCodeMap[e.keyCode]) {
            count = 1;
            $(document).data('keycount', count);
          } else if (count >= keyIndex.length) {
            $(document).data('keycount', 0);
            if (count > keyIndex.length) count = 1;
          }

          $items.eq(keyIndex[count - 1]).focus();
        }

        // Select focused option if "Enter", "Spacebar" or "Tab" (when selectOnTab is true) are pressed inside the menu.
        if ((/(13|32)/.test(e.keyCode.toString(10)) || (/(^9$)/.test(e.keyCode.toString(10)) && that.options.selectOnTab)) && isActive) {
          if (!/(32)/.test(e.keyCode.toString(10))) e.preventDefault();
          if (!that.options.liveSearch) {
            var elem = $(':focus');
            elem.click();
            // Bring back focus for multiselects
            elem.focus();
            // Prevent screen from scrolling if the user hit the spacebar
            e.preventDefault();
            // Fixes spacebar selection of dropdown items in FF & IE
            $(document).data('spaceSelect', true);
          } else if (!/(32)/.test(e.keyCode.toString(10))) {
            that.$menu.find('.active a').click();
            $this.focus();
          }
          $(document).data('keycount', 0);
        }

        if ((/(^9$|27)/.test(e.keyCode.toString(10)) && isActive && (that.multiple || that.options.liveSearch)) || (/(27)/.test(e.keyCode.toString(10)) && !isActive)) {
          that.$menu.parent().removeClass('open');
          if (that.options.container) that.$newElement.removeClass('open');
          that.$button.focus();
        }
      },

      mobile: function () {
        this.$element.addClass('mobile-device').appendTo(this.$newElement);
        if (this.options.container) this.$menu.hide();
      },

      refresh: function () {
        this.$lis = null;
        this.reloadLi();
        this.render();
        this.checkDisabled();
        this.liHeight(true);
        this.setStyle();
        this.setWidth();
        if (this.$lis) this.$searchbox.trigger('propertychange');

        this.$element.trigger('refreshed.bs.select');
      },
      ajaxRequest: function (options) {
        var defaults = {
          idKey: 'id',
          nameKey: 'name',
          url: '',
          param: {},
          type: 'post',
          dataType: 'json',
          template: function (selectObject) {
            return '<option value="' + selectObject[options.idKey] + '">' + selectObject[options.nameKey] + '</option>';
          }
        };
        var options = $.extend(defaults, options);
        var postdata = options.param;
        var select = $(this.$element);
        $.ttyAjax({
          url: options.url,
          type: options.type,
          async: options.async,
          param: postdata,
          success: function (data) {
            var datas = data.resultdata;
            select.html('');
            if (select.hasClass('select-null')) {
              select.append('<option></option>');
            }
            for (var i = 0; i < datas.length; i++) {
              select.append(options.template(data.resultdata[i]));
            }
            $(select).selectpicker('refresh');
          }
        });
      },
      editValue: function (obj) {
        $(this.$element).append('<option value=' + obj.value + '>' + obj.name + '</option>');
      },
      edit: function (fn) {
        this.$menu.on('click', '.b-select-create__option', fn);
      },

      hide: function () {
        this.$newElement.hide();
      },

      show: function () {
        this.$newElement.show();
      },

      remove: function () {
        this.$newElement.remove();
        this.$element.remove();
      }
    };

    // SELECTPICKER PLUGIN DEFINITION
    // ==============================
    function Plugin(option, event) {
      // get the args of the outer function..
      var args = arguments;
      // The arguments of the function are explicitly re-defined from the argument list, because the shift causes them
      // to get lost/corrupted in android 2.3 and IE9 #715 #775
      var _option = option,
        _event = event;
      [].shift.apply(args);

      var value;
      var chain = this.each(function () {
        var $this = $(this);
        if ($this.is('select')) {
          var data = $this.data('selectpicker'),
            options = typeof _option === 'object' && _option;

          if (!data) {
            var config = $.extend({}, Selectpicker.DEFAULTS, $.fn.selectpicker.defaults || {}, $this.data(), options);
            $this.data('selectpicker', (data = new Selectpicker(this, config, _event)));
          } else if (options) {
            for (var i in options) {
              if (options.hasOwnProperty(i)) {
                data.options[i] = options[i];
              }
            }
          }

          if (typeof _option === 'string') {
            if (data[_option] instanceof Function) {
              value = data[_option].apply(data, args);
            } else {
              value = data.options[_option];
            }
          }
        }
      });

      if (typeof value !== 'undefined') {
        // noinspection JSUnusedAssignment
        return value;
      } else {
        return chain;
      }
    }

    var old = $.fn.selectpicker;
    $.fn.selectpicker = Plugin;
    $.fn.selectpicker.Constructor = Selectpicker;

    // SELECTPICKER NO CONFLICT
    // ========================
    $.fn.selectpicker.noConflict = function () {
      $.fn.selectpicker = old;
      return this;
    };
    $(document)
      .data('keycount', 0)
      .on('keydown', '.bootstrap-select [data-toggle=dropdown], .bootstrap-select [role="menu"], .bs-searchbox input', Selectpicker.prototype.keydown)
      .on('focusin.modal', '.bootstrap-select [data-toggle=dropdown], .bootstrap-select [role="menu"], .bs-searchbox input', function (e) {
        e.stopPropagation();
      });
    // SELECTPICKER DATA-API
    // =====================
    $(window).on('load.bs.select.data-api', function () {
      $('.selectpicker').each(function () {
        var $selectpicker = $(this);
        Plugin.call($selectpicker, $selectpicker.data());
      });
    });
  })(jQuery);
}));

/******/
(function (modules) { // webpackBootstrap
  /******/ // The module cache
  /******/
  var installedModules = {};

  /******/ // The require function
  /******/
  function __webpack_require__(moduleId) {
    /******/ // Check if module is in cache
    /******/
    if (installedModules[moduleId]) {
      return installedModules[moduleId].exports;
    }

    /******/ // Create a new module (and put it into the cache)
    /******/
    var module = installedModules[moduleId] = {
      /******/
      exports: {},
      /******/
      id: moduleId,
      /******/
      loaded: false
      /******/
    };

    /******/ // Execute the module function
    /******/
    modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

    /******/ // Flag the module as loaded
    /******/
    module.loaded = true;

    /******/ // Return the exports of the module
    /******/
    return module.exports;
    /******/
  }

  /******/ // expose the modules object (__webpack_modules__)
  /******/
  __webpack_require__.m = modules;

  /******/ // expose the module cache
  /******/
  __webpack_require__.c = installedModules;

  /******/ // __webpack_public_path__
  /******/
  __webpack_require__.p = '';

  /******/ // Load entry module and return exports
  /******/
  return __webpack_require__(0);
  /******/
})([
  /* 0 */
  /***/
  function (module, exports, __webpack_require__) {
    'use strict';

    var _createClass = (function () {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ('value' in descriptor) descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }
      return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
      };
    }());

    /*
     *  GridManager: 入口
     * */
    var _jTool = __webpack_require__(1);

    var _jTool2 = _interopRequireDefault(_jTool);

    var _Adjust = __webpack_require__(3);

    var _Adjust2 = _interopRequireDefault(_Adjust);

    var _AjaxPage = __webpack_require__(6);

    var _AjaxPage2 = _interopRequireDefault(_AjaxPage);

    var _Base = __webpack_require__(5);

    var _Base2 = _interopRequireDefault(_Base);

    var _Cache = __webpack_require__(4);

    var _Cache2 = _interopRequireDefault(_Cache);

    var _Core = __webpack_require__(7);

    var _Core2 = _interopRequireDefault(_Core);

    var _Config = __webpack_require__(11);

    var _Config2 = _interopRequireDefault(_Config);

    var _Checkbox = __webpack_require__(12);

    var _Checkbox2 = _interopRequireDefault(_Checkbox);

    var _Drag = __webpack_require__(16);

    var _Drag2 = _interopRequireDefault(_Drag);

    var _Export = __webpack_require__(10);

    var _Export2 = _interopRequireDefault(_Export);

    var _I18n = __webpack_require__(9);

    var _I18n2 = _interopRequireDefault(_I18n);

    var _Menu = __webpack_require__(8);

    var _Menu2 = _interopRequireDefault(_Menu);

    var _Order = __webpack_require__(13);

    var _Order2 = _interopRequireDefault(_Order);

    var _Remind = __webpack_require__(14);

    var _Remind2 = _interopRequireDefault(_Remind);

    var _Scroll = __webpack_require__(17);

    var _Scroll2 = _interopRequireDefault(_Scroll);

    var _Sort = __webpack_require__(15);

    var _Sort2 = _interopRequireDefault(_Sort);

    var _Settings = __webpack_require__(18);

    var _Hover = __webpack_require__(19);

    var _Publish = __webpack_require__(20);

    var _RowClick = __webpack_require__(21);

    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : {
        default: obj
      };
    }

    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function');
      }
    }

    var GridManager = (function () {
      function GridManager() {
        _classCallCheck(this, GridManager);

        this.version = '2.3.14';
        this.extentGridManager();
      }

      /*
       * [对外公开方法]
       * @初始化方法
       * $.jToolObj: table [jTool object]
       * $.arg: 参数
       * $.callback:回调
       * */
      _createClass(GridManager, [{
        key: 'init',
        value: function init(jToolObj, arg, callback) {
          var _this = this;
          if (typeof arg.gridManagerName !== 'string' || arg.gridManagerName.trim() === '') {
            arg.gridManagerName = jToolObj.attr('grid-manager'); // 存储gridManagerName值
          }
          // 配置参数
          var _settings = _jTool2.default.extend(true, {}, _Settings.Settings);
          _settings.textConfig = new _Settings.TextSettings();
          _jTool2.default.extend(true, _settings, arg);
          _this.updateSettings(jToolObj, _settings);

          _jTool2.default.extend(true, this, _settings);

          // 通过版本较验 清理缓存
          _this.cleanTableCacheForVersion(jToolObj, this.version);
          if (_this.gridManagerName.trim() === '') {
            _this.outLog('请在html标签中为属性[grid-manager]赋值或在配置项中配置gridManagerName', 'error');
            return false;
          }

          // 验证当前表格是否已经渲染
          if (jToolObj.hasClass('GridManager-ready') || jToolObj.hasClass('GridManager-loading')) {
            _this.outLog('渲染失败：可能该表格已经渲染或正在渲染', 'error');
            return false;
          }

          // 根据本地缓存配置每页显示条数
          if (_this.supportAjaxPage) {
            _this.configPageForCache(jToolObj);
          }

          // 增加渲染中标注
          jToolObj.addClass('GridManager-loading');

          // 初始化表格
          _this.initTable(jToolObj);
          // 如果初始获取缓存失败，在渲染完成后首先存储一次数据
          if (typeof jToolObj.attr('grid-manager-cache-error') !== 'undefined') {
            window.setTimeout(function () {
              _this.saveUserMemory(jToolObj, true);
              jToolObj.removeAttr('grid-manager-cache-error');
            }, 1000);
          }

          // 启用回调
          typeof callback === 'function' ? callback(_this.query) : '';
          return jToolObj;
        }
        /*
           @初始化列表
           $.table: table[jTool object]
           */

      }, {
        key: 'initTable',
        value: function initTable(table) {
          var _this = this;
          // 渲染HTML，嵌入所需的事件源DOM
          _Core2.default.createDOM(table);

          // 获取本地缓存并对列表进行配置
          if (!_this.disableCache) {
            _this.configTheadForCache(table);
            _this.supportAdjust ? _this.resetAdjust(table) : ''; // 通过缓存配置成功后, 重置宽度调整事件源dom
          }

          // 绑定选择和反选事件
          if (_this.supportCheckbox) {
            _this.bindCheckboxEvent(table);
          }

          // 绑定宽度调整事件
          if (_this.supportAdjust) {
            _this.bindAdjustEvent(table);
          }

          // 绑定拖拽换位事件
          if (_this.supportDrag) {
            _this.bindDragEvent(table);
          }

          // 绑定排序事件
          if (_this.supportSorting) {
            _this.bindSortingEvent(table);
          }

          // 绑定表头提示事件
          if (_this.supportRemind) {
            _this.bindRemindEvent(table);
          }

          // 绑定配置列表事件
          if (_this.supportConfig) {
            _this.bindConfigEvent(table);
          }

          // 绑定table区域hover事件
          _this.onTbodyHover(table);

          // 绑定table区域行点击事件
          _this.onRowClick(table);

          // 绑定表头置顶功能
          _this.bindScrollFunction(table);

          // 绑定右键菜单事件
          _this.bindRightMenuEvent(table);

          // 渲染tbodyDOM
          _this.__refreshGrid(table);

          // 将GridManager实例化对象存放于jTool data
          _this.setGridManagerToJTool(table);
        }

        // 拼装GirdManager
      }, {
        key: 'extentGridManager',
        value: function extentGridManager() {
          // GM导入功能: 配置项
          _jTool2.default.extend(true, this, _Settings.Settings);

          // GM导入功能: 基本
          _jTool2.default.extend(this, _Base2.default);

          // GM导入功能: 核心
          _jTool2.default.extend(this, _Core2.default);

          // GM导入功能: 鼠标
          _jTool2.default.extend(this, _Hover.Hover);

          // GM导入功能: 行点击
          _jTool2.default.extend(this, _RowClick.RowClick);

          // GM导入功能: 选择
          _jTool2.default.extend(this, _Checkbox2.default);

          // GM导入功能: 缓存
          _jTool2.default.extend(this, _Cache2.default);

          // GM导入功能: 宽度调整
          _jTool2.default.extend(this, _Adjust2.default);

          // GM导入功能: 分页
          _jTool2.default.extend(this, _AjaxPage2.default);

          // GM导入功能: 配置列显示隐藏
          _jTool2.default.extend(this, _Config2.default);

          // GM导入功能: 拖拽
          _jTool2.default.extend(this, _Drag2.default);

          // GM导入功能: 排序
          _jTool2.default.extend(this, _Sort2.default);

          // GM导入功能: 导出数据
          _jTool2.default.extend(this, _Export2.default);

          // GM导入功能: 国际化
          _jTool2.default.extend(this, _I18n2.default);

          // GM导入功能: 右键菜单
          _jTool2.default.extend(this, _Menu2.default);

          // GM导入功能: 序号
          _jTool2.default.extend(this, _Order2.default);

          // GM导入功能: 表头提示
          _jTool2.default.extend(this, _Remind2.default);

          // GM导入功能: 表头吸顶
          _jTool2.default.extend(this, _Scroll2.default);

          // GM导入功能: 公开方法
          _jTool2.default.extend(this, _Publish.PublishMethod);
        }
      }]);

      return GridManager;
    }());

    /*
     *  捆绑至选择器对象
     * */

    (function ($) {
      Element.prototype.GM = Element.prototype.GridManager = function () {
        var $table = $(this);
        // 特殊情况处理：单组tr进行操作，如resetTd()方法
        if (this.nodeName === 'TR') {
          return;
        }
        var name = void 0; // 方法名
        var settings = void 0; // 参数
        var callback = void 0; // 回调函数
        var condition = void 0; // 条件
        // 格式化参数
        // ex: document.querySelector('table').GridManager()
        if (arguments.length === 0) {
          name = 'init';
          settings = {};
          callback = undefined;
        }
        // ex: document.querySelector('table').GridManager({settings}, callback)
        else if ($.type(arguments[0]) !== 'string') {
          name = 'init';
          settings = arguments[0];
          callback = arguments[1];
        }
        // ex: document.querySelector('table').GridManager('get')
        // ex: document.querySelector('table').GM('showTh', $th);
        // ex: document.querySelector('table').GM('setSort',sortJson,callback, refresh);
        else {
          name = arguments[0];
          settings = arguments[1];
          callback = arguments[2];
          condition = arguments[3];
        }

        if (_Publish.publishMethodArray.indexOf(name) === -1) {
          throw new Error('GridManager Error:方法调用错误，请确定方法名[' + name + ']是否正确');
        }
        var gmObj = void 0;
        // 当前为初始化方法
        if (name === 'init') {
          var _GM = new GridManager();
          _GM.init($table, settings, callback);
          return _GM;
        } else if (name !== 'init') { // 当前为其它方法
          gmObj = $table.data('gridManager');
          var gmData = gmObj[name]($table, settings, callback, condition);
          // 如果方法存在返回值则返回，如果没有返回dom, 用于链式操作
          return typeof gmData === 'undefined' ? this : gmData;
        }
      };
    })(_jTool2.default);

    /*
     * 兼容jquery
     * */
    (function () {
      if (typeof jQuery !== 'undefined' && jQuery.fn.extend) {
        jQuery.fn.extend({
          GM: function GM() {
            if (arguments.length === 0) {
              return this.get(0).GM();
            } else if (arguments.length === 1) {
              return this.get(0).GM(arguments[0]);
            } else if (arguments.length === 2) {
              return this.get(0).GM(arguments[0], arguments[1]);
            } else if (arguments.length === 3) {
              return this.get(0).GM(arguments[0], arguments[1], arguments[2]);
            }
          },
          GridManager: function GridManager() {
            if (arguments.length === 0) {
              return this.get(0).GridManager();
            } else if (arguments.length === 1) {
              return this.get(0).GridManager(arguments[0]);
            } else if (arguments.length === 2) {
              return this.get(0).GridManager(arguments[0], arguments[1]);
            } else if (arguments.length === 3) {
              return this.get(0).GridManager(arguments[0], arguments[1], arguments[2]);
            }
          }
        });
      }
    })();
    // 恢复jTool占用的$变量
    (function () {
      window.$ = window._$ || undefined;
    })();

    /***/
  },
  /* 1 */
  /***/
  function (module, exports, __webpack_require__) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
      value: true
    });

    __webpack_require__(2);

    var $ = jTool;
    /**
     * jTool: export jTool
     */
    exports.default = $;

    /***/
  },
  /* 2 */
  /***/
  function (module, exports, __webpack_require__) {
    var require;
    (function t(e, n, o) {
      function i(s, u) {
        if (!n[s]) {
          if (!e[s]) {
            var a = typeof require === 'function' && require;
            if (!u && a) return require(s, !0);
            if (r) return r(s, !0);
            var c = new Error("Cannot find module '" + s + "'");
            throw c.code = 'MODULE_NOT_FOUND', c;
          }
          var l = n[s] = {
            exports: {}
          };
          e[s][0].call(l.exports, function (t) {
            var n = e[s][1][t];
            return i(n || t);
          }, l, l.exports, t, e, n, o);
        }
        return n[s].exports;
      }
      for (var r = typeof require === 'function' && require, s = 0; s < o.length; s++) i(o[s]);
      return i;
    })({
      1: [function (t, e) {
        var n = t('./utilities'),
          o = t('../src/Css'),
          i = {
            show: function () {
              return n.each(this.DOMList, function (t, e) {
                var n = '',
                  o = ['SPAN', 'A', 'FONT', 'I'];
                if (e.nodeName.indexOf(o) !== -1) return e.style.display = 'inline-block', this;
                switch (e.nodeName) {
                  case 'TABLE':
                    n = 'table';
                    break;
                  case 'THEAD':
                    n = 'table-header-group';
                    break;
                  case 'TBODY':
                    n = 'table-row-group';
                    break;
                  case 'TR':
                    n = 'table-row';
                    break;
                  case 'TH':
                    n = 'table-cell';
                    break;
                  case 'TD':
                    n = 'table-cell';
                    break;
                  default:
                    n = 'block';
                }
                e.style.display = n;
              }), this;
            },
            hide: function () {
              return n.each(this.DOMList, function (t, e) {
                e.style.display = 'none';
              }), this;
            },
            animate: function (t, e, i) {
              var r = this,
                s = '',
                u = '',
                a = r.DOMList[0];
              if (t) {
                n.type(i) === 'undefined' && n.type(e) === 'function' && (i = e, e = 0), n.type(i) === 'undefined' && (i = n.noop), n.type(e) === 'undefined' && (e = 0), n.each(t, function (t, e) {
                  t = n.toHyphen(t), s += t + ':' + n.getStyle(a, t) + ';', u += t + ':' + e + ';';
                });
                var c = '@keyframes jToolAnimate {from {' + s + '}to {' + u + '}}',
                  l = document.createElement('style');
                l.className = 'jTool-animate-style', l.type = 'text/css', document.head.appendChild(l), l.textContent = l.textContent + c, a.style.animation = 'jToolAnimate ' + e / 1e3 + 's ease-in-out forwards', window.setTimeout(function () {
                  o.css.call(r, t), a.style.animation = '', l.remove(), i();
                }, e);
              }
            }
          };
        e.exports = i;
      }, {
        '../src/Css': 3,
        './utilities': 13
      }],
      2: [function (t, e) {
        var n = t('./utilities'),
          o = {
            addClass: function (t) {
              return this.changeClass(t, 'add');
            },
            removeClass: function (t) {
              return this.changeClass(t, 'remove');
            },
            toggleClass: function (t) {
              return this.changeClass(t, 'toggle');
            },
            hasClass: function (t) {
              return [].some.call(this.DOMList, function (e) {
                return e.classList.contains(t);
              });
            },
            parseClassName: function (t) {
              return t.indexOf(' ') ? t.split(' ') : [t];
            },
            changeClass: function (t, e) {
              var o = this.parseClassName(t);
              return n.each(this.DOMList, function (t, i) {
                n.each(o, function (t, n) {
                  i.classList[e](n);
                });
              }), this;
            }
          };
        e.exports = o;
      }, {
        './utilities': 13
      }],
      3: [function (t, e) {
        var n = t('./utilities'),
          o = {
            css: function (t, e) {
              function o(t, e) {
                n.type(e) === 'number' && (e = e.toString()), r.indexOf(t) !== -1 && e.indexOf('px') === -1 && (e += 'px'), n.each(i.DOMList, function (n, o) {
                  o.style[t] = e;
                });
              }
              var i = this,
                r = ['width', 'height', 'min-width', 'max-width', 'min-height', 'min-height', 'top', 'left', 'right', 'bottom', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left', 'border-width', 'border-top-width', 'border-left-width', 'border-right-width', 'border-bottom-width'];
              if (n.type(t) === 'string' && !e && e !== 0) {
                return r.indexOf(t) !== -1 ? parseInt(n.getStyle(this.DOMList[0], t), 10) : n.getStyle(this.DOMList[0], t);
              }
              if (n.type(t) === 'object') {
                var s = t;
                for (var u in s) o(u, s[u]);
              } else o(t, e);
              return this;
            },
            width: function (t) {
              return this.css('width', t);
            },
            height: function (t) {
              return this.css('height', t);
            }
          };
        e.exports = o;
      }, {
        './utilities': 13
      }],
      4: [function (t, e) {
        var n = t('./utilities'),
          o = {
            dataKey: 'jTool' + n.version,
            data: function (t, e) {
              var o = this,
                i = {};
              if (typeof t === 'undefined' && typeof e === 'undefined') return o.DOMList[0][o.dataKey];
              if (typeof e !== 'undefined') {
                var r = n.type(e);
                return (r === 'string' || r === 'number') && o.attr(t, e), n.each(o.DOMList, function (n, r) {
                  i = r[o.dataKey] || {}, i[t] = e, r[o.dataKey] = i;
                }), this;
              }
              return i = o.DOMList[0][o.dataKey] || {}, this.transformValue(i[t] || o.attr(t));
            },
            removeData: function (t) {
              var e, o = this;
              typeof t !== 'undefined' && (n.each(o.DOMList, function (n, i) {
                e = i[o.dataKey] || {}, delete e[t];
              }), o.removeAttr(t));
            },
            attr: function (t, e) {
              return typeof t === 'undefined' && typeof e === 'undefined' ? '' : typeof e !== 'undefined' ? (n.each(this.DOMList, function (n, o) {
                o.setAttribute(t, e);
              }), this) : this.transformValue(this.DOMList[0].getAttribute(t));
            },
            removeAttr: function (t) {
              typeof t !== 'undefined' && n.each(this.DOMList, function (e, n) {
                n.removeAttribute(t);
              });
            },
            prop: function (t, e) {
              return typeof t === 'undefined' && typeof e === 'undefined' ? '' : typeof e !== 'undefined' ? (n.each(this.DOMList, function (n, o) {
                o[t] = e;
              }), this) : this.transformValue(this.DOMList[0][t]);
            },
            removeProp: function (t) {
              typeof t !== 'undefined' && n.each(this.DOMList, function (e, n) {
                delete n[t];
              });
            },
            val: function (t) {
              return this.prop('value', t) || '';
            },
            transformValue: function (t) {
              return n.type(t) === 'null' && (t = void 0), t;
            }
          };
        e.exports = o;
      }, {
        './utilities': 13
      }],
      5: [function (t, e) {
        var n = t('./utilities'),
          o = t('./Sizzle'),
          i = {
            append: function (t) {
              return this.html(t, 'append');
            },
            prepend: function (t) {
              return this.html(t, 'prepend');
            },
            before: function (t) {
              t.jTool && (t = t.DOMList[0]);
              var e = this.DOMList[0],
                n = e.parentNode;
              return n.insertBefore(t, e), this;
            },
            after: function (t) {
              t.jTool && (t = t.DOMList[0]);
              var e = this.DOMList[0],
                n = e.parentNode;
              n.lastChild === e ? n.appendChild(t) : n.insertBefore(t, e.nextSibling);
            },
            text: function (t) {
              return typeof t !== 'undefined' ? (n.each(this.DOMList, function (e, n) {
                n.textContent = t;
              }), this) : this.DOMList[0].textContent;
            },
            html: function (t, e) {
              if (typeof t === 'undefined' && typeof e === 'undefined') return this.DOMList[0].innerHTML;
              var o = this,
                i = n.type(t);
              t.jTool ? t = t.DOMList : i === 'string' ? t = n.createDOM(t || '') : i === 'element' && (t = [t]);
              var r;
              return n.each(o.DOMList, function (o, i) {
                e ? e === 'prepend' && (r = i.firstChild) : i.innerHTML = '', n.each(t, function (t, e) {
                  e = e.cloneNode(!0), e.nodeType || (e = document.createTextNode(e)), r ? i.insertBefore(e, r) : i.appendChild(e), i.normalize();
                });
              }), this;
            },
            wrap: function (t) {
              var e;
              return n.each(this.DOMList, function (n, i) {
                e = i.parentNode;
                var r = new o(t, i.ownerDocument).get(0);
                e.insertBefore(r, i), r.querySelector(':empty').appendChild(i);
              }), this;
            },
            closest: function (t) {
              function e() {
                return n && i.length !== 0 && n.nodeType === 1 ? void([].indexOf.call(i, n) === -1 && (n = n.parentNode, e())) : void(n = null);
              }
              var n = this.DOMList[0].parentNode;
              if (typeof t === 'undefined') return new o(n);
              var i = document.querySelectorAll(t);
              return e(), new o(n);
            },
            parent: function () {
              return this.closest();
            },
            clone: function (t) {
              return new o(this.DOMList[0].cloneNode(t || !1));
            },
            remove: function () {
              n.each(this.DOMList, function (t, e) {
                e.remove();
              });
            }
          };
        e.exports = i;
      }, {
        './Sizzle': 9,
        './utilities': 13
      }],
      6: [function (t, e) {
        var n = t('./Sizzle'),
          o = {
            get: function (t) {
              return this.DOMList[t];
            },
            eq: function (t) {
              return new n(this.DOMList[t]);
            },
            find: function (t) {
              return new n(t, this);
            },
            index: function (t) {
              var e = this.DOMList[0];
              return t ? t.jTool && (t = t.DOMList) : t = e.parentNode.childNodes, t ? [].indexOf.call(t, e) : -1;
            }
          };
        e.exports = o;
      }, {
        './Sizzle': 9
      }],
      7: [function (t, e) {
        var n = t('./utilities'),
          o = {
            on: function (t, e, n, o) {
              return this.addEvent(this.getEventObject(t, e, n, o));
            },
            off: function (t, e) {
              return this.removeEvent(this.getEventObject(t, e));
            },
            bind: function (t, e, n) {
              return this.on(t, void 0, e, n);
            },
            unbind: function (t) {
              return this.removeEvent(this.getEventObject(t));
            },
            trigger: function (t) {
              return n.each(this.DOMList, function (e, o) {
                try {
                  if (o.jToolEvent && o.jToolEvent[t].length > 0) {
                    var i = new Event(t);
                    o.dispatchEvent(i);
                  } else t !== 'click' ? n.error('预绑定的事件只有click事件可以通过trigger进行调用') : t === 'click' && o[t]();
                } catch (r) {
                  n.error('事件:[' + t + ']未能正确执行, 请确定方法已经绑定成功');
                }
              }), this;
            },
            getEventObject: function (t, e, o, i) {
              if (typeof e === 'function' && (i = o || !1, o = e, e = void 0), !t) return n.error('事件绑定失败,原因: 参数中缺失事件类型'), this;
              if (e && n.type(this.DOMList[0]) === 'element' || (e = ''), e !== '') {
                var r = o;
                o = function (t) {
                  for (var n = t.target; n !== this;) {
                    if ([].indexOf.call(this.querySelectorAll(e), n) !== -1) {
                      r.apply(n, arguments);
                      break;
                    }
                    n = n.parentNode;
                  }
                };
              }
              var s, u, a = t.split(' '),
                c = [];
              return n.each(a, function (t, r) {
                return r.trim() === '' ? !0 : (s = r.split('.'), u = {
                  eventName: r + e,
                  type: s[0],
                  querySelector: e,
                  callback: o || n.noop,
                  useCapture: i || !1,
                  nameScope: s[1] || void 0
                }, void c.push(u));
              }), c;
            },
            addEvent: function (t) {
              var e = this;
              return n.each(t, function (t, o) {
                n.each(e.DOMList, function (t, e) {
                  e.jToolEvent = e.jToolEvent || {}, e.jToolEvent[o.eventName] = e.jToolEvent[o.eventName] || [], e.jToolEvent[o.eventName].push(o), e.addEventListener(o.type, o.callback, o.useCapture);
                });
              }), e;
            },
            removeEvent: function (t) {
              var e, o = this;
              return n.each(t, function (t, i) {
                n.each(o.DOMList, function (t, o) {
                  o.jToolEvent && (e = o.jToolEvent[i.eventName], e && (n.each(e, function (t, e) {
                    o.removeEventListener(e.type, e.callback);
                  }), o.jToolEvent[i.eventName] = void 0));
                });
              }), o;
            }
          };
        e.exports = o;
      }, {
        './utilities': 13
      }],
      8: [function (t, e) {
        var n = t('./utilities'),
          o = {
            offset: function () {
              var t = {
                  top: 0,
                  left: 0
                },
                e = this.DOMList[0];
              if (!e.getClientRects().length) return t;
              if (n.getStyle(e, 'display') === 'none') return t;
              t = e.getBoundingClientRect();
              var o = e.ownerDocument.documentElement;
              return {
                top: t.top + window.pageYOffset - o.clientTop,
                left: t.left + window.pageXOffset - o.clientLeft
              };
            },
            scrollTop: function (t) {
              return this.scrollFN(t, 'top');
            },
            scrollLeft: function (t) {
              return this.scrollFN(t, 'left');
            },
            scrollFN: function (t, e) {
              var n = this.DOMList[0];
              return t || t === 0 ? (this.setScrollFN(n, e, t), this) : this.getScrollFN(n, e);
            },
            getScrollFN: function (t, e) {
              return n.isWindow(t) ? e === 'top' ? t.pageYOffset : t.pageXOffset : t.nodeType === 9 ? e === 'top' ? t.body.scrollTop : t.body.scrollLeft : t.nodeType === 1 ? e === 'top' ? t.scrollTop : t.scrollLeft : void 0;
            },
            setScrollFN: function (t, e, o) {
              return n.isWindow(t) ? e === 'top' ? t.document.body.scrollTop = o : t.document.body.scrollLeft = o : t.nodeType === 9 ? e === 'top' ? t.body.scrollTop = o : t.body.scrollLeft = o : t.nodeType === 1 ? e === 'top' ? t.scrollTop = o : t.scrollLeft = o : void 0;
            }
          };
        e.exports = o;
      }, {
        './utilities': 13
      }],
      9: [function (t, e) {
        var n = t('./utilities'),
          o = function (t, e) {
            var o;
            return t ? n.isWindow(t) ? (o = [t], e = void 0) : t === document ? (o = [document], e = void 0) : t instanceof HTMLElement ? (o = [t], e = void 0) : t instanceof NodeList || t instanceof Array ? (o = t, e = void 0) : t.jTool ? (o = t.DOMList, e = void 0) : /<.+>/.test(t) ? (o = n.createDOM(t), e = void 0) : (e ? e = typeof e === 'string' ? document.querySelectorAll(e) : e instanceof HTMLElement ? [e] : e instanceof NodeList ? e : e.jTool ? e.DOMList : void 0 : o = document.querySelectorAll(t), e && (o = [], n.each(e, function (e, i) {
              n.each(i.querySelectorAll(t), function (t, e) {
                e && o.push(e);
              });
            }))) : t = null, o && o.length !== 0 || (o = void 0), this.jTool = !0, this.DOMList = o, this.length = this.DOMList ? this.DOMList.length : 0, this.querySelector = t, this;
          };
        e.exports = o;
      }, {
        './utilities': 13
      }],
      10: [function (t, e) {
        function n(t) {
          var e = {
            url: null,
            type: 'GET',
            data: null,
            headers: {},
            async: !0,
            beforeSend: s.noop,
            complete: s.noop,
            success: s.noop,
            error: s.noop
          };
          if (t = r(e, t), !t.url) return void s.error('jTool ajax: url不能为空');
          var n = new XMLHttpRequest(),
            o = '';
          s.type(t.data) === 'object' ? s.each(t.data, function (t, e) {
            o !== '' && (o += '&'), o += t + '=' + e;
          }) : o = t.data, t.type.toUpperCase() === 'GET' && o && (t.url = t.url + (t.url.indexOf('?') === -1 ? '?' : '&') + o, o = null), n.open(t.type, t.url, t.async);
          for (var i in t.headers) n.setRequestHeader(i, t.headers[i]);
          t.beforeSend(n), n.onload = function () {
            t.complete(n, n.status);
          }, n.onreadystatechange = function () {
            n.readyState === 4 && (n.status >= 200 && n.status < 300 || n.status === 304 ? t.success(n.response, n.status) : t.error(n, n.status, n.statusText));
          }, n.send(o);
        }

        function o(t, e, o) {
          n({
            url: t,
            type: 'POST',
            data: e,
            success: o
          });
        }

        function i(t, e, o) {
          n({
            url: t,
            type: 'GET',
            data: e,
            success: o
          });
        }
        var r = t('./extend'),
          s = t('./utilities');
        e.exports = {
          ajax: n,
          post: o,
          get: i
        };
      }, {
        './extend': 11,
        './utilities': 13
      }],
      11: [function (t, e) {
        function n() {
          function t(e, i) {
            for (var r in e) e.hasOwnProperty(r) && (n && o.type(e[r]) === 'object' ? (o.type(i[r]) !== 'object' && (i[r] = {}), t(e[r], i[r])) : i[r] = e[r]);
          }
          if (arguments.length === 0) return {};
          var e, n = !1,
            i = 1,
            r = arguments[0];
          for (arguments.length === 1 && typeof arguments[0] === 'object' ? (r = this, i = 0) : arguments.length === 2 && typeof arguments[0] === 'boolean' ? (n = arguments[0], r = this, i = 1) : arguments.length > 2 && typeof arguments[0] === 'boolean' && (n = arguments[0], r = arguments[1] || {}, i = 2); i < arguments.length; i++) e = arguments[i] || {}, t(e, r);
          return r;
        }
        var o = t('./utilities');
        e.exports = n;
      }, {
        './utilities': 13
      }],
      12: [function (t, e) {
        var n = t('./Sizzle'),
          o = t('./extend'),
          i = t('./utilities'),
          r = t('./ajax'),
          s = t('./Event'),
          u = t('./Css'),
          a = t('./Class'),
          c = t('./Document'),
          l = t('./Offset'),
          d = t('./Element'),
          f = t('./Animate'),
          p = t('./Data'),
          h = function (t, e) {
            return new n(t, e);
          };
        n.prototype = h.prototype = {}, h.extend = h.prototype.extend = o, h.extend(i), h.extend(r), h.prototype.extend(s), h.prototype.extend(u), h.prototype.extend(a), h.prototype.extend(c), h.prototype.extend(l), h.prototype.extend(d), h.prototype.extend(f), h.prototype.extend(p), typeof window.$ !== 'undefined' && (window._$ = $), window.jTool = window.$ = h, e.exports = h;
      }, {
        './Animate': 1,
        './Class': 2,
        './Css': 3,
        './Data': 4,
        './Document': 5,
        './Element': 6,
        './Event': 7,
        './Offset': 8,
        './Sizzle': 9,
        './ajax': 10,
        './extend': 11,
        './utilities': 13
      }],
      13: [function (t, e) {
        function n() {
          return navigator.userAgent.indexOf('Chrome') == -1 ? !1 : !0;
        }

        function o(t) {
          return t !== null && t === t.window;
        }

        function i(t) {
          return Array.isArray(t);
        }

        function r(t) {
          return v[y.call(t)] || (t instanceof Element ? 'element' : '');
        }

        function s() {}

        function u(t, e) {
          t && t.jTool && (t = t.DOMList);
          var n = r(t);
          if (n === 'array' || n === 'nodeList' || n === 'arguments') {
            [].every.call(t, function (t, n) {
              o(t) ? s() : t.jTool ? t = t.get(0) : s();
              return e.call(t, n, t) === !1 ? !1 : !0;
            });
          } else if (n === 'object') {
            for (var i in t) {
              if (e.call(t[i], i, t[i]) === !1) break;
            };
          };
        }

        function a(t) {
          return t.trim();
        }

        function c(t) {
          throw new Error('[jTool Error: ' + t + ']');
        }

        function l(t) {
          var e = !0;
          for (var n in t) t.hasOwnProperty(n) && (e = !1);
          return e;
        }

        function d(t, e) {
          return e ? window.getComputedStyle(t)[e] : window.getComputedStyle(t);
        }

        function f(t) {
          var e = ['px', 'vem', 'em', '%'],
            n = '';
          return typeof t === 'number' ? n : (u(e, function (e, o) {
            return t.indexOf(o) !== -1 ? (n = o, !1) : void 0;
          }), n);
        }

        function p(t) {
          return t.replace(/-\w/g, function (t) {
            return t.split('-')[1].toUpperCase();
          });
        }

        function h(t) {
          return t.replace(/([A-Z])/g, '-$1').toLowerCase();
        }

        function m(t) {
          var e = document.querySelector('#jTool-create-dom');
          if (!e || e.length === 0) {
            var n = document.createElement('table');
            n.id = 'jTool-create-dom', n.style.display = 'none', document.body.appendChild(n), e = document.querySelector('#jTool-create-dom');
          }
          e.innerHTML = t || '';
          var o = e.childNodes;
          return o.length !== 1 || /<tbody|<TBODY/.test(t) || o[0].nodeName !== 'TBODY' || (o = o[0].childNodes), o.length !== 1 || /<thead|<THEAD/.test(t) || o[0].nodeName !== 'THEAD' || (o = o[0].childNodes), o.length != 1 || /<tr|<TR/.test(t) || o[0].nodeName !== 'TR' || (o = o[0].childNodes), o.length !== 1 || /<td|<TD/.test(t) || o[0].nodeName !== 'TD' || (o = o[0].childNodes), o.length !== 1 || /<th|<TH/.test(t) || o[0].nodeName !== 'TH' || (o = o[0].childNodes), e.remove(), o;
        }
        var y = Object.prototype.toString,
          v = {
            '[object String]': 'string',
            '[object Boolean]': 'boolean',
            '[object Undefined]': 'undefined',
            '[object Number]': 'number',
            '[object Object]': 'object',
            '[object Error]': 'error',
            '[object Function]': 'function',
            '[object Date]': 'date',
            '[object Array]': 'array',
            '[object RegExp]': 'regexp',
            '[object Null]': 'null',
            '[object NodeList]': 'nodeList',
            '[object Arguments]': 'arguments',
            '[object Window]': 'window',
            '[object HTMLDocument]': 'document'
          };
        e.exports = {
          isWindow: o,
          isChrome: n,
          isArray: i,
          noop: s,
          type: r,
          toHyphen: h,
          toHump: p,
          getStyleUnit: f,
          getStyle: d,
          isEmptyObject: l,
          trim: a,
          error: c,
          each: u,
          createDOM: m,
          version: '1.2.21'
        };
      }, {}]
    }, {}, [12]);
  },
  /* 3 */
  /***/
  function (module, exports, __webpack_require__) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
      value: true
    });

    var _jTool = __webpack_require__(1);

    var _jTool2 = _interopRequireDefault(_jTool);

    var _Cache = __webpack_require__(4);

    var _Cache2 = _interopRequireDefault(_Cache);

    var _Base = __webpack_require__(5);

    var _Base2 = _interopRequireDefault(_Base);

    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : {
        default: obj
      };
    }

    var Adjust = {
      html: function html() {
        return '<span class="adjust-action"></span>';
      },
      /*
      @绑定宽度调整事件
      $table: table [jTool object]
      */

      bindAdjustEvent: function bindAdjustEvent($table) {
        // 监听鼠标调整列宽度
        $table.off('mousedown', '.adjust-action');
        $table.on('mousedown', '.adjust-action', function (event) {
          var _dragAction = (0, _jTool2.default)(this);
          // 事件源所在的th
          var _th = _dragAction.closest('th');

          // 事件源所在的tr
          var _tr = _th.parent();

          // 事件源所在的table
          var _table = _tr.closest('table');

          // 事件源所在的DIV

          var tableDiv = _table.closest('.table-div');

          // 当前存储属性
          var settings = _Cache2.default.getSettings(_table);

          // 事件源同层级下的所有th
          var _allTh = _tr.find('th[th-visible="visible"]');

          // 事件源下一个可视th
          var _nextTh = _allTh.eq(_th.index(_allTh) + 1);

          // 存储与事件源同列的所有td
          var _td = _Base2.default.getColTd(_th);

          // 宽度调整触发回调事件
          settings.adjustBefore(event);

          // 增加宽度调整中样式
          _th.addClass('adjust-selected');
          _td.addClass('adjust-selected');

          // 更新界面交互标识
          _Base2.default.updateInteractive(_table, 'Adjust');

          // 绑定鼠标拖动事件
          var _thWidth = void 0,
            _NextWidth = void 0;
          var _thMinWidth = _th.css('min-width') || _Base2.default.getTextWidth(_th),
            _NextThMinWidth = _nextTh.css('min-width') || _Base2.default.getTextWidth(_nextTh);
          _table.unbind('mousemove');
          _table.bind('mousemove', function (event) {
            _table.addClass('no-select-text');
            _thWidth = event.clientX - _th.offset().left;
            _thWidth = Math.ceil(_thWidth);
            _NextWidth = _nextTh.width() + _th.width() - _thWidth;
            _NextWidth = Math.ceil(_NextWidth);
            // 限定最小值
            // TODO @baukh20170430: 由原来限定最小值调整为达到最小值后不再执行后续操作
            if (_thWidth < _thMinWidth) {
              // _thWidth = _thMinWidth;
              return;
            }
            // TODO 这里需要确认,当向后调整至最小时,该如何操作?
            if (_NextWidth < _NextThMinWidth) {
              _NextWidth = _NextThMinWidth;
            }
            // 验证是否更改
            if (_thWidth === _th.width()) {
              return;
            }
            // 验证宽度是否匹配
            if (_thWidth + _NextWidth < _th.width() + _nextTh.width()) {
              _NextWidth = _th.width() + _nextTh.width() - _thWidth;
            }
            _th.width(_thWidth);
            _nextTh.width(_NextWidth);

            // 当前宽度调整的事件原为表头置顶的thead th
            // 修改与置顶thead 对应的 thead
            if (_th.closest('.set-top').length === 1) {
              (0, _jTool2.default)('thead[grid-manager-thead] th[th-name="' + _th.attr('th-name') + '"]', _table).width(_thWidth);
              (0, _jTool2.default)('thead[grid-manager-thead] th[th-name="' + _nextTh.attr('th-name') + '"]', _table).width(_NextWidth);
              (0, _jTool2.default)('thead[grid-manager-mock-thead]', _table).width((0, _jTool2.default)('thead[grid-manager-thead]', _table).width());
            }
          });

          // 绑定鼠标放开、移出事件
          _table.unbind('mouseup mouseleave');
          _table.bind('mouseup mouseleave', function (event) {
            var settings = _Cache2.default.getSettings($table);
            _table.unbind('mousemove mouseleave');
            // 存储用户记忆
            _Cache2.default.saveUserMemory(_table);
            if (_th.hasClass('adjust-selected')) {
              // 其它操作也在table以该事件进行绑定,所以通过class进行区别
              // 宽度调整成功回调事件
              settings.adjustAfter(event);
            }
            _th.removeClass('adjust-selected');
            _td.removeClass('adjust-selected');
            _table.removeClass('no-select-text');
            // 更新界面交互标识
            _Base2.default.updateInteractive(_table);
          });
          return false;
        });
        return this;
      },
      /*
      @通过缓存配置成功后, 重置宽度调整事件源dom
      用于禁用最后一列调整宽度事件
      $.table: table[jTool Object]
      */

      resetAdjust: function resetAdjust($table) {
        if (!$table || $table.length === 0) {
          return false;
        }
        var _thList = (0, _jTool2.default)('thead [th-visible="visible"]', $table),
          _adjustAction = (0, _jTool2.default)('.adjust-action', _thList);
        if (!_adjustAction || _adjustAction.length === 0) {
          return false;
        }
        _adjustAction.show();
        _adjustAction.eq(_adjustAction.length - 1).hide();
      }
    };
    /*
     * Adjust: 宽度调整
     * */
    exports.default = Adjust;

    /***/
  },
  /* 4 */
  /***/
  function (module, exports, __webpack_require__) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
      value: true
    });

    var _jTool = __webpack_require__(1);

    var _jTool2 = _interopRequireDefault(_jTool);

    var _Base = __webpack_require__(5);

    var _Base2 = _interopRequireDefault(_Base);

    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : {
        default: obj
      };
    }

    /*
     * @渲染表格使用的json数据
     * 通过每个tr上的cache-key进行获取
     * */
    /*
     * @Cache: 本地缓存
     * 缓存分为三部分:
     * 1.gridData: 渲染表格时所使用的json数据 [存储在GM实例]
     * 2.coreData: 核心缓存数据 [存储在DOM上]
     * 3.userMemory: 用户记忆 [存储在localStorage]
     * */
    var GridData = function GridData() {
      this.responseData = {};
      /*
       * @获取当前行渲染时使用的数据
       * $table: 当前操作的grid,由插件自动传入
       * target: 将要获取数据所对应的tr[Element or NodeList]
       * */
      this.__getRowData = function ($table, target) {
        var gmName = $table.attr('grid-manager');
        if (!gmName) {
          return;
        }
        if (!this.responseData[gmName]) {
          return;
        }
        // target type = Element 元素时, 返回单条数据对象;
        if (_jTool2.default.type(target) === 'element') {
          return this.responseData[gmName][target.getAttribute('cache-key')];
        }
        // target type =  NodeList 类型时, 返回数组
        else if (_jTool2.default.type(target) === 'nodeList') {
          var _this = this;
          var rodData = [];
          _jTool2.default.each(target, function (i, v) {
            rodData.push(_this.responseData[gmName][v.getAttribute('cache-key')]);
          });
          return rodData;
        }
      };
      /*
       * 存储行数据
       * */
      this.setRowData = function (gmName, key, value) {
        if (!this.responseData[gmName]) {
          this.responseData[gmName] = {};
        }
        this.responseData[gmName][key] = value;
      };
    };
    /*
     * 用户记忆
     * */
    // TODO 需要处理项: 将所有的记忆信息放至一个字段, 不再使用一个表一个字段.
    var UserMemory = function UserMemory() {
      /*
       * 删除用户记忆
       * $table: table [jTool Object]
       * */
      this.delUserMemory = function ($table) {
        // 如果未指定删除的table, 则全部清除
        if (!$table || $table.length === 0) {
          window.localStorage.removeItem('GridManagerMemory');
          return true;
        }
        var GridManagerMemory = window.localStorage.getItem('GridManagerMemory');
        if (!GridManagerMemory) {
          return false;
        }
        GridManagerMemory = JSON.parse(GridManagerMemory);
        // 指定删除的table, 则定点清除
        var _key = this.getMemoryKey($table);
        delete GridManagerMemory[_key];
        // 清除后, 重新存储
        window.localStorage.setItem('GridManagerMemory', JSON.stringify(GridManagerMemory));
        return true;
      };
      /*
       * 获取表格的用户记忆标识码
       * $table: table jTool
       * */
      this.getMemoryKey = function ($table) {
        var settings = Cache.getSettings($table);
        // 验证table是否有效
        if (!$table || $table.length === 0) {
          _Base2.default.outLog('getUserMemory:无效的table', 'error');
          return false;
        }
        // 当前表是否禁用缓存  被禁用原因是用户缺失了必要的参数
        var noCache = $table.attr('no-cache');
        if (noCache && noCache == 'true') {
          _Base2.default.outLog('缓存已被禁用：当前表缺失必要html标签属性[grid-manager或th-name]', 'info');
          return false;
        }
        if (!window.localStorage) {
          _Base2.default.outLog('当前浏览器不支持：localStorage，缓存功能失效', 'info');
          return false;
        }
        return window.location.pathname + window.location.hash + '-' + settings.gridManagerName;
      };
      /*
       * @获取用户记忆
       * $table:table
       * 成功则返回本地存储数据,失败则返回空对象
       * */
      this.getUserMemory = function ($table) {
        if (!$table || $table.length === 0) {
          return {};
        }
        var _key = this.getMemoryKey($table);
        if (!_key) {
          return {};
        }
        var GridManagerMemory = window.localStorage.getItem('GridManagerMemory');
        // 如无数据，增加属性标识：grid-manager-cache-error
        if (!GridManagerMemory || GridManagerMemory === '{}') {
          $table.attr('grid-manager-cache-error', 'error');
          return {};
        }
        GridManagerMemory = JSON.parse(GridManagerMemory);
        var _data = {
          key: _key,
          cache: JSON.parse(GridManagerMemory[_key] || '{}')
        };
        return _data;
      };
      /*
       * @存储用户记忆
       * $table:table [jTool object]
       * isInit: 是否为初始存储缓存[用于处理宽度在特定情况下发生异常]
       */
      // TODO @baukh20170414: 参数isInit 已经废弃, 之后可以删除
      this.saveUserMemory = function (table, isInit) {
        var Settings = Cache.getSettings(table);
        var _this = this;
        // 当前为禁用缓存模式，直接跳出
        if (Settings.disableCache) {
          return false;
        }
        var _table = (0, _jTool2.default)(table);
        // 当前表是否禁用缓存  被禁用原因是用户缺失了必要的参数
        var noCache = _table.attr('no-cache');
        if (!_table || _table.length == 0) {
          _Base2.default.outLog('saveUserMemory:无效的table', 'error');
          return false;
        }
        if (noCache && noCache == 'true') {
          _Base2.default.outLog('缓存功能已被禁用：当前表缺失必要参数', 'info');
          return false;
        }
        if (!window.localStorage) {
          _Base2.default.outLog('当前浏览器不支持：localStorage，缓存功能失效。', 'error');
          return false;
        }
        var thList = (0, _jTool2.default)('thead[grid-manager-thead] th', _table);
        if (!thList || thList.length == 0) {
          _Base2.default.outLog('saveUserMemory:无效的thList,请检查是否正确配置table,thead,th', 'error');
          return false;
        }

        var _cache = {},
          _pageCache = {},
          _thCache = [],
          _thData = {};

        var $v = void 0;
        _jTool2.default.each(thList, function (i, v) {
          $v = (0, _jTool2.default)(v);
          _thData = {};
          _thData.th_name = $v.attr('th-name');
          if (Settings.supportDrag) {
            _thData.th_index = $v.index();
          }
          if (Settings.supportAdjust) {
            // 用于处理宽度在特定情况下发生异常
            // isInit ? $v.css('width', $v.css('width')) : '';
            _thData.th_width = $v.width();
          }
          if (Settings.supportConfig) {
            _thData.isShow = (0, _jTool2.default)('.config-area li[th-name="' + _thData.th_name + '"]', _table.closest('.table-wrap')).find('input[type="checkbox"]').get(0).checked;
          }
          _thCache.push(_thData);
        });
        _cache.th = _thCache;
        // 存储分页
        if (Settings.supportAjaxPage) {
          _pageCache.pSize = parseInt((0, _jTool2.default)('select[name="pSizeArea"]', _table.closest('.table-wrap')).val());
          _cache.page = _pageCache;
        }
        var _cacheString = JSON.stringify(_cache);
        var GridManagerMemory = window.localStorage.getItem('GridManagerMemory');
        if (!GridManagerMemory) {
          GridManagerMemory = {};
        } else {
          GridManagerMemory = JSON.parse(GridManagerMemory);
        }
        GridManagerMemory[_this.getMemoryKey(_table)] = _cacheString;
        window.localStorage.setItem('GridManagerMemory', JSON.stringify(GridManagerMemory));
        return _cacheString;
      };
    };
    /*
     *
     * */
    var Cache = {
      /*
       * 获取配置项
       * $table:table [jTool object]
       * */
      getSettings: function getSettings($table) {
        if (!$table || $table.length === 0) {
          return {};
        }
        // 这里返回的是clone对象 而非对象本身
        return _jTool2.default.extend(true, {}, $table.data('settings'));
      },
      /*
       * 更新配置项
       * $table:table [jTool object]
       * */

      updateSettings: function updateSettings($table, settings) {
        var data = _jTool2.default.extend(true, {}, settings);
        $table.data('settings', data);
      },
      /*
       *  @验证版本号清除列表缓存
       *  $table: jTool table
       *  version: 版本号
       * */

      cleanTableCacheForVersion: function cleanTableCacheForVersion($table, version) {
        var cacheVersion = window.localStorage.getItem('GridManagerVersion');
        // 当前为第一次渲染
        if (!cacheVersion) {
          window.localStorage.setItem('GridManagerVersion', version);
        }
        // 版本变更, 清除所有的用户记忆
        if (cacheVersion && cacheVersion !== version) {
          this.cleanTableCache(null, '版本已升级,原全部缓存被自动清除');
          window.localStorage.setItem('GridManagerVersion', version);
        }
      },
      /*
       * @清除列表缓存
       * $table: table [jTool object]
       * cleanText: 清除缓存的原因
       * */

      cleanTableCache: function cleanTableCache($table, cleanText) {
        // 不指定table, 清除全部
        if ($table === null) {
          this.delUserMemory();
          _Base2.default.outLog('清除缓存成功,清除原因：' + cleanText, 'info');
          // 指定table, 定点清除
        } else {
          var Settings = this.getSettings($table);
          this.delUserMemory($table);
          _Base2.default.outLog(Settings.gridManagerName + '清除缓存成功,清除原因：' + cleanText, 'info');
        }
      },
      /*
       * @根据本地缓存thead配置列表: 获取本地缓存, 存储原位置顺序, 根据本地缓存进行配置
       * $.table: table [jTool object]
       * */

      configTheadForCache: function configTheadForCache(table) {
        var Settings = this.getSettings(table);
        var _this = this;
        var _data = _this.getUserMemory(table),
          // 本地缓存的数据
          _domArray = [];
        // 验证：当前table 没有缓存数据
        if (!_data || _jTool2.default.isEmptyObject(_data) || !_data.cache || _jTool2.default.isEmptyObject(_data.cache)) {
          return;
        }
        // 列表的缓存数据
        var _cache = _data.cache;
        // th相关 缓存
        var _thCache = _cache.th;
        // 验证：缓存数据与当前列表项是否匹配
        var _thNameTmpList = [];
        var _dataAvailable = true;
        // 单一的th
        var _th = void 0;
        // th的缓存json
        var _thJson = void 0;
        // 验证：缓存数据与当前列表是否匹配
        if (!_thCache || _thCache.length != (0, _jTool2.default)('thead th', table).length) {
          _this.cleanTableCache(table, '缓存数据与当前列表不匹配');
          return;
        }
        _jTool2.default.each(_thCache, function (i2, v2) {
          _thJson = v2;
          _th = (0, _jTool2.default)('th[th-name=' + _thJson.th_name + ']', table);
          if (_th.length == 0 || _thNameTmpList.indexOf(_thJson.th_name) != -1) {
            _this.cleanTableCache(table, '缓存数据与当前列表不匹配');
            _dataAvailable = false;
            return false;
          }
          _thNameTmpList.push(_thJson.th_name);
        });
        // 数据可用，进行列的配置
        if (_dataAvailable) {
          _jTool2.default.each(_thCache, function (i2, v2) {
            _thJson = v2;
            _th = (0, _jTool2.default)('th[th-name=' + _thJson.th_name + ']', table);
            // 配置列的宽度
            if (Settings.supportAdjust && _th.attr('gm-create') !== 'true') {
              _th.css('width', _thJson.th_width);
            }
            // 配置列排序数据
            if (Settings.supportDrag && typeof _thJson.th_index !== 'undefined') {
              _domArray[_thJson.th_index] = _th;
            } else {
              _domArray[i2] = _th;
            }
            // 配置列的可见
            if (Settings.supportConfig) {
              _Base2.default.setAreVisible(_th, typeof _thJson.isShow === 'undefined' ? true : _thJson.isShow, true);
            }
          });
          // 配置列的顺序
          if (Settings.supportDrag) {
            table.find('thead tr').html(_domArray);
          }
        }
      },
      /*
      @存储原Th DOM至table data
      $table: table [jTool object]
      */

      setOriginalThDOM: function setOriginalThDOM($table) {
        var _thList = [];
        var _thDOM = (0, _jTool2.default)('thead[grid-manager-thead] th', $table);

        _jTool2.default.each(_thDOM, function (i, v) {
          _thList.push(v.getAttribute('th-name'));
        });
        $table.data('originalThList', _thList);
      },
      /*
      @获取原Th DOM至table data
      $table: table [jTool object]
      */

      getOriginalThDOM: function getOriginalThDOM($table) {
        var _thArray = [];
        var _thList = $table.data('originalThList');

        _jTool2.default.each(_thList, function (i, v) {
          _thArray.push((0, _jTool2.default)('thead[grid-manager-thead] th[th-name="' + v + '"]', $table).get(0));
        });
        return (0, _jTool2.default)(_thArray);
      },
      /*
       * @存储对外实例
       * $table:当前被实例化的table
       * */

      setGridManagerToJTool: function setGridManagerToJTool($table) {
        $table.data('gridManager', this); // 调用的地方需要使用call 更改 this指向
      },
      /*
      @获取gridManager
      $.table:table [jTool object]
      */

      __getGridManager: function __getGridManager($table) {
        if (!$table || $table.length === 0) {
          return {};
        }
        var settings = this.getSettings($table);
        var gridManager = $table.data('gridManager');
        // 会一并被修改 $table.data('gridManager') 指向的 Object
        _jTool2.default.extend(gridManager, settings);
        return gridManager;
      }
    };
    _jTool2.default.extend(Cache, new UserMemory(), new GridData());
    exports.default = Cache;

    /***/
  },
  /* 5 */
  /***/
  function (module, exports, __webpack_require__) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
      value: true
    });

    var _jTool = __webpack_require__(1);

    var _jTool2 = _interopRequireDefault(_jTool);

    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : {
        default: obj
      };
    }

    var Base = {
      /*
      @输出日志
      type: 输出分类[info,warn,error]
      */
      outLog: function outLog(msg, type) {
        if (!type) {
          console.log('GridManager:', msg);
        } else if (type === 'info') {
          console.info('GridManager Info: ', msg);
        } else if (type === 'warn') {
          console.warn('GridManager Warn: ', msg);
        } else if (type === 'error') {
          console.error('GridManager Error: ', msg);
        }
        return msg;
      },
      /*
       * @获取与 th 同列的 td jTool 对象, 该方法的调用者只允许为 Th
       * $th: jTool th
       * */

      getColTd: function getColTd($th) {
        var tableWrap = $th.closest('.table-wrap'),
          thIndex = $th.index(),
          trList = (0, _jTool2.default)('tbody tr', tableWrap);
        var tdList = [];
        var _td = null;
        _jTool2.default.each(trList, function (i, v) {
          _td = (0, _jTool2.default)('td', v).get(thIndex);
          if (_td) {
            tdList.push(_td);
          }
        });
        return (0, _jTool2.default)(tdList);
      },
      /*
       * @初始化列显示\隐藏
       * */

      initVisible: function initVisible($table) {
        // 所有的th
        var _thList = (0, _jTool2.default)('thead th', $table);

        // tbody下的tr
        var _trList = (0, _jTool2.default)('tbody tr', $table);
        var _td = null;
        _jTool2.default.each(_thList, function (i, v) {
          v = (0, _jTool2.default)(v);
          _jTool2.default.each(_trList, function (i2, v2) {
            _td = (0, _jTool2.default)('td', v2).eq(v.index());
            _td.attr('td-visible', v.attr('th-visible'));
          });
        });
      },
      /*
      @设置列是否可见
      $._thList_	： 即将配置的列所对应的th[jTool object，可以是多个]
      $._visible_: 是否可见[Boolean]
      $.cb		: 回调函数
      */

      setAreVisible: function setAreVisible(_thList_, _visible_, cb) {
        var _table = void 0,
          // 当前所在的table
          _tableWarp = void 0,
          // 当前所在的容器
          _th = void 0,
          // 当前操作的th
          _trList = void 0,
          // 当前tbody下所有的tr
          _tdList = [],
          // 所对应的td
          _checkLi = void 0,
          // 所对应的显示隐藏所在的li
          _checkbox = void 0; // 所对应的显示隐藏事件
        _jTool2.default.each(_thList_, function (i, v) {
          _th = (0, _jTool2.default)(v);
          _table = _th.closest('table');
          _tableWarp = _table.closest('.table-wrap');
          _trList = (0, _jTool2.default)('tbody tr', _table);
          _checkLi = (0, _jTool2.default)('.config-area li[th-name="' + _th.attr('th-name') + '"]', _tableWarp);
          _checkbox = _checkLi.find('input[type="checkbox"]');
          if (_checkbox.length === 0) {
            return;
          }
          _jTool2.default.each(_trList, function (i2, v2) {
            _tdList.push((0, _jTool2.default)(v2).find('td').get(_th.index()));
          });
          // 显示
          if (_visible_) {
            _th.attr('th-visible', 'visible');
            _jTool2.default.each(_tdList, function (i2, v2) {
              // $(v2).show();
              v2.setAttribute('td-visible', 'visible');
            });
            _checkLi.addClass('checked-li');
            _checkbox.prop('checked', true);
          }
          // 隐藏
          else {
            _th.attr('th-visible', 'none');
            _jTool2.default.each(_tdList, function (i2, v2) {
              // $(v2).hide();
              v2.setAttribute('td-visible', 'none');
            });
            _checkLi.removeClass('checked-li');
            _checkbox.prop('checked', false);
          }
          typeof cb === 'function' ? cb() : '';
        });
      },

      /*
      @获取TH宽度
      @th: th
      */

      getTextWidth: function getTextWidth(th) {
        var $th = (0, _jTool2.default)(th);
        var thWarp = (0, _jTool2.default)('.th-wrap', $th); // th下的GridManager包裹容器
        var thText = (0, _jTool2.default)('.th-text', $th); // 文本所在容器

        // 文本镜象 用于处理实时获取文本长度
        var tableWrap = $th.closest('.table-wrap');
        var textDreamland = (0, _jTool2.default)('.text-dreamland', tableWrap);

        // 将th文本嵌入文本镜象 用于获取文本实时宽度
        textDreamland.text(thText.text());
        textDreamland.css({
          fontSize: thText.css('font-size'),
          fontWeight: thText.css('font-weight'),
          fontFamily: thText.css('font-family')
        });
        var thPaddingLeft = thWarp.css('padding-left'),
          thPaddingRight = thWarp.css('padding-right');
        var thWidth = textDreamland.width() + (thPaddingLeft || 0) + (thPaddingRight || 0);
        return thWidth;
      },
      /*
       * 显示加载中动画
       * @dom
       * */

      showLoading: function showLoading(dom, cb) {
        if (!dom || dom.length === 0) {
          return;
        }
        var loading = dom.find('.load-area');
        if (loading.length > 0) {
          loading.remove();
        }
        var loadingDom = (0, _jTool2.default)('<div class="load-area loading"><div class="loadInner kernel"></div></div>');
        dom.append(loadingDom);

        // 进行loading图标居中显示
        var loadInner = dom.find('.load-area').find('.loadInner');
        var domHeight = dom.height(),
          loadInnerHeight = loadInner.height();
        loadInner.css('margin-top', (domHeight - loadInnerHeight) / 2);
        window.setTimeout(function () {
          typeof cb === 'function' ? cb() : '';
        }, 100);
      },
      /*
       * 隐藏加载中动画
       * @dom
       * */
      hideLoading: function hideLoading(dom, cb) {
        if (!dom || dom.length === 0) {
          return;
        }
        window.setTimeout(function () {
          (0, _jTool2.default)('.load-area', dom).remove();
          typeof cb === 'function' ? cb() : '';
        }, 500);
      },
      /**
       * 更新当前用户交互状态, 用于优化置顶状态下进行[拖拽, 宽度调整]操作时,页面出现滚动的问题
       * @param $table
       * @param interactive: 如果不存在于interactiveList内, 将删除属性[user-interactive]
       */

      updateInteractive: function updateInteractive($table, interactive) {
        var interactiveList = ['Adjust', 'Drag'];
        // 事件源所在的容器
        var tableWrap = $table.closest('.table-wrap');
        if (!interactive || interactiveList.indexOf(interactive) === -1) {
          tableWrap.removeAttr('user-interactive');
        } else {
          tableWrap.attr('user-interactive', interactive);
        }
      }
    };
    /*
     * Base: 基础方法
     * */
    exports.default = Base;

    /***/
  },
  /* 6 */
  /***/
  function (module, exports, __webpack_require__) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
      value: true
    });

    var _jTool = __webpack_require__(1);

    var _jTool2 = _interopRequireDefault(_jTool);

    var _Base = __webpack_require__(5);

    var _Base2 = _interopRequireDefault(_Base);

    var _Core = __webpack_require__(7);

    var _Core2 = _interopRequireDefault(_Core);

    var _Cache = __webpack_require__(4);

    var _Cache2 = _interopRequireDefault(_Cache);

    var _I18n = __webpack_require__(9);

    var _I18n2 = _interopRequireDefault(_I18n);

    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : {
        default: obj
      };
    }

    var AjaxPage = {
      html: function html($table) {
        var html = '<div class="page-toolbar clearfix">\n\t\t\t\t\t\t<div class="ajax-page clearfix">\n\t\t\t\t\t\t<div class="change-size">\n\t\t\t\t\t\t\t' + _I18n2.default.i18nText($table, 'pre-page-first-text') + '\n\t\t\t\t\t\t\t<select name="pSizeArea" class="selectpicker select-sm show-tick form-control"></select>\n\t\t\t\t\t\t\t' + _I18n2.default.i18nText($table, 'pre-page-last-text') + '\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<div class="dataTables-info">\n\t\t\t\t\t\t\t' + _I18n2.default.i18nText($table, 'total-first-text') + '\n\t\t\t\t\t\t\t<span class="total-info"></span>\n\t\t\t\t\t\t\t' + _I18n2.default.i18nText($table, 'total-last-text') + '\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<ul class="pagination"></ul>\n\t\t\t\t\t\t<div class="goto-page">\n\t\t\t\t\t\t\t' + _I18n2.default.i18nText($table, 'goto-first-text') + '\n\t\t\t\t\t\t\t<input type="text" class="gp-input form-control input-sm"/>\n\t\t\t\t\t\t\t' + _I18n2.default.i18nText($table, 'goto-last-text') + '\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<button type="button" class="btn btn-default btn-sm btn-goto">\n\t\t\t\t\t\t\t' + _I18n2.default.i18nText($table, 'goto-btn-text') + '\n\t\t\t\t\t\t\t</button>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>';
        return html;
      },
      /**
       * 初始化分页
       * @param $table：[jTool object]
       */
      initAjaxPage: function initAjaxPage($table) {
        var Settings = _Cache2.default.getSettings($table);
        var _this = this;
        var tableWarp = $table.closest('.table-wrap'),
          pageToolbar = (0, _jTool2.default)('.page-toolbar', tableWarp); // 分页工具条
        var sizeData = Settings.sizeData;
        pageToolbar.hide();
        // 生成每页显示条数选择框
        _this.createPageSizeDOM($table, sizeData);

        // 绑定页面跳转事件
        _this.bindPageJumpEvent($table);

        // 绑定设置显示条数切换事件
        _this.bindSetPageSizeEvent($table);
      },
      /**
       * 生成页码DOM节点
       * @param $table [jTool object]
       * @param pageData  分页数据格式
       */

      createPaginationDOM: function createPaginationDOM($table, pageData) {
        var tableWarp = $table.closest('.table-wrap'),
          pageToolbar = (0, _jTool2.default)('.page-toolbar', tableWarp),
          // 分页工具条
          pagination = (0, _jTool2.default)('.pagination', pageToolbar); // 分页区域
        pagination.html(this.joinPagination($table, pageData));
      },
      /*
       * 拼接页码字符串
       * @param $table: [table jTool object]
       * @param cPage: 当前页码
       * @param pageData  分页数据格式
       * */

      joinPagination: function joinPagination($table, pageData) {
        var cPage = Number(pageData.cPage || 0),
          // 当前页
          tPage = Number(pageData.tPage || 0),
          // 总页数
          tHtml = '',
          // 临时存储分页HTML片段
          lHtml = ''; // 临时存储末尾页码THML片段
        // 配置首页
        var previousClassName = 'previous-page';
        if (cPage === 1) {
          previousClassName += ' disabled';
        }
        tHtml += '<li c-page="' + (cPage - 1) + '" class="' + previousClassName + '">\n\t\t\t\t\t' + _I18n2.default.i18nText($table, 'previous-page') + '\n\t\t\t\t</li>';
        // 循环开始数
        var i = 1;
        // 循环结束数
        var maxI = tPage;

        // 配置first端省略符
        if (cPage > 4) {
          tHtml += '<li c-page="1">\n\t\t\t\t\t\t1\n\t\t\t\t\t</li>\n\t\t\t\t\t<li class="disabled">\n\t\t\t\t\t\t...\n\t\t\t\t\t</li>';
          i = cPage - 2;
        }
        // 配置last端省略符
        if (tPage - cPage > 4) {
          maxI = cPage + 2;
          lHtml += '<li class="disabled">\n\t\t\t\t\t\t...\n\t\t\t\t\t</li>\n\t\t\t\t\t<li c-page="' + tPage + '">\n\t\t\t\t\t\t' + tPage + '\n\t\t\t\t\t</li>';
        }
        // 配置页码
        for (i; i <= maxI; i++) {
          if (i === cPage) {
            tHtml += '<li class="active">\n\t\t\t\t\t\t\t' + cPage + '\n\t\t\t\t\t\t</li>';
            continue;
          }
          tHtml += '<li c-page="' + i + '">\n\t\t\t\t\t\t' + i + '\n\t\t\t\t\t</li>';
        }
        tHtml += lHtml;
        // 配置下一页与尾页
        var nextClassName = 'next-page';
        if (cPage >= tPage) {
          nextClassName += ' disabled';
        }
        tHtml += '<li c-page="' + (cPage + 1) + '" class="' + nextClassName + '">\n\t\t\t\t\t' + _I18n2.default.i18nText($table, 'next-page') + '\n\t\t\t\t</li>';
        return tHtml;
      },
      /**
       * 生成每页显示条数选择框据
       * @param $table: [table jTool object]
       * @param _sizeData: _选择框自定义条数
       */

      createPageSizeDOM: function createPageSizeDOM($table, _sizeData_) {
        var tableWarp = $table.closest('.table-wrap'),
          pageToolbar = (0, _jTool2.default)('.page-toolbar', tableWarp),
          // 分页工具条
          pSizeArea = (0, _jTool2.default)('select[name="pSizeArea"]', pageToolbar); // 分页区域
        // error
        if (!_sizeData_ || _sizeData_.length === 0) {
          _Base2.default.outLog('渲染失败：参数[sizeData]配置错误', 'error');
          return;
        }

        var _ajaxPageHtml = '';
        _jTool2.default.each(_sizeData_, function (i, v) {
          _ajaxPageHtml += '<option value="' + v + '">\n\t\t\t\t\t\t\t\t' + v + '\n\t\t\t\t\t\t\t</option>';
        });
        pSizeArea.html(_ajaxPageHtml);
      },
      /**
       * 绑定页面跳转事件
       * @param $table: [table jTool object]
       */

      bindPageJumpEvent: function bindPageJumpEvent($table) {
        var _this = this;
        var tableWarp = $table.closest('.table-wrap'),
          pageToolbar = (0, _jTool2.default)('.page-toolbar', tableWarp),
          // 分页工具条
          // pagination = (0, _jTool2.default)('.pagination', pageToolbar),
          // 分页区域
          gpInput = (0, _jTool2.default)('.gp-input', pageToolbar),
          // 跳转按钮
          btnGoto = (0, _jTool2.default)('.btn-goto', pageToolbar),
          // 快捷跳转
          refreshAction = (0, _jTool2.default)('.refresh-action', pageToolbar); // 快捷跳转
        // 绑定分页点击事件
        pageToolbar.off('click', '.pagination li');
        pageToolbar.on('click', '.pagination li', function () {
          var pageAction = (0, _jTool2.default)(this);
          var cPage = pageAction.attr('c-page'); // 分页页码
          if (!cPage || !Number(cPage) || pageAction.hasClass('disabled')) {
            _Base2.default.outLog('指定页码无法跳转,已停止。原因:1、可能是当前页已处于选中状态; 2、所指向的页不存在', 'info');
            return false;
          }
          cPage = parseInt(cPage);
          _this.gotoPage($table, cPage);
        });
        // 绑定快捷跳转事件
        gpInput.unbind('keyup');
        gpInput.bind('keyup', function (e) {
          if (e.which !== 13) {
            return;
          }
          var _inputValue = parseInt(this.value, 10);
          if (!_inputValue) {
            this.focus();
            return;
          }
          _this.gotoPage($table, _inputValue);
          this.value = '';
        });
        // 绑定跳转按钮点击事件
        btnGoto.unbind('click');
        btnGoto.bind('click', function (e) {
          var _inputValue = parseInt(gpInput.val(), 10);
          if (!_inputValue) {
            gpInput.DOMList[0].focus();
            return;
          }
          _this.gotoPage($table, _inputValue);
          gpInput.val('');
        });
        // 绑定刷新界面事件
        refreshAction.unbind('click');
        refreshAction.bind('click', function () {
          var _tableWarp = (0, _jTool2.default)(this).closest('.table-wrap'),
            _table = (0, _jTool2.default)('table[grid-manager]', _tableWarp),
            _input = (0, _jTool2.default)('.page-toolbar .gp-input', _tableWarp),
            _value = _input.val();
          // 跳转输入框为空时: 刷新当前页
          if (_value.trim() === '') {
            _Core2.default.__refreshGrid(_table);
            return;
          }
          // 跳转输入框不为空时: 验证输入值是否有效,如果有效跳转至指定页,如果无效对输入框进行聚焦
          var _inputValue = parseInt(_input.val(), 10);
          if (!_inputValue) {
            _input.focus();
            return;
          }
          _this.gotoPage($table, _inputValue);
          _input.val('');
        });
      },

      /**
       * 跳转至指定页
       * @param $table: [table jTool object]
       * @param _cPage: 指定页
       */

      gotoPage: function gotoPage($table, _cPage) {
        var settings = _Cache2.default.getSettings($table);
        // 跳转的指定页大于总页数
        if (_cPage > settings.pageData.tPage) {
          _cPage = settings.pageData.tPage;
        }
        // 替换被更改的值
        settings.pageData.cPage = _cPage;
        settings.pageData.pSize = settings.pageData.pSize || settings.pageSize;
        // 更新缓存
        _Cache2.default.updateSettings($table, settings);

        // 调用事件、渲染DOM
        var query = _jTool2.default.extend({}, settings.query, settings.sortData, settings.pageData);
        settings.pagingBefore(query);
        _Core2.default.__refreshGrid($table, function () {
          settings.pagingAfter(query);
        });
      },

      /**
       * 绑定设置当前页显示数事件
       * @param $table: [table jTool object]
       * @returns {boolean}
       */

      bindSetPageSizeEvent: function bindSetPageSizeEvent($table) {
        var tableWarp = $table.closest('.table-wrap'),
          pageToolbar = (0, _jTool2.default)('.page-toolbar', tableWarp),
          // 分页工具条
          sizeArea = (0, _jTool2.default)('select[name=pSizeArea]', pageToolbar); // 切换条数区域
        if (!sizeArea || sizeArea.length === 0) {
          _Base2.default.outLog('未找到单页显示数切换区域，停止该事件绑定', 'info');
          return false;
        }
        $(sizeArea.DOMList[0]).off('change');
        $(sizeArea.DOMList[0]).on('change', function () {
          var _size = (0, _jTool2.default)(this);
          var _tableWarp = _size.closest('.table-wrap'),
            _table = (0, _jTool2.default)('table[grid-manager]', _tableWarp);
          var settings = _Cache2.default.getSettings($table);
          settings.pageData = {
            cPage: 1,
            pSize: parseInt(_size.val())
          };

          _Cache2.default.saveUserMemory(_table);
          // 更新缓存
          _Cache2.default.updateSettings($table, settings);
          // 调用事件、渲染tbody
          var query = _jTool2.default.extend({}, settings.query, settings.sortData, settings.pageData);
          settings.pagingBefore(query);
          _Core2.default.__refreshGrid(_table, function () {
            settings.pagingAfter(query);
          });
        });
      },

      /**
       * 重置每页显示条数, 重置条数文字信息 [注: 这个方法只做显示更新, 不操作Cache 数据]
       * @param $table: [table jTool object]
       * @param _pageData_: 分页数据格式
       * @returns {boolean}
       */

      resetPSize: function resetPSize($table, _pageData_) {
        var tableWarp = $table.closest('.table-wrap'),
          toolBar = (0, _jTool2.default)('.page-toolbar', tableWarp),
          pSizeArea = (0, _jTool2.default)('select[name="pSizeArea"]', toolBar),
          pSizeInfo = (0, _jTool2.default)('.total-info', toolBar);
        if (!pSizeArea || pSizeArea.length === 0) {
          _Base2.default.outLog('未找到条数切换区域，停止该事件绑定', 'info');
          return false;
        }
        var totalNum = _pageData_.tSize; // 总共条数
        // var tmpHtml = _I18n2.default.i18nText($table, 'dataTablesInfo', [fromNum, toNum, totalNum]);
        // 根据返回值修正单页条数显示值
        pSizeArea.val(_pageData_.pSize || 10);
        $(pSizeArea.DOMList[0]).selectpicker('refresh');

        // 修改条数文字信息
        pSizeInfo.text(totalNum);
        // pSizeArea.show();
      },
      /**
       * 重置分页数据
       * @param $table: [table jTool object]
       * @param totals: 总条数
       */

      resetPageData: function resetPageData($table, totals) {
        var settings = _Cache2.default.getSettings($table);
        var _this = this;
        if (isNaN(parseInt(totals, 10))) {
          return;
        }
        var _pageData = getPageData(totals);
        // 生成页码DOM节点
        _this.createPaginationDOM($table, _pageData);

        // 重置当前页显示条数
        _this.resetPSize($table, _pageData);

        // 更新Cache
        _Cache2.default.updateSettings($table, _jTool2.default.extend(true, settings, {
          pageData: _pageData
        }));

        var tableWarp = $table.closest('.table-wrap');
        // 分页工具条
        var pageToolbar = (0, _jTool2.default)('.page-toolbar', tableWarp);
        pageToolbar.show();

        // 计算分页数据
        function getPageData(tSize) {
          var _pSize = settings.pageData.pSize || settings.pageSize,
            _tSize = tSize,
            _cPage = settings.pageData.cPage || 1;
          return {
            tPage: Math.ceil(_tSize / _pSize), // 总页数
            cPage: _cPage, // 当前页
            pSize: _pSize, // 每页显示条数
            tSize: _tSize // 总条路
          };
        }
      },
      /**
       * 根据本地缓存配置分页数据
       * @param $table: [table jTool object]
       */

      configPageForCache: function configPageForCache($table) {
        var settings = _Cache2.default.getSettings($table);
        var _data = _Cache2.default.getUserMemory($table);
        // 缓存对应
        var _cache = _data.cache;
        // 每页显示条数
        var _pSize = null;

        // 验证是否存在每页显示条数缓存数据
        if (!_cache || !_cache.page || !_cache.page.pSize) {
          _pSize = settings.pageSize || 10.0;
        } else {
          _pSize = _cache.page.pSize;
        }
        var pageData = {
          pSize: _pSize,
          cPage: 1
        };
        _jTool2.default.extend(settings, {
          pageData: pageData
        });
        _Cache2.default.updateSettings($table, settings);
      }
    };
    /*
     * AjaxPage: 分页
     * */
    exports.default = AjaxPage;

    /***/
  },
  /* 7 */
  /***/
  function (module, exports, __webpack_require__) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
      value: true
    });

    var _jTool = __webpack_require__(1);

    var _jTool2 = _interopRequireDefault(_jTool);

    var _Menu = __webpack_require__(8);

    var _Menu2 = _interopRequireDefault(_Menu);

    var _Adjust = __webpack_require__(3);

    var _Adjust2 = _interopRequireDefault(_Adjust);

    var _AjaxPage = __webpack_require__(6);

    var _AjaxPage2 = _interopRequireDefault(_AjaxPage);

    var _Cache = __webpack_require__(4);

    var _Cache2 = _interopRequireDefault(_Cache);

    var _Config = __webpack_require__(11);

    var _Config2 = _interopRequireDefault(_Config);

    var _Checkbox = __webpack_require__(12);

    var _Checkbox2 = _interopRequireDefault(_Checkbox);

    var _Base = __webpack_require__(5);

    var _Base2 = _interopRequireDefault(_Base);

    var _Export = __webpack_require__(10);

    var _Export2 = _interopRequireDefault(_Export);

    var _Order = __webpack_require__(13);

    var _Order2 = _interopRequireDefault(_Order);

    var _Remind = __webpack_require__(14);

    var _Remind2 = _interopRequireDefault(_Remind);

    var _Sort = __webpack_require__(15);

    var _Sort2 = _interopRequireDefault(_Sort);

    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : {
        default: obj
      };
    }

    /*
     * Core: 核心方法
     * 1.刷新
     * 2.渲染GM DOM
     * 3.重置tbody
     * */
    var Core = {
      /*
      @刷新表格 使用现有参数重新获取数据，对表格数据区域进行渲染
      $.callback: 回调函数
      */
      __refreshGrid: function __refreshGrid($table, callback) {
        var settings = _Cache2.default.getSettings($table);
        var tbodyDOM = (0, _jTool2.default)('tbody', $table),
          // tbody dom
          gmName = $table.attr('grid-manager'),
          tableWrap = $table.closest('.table-wrap'),
          refreshAction = (0, _jTool2.default)('.page-toolbar .refresh-action', tableWrap); // 刷新按纽
        // 增加刷新中标识
        refreshAction.addClass('refreshing');
        /*
           使用配置数据
           如果存在配置数据ajax_data,将不再通过ajax_rul进行数据请求
           且ajax_beforeSend、ajax_error、ajax_complete将失效，仅有ajax_success会被执行
           */
        if (settings.ajax_data) {
          driveDomForSuccessAfter(settings.ajax_data);
          settings.ajax_success(settings.ajax_data);
          removeRefreshingClass();
          typeof callback === 'function' ? callback() : '';
          return;
        }
        if (typeof settings.ajax_url !== 'string' || settings.ajax_url === '') {
          settings.outLog('请求表格数据失败！参数[ajax_url]配制错误', 'error');
          removeRefreshingClass();
          typeof callback === 'function' ? callback() : '';
          return;
        }
        var pram = _jTool2.default.extend(true, {}, settings.query);
        // 合并分页信息至请求参
        if (settings.supportAjaxPage) {
          _jTool2.default.extend(pram, settings.pageData);
        }
        // 合并排序信息至请求参
        if (settings.supportSorting) {
          _jTool2.default.each(settings.sortData, function (key, value) {
            pram['sort_' + key] = value; // 增加sort_前缀,防止与搜索时的条件重叠
          });
          // $.extend(pram, settings.sortData);
        }
        // 当前页不存在,或者小于1时, 修正为1
        if (!pram.cPage || pram.cPage < 1) {
          pram.cPage = 1;
          // 当前页大于总页数时, 修正为总页数
        } else if (pram.cPage > pram.tPage) {
          pram.cPage = pram.tPage;
        }
        // settings.query = pram;
        _Cache2.default.updateSettings($table, settings);

        if (settings.showLoading) {
          _Base2.default.showLoading(tableWrap);
        }

        // 当前为POST请求 且 Content-Type 未进行配置时, 默认使用 application/x-www-form-urlencoded
        // 说明|备注:
        // 1. Content-Type = application/x-www-form-urlencoded 的数据形式为 form data
        // 2. Content-Type = text/plain;charset=UTF-8 的数据形式为 request payload
        if (settings.ajax_type.toUpperCase() === 'POST' && !settings.ajax_headers['Content-Type']) {
          settings.ajax_headers['Content-Type'] = 'application/x-www-form-urlencoded';
        }
        // 请求前处理程序, 可以通过该方法修改全部的请求参数
        settings.requestHandler(pram);
        var defineParam = _jTool2.default.extend(true, {}, settings.query);
        defineParam.rows = pram.pSize;
        defineParam.page = pram.cPage;
        settings.requestHandler(defineParam);
        // 执行ajax
        _jTool2.default.ajax({
          url: settings.ajax_url,
          type: settings.ajax_type,
          data: defineParam,
          headers: settings.ajax_headers,
          cache: true,
          beforeSend: function beforeSend(XMLHttpRequest) {
            settings.ajax_beforeSend(XMLHttpRequest);
          },
          success: function success(response) {
            driveDomForSuccessAfter(response);
            settings.ajax_success(response);
          },
          error: function error(XMLHttpRequest, textStatus, errorThrown) {
            settings.ajax_error(XMLHttpRequest, textStatus, errorThrown);
          },
          complete: function complete(XMLHttpRequest, textStatus) {
            settings.ajax_complete(XMLHttpRequest, textStatus);
            removeRefreshingClass();
            _Base2.default.hideLoading(tableWrap);
          }
        });

        // 移除刷新中样式
        function removeRefreshingClass() {
          window.setTimeout(function () {
            refreshAction.removeClass('refreshing');
          }, 2000);
        }

        // 执行ajax成功后重新渲染DOM
        function driveDomForSuccessAfter(response) {
          if (!response) {
            _Base2.default.outLog('请求数据失败！请查看配置参数[ajax_url或ajax_data]是否配置正确，并查看通过该地址返回的数据格式是否正确', 'error');
            return;
          }

          var tbodyTmpHTML = ''; // 用于拼接tbody的HTML结构
          var parseRes = typeof response === 'string' ? JSON.parse(response) : response;

          // 执行请求后执行程序, 通过该程序可以修改返回值格式
          settings.responseHandler(parseRes);

          var _dataList = parseRes[settings.resultKey][settings.dataKey];
          var key = void 0,
            // 操作列
            gmActionAttr = void 0,
            // 数据索引
            alignAttr = void 0,
            // 文本对齐属性
            template = void 0,
            // 数据模板
            templateHTML = void 0; // 数据模板导出的html
          // 数据为空时
          if (!_dataList || _dataList.length === 0) {
            tbodyTmpHTML = '<tr emptyTemplate>' + '<td colspan="' + (0, _jTool2.default)('th[th-visible="visible"]', $table).length + '">' + (settings.emptyTemplate || '<div class="gm-emptyTemplate">数据为空</div>') + '</td>' + '</tr>';
            parseRes[settings.resultKey][settings.totalsKey] = 0;
            tbodyDOM.html(tbodyTmpHTML);
          } else {
            _jTool2.default.each(_dataList, function (i, v) {
              _Cache2.default.setRowData(gmName, i, v);
              tbodyTmpHTML += '<tr cache-key="' + i + '">';
              _jTool2.default.each(settings.columnData, function (i2, v2) {
                if (v2.visible !== false) {
                  key = v2.key;
                  v[key] = v[key] === null ? '' : v[key];
                  template = v2.template;
                  templateHTML = typeof template === 'function' ? template(v[key], v) : v[key];
                  gmActionAttr = key === 'action' ? 'gm-action="true"' : '';
                  alignAttr = v2.align ? 'align="' + v2.align + '"' : '';
                  if (settings.disabledKey && !v[settings.disabledKey]) {
                    tbodyTmpHTML += '<td ' + gmActionAttr + ' gm-create="false" gm-disabled="true" ' + alignAttr + '>' + templateHTML + '</td>';
                  } else {
                    tbodyTmpHTML += '<td ' + gmActionAttr + ' gm-create="false" ' + alignAttr + '>' + templateHTML + '</td>';
                  }
                }
              });
              tbodyTmpHTML += '</tr>';
            });
            tbodyDOM.html(tbodyTmpHTML);
            Core.resetTd($table, false);
          }
          // 渲染分页
          if (settings.supportAjaxPage) {
            _AjaxPage2.default.resetPageData($table, parseRes[settings.resultKey][settings.totalsKey]);
            _Menu2.default.checkMenuPageAction($table);
          }
          typeof callback === 'function' ? callback() : '';

          // 生成固定列table
          function createFixedTable() {
            var $tableWrapDom = $('.table-wrap');
            var $tableDivDom = $('.table-div');
            var $tableMainDom = $('.table-div table.GridManager-main');
            if (window.$utils.hasScroll($tableDivDom).scrollX) {
              var rowsNums = $tableMainDom.find('tbody tr').length;
              if (settings.isFixedLeft && (settings.supportCheckbox || settings.supportAutoOrder)) {
                var $tableLeftDom = $('<table grid-manager class="table-fixed-left GridManager-ready" cellspacing="1" cellpadding="0"></table>');
                var $leftTHead = $('<thead grid-manager-thead=""></thead>');
                var $leftTHeadTr = createCopyDomWithoutInner($tableMainDom.find('thead tr'));
                var $leftTBody = $('<tbody></tbody>');
                var $leftTBodyTr;
                if (settings.supportCheckbox) {
                  var $thCheckbox = $tableMainDom.find('thead tr th[th-name="gm_checkbox"]');
                  var $copyThCheckbox = createCopyDom($thCheckbox, true);
                  $leftTHeadTr.append($copyThCheckbox);
                  $leftTHeadTr.css('height', $thCheckbox.outerHeight());
                }
                if (settings.supportAutoOrder) {
                  var $thOrder = $tableMainDom.find('thead tr th[th-name="gm_order"]');
                  var $copyThOrder = createCopyDom($thOrder, true);
                  $leftTHeadTr.append($copyThOrder);
                  $leftTHeadTr.css('height', $thOrder.outerHeight());
                }
                $leftTHead.append($leftTHeadTr);

                for (var i = 0; i < rowsNums; i++) {
                  $leftTBodyTr = createCopyDomWithoutInner($tableMainDom.find('tbody tr').eq(i));
                  if (settings.supportCheckbox) {
                    var $tdCheckbox = $tableMainDom.find('tbody tr td[gm-checkbox="true"]').eq(i);
                    var $copyTdCheckbox = createCopyDom($tdCheckbox);
                    $leftTBodyTr.append($copyTdCheckbox);
                  }
                  if (settings.supportAutoOrder) {
                    var $tdOrder = $tableMainDom.find('tbody tr td[gm-order="true"]').eq(i);
                    var $copyTdOrder = createCopyDom($tdOrder);
                    $leftTBodyTr.append($copyTdOrder);
                  }
                  $leftTBody.append($leftTBodyTr);
                }

                $tableLeftDom.append($leftTHead);
                $tableLeftDom.append($leftTBody);
              }

              if (settings.isFixedRight) {
                var $tableRightDom = $('<table grid-manager class="table-fixed-right GridManager-ready" cellspacing="1" cellpadding="0"></table>');
                var $rightTHead = $('<thead grid-manager-thead=""></thead>');
                var $rightTHeadTr = createCopyDomWithoutInner($tableMainDom.find('thead tr'));
                var $rightTBody = $('<tbody></tbody>');
                var $rightTBodyTr;
                var hasActionRow = !!$tableMainDom.find('thead tr th[th-name="action"]').length;
                if (hasActionRow) {
                  var $thAction = $tableMainDom.find('thead tr th[th-name="action"]');
                  var $copyThAction = createCopyDom($thAction, true);
                  $rightTHeadTr.append($copyThAction);
                  $rightTHeadTr.css('height', $thAction.outerHeight());
                }
                $rightTHead.append($rightTHeadTr);

                for (var j = 0; j < rowsNums; j++) {
                  $rightTBodyTr = createCopyDomWithoutInner($tableMainDom.find('tbody tr').eq(j));
                  if (hasActionRow) {
                    var $tdAction = $tableMainDom.find('tbody tr td[gm-action="true"]').eq(j);
                    var $copyTdAction = createCopyDom($tdAction);
                    $rightTBodyTr.append($copyTdAction);
                  }
                  $rightTBody.append($rightTBodyTr);
                }

                $tableRightDom.append($rightTHead);
                $tableRightDom.append($rightTBody);
              }
            } else {
              $('table.table-fixed-left').remove();
              $('table.table-fixed-right').remove();
            }

            if ($tableLeftDom) {
              $('table.table-fixed-left').remove();
              $tableWrapDom.prepend($tableLeftDom);
            }
            if ($tableRightDom) {
              // var scrollAreaX = window.$utils.getScrollAreaWidth($tableDivDom).x;
              // $tableRightDom.css('right', -scrollAreaX + 'px');
              $('table.table-fixed-right').remove();
              $tableWrapDom.append($tableRightDom);
            }

            function createCopyDomWithoutInner(srcDom) {
              return srcDom.clone().empty();
            }

            // 创建表格项复制Dom
            function createCopyDom(srcDom, isTh) {
              var $copyDom = srcDom.clone();
              $copyDom.css('width', srcDom.outerWidth());
              if (!isTh) {
                $copyDom.css('height', srcDom.outerHeight());
              }
              return $copyDom;
            }
          }
          createFixedTable();

          $(window).resize(function () {
            createFixedTable();
          });
        }
      },
      /*
       * 渲染HTML，根据配置嵌入所需的事件源DOM
       * $table: table[jTool对象]
       * */

      createDOM: function createDOM($table) {
        var settings = _Cache2.default.getSettings($table);
        $table.attr('width', '100%').attr('cellspacing', 1).attr('cellpadding', 0).attr('grid-manager', settings.gridManagerName);
        var theadHtml = '<thead grid-manager-thead>',
          tbodyHtml = '<tbody></tbody>',
          alignAttr = '',
          // 文本对齐属性
          widthHtml = '',
          // 宽度对应的html片段
          minWidthHtml = '',
          // 最小宽度对应的html片段
          remindHtml = '',
          // 提醒对应的html片段
          sortingHtml = ''; // 排序对应的html片段
        // 通过配置项[columnData]生成thead
        _jTool2.default.each(settings.columnData, function (i, v) {
          if (v.visible !== false) {
            // 表头提醒
            if (settings.supportRemind && typeof v.remind === 'string' && v.remind !== '') {
              remindHtml = 'remind="' + v.remind + '"';
            }
            // 排序
            sortingHtml = '';
            if (settings.supportSorting && typeof v.sorting === 'string') {
              if (v.sorting === settings.sortDownText) {
                sortingHtml = 'sorting="' + settings.sortDownText + '"';
                settings.sortData[v.key] = settings.sortDownText;
                _Cache2.default.updateSettings($table, settings);
              } else if (v.sorting === settings.sortUpText) {
                sortingHtml = 'sorting="' + settings.sortUpText + '"';
                settings.sortData[v.key] = settings.sortUpText;
                _Cache2.default.updateSettings($table, settings);
              } else {
                sortingHtml = 'sorting=""';
              }
            }
            if (v.width) {
              widthHtml = 'width="' + v.width + '"';
            } else {
              widthHtml = '';
            }
            if (v.minWidth) {
              minWidthHtml = 'min-width="' + v.minWidth + '"';
            } else {
              minWidthHtml = '';
            }
            alignAttr = v.align ? 'align="' + v.align + '"' : '';
            theadHtml += '<th gm-create="false" th-name="' + v.key + '" ' + remindHtml + ' ' + sortingHtml + ' ' + widthHtml + ' ' + minWidthHtml + ' ' + alignAttr + '>' + v.text + '</th>';
          }
        });
        theadHtml += '</thead>';
        $table.html(theadHtml + tbodyHtml);
        // 嵌入序号DOM
        if (settings.supportAutoOrder) {
          _Order2.default.initDOM($table);
        }
        // 嵌入选择返选DOM
        if (settings.supportCheckbox) {
          _Checkbox2.default.initCheckbox($table);
        }
        // 存储原始th DOM
        _Cache2.default.setOriginalThDOM($table);

        // 表头提醒HTML
        var _remindHtml = _Remind2.default.html();

        // 配置列表HTML
        var _configHtml = _Config2.default.html();

        // 宽度调整HTML
        var _adjustHtml = _Adjust2.default.html();

        // 排序HTML
        var _sortingHtml = _Sort2.default.html();

        // 导出表格数据所需的事件源DOM
        var exportActionHtml = _Export2.default.html();
        // AJAX分页HTML
        var _ajaxPageHtml = _AjaxPage2.default.html($table);
        var wrapHtml = void 0,
          // 外围的html片段
          tableWarp = void 0,
          // 单个table所在的DIV容器
          onlyThead = void 0,
          // 单个table下的thead
          onlyThList = void 0,
          // 单个table下的TH
          onlyTH = void 0,
          // 单个TH
          onlyThWarp = void 0,
          // 单个TH下的上层DIV
          remindDOM = void 0,
          // 表头提醒DOM
          adjustDOM = void 0,
          // 调整宽度DOM
          sortingDom = void 0,
          // 排序DOM
          sortType = void 0,
          // 排序类形
          isLmOrder = void 0,
          // 是否为插件自动生成的序号列
          isLmCheckbox = void 0, // 是否为插件自动生成的选择列
          isLmAction = void 0; // 是否为操作选择列

        onlyThead = (0, _jTool2.default)('thead[grid-manager-thead]', $table);
        onlyThList = (0, _jTool2.default)('th', onlyThead);
        wrapHtml = '<div class="grid-manager table-wrap"><div class="table-div" style="height:calc(' + settings.height + ' - 40px)"></div><span class="text-dreamland"></span></div>';
        $table.wrap(wrapHtml);
        tableWarp = $table.closest('.table-wrap');
        // 配置文本对齐方式
        if (settings.textAlign) {
          tableWarp.attr('gm-text-align', settings.textAlign);
        }
        // 嵌入配置列表DOM
        if (settings.supportConfig) {
          tableWarp.append(_configHtml);
        }
        // 嵌入Ajax分页DOM
        if (settings.supportAjaxPage) {
          tableWarp.append(_ajaxPageHtml);
          _AjaxPage2.default.initAjaxPage($table);
        }
        // 嵌入导出表格数据事件源
        if (settings.supportExport) {
          tableWarp.append(exportActionHtml);
        }
        var configList = (0, _jTool2.default)('.config-list', tableWarp);
        var onlyWidth = void 0;
        onlyThWarp = (0, _jTool2.default)('<div class="th-wrap"></div>');
        _jTool2.default.each(onlyThList, function (i2, v2) {
          onlyTH = (0, _jTool2.default)(v2);
          onlyTH.attr('th-visible', 'visible');
          // 是否为自动生成的序号列
          if (settings.supportAutoOrder && onlyTH.attr('gm-order') === 'true') {
            isLmOrder = true;
          } else {
            isLmOrder = false;
          }
          // 是否为自动生成的选择列
          if (settings.supportCheckbox && onlyTH.attr('gm-checkbox') === 'true') {
            isLmCheckbox = true;
          } else {
            isLmCheckbox = false;
          }
          // 是否为操作选择列
          if (onlyTH.attr('th-name') === 'action') {
            isLmAction = true;
          } else {
            isLmAction = false;
          }

          // 嵌入配置列表项
          if (settings.supportConfig) {
            configList.append('<li th-name="' + onlyTH.attr('th-name') + '" class="checked-li">' + '<input type="checkbox" checked="checked"/>' + '<label>' + '<span class="fake-checkbox"></span>' + onlyTH.text() + '</label>' + '</li>');
          }
          // 嵌入拖拽事件源
          // 插件自动生成的排序与选择列不做事件绑定
          if (settings.supportDrag && !isLmOrder && !isLmCheckbox && !isLmAction) {
            onlyThWarp.html('<span class="th-text drag-action">' + onlyTH.html() + '</span>');
          } else {
            onlyThWarp.html('<span class="th-text">' + onlyTH.html() + '</span>');
          }
          var onlyThWarpPaddingTop = onlyThWarp.css('padding-top');
          // 嵌入表头提醒事件源
          // 插件自动生成的排序与选择列不做事件绑定
          if (settings.supportRemind && onlyTH.attr('remind') !== undefined && !isLmOrder && !isLmCheckbox) {
            remindDOM = (0, _jTool2.default)(_remindHtml);
            remindDOM.find('.ra-title').text(onlyTH.text());
            remindDOM.find('.ra-con').text(onlyTH.attr('remind') || onlyTH.text());
            if (onlyThWarpPaddingTop !== '' && onlyThWarpPaddingTop !== '0px') {
              remindDOM.css('top', onlyThWarpPaddingTop);
            }
            onlyThWarp.append(remindDOM);
          }
          // 嵌入排序事件源
          // 插件自动生成的排序与选择列不做事件绑定
          sortType = onlyTH.attr('sorting');
          if (settings.supportSorting && sortType !== undefined && !isLmOrder && !isLmCheckbox) {
            sortingDom = (0, _jTool2.default)(_sortingHtml);
            // 依据 sortType 进行初始显示
            switch (sortType) {
              case settings.sortUpText:
                sortingDom.addClass('sorting-up');
                break;
              case settings.sortDownText:
                sortingDom.addClass('sorting-down');
                break;
              default:
                break;
            }
            if (onlyThWarpPaddingTop !== '' && onlyThWarpPaddingTop !== '0px') {
              sortingDom.css('top', onlyThWarpPaddingTop);
            }
            onlyThWarp.append(sortingDom);
          }
          // 嵌入宽度调整事件源,插件自动生成的选择列不做事件绑定
          if (settings.supportAdjust && !isLmOrder && !isLmCheckbox) {
            adjustDOM = (0, _jTool2.default)(_adjustHtml);
            // 最后一列不支持调整宽度
            if (i2 === onlyThList.length - 1) {
              adjustDOM.hide();
            }
            onlyThWarp.append(adjustDOM);
          }
          onlyTH.html(onlyThWarp);

          // 宽度配置: 非GM自动创建的列
          var definedMinWidth = onlyTH.attr('min-width') ? +onlyTH.attr('min-width').replace(/px/, '') : 0;
          if (!isLmOrder && !isLmCheckbox) {
            var _minWidth = definedMinWidth || _Base2.default.getTextWidth(onlyTH); // 当前th文本所占宽度大于设置的宽度
            var _oldWidth = onlyTH.width();
            onlyWidth = _oldWidth > _minWidth ? _oldWidth : _minWidth;
          }

          // 清除width属性, 使用style.width进行宽度控制
          onlyTH.removeAttr('width');
          onlyTH.width(onlyWidth);
          console.log(onlyWidth);
          // 清除min-width属性, 使用style.minWidth进行最小宽度控制
          onlyTH.removeAttr('min-width');
          onlyTH.css('min-width', _minWidth);
        });

        // 删除渲染中标识、增加渲染完成标识
        $table.removeClass('GridManager-loading');
        $table.addClass('GridManager-ready');
        $table.addClass('GridManager-main');
      },
      /*
       * 重置列表, 处理局部刷新、分页事件之后的td排序
       * dom: table 或者 tr
       * isSingleRow: 指定DOM节点是否为tr[布尔值]
       * */

      resetTd: function resetTd(dom, isSingleRow) {
        var _table = null,
          _tr = null;
        if (isSingleRow) {
          _tr = (0, _jTool2.default)(dom);
          _table = _tr.closest('table');
        } else {
          _table = (0, _jTool2.default)(dom);
          _tr = _table.find('tbody tr');
        }
        if (!_tr || _tr.length === 0) {
          return false;
        }
        var settings = _Cache2.default.getSettings(_table);
        // 重置表格序号
        if (settings.supportAutoOrder) {
          var _pageData = settings.pageData;
          var onlyOrderTd = null,
            _orderBaseNumber = 1,
            _orderText = void 0;
          // 验证是否存在分页数据
          if (_pageData && _pageData['pSize'] && _pageData['cPage']) {
            _orderBaseNumber = _pageData.pSize * (_pageData.cPage - 1) + 1;
          }
          _jTool2.default.each(_tr, function (i, v) {
            _orderText = _orderBaseNumber + i;
            onlyOrderTd = (0, _jTool2.default)('td[gm-order="true"]', v);
            if (onlyOrderTd.length === 0) {
              if (v.cells && v.cells.length && (0, _jTool2.default)(v.cells[0]).attr('gm-disabled') === 'true') {
                (0, _jTool2.default)(v).prepend('<td gm-order="true" gm-create="true" gm-disabled="true">' + _orderText + '</td>');
              } else {
                (0, _jTool2.default)(v).prepend('<td gm-order="true" gm-create="true">' + _orderText + '</td>');
              }
            } else {
              onlyOrderTd.text(_orderText);
            }
          });
        }
        // 重置表格选择 checkbox
        if (settings.supportCheckbox) {
          var onlyCheckTd = null;
          _jTool2.default.each(_tr, function (i, v) {
            onlyCheckTd = (0, _jTool2.default)('td[gm-checkbox="true"]', v);
            if (onlyCheckTd.length === 0) {
              (0, _jTool2.default)(v).prepend('<td gm-checkbox="true" gm-create="true">\n\t\t\t\t\t\t\t\t<div class="b-opt no-label">\n\t\t\t\t\t\t\t\t<input class="b-checkbox" type="checkbox" id="checkbox' + i + '"/>\n\t\t\t\t\t\t\t\t<label for="checkbox' + i + '"></label>\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t</td>');
            } else {
              (0, _jTool2.default)('[type="checkbox"]', onlyCheckTd).prop('checked', false);
            }
          });
        }
        // 依据存储数据重置td顺序
        if (settings.supportDrag) {
          var _thCacheList = _Cache2.default.getOriginalThDOM(_table);
          var _td = null;
          if (!_thCacheList || _thCacheList.length === 0) {
            _Base2.default.outLog('resetTdForCache:列位置重置所必须的原TH DOM获取失败', 'error');
            return false;
          }
          var _tdArray = [];
          _jTool2.default.each(_tr, function (i, v) {
            _tdArray = [];
            _td = (0, _jTool2.default)('td', v);
            _jTool2.default.each(_td, function (i2, v2) {
              _tdArray[_thCacheList.eq(i2).index()] = v2.outerHTML;
            });
            v.innerHTML = _tdArray.join('');
          });
        }
        // 依据配置对列表进行隐藏、显示
        if (settings.supportConfig) {
          _Base2.default.initVisible(_table);
        }
      }
    };
    exports.default = Core;

    /***/
  },
  /* 8 */
  /***/
  function (module, exports, __webpack_require__) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
      value: true
    });

    var _jTool = __webpack_require__(1);

    var _jTool2 = _interopRequireDefault(_jTool);

    var _Cache = __webpack_require__(4);

    var _Cache2 = _interopRequireDefault(_Cache);

    var _I18n = __webpack_require__(9);

    var _I18n2 = _interopRequireDefault(_I18n);

    var _Export = __webpack_require__(10);

    var _Export2 = _interopRequireDefault(_Export);

    var _AjaxPage = __webpack_require__(6);

    var _AjaxPage2 = _interopRequireDefault(_AjaxPage);

    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : {
        default: obj
      };
    }

    var Menu = {
      /*
      @验证菜单区域: 禁用、开启分页操作
      */
      checkMenuPageAction: function checkMenuPageAction(table) {
        var Settings = _Cache2.default.getSettings(table);
        // 右键菜单区上下页限制
        var gridMenu = (0, _jTool2.default)('.grid-menu[grid-master="' + Settings.gridManagerName + '"]');
        if (!gridMenu || gridMenu.length === 0) {
          return;
        }
        var previousPage = (0, _jTool2.default)('[refresh-type="previous"]', gridMenu),
          nextPage = (0, _jTool2.default)('[refresh-type="next"]', gridMenu);
        if (Settings.pageData.cPage === 1 || Settings.pageData.tPage === 0) {
          previousPage.addClass('disabled');
        } else {
          previousPage.removeClass('disabled');
        }
        if (Settings.pageData.cPage === Settings.pageData.tPage || Settings.pageData.tPage === 0) {
          nextPage.addClass('disabled');
        } else {
          nextPage.removeClass('disabled');
        }
      },
      /*
      @绑定右键菜单事件
       $table: table[jTool Object]
      */

      bindRightMenuEvent: function bindRightMenuEvent($table) {
        var Settings = _Cache2.default.getSettings($table);
        var tableWarp = $table.closest('.table-wrap'),
          tbody = (0, _jTool2.default)('tbody', tableWarp);
        // 刷新当前表格
        var menuHTML = '<div class="grid-menu" grid-master="' + Settings.gridManagerName + '">';
        // 分页类操作
        if (Settings.supportAjaxPage) {
          menuHTML += '<span grid-action="refresh-page" refresh-type="previous">\n\t\t\t\t\t\t\t' + _I18n2.default.i18nText($table, 'previous-page') + '\n\t\t\t\t\t\t\t<i class="iconfont icon-sanjiao2"></i>\n\t\t\t\t\t\t</span>\n\t\t\t\t\t\t<span grid-action="refresh-page" refresh-type="next">\n\t\t\t\t\t\t\t' + _I18n2.default.i18nText($table, 'next-page') + '\n\t\t\t\t\t\t\t<i class="iconfont icon-sanjiao1"></i>\n\t\t\t\t\t\t</span>';
        }
        menuHTML += '<span grid-action="refresh-page" refresh-type="refresh">\n\t\t\t\t\t\t' + _I18n2.default.i18nText($table, 'refresh') + '\n\t\t\t\t\t\t<i class="iconfont icon-31shuaxin"></i>\n\t\t\t\t\t</span>';
        menuHTML += '<span grid-action="refresh-page" refresh-type="reset">\n\t\t\t\t\t\t' + _I18n2.default.i18nText($table, 'reset-default-settings') + '\n\t\t\t\t\t\t<i class="iconfont icon-reset"></i>\n\t\t\t\t\t</span>';
        // 导出类
        if (Settings.supportExport) {
          menuHTML += '<span class="grid-line"></span>\n\t\t\t\t\t\t<span grid-action="export-excel" only-checked="false">\n\t\t\t\t\t\t\t' + _I18n2.default.i18nText($table, 'save-as-excel') + '\n\t\t\t\t\t\t\t<i class="iconfont icon-baocun"></i>\n\t\t\t\t\t\t</span>\n\t\t\t\t\t\t<span grid-action="export-excel" only-checked="true">\n\t\t\t\t\t\t\t' + _I18n2.default.i18nText($table, 'save-as-excel-for-checked') + '\n\t\t\t\t\t\t\t<i class="iconfont icon-saveas24"></i>\n\t\t\t\t\t\t</span>';
        }
        // 配置类
        if (Settings.supportConfig) {
          menuHTML += '<span class="grid-line"></span>\n\t\t\t\t\t\t<span grid-action="setting-grid">\n\t\t\t\t\t\t\t' + _I18n2.default.i18nText($table, 'setting-grid') + '\n\t\t\t\t\t\t\t<i class="iconfont icon-shezhi"></i>\n\t\t\t\t\t\t</span>';
        }
        menuHTML += '</div>';
        var _body = (0, _jTool2.default)('body');
        _body.append(menuHTML);
        // 绑定打开右键菜单栏
        var menuDOM = (0, _jTool2.default)('.grid-menu[grid-master="' + Settings.gridManagerName + '"]');
        tableWarp.unbind('contextmenu');
        tableWarp.bind('contextmenu', function (e) {
          e.preventDefault();
          e.stopPropagation();
          // 验证：如果不是tbdoy或者是tbody的子元素，直接跳出
          if (e.target.nodeName !== 'TBODY' && (0, _jTool2.default)(e.target).closest('tbody').length === 0) {
            return;
          }
          // 验证：当前是否存在已选中的项
          var exportExcelOfChecked = (0, _jTool2.default)('[grid-action="export-excel"][only-checked="true"]');
          if ((0, _jTool2.default)('tbody tr[checked="true"]', (0, _jTool2.default)('table[grid-manager="' + Settings.gridManagerName + '"]')).length === 0) {
            exportExcelOfChecked.addClass('disabled');
          } else {
            exportExcelOfChecked.removeClass('disabled');
          }
          var menuWidth = menuDOM.width(),
            menuHeight = menuDOM.height(),
            offsetHeight = document.documentElement.offsetHeight,
            offsetWidth = document.documentElement.offsetWidth;
          var top = offsetHeight < e.clientY + menuHeight ? e.clientY - menuHeight : e.clientY;
          var left = offsetWidth < e.clientX + menuWidth ? e.clientX - menuWidth : e.clientX;
          menuDOM.css({
            'top': top + tableWarp.get(0).scrollTop + (document.body.scrollTop || document.documentElement.scrollTop),
            'left': left + tableWarp.get(0).scrollLeft + (document.body.scrollLeft || document.documentElement.scrollLeft)
          });
          // 隐藏非当前展示表格的菜单项
          (0, _jTool2.default)('.grid-menu[grid-master]').hide();
          menuDOM.show();
          _body.off('mousedown.gridMenu');
          _body.on('mousedown.gridMenu', function (e) {
            var eventSource = (0, _jTool2.default)(e.target);
            if (eventSource.hasClass('.grid-menu') || eventSource.closest('.grid-menu').length === 1) {
              return;
            }
            _body.off('mousedown.gridMenu');
            menuDOM.hide();
          });
        });

        // 绑定事件：上一页、下一页、重新加载
        var refreshPage = (0, _jTool2.default)('[grid-action="refresh-page"]');
        refreshPage.unbind('click');
        refreshPage.bind('click', function (e) {
          if (isDisabled(this, e)) {
            return false;
          }
          var _gridMenu = (0, _jTool2.default)(this).closest('.grid-menu');
          var _table = (0, _jTool2.default)('table[grid-manager="' + _gridMenu.attr('grid-master') + '"]');
          var refreshType = this.getAttribute('refresh-type');
          var Settings = _Cache2.default.getSettings(_table);
          var cPage = Settings.pageData.cPage;
          // 上一页
          if (refreshType === 'previous' && Settings.pageData.cPage > 1) {
            cPage = Settings.pageData.cPage - 1;
          }
          // 下一页
          else if (refreshType === 'next' && Settings.pageData.cPage < Settings.pageData.tPage) {
            cPage = Settings.pageData.cPage + 1;
          }
          // 重新加载
          else if (refreshType === 'refresh') {
            cPage = Settings.pageData.cPage;
          } else if (refreshType === 'reset') {
            _Cache2.default.cleanTableCache(_table, '用户执行恢复默认设置操作');
            location.reload();
          }
          _AjaxPage2.default.gotoPage(_table, cPage);
          _body.off('mousedown.gridMenu');
          _gridMenu.hide();
        });
        // 绑定事件：另存为EXCEL、已选中表格另存为Excel
        var exportExcel = (0, _jTool2.default)('[grid-action="export-excel"]');
        exportExcel.unbind('click');
        exportExcel.bind('click', function (e) {
          if (isDisabled(this, e)) {
            return false;
          }
          var _gridMenu = (0, _jTool2.default)(this).closest('.grid-menu'),
            _table = (0, _jTool2.default)('table[grid-manager="' + _gridMenu.attr('grid-master') + '"]');
          var onlyChecked = false;
          if (this.getAttribute('only-checked') === 'true') {
            onlyChecked = true;
          }
          _Export2.default.__exportGridToXls(_table, undefined, onlyChecked);
          _body.off('mousedown.gridMenu');
          _gridMenu.hide();
        });
        // 绑定事件：配置表
        var settingGrid = (0, _jTool2.default)('[grid-action="setting-grid"]');
        settingGrid.unbind('click');
        settingGrid.bind('click', function (e) {
          if (isDisabled(this, e)) {
            return false;
          }
          var _gridMenu = (0, _jTool2.default)(this).closest('.grid-menu'),
            _table = (0, _jTool2.default)('table[grid-manager="' + _gridMenu.attr('grid-master') + '"]');
          var configArea = (0, _jTool2.default)('.config-area', _table.closest('.table-wrap'));
          (0, _jTool2.default)('.config-action', configArea).trigger('click');
          _body.off('mousedown.gridMenu');
          _gridMenu.hide();
        });
        // 验证当前是否禁用
        function isDisabled(dom, events) {
          if ((0, _jTool2.default)(dom).hasClass('disabled')) {
            events.stopPropagation();
            events.preventDefault();
            return true;
          } else {
            return false;
          }
        }
      }
    };
    /*
     * GridManager: 右键菜单
     * */
    exports.default = Menu;

    /***/
  },
  /* 9 */
  /***/
  function (module, exports, __webpack_require__) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
      value: true
    });

    var _typeof = typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol' ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && typeof Symbol === 'function' && obj.constructor === Symbol && obj !== Symbol.prototype ? 'symbol' : typeof obj;
    };
    /*
     * I18n: 国际化
     * */

    var _Base = __webpack_require__(5);

    var _Base2 = _interopRequireDefault(_Base);

    var _Cache = __webpack_require__(4);

    var _Cache2 = _interopRequireDefault(_Cache);

    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : {
        default: obj
      };
    }

    var I18n = {
      // 选择使用哪种语言，暂时支持[zh-cn:简体中文，en-us:美式英语] 默认zh-cn
      getLanguage: function getLanguage($table) {
        return _Cache2.default.getSettings($table).i18n;
      },
      // 指定[表格 键值 语言]获取对应文本

      getText: function getText($table, key, language) {
        return _Cache2.default.getSettings($table).textConfig[key][language] || '';
      },
      /*
       * @获取与当前配置国际化匹配的文本
       *  $table: table [jTool Object]
       *  key: 指向的文本索引
       *  v1,v2,v3:可为空，也存在一至3项，只存在一项时可为数组
       * */

      i18nText: function i18nText($table, key, v1, v2, v3) {
        var _this = this;
        var intrusion = [];
        // 处理参数，实现多态化
        if (arguments.length === 3 && _typeof(arguments[2]) === 'object') {
          intrusion = arguments[2];
        } else if (arguments.length > 1) {
          for (var i = 1; i < arguments.length; i++) {
            intrusion.push(arguments[i]);
          }
        }
        var _text = '';
        try {
          _text = _this.getText($table, key, _this.getLanguage($table));
          if (!intrusion || intrusion.length === 0) {
            return _text;
          }
          _text = _text.replace(/{\d+}/g, function (word) {
            return intrusion[word.match(/\d+/)];
          });
          return _text;
        } catch (e) {
          _Base2.default.outLog('未找到与' + key + '相匹配的' + _this.getLanguage($table) + '语言', 'warn');
          return '';
        }
      }
    };
    exports.default = I18n;

    /***/
  },
  /* 10 */
  /***/
  function (module, exports, __webpack_require__) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
      value: true
    });

    var _jTool = __webpack_require__(1);

    var _jTool2 = _interopRequireDefault(_jTool);

    var _Core = __webpack_require__(7);

    var _Core2 = _interopRequireDefault(_Core);

    var _Cache = __webpack_require__(4);

    var _Cache2 = _interopRequireDefault(_Cache);

    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : {
        default: obj
      };
    }

    var Export = {
      html: function html() {
        var html = '<a href="" download="" id="gm-export-action"></a>';
        return html;
      },
      /*
       * 导出表格 .xls
       * @param $table:当前操作的grid,由插件自动传入
       * @param fileName: 导出后的文件名
       * @param onlyChecked: 是否只导出已选中的表格
       * */

      __exportGridToXls: function __exportGridToXls($table, fileName, onlyChecked) {
        var Settings = _Cache2.default.getSettings($table);
        var gmExportAction = (0, _jTool2.default)('#gm-export-action'); // createDOM内添加
        if (gmExportAction.length === 0) {
          _Core2.default.outLog('导出失败，请查看配置项:supportExport是否配置正确', 'error');
          return false;
        }
        // type base64
        var uri = 'data:application/vnd.ms-excel;base64,';

        // 存储导出的thead数据
        var theadHTML = '';
        // 存储导出的tbody下的数据
        var tbodyHTML = '';

        var thDOM = (0, _jTool2.default)('thead[grid-manager-thead] th[th-visible="visible"][gm-create="false"]', $table);

        var trDOM = void 0,
          tdDOM = void 0;
        // 验证：是否只导出已选中的表格
        if (onlyChecked) {
          trDOM = (0, _jTool2.default)('tbody tr[checked="true"]', $table);
        } else {
          trDOM = (0, _jTool2.default)('tbody tr', $table);
        }
        _jTool2.default.each(thDOM, function (i, v) {
          theadHTML += '<th>' + v.getElementsByClassName('th-text')[0].textContent + '</th>';
        });
        _jTool2.default.each(trDOM, function (i, v) {
          tdDOM = (0, _jTool2.default)('td[gm-create="false"][td-visible="visible"]', v);
          tbodyHTML += '<tr>';
          _jTool2.default.each(tdDOM, function (i2, v2) {
            tbodyHTML += v2.outerHTML;
          });
          tbodyHTML += '</tr>';
        });
        // 拼接要导出html格式数据
        var exportHTML = '\n\t\t\t<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">\n\t\t\t\t<head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head>\n\t\t\t\t<body>\n\t\t\t\t\t<table>\n\t\t\t\t\t\t<thead>\'\n\t\t\t\t\t\t\t' + theadHTML + '\n\t\t\t\t\t\t</thead>\n\t\t\t\t\t\t<tbody>\n\t\t\t\t\t\t\t' + tbodyHTML + '\n\t\t\t\t\t\t</tbody>\n\t\t\t\t\t</table>\n\t\t\t\t</body>\n\t\t\t</html>';
        gmExportAction.prop('href', uri + base64(exportHTML));
        gmExportAction.prop('download', (fileName || Settings.gridManagerName) + '.xls');
        gmExportAction.get(0).click();

        function base64(s) {
          return window.btoa(unescape(encodeURIComponent(s)));
        }

        // 成功后返回true
        return true;
      }
    };
    /*
     * Export: 数据导出
     * */
    exports.default = Export;

    /***/
  },
  /* 11 */
  /***/
  function (module, exports, __webpack_require__) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
      value: true
    });

    var _jTool = __webpack_require__(1);

    var _jTool2 = _interopRequireDefault(_jTool);

    var _Base = __webpack_require__(5);

    var _Base2 = _interopRequireDefault(_Base);

    var _Cache = __webpack_require__(4);

    var _Cache2 = _interopRequireDefault(_Cache);

    var _Adjust = __webpack_require__(3);

    var _Adjust2 = _interopRequireDefault(_Adjust);

    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : {
        default: obj
      };
    }

    /*
     * Config: th配置
     * */
    var Config = {
      html: function html() {
        var html = '<div class="config-area">\n\t\t\t\t\t\t<span class="config-action">\n\t\t\t\t\t\t\t<i class="iconfont icon-31xingdongdian"></i>\n\t\t\t\t\t\t</span>\n\t\t\t\t\t\t<ul class="config-list"></ul>\n\t\t\t\t\t</div>';
        return html;
      },
      /*
       * 绑定配置列表事件[隐藏展示列]
       * $table: table [jTool object]
       * */

      bindConfigEvent: function bindConfigEvent($table) {
        var Settings = _Cache2.default.getSettings($table);
        // GM容器
        var tableWarp = $table.closest('div.table-wrap');
        // 打开/关闭设置事件源
        var configAction = (0, _jTool2.default)('.config-action', tableWarp);
        configAction.unbind('click');
        configAction.bind('click', function () {
          // 展示事件源
          var _configAction = (0, _jTool2.default)(this);

          // 设置区域
          var _configArea = _configAction.closest('.config-area');

          // 关闭
          if (_configArea.css('display') === 'block') {
            _configArea.hide();
            return false;
          }
          // 打开
          _configArea.show();

          // 验证当前是否只有一列处于显示状态 并根据结果进行设置是否可以取消显示
          var checkedLi = (0, _jTool2.default)('.checked-li', _configArea);
          checkedLi.length === 1 ? checkedLi.addClass('no-click') : checkedLi.removeClass('no-click');
        });
        // 设置事件
        (0, _jTool2.default)('.config-list li', tableWarp).unbind('click');
        (0, _jTool2.default)('.config-list li', tableWarp).bind('click', function () {
          // 单个的设置项
          var _only = (0, _jTool2.default)(this);

          // 单个设置项的thName
          var _thName = _only.attr('th-name');

          // 事件下的checkbox
          var _checkbox = _only.find('input[type="checkbox"]');

          // 所在的大容器
          var _tableWarp = _only.closest('.table-wrap');

          // 所在的table-div
          var _tableDiv = (0, _jTool2.default)('.table-div', _tableWarp);

          // 所对应的table
          var _table = (0, _jTool2.default)('[grid-manager]', _tableWarp);

          // 所对应的th
          var _th = (0, _jTool2.default)('thead[grid-manager-thead] th[th-name="' + _thName + '"]', _table);

          // 最后一项显示列不允许隐藏
          if (_only.hasClass('no-click')) {
            return false;
          }
          _only.closest('.config-list').find('.no-click').removeClass('no-click');
          var isVisible = !_checkbox.prop('checked');

          // 设置与当前td同列的td是否可见
          _tableDiv.addClass('config-editing');
          _Base2.default.setAreVisible(_th, isVisible, function () {
            _tableDiv.removeClass('config-editing');
          });

          // 当前处于选中状态的展示项
          var _checkedList = (0, _jTool2.default)('.config-area input[type="checkbox"]:checked', _tableWarp);

          // 限制最少显示一列
          if (_checkedList.length == 1) {
            _checkedList.parent().addClass('no-click');
          }

          // 重置调整宽度事件源
          if (Settings.supportAdjust) {
            _Adjust2.default.resetAdjust(_table);
          }

          // 重置镜像滚动条的宽度
          (0, _jTool2.default)('.sa-inner', _tableWarp).width('100%');

          // 重置当前可视th的宽度
          var _visibleTh = (0, _jTool2.default)('thead[grid-manager-thead] th[th-visible="visible"]', _table);
          _jTool2.default.each(_visibleTh, function (i, v) {
            // 特殊处理: GM自动创建的列固定宽度
            if (v.getAttribute('th-name') === 'gm_checkbox') {
              v.style.width = '30px';
            } else if (v.getAttribute('th-name') === 'gm_order') {
              v.style.width = '68px';
            } else {
              v.style.width = 'auto';
            }
          });
          // 当前th文本所占宽度大于设置的宽度
          // 需要在上一个each执行完后才可以获取到准确的值
          _jTool2.default.each(_visibleTh, function (i, v) {
            var _realWidthForThText = _Base2.default.getTextWidth(v),
              _thWidth = (0, _jTool2.default)(v).width();
            if (_thWidth < _realWidthForThText) {
              (0, _jTool2.default)(v).width(_realWidthForThText);
            } else {
              (0, _jTool2.default)(v).width(_thWidth);
            }
          });
          _Cache2.default.saveUserMemory(_table); // 存储用户记忆

          // 处理置顶表头
          var topThead = (0, _jTool2.default)('thead.set-top', _table);
          if (topThead.length === 1) {
            topThead.remove();
            _tableDiv.trigger('scroll');
          }
        });
      }
    };
    exports.default = Config;

    /***/
  },
  /* 12 */
  /***/
  function (module, exports, __webpack_require__) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
      value: true
    });

    var _jTool = __webpack_require__(1);

    var _jTool2 = _interopRequireDefault(_jTool);

    var _I18n = __webpack_require__(9);

    var _I18n2 = _interopRequireDefault(_I18n);

    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : {
        default: obj
      };
    }

    /*
     * Checkbox: 数据选择/全选/返选
     * */
    var Checkbox = {
      /*
       * checkbox 拼接字符串
       * table: table [jTool Object]
       * */
      html: function html($table) {
        var checkboxHtml = '<th th-name="gm_checkbox" gm-checkbox="true" gm-create="true" style="width: 30px;">\n\t\t\t\t\t\t\t\t<div class="b-opt no-label">\n\t\t\t\t\t\t\t\t<input class="b-checkbox" type="checkbox" id="checkboxAll"/>\n\t\t\t\t\t\t\t\t<label for="checkboxAll"></label>\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t<span style="display: none">\n\t\t\t\t\t\t\t\t\t' + _I18n2.default.i18nText($table, 'checkall-text') + '\n\t\t\t\t\t\t\t\t</span>\n\t\t\t\t\t\t\t</th>';
        return checkboxHtml;
      },
      /*
       * 初始化选择与反选DOM
       * table: table [jTool Object]
       * */

      initCheckbox: function initCheckbox($table) {
        // 插入选择DOM
        (0, _jTool2.default)('thead tr', $table).prepend(this.html($table));
      },
      /*
       * 绑定选择框事件
       * table: table [jTool Object]
       * */

      bindCheckboxEvent: function bindCheckboxEvent($table) {
        var $tableWrap = $('.table-wrap');
        var $tableDivDom = $('.table-div');
        $tableWrap.off('click', 'input[type="checkbox"]');
        $tableWrap.on('click', 'input[type="checkbox"]', function (event) {
          event.stopPropagation();
          // 存储th中的checkbox的选中状态
          var _thChecked = true;
          // 全选键事件源
          var _checkAction = $(this);
          // 是否全选判断
          var isAllCheck = _checkAction.closest('th[th-name="gm_checkbox"]').length === 1;

          // 有滚动条时同步选中
          if (event.pageX) {
            if (window.$utils.hasScroll($tableDivDom).scrollX) {
              var checkRowIndex = _checkAction.closest('tr').index();
              var checkRowItemDom;
              // 如果是全选
              if (isAllCheck) {
                checkRowItemDom = $tableDivDom.find('thead tr');
              } else {
                checkRowItemDom = $tableDivDom.find('tbody tr').filter(function (i, v) {
                  return $(v).index() === checkRowIndex;
                });
              }
              checkRowItemDom.find('input[type="checkbox"]').trigger('click');
            }
          }

          // th中的选择框
          var _thCheckbox = $tableWrap.find('thead th[gm-checkbox] input[type="checkbox"]');

          // td中的选择框
          var _tdCheckbox = $tableWrap.find('tbody td[gm-checkbox] input[type="checkbox"]');
          // 当前为全选事件源
          if (isAllCheck) {
            _thCheckbox.each(function (i, v) {
              v.checked = _checkAction.prop('checked');
            });

            _tdCheckbox.each(function (i, v) {
              v.checked = _checkAction.prop('checked');
              var rowIndexAll = $(v).closest('tr').index();
              var rowItemDomAll = $tableWrap.find('tbody tr').filter(function (i, v) {
                return $(v).index() === rowIndexAll;
              });
              rowItemDomAll.attr('checked', v.checked);
            });
            // 当前为单个选择
          } else {
            _tdCheckbox.each(function (i, v) {
              if (v.checked === false) {
                _thChecked = false;
              }

              var rowIndex = $(v).closest('tr').index();
              var rowItemDom = $tableWrap.find('tbody tr').filter(function (i, v) {
                return $(v).index() === rowIndex;
              });
              rowItemDom.attr('checked', v.checked);
            });
            _thCheckbox.each(function (i, v) {
              v.checked = _thChecked;
              $(v).prop('checked', _thChecked);
            });
          }
        });
      }
    };
    exports.default = Checkbox;

    /***/
  },
  /* 13 */
  /***/
  function (module, exports, __webpack_require__) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
      value: true
    });

    var _jTool = __webpack_require__(1);

    var _jTool2 = _interopRequireDefault(_jTool);

    var _I18n = __webpack_require__(9);

    var _I18n2 = _interopRequireDefault(_I18n);

    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : {
        default: obj
      };
    }

    /*
     * Order: 序号
     * */
    var Order = {
      /*
      @生成序号DOM
      $.table: table [jTool object]
      */
      initDOM: function initDOM($table) {
        var orderHtml = '<th th-name="gm_order" gm-order="true" gm-create="true" style="width: 68px;">' + _I18n2.default.i18nText($table, 'order-text') + '</th>';
        (0, _jTool2.default)('thead tr', $table).prepend(orderHtml);
      }
    };
    exports.default = Order;

    /***/
  },
  /* 14 */
  /***/
  function (module, exports, __webpack_require__) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
      value: true
    });

    var _jTool = __webpack_require__(1);

    var _jTool2 = _interopRequireDefault(_jTool);

    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : {
        default: obj
      };
    }

    var Remind = {
      html: function html() {
        var html = '<div class="remind-action">\n\t\t\t\t\t\t<i class="ra-help iconfont icon-icon"></i>\n\t\t\t\t\t\t<div class="ra-area">\n\t\t\t\t\t\t\t<span class="ra-title"></span>\n\t\t\t\t\t\t\t<span class="ra-con"></span>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>';
        return html;
      },
      /*
       * @绑定表头提醒功能
       * $.table: table [jTool object]
       * */

      bindRemindEvent: function bindRemindEvent(table) {
        var remindAction = (0, _jTool2.default)('.remind-action', table);
        remindAction.unbind('mouseenter');
        remindAction.bind('mouseenter', function () {
          var raArea = (0, _jTool2.default)(this).find('.ra-area');
          var tableDiv = (0, _jTool2.default)(this).closest('.table-div');
          raArea.show();
          var theLeft = tableDiv.get(0).offsetWidth - ((0, _jTool2.default)(this).offset().left - tableDiv.offset().left) > raArea.get(0).offsetWidth;
          raArea.css({
            left: theLeft ? '0px' : 'auto',
            right: theLeft ? 'auto' : '0px'
          });
        });
        remindAction.unbind('mouseleave');
        remindAction.bind('mouseleave', function () {
          var raArea = (0, _jTool2.default)(this).find('.ra-area');
          raArea.hide();
        });
      }
    };
    /*
     * Remind: 表头提醒
     * */
    exports.default = Remind;

    /***/
  },
  /* 15 */
  /***/
  function (module, exports, __webpack_require__) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
      value: true
    });

    var _jTool = __webpack_require__(1);

    var _jTool2 = _interopRequireDefault(_jTool);

    var _Base = __webpack_require__(5);

    var _Base2 = _interopRequireDefault(_Base);

    var _Core = __webpack_require__(7);

    var _Core2 = _interopRequireDefault(_Core);

    var _Cache = __webpack_require__(4);

    var _Cache2 = _interopRequireDefault(_Cache);

    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : {
        default: obj
      };
    }

    /*
     * Sort: 排序
     * */
    var Sort = {
      html: function html() {
        var html = '<div class="sorting-action">\n\t\t\t\t\t\t<i class="sa-icon sa-up iconfont icon-sanjiao2"></i>\n\t\t\t\t\t\t<i class="sa-icon sa-down iconfont icon-sanjiao1"></i>\n\t\t\t\t\t</div>';
        return html;
      },
      /*
       * 手动设置排序
       * @param sortJson: 需要排序的json串 如:{th-name:'down'} value需要与参数sortUpText 或 sortDownText值相同
       * @param callback: 回调函数[function]
       * @param refresh: 是否执行完成后对表格进行自动刷新[boolean, 默认为true]
       *
       * 排序json串示例:
       * sortJson => {name: 'ASC}
       * */

      __setSort: function __setSort($table, sortJson, callback, refresh) {
        var settings = _Cache2.default.getSettings($table);
        if (!sortJson || _jTool2.default.type(sortJson) !== 'object' || _jTool2.default.isEmptyObject(sortJson)) {
          return false;
        }
        _jTool2.default.extend(settings.sortData, sortJson);
        _Cache2.default.updateSettings($table, settings);

        // 默认执行完后进行刷新列表操作
        if (typeof refresh === 'undefined') {
          refresh = true;
        }
        var _th = void 0,
          _sortAction = void 0,
          _sortType = void 0;
        for (var s in sortJson) {
          _th = (0, _jTool2.default)('[th-name="' + s + '"]', $table);
          _sortType = sortJson[s];
          _sortAction = (0, _jTool2.default)('.sorting-action', _th);
          if (_sortType === settings.sortUpText) {
            _th.attr('sorting', settings.sortUpText);
            _sortAction.removeClass('sorting-down');
            _sortAction.addClass('sorting-up');
          } else if (_sortType === settings.sortDownText) {
            _th.attr('sorting', settings.sortDownText);
            _sortAction.removeClass('sorting-up');
            _sortAction.addClass('sorting-down');
          }
        }
        refresh ? _Core2.default.__refreshGrid($table, callback) : typeof callback === 'function' ? callback() : '';
      },
      /**
       * 绑定排序事件
       * @param $table
       */

      bindSortingEvent: function bindSortingEvent($table) {
        var _this = this;
        var settings = _Cache2.default.getSettings($table);
        var action = void 0,
          // 向上或向下事件源
          th = void 0,
          // 事件源所在的th
          table = void 0,
          // 事件源所在的table
          thName = void 0; // th对应的名称
        // 绑定排序事件
        $table.off('mouseup', '.sorting-action');
        $table.on('mouseup', '.sorting-action', function () {
          action = (0, _jTool2.default)(this);
          th = action.closest('th');
          table = th.closest('table');
          thName = th.attr('th-name');
          if (!thName || _jTool2.default.trim(thName) === '') {
            _Base2.default.outLog('排序必要的参数丢失', 'error');
            return false;
          }
          // 根据组合排序配置项判定：是否清除原排序及排序样式
          if (!settings.isCombSorting) {
            _jTool2.default.each((0, _jTool2.default)('.sorting-action', table), function (i, v) {
              if (v != action.get(0)) {
                // action.get(0) 当前事件源的DOM
                (0, _jTool2.default)(v).removeClass('sorting-up sorting-down');
                (0, _jTool2.default)(v).closest('th').attr('sorting', '');
              }
            });
          }
          // 更新排序样式
          _this.updateSortStyle(action, th, settings);
          // 当前触发项为置顶表头时, 同步更新至原样式
          if (th.closest('thead[grid-manager-mock-thead]').length === 1) {
            var _th = (0, _jTool2.default)('thead[grid-manager-thead] th[th-name="' + thName + '"]', table);
            var _action = (0, _jTool2.default)('.sorting-action', _th);
            _this.updateSortStyle(_action, _th, settings);
          }
          // 拼装排序数据: 单列排序
          settings.sortData = {};
          if (!settings.isCombSorting) {
            settings.sortData[th.attr('th-name')] = th.attr('sorting');
            // 拼装排序数据: 组合排序
          } else {
            _jTool2.default.each((0, _jTool2.default)('thead[grid-manager-thead] th[th-name][sorting]', table), function (i, v) {
              if (v.getAttribute('sorting') !== '') {
                settings.sortData[v.getAttribute('th-name')] = v.getAttribute('sorting');
              }
            });
          }
          // 调用事件、渲染tbody
          _Cache2.default.updateSettings($table, settings);
          var query = _jTool2.default.extend({}, settings.query, settings.sortData, settings.pageData);
          settings.sortingBefore(query);
          _Core2.default.__refreshGrid($table, function () {
            settings.sortingAfter(query, th);
          });
        });
      },
      /**
       * 更新排序样式
       * @param sortAction
       * @param th
       * @param settings
       */

      updateSortStyle: function updateSortStyle(sortAction, th, settings) {
        // 排序操作：升序
        if (sortAction.hasClass('sorting-down')) {
          sortAction.addClass('sorting-up');
          sortAction.removeClass('sorting-down');
          th.attr('sorting', settings.sortUpText);
        }
        // 排序操作：降序
        else {
          sortAction.addClass('sorting-down');
          sortAction.removeClass('sorting-up');
          th.attr('sorting', settings.sortDownText);
        }
      }
    };
    exports.default = Sort;

    /***/
  },
  /* 16 */
  /***/
  function (module, exports, __webpack_require__) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
      value: true
    });

    var _jTool = __webpack_require__(1);

    var _jTool2 = _interopRequireDefault(_jTool);

    var _Base = __webpack_require__(5);

    var _Base2 = _interopRequireDefault(_Base);

    var _Adjust = __webpack_require__(3);

    var _Adjust2 = _interopRequireDefault(_Adjust);

    var _Cache = __webpack_require__(4);

    var _Cache2 = _interopRequireDefault(_Cache);

    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : {
        default: obj
      };
    }

    /*
     * Drag: 拖拽
     * */
    var Drag = {
      /**
       * 绑定拖拽换位事件
       * @param $table
       */
      bindDragEvent: function bindDragEvent($table) {
        var _this = this;
        // 指定拖拽换位事件源,配置拖拽样式
        $table.off('mousedown', '.drag-action');
        $table.on('mousedown', '.drag-action', function (event) {
          var $body = (0, _jTool2.default)('body');
          // 获取设置项
          var settings = _Cache2.default.getSettings($table);

          // 事件源th
          var _th = (0, _jTool2.default)(this).closest('th');

          // 事件源的上一个th
          var prevTh = null;

          // 事件源的下一个th
          var nextTh = null;

          // 事件源所在的tr
          var _tr = _th.parent();

          // 事件源同层级下的所有可视th
          var _allTh = _tr.find('th[th-visible="visible"]');

          // 事件源所在的table
          var _table = _tr.closest('table');

          // 事件源所在的DIV
          var tableDiv = _table.closest('.table-div');

          // 事件源所在的容器
          var _tableWrap = _table.closest('.table-wrap');

          // 与事件源同列的所有td
          var colTd = _Base2.default.getColTd(_th);

          // 列拖拽触发回调事件
          settings.dragBefore(event);

          // 禁用文字选中效果
          $body.addClass('no-select-text');

          // 更新界面交互标识
          _Base2.default.updateInteractive(_table, 'Drag');

          // 增加拖拽中样式
          _th.addClass('drag-ongoing opacityChange');
          colTd.addClass('drag-ongoing opacityChange');

          // 增加临时展示DOM
          _tableWrap.append('<div class="dreamland-div"></div>');
          var dreamlandDIV = (0, _jTool2.default)('.dreamland-div', _tableWrap);
          dreamlandDIV.get(0).innerHTML = '<table class="dreamland-table ' + _table.attr('class') + '"></table>';
          // tbody内容：将原tr与td上的属性一并带上，解决一部分样式问题
          var _tbodyHtml = '';
          var _cloneTr = void 0,
            _cloneTd = void 0;
          _jTool2.default.each(colTd, function (i, v) {
            _cloneTd = v.cloneNode(true);
            _cloneTd.style.height = v.offsetHeight + 'px';
            _cloneTr = (0, _jTool2.default)(v).closest('tr').clone();
            _tbodyHtml += _cloneTr.html(_cloneTd.outerHTML).get(0).outerHTML;
          });
          var tmpHtml = '<thead>\n\t\t\t\t\t\t\t\t<tr>\n\t\t\t\t\t\t\t\t<th style="height:' + _th.height() + 'px">\n\t\t\t\t\t\t\t\t' + (0, _jTool2.default)('.drag-action', _th).get(0).outerHTML + '\n\t\t\t\t\t\t\t\t</th>\n\t\t\t\t\t\t\t\t</tr>\n\t\t\t\t\t\t\t</thead>\n\t\t\t\t\t\t\t<tbody>\n\t\t\t\t\t\t\t\t' + _tbodyHtml + '\n\t\t\t\t\t\t\t</tbody>';
          (0, _jTool2.default)('.dreamland-table', dreamlandDIV).html(tmpHtml);
          // 绑定拖拽滑动事件
          var _thIndex = 0; // 存储移动时的th所处的位置
          $body.unbind('mousemove');
          $body.bind('mousemove', function (e2) {
            _thIndex = _th.index(_allTh);
            prevTh = undefined;
            // 当前移动的非第一列
            if (_thIndex > 0) {
              prevTh = _allTh.eq(_thIndex - 1);
            }
            nextTh = undefined;
            // 当前移动的非最后一列
            if (_thIndex < _allTh.length) {
              nextTh = _allTh.eq(_thIndex + 1);
            }
            // 插件自动创建的项,不允许移动
            if (prevTh && prevTh.length !== 0 && (prevTh.attr('gm-create') === 'true' || prevTh.attr('th-name') === 'action')) {
              prevTh = undefined;
            } else if (nextTh && nextTh.length !== 0 && (nextTh.attr('gm-create') === 'true' || nextTh.attr('th-name') === 'action')) {
              nextTh = undefined;
            }
            dreamlandDIV.show();
            dreamlandDIV.css({
              width: _th.get(0).offsetWidth,
              height: _table.get(0).offsetHeight,
              left: e2.clientX - _tableWrap.offset().left + window.pageXOffset - _th.get(0).offsetWidth / 2,
              top: e2.clientY - _tableWrap.offset().top + window.pageYOffset - dreamlandDIV.find('th').get(0).offsetHeight / 2
            });
            // 当前触发项为置顶表头时, 同步更新至原样式
            var haveMockThead = false; // 当前是否包含置顶表头
            if (_th.closest('thead[grid-manager-mock-thead]').length === 1) {
              haveMockThead = true;
            }
            _this.updateDrag(_table, prevTh, nextTh, _th, colTd, dreamlandDIV, tableDiv, haveMockThead);
            _allTh = _tr.find('th'); // 重置TH对象数据
          });
          // 绑定拖拽停止事件
          $body.unbind('mouseup');
          $body.bind('mouseup', function (event) {
            var settings = _Cache2.default.getSettings($table);
            $body.unbind('mousemove');
            $body.unbind('mouseup');
            // 清除临时展示被移动的列
            dreamlandDIV = (0, _jTool2.default)('.dreamland-div');
            if (dreamlandDIV.length !== 0) {
              dreamlandDIV.animate({
                top: _table.get(0).offsetTop + 'px',
                left: _th.get(0).offsetLeft - tableDiv.get(0).scrollLeft + 'px'
              }, settings.animateTime, function () {
                // tableDiv.css('position',_divPosition);
                _th.removeClass('drag-ongoing');
                colTd.removeClass('drag-ongoing');
                dreamlandDIV.remove();

                // 列拖拽成功回调事件
                settings.dragAfter(event);
              });
            }
            // 存储用户记忆
            _Cache2.default.saveUserMemory(_table);

            // 重置调整宽度事件源
            if (settings.supportAdjust) {
              _Adjust2.default.resetAdjust(_table);
            }
            // 开启文字选中效果
            $body.removeClass('no-select-text');

            // 更新界面交互标识
            _Base2.default.updateInteractive(_table);
          });
        });
      },
      /**
       * 拖拽触发后更新DOM
       * @param _table
       * @param prevTh
       * @param nextTh
       * @param _th
       * @param colTd
       * @param dreamlandDIV
       * @param tableDiv
       * @param haveMockThead
       */

      updateDrag: function updateDrag(_table, prevTh, nextTh, _th, colTd, dreamlandDIV, tableDiv, haveMockThead) {
        // 事件源对应的上一组td
        var prevTd = null;
        // 事件源对应的下一组td
        var nextTd = null;
        // 处理向左拖拽
        if (prevTh && prevTh.length != 0 && dreamlandDIV.offset().left < prevTh.offset().left) {
          prevTd = _Base2.default.getColTd(prevTh);
          prevTh.before(_th);
          _jTool2.default.each(colTd, function (i, v) {
            prevTd.eq(i).before(v);
          });
          if (haveMockThead) {
            var _prevTh = (0, _jTool2.default)('thead[grid-manager-thead] th[th-name="' + prevTh.attr('th-name') + '"]', _table);
            var __th = (0, _jTool2.default)('thead[grid-manager-thead] th[th-name="' + _th.attr('th-name') + '"]', _table);
            _prevTh.before(__th);
          }
        }
        // 处理向右拖拽
        else if (nextTh && nextTh.length !== 0 && dreamlandDIV.offset().left + dreamlandDIV.width() > nextTh.offset().left) {
          nextTd = _Base2.default.getColTd(nextTh);
          nextTh.after(_th);
          _jTool2.default.each(colTd, function (i, v) {
            nextTd.eq(i).after(v);
          });
          if (haveMockThead) {
            var _nextTh = (0, _jTool2.default)('thead[grid-manager-thead] th[th-name="' + nextTh.attr('th-name') + '"]', _table);
            var _th2 = (0, _jTool2.default)('thead[grid-manager-thead] th[th-name="' + _th.attr('th-name') + '"]', _table);
            _nextTh.after(_th2);
          }
        }
      }
    };
    exports.default = Drag;

    /***/
  },
  /* 17 */
  /***/
  function (module, exports, __webpack_require__) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
      value: true
    });

    var _jTool = __webpack_require__(1);

    var _jTool2 = _interopRequireDefault(_jTool);

    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : {
        default: obj
      };
    }

    var Scroll = {
      /*
      @绑定表格滚动轴功能
      $.table: table [jTool object]
      */
      bindScrollFunction: function bindScrollFunction(table) {
        var tableDIV = table.closest('.table-div');
        // 绑定resize事件: 对表头吸顶的列宽度进行修正
        window.addEventListener('resize', function () {
          var _setTopHead = (0, _jTool2.default)('.set-top', table); // 吸顶元素
          if (_setTopHead && _setTopHead.length === 1) {
            _setTopHead.remove();
            table.closest('.table-div').trigger('scroll');
          }
        });
        // 绑定滚动条事件
        tableDIV.unbind('scroll');
        tableDIV.bind('scroll', function (e, _isWindowResize_) {
          var _scrollDOMTop = (0, _jTool2.default)(this).scrollTop();
          // 列表head
          var _thead = (0, _jTool2.default)('thead[grid-manager-thead]', table);
          // 列表body
          var _tbody = (0, _jTool2.default)('tbody', table);
          // 吸顶元素
          var _setTopHead = (0, _jTool2.default)('.set-top', table);
          // 当前列表数据为空
          if ((0, _jTool2.default)('tr', _tbody).length == 0) {
            return true;
          }
          // 配置吸顶区的宽度
          if (_setTopHead.length == 0 || _isWindowResize_) {
            _setTopHead.length == 0 ? table.append(_thead.clone(true).addClass('set-top')) : '';
            _setTopHead = (0, _jTool2.default)('.set-top', table);
            _setTopHead.removeAttr('grid-manager-thead');
            _setTopHead.attr('grid-manager-mock-thead', '');
            _setTopHead.removeClass('scrolling');
            _setTopHead.css({
              width: _thead.width(),
              left: -table.closest('.table-div').scrollLeft() + 'px'
            });
            // 防止window.resize事件后导致的吸顶宽度错误. 可以优化
            _jTool2.default.each((0, _jTool2.default)('th', _thead), function (i, v) {
              (0, _jTool2.default)('th', _setTopHead).eq(i).width((0, _jTool2.default)(v).width());
            });
          }
          if (_setTopHead.length === 0) {
            return;
          }

          // 删除表头置顶
          if (_scrollDOMTop === 0) {
            _thead.removeClass('scrolling');
            _setTopHead.remove();
          }
          // 显示表头置顶
          else {
            _thead.addClass('scrolling');
            _setTopHead.css({
              left: -table.closest('.table-div').scrollLeft() + 'px'
            });
          }
          return true;
        });
      }
    };
    /*
     * Scroll: 滚动轴
     * */
    exports.default = Scroll;

    /***/
  },
  /* 18 */
  /***/
  function (module, exports, __webpack_require__) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
      value: true
    });
    exports.TextSettings = exports.Settings = undefined;

    var _jTool = __webpack_require__(1);

    var _jTool2 = _interopRequireDefault(_jTool);

    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : {
        default: obj
      };
    }

    var Settings = {
      // 拖拽
      supportDrag: true, // 是否支持拖拽功能
      dragBefore: _jTool2.default.noop, // 拖拽前事件
      dragAfter: _jTool2.default.noop, // 拖拽后事件

      // 宽度调整
      supportAdjust: true, // 是否支持宽度调整功能
      adjustBefore: _jTool2.default.noop, // 宽度调整前事件
      adjustAfter: _jTool2.default.noop, // 宽度调整后事件

      // 是否支持表头提示信息[需在地应的TH上增加属性remind]
      supportRemind: false,

      // 是否支持配置列表功能[操作列是否可见]
      supportConfig: true,

      // 宽度配置
      width: '100%',

      // 高度配置, 可配置的最小宽度为300px
      height: '300px',

      // 文本对齐方式
      textAlign: '',

      // 动画效果时长
      animateTime: 300,

      // 是否禁用本地缓存
      disableCache: false,

      // 排序 sort
      supportSorting: false, // 排序：是否支持排序功能
      isCombSorting: false, // 是否为组合排序[只有在支持排序的情况下生效
      sortKey: 'sort_', // 排序字段前缀, 示例: 列名='date', sortKey='sort_', 排序参数则为sort_date
      sortData: {}, // 存储排序数据[不对外公开参数]
      sortUpText: 'ASC', // 排序：升序标识[该标识将会传至数据接口]
      sortDownText: 'DESC', // 排序：降序标识[该标识将会传至数据接口]
      sortingBefore: _jTool2.default.noop, // 排序事件发生前
      sortingAfter: _jTool2.default.noop, // 排序事件发生后

      // 分页 ajaxPag
      supportAjaxPage: true, // 是否支持配置列表ajxa分页
      sizeData: [10, 20, 30, 50, 100], // 用于配置列表每页展示条数选择框
      pageSize: 10, // 每页显示条数，如果使用缓存且存在缓存数据，那么该值将失效
      pageData: {}, // 存储分页数据[不对外公开参数]
      query: {}, // 其它需要带入的参数，该参数中设置的数据会在分页或排序事件中以参数形式传递
      pagingBefore: _jTool2.default.noop, // 分页事件发生前
      pagingAfter: _jTool2.default.noop, // 分页事件发生后

      // 序目录
      supportAutoOrder: true, // 是否支持自动序目录

      // 全选项
      supportCheckbox: true, // 是否支持选择与反选

      // 是否固定左边全选项和序目录
      isFixedLeft: true, // 默认固定

      // 是否固定右边操作列
      isFixedRight: true, // 默认固定

      // 国际化
      i18n: 'zh-cn', // 选择使用哪种语言，暂时支持[zh-cn:简体中文，en-us:美式英语] 默认zh-cn

      // 用于支持通过数据渲染DOM
      columnData: [], // 表格列数据配置项
      gridManagerName: '', // 表格grid-manager所对应的值[可在html中配置]
      ajax_url: '', // 获取表格数据地址，配置该参数后，将会动态获取数据
      ajax_type: 'GET', // ajax请求类型['GET', 'POST']默认GET
      showLoading: false, // 显示加载效果，默认不显示
      ajax_headers: {}, // ajax请求头信息
      ajax_beforeSend: _jTool2.default.noop, // ajax请求之前,与jTool的beforeSend使用方法相同
      ajax_success: _jTool2.default.noop, // ajax成功后,与jTool的success使用方法相同
      ajax_complete: _jTool2.default.noop, // ajax完成后,与jTool的complete使用方法相同
      ajax_error: _jTool2.default.noop, // ajax失败后,与jTool的error使用方法相同
      ajax_data: undefined, // ajax静态数据,配置后ajax_url将无效
      requestHandler: _jTool2.default.noop, // 请求前处理程序, 可以通过该方法修改全部的请求参数 @v2.3.14
      responseHandler: _jTool2.default.noop, // 执行请求后执行程序, 通过该程序可以修改返回值格式. 仅有成功后该函数才会执行 @v2.3.14
      resultKey: 'resultdata', // ajax请求返回的数据key键值,默认为resultdata
      dataKey: 'data', // ajax请求返回的数据key键值,默认为data
      paginationKey: 'pagedata', // ajax请求返回的列表数据key键值,默认为items
      totalsKey: 'records', // ajax请求返回的数据总条数key键值,默认为records
      oprationActionClass: 'plugin-action', // 操作列按钮类名
      // 数据导出
      supportExport: false // 支持导出表格数据
    };

    // 表格中使用到的国际化文本信息
    /**
     * Settings: 配置项
     */
    var TextSettings = function TextSettings() {
      this['order-text'] = {
        'zh-cn': '序号',
        'en-us': 'order'
      };
      this['first-page'] = {
        'zh-cn': '首页',
        'en-us': 'first'
      };
      this['previous-page'] = {
        'zh-cn': '上一页',
        'en-us': 'previous'
      };
      this['next-page'] = {
        'zh-cn': '下一页',
        'en-us': 'next'
      };
      this['last-page'] = {
        'zh-cn': '尾页',
        'en-us': 'last'
      };
      this['pre-page-first-text'] = {
        'zh-cn': '每页',
        'en-us': 'total'
      };
      this['pre-page-last-text'] = {
        'zh-cn': '条数据',
        'en-us': 'count'
      };
      this['total-first-text'] = {
        'zh-cn': '共',
        'en-us': 'total'
      };
      this['total-last-text'] = {
        'zh-cn': '条记录',
        'en-us': 'count'
      };
      this['goto-first-text'] = {
        'zh-cn': '第',
        'en-us': 'goto first text'
      };
      this['goto-last-text'] = {
        'zh-cn': '页',
        'en-us': 'page'
      };
      this['goto-btn-text'] = {
        'zh-cn': '跳转',
        'en-us': 'goto'
      };
      this['refresh'] = {
        'zh-cn': '重新加载',
        'en-us': 'Refresh'
      };
      this['reset-default-settings'] = {
        'zh-cn': '恢复默认设置',
        'en-us': 'Reset Default Settings'
      };
      this['save-as-excel'] = {
        'zh-cn': '另存为Excel',
        'en-us': 'Save as Excel'
      };
      this['save-as-excel-for-checked'] = {
        'zh-cn': '已选中项另存为Excel',
        'en-us': 'Save selected as Excel'
      };
      this['setting-grid'] = {
        'zh-cn': '配置表',
        'en-us': 'Setting Grid'
      };
      this['checkall-text'] = {
        'zh-cn': '全选',
        'en-us': 'All'
      };
    };
    exports.Settings = Settings;
    exports.TextSettings = TextSettings;

    /***/
  },
  /* 19 */
  /***/
  function (module, exports, __webpack_require__) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
      value: true
    });
    exports.Hover = undefined;

    var _jTool = __webpack_require__(1);

    var _jTool2 = _interopRequireDefault(_jTool);

    var _Base = __webpack_require__(5);

    var _Base2 = _interopRequireDefault(_Base);

    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : {
        default: obj
      };
    }

    /**
     * Created by baukh on 17/3/3.
     * 事件类
     */
    var Hover = exports.Hover = {
      onTbodyHover: function onTbodyHover($table) {
        var $tableWrap = $('.table-wrap'),
          $td = null,
          $tr = null;
        $tableWrap.off('mousemove', 'td');
        $tableWrap.on('mousemove', 'td', function () {
          $td = (0, _jTool2.default)(this);
          var rowIndex = $td.parent().index();
          $tr = $tableWrap.find('table>tbody>tr').filter(function (index) {
            return (0, _jTool2.default)(this).index() === rowIndex;
          }); // $tableWrap.find('table>tbody>tr');
          // row col 并未发生变化
          if ($td.attr('col-hover') === 'true' && $tr.attr('row-hover') === 'true') {
            return;
          }
          // row 发生变化
          if ($tr.attr('row-hover') !== 'true') {
            $('tr[row-hover="true"]', $tableWrap).removeAttr('row-hover');
            $tr.attr('row-hover', 'true');
          }

          // col 发生变化
          if ($tr.attr('col-hover') !== 'true') {
            $('td[col-hover="true"]', $tableWrap).removeAttr('col-hover');
            _Base2.default.getColTd($td).attr('col-hover', 'true');
          }
        });

        $tableWrap.off('mouseleave');
        $tableWrap.on('mouseleave', function () {
          $('tr[row-hover="true"]', $tableWrap).removeAttr('row-hover');
          $('td[col-hover="true"]', $tableWrap).removeAttr('col-hover');
        });
      }
    };

    /***/
  },
  /* 20 */
  /***/
  function (module, exports, __webpack_require__) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
      value: true
    });
    exports.publishMethodArray = exports.PublishMethod = undefined;

    var _jTool = __webpack_require__(1);

    var _jTool2 = _interopRequireDefault(_jTool);

    var _Cache = __webpack_require__(4);

    var _Cache2 = _interopRequireDefault(_Cache);

    var _Base = __webpack_require__(5);

    var _Base2 = _interopRequireDefault(_Base);

    var _Sort = __webpack_require__(15);

    var _Sort2 = _interopRequireDefault(_Sort);

    var _Export = __webpack_require__(10);

    var _Export2 = _interopRequireDefault(_Export);

    var _Core = __webpack_require__(7);

    var _Core2 = _interopRequireDefault(_Core);

    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : {
        default: obj
      };
    }

    /**
     * Created by baukh on 17/4/14.
     * 公开方法
     * 参数中的$table, 将由组件自动添加
     */
    var PublishMethod = {
      /*
       * 通过jTool实例获取GridManager
       * @param $table: table [jTool Object]
       * */
      get: function get($table) {
        return _Cache2.default.__getGridManager($table);
      },
      /*
       * 获取指定表格的本地存储数据
       * 成功则返回本地存储数据,失败则返回空对象
       * @param $table: table [jTool Object]
       * */

      getLocalStorage: function getLocalStorage($table) {
        return _Cache2.default.getUserMemory($table);
      },
      /*
       * 清除指定表的表格记忆数据
       * @param $table: table [jTool Object]
       * return 成功或者失败的布尔值
       * */

      clear: function clear($table) {
        return _Cache2.default.delUserMemory($table);
      },
      /*
       * @获取当前行渲染时使用的数据
       * @param $table: table [jTool Object]
       * @param target: 将要获取数据所对应的tr[Element or NodeList]
       * */

      getRowData: function getRowData($table, target) {
        return _Cache2.default.__getRowData($table, target);
      },
      /*
       * 手动设置排序
       * @param sortJson: 需要排序的json串 如:{th-name:'down'} value需要与参数sortUpText 或 sortDownText值相同
       * @param callback: 回调函数[function]
       * @param refresh: 是否执行完成后对表格进行自动刷新[boolean, 默认为true]
       * */

      setSort: function setSort($table, sortJson, callback, refresh) {
        _Sort2.default.__setSort($table, sortJson, callback, refresh);
      },
      /*
       * 显示Th及对应的TD项
       * @param $table: table [jTool Object]
       * @param target: th[Element or NodeList]
       * */

      showTh: function showTh($table, target) {
        _Base2.default.setAreVisible((0, _jTool2.default)(target), true);
      },
      /*
       * 隐藏Th及对应的TD项
       * @param $table: table [jTool Object]
       * @param target: th[Element or NodeList]
       * */

      hideTh: function hideTh($table, target) {
        _Base2.default.setAreVisible((0, _jTool2.default)(target), false);
      },
      /*
       * 导出表格 .xls
       * @param $table:当前操作的grid,由插件自动传入
       * @param fileName: 导出后的文件名
       * @param onlyChecked: 是否只导出已选中的表格
       * */

      exportGridToXls: function exportGridToXls($table, fileName, onlyChecked) {
        return _Export2.default.__exportGridToXls($table, fileName, onlyChecked);
      },
      /**
       * 设置查询条件
       * @param $table: table [jTool object]
       * @param query: 配置的数据 [Object]
       * @param callback: 回调函数
       * @param isGotoFirstPage: 是否返回第一页[Boolean default=true]
       * 注意事项:
       * - query的key值如果与分页及排序等字段冲突, query中的值将会被忽略.
       * - setQuery() 会立即触发刷新操作
       * - 在此配置的query在分页事件触发时, 会以参数形式传递至pagingAfter(query)事件内
       * - setQuery对query字段执行的操作是修改而不是合并, 每次执行setQuery都会将之前配置的query值覆盖
       */

      setQuery: function setQuery($table, query, isGotoFirstPage, callback) {
        var settings = _Cache2.default.getSettings($table);
        if (typeof isGotoFirstPage !== 'boolean') {
          callback = isGotoFirstPage;
          isGotoFirstPage = true;
        }
        _jTool2.default.extend(settings, {
          query: query
        });
        if (isGotoFirstPage) {
          settings.pageData.cPage = 1;
        }
        _Cache2.default.updateSettings($table, settings);
        _Core2.default.__refreshGrid($table, callback);
      },
      /**
       * 配置静态数ajaxData
       * @param $table: table [jTool object]
       * @param ajaxData: 配置的数据
       */

      setAjaxData: function setAjaxData($table, ajaxData) {
        var settings = _Cache2.default.getSettings($table);
        _jTool2.default.extend(settings, {
          ajax_data: ajaxData
        });
        _Cache2.default.updateSettings($table, settings);
        _Core2.default.__refreshGrid($table);
      },
      /*
       * 刷新表格 使用现有参数重新获取数据，对表格数据区域进行渲染
       * @param $table:当前操作的grid,由插件自动传入
       * @param isGotoFirstPage:  是否刷新时跳转至第一页[boolean类型, 默认false]
       * @param callback: 回调函数
       * */

      refreshGrid: function refreshGrid($table, isGotoFirstPage, callback) {
        var settings = _Cache2.default.getSettings($table);
        if (typeof isGotoFirstPage !== 'boolean') {
          callback = isGotoFirstPage;
          isGotoFirstPage = false;
        }
        if (isGotoFirstPage) {
          settings.pageData['cPage'] = 1;
          _Cache2.default.updateSettings($table, settings);
        }
        _Core2.default.__refreshGrid($table, callback);
      },
      /*
       * 获取当前选中的行
       * @param $table: table [jTool Object]
       * return 当前选中的行 [NodeList]
       * */

      getCheckedTr: function getCheckedTr($table) {
        return $table.get(0).querySelectorAll('tbody tr[checked="true"]');
      },
      /*
       * 获取当前选中行渲染时使用的数据
       * @param $table: table [jTool Object]
       * */

      getCheckedData: function getCheckedData($table) {
        return _Cache2.default.__getRowData($table, this.getCheckedTr($table));
      },

      getCheckedMs: function getCheckedMs($table, key) {
        var returnIdArr = [];
        var idArr = _Cache2.default.__getRowData($table, this.getCheckedTr($table));
        idArr.forEach(function (value, index) {
          returnIdArr.push(value[key]);
        });
        return returnIdArr;
      }
    };

    /*
      //对外公开方法展示
      'init',					// 初始化方法
      'setSort',				// 手动设置排序
      'get',					// 通过jTool实例获取GridManager
      'showTh',				// 显示Th及对应的TD项
      'hideTh',				// 隐藏Th及对应的TD项
      'exportGridToXls',		// 导出表格 .xls
      'getLocalStorage',		// 获取指定表格的本地存储数据
      'setQuery',				// 配置query 该参数会在分页触发后返回至pagingAfter(query)方法
      'setAjaxData',          // 用于再次配置ajax_data数据, 配置后会根据配置的数据即刻刷新表格
      'refreshGrid',			// 刷新表格 使用现有参数重新获取数据，对表格数据区域进行渲染
      'getCheckedTr',			// 获取当前选中的行
      'getRowData',			// 获取当前行渲染时使用的数据
      'getCheckedData',		// 获取当前选中行渲染时使用的数据
      'clear'					// 清除指定表的表格记忆数据
    */
    // 对外公开方法列表
    var publishMethodArray = ['init'];
    for (var key in PublishMethod) {
      publishMethodArray.push(key);
    }
    exports.PublishMethod = PublishMethod;
    exports.publishMethodArray = publishMethodArray;

    /***/
  },
  /******/
  /* 21 */
  /***/
  function (module, exports, __webpack_require__) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
      value: true
    });
    exports.RowClick = undefined;

    var _jTool = __webpack_require__(1);

    var _jTool2 = _interopRequireDefault(_jTool);

    var _Cache = __webpack_require__(4);

    var _Cache2 = _interopRequireDefault(_Cache);

    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : {
        default: obj
      };
    }

    /**
     * Created by baukh on 17/3/3.
     * 事件类
     */
    var RowClick = exports.RowClick = {
      onRowClick: function onRowClick($table) {
        var settings = _Cache2.default.getSettings($table);
        if (settings.supportCheckbox) {
          var $tableWrap = $('.table-wrap'),
            $tr = null;
          $tableWrap.off('click', 'tbody tr');
          $tableWrap.on('click', 'tbody tr', function (event) {
            if (!(0, _jTool2.default)(event.target).hasClass(settings.oprationActionClass) && !(0, _jTool2.default)(event.target).closest('.b-opt').length) {
              $tr = (0, _jTool2.default)(this);
              var rowIndex = $tr.index();
              $tr = $tableWrap.find('table>tbody>tr').filter(function (index) {
                return (0, _jTool2.default)(this).index() === rowIndex;
              });
              // 点击某行是选中该行
              $tr.find('input[type="checkbox"]').trigger('click');
            }
          });
        }
      }
    };
    /***/
  }
  /******/
]);

TreeGrid = function (_config) {
  _config = _config || {};

  var defaultSettings = {
    width: '100%', // 表格默认宽度
    headerHeight: '30', // 标题栏高度
    headerAlign: 'center', // 标题栏文字对齐方式
    dataAlign: 'left', // 表格内容文字对齐方式
    folderColumnIndex: 0, // 展开列索引
    indentation: 20, // 默认缩进
    ajaxType: 'GET', // 默认请求方式为get
    dataKey: 'resultdata', // ajax请求返回的数据key键值,默认为resultdata
    disabledKey: '', // 禁用启用key
    disabledValue: 0, // 禁用时的值，用于判断禁用状态
    emptyTemplate: '<div class="empty-template">数据为空</div>' // 数据为空时默认显示内容
  };

  _config = $.extend({}, defaultSettings, _config);

  var s = '';
  var tableStr = '';
  var rownum = 0;
  var __root;

  var __selectedData = null;
  var __selectedId = null;
  var __selectedIndex = null;

  var folderOpenIcon = (_config.folderOpenIcon || TreeGrid.FOLDER_OPEN_ICON);
  var folderCloseIcon = (_config.folderCloseIcon || TreeGrid.FOLDER_CLOSE_ICON);
  var defaultLeafIcon = (_config.defaultLeafIcon || TreeGrid.DEFAULT_LEAF_ICON);

  // 请求数据
  requestData = function () {
    var rows = [];
    $.ttyAjax({
      url: _config.ajaxUrl,
      type: _config.ajaxType,
      async: false,
      success: function (data) {
        if (data[_config.dataKey] && Object.prototype.toString.call(data[_config.dataKey]) === '[object Array]') {
          rows = data[_config.dataKey];
        }
      },
      error: function (XMLHttpRequest, textStatus, errorThrown) {

      }
    });
    return rows;
  };

  // 显示表头行
  drowHeader = function () {
    s += "<tr class='header' height='" + (_config.headerHeight) + "'>";
    var cols = _config.columns;
    for (var i = 0; i < cols.length; i++) {
      var col = cols[i];
      if (col.hidden) {
        s += "<td style='display:none' align='" + (col.headerAlign || _config.headerAlign) + "' width='" + (col.width || '') + "'>" + (col.headerText || '') + '</td>';
      } else {
        s += "<td align='" + (col.headerAlign || _config.headerAlign) + "' width='" + (col.width || '') + "'>" + (col.headerText || '') + '</td>';
      }
    }
    s += '</tr>';
  };

  // 递归显示数据行
  drowData = function () {
    var rows;
    var cols = _config.columns;
    if (_config.ajaxUrl) {
      rows = requestData() || [];
    } else {
      rows = _config.data;
    }
    drowRowData(rows, cols, 1, '');
    return rows;
  };

  // 局部变量i、j必须要用 var 来声明，否则，后续的数据无法正常显示
  drowRowData = function (_rows, _cols, _level, _pid) {
    if (!_rows.length && _level === 1) {
      s += '<tr>' + '<td class="tr-empty" colspan="' + _cols.length + '">' + _config.emptyTemplate + '</td>' + '</tr>';
    } else {
      var folderColumnIndex = (_config.folderColumnIndex);

      for (var i = 0; i < _rows.length; i++) {
        var id = _pid + '_' + i; // 行id
        var row = _rows[i];
        var disabledClass = _config.disabledKey && row[_config.disabledKey] === _config.disabledValue ? 'disabled' : '';
        s += "<tr id='TR" + id + "' class='" + disabledClass + "' pid='" + ((!_pid) ? '' : ('TR' + _pid)) + "' open='Y' data=\"" + TreeGrid.json2str(row) + "\" rowIndex='" + rownum++ + "'>";
        for (var j = 0; j < _cols.length; j++) {
          var col = _cols[j];
          if (col.hidden) {
            s += "<td style='display:none' align='" + (col.dataAlign || _config.dataAlign) + "'";
          } else {
            s += "<td align='" + (col.dataAlign || _config.dataAlign) + "'";
          }

          // 层次缩进
          if (j === folderColumnIndex) {
            s += " style='text-indent:" + (parseInt((_config.indentation)) * (_level - 1)) + "px;'> ";
          } else {
            s += '>';
          }

          // 关闭展开节点图标
          if (j === folderColumnIndex) {
            if (row.children && row.children.length) { // 有下级数据
              s += "<span folder='Y' trid='TR" + id + "'  class='image_hand switch switch-open'></span>";
            } else {
              s += "<span class='image_nohand'></span>";
            }
          }

          // 自定义图标
          if (col.iconfont) {
            var icon = typeof col.iconfont === 'function' ? col.iconfont(row, col) : col.iconfont;
            if (icon) {
              s += "<i class='iconfont " + icon + "'></i>";
            }
          }

          // 单元格内容
          if (col.template && typeof col.template === 'function') {
            s += (col.template(row, col) || '') + '</td>';
          } else {
            s += (row[typeof col.dataField === 'function' ? col.dataField(row, col) : col.dataField] || '') + '</td>';
          }
        }
        s += '</tr>';

        // 递归显示下级数据
        if (row.children) {
          drowRowData(row.children, _cols, _level + 1, id);
        }
      }
    }
  };

  // 主函数
  this.show = function () {
    this.id = _config.gridId || ('TreeGrid' + TreeGrid.COUNT++);

    if (!$('#' + this.id).length) {
      tableStr = "<table id='" + this.id + "' cellspacing=0 cellpadding=0 width='" + (_config.width) + "' class='tree-grid'></table>";
      __root = $('#' + _config.renderTo);
      __root.html(tableStr);
    }
    drowHeader();
    this.treeGridData = drowData();
    $('#' + this.id).html(s);

    // 初始化动作
    init();
  };

  init = function () {
    // 将单击事件绑定到tr标签
    __root.find('tr').bind('click', function () {
      __root.find('tr').removeClass('row_active');
      $(this).addClass('row_active');

      // 获取当前行的数据
      __selectedData = this.data || this.getAttribute('data');
      __selectedId = this.id || this.getAttribute('id');
      __selectedIndex = this.rownum || this.getAttribute('rowIndex');

      // 行记录单击后触发的事件
      if (_config.itemClick) {
        _config.itemClick(__selectedId, __selectedIndex, TreeGrid.str2json(__selectedData));
      }
    });

    // 展开、关闭下级节点
    __root.find("span[folder='Y']").bind('click', function () {
      var trid = this.trid || this.getAttribute('trid');
      var dom = __root.find('#' + trid)[0];
      var isOpen = dom.getAttribute('open');
      isOpen = (isOpen === 'Y') ? 'N' : 'Y';
      dom.setAttribute('open', isOpen);
      showHiddenNode(trid, isOpen);
      //			var trid = this.trid || this.getAttribute("trid");
      //			var isOpen = __root.find("#" + trid).attr("open");
      //			isOpen = (isOpen == "Y") ? "N" : "Y";
      //			__root.find("#" + trid).attr("open", isOpen);
      //			showHiddenNode(trid, isOpen);
    });
  };

  // 显示或隐藏子节点数据
  showHiddenNode = function (_trid, _open) {
    if (_open === 'N') { // 隐藏子节点
      __root.find('#' + _trid).find("span[folder='Y']").removeClass('switch-open');
      __root.find('tr[id^=' + _trid + '_]').css('display', 'none');
    } else { // 显示子节点
      __root.find('#' + _trid).find("span[folder='Y']").addClass('switch-open');
      showSubs(_trid);
    }
  };

  // 递归检查下一级节点是否需要显示
  showSubs = function (_trid) {
    //	var isOpen = __root.find("#" + _trid).attr("open");
    var isOpen = __root.find('#' + _trid)[0].getAttribute('open');
    if (isOpen === 'Y') {
      var trs = __root.find('tr[pid=' + _trid + ']');
      trs.css('display', '');

      for (var i = 0; i < trs.length; i++) {
        showSubs(trs[i].id);
      }
    }
  };

  // 刷新表格树
  this.refresh = function () {
    s = '';
    this.show();
  };

  // 展开或收起所有节点
  this.expandAll = function (isOpen) {
    var trs = __root.find("tr[pid='']");
    for (var i = 0; i < trs.length; i++) {
      var trid = trs[i].id || trs[i].getAttribute('id');
      showHiddenNode(trid, isOpen);
    }
  };

  // 取得当前选中的行记录
  this.getSelectedItem = function () {
    return new TreeGridItem(__root, __selectedId, __selectedIndex, TreeGrid.str2json(__selectedData));
  };
};

// 公共静态变量
// TreeGrid.FOLDER_OPEN_ICON = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAIDklEQVR4Xu2dv2tlZRCG37Wy0YUtREFRQRBBrG1tbAQLK9ttxMJCQQT/AztZEGwsFmy0F7RSsbWxERYstHMbYSt/NCoHQ8AlNzl35psvb755bpsz85153vtkQsLNuSZeEIDAQQLXYAMBCBwmgCC8OyBwDgEE4e0BAQThPQCBGAE2SIwbVU0IIEiToBkzRgBBYtyoakIAQZoEzZgxAggS40ZVEwII0iRoxowRQJAYN6qaEECQJkEzZowAgsS4UdWEAII0CZoxYwQQJMaNqiYEEKRJ0IwZI4AgMW5UNSGAIE2CZswYAQSJcaOqCQEEaRI0Y8YIIEiMG1VNCCBIk6AZM0YAQWLcqGpCAEGaBM2YMQIIEuNGVRMCCNIkaMaMEUCQGDeqmhBAkCZBM2aMAILEuFHVhACCNAmaMWMEECTGjaomBBCkSdCMGSOAIDFuVDUhgCBNgmbMGAEEiXGjqgkBBGkSNGPGCCBIjBtVTQhcFUEelPRik0y6jXlH0l3Xoa+KIE9J+tkVIveVInBT0u1Uh8JiBCmES+tdBBBkF6bzL2KDDIBo2gJBBgSDIAMgmrZAkAHBIMgAiKYtEGRAMAgyAKJpCwQZEMx5gjwt6ZcBZ9CilsCW0ZNnHIEgA7gjyACIl9wCQQoDQJBCuJNaI0ghaAQphDupNYIUgkaQQriTWiNIIWgEKYQ7qTWCFIJGkEK4k1ojSCFoBCmEO6k1ghSCRpBCuJNaI0ghaAQphDupNYIUgkaQQriTWiNIIWgEKYQ7qTWCFIJGkEK4k1ojSCFoBCmEO6k1ghSCRpBCuJNaI0gh6C6C3JD0qqSHJX0p6adCprNbI0gh8Q6CbJ9r+U7S4ycc/5T02okohWintUaQQtQdBPlC0iv3MfztRJhNlqv+QpDCBDsIck/S9TMYviTp20K2s1ojSCHpDoL8c4AfghS+sS5qvcI/jlvlM+kIctG79RK+jiCXAP3AkQjik8XpnSCITygI4pMFghhmgSCGobBBfEJBEJ8s2CCGWSCIYShsEJ9QEMQnCzaIYRYIYhgKG8QnFATxyYINYpgFghiGwgbxCQVBfLJggxhmgSCGobBBfEJBEJ8s2CCGWSCIYShsEJ9QEMQnCzaIYRYIYhgKG8QnFATxyYINYpgFghiGwgbxCQVBfLJggxhmgSCGobBBfEJBEJ8s2CCGWSCIYShsEJ9QEMQnCzaIYRYIYhgKG8QnFATxyYINYpgFghiGwgbxCQVBfLJggxhmgSCGobBBfEJBEJ8s2CCGWSCIYSjdN8j7kt6QtD1egddhAnclfSrpvQQkng+SgHdRacXzQd6U9PFFB/P1/xG4JentIBMECYLbU1YhyB1Jz+45nGtOCfwu6SFJfweYIEgA2t6S0YI8IulXSQ/svQGuOyXwnKTtm8uxLwQ5ltgR148WZDv6rIdmHnFLLS/9UdLzwckRJAhuT1mFIM9I+lrSE3tugGu0PWT0ZUnfB1kgSBDcnrIKQbZzb0h6Yc8NTLjmmwNnvCPphwnnX3TE9mPV9tus6AtBouR21FUJsuPoaZfwd5BpqPcf1P3vIPtJ1V+JIPWMjz4BQY5GVlaAIGVo440RJM5udCWCjCY6oB+CDIA4qAWCDAI5sg2CjKSZ64UgOX4l1QhSgjXUFEFC2GqLEKSW7zHdEeQYWpOuRZBJoHccgyA7IM2+BEFmEz98HoL4ZHF6JwjiEwqC+GSBIIZZIIhhKGwQn1AQxCcLNohhFghiGAobxCcUBPHJgg1imAWCGIbCBvEJBUF8smCDGGaBIIahsEF8QkEQnyzYIIZZIIhhKGwQn1AQxCcLNohhFghiGAobxCcUBPHJgg1imAWCGIbCBvEJBUF8smCDGGaBIIahsEF8QkEQnyzYIIZZIIhhKGwQn1AQxCcLNohhFghiGAobxCcUBPHJgg1imMWhZyY+lnwuh8uoPB+kMIkOzwfZnh774X0MP5f0eiHXma0RpJB2B0E2fO9KekvSX5I+kvSJpD8Kuc5sjSCFtLsIUojw0lsjSGEECFIId1JrBCkEjSCFcCe1RpBC0AhSCHdSawQpBI0ghXAntUaQQtAIUgh3UmsEKQSNIIVwJ7VGkELQCFIId1JrBCkEjSCFcCe1RpBC0AhSCHdSawQpBI0ghXAntUaQQtAIUgh3UmsEKQSNIIVwJ7VGkELQCFIId1JrBCkEjSCFcCe1RpBC0OcJckvSvcKzaT2GwPaBsOtntLop6faYI8Z3WeEz6eOp0HEmAQQZQPu8DTKgPS0ukQCCDICPIAMgmrZAkAHBIMgAiKYtEGRAMAgyAKJpCwQZEMyjkj4b0IcWfgQ+kPSV3239d0dX5bdYrvy4r8UJIMjiATNejgCC5PhRvTgBBFk8YMbLEUCQHD+qFyeAIIsHzHg5AgiS40f14gQQZPGAGS9HAEFy/KhenACCLB4w4+UIIEiOH9WLE0CQxQNmvBwBBMnxo3pxAgiyeMCMlyOAIDl+VC9OAEEWD5jxcgQQJMeP6sUJIMjiATNejgCC5PhRvTgBBFk8YMbLEUCQHD+qFyeAIIsHzHg5AgiS40f14gQQZPGAGS9HAEFy/KhenACCLB4w4+UIIEiOH9WLE0CQxQNmvBwBBMnxo3pxAgiyeMCMlyOAIDl+VC9OAEEWD5jxcgQQJMeP6sUJIMjiATNejgCC5PhRvTgBBFk8YMbLEUCQHD+qFyeAIIsHzHg5AgiS40f14gQQZPGAGS9HAEFy/KhenACCLB4w4+UI/AtTRWfnPxvdWAAAAABJRU5ErkJggg==";
// TreeGrid.FOLDER_CLOSE_ICON = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAGG0lEQVR4Xu3ZsW1tBRCE4TUZPdAJ0AAJITSARAWIHkjISCgAEoRoAWgE0QPhQ5aQSMCW18G8efs5vqud/ef8ukfXDzPzZvwhgMB/EnggiCcDgf8nQBBPBwJPECCIxwMBgngGENgR8A2y42bqCAGCHCnamTsCBNlxM3WEwHOCPP6P5L0jLJx5k8CT/wckyM2HwtX/EiCIpwGBJwgQxOOBAEE8AwjsCPgG2XEzdYQAQY4U7cwdAYLsuJk6QoAgR4p25o4AQXbcTB0hQJAjRTtzR4AgO26mjhAgyJGinbkjQJAdN1NHCBDkSNHO3BEgyI6bqSMECHKkaGfuCBBkx83UEQIEOVK0M3cECLLjZuoIAYIcKdqZOwIE2XEzdYQAQY4U7cwdAYLsuJk6QoAgR4p25o4AQXbcTB0hQJAjRTtzR4AgO26mjhAgyJGinbkjQJAdN1NHCBDkSNHO3BEgyI6bqSMECHKkaGfuCBBkx83UEQIEOVK0M3cECLLjZuoIAYIcKdqZOwIE2XEzdYQAQY4U7cwdAYLsuJk6QoAgR4p25o4AQXbcTB0hQJAjRTtzR4AgO26mjhAgyJGinbkjQJAdN1NHCBDkSNHO3BEgyI6bqSMECHKkaGfuCBBkx83UEQIEOVK0M3cECLLjZuoIAYIcKdqZOwIE2XEzdYQAQY4U7cwdAYLsuJk6QoAgR4p25o4AQXbcTB0hQJAjRTtzR4AgO26mjhAgyJGinbkjQJAdN1NHCBDkSNHO3BEgyI6bqSMECHKkaGfuCBBkx83UEQIEOVK0M3cECLLjZuoIAYIcKdqZOwIE2XEzdYQAQY4U7cwdAYLsuJk6QoAgR4p25o4AQXbcTB0hQJAjRTtzR4AgO26mjhAgyJGinbkjQJAdN1NHCBDkSNHO3BEgyI6bqSMECHKkaGfuCBBkx83UEQIEOVK0M3cECLLjZuoIAYIcKdqZOwIE2XEzdYQAQY4U7cwdAYLsuJk6QuCkIO/PzDcz8+nMfHCk6NSZf87MTzPz9cz8lQrxir0nBfltZj58BTSjLyfwyPzjl4/FJ84J8uXMfBfHfjPAFzPzfdnp5wT5+Z9Xq7Ke3om4P87M52WXnBPkh5n5rKykdyUuQQqa9IqVK8krVo79izb/OjMfvWjCh19L4PdS5udesR6LfvyZ99uZ+cTPvK997p+d/2NmfpmZr/zM+ywrH0CgjsDJb5C6lgSOESBIDL3FDQQI0tCSjDECBImht7iBAEEaWpIxRoAgMfQWNxAgSENLMsYIECSG3uIGAgRpaEnGGAGCxNBb3ECAIA0tyRgjQJAYeosbCBCkoSUZYwQIEkNvcQMBgjS0JGOMAEFi6C1uIECQhpZkjBEgSAy9xQ0ECNLQkowxAgSJobe4gQBBGlqSMUaAIDH0FjcQIEhDSzLGCBAkht7iBgIEaWhJxhgBgsTQW9xAgCANLckYI0CQGHqLGwgQpKElGWMECBJDb3EDAYI0tCRjjABBYugtbiBAkIaWZIwRIEgMvcUNBAjS0JKMMQIEiaG3uIEAQRpakjFGgCAx9BY3ECBIQ0syxggQJIbe4gYCBGloScYYAYLE0FvcQIAgDS3JGCNAkBh6ixsIEKShJRljBAgSQ29xAwGCNLQkY4wAQWLoLW4gQJCGlmSMESBIDL3FDQQI0tCSjDECBImht7iBAEEaWpIxRoAgMfQWNxAgSENLMsYIECSG3uIGAgRpaEnGGAGCxNBb3ECAIA0tyRgjQJAYeosbCBCkoSUZYwQIEkNvcQMBgjS0JGOMAEFi6C1uIECQhpZkjBEgSAy9xQ0ECNLQkowxAgSJobe4gQBBGlqSMUaAIDH0FjcQIEhDSzLGCBAkht7iBgIEaWhJxhgBgsTQW9xAgCANLckYI0CQGHqLGwgQpKElGWMECBJDb3EDAYI0tCRjjABBYugtbiBAkIaWZIwRIEgMvcUNBAjS0JKMMQIEiaG3uIEAQRpakjFGgCAx9BY3ECBIQ0syxgi8SpBYaosReBsIPMzMkwa9DSFlQCBFgCAp8vZWECBIRU1CpggQJEXe3goCBKmoScgUAYKkyNtbQYAgFTUJmSLwN9tSTB/TW92iAAAAAElFTkSuQmCC";
// TreeGrid.DEFAULT_LEAF_ICON = "";
TreeGrid.COUNT = 1;

// 将json对象转换成字符串
TreeGrid.json2str = function (obj) {
  var arr = [];

  var fmt = function (s) {
    if (typeof s === 'object' && s != null) {
      if (s.length) {
        var _substr = '';
        for (var x = 0; x < s.length; x++) {
          if (x > 0) _substr += ', ';
          _substr += TreeGrid.json2str(s[x]);
        }
        return '[' + _substr + ']';
      } else {
        return TreeGrid.json2str(s);
      }
    }
    return /^(string|number)$/.test(typeof s) ? "'" + s + "'" : s;
  };

  for (var i in obj) {
    if (typeof obj[i] !== 'object') { // 暂时不包括子数据
      arr.push(i + ':' + fmt(obj[i]));
    }
  }

  return '{' + arr.join(', ') + '}';
};

TreeGrid.str2json = function (s) {
  var json = null;
  var explorer = navigator.userAgent;
  if (explorer.indexOf('MSIE') >= 0) {
    json = eval('(' + s + ')');
  } else {
    json = new Function('return ' + s)();
  }
  return json;
};

// 数据行对象
function TreeGridItem(_root, _rowId, _rowIndex, _rowData) {
  var __root = _root;

  this.id = _rowId;
  this.index = _rowIndex;
  this.data = _rowData;

  this.getParent = function () {
    var pid = $('#' + this.id).attr('pid');
    if (pid) {
      var rowIndex = $('#' + pid).attr('rowIndex');
      var data = $('#' + pid).attr('data');
      return new TreeGridItem(_root, pid, rowIndex, TreeGrid.str2json(data));
    }
    return null;
  };

  this.getChildren = function () {
    var arr = [];
    var trs = $(__root).find("tr[pid='" + this.id + "']");
    for (var i = 0; i < trs.length; i++) {
      var tr = trs[i];
      arr.push(new TreeGridItem(__root, tr.id, tr.rowIndex, TreeGrid.str2json(tr.data)));
    }
    return arr;
  };
};
/* 单击数据行后触发该事件id：行的id index：行的索引。data：json格式的行数据对象。 */
// function itemClickEvent(id, index, data) {
//   $('#currentRow').val(id + ', ' + index + ', ' + TreeGrid.json2str(data));
// }

/* 展开、关闭所有节点。isOpen=Y表示展开，isOpen=N表示关闭 */
function expandAll(isOpen) {
  treeGrid.expandAll(isOpen);
}
/* 取得当前选中的行，方法返回TreeGridItem对象 */
function selectedItem() {
  var treeGridItem = treeGrid.getSelectedItem();
  if (treeGridItem != null) {
    // 获取数据行属性值
    // alert(treeGridItem.id + ", " + treeGridItem.index + ", " + treeGridItem.data.name);
    // 获取父数据行
    var parent = treeGridItem.getParent();
    if (parent != null) {
      // $("#currentRow").val(parent.data.name);
    }
    // 获取子数据行集
    var children = treeGridItem.getChildren();
    if (children != null && children.length > 0) {
      $('#currentRow').val(children[0].data.name);
    }
  }
}

(function ($) {
  var settings = {},
    roots = {},
    caches = {},
    // default consts of core
    _consts = {
      className: {
        BUTTON: 'button',
        LEVEL: 'level',
        ICO_LOADING: 'ico_loading',
        SWITCH: 'switch',
        NAME: 'node_name'
      },
      event: {
        NODECREATED: 'ztree_nodeCreated',
        CLICK: 'ztree_click',
        EXPAND: 'ztree_expand',
        COLLAPSE: 'ztree_collapse',
        ASYNC_SUCCESS: 'ztree_async_success',
        ASYNC_ERROR: 'ztree_async_error',
        REMOVE: 'ztree_remove',
        SELECTED: 'ztree_selected',
        UNSELECTED: 'ztree_unselected'
      },
      id: {
        A: '_a',
        ICON: '_ico',
        SPAN: '_span',
        SWITCH: '_switch',
        UL: '_ul'
      },
      line: {
        ROOT: 'root',
        ROOTS: 'roots',
        CENTER: 'center',
        BOTTOM: 'bottom',
        NOLINE: 'noline',
        LINE: 'line'
      },
      folder: {
        OPEN: 'open',
        CLOSE: 'close',
        DOCU: 'docu'
      },
      node: {
        CURSELECTED: 'curSelectedNode'
      }
    },
    // default setting of core
    _setting = {
      treeId: '',
      treeObj: null,
      view: {
        addDiyDom: null,
        autoCancelSelected: true,
        dblClickExpand: true,
        expandSpeed: 'fast',
        fontCss: {},
        nameIsHTML: false,
        selectedMulti: true,
        showIcon: true,
        showLine: true,
        showTitle: true,
        txtSelectedEnable: false
      },
      data: {
        key: {
          children: 'children',
          name: 'name',
          title: '',
          url: 'url',
          icon: 'icon'
        },
        simpleData: {
          enable: false,
          idKey: 'id',
          pIdKey: 'pId',
          rootPId: null
        },
        keep: {
          parent: false,
          leaf: false
        }
      },
      async: {
        enable: false,
        contentType: 'application/x-www-form-urlencoded',
        type: 'post',
        dataType: 'text',
        url: '',
        autoParam: [],
        otherParam: [],
        dataFilter: null
      },
      callback: {
        beforeAsync: null,
        beforeClick: null,
        beforeDblClick: null,
        beforeRightClick: null,
        beforeMouseDown: null,
        beforeMouseUp: null,
        beforeExpand: null,
        beforeCollapse: null,
        beforeRemove: null,

        onAsyncError: null,
        onAsyncSuccess: null,
        onNodeCreated: null,
        onClick: null,
        onDblClick: null,
        onRightClick: null,
        onMouseDown: null,
        onMouseUp: null,
        onExpand: null,
        onCollapse: null,
        onRemove: null
      }
    },
    // default root of core
    // zTree use root to save full data
    _initRoot = function (setting) {
      var r = data.getRoot(setting);
      if (!r) {
        r = {};
        data.setRoot(setting, r);
      }
      r[setting.data.key.children] = [];
      r.expandTriggerFlag = false;
      r.curSelectedList = [];
      r.noSelection = true;
      r.createdNodes = [];
      r.zId = 0;
      r._ver = (new Date()).getTime();
    },
    // default cache of core
    _initCache = function (setting) {
      var c = data.getCache(setting);
      if (!c) {
        c = {};
        data.setCache(setting, c);
      }
      c.nodes = [];
      c.doms = [];
    },
    // default bindEvent of core
    _bindEvent = function (setting) {
      var o = setting.treeObj,
        c = consts.event;
      o.bind(c.NODECREATED, function (event, treeId, node) {
        tools.apply(setting.callback.onNodeCreated, [event, treeId, node]);
      });

      o.bind(c.CLICK, function (event, srcEvent, treeId, node, clickFlag) {
        tools.apply(setting.callback.onClick, [srcEvent, treeId, node, clickFlag]);
      });

      o.bind(c.EXPAND, function (event, treeId, node) {
        tools.apply(setting.callback.onExpand, [event, treeId, node]);
      });

      o.bind(c.COLLAPSE, function (event, treeId, node) {
        tools.apply(setting.callback.onCollapse, [event, treeId, node]);
      });

      o.bind(c.ASYNC_SUCCESS, function (event, treeId, node, msg) {
        tools.apply(setting.callback.onAsyncSuccess, [event, treeId, node, msg]);
      });

      o.bind(c.ASYNC_ERROR, function (event, treeId, node, XMLHttpRequest, textStatus, errorThrown) {
        tools.apply(setting.callback.onAsyncError, [event, treeId, node, XMLHttpRequest, textStatus, errorThrown]);
      });

      o.bind(c.REMOVE, function (event, treeId, treeNode) {
        tools.apply(setting.callback.onRemove, [event, treeId, treeNode]);
      });

      o.bind(c.SELECTED, function (event, treeId, node) {
        tools.apply(setting.callback.onSelected, [treeId, node]);
      });
      o.bind(c.UNSELECTED, function (event, treeId, node) {
        tools.apply(setting.callback.onUnSelected, [treeId, node]);
      });
    },
    _unbindEvent = function (setting) {
      var o = setting.treeObj,
        c = consts.event;
      o.unbind(c.NODECREATED)
        .unbind(c.CLICK)
        .unbind(c.EXPAND)
        .unbind(c.COLLAPSE)
        .unbind(c.ASYNC_SUCCESS)
        .unbind(c.ASYNC_ERROR)
        .unbind(c.REMOVE)
        .unbind(c.SELECTED)
        .unbind(c.UNSELECTED);
    },
    // default event proxy of core
    _eventProxy = function (event) {
      var target = event.target,
        setting = data.getSetting(event.data.treeId),
        tId = '',
        node = null,
        nodeEventType = '',
        treeEventType = '',
        nodeEventCallback = null,
        treeEventCallback = null,
        tmp = null;

      if (tools.eqs(event.type, 'mousedown')) {
        treeEventType = 'mousedown';
      } else if (tools.eqs(event.type, 'mouseup')) {
        treeEventType = 'mouseup';
      } else if (tools.eqs(event.type, 'contextmenu')) {
        treeEventType = 'contextmenu';
      } else if (tools.eqs(event.type, 'click')) {
        if (tools.eqs(target.tagName, 'span') && target.getAttribute('treeNode' + consts.id.SWITCH) !== null) {
          tId = tools.getNodeMainDom(target).id;
          nodeEventType = 'switchNode';
        } else {
          tmp = tools.getMDom(setting, target, [{
            tagName: 'a',
            attrName: 'treeNode' + consts.id.A
          }]);
          if (tmp) {
            tId = tools.getNodeMainDom(tmp).id;
            nodeEventType = 'clickNode';
          }
        }
      } else if (tools.eqs(event.type, 'dblclick')) {
        treeEventType = 'dblclick';
        tmp = tools.getMDom(setting, target, [{
          tagName: 'a',
          attrName: 'treeNode' + consts.id.A
        }]);
        if (tmp) {
          tId = tools.getNodeMainDom(tmp).id;
          nodeEventType = 'switchNode';
        }
      }
      if (treeEventType.length > 0 && tId.length == 0) {
        tmp = tools.getMDom(setting, target, [{
          tagName: 'a',
          attrName: 'treeNode' + consts.id.A
        }]);
        if (tmp) {
          tId = tools.getNodeMainDom(tmp).id;
        }
      }
      // event to node
      if (tId.length > 0) {
        node = data.getNodeCache(setting, tId);
        switch (nodeEventType) {
          case 'switchNode':
            if (!node.isParent) {
              nodeEventType = '';
            } else if (tools.eqs(event.type, 'click') ||
              (tools.eqs(event.type, 'dblclick') && tools.apply(setting.view.dblClickExpand, [setting.treeId, node], setting.view.dblClickExpand))) {
              nodeEventCallback = handler.onSwitchNode;
            } else {
              nodeEventType = '';
            }
            break;
          case 'clickNode':
            nodeEventCallback = handler.onClickNode;
            break;
        }
      }
      // event to zTree
      switch (treeEventType) {
        case 'mousedown':
          treeEventCallback = handler.onZTreeMousedown;
          break;
        case 'mouseup':
          treeEventCallback = handler.onZTreeMouseup;
          break;
        case 'dblclick':
          treeEventCallback = handler.onZTreeDblclick;
          break;
        case 'contextmenu':
          treeEventCallback = handler.onZTreeContextmenu;
          break;
      }
      var proxyResult = {
        stop: false,
        node: node,
        nodeEventType: nodeEventType,
        nodeEventCallback: nodeEventCallback,
        treeEventType: treeEventType,
        treeEventCallback: treeEventCallback
      };
      return proxyResult;
    },
    // default init node of core
    _initNode = function (setting, level, n, parentNode, isFirstNode, isLastNode, openFlag) {
      if (!n) return;
      var r = data.getRoot(setting),
        childKey = setting.data.key.children;
      n.level = level;
      n.tId = setting.treeId + '_' + (++r.zId);
      n.parentTId = parentNode ? parentNode.tId : null;
      n.open = (typeof n.open === 'string') ? tools.eqs(n.open, 'true') : !!n.open;
      if (n[childKey] && n[childKey].length > 0) {
        n.isParent = true;
        n.zAsync = true;
      } else {
        n.isParent = (typeof n.isParent === 'string') ? tools.eqs(n.isParent, 'true') : !!n.isParent;
        n.open = (n.isParent && !setting.async.enable) ? n.open : false;
        n.zAsync = !n.isParent;
      }
      n.isFirstNode = isFirstNode;
      n.isLastNode = isLastNode;
      n.getParentNode = function () {
        return data.getNodeCache(setting, n.parentTId);
      };
      n.getPreNode = function () {
        return data.getPreNode(setting, n);
      };
      n.getNextNode = function () {
        return data.getNextNode(setting, n);
      };
      n.getIndex = function () {
        return data.getNodeIndex(setting, n);
      };
      n.getPath = function () {
        return data.getNodePath(setting, n);
      };
      n.isAjaxing = false;
      data.fixPIdKeyValue(setting, n);
    },
    _init = {
      bind: [_bindEvent],
      unbind: [_unbindEvent],
      caches: [_initCache],
      nodes: [_initNode],
      proxys: [_eventProxy],
      roots: [_initRoot],
      beforeA: [],
      afterA: [],
      innerBeforeA: [],
      innerAfterA: [],
      zTreeTools: []
    },
    // method of operate data
    data = {
      addNodeCache: function (setting, node) {
        data.getCache(setting).nodes[data.getNodeCacheId(node.tId)] = node;
      },
      getNodeCacheId: function (tId) {
        return tId.substring(tId.lastIndexOf('_') + 1);
      },
      addAfterA: function (afterA) {
        _init.afterA.push(afterA);
      },
      addBeforeA: function (beforeA) {
        _init.beforeA.push(beforeA);
      },
      addInnerAfterA: function (innerAfterA) {
        _init.innerAfterA.push(innerAfterA);
      },
      addInnerBeforeA: function (innerBeforeA) {
        _init.innerBeforeA.push(innerBeforeA);
      },
      addInitBind: function (bindEvent) {
        _init.bind.push(bindEvent);
      },
      addInitUnBind: function (unbindEvent) {
        _init.unbind.push(unbindEvent);
      },
      addInitCache: function (initCache) {
        _init.caches.push(initCache);
      },
      addInitNode: function (initNode) {
        _init.nodes.push(initNode);
      },
      addInitProxy: function (initProxy, isFirst) {
        if (isFirst) {
          _init.proxys.splice(0, 0, initProxy);
        } else {
          _init.proxys.push(initProxy);
        }
      },
      addInitRoot: function (initRoot) {
        _init.roots.push(initRoot);
      },
      addNodesData: function (setting, parentNode, index, nodes) {
        var childKey = setting.data.key.children,
          params;
        if (!parentNode[childKey]) {
          parentNode[childKey] = [];
          index = -1;
        } else if (index >= parentNode[childKey].length) {
          index = -1;
        }

        if (parentNode[childKey].length > 0 && index === 0) {
          parentNode[childKey][0].isFirstNode = false;
          view.setNodeLineIcos(setting, parentNode[childKey][0]);
        } else if (parentNode[childKey].length > 0 && index < 0) {
          parentNode[childKey][parentNode[childKey].length - 1].isLastNode = false;
          view.setNodeLineIcos(setting, parentNode[childKey][parentNode[childKey].length - 1]);
        }
        parentNode.isParent = true;

        if (index < 0) {
          parentNode[childKey] = parentNode[childKey].concat(nodes);
        } else {
          params = [index, 0].concat(nodes);
          parentNode[childKey].splice.apply(parentNode[childKey], params);
        }
      },
      addSelectedNode: function (setting, node) {
        var root = data.getRoot(setting);
        if (!data.isSelectedNode(setting, node)) {
          root.curSelectedList.push(node);
        }
      },
      addCreatedNode: function (setting, node) {
        if (!!setting.callback.onNodeCreated || !!setting.view.addDiyDom) {
          var root = data.getRoot(setting);
          root.createdNodes.push(node);
        }
      },
      addZTreeTools: function (zTreeTools) {
        _init.zTreeTools.push(zTreeTools);
      },
      exSetting: function (s) {
        $.extend(true, _setting, s);
      },
      fixPIdKeyValue: function (setting, node) {
        if (setting.data.simpleData.enable) {
          node[setting.data.simpleData.pIdKey] = node.parentTId ? node.getParentNode()[setting.data.simpleData.idKey] : setting.data.simpleData.rootPId;
        }
      },
      getAfterA: function (setting, node, array) {
        for (var i = 0, j = _init.afterA.length; i < j; i++) {
          _init.afterA[i].apply(this, arguments);
        }
      },
      getBeforeA: function (setting, node, array) {
        for (var i = 0, j = _init.beforeA.length; i < j; i++) {
          _init.beforeA[i].apply(this, arguments);
        }
      },
      getInnerAfterA: function (setting, node, array) {
        for (var i = 0, j = _init.innerAfterA.length; i < j; i++) {
          _init.innerAfterA[i].apply(this, arguments);
        }
      },
      getInnerBeforeA: function (setting, node, array) {
        for (var i = 0, j = _init.innerBeforeA.length; i < j; i++) {
          _init.innerBeforeA[i].apply(this, arguments);
        }
      },
      getCache: function (setting) {
        return caches[setting.treeId];
      },
      getNodeIndex: function (setting, node) {
        if (!node) return null;
        var childKey = setting.data.key.children,
          p = node.parentTId ? node.getParentNode() : data.getRoot(setting);
        for (var i = 0, l = p[childKey].length - 1; i <= l; i++) {
          if (p[childKey][i] === node) {
            return i;
          }
        }
        return -1;
      },
      getNextNode: function (setting, node) {
        if (!node) return null;
        var childKey = setting.data.key.children,
          p = node.parentTId ? node.getParentNode() : data.getRoot(setting);
        for (var i = 0, l = p[childKey].length - 1; i <= l; i++) {
          if (p[childKey][i] === node) {
            return (i == l ? null : p[childKey][i + 1]);
          }
        }
        return null;
      },
      getNodeByParam: function (setting, nodes, key, value) {
        if (!nodes || !key) return null;
        var childKey = setting.data.key.children;
        for (var i = 0, l = nodes.length; i < l; i++) {
          if (nodes[i][key] == value) {
            return nodes[i];
          }
          var tmp = data.getNodeByParam(setting, nodes[i][childKey], key, value);
          if (tmp) return tmp;
        }
        return null;
      },
      getNodeCache: function (setting, tId) {
        if (!tId) return null;
        var n = caches[setting.treeId].nodes[data.getNodeCacheId(tId)];
        return n || null;
      },
      getNodeName: function (setting, node) {
        var nameKey = setting.data.key.name;
        return '' + node[nameKey];
      },
      getNodePath: function (setting, node) {
        if (!node) return null;

        var path;
        if (node.parentTId) {
          path = node.getParentNode().getPath();
        } else {
          path = [];
        }

        if (path) {
          path.push(node);
        }

        return path;
      },
      getNodeTitle: function (setting, node) {
        var t = setting.data.key.title === '' ? setting.data.key.name : setting.data.key.title;
        return '' + node[t];
      },
      getNodes: function (setting) {
        return data.getRoot(setting)[setting.data.key.children];
      },
      getNodesByParam: function (setting, nodes, key, value) {
        if (!nodes || !key) return [];
        var childKey = setting.data.key.children,
          result = [];
        for (var i = 0, l = nodes.length; i < l; i++) {
          if (nodes[i][key] == value) {
            result.push(nodes[i]);
          }
          result = result.concat(data.getNodesByParam(setting, nodes[i][childKey], key, value));
        }
        return result;
      },
      getNodesByParamFuzzy: function (setting, nodes, key, value) {
        if (!nodes || !key) return [];
        var childKey = setting.data.key.children,
          result = [];
        value = value.toLowerCase();
        for (var i = 0, l = nodes.length; i < l; i++) {
          if (typeof nodes[i][key] === 'string' && nodes[i][key].toLowerCase().indexOf(value) > -1) {
            result.push(nodes[i]);
          }
          result = result.concat(data.getNodesByParamFuzzy(setting, nodes[i][childKey], key, value));
        }
        return result;
      },
      getNodesByFilter: function (setting, nodes, filter, isSingle, invokeParam) {
        if (!nodes) return (isSingle ? null : []);
        var childKey = setting.data.key.children,
          result = isSingle ? null : [];
        for (var i = 0, l = nodes.length; i < l; i++) {
          if (tools.apply(filter, [nodes[i], invokeParam], false)) {
            if (isSingle) {
              return nodes[i];
            }
            result.push(nodes[i]);
          }
          var tmpResult = data.getNodesByFilter(setting, nodes[i][childKey], filter, isSingle, invokeParam);
          if (isSingle && !!tmpResult) {
            return tmpResult;
          }
          result = isSingle ? tmpResult : result.concat(tmpResult);
        }
        return result;
      },
      getPreNode: function (setting, node) {
        if (!node) return null;
        var childKey = setting.data.key.children,
          p = node.parentTId ? node.getParentNode() : data.getRoot(setting);
        for (var i = 0, l = p[childKey].length; i < l; i++) {
          if (p[childKey][i] === node) {
            return (i == 0 ? null : p[childKey][i - 1]);
          }
        }
        return null;
      },
      getRoot: function (setting) {
        return setting ? roots[setting.treeId] : null;
      },
      getRoots: function () {
        return roots;
      },
      getSetting: function (treeId) {
        return settings[treeId];
      },
      getSettings: function () {
        return settings;
      },
      getZTreeTools: function (treeId) {
        var r = this.getRoot(this.getSetting(treeId));
        return r ? r.treeTools : null;
      },
      initCache: function (setting) {
        for (var i = 0, j = _init.caches.length; i < j; i++) {
          _init.caches[i].apply(this, arguments);
        }
      },
      initNode: function (setting, level, node, parentNode, preNode, nextNode) {
        for (var i = 0, j = _init.nodes.length; i < j; i++) {
          _init.nodes[i].apply(this, arguments);
        }
      },
      initRoot: function (setting) {
        for (var i = 0, j = _init.roots.length; i < j; i++) {
          _init.roots[i].apply(this, arguments);
        }
      },
      isSelectedNode: function (setting, node) {
        var root = data.getRoot(setting);
        for (var i = 0, j = root.curSelectedList.length; i < j; i++) {
          if (node === root.curSelectedList[i]) return true;
        }
        return false;
      },
      removeNodeCache: function (setting, node) {
        var childKey = setting.data.key.children;
        if (node[childKey]) {
          for (var i = 0, l = node[childKey].length; i < l; i++) {
            data.removeNodeCache(setting, node[childKey][i]);
          }
        }
        data.getCache(setting).nodes[data.getNodeCacheId(node.tId)] = null;
      },
      removeSelectedNode: function (setting, node) {
        var root = data.getRoot(setting);
        for (var i = 0, j = root.curSelectedList.length; i < j; i++) {
          if (node === root.curSelectedList[i] || !data.getNodeCache(setting, root.curSelectedList[i].tId)) {
            root.curSelectedList.splice(i, 1);
            setting.treeObj.trigger(consts.event.UNSELECTED, [setting.treeId, node]);
            i--;
            j--;
          }
        }
      },
      setCache: function (setting, cache) {
        caches[setting.treeId] = cache;
      },
      setRoot: function (setting, root) {
        roots[setting.treeId] = root;
      },
      setZTreeTools: function (setting, zTreeTools) {
        for (var i = 0, j = _init.zTreeTools.length; i < j; i++) {
          _init.zTreeTools[i].apply(this, arguments);
        }
      },
      transformToArrayFormat: function (setting, nodes) {
        if (!nodes) return [];
        var childKey = setting.data.key.children,
          r = [];
        if (tools.isArray(nodes)) {
          for (var i = 0, l = nodes.length; i < l; i++) {
            r.push(nodes[i]);
            if (nodes[i][childKey]) {
              r = r.concat(data.transformToArrayFormat(setting, nodes[i][childKey]));
            }
          }
        } else {
          r.push(nodes);
          if (nodes[childKey]) {
            r = r.concat(data.transformToArrayFormat(setting, nodes[childKey]));
          }
        }
        return r;
      },
      transformTozTreeFormat: function (setting, sNodes) {
        var i, l,
          key = setting.data.simpleData.idKey,
          parentKey = setting.data.simpleData.pIdKey,
          childKey = setting.data.key.children;
        if (!key || key == '' || !sNodes) return [];

        if (tools.isArray(sNodes)) {
          var r = [];
          var tmpMap = {};
          for (i = 0, l = sNodes.length; i < l; i++) {
            tmpMap[sNodes[i][key]] = sNodes[i];
          }
          for (i = 0, l = sNodes.length; i < l; i++) {
            if (tmpMap[sNodes[i][parentKey]] && sNodes[i][key] != sNodes[i][parentKey]) {
              if (!tmpMap[sNodes[i][parentKey]][childKey]) {
                tmpMap[sNodes[i][parentKey]][childKey] = [];
              }
              tmpMap[sNodes[i][parentKey]][childKey].push(sNodes[i]);
            } else {
              r.push(sNodes[i]);
            }
          }
          return r;
        } else {
          return [sNodes];
        }
      }
    },
    // method of event proxy
    event = {
      bindEvent: function (setting) {
        for (var i = 0, j = _init.bind.length; i < j; i++) {
          _init.bind[i].apply(this, arguments);
        }
      },
      unbindEvent: function (setting) {
        for (var i = 0, j = _init.unbind.length; i < j; i++) {
          _init.unbind[i].apply(this, arguments);
        }
      },
      bindTree: function (setting) {
        var eventParam = {
            treeId: setting.treeId
          },
          o = setting.treeObj;
        if (!setting.view.txtSelectedEnable) {
          // for can't select text
          o.bind('selectstart', handler.onSelectStart).css({
            '-moz-user-select': '-moz-none'
          });
        }
        o.bind('click', eventParam, event.proxy);
        o.bind('dblclick', eventParam, event.proxy);
        o.bind('mouseover', eventParam, event.proxy);
        o.bind('mouseout', eventParam, event.proxy);
        o.bind('mousedown', eventParam, event.proxy);
        o.bind('mouseup', eventParam, event.proxy);
        o.bind('contextmenu', eventParam, event.proxy);
      },
      unbindTree: function (setting) {
        var o = setting.treeObj;
        o.unbind('selectstart', handler.onSelectStart)
          .unbind('click', event.proxy)
          .unbind('dblclick', event.proxy)
          .unbind('mouseover', event.proxy)
          .unbind('mouseout', event.proxy)
          .unbind('mousedown', event.proxy)
          .unbind('mouseup', event.proxy)
          .unbind('contextmenu', event.proxy);
      },
      doProxy: function (e) {
        var results = [];
        for (var i = 0, j = _init.proxys.length; i < j; i++) {
          var proxyResult = _init.proxys[i].apply(this, arguments);
          results.push(proxyResult);
          if (proxyResult.stop) {
            break;
          }
        }
        return results;
      },
      proxy: function (e) {
        var setting = data.getSetting(e.data.treeId);
        if (!tools.uCanDo(setting, e)) return true;
        var results = event.doProxy(e),
          r = true,
          x = false;
        for (var i = 0, l = results.length; i < l; i++) {
          var proxyResult = results[i];
          if (proxyResult.nodeEventCallback) {
            x = true;
            r = proxyResult.nodeEventCallback.apply(proxyResult, [e, proxyResult.node]) && r;
          }
          if (proxyResult.treeEventCallback) {
            x = true;
            r = proxyResult.treeEventCallback.apply(proxyResult, [e, proxyResult.node]) && r;
          }
        }
        return r;
      }
    },
    // method of event handler
    handler = {
      onSwitchNode: function (event, node) {
        var setting = data.getSetting(event.data.treeId);
        if (node.open) {
          if (tools.apply(setting.callback.beforeCollapse, [setting.treeId, node], true) == false) return true;
          data.getRoot(setting).expandTriggerFlag = true;
          view.switchNode(setting, node);
        } else {
          if (tools.apply(setting.callback.beforeExpand, [setting.treeId, node], true) == false) return true;
          data.getRoot(setting).expandTriggerFlag = true;
          view.switchNode(setting, node);
        }
        return true;
      },
      onClickNode: function (event, node) {
        // console.log(node.open)
        var setting = data.getSetting(event.data.treeId),
          clickFlag = ((setting.view.autoCancelSelected && (event.ctrlKey || event.metaKey)) && data.isSelectedNode(setting, node)) ? 0 : (setting.view.autoCancelSelected && (event.ctrlKey || event.metaKey) && setting.view.selectedMulti) ? 2 : 1;
        if (tools.apply(setting.callback.beforeClick, [setting.treeId, node, clickFlag], true) == false) return true;
        if (clickFlag === 0) {
          view.cancelPreSelectedNode(setting, node);
        } else {
          view.selectNode(setting, node, clickFlag === 2);
        }
        setting.treeObj.trigger(consts.event.CLICK, [event, setting.treeId, node, clickFlag]);
        view.switchNode(setting, node);
        return true;
      },
      onZTreeMousedown: function (event, node) {
        var setting = data.getSetting(event.data.treeId);
        if (tools.apply(setting.callback.beforeMouseDown, [setting.treeId, node], true)) {
          tools.apply(setting.callback.onMouseDown, [event, setting.treeId, node]);
        }
        return true;
      },
      onZTreeMouseup: function (event, node) {
        var setting = data.getSetting(event.data.treeId);
        if (tools.apply(setting.callback.beforeMouseUp, [setting.treeId, node], true)) {
          tools.apply(setting.callback.onMouseUp, [event, setting.treeId, node]);
        }
        return true;
      },
      onZTreeDblclick: function (event, node) {
        var setting = data.getSetting(event.data.treeId);
        if (tools.apply(setting.callback.beforeDblClick, [setting.treeId, node], true)) {
          tools.apply(setting.callback.onDblClick, [event, setting.treeId, node]);
        }
        return true;
      },
      onZTreeContextmenu: function (event, node) {
        var setting = data.getSetting(event.data.treeId);
        if (tools.apply(setting.callback.beforeRightClick, [setting.treeId, node], true)) {
          tools.apply(setting.callback.onRightClick, [event, setting.treeId, node]);
        }
        return (typeof setting.callback.onRightClick) !== 'function';
      },
      onSelectStart: function (e) {
        var n = e.originalEvent.srcElement.nodeName.toLowerCase();
        return (n === 'input' || n === 'textarea');
      }
    },
    // method of tools for zTree
    tools = {
      apply: function (fun, param, defaultValue) {
        if ((typeof fun) === 'function') {
          return fun.apply(zt, param || []);
        }
        return defaultValue;
      },
      canAsync: function (setting, node) {
        var childKey = setting.data.key.children;
        return (setting.async.enable && node && node.isParent && !(node.zAsync || (node[childKey] && node[childKey].length > 0)));
      },
      clone: function (obj) {
        if (obj === null) return null;
        var o = tools.isArray(obj) ? [] : {};
        for (var i in obj) {
          o[i] = (obj[i] instanceof Date) ? new Date(obj[i].getTime()) : (typeof obj[i] === 'object' ? tools.clone(obj[i]) : obj[i]);
        }
        return o;
      },
      eqs: function (str1, str2) {
        return str1.toLowerCase() === str2.toLowerCase();
      },
      isArray: function (arr) {
        return Object.prototype.toString.apply(arr) === '[object Array]';
      },
      isElement: function (o) {
        return (
          typeof HTMLElement === 'object' ? o instanceof HTMLElement //DOM2
          :
          o && typeof o === 'object' && o !== null && o.nodeType === 1 && typeof o.nodeName === 'string'
        );
      },
      $: function (node, exp, setting) {
        if (!!exp && typeof exp !== 'string') {
          setting = exp;
          exp = '';
        }
        if (typeof node === 'string') {
          return $(node, setting ? setting.treeObj.get(0).ownerDocument : null);
        } else {
          return $('#' + node.tId + exp, setting ? setting.treeObj : null);
        }
      },
      getMDom: function (setting, curDom, targetExpr) {
        if (!curDom) return null;
        while (curDom && curDom.id !== setting.treeId) {
          for (var i = 0, l = targetExpr.length; curDom.tagName && i < l; i++) {
            if (tools.eqs(curDom.tagName, targetExpr[i].tagName) && curDom.getAttribute(targetExpr[i].attrName) !== null) {
              return curDom;
            }
          }
          curDom = curDom.parentNode;
        }
        return null;
      },
      getNodeMainDom: function (target) {
        return ($(target).parent('li').get(0) || $(target).parentsUntil('li').parent().get(0));
      },
      isChildOrSelf: function (dom, parentId) {
        return ($(dom).closest('#' + parentId).length > 0);
      },
      uCanDo: function (setting, e) {
        return true;
      }
    },
    // method of operate ztree dom
    view = {
      addNodes: function (setting, parentNode, index, newNodes, isSilent) {
        if (setting.data.keep.leaf && parentNode && !parentNode.isParent) {
          return;
        }
        if (!tools.isArray(newNodes)) {
          newNodes = [newNodes];
        }
        if (setting.data.simpleData.enable) {
          newNodes = data.transformTozTreeFormat(setting, newNodes);
        }
        if (parentNode) {
          var target_switchObj = $$(parentNode, consts.id.SWITCH, setting),
            target_icoObj = $$(parentNode, consts.id.ICON, setting),
            target_ulObj = $$(parentNode, consts.id.UL, setting);

          if (!parentNode.open) {
            view.replaceSwitchClass(parentNode, target_switchObj, consts.folder.CLOSE);
            view.replaceIcoClass(parentNode, target_icoObj, consts.folder.CLOSE);
            parentNode.open = false;
            target_ulObj.css({
              'display': 'none'
            });
          }

          data.addNodesData(setting, parentNode, index, newNodes);
          view.createNodes(setting, parentNode.level + 1, newNodes, parentNode, index);
          if (!isSilent) {
            view.expandCollapseParentNode(setting, parentNode, true);
          }
        } else {
          data.addNodesData(setting, data.getRoot(setting), index, newNodes);
          view.createNodes(setting, 0, newNodes, null, index);
        }
      },
      appendNodes: function (setting, level, nodes, parentNode, index, initFlag, openFlag) {
        if (!nodes) return [];
        var html = [],
          childKey = setting.data.key.children;

        var tmpPNode = (parentNode) || data.getRoot(setting),
          tmpPChild = tmpPNode[childKey],
          isFirstNode, isLastNode;

        if (!tmpPChild || index >= tmpPChild.length - nodes.length) {
          index = -1;
        }

        for (var i = 0, l = nodes.length; i < l; i++) {
          var node = nodes[i];
          if (initFlag) {
            isFirstNode = ((index === 0 || tmpPChild.length == nodes.length) && (i == 0));
            isLastNode = (index < 0 && i == (nodes.length - 1));
            data.initNode(setting, level, node, parentNode, isFirstNode, isLastNode, openFlag);
            data.addNodeCache(setting, node);
          }

          var childHtml = [];
          if (node[childKey] && node[childKey].length > 0) {
            // make child html first, because checkType
            childHtml = view.appendNodes(setting, level + 1, node[childKey], node, -1, initFlag, openFlag && node.open);
          }
          if (openFlag) {
            view.makeDOMNodeMainBefore(html, setting, node);
            view.makeDOMNodeLine(html, setting, node);
            data.getBeforeA(setting, node, html);
            view.makeDOMNodeNameBefore(html, setting, node);
            data.getInnerBeforeA(setting, node, html);
            view.makeDOMNodeIcon(html, setting, node);
            data.getInnerAfterA(setting, node, html);
            view.makeDOMNodeNameAfter(html, setting, node);
            data.getAfterA(setting, node, html);
            if (node.isParent && node.open) {
              view.makeUlHtml(setting, node, html, childHtml.join(''));
            }
            view.makeDOMNodeMainAfter(html, setting, node);
            data.addCreatedNode(setting, node);
          }
        }
        return html;
      },
      appendParentULDom: function (setting, node) {
        var html = [],
          nObj = $$(node, setting);
        if (!nObj.get(0) && !!node.parentTId) {
          view.appendParentULDom(setting, node.getParentNode());
          nObj = $$(node, setting);
        }
        var ulObj = $$(node, consts.id.UL, setting);
        if (ulObj.get(0)) {
          ulObj.remove();
        }
        var childKey = setting.data.key.children,
          childHtml = view.appendNodes(setting, node.level + 1, node[childKey], node, -1, false, true);
        view.makeUlHtml(setting, node, html, childHtml.join(''));
        nObj.append(html.join(''));
      },
      asyncNode: function (setting, node, isSilent, callback) {
        var i, l;
        if (node && !node.isParent) {
          tools.apply(callback);
          return false;
        } else if (node && node.isAjaxing) {
          return false;
        } else if (tools.apply(setting.callback.beforeAsync, [setting.treeId, node], true) == false) {
          tools.apply(callback);
          return false;
        }
        if (node) {
          node.isAjaxing = true;
          var icoObj = $$(node, consts.id.ICON, setting);
          icoObj.attr({
            'style': '',
            'class': consts.className.BUTTON + ' ' + consts.className.ICO_LOADING
          });
        }

        var tmpParam = {};
        for (i = 0, l = setting.async.autoParam.length; node && i < l; i++) {
          var pKey = setting.async.autoParam[i].split('='),
            spKey = pKey;
          if (pKey.length > 1) {
            spKey = pKey[1];
            pKey = pKey[0];
          }
          tmpParam[spKey] = node[pKey];
        }
        if (tools.isArray(setting.async.otherParam)) {
          for (i = 0, l = setting.async.otherParam.length; i < l; i += 2) {
            tmpParam[setting.async.otherParam[i]] = setting.async.otherParam[i + 1];
          }
        } else {
          for (var p in setting.async.otherParam) {
            tmpParam[p] = setting.async.otherParam[p];
          }
        }

        var _tmpV = data.getRoot(setting)._ver;
        $.ajax({
          contentType: setting.async.contentType,
          cache: false,
          type: setting.async.type,
          url: tools.apply(setting.async.url, [setting.treeId, node], setting.async.url),
          data: setting.async.contentType.indexOf('application/json') > -1 ? JSON.stringify(tmpParam) : tmpParam,
          dataType: setting.async.dataType,
          success: function (msg) {
            // msg = msg.data
            msg = eval('(' + msg + ')').data
            if (_tmpV != data.getRoot(setting)._ver) {
              return;
            }
            var newNodes = [];
            try {
              if (!msg || msg.length == 0) {
                newNodes = [];
              } else if (typeof msg === 'string') {
                newNodes = eval('(' + msg + ')');
              } else {
                newNodes = msg;
              }
            } catch (err) {
              newNodes = msg;
            }

            if (node) {
              node.isAjaxing = null;
              node.zAsync = true;
            }
            view.setNodeLineIcos(setting, node);
            if (newNodes && newNodes !== '') {
              newNodes = tools.apply(setting.async.dataFilter, [setting.treeId, node, newNodes], newNodes);
              view.addNodes(setting, node, -1, newNodes ? tools.clone(newNodes) : [], !!isSilent);
            } else {
              view.addNodes(setting, node, -1, [], !!isSilent);
            }
            setting.treeObj.trigger(consts.event.ASYNC_SUCCESS, [setting.treeId, node, msg]);
            tools.apply(callback);
          },
          error: function (XMLHttpRequest, textStatus, errorThrown) {
            if (_tmpV != data.getRoot(setting)._ver) {
              return;
            }
            if (node) node.isAjaxing = null;
            view.setNodeLineIcos(setting, node);
            setting.treeObj.trigger(consts.event.ASYNC_ERROR, [setting.treeId, node, XMLHttpRequest, textStatus, errorThrown]);
          }
        });
        return true;
      },
      cancelPreSelectedNode: function (setting, node, excludeNode) {
        var list = data.getRoot(setting).curSelectedList,
          i, n;
        for (i = list.length - 1; i >= 0; i--) {
          n = list[i];
          if (node === n || (!node && (!excludeNode || excludeNode !== n))) {
            $$(n, consts.id.A, setting).removeClass(consts.node.CURSELECTED);
            if (node) {
              data.removeSelectedNode(setting, node);
              break;
            } else {
              list.splice(i, 1);
              setting.treeObj.trigger(consts.event.UNSELECTED, [setting.treeId, n]);
            }
          }
        }
      },
      createNodeCallback: function (setting) {
        if (!!setting.callback.onNodeCreated || !!setting.view.addDiyDom) {
          var root = data.getRoot(setting);
          while (root.createdNodes.length > 0) {
            var node = root.createdNodes.shift();
            tools.apply(setting.view.addDiyDom, [setting.treeId, node]);
            if (setting.callback.onNodeCreated) {
              setting.treeObj.trigger(consts.event.NODECREATED, [setting.treeId, node]);
            }
          }
        }
      },
      createNodes: function (setting, level, nodes, parentNode, index) {
        if (!nodes || nodes.length == 0) return;
        var root = data.getRoot(setting),
          childKey = setting.data.key.children,
          openFlag = !parentNode || parentNode.open || !!$$(parentNode[childKey][0], setting).get(0);
        root.createdNodes = [];
        var zTreeHtml = view.appendNodes(setting, level, nodes, parentNode, index, true, openFlag),
          parentObj, nextObj;

        if (!parentNode) {
          parentObj = setting.treeObj;
          // setting.treeObj.append(zTreeHtml.join(''));
        } else {
          var ulObj = $$(parentNode, consts.id.UL, setting);
          if (ulObj.get(0)) {
            parentObj = ulObj;
            // ulObj.append(zTreeHtml.join(''));
          }
        }
        if (parentObj) {
          if (index >= 0) {
            nextObj = parentObj.children()[index];
          }
          if (index >= 0 && nextObj) {
            $(nextObj).before(zTreeHtml.join(''));
          } else {
            parentObj.append(zTreeHtml.join(''));
          }
        }

        view.createNodeCallback(setting);
      },
      destroy: function (setting) {
        if (!setting) return;
        data.initCache(setting);
        data.initRoot(setting);
        event.unbindTree(setting);
        event.unbindEvent(setting);
        setting.treeObj.empty();
        delete settings[setting.treeId];
      },
      expandCollapseNode: function (setting, node, expandFlag, animateFlag, callback) {
        var root = data.getRoot(setting),
          childKey = setting.data.key.children;
        var tmpCb, _callback;
        if (!node) {
          tools.apply(callback, []);
          return;
        }
        if (root.expandTriggerFlag) {
          _callback = callback;
          tmpCb = function () {
            if (_callback) _callback();
            if (node.open) {
              setting.treeObj.trigger(consts.event.EXPAND, [setting.treeId, node]);
            } else {
              setting.treeObj.trigger(consts.event.COLLAPSE, [setting.treeId, node]);
            }
          };
          callback = tmpCb;
          root.expandTriggerFlag = false;
        }
        if (!node.open && node.isParent && ((!$$(node, consts.id.UL, setting).get(0)) || (node[childKey] && node[childKey].length > 0 && !$$(node[childKey][0], setting).get(0)))) {
          view.appendParentULDom(setting, node);
          view.createNodeCallback(setting);
        }
        if (node.open == expandFlag) {
          tools.apply(callback, []);
          return;
        }
        var ulObj = $$(node, consts.id.UL, setting),
          switchObj = $$(node, consts.id.SWITCH, setting),
          icoObj = $$(node, consts.id.ICON, setting);

        if (node.isParent) {
          node.open = !node.open;
          if (node.iconOpen && node.iconClose) {
            icoObj.attr('style', view.makeNodeIcoStyle(setting, node));
          }

          if (node.open) {
            // console.log(node);
            view.replaceSwitchClass(node, switchObj, consts.folder.OPEN);
            view.replaceIcoClass(node, icoObj, consts.folder.OPEN);
            if (animateFlag == false || setting.view.expandSpeed == '') {
              ulObj.show();
              tools.apply(callback, []);
            } else {
              if (node[childKey] && node[childKey].length > 0) {
                ulObj.slideDown(setting.view.expandSpeed, callback);
              } else {
                ulObj.show();
                tools.apply(callback, []);
              }
            }
          } else {
            view.replaceSwitchClass(node, switchObj, consts.folder.CLOSE);
            view.replaceIcoClass(node, icoObj, consts.folder.CLOSE);
            if (animateFlag == false || setting.view.expandSpeed == '' || !(node[childKey] && node[childKey].length > 0)) {
              ulObj.hide();
              tools.apply(callback, []);
            } else {
              ulObj.slideUp(setting.view.expandSpeed, callback);
            }
          }
        } else {
          tools.apply(callback, []);
        }
      },
      expandCollapseParentNode: function (setting, node, expandFlag, animateFlag, callback) {
        if (!node) return;
        if (!node.parentTId) {
          view.expandCollapseNode(setting, node, expandFlag, animateFlag, callback);
          return;
        } else {
          view.expandCollapseNode(setting, node, expandFlag, animateFlag);
        }
        if (node.parentTId) {
          view.expandCollapseParentNode(setting, node.getParentNode(), expandFlag, animateFlag, callback);
        }
      },
      expandCollapseSonNode: function (setting, node, expandFlag, animateFlag, callback) {
        var root = data.getRoot(setting),
          childKey = setting.data.key.children,
          treeNodes = (node) ? node[childKey] : root[childKey],
          selfAnimateSign = (node) ? false : animateFlag,
          expandTriggerFlag = data.getRoot(setting).expandTriggerFlag;
        data.getRoot(setting).expandTriggerFlag = false;
        if (treeNodes) {
          for (var i = 0, l = treeNodes.length; i < l; i++) {
            if (treeNodes[i]) view.expandCollapseSonNode(setting, treeNodes[i], expandFlag, selfAnimateSign);
          }
        }
        data.getRoot(setting).expandTriggerFlag = expandTriggerFlag;
        view.expandCollapseNode(setting, node, expandFlag, animateFlag, callback);
      },
      isSelectedNode: function (setting, node) {
        if (!node) {
          return false;
        }
        var list = data.getRoot(setting).curSelectedList,
          i;
        for (i = list.length - 1; i >= 0; i--) {
          if (node === list[i]) {
            return true;
          }
        }
        return false;
      },
      makeDOMNodeIcon: function (html, setting, node) {
        var nameStr = data.getNodeName(setting, node),
          name = setting.view.nameIsHTML ? nameStr : nameStr.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        html.push("<span id='", node.tId, consts.id.ICON,
          "' title='' treeNode", consts.id.ICON, " class='", view.makeNodeIcoClass(setting, node),
          "' style='", view.makeNodeIcoStyle(setting, node), "'></span><span id='", node.tId, consts.id.SPAN,
          "' class='", consts.className.NAME,
          "'>", name, '</span>');
      },
      makeDOMNodeLine: function (html, setting, node) {
        if (node.children && node.children.length) {
          html.push("<span id='", node.tId, consts.id.SWITCH, "' title='' class='", view.makeNodeLineClass(setting, node), "' treeNode", consts.id.SWITCH, '></span>');
        }
      },
      makeDOMNodeMainAfter: function (html, setting, node) {
        html.push('</li>');
      },
      makeDOMNodeMainBefore: function (html, setting, node) {
        html.push("<li id='", node.tId, "' class='", consts.className.LEVEL, node.level, "' tabindex='0' hidefocus='true' treenode>");
      },
      makeDOMNodeNameAfter: function (html, setting, node) {
        html.push('</a>');
      },
      makeDOMNodeNameBefore: function (html, setting, node) {
        var title = data.getNodeTitle(setting, node),
          url = view.makeNodeUrl(setting, node),
          fontcss = view.makeNodeFontCss(setting, node),
          fontStyle = [];
        for (var f in fontcss) {
          fontStyle.push(f, ':', fontcss[f], ';');
        }

        html.push("<a id='", node.tId, consts.id.A, "' class='", consts.className.LEVEL, node.level, "' treeNode", consts.id.A, ' onclick="', (node.click || ''),
          '" ', ((url != null && url.length > 0) ? "href='" + url + "'" : ''), " target='", view.makeNodeTarget(node), "' style='", fontStyle.join(''),
          "'");
        if (tools.apply(setting.view.showTitle, [setting.treeId, node], setting.view.showTitle) && title) {
          html.push("title='", title.replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;'), "'");
        }
        html.push('>');
      },
      makeNodeFontCss: function (setting, node) {
        var fontCss = tools.apply(setting.view.fontCss, [setting.treeId, node], setting.view.fontCss);
        return (fontCss && ((typeof fontCss) !== 'function')) ? fontCss : {};
      },
      makeNodeIcoClass: function (setting, node) {
        var icoCss = ['ico'];
        if (!node.isAjaxing) {
          icoCss[0] = (node.iconSkin ? node.iconSkin + '_' : '') + icoCss[0];
          if (node.isParent) {
            icoCss.push(node.open ? consts.folder.OPEN : consts.folder.CLOSE);
          } else {
            icoCss.push(consts.folder.DOCU);
          }
        }
        return consts.className.BUTTON + ' ' + icoCss.join('_');
      },
      makeNodeIcoStyle: function (setting, node) {
        var icoStyle = [];
        if (!node.isAjaxing) {
          var icon = (node.isParent && node.iconOpen && node.iconClose) ? (node.open ? node.iconOpen : node.iconClose) : node[setting.data.key.icon];
          if (icon) icoStyle.push('background:url(', icon, ') 0 0 no-repeat;');
          if (setting.view.showIcon == false || !tools.apply(setting.view.showIcon, [setting.treeId, node], true)) {
            icoStyle.push('width:0px;height:0px;');
          }
        }
        return icoStyle.join('');
      },
      makeNodeLineClass: function (setting, node) {
        var lineClass = [];
        if (setting.view.showLine) {
          if (node.level == 0 && node.isFirstNode && node.isLastNode) {
            lineClass.push(consts.line.ROOT);
          } else if (node.level == 0 && node.isFirstNode) {
            lineClass.push(consts.line.ROOTS);
          } else if (node.isLastNode) {
            lineClass.push(consts.line.BOTTOM);
          } else {
            lineClass.push(consts.line.CENTER);
          }
        } else {
          lineClass.push(consts.line.NOLINE);
        }
        if (node.isParent) {
          lineClass.push(node.open ? consts.folder.OPEN : consts.folder.CLOSE);
        } else {
          lineClass.push(consts.folder.DOCU);
        }
        return view.makeNodeLineClassEx(node) + lineClass.join('_');
      },
      makeNodeLineClassEx: function (node) {
        return consts.className.BUTTON + ' ' + consts.className.LEVEL + node.level + ' ' + consts.className.SWITCH + ' ';
      },
      makeNodeTarget: function (node) {
        return (node.target || '_blank');
      },
      makeNodeUrl: function (setting, node) {
        var urlKey = setting.data.key.url;
        return node[urlKey] ? node[urlKey] : null;
      },
      makeUlHtml: function (setting, node, html, content) {
        html.push("<ul id='", node.tId, consts.id.UL, "' class='", consts.className.LEVEL, node.level, ' ', view.makeUlLineClass(setting, node), "' style='display:", (node.open ? 'block' : 'none'), "'>");
        html.push(content);
        html.push('</ul>');
      },
      makeUlLineClass: function (setting, node) {
        return ((setting.view.showLine && !node.isLastNode) ? consts.line.LINE : '');
      },
      removeChildNodes: function (setting, node) {
        if (!node) return;
        var childKey = setting.data.key.children,
          nodes = node[childKey];
        if (!nodes) return;

        for (var i = 0, l = nodes.length; i < l; i++) {
          data.removeNodeCache(setting, nodes[i]);
        }
        data.removeSelectedNode(setting);
        delete node[childKey];

        if (!setting.data.keep.parent) {
          node.isParent = false;
          node.open = false;
          var tmp_switchObj = $$(node, consts.id.SWITCH, setting),
            tmp_icoObj = $$(node, consts.id.ICON, setting);
          view.replaceSwitchClass(node, tmp_switchObj, consts.folder.DOCU);
          view.replaceIcoClass(node, tmp_icoObj, consts.folder.DOCU);
          $$(node, consts.id.UL, setting).remove();
        } else {
          $$(node, consts.id.UL, setting).empty();
        }
      },
      scrollIntoView: function (setting, dom) {
        if (!dom) {
          return;
        }
        // support IE 7
        if (typeof Element === 'undefined') {
          var contRect = setting.treeObj.get(0).getBoundingClientRect(),
            findMeRect = dom.getBoundingClientRect();
          if (findMeRect.top < contRect.top || findMeRect.bottom > contRect.bottom ||
            findMeRect.right > contRect.right || findMeRect.left < contRect.left) {
            dom.scrollIntoView();
          }
          return;
        }
        // code src: http://jsfiddle.net/08u6cxwj/
        if (!Element.prototype.scrollIntoViewIfNeeded) {
          Element.prototype.scrollIntoViewIfNeeded = function (centerIfNeeded) {
            function withinBounds(value, min, max, extent) {
              if (centerIfNeeded === false || max <= value + extent && value <= min + extent) {
                return Math.min(max, Math.max(min, value));
              } else {
                return (min + max) / 2;
              }
            }

            function makeArea(left, top, width, height) {
              return {
                'left': left,
                'top': top,
                'width': width,
                'height': height,
                'right': left + width,
                'bottom': top + height,
                'translate': function (x, y) {
                  return makeArea(x + left, y + top, width, height);
                },
                'relativeFromTo': function (lhs, rhs) {
                  var newLeft = left,
                    newTop = top;
                  lhs = lhs.offsetParent;
                  rhs = rhs.offsetParent;
                  if (lhs === rhs) {
                    return area;
                  }
                  for (; lhs; lhs = lhs.offsetParent) {
                    newLeft += lhs.offsetLeft + lhs.clientLeft;
                    newTop += lhs.offsetTop + lhs.clientTop;
                  }
                  for (; rhs; rhs = rhs.offsetParent) {
                    newLeft -= rhs.offsetLeft + rhs.clientLeft;
                    newTop -= rhs.offsetTop + rhs.clientTop;
                  }
                  return makeArea(newLeft, newTop, width, height);
                }
              };
            }

            var parent, elem = this,
              area = makeArea(
                this.offsetLeft, this.offsetTop,
                this.offsetWidth, this.offsetHeight);
            while (tools.isElement(parent = elem.parentNode)) {
              var clientLeft = parent.offsetLeft + parent.clientLeft;
              var clientTop = parent.offsetTop + parent.clientTop;

              // Make area relative to parent's client area.
              area = area.relativeFromTo(elem, parent).translate(-clientLeft, -clientTop);

              parent.scrollLeft = withinBounds(
                parent.scrollLeft,
                area.right - parent.clientWidth, area.left,
                parent.clientWidth);

              parent.scrollTop = withinBounds(
                parent.scrollTop,
                area.bottom - parent.clientHeight, area.top,
                parent.clientHeight);

              // Determine actual scroll amount by reading back scroll properties.
              area = area.translate(clientLeft - parent.scrollLeft,
                clientTop - parent.scrollTop);
              elem = parent;
            }
          };
        }
        dom.scrollIntoViewIfNeeded();
      },
      setFirstNode: function (setting, parentNode) {
        var childKey = setting.data.key.children,
          childLength = parentNode[childKey].length;
        if (childLength > 0) {
          parentNode[childKey][0].isFirstNode = true;
        }
      },
      setLastNode: function (setting, parentNode) {
        var childKey = setting.data.key.children,
          childLength = parentNode[childKey].length;
        if (childLength > 0) {
          parentNode[childKey][childLength - 1].isLastNode = true;
        }
      },
      removeNode: function (setting, node) {
        var root = data.getRoot(setting),
          childKey = setting.data.key.children,
          parentNode = (node.parentTId) ? node.getParentNode() : root;

        node.isFirstNode = false;
        node.isLastNode = false;
        node.getPreNode = function () {
          return null;
        };
        node.getNextNode = function () {
          return null;
        };

        if (!data.getNodeCache(setting, node.tId)) {
          return;
        }

        $$(node, setting).remove();
        data.removeNodeCache(setting, node);
        data.removeSelectedNode(setting, node);

        for (var i = 0, l = parentNode[childKey].length; i < l; i++) {
          if (parentNode[childKey][i].tId == node.tId) {
            parentNode[childKey].splice(i, 1);
            break;
          }
        }
        view.setFirstNode(setting, parentNode);
        view.setLastNode(setting, parentNode);

        var tmp_ulObj, tmp_switchObj, tmp_icoObj,
          childLength = parentNode[childKey].length;

        // repair nodes old parent
        if (!setting.data.keep.parent && childLength == 0) {
          // old parentNode has no child nodes
          parentNode.isParent = false;
          parentNode.open = false;
          tmp_ulObj = $$(parentNode, consts.id.UL, setting);
          tmp_switchObj = $$(parentNode, consts.id.SWITCH, setting);
          tmp_icoObj = $$(parentNode, consts.id.ICON, setting);
          view.replaceSwitchClass(parentNode, tmp_switchObj, consts.folder.DOCU);
          view.replaceIcoClass(parentNode, tmp_icoObj, consts.folder.DOCU);
          tmp_ulObj.css('display', 'none');
        } else if (setting.view.showLine && childLength > 0) {
          // old parentNode has child nodes
          var newLast = parentNode[childKey][childLength - 1];
          tmp_ulObj = $$(newLast, consts.id.UL, setting);
          tmp_switchObj = $$(newLast, consts.id.SWITCH, setting);
          tmp_icoObj = $$(newLast, consts.id.ICON, setting);
          if (parentNode == root) {
            if (parentNode[childKey].length == 1) {
              // node was root, and ztree has only one root after move node
              view.replaceSwitchClass(newLast, tmp_switchObj, consts.line.ROOT);
            } else {
              var tmp_first_switchObj = $$(parentNode[childKey][0], consts.id.SWITCH, setting);
              view.replaceSwitchClass(parentNode[childKey][0], tmp_first_switchObj, consts.line.ROOTS);
              view.replaceSwitchClass(newLast, tmp_switchObj, consts.line.BOTTOM);
            }
          } else {
            view.replaceSwitchClass(newLast, tmp_switchObj, consts.line.BOTTOM);
          }
          tmp_ulObj.removeClass(consts.line.LINE);
        }
      },
      replaceIcoClass: function (node, obj, newName) {
        if (!obj || node.isAjaxing) return;
        var tmpName = obj.attr('class');
        if (tmpName == undefined) return;
        var tmpList = tmpName.split('_');
        switch (newName) {
          case consts.folder.OPEN:
          case consts.folder.CLOSE:
          case consts.folder.DOCU:
            tmpList[tmpList.length - 1] = newName;
            break;
        }
        obj.attr('class', tmpList.join('_'));
      },
      replaceSwitchClass: function (node, obj, newName) {
        if (!obj) return;
        var tmpName = obj.attr('class');
        if (tmpName == undefined) return;
        var tmpList = tmpName.split('_');
        switch (newName) {
          case consts.line.ROOT:
          case consts.line.ROOTS:
          case consts.line.CENTER:
          case consts.line.BOTTOM:
          case consts.line.NOLINE:
            tmpList[0] = view.makeNodeLineClassEx(node) + newName;
            break;
          case consts.folder.OPEN:
          case consts.folder.CLOSE:
          case consts.folder.DOCU:
            tmpList[1] = newName;
            break;
        }
        obj.attr('class', tmpList.join('_'));
        if (newName !== consts.folder.DOCU) {
          obj.removeAttr('disabled');
        } else {
          obj.attr('disabled', 'disabled');
        }
      },
      selectNode: function (setting, node, addFlag) {
        if (!addFlag) {
          view.cancelPreSelectedNode(setting, null, node);
        }
        $$(node, consts.id.A, setting).addClass(consts.node.CURSELECTED);
        data.addSelectedNode(setting, node);
        setting.treeObj.trigger(consts.event.SELECTED, [setting.treeId, node]);
      },
      setNodeFontCss: function (setting, treeNode) {
        var aObj = $$(treeNode, consts.id.A, setting),
          fontCss = view.makeNodeFontCss(setting, treeNode);
        if (fontCss) {
          aObj.css(fontCss);
        }
      },
      setNodeLineIcos: function (setting, node) {
        if (!node) return;
        var switchObj = $$(node, consts.id.SWITCH, setting),
          ulObj = $$(node, consts.id.UL, setting),
          icoObj = $$(node, consts.id.ICON, setting),
          ulLine = view.makeUlLineClass(setting, node);
        if (ulLine.length == 0) {
          ulObj.removeClass(consts.line.LINE);
        } else {
          ulObj.addClass(ulLine);
        }
        switchObj.attr('class', view.makeNodeLineClass(setting, node));
        if (node.isParent) {
          switchObj.removeAttr('disabled');
        } else {
          switchObj.attr('disabled', 'disabled');
        }
        icoObj.removeAttr('style');
        icoObj.attr('style', view.makeNodeIcoStyle(setting, node));
        icoObj.attr('class', view.makeNodeIcoClass(setting, node));
      },
      setNodeName: function (setting, node) {
        var title = data.getNodeTitle(setting, node),
          nObj = $$(node, consts.id.SPAN, setting);
        nObj.empty();
        if (setting.view.nameIsHTML) {
          nObj.html(data.getNodeName(setting, node));
        } else {
          nObj.text(data.getNodeName(setting, node));
        }
        if (tools.apply(setting.view.showTitle, [setting.treeId, node], setting.view.showTitle)) {
          var aObj = $$(node, consts.id.A, setting);
          aObj.attr('title', !title ? '' : title);
        }
      },
      setNodeTarget: function (setting, node) {
        var aObj = $$(node, consts.id.A, setting);
        aObj.attr('target', view.makeNodeTarget(node));
      },
      setNodeUrl: function (setting, node) {
        var aObj = $$(node, consts.id.A, setting),
          url = view.makeNodeUrl(setting, node);
        if (url == null || url.length == 0) {
          aObj.removeAttr('href');
        } else {
          aObj.attr('href', url);
        }
      },
      switchNode: function (setting, node) {
        if (node.open || !tools.canAsync(setting, node)) {
          view.expandCollapseNode(setting, node, !node.open);
        } else if (setting.async.enable) {
          if (!view.asyncNode(setting, node)) {
            view.expandCollapseNode(setting, node, !node.open);
          }
        } else if (node) {
          view.expandCollapseNode(setting, node, !node.open);
        }
      }
    };
  // zTree defind
  $.fn.zTree = {
    consts: _consts,
    _z: {
      tools: tools,
      view: view,
      event: event,
      data: data
    },
    getZTreeObj: function (treeId) {
      var o = data.getZTreeTools(treeId);
      return o || null;
    },
    destroy: function (treeId) {
      if (!!treeId && treeId.length > 0) {
        view.destroy(data.getSetting(treeId));
      } else {
        for (var s in settings) {
          view.destroy(settings[s]);
        }
      }
    },
    init: function (obj, zSetting, zNodes) {
      var setting = tools.clone(_setting);
      $.extend(true, setting, zSetting);
      setting.treeId = obj.attr('id');
      setting.treeObj = obj;
      setting.treeObj.empty();
      settings[setting.treeId] = setting;
      // For some older browser,(e.g., ie6)
      if (typeof document.body.style.maxHeight === 'undefined') {
        setting.view.expandSpeed = '';
      }
      data.initRoot(setting);
      var root = data.getRoot(setting),
        childKey = setting.data.key.children;
      zNodes = zNodes ? tools.clone(tools.isArray(zNodes) ? zNodes : [zNodes]) : [];
      if (setting.data.simpleData.enable) {
        root[childKey] = data.transformTozTreeFormat(setting, zNodes);
      } else {
        root[childKey] = zNodes;
      }

      data.initCache(setting);
      event.unbindTree(setting);
      event.bindTree(setting);
      event.unbindEvent(setting);
      event.bindEvent(setting);

      var zTreeTools = {
        setting: setting,
        addNodes: function (parentNode, index, newNodes, isSilent) {
          if (!parentNode) parentNode = null;
          if (parentNode && !parentNode.isParent && setting.data.keep.leaf) return null;

          var i = parseInt(index, 10);
          if (isNaN(i)) {
            isSilent = !!newNodes;
            newNodes = index;
            index = -1;
          } else {
            index = i;
          }
          if (!newNodes) return null;

          var xNewNodes = tools.clone(tools.isArray(newNodes) ? newNodes : [newNodes]);

          function addCallback() {
            view.addNodes(setting, parentNode, index, xNewNodes, (isSilent == true));
          }

          if (tools.canAsync(setting, parentNode)) {
            view.asyncNode(setting, parentNode, isSilent, addCallback);
          } else {
            addCallback();
          }
          return xNewNodes;
        },
        cancelSelectedNode: function (node) {
          view.cancelPreSelectedNode(setting, node);
        },
        destroy: function () {
          view.destroy(setting);
        },
        expandAll: function (expandFlag) {
          expandFlag = !!expandFlag;
          view.expandCollapseSonNode(setting, null, expandFlag, true);
          return expandFlag;
        },
        expandNode: function (node, expandFlag, sonSign, focus, callbackFlag) {
          if (!node || !node.isParent) return null;
          if (expandFlag !== true && expandFlag !== false) {
            expandFlag = !node.open;
          }
          callbackFlag = !!callbackFlag;

          if (callbackFlag && expandFlag && (tools.apply(setting.callback.beforeExpand, [setting.treeId, node], true) == false)) {
            return null;
          } else if (callbackFlag && !expandFlag && (tools.apply(setting.callback.beforeCollapse, [setting.treeId, node], true) == false)) {
            return null;
          }
          if (expandFlag && node.parentTId) {
            view.expandCollapseParentNode(setting, node.getParentNode(), expandFlag, false);
          }
          if (expandFlag === node.open && !sonSign) {
            return null;
          }

          data.getRoot(setting).expandTriggerFlag = callbackFlag;
          if (!tools.canAsync(setting, node) && sonSign) {
            view.expandCollapseSonNode(setting, node, expandFlag, true, showNodeFocus);
          } else {
            node.open = !expandFlag;
            view.switchNode(this.setting, node);
            showNodeFocus();
          }
          return expandFlag;

          function showNodeFocus() {
            var a = $$(node, setting).get(0);
            if (a && focus !== false) {
              view.scrollIntoView(setting, a);
            }
          }
        },
        getNodes: function () {
          return data.getNodes(setting);
        },
        getNodeByParam: function (key, value, parentNode) {
          if (!key) return null;
          return data.getNodeByParam(setting, parentNode ? parentNode[setting.data.key.children] : data.getNodes(setting), key, value);
        },
        getNodeByTId: function (tId) {
          return data.getNodeCache(setting, tId);
        },
        getNodesByParam: function (key, value, parentNode) {
          if (!key) return null;
          return data.getNodesByParam(setting, parentNode ? parentNode[setting.data.key.children] : data.getNodes(setting), key, value);
        },
        getNodesByParamFuzzy: function (key, value, parentNode) {
          if (!key) return null;
          return data.getNodesByParamFuzzy(setting, parentNode ? parentNode[setting.data.key.children] : data.getNodes(setting), key, value);
        },
        getNodesByFilter: function (filter, isSingle, parentNode, invokeParam) {
          isSingle = !!isSingle;
          if (!filter || (typeof filter !== 'function')) return (isSingle ? null : []);
          return data.getNodesByFilter(setting, parentNode ? parentNode[setting.data.key.children] : data.getNodes(setting), filter, isSingle, invokeParam);
        },
        getNodeIndex: function (node) {
          if (!node) return null;
          var childKey = setting.data.key.children,
            parentNode = (node.parentTId) ? node.getParentNode() : data.getRoot(setting);
          for (var i = 0, l = parentNode[childKey].length; i < l; i++) {
            if (parentNode[childKey][i] == node) return i;
          }
          return -1;
        },
        getSelectedNodes: function () {
          var r = [],
            list = data.getRoot(setting).curSelectedList;
          for (var i = 0, l = list.length; i < l; i++) {
            r.push(list[i]);
          }
          return r;
        },
        isSelectedNode: function (node) {
          return data.isSelectedNode(setting, node);
        },
        reAsyncChildNodesPromise: function (parentNode, reloadType, isSilent) {
          var promise = new Promise(function (resolve, reject) {
            try {
              zTreeTools.reAsyncChildNodes(parentNode, reloadType, isSilent, function () {
                resolve(parentNode);
              });
            } catch (e) {
              reject(e);
            }
          });
          return promise;
        },
        reAsyncChildNodes: function (parentNode, reloadType, isSilent, callback) {
          if (!this.setting.async.enable) return;
          var isRoot = !parentNode;
          if (isRoot) {
            parentNode = data.getRoot(setting);
          }
          if (reloadType == 'refresh') {
            var childKey = this.setting.data.key.children;
            for (var i = 0, l = parentNode[childKey] ? parentNode[childKey].length : 0; i < l; i++) {
              data.removeNodeCache(setting, parentNode[childKey][i]);
            }
            data.removeSelectedNode(setting);
            parentNode[childKey] = [];
            if (isRoot) {
              this.setting.treeObj.empty();
            } else {
              var ulObj = $$(parentNode, consts.id.UL, setting);
              ulObj.empty();
            }
          }
          view.asyncNode(this.setting, isRoot ? null : parentNode, !!isSilent, callback);
        },
        refresh: function () {
          this.setting.treeObj.empty();
          var root = data.getRoot(setting),
            nodes = root[setting.data.key.children];
          data.initRoot(setting);
          root[setting.data.key.children] = nodes;
          data.initCache(setting);
          view.createNodes(setting, 0, root[setting.data.key.children], null, -1);
        },
        removeChildNodes: function (node) {
          if (!node) return null;
          var childKey = setting.data.key.children,
            nodes = node[childKey];
          view.removeChildNodes(setting, node);
          return nodes || null;
        },
        removeNode: function (node, callbackFlag) {
          if (!node) return;
          callbackFlag = !!callbackFlag;
          if (callbackFlag && tools.apply(setting.callback.beforeRemove, [setting.treeId, node], true) == false) return;
          view.removeNode(setting, node);
          if (callbackFlag) {
            this.setting.treeObj.trigger(consts.event.REMOVE, [setting.treeId, node]);
          }
        },
        selectNode: function (node, addFlag, isSilent) {
          if (!node) return;
          if (tools.uCanDo(setting)) {
            addFlag = setting.view.selectedMulti && addFlag;
            if (node.parentTId) {
              view.expandCollapseParentNode(setting, node.getParentNode(), true, false, showNodeFocus);
            } else if (!isSilent) {
              try {
                $$(node, setting).focus().blur();
              } catch (e) {}
            }
            view.selectNode(setting, node, addFlag);
          }

          function showNodeFocus() {
            if (isSilent) {
              return;
            }
            var a = $$(node, setting).get(0);
            view.scrollIntoView(setting, a);
          }
        },
        transformTozTreeNodes: function (simpleNodes) {
          return data.transformTozTreeFormat(setting, simpleNodes);
        },
        transformToArray: function (nodes) {
          return data.transformToArrayFormat(setting, nodes);
        },
        updateNode: function (node, checkTypeFlag) {
          if (!node) return;
          var nObj = $$(node, setting);
          if (nObj.get(0) && tools.uCanDo(setting)) {
            view.setNodeName(setting, node);
            view.setNodeTarget(setting, node);
            view.setNodeUrl(setting, node);
            view.setNodeLineIcos(setting, node);
            view.setNodeFontCss(setting, node);
          }
        }
      };
      root.treeTools = zTreeTools;
      data.setZTreeTools(setting, zTreeTools);

      if (root[childKey] && root[childKey].length > 0) {
        view.createNodes(setting, 0, root[childKey], null, -1);
      } else if (setting.async.enable && setting.async.url && setting.async.url !== '') {
        view.asyncNode(setting);
      }
      return zTreeTools;
    }
  };

  var zt = $.fn.zTree,
    $$ = tools.$,
    consts = zt.consts;
})(jQuery);
/*
 * JQuery zTree excheck v3.5.30
 * http://treejs.cn/
 *
 * Copyright (c) 2010 Hunter.z
 *
 * Licensed same as jquery - MIT License
 * http://www.opensource.org/licenses/mit-license.php
 *
 * email: hunter.z@263.net
 * Date: 2017-11-11
 */
(function ($) {
  // default consts of excheck
  var _consts = {
      event: {
        CHECK: 'ztree_check'
      },
      id: {
        CHECK: '_check'
      },
      checkbox: {
        STYLE: 'checkbox',
        DEFAULT: 'chk',
        DISABLED: 'disable',
        FALSE: 'false',
        TRUE: 'true',
        FULL: 'full',
        PART: 'part',
        FOCUS: 'focus'
      },
      radio: {
        STYLE: 'radio',
        TYPE_ALL: 'all',
        TYPE_LEVEL: 'level'
      }
    },
    // default setting of excheck
    _setting = {
      check: {
        enable: false,
        autoCheckTrigger: false,
        chkStyle: _consts.checkbox.STYLE,
        nocheckInherit: false,
        chkDisabledInherit: false,
        radioType: _consts.radio.TYPE_LEVEL,
        chkboxType: {
          'Y': 'ps',
          'N': 'ps'
        }
      },
      data: {
        key: {
          checked: 'valid'
        }
      },
      callback: {
        beforeCheck: null,
        onCheck: null
      }
    },
    // default root of excheck
    _initRoot = function (setting) {
      var r = data.getRoot(setting);
      r.radioCheckedList = [];
    },
    // default cache of excheck
    _initCache = function (treeId) {},
    // default bind event of excheck
    _bindEvent = function (setting) {
      var o = setting.treeObj,
        c = consts.event;
      o.bind(c.CHECK, function (event, srcEvent, treeId, node) {
        event.srcEvent = srcEvent;
        tools.apply(setting.callback.onCheck, [event, treeId, node]);
      });
    },
    _unbindEvent = function (setting) {
      var o = setting.treeObj,
        c = consts.event;
      o.unbind(c.CHECK);
    },
    // default event proxy of excheck
    _eventProxy = function (e) {
      var target = e.target,
        setting = data.getSetting(e.data.treeId),
        tId = '',
        node = null,
        nodeEventType = '',
        treeEventType = '',
        nodeEventCallback = null,
        treeEventCallback = null;

      if (tools.eqs(e.type, 'mouseover')) {
        if (setting.check.enable && tools.eqs(target.tagName, 'span') && target.getAttribute('treeNode' + consts.id.CHECK) !== null) {
          tId = tools.getNodeMainDom(target).id;
          nodeEventType = 'mouseoverCheck';
        }
      } else if (tools.eqs(e.type, 'mouseout')) {
        if (setting.check.enable && tools.eqs(target.tagName, 'span') && target.getAttribute('treeNode' + consts.id.CHECK) !== null) {
          tId = tools.getNodeMainDom(target).id;
          nodeEventType = 'mouseoutCheck';
        }
      } else if (tools.eqs(e.type, 'click')) {
        if (setting.check.enable && tools.eqs(target.tagName, 'span') && target.getAttribute('treeNode' + consts.id.CHECK) !== null) {
          tId = tools.getNodeMainDom(target).id;
          nodeEventType = 'checkNode';
        }
      }
      if (tId.length > 0) {
        node = data.getNodeCache(setting, tId);
        switch (nodeEventType) {
          case 'checkNode':
            nodeEventCallback = _handler.onCheckNode;
            break;
          case 'mouseoverCheck':
            nodeEventCallback = _handler.onMouseoverCheck;
            break;
          case 'mouseoutCheck':
            nodeEventCallback = _handler.onMouseoutCheck;
            break;
        }
      }
      var proxyResult = {
        stop: nodeEventType === 'checkNode',
        node: node,
        nodeEventType: nodeEventType,
        nodeEventCallback: nodeEventCallback,
        treeEventType: treeEventType,
        treeEventCallback: treeEventCallback
      };
      return proxyResult;
    },
    // default init node of excheck
    _initNode = function (setting, level, n, parentNode, isFirstNode, isLastNode, openFlag) {
      if (!n) return;
      var checkedKey = setting.data.key.checked;
      if (typeof n[checkedKey] === 'string') n[checkedKey] = tools.eqs(n[checkedKey], 'true');
      n[checkedKey] = !!n[checkedKey];
      n.checkedOld = n[checkedKey];
      if (typeof n.nocheck === 'string') n.nocheck = tools.eqs(n.nocheck, 'true');
      n.nocheck = !!n.nocheck || (setting.check.nocheckInherit && parentNode && !!parentNode.nocheck);
      if (typeof n.chkDisabled === 'string') n.chkDisabled = tools.eqs(n.chkDisabled, 'true');
      n.chkDisabled = !!n.chkDisabled || (setting.check.chkDisabledInherit && parentNode && !!parentNode.chkDisabled);
      if (typeof n.halfCheck === 'string') n.halfCheck = tools.eqs(n.halfCheck, 'true');
      n.halfCheck = !!n.halfCheck;
      n.check_Child_State = -1;
      n.check_Focus = false;
      n.getCheckStatus = function () {
        return data.getCheckStatus(setting, n);
      };

      if (setting.check.chkStyle == consts.radio.STYLE && setting.check.radioType == consts.radio.TYPE_ALL && n[checkedKey]) {
        var r = data.getRoot(setting);
        r.radioCheckedList.push(n);
      }
    },
    // add dom for check
    _beforeA = function (setting, node, html) {
      var checkedKey = setting.data.key.checked;
      if (setting.check.enable) {
        data.makeChkFlag(setting, node);
        html.push("<span ID='", node.tId, consts.id.CHECK, "' class='", view.makeChkClass(setting, node), "' treeNode", consts.id.CHECK, (node.nocheck === true ? " style='display:none;'" : ''), '><span class="b-checkbox-inner"></span><input type="checkbox" class="b-checkbox-original" value></span>');
      }
    },
    // update zTreeObj, add method of check
    _zTreeTools = function (setting, zTreeTools) {
      zTreeTools.checkNode = function (node, checked, checkTypeFlag, callbackFlag) {
        var checkedKey = this.setting.data.key.checked;
        if (node.chkDisabled === true) return;
        if (checked !== true && checked !== false) {
          checked = !node[checkedKey];
        }
        callbackFlag = !!callbackFlag;

        if (node[checkedKey] === checked && !checkTypeFlag) {
          return;
        } else if (callbackFlag && tools.apply(this.setting.callback.beforeCheck, [this.setting.treeId, node], true) == false) {
          return;
        }
        if (tools.uCanDo(this.setting) && this.setting.check.enable && node.nocheck !== true) {
          node[checkedKey] = checked;
          var checkObj = $$(node, consts.id.CHECK, this.setting);
          if (checkTypeFlag || this.setting.check.chkStyle === consts.radio.STYLE) view.checkNodeRelation(this.setting, node);
          view.setChkClass(this.setting, checkObj, node);
          view.repairParentChkClassWithSelf(this.setting, node);
          if (callbackFlag) {
            this.setting.treeObj.trigger(consts.event.CHECK, [null, this.setting.treeId, node]);
          }
        }
      };

      zTreeTools.checkAllNodes = function (checked) {
        view.repairAllChk(this.setting, !!checked);
      };

      zTreeTools.getCheckedNodes = function (checked) {
        var childKey = this.setting.data.key.children;
        checked = (checked !== false);
        return data.getTreeCheckedNodes(this.setting, data.getRoot(this.setting)[childKey], checked);
      };

      zTreeTools.getChangeCheckedNodes = function () {
        var childKey = this.setting.data.key.children;
        return data.getTreeChangeCheckedNodes(this.setting, data.getRoot(this.setting)[childKey]);
      };

      zTreeTools.setChkDisabled = function (node, disabled, inheritParent, inheritChildren) {
        disabled = !!disabled;
        inheritParent = !!inheritParent;
        inheritChildren = !!inheritChildren;
        view.repairSonChkDisabled(this.setting, node, disabled, inheritChildren);
        view.repairParentChkDisabled(this.setting, node.getParentNode(), disabled, inheritParent);
      };

      var _updateNode = zTreeTools.updateNode;
      zTreeTools.updateNode = function (node, checkTypeFlag) {
        if (_updateNode) _updateNode.apply(zTreeTools, arguments);
        if (!node || !this.setting.check.enable) return;
        var nObj = $$(node, this.setting);
        if (nObj.get(0) && tools.uCanDo(this.setting)) {
          var checkObj = $$(node, consts.id.CHECK, this.setting);
          if (checkTypeFlag == true || this.setting.check.chkStyle === consts.radio.STYLE) view.checkNodeRelation(this.setting, node);
          view.setChkClass(this.setting, checkObj, node);
          view.repairParentChkClassWithSelf(this.setting, node);
        }
      };
    },
    // method of operate data
    _data = {
      getRadioCheckedList: function (setting) {
        var checkedList = data.getRoot(setting).radioCheckedList;
        for (var i = 0, j = checkedList.length; i < j; i++) {
          if (!data.getNodeCache(setting, checkedList[i].tId)) {
            checkedList.splice(i, 1);
            i--;
            j--;
          }
        }
        return checkedList;
      },
      getCheckStatus: function (setting, node) {
        if (!setting.check.enable || node.nocheck || node.chkDisabled) return null;
        var checkedKey = setting.data.key.checked,
          r = {
            checked: node[checkedKey],
            half: node.halfCheck ? node.halfCheck : (setting.check.chkStyle == consts.radio.STYLE ? (node.check_Child_State === 2) : (node[checkedKey] ? (node.check_Child_State > -1 && node.check_Child_State < 2) : (node.check_Child_State > 0)))
          };
        return r;
      },
      getTreeCheckedNodes: function (setting, nodes, checked, results) {
        if (!nodes) return [];
        var childKey = setting.data.key.children,
          checkedKey = setting.data.key.checked,
          onlyOne = (checked && setting.check.chkStyle == consts.radio.STYLE && setting.check.radioType == consts.radio.TYPE_ALL);
        results = !results ? [] : results;
        for (var i = 0, l = nodes.length; i < l; i++) {
          if (nodes[i].nocheck !== true && nodes[i].chkDisabled !== true && nodes[i][checkedKey] == checked) {
            results.push(nodes[i]);
            if (onlyOne) {
              break;
            }
          }
          data.getTreeCheckedNodes(setting, nodes[i][childKey], checked, results);
          if (onlyOne && results.length > 0) {
            break;
          }
        }
        return results;
      },
      getTreeChangeCheckedNodes: function (setting, nodes, results) {
        if (!nodes) return [];
        var childKey = setting.data.key.children,
          checkedKey = setting.data.key.checked;
        results = !results ? [] : results;
        for (var i = 0, l = nodes.length; i < l; i++) {
          if (nodes[i].nocheck !== true && nodes[i].chkDisabled !== true && nodes[i][checkedKey] != nodes[i].checkedOld) {
            results.push(nodes[i]);
          }
          data.getTreeChangeCheckedNodes(setting, nodes[i][childKey], results);
        }
        return results;
      },
      makeChkFlag: function (setting, node) {
        if (!node) return;
        var childKey = setting.data.key.children,
          checkedKey = setting.data.key.checked,
          chkFlag = -1;
        if (node[childKey]) {
          for (var i = 0, l = node[childKey].length; i < l; i++) {
            var cNode = node[childKey][i];
            var tmp = -1;
            if (setting.check.chkStyle == consts.radio.STYLE) {
              if (cNode.nocheck === true || cNode.chkDisabled === true) {
                tmp = cNode.check_Child_State;
              } else if (cNode.halfCheck === true) {
                tmp = 2;
              } else if (cNode[checkedKey]) {
                tmp = 2;
              } else {
                tmp = cNode.check_Child_State > 0 ? 2 : 0;
              }
              if (tmp == 2) {
                chkFlag = 2;
                break;
              } else if (tmp == 0) {
                chkFlag = 0;
              }
            } else if (setting.check.chkStyle == consts.checkbox.STYLE) {
              if (cNode.nocheck === true || cNode.chkDisabled === true) {
                tmp = cNode.check_Child_State;
              } else if (cNode.halfCheck === true) {
                tmp = 1;
              } else if (cNode[checkedKey]) {
                tmp = (cNode.check_Child_State === -1 || cNode.check_Child_State === 2) ? 2 : 1;
              } else {
                tmp = (cNode.check_Child_State > 0) ? 1 : 0;
              }
              if (tmp === 1) {
                chkFlag = 1;
                break;
              } else if (tmp === 2 && chkFlag > -1 && i > 0 && tmp !== chkFlag) {
                chkFlag = 1;
                break;
              } else if (chkFlag === 2 && tmp > -1 && tmp < 2) {
                chkFlag = 1;
                break;
              } else if (tmp > -1) {
                chkFlag = tmp;
              }
            }
          }
        }
        node.check_Child_State = chkFlag;
      }
    },
    // method of event proxy
    _event = {

    },
    // method of event handler
    _handler = {
      onCheckNode: function (event, node) {
        if (node.chkDisabled === true) return false;
        var setting = data.getSetting(event.data.treeId),
          checkedKey = setting.data.key.checked;
        if (tools.apply(setting.callback.beforeCheck, [setting.treeId, node], true) == false) return true;
        node[checkedKey] = !node[checkedKey];
        view.checkNodeRelation(setting, node);
        var checkObj = $$(node, consts.id.CHECK, setting);
        view.setChkClass(setting, checkObj, node);
        view.repairParentChkClassWithSelf(setting, node);
        setting.treeObj.trigger(consts.event.CHECK, [event, setting.treeId, node]);
        return true;
      },
      onMouseoverCheck: function (event, node) {
        if (node.chkDisabled === true) return false;
        var setting = data.getSetting(event.data.treeId),
          checkObj = $$(node, consts.id.CHECK, setting);
        node.check_Focus = true;
        view.setChkClass(setting, checkObj, node);
        return true;
      },
      onMouseoutCheck: function (event, node) {
        if (node.chkDisabled === true) return false;
        var setting = data.getSetting(event.data.treeId),
          checkObj = $$(node, consts.id.CHECK, setting);
        node.check_Focus = false;
        view.setChkClass(setting, checkObj, node);
        return true;
      }
    },
    // method of tools for zTree
    _tools = {

    },
    // method of operate ztree dom
    _view = {
      checkNodeRelation: function (setting, node) {
        var pNode, i, l,
          childKey = setting.data.key.children,
          checkedKey = setting.data.key.checked,
          r = consts.radio;
        if (setting.check.chkStyle == r.STYLE) {
          var checkedList = data.getRadioCheckedList(setting);
          if (node[checkedKey]) {
            if (setting.check.radioType == r.TYPE_ALL) {
              for (i = checkedList.length - 1; i >= 0; i--) {
                pNode = checkedList[i];
                if (pNode[checkedKey] && pNode != node) {
                  pNode[checkedKey] = false;
                  checkedList.splice(i, 1);

                  view.setChkClass(setting, $$(pNode, consts.id.CHECK, setting), pNode);
                  if (pNode.parentTId != node.parentTId) {
                    view.repairParentChkClassWithSelf(setting, pNode);
                  }
                }
              }
              checkedList.push(node);
            } else {
              var parentNode = (node.parentTId) ? node.getParentNode() : data.getRoot(setting);
              for (i = 0, l = parentNode[childKey].length; i < l; i++) {
                pNode = parentNode[childKey][i];
                if (pNode[checkedKey] && pNode != node) {
                  pNode[checkedKey] = false;
                  view.setChkClass(setting, $$(pNode, consts.id.CHECK, setting), pNode);
                }
              }
            }
          } else if (setting.check.radioType == r.TYPE_ALL) {
            for (i = 0, l = checkedList.length; i < l; i++) {
              if (node == checkedList[i]) {
                checkedList.splice(i, 1);
                break;
              }
            }
          }
        } else {
          if (node[checkedKey] && (!node[childKey] || node[childKey].length == 0 || setting.check.chkboxType.Y.indexOf('s') > -1)) {
            view.setSonNodeCheckBox(setting, node, true);
          }
          if (!node[checkedKey] && (!node[childKey] || node[childKey].length == 0 || setting.check.chkboxType.N.indexOf('s') > -1)) {
            view.setSonNodeCheckBox(setting, node, false);
          }
          if (node[checkedKey] && setting.check.chkboxType.Y.indexOf('p') > -1) {
            view.setParentNodeCheckBox(setting, node, true);
          }
          if (!node[checkedKey] && setting.check.chkboxType.N.indexOf('p') > -1) {
            view.setParentNodeCheckBox(setting, node, false);
          }
        }
      },
      makeChkClass: function (setting, node) {
        var checkedKey = setting.data.key.checked,
          c = consts.checkbox,
          r = consts.radio,
          fullStyle = '';
        if (node.chkDisabled === true) {
          fullStyle = c.DISABLED;
        } else if (node.halfCheck) {
          fullStyle = c.PART;
        } else if (setting.check.chkStyle == r.STYLE) {
          fullStyle = (node.check_Child_State < 1) ? c.FULL : c.PART;
        } else {
          fullStyle = node[checkedKey] ? ((node.check_Child_State === 2 || node.check_Child_State === -1) ? c.FULL : c.PART) : ((node.check_Child_State < 1) ? c.FULL : c.PART);
        }
        var chkName = setting.check.chkStyle + '_' + (node[checkedKey] ? c.TRUE : c.FALSE) + '_' + fullStyle;
        chkName = (node.check_Focus && node.chkDisabled !== true) ? chkName + '_' + c.FOCUS : chkName;
        return consts.className.BUTTON + ' ' + c.DEFAULT + ' ' + chkName;
      },
      repairAllChk: function (setting, checked) {
        if (setting.check.enable && setting.check.chkStyle === consts.checkbox.STYLE) {
          var checkedKey = setting.data.key.checked,
            childKey = setting.data.key.children,
            root = data.getRoot(setting);
          for (var i = 0, l = root[childKey].length; i < l; i++) {
            var node = root[childKey][i];
            if (node.nocheck !== true && node.chkDisabled !== true) {
              node[checkedKey] = checked;
            }
            view.setSonNodeCheckBox(setting, node, checked);
          }
        }
      },
      repairChkClass: function (setting, node) {
        if (!node) return;
        data.makeChkFlag(setting, node);
        if (node.nocheck !== true) {
          var checkObj = $$(node, consts.id.CHECK, setting);
          view.setChkClass(setting, checkObj, node);
        }
      },
      repairParentChkClass: function (setting, node) {
        if (!node || !node.parentTId) return;
        var pNode = node.getParentNode();
        view.repairChkClass(setting, pNode);
        view.repairParentChkClass(setting, pNode);
      },
      repairParentChkClassWithSelf: function (setting, node) {
        if (!node) return;
        var childKey = setting.data.key.children;
        if (node[childKey] && node[childKey].length > 0) {
          view.repairParentChkClass(setting, node[childKey][0]);
        } else {
          view.repairParentChkClass(setting, node);
        }
      },
      repairSonChkDisabled: function (setting, node, chkDisabled, inherit) {
        if (!node) return;
        var childKey = setting.data.key.children;
        if (node.chkDisabled != chkDisabled) {
          node.chkDisabled = chkDisabled;
        }
        view.repairChkClass(setting, node);
        if (node[childKey] && inherit) {
          for (var i = 0, l = node[childKey].length; i < l; i++) {
            var sNode = node[childKey][i];
            view.repairSonChkDisabled(setting, sNode, chkDisabled, inherit);
          }
        }
      },
      repairParentChkDisabled: function (setting, node, chkDisabled, inherit) {
        if (!node) return;
        if (node.chkDisabled != chkDisabled && inherit) {
          node.chkDisabled = chkDisabled;
        }
        view.repairChkClass(setting, node);
        view.repairParentChkDisabled(setting, node.getParentNode(), chkDisabled, inherit);
      },
      setChkClass: function (setting, obj, node) {
        if (!obj) return;
        if (node.nocheck === true) {
          obj.hide();
        } else {
          obj.show();
        }
        obj.attr('class', view.makeChkClass(setting, node));
      },
      setParentNodeCheckBox: function (setting, node, value, srcNode) {
        var childKey = setting.data.key.children,
          checkedKey = setting.data.key.checked,
          checkObj = $$(node, consts.id.CHECK, setting);
        if (!srcNode) srcNode = node;
        data.makeChkFlag(setting, node);
        if (node.nocheck !== true && node.chkDisabled !== true) {
          node[checkedKey] = value;
          view.setChkClass(setting, checkObj, node);
          if (setting.check.autoCheckTrigger && node != srcNode) {
            setting.treeObj.trigger(consts.event.CHECK, [null, setting.treeId, node]);
          }
        }
        if (node.parentTId) {
          var pSign = true;
          if (!value) {
            var pNodes = node.getParentNode()[childKey];
            for (var i = 0, l = pNodes.length; i < l; i++) {
              if ((pNodes[i].nocheck !== true && pNodes[i].chkDisabled !== true && pNodes[i][checkedKey]) ||
                ((pNodes[i].nocheck === true || pNodes[i].chkDisabled === true) && pNodes[i].check_Child_State > 0)) {
                pSign = false;
                break;
              }
            }
          }
          if (pSign) {
            view.setParentNodeCheckBox(setting, node.getParentNode(), value, srcNode);
          }
        }
      },
      setSonNodeCheckBox: function (setting, node, value, srcNode) {
        if (!node) return;
        var childKey = setting.data.key.children,
          checkedKey = setting.data.key.checked,
          checkObj = $$(node, consts.id.CHECK, setting);
        if (!srcNode) srcNode = node;

        var hasDisable = false;
        if (node[childKey]) {
          for (var i = 0, l = node[childKey].length; i < l; i++) {
            var sNode = node[childKey][i];
            view.setSonNodeCheckBox(setting, sNode, value, srcNode);
            if (sNode.chkDisabled === true) hasDisable = true;
          }
        }

        if (node != data.getRoot(setting) && node.chkDisabled !== true) {
          if (hasDisable && node.nocheck !== true) {
            data.makeChkFlag(setting, node);
          }
          if (node.nocheck !== true && node.chkDisabled !== true) {
            node[checkedKey] = value;
            if (!hasDisable) node.check_Child_State = (node[childKey] && node[childKey].length > 0) ? (value ? 2 : 0) : -1;
          } else {
            node.check_Child_State = -1;
          }
          view.setChkClass(setting, checkObj, node);
          if (setting.check.autoCheckTrigger && node != srcNode && node.nocheck !== true && node.chkDisabled !== true) {
            setting.treeObj.trigger(consts.event.CHECK, [null, setting.treeId, node]);
          }
        }
      }
    },

    _z = {
      tools: _tools,
      view: _view,
      event: _event,
      data: _data
    };
  $.extend(true, $.fn.zTree.consts, _consts);
  $.extend(true, $.fn.zTree._z, _z);

  var zt = $.fn.zTree,
    tools = zt._z.tools,
    consts = zt.consts,
    view = zt._z.view,
    data = zt._z.data,
    event = zt._z.event,
    $$ = tools.$;

  data.exSetting(_setting);
  data.addInitBind(_bindEvent);
  data.addInitUnBind(_unbindEvent);
  data.addInitCache(_initCache);
  data.addInitNode(_initNode);
  data.addInitProxy(_eventProxy, true);
  data.addInitRoot(_initRoot);
  data.addBeforeA(_beforeA);
  data.addZTreeTools(_zTreeTools);

  var _createNodes = view.createNodes;
  view.createNodes = function (setting, level, nodes, parentNode, index) {
    if (_createNodes) _createNodes.apply(view, arguments);
    if (!nodes) return;
    view.repairParentChkClassWithSelf(setting, parentNode);
  };
  var _removeNode = view.removeNode;
  view.removeNode = function (setting, node) {
    var parentNode = node.getParentNode();
    if (_removeNode) _removeNode.apply(view, arguments);
    if (!node || !parentNode) return;
    view.repairChkClass(setting, parentNode);
    view.repairParentChkClass(setting, parentNode);
  };

  var _appendNodes = view.appendNodes;
  view.appendNodes = function (setting, level, nodes, parentNode, index, initFlag, openFlag) {
    var html = '';
    if (_appendNodes) {
      html = _appendNodes.apply(view, arguments);
    }
    if (parentNode) {
      data.makeChkFlag(setting, parentNode);
    }
    return html;
  };
})(jQuery);
/*
 * JQuery zTree exedit v3.5.30
 * http://treejs.cn/
 *
 * Copyright (c) 2010 Hunter.z
 *
 * Licensed same as jquery - MIT License
 * http://www.opensource.org/licenses/mit-license.php
 *
 * email: hunter.z@263.net
 * Date: 2017-11-11
 */
(function ($) {
  // default consts of exedit
  var _consts = {
      event: {
        DRAG: 'ztree_drag',
        DROP: 'ztree_drop',
        RENAME: 'ztree_rename',
        DRAGMOVE: 'ztree_dragmove'
      },
      id: {
        EDIT: '_edit',
        INPUT: '_input',
        REMOVE: '_remove'
      },
      move: {
        TYPE_INNER: 'inner',
        TYPE_PREV: 'prev',
        TYPE_NEXT: 'next'
      },
      node: {
        CURSELECTED_EDIT: 'curSelectedNode_Edit',
        TMPTARGET_TREE: 'tmpTargetzTree',
        TMPTARGET_NODE: 'tmpTargetNode'
      }
    },
    // default setting of exedit
    _setting = {
      edit: {
        enable: false,
        editNameSelectAll: false,
        showRemoveBtn: true,
        showRenameBtn: true,
        removeTitle: 'remove',
        renameTitle: 'rename',
        drag: {
          autoExpandTrigger: false,
          isCopy: true,
          isMove: true,
          prev: true,
          next: true,
          inner: true,
          minMoveSize: 5,
          borderMax: 10,
          borderMin: -5,
          maxShowNodeNum: 5,
          autoOpenTime: 500
        }
      },
      view: {
        addHoverDom: null,
        removeHoverDom: null
      },
      callback: {
        beforeDrag: null,
        beforeDragOpen: null,
        beforeDrop: null,
        beforeEditName: null,
        beforeRename: null,
        onDrag: null,
        onDragMove: null,
        onDrop: null,
        onRename: null
      }
    },
    // default root of exedit
    _initRoot = function (setting) {
      var r = data.getRoot(setting),
        rs = data.getRoots();
      r.curEditNode = null;
      r.curEditInput = null;
      r.curHoverNode = null;
      r.dragFlag = 0;
      r.dragNodeShowBefore = [];
      r.dragMaskList = new Array();
      rs.showHoverDom = true;
    },
    // default cache of exedit
    _initCache = function (treeId) {},
    // default bind event of exedit
    _bindEvent = function (setting) {
      var o = setting.treeObj;
      var c = consts.event;
      o.bind(c.RENAME, function (event, treeId, treeNode, isCancel) {
        tools.apply(setting.callback.onRename, [event, treeId, treeNode, isCancel]);
      });

      o.bind(c.DRAG, function (event, srcEvent, treeId, treeNodes) {
        tools.apply(setting.callback.onDrag, [srcEvent, treeId, treeNodes]);
      });

      o.bind(c.DRAGMOVE, function (event, srcEvent, treeId, treeNodes) {
        tools.apply(setting.callback.onDragMove, [srcEvent, treeId, treeNodes]);
      });

      o.bind(c.DROP, function (event, srcEvent, treeId, treeNodes, targetNode, moveType, isCopy) {
        tools.apply(setting.callback.onDrop, [srcEvent, treeId, treeNodes, targetNode, moveType, isCopy]);
      });
    },
    _unbindEvent = function (setting) {
      var o = setting.treeObj;
      var c = consts.event;
      o.unbind(c.RENAME);
      o.unbind(c.DRAG);
      o.unbind(c.DRAGMOVE);
      o.unbind(c.DROP);
    },
    // default event proxy of exedit
    _eventProxy = function (e) {
      var target = e.target,
        setting = data.getSetting(e.data.treeId),
        relatedTarget = e.relatedTarget,
        tId = '',
        node = null,
        nodeEventType = '',
        treeEventType = '',
        nodeEventCallback = null,
        treeEventCallback = null,
        tmp = null;

      if (tools.eqs(e.type, 'mouseover')) {
        tmp = tools.getMDom(setting, target, [{
          tagName: 'a',
          attrName: 'treeNode' + consts.id.A
        }]);
        if (tmp) {
          tId = tools.getNodeMainDom(tmp).id;
          nodeEventType = 'hoverOverNode';
        }
      } else if (tools.eqs(e.type, 'mouseout')) {
        tmp = tools.getMDom(setting, relatedTarget, [{
          tagName: 'a',
          attrName: 'treeNode' + consts.id.A
        }]);
        if (!tmp) {
          tId = 'remove';
          nodeEventType = 'hoverOutNode';
        }
      } else if (tools.eqs(e.type, 'mousedown')) {
        tmp = tools.getMDom(setting, target, [{
          tagName: 'a',
          attrName: 'treeNode' + consts.id.A
        }]);
        if (tmp) {
          tId = tools.getNodeMainDom(tmp).id;
          nodeEventType = 'mousedownNode';
        }
      }
      if (tId.length > 0) {
        node = data.getNodeCache(setting, tId);
        switch (nodeEventType) {
          case 'mousedownNode':
            nodeEventCallback = _handler.onMousedownNode;
            break;
          case 'hoverOverNode':
            nodeEventCallback = _handler.onHoverOverNode;
            break;
          case 'hoverOutNode':
            nodeEventCallback = _handler.onHoverOutNode;
            break;
        }
      }
      var proxyResult = {
        stop: false,
        node: node,
        nodeEventType: nodeEventType,
        nodeEventCallback: nodeEventCallback,
        treeEventType: treeEventType,
        treeEventCallback: treeEventCallback
      };
      return proxyResult;
    },
    // default init node of exedit
    _initNode = function (setting, level, n, parentNode, isFirstNode, isLastNode, openFlag) {
      if (!n) return;
      n.isHover = false;
      n.editNameFlag = false;
    },
    // update zTreeObj, add method of edit
    _zTreeTools = function (setting, zTreeTools) {
      zTreeTools.cancelEditName = function (newName) {
        var root = data.getRoot(this.setting);
        if (!root.curEditNode) return;
        view.cancelCurEditNode(this.setting, newName || null, true);
      };
      zTreeTools.copyNode = function (targetNode, node, moveType, isSilent) {
        if (!node) return null;
        if (targetNode && !targetNode.isParent && this.setting.data.keep.leaf && moveType === consts.move.TYPE_INNER) return null;
        var _this = this,
          newNode = tools.clone(node);
        if (!targetNode) {
          targetNode = null;
          moveType = consts.move.TYPE_INNER;
        }
        if (moveType == consts.move.TYPE_INNER) {
          function copyCallback() {
            view.addNodes(_this.setting, targetNode, -1, [newNode], isSilent);
          }

          if (tools.canAsync(this.setting, targetNode)) {
            view.asyncNode(this.setting, targetNode, isSilent, copyCallback);
          } else {
            copyCallback();
          }
        } else {
          view.addNodes(this.setting, targetNode.parentNode, -1, [newNode], isSilent);
          view.moveNode(this.setting, targetNode, newNode, moveType, false, isSilent);
        }
        return newNode;
      };
      zTreeTools.editName = function (node) {
        if (!node || !node.tId || node !== data.getNodeCache(this.setting, node.tId)) return;
        if (node.parentTId) view.expandCollapseParentNode(this.setting, node.getParentNode(), true);
        view.editNode(this.setting, node);
      };
      zTreeTools.moveNode = function (targetNode, node, moveType, isSilent) {
        if (!node) return node;
        if (targetNode && !targetNode.isParent && this.setting.data.keep.leaf && moveType === consts.move.TYPE_INNER) {
          return null;
        } else if (targetNode && ((node.parentTId == targetNode.tId && moveType == consts.move.TYPE_INNER) || $$(node, this.setting).find('#' + targetNode.tId).length > 0)) {
          return null;
        } else if (!targetNode) {
          targetNode = null;
        }
        var _this = this;

        function moveCallback() {
          view.moveNode(_this.setting, targetNode, node, moveType, false, isSilent);
        }
        if (tools.canAsync(this.setting, targetNode) && moveType === consts.move.TYPE_INNER) {
          view.asyncNode(this.setting, targetNode, isSilent, moveCallback);
        } else {
          moveCallback();
        }
        return node;
      };
      zTreeTools.setEditable = function (editable) {
        this.setting.edit.enable = editable;
        return this.refresh();
      };
    },
    // method of operate data
    _data = {
      setSonNodeLevel: function (setting, parentNode, node) {
        if (!node) return;
        var childKey = setting.data.key.children;
        node.level = (parentNode) ? parentNode.level + 1 : 0;
        if (!node[childKey]) return;
        for (var i = 0, l = node[childKey].length; i < l; i++) {
          if (node[childKey][i]) data.setSonNodeLevel(setting, node, node[childKey][i]);
        }
      }
    },
    // method of event proxy
    _event = {

    },
    // method of event handler
    _handler = {
      onHoverOverNode: function (event, node) {
        var setting = data.getSetting(event.data.treeId),
          root = data.getRoot(setting);
        if (root.curHoverNode != node) {
          _handler.onHoverOutNode(event);
        }
        root.curHoverNode = node;
        view.addHoverDom(setting, node);
      },
      onHoverOutNode: function (event, node) {
        var setting = data.getSetting(event.data.treeId),
          root = data.getRoot(setting);
        if (root.curHoverNode && !data.isSelectedNode(setting, root.curHoverNode)) {
          view.removeTreeDom(setting, root.curHoverNode);
          root.curHoverNode = null;
        }
      },
      onMousedownNode: function (eventMouseDown, _node) {
        var i, l,
          setting = data.getSetting(eventMouseDown.data.treeId),
          root = data.getRoot(setting),
          roots = data.getRoots();
        // right click can't drag & drop
        if (eventMouseDown.button == 2 || !setting.edit.enable || (!setting.edit.drag.isCopy && !setting.edit.drag.isMove)) return true;

        // input of edit node name can't drag & drop
        var target = eventMouseDown.target,
          _nodes = data.getRoot(setting).curSelectedList,
          nodes = [];
        if (!data.isSelectedNode(setting, _node)) {
          nodes = [_node];
        } else {
          for (i = 0, l = _nodes.length; i < l; i++) {
            if (_nodes[i].editNameFlag && tools.eqs(target.tagName, 'input') && target.getAttribute('treeNode' + consts.id.INPUT) !== null) {
              return true;
            }
            nodes.push(_nodes[i]);
            if (nodes[0].parentTId !== _nodes[i].parentTId) {
              nodes = [_node];
              break;
            }
          }
        }

        view.editNodeBlur = true;
        view.cancelCurEditNode(setting);

        var doc = $(setting.treeObj.get(0).ownerDocument),
          body = $(setting.treeObj.get(0).ownerDocument.body),
          curNode, tmpArrow, tmpTarget,
          isOtherTree = false,
          targetSetting = setting,
          sourceSetting = setting,
          preNode, nextNode,
          preTmpTargetNodeId = null,
          preTmpMoveType = null,
          tmpTargetNodeId = null,
          moveType = consts.move.TYPE_INNER,
          mouseDownX = eventMouseDown.clientX,
          mouseDownY = eventMouseDown.clientY,
          startTime = (new Date()).getTime();

        if (tools.uCanDo(setting)) {
          doc.bind('mousemove', _docMouseMove);
        }

        function _docMouseMove(event) {
          // avoid start drag after click node
          if (root.dragFlag == 0 && Math.abs(mouseDownX - event.clientX) < setting.edit.drag.minMoveSize &&
            Math.abs(mouseDownY - event.clientY) < setting.edit.drag.minMoveSize) {
            return true;
          }
          var i, l, tmpNode, tmpDom, tmpNodes,
            childKey = setting.data.key.children;
          body.css('cursor', 'pointer');

          if (root.dragFlag == 0) {
            if (tools.apply(setting.callback.beforeDrag, [setting.treeId, nodes], true) == false) {
              _docMouseUp(event);
              return true;
            }

            for (i = 0, l = nodes.length; i < l; i++) {
              if (i == 0) {
                root.dragNodeShowBefore = [];
              }
              tmpNode = nodes[i];
              if (tmpNode.isParent && tmpNode.open) {
                view.expandCollapseNode(setting, tmpNode, !tmpNode.open);
                root.dragNodeShowBefore[tmpNode.tId] = true;
              } else {
                root.dragNodeShowBefore[tmpNode.tId] = false;
              }
            }

            root.dragFlag = 1;
            roots.showHoverDom = false;
            tools.showIfameMask(setting, true);

            // sort
            var isOrder = true,
              lastIndex = -1;
            if (nodes.length > 1) {
              var pNodes = nodes[0].parentTId ? nodes[0].getParentNode()[childKey] : data.getNodes(setting);
              tmpNodes = [];
              for (i = 0, l = pNodes.length; i < l; i++) {
                if (root.dragNodeShowBefore[pNodes[i].tId] !== undefined) {
                  if (isOrder && lastIndex > -1 && (lastIndex + 1) !== i) {
                    isOrder = false;
                  }
                  tmpNodes.push(pNodes[i]);
                  lastIndex = i;
                }
                if (nodes.length === tmpNodes.length) {
                  nodes = tmpNodes;
                  break;
                }
              }
            }
            if (isOrder) {
              preNode = nodes[0].getPreNode();
              nextNode = nodes[nodes.length - 1].getNextNode();
            }

            // set node in selected
            curNode = $$("<ul class='zTreeDragUL'></ul>", setting);
            for (i = 0, l = nodes.length; i < l; i++) {
              tmpNode = nodes[i];
              tmpNode.editNameFlag = false;
              view.selectNode(setting, tmpNode, i > 0);
              view.removeTreeDom(setting, tmpNode);

              if (i > setting.edit.drag.maxShowNodeNum - 1) {
                continue;
              }

              tmpDom = $$("<li id='" + tmpNode.tId + "_tmp'></li>", setting);
              tmpDom.append($$(tmpNode, consts.id.A, setting).clone());
              tmpDom.css('padding', '0');
              tmpDom.children('#' + tmpNode.tId + consts.id.A).removeClass(consts.node.CURSELECTED);
              curNode.append(tmpDom);
              if (i == setting.edit.drag.maxShowNodeNum - 1) {
                tmpDom = $$("<li id='" + tmpNode.tId + "_moretmp'><a>  ...  </a></li>", setting);
                curNode.append(tmpDom);
              }
            }
            curNode.attr('id', nodes[0].tId + consts.id.UL + '_tmp');
            curNode.addClass(setting.treeObj.attr('class'));
            curNode.appendTo(body);

            tmpArrow = $$("<span class='tmpzTreeMove_arrow'></span>", setting);
            tmpArrow.attr('id', 'zTreeMove_arrow_tmp');
            tmpArrow.appendTo(body);

            setting.treeObj.trigger(consts.event.DRAG, [event, setting.treeId, nodes]);
          }

          if (root.dragFlag == 1) {
            if (tmpTarget && tmpArrow.attr('id') == event.target.id && tmpTargetNodeId && (event.clientX + doc.scrollLeft() + 2) > ($('#' + tmpTargetNodeId + consts.id.A, tmpTarget).offset().left)) {
              var xT = $('#' + tmpTargetNodeId + consts.id.A, tmpTarget);
              event.target = (xT.length > 0) ? xT.get(0) : event.target;
            } else if (tmpTarget) {
              tmpTarget.removeClass(consts.node.TMPTARGET_TREE);
              if (tmpTargetNodeId) {
                $('#' + tmpTargetNodeId + consts.id.A, tmpTarget).removeClass(consts.node.TMPTARGET_NODE + '_' + consts.move.TYPE_PREV)
                  .removeClass(consts.node.TMPTARGET_NODE + '_' + _consts.move.TYPE_NEXT).removeClass(consts.node.TMPTARGET_NODE + '_' + _consts.move.TYPE_INNER);
              }
            }
            tmpTarget = null;
            tmpTargetNodeId = null;

            // judge drag & drop in multi ztree
            isOtherTree = false;
            targetSetting = setting;
            var settings = data.getSettings();
            for (var s in settings) {
              if (settings[s].treeId && settings[s].edit.enable && settings[s].treeId != setting.treeId &&
                (event.target.id == settings[s].treeId || $(event.target).parents('#' + settings[s].treeId).length > 0)) {
                isOtherTree = true;
                targetSetting = settings[s];
              }
            }

            var docScrollTop = doc.scrollTop(),
              docScrollLeft = doc.scrollLeft(),
              treeOffset = targetSetting.treeObj.offset(),
              scrollHeight = targetSetting.treeObj.get(0).scrollHeight,
              scrollWidth = targetSetting.treeObj.get(0).scrollWidth,
              dTop = (event.clientY + docScrollTop - treeOffset.top),
              dBottom = (targetSetting.treeObj.height() + treeOffset.top - event.clientY - docScrollTop),
              dLeft = (event.clientX + docScrollLeft - treeOffset.left),
              dRight = (targetSetting.treeObj.width() + treeOffset.left - event.clientX - docScrollLeft),
              isTop = (dTop < setting.edit.drag.borderMax && dTop > setting.edit.drag.borderMin),
              isBottom = (dBottom < setting.edit.drag.borderMax && dBottom > setting.edit.drag.borderMin),
              isLeft = (dLeft < setting.edit.drag.borderMax && dLeft > setting.edit.drag.borderMin),
              isRight = (dRight < setting.edit.drag.borderMax && dRight > setting.edit.drag.borderMin),
              isTreeInner = dTop > setting.edit.drag.borderMin && dBottom > setting.edit.drag.borderMin && dLeft > setting.edit.drag.borderMin && dRight > setting.edit.drag.borderMin,
              isTreeTop = (isTop && targetSetting.treeObj.scrollTop() <= 0),
              isTreeBottom = (isBottom && (targetSetting.treeObj.scrollTop() + targetSetting.treeObj.height() + 10) >= scrollHeight),
              isTreeLeft = (isLeft && targetSetting.treeObj.scrollLeft() <= 0),
              isTreeRight = (isRight && (targetSetting.treeObj.scrollLeft() + targetSetting.treeObj.width() + 10) >= scrollWidth);

            if (event.target && tools.isChildOrSelf(event.target, targetSetting.treeId)) {
              // get node <li> dom
              var targetObj = event.target;
              while (targetObj && targetObj.tagName && !tools.eqs(targetObj.tagName, 'li') && targetObj.id != targetSetting.treeId) {
                targetObj = targetObj.parentNode;
              }

              var canMove = true;
              // don't move to self or children of self
              for (i = 0, l = nodes.length; i < l; i++) {
                tmpNode = nodes[i];
                if (targetObj.id === tmpNode.tId) {
                  canMove = false;
                  break;
                } else if ($$(tmpNode, setting).find('#' + targetObj.id).length > 0) {
                  canMove = false;
                  break;
                }
              }
              if (canMove && event.target && tools.isChildOrSelf(event.target, targetObj.id + consts.id.A)) {
                tmpTarget = $(targetObj);
                tmpTargetNodeId = targetObj.id;
              }
            }

            // the mouse must be in zTree
            tmpNode = nodes[0];
            if (isTreeInner && tools.isChildOrSelf(event.target, targetSetting.treeId)) {
              // judge mouse move in root of ztree
              if (!tmpTarget && (event.target.id == targetSetting.treeId || isTreeTop || isTreeBottom || isTreeLeft || isTreeRight) && (isOtherTree || (!isOtherTree && tmpNode.parentTId))) {
                tmpTarget = targetSetting.treeObj;
              }
              // auto scroll top
              if (isTop) {
                targetSetting.treeObj.scrollTop(targetSetting.treeObj.scrollTop() - 10);
              } else if (isBottom) {
                targetSetting.treeObj.scrollTop(targetSetting.treeObj.scrollTop() + 10);
              }
              if (isLeft) {
                targetSetting.treeObj.scrollLeft(targetSetting.treeObj.scrollLeft() - 10);
              } else if (isRight) {
                targetSetting.treeObj.scrollLeft(targetSetting.treeObj.scrollLeft() + 10);
              }
              // auto scroll left
              if (tmpTarget && tmpTarget != targetSetting.treeObj && tmpTarget.offset().left < targetSetting.treeObj.offset().left) {
                targetSetting.treeObj.scrollLeft(targetSetting.treeObj.scrollLeft() + tmpTarget.offset().left - targetSetting.treeObj.offset().left);
              }
            }

            curNode.css({
              'top': (event.clientY + docScrollTop + 3) + 'px',
              'left': (event.clientX + docScrollLeft + 3) + 'px'
            });

            var dX = 0;
            var dY = 0;
            if (tmpTarget && tmpTarget.attr('id') != targetSetting.treeId) {
              var tmpTargetNode = tmpTargetNodeId == null ? null : data.getNodeCache(targetSetting, tmpTargetNodeId),
                isCopy = ((event.ctrlKey || event.metaKey) && setting.edit.drag.isMove && setting.edit.drag.isCopy) || (!setting.edit.drag.isMove && setting.edit.drag.isCopy),
                isPrev = !!(preNode && tmpTargetNodeId === preNode.tId),
                isNext = !!(nextNode && tmpTargetNodeId === nextNode.tId),
                isInner = (tmpNode.parentTId && tmpNode.parentTId == tmpTargetNodeId),
                canPrev = (isCopy || !isNext) && tools.apply(targetSetting.edit.drag.prev, [targetSetting.treeId, nodes, tmpTargetNode], !!targetSetting.edit.drag.prev),
                canNext = (isCopy || !isPrev) && tools.apply(targetSetting.edit.drag.next, [targetSetting.treeId, nodes, tmpTargetNode], !!targetSetting.edit.drag.next),
                canInner = (isCopy || !isInner) && !(targetSetting.data.keep.leaf && !tmpTargetNode.isParent) && tools.apply(targetSetting.edit.drag.inner, [targetSetting.treeId, nodes, tmpTargetNode], !!targetSetting.edit.drag.inner);

              function clearMove() {
                tmpTarget = null;
                tmpTargetNodeId = '';
                moveType = consts.move.TYPE_INNER;
                tmpArrow.css({
                  'display': 'none'
                });
                if (window.zTreeMoveTimer) {
                  clearTimeout(window.zTreeMoveTimer);
                  window.zTreeMoveTargetNodeTId = null;
                }
              }
              if (!canPrev && !canNext && !canInner) {
                clearMove();
              } else {
                var tmpTargetA = $('#' + tmpTargetNodeId + consts.id.A, tmpTarget),
                  tmpNextA = tmpTargetNode.isLastNode ? null : $('#' + tmpTargetNode.getNextNode().tId + consts.id.A, tmpTarget.next()),
                  tmpTop = tmpTargetA.offset().top,
                  tmpLeft = tmpTargetA.offset().left,
                  prevPercent = canPrev ? (canInner ? 0.25 : (canNext ? 0.5 : 1)) : -1,
                  nextPercent = canNext ? (canInner ? 0.75 : (canPrev ? 0.5 : 0)) : -1,
                  dY_percent = (event.clientY + docScrollTop - tmpTop) / tmpTargetA.height();

                if ((prevPercent == 1 || dY_percent <= prevPercent && dY_percent >= -0.2) && canPrev) {
                  dX = 1 - tmpArrow.width();
                  dY = tmpTop - tmpArrow.height() / 2;
                  moveType = consts.move.TYPE_PREV;
                } else if ((nextPercent == 0 || dY_percent >= nextPercent && dY_percent <= 1.2) && canNext) {
                  dX = 1 - tmpArrow.width();
                  dY = (tmpNextA == null || (tmpTargetNode.isParent && tmpTargetNode.open)) ? (tmpTop + tmpTargetA.height() - tmpArrow.height() / 2) : (tmpNextA.offset().top - tmpArrow.height() / 2);
                  moveType = consts.move.TYPE_NEXT;
                } else if (canInner) {
                  dX = 5 - tmpArrow.width();
                  dY = tmpTop;
                  moveType = consts.move.TYPE_INNER;
                } else {
                  clearMove();
                }

                if (tmpTarget) {
                  tmpArrow.css({
                    'display': 'block',
                    'top': dY + 'px',
                    'left': (tmpLeft + dX) + 'px'
                  });
                  tmpTargetA.addClass(consts.node.TMPTARGET_NODE + '_' + moveType);

                  if (preTmpTargetNodeId != tmpTargetNodeId || preTmpMoveType != moveType) {
                    startTime = (new Date()).getTime();
                  }
                  if (tmpTargetNode && tmpTargetNode.isParent && moveType == consts.move.TYPE_INNER) {
                    var startTimer = true;
                    if (window.zTreeMoveTimer && window.zTreeMoveTargetNodeTId !== tmpTargetNode.tId) {
                      clearTimeout(window.zTreeMoveTimer);
                      window.zTreeMoveTargetNodeTId = null;
                    } else if (window.zTreeMoveTimer && window.zTreeMoveTargetNodeTId === tmpTargetNode.tId) {
                      startTimer = false;
                    }
                    if (startTimer) {
                      window.zTreeMoveTimer = setTimeout(function () {
                        if (moveType != consts.move.TYPE_INNER) return;
                        if (tmpTargetNode && tmpTargetNode.isParent && !tmpTargetNode.open && (new Date()).getTime() - startTime > targetSetting.edit.drag.autoOpenTime &&
                          tools.apply(targetSetting.callback.beforeDragOpen, [targetSetting.treeId, tmpTargetNode], true)) {
                          view.switchNode(targetSetting, tmpTargetNode);
                          if (targetSetting.edit.drag.autoExpandTrigger) {
                            targetSetting.treeObj.trigger(consts.event.EXPAND, [targetSetting.treeId, tmpTargetNode]);
                          }
                        }
                      }, targetSetting.edit.drag.autoOpenTime + 50);
                      window.zTreeMoveTargetNodeTId = tmpTargetNode.tId;
                    }
                  }
                }
              }
            } else {
              moveType = consts.move.TYPE_INNER;
              if (tmpTarget && tools.apply(targetSetting.edit.drag.inner, [targetSetting.treeId, nodes, null], !!targetSetting.edit.drag.inner)) {
                tmpTarget.addClass(consts.node.TMPTARGET_TREE);
              } else {
                tmpTarget = null;
              }
              tmpArrow.css({
                'display': 'none'
              });
              if (window.zTreeMoveTimer) {
                clearTimeout(window.zTreeMoveTimer);
                window.zTreeMoveTargetNodeTId = null;
              }
            }
            preTmpTargetNodeId = tmpTargetNodeId;
            preTmpMoveType = moveType;

            setting.treeObj.trigger(consts.event.DRAGMOVE, [event, setting.treeId, nodes]);
          }
          return false;
        }

        doc.bind('mouseup', _docMouseUp);

        function _docMouseUp(event) {
          if (window.zTreeMoveTimer) {
            clearTimeout(window.zTreeMoveTimer);
            window.zTreeMoveTargetNodeTId = null;
          }
          preTmpTargetNodeId = null;
          preTmpMoveType = null;
          doc.unbind('mousemove', _docMouseMove);
          doc.unbind('mouseup', _docMouseUp);
          doc.unbind('selectstart', _docSelect);
          body.css('cursor', '');
          if (tmpTarget) {
            tmpTarget.removeClass(consts.node.TMPTARGET_TREE);
            if (tmpTargetNodeId) {
              $('#' + tmpTargetNodeId + consts.id.A, tmpTarget).removeClass(consts.node.TMPTARGET_NODE + '_' + consts.move.TYPE_PREV)
                .removeClass(consts.node.TMPTARGET_NODE + '_' + _consts.move.TYPE_NEXT).removeClass(consts.node.TMPTARGET_NODE + '_' + _consts.move.TYPE_INNER);
            }
          }
          tools.showIfameMask(setting, false);

          roots.showHoverDom = true;
          if (root.dragFlag == 0) return;
          root.dragFlag = 0;

          var i, l, tmpNode;
          for (i = 0, l = nodes.length; i < l; i++) {
            tmpNode = nodes[i];
            if (tmpNode.isParent && root.dragNodeShowBefore[tmpNode.tId] && !tmpNode.open) {
              view.expandCollapseNode(setting, tmpNode, !tmpNode.open);
              delete root.dragNodeShowBefore[tmpNode.tId];
            }
          }

          if (curNode) curNode.remove();
          if (tmpArrow) tmpArrow.remove();

          var isCopy = ((event.ctrlKey || event.metaKey) && setting.edit.drag.isMove && setting.edit.drag.isCopy) || (!setting.edit.drag.isMove && setting.edit.drag.isCopy);
          if (!isCopy && tmpTarget && tmpTargetNodeId && nodes[0].parentTId && tmpTargetNodeId == nodes[0].parentTId && moveType == consts.move.TYPE_INNER) {
            tmpTarget = null;
          }
          if (tmpTarget) {
            var dragTargetNode = tmpTargetNodeId == null ? null : data.getNodeCache(targetSetting, tmpTargetNodeId);
            if (tools.apply(setting.callback.beforeDrop, [targetSetting.treeId, nodes, dragTargetNode, moveType, isCopy], true) == false) {
              view.selectNodes(sourceSetting, nodes);
              return;
            }
            var newNodes = isCopy ? tools.clone(nodes) : nodes;

            function dropCallback() {
              if (isOtherTree) {
                if (!isCopy) {
                  for (var i = 0, l = nodes.length; i < l; i++) {
                    view.removeNode(setting, nodes[i]);
                  }
                }
                if (moveType == consts.move.TYPE_INNER) {
                  view.addNodes(targetSetting, dragTargetNode, -1, newNodes);
                } else {
                  view.addNodes(targetSetting, dragTargetNode.getParentNode(), moveType == consts.move.TYPE_PREV ? dragTargetNode.getIndex() : dragTargetNode.getIndex() + 1, newNodes);
                }
              } else {
                if (isCopy && moveType == consts.move.TYPE_INNER) {
                  view.addNodes(targetSetting, dragTargetNode, -1, newNodes);
                } else if (isCopy) {
                  view.addNodes(targetSetting, dragTargetNode.getParentNode(), moveType == consts.move.TYPE_PREV ? dragTargetNode.getIndex() : dragTargetNode.getIndex() + 1, newNodes);
                } else {
                  if (moveType != consts.move.TYPE_NEXT) {
                    for (i = 0, l = newNodes.length; i < l; i++) {
                      view.moveNode(targetSetting, dragTargetNode, newNodes[i], moveType, false);
                    }
                  } else {
                    for (i = -1, l = newNodes.length - 1; i < l; l--) {
                      view.moveNode(targetSetting, dragTargetNode, newNodes[l], moveType, false);
                    }
                  }
                }
              }
              view.selectNodes(targetSetting, newNodes);

              var a = $$(newNodes[0], setting).get(0);
              view.scrollIntoView(setting, a);

              setting.treeObj.trigger(consts.event.DROP, [event, targetSetting.treeId, newNodes, dragTargetNode, moveType, isCopy]);
            }

            if (moveType == consts.move.TYPE_INNER && tools.canAsync(targetSetting, dragTargetNode)) {
              view.asyncNode(targetSetting, dragTargetNode, false, dropCallback);
            } else {
              dropCallback();
            }
          } else {
            view.selectNodes(sourceSetting, nodes);
            setting.treeObj.trigger(consts.event.DROP, [event, setting.treeId, nodes, null, null, null]);
          }
        }

        doc.bind('selectstart', _docSelect);

        function _docSelect() {
          return false;
        }

        // Avoid FireFox's Bug
        // If zTree Div CSS set 'overflow', so drag node outside of zTree, and event.target is error.
        if (eventMouseDown.preventDefault) {
          eventMouseDown.preventDefault();
        }
        return true;
      }
    },
    // method of tools for zTree
    _tools = {
      getAbs: function (obj) {
        var oRect = obj.getBoundingClientRect(),
          scrollTop = document.body.scrollTop + document.documentElement.scrollTop,
          scrollLeft = document.body.scrollLeft + document.documentElement.scrollLeft;
        return [oRect.left + scrollLeft, oRect.top + scrollTop];
      },
      inputFocus: function (inputObj) {
        if (inputObj.get(0)) {
          inputObj.focus();
          tools.setCursorPosition(inputObj.get(0), inputObj.val().length);
        }
      },
      inputSelect: function (inputObj) {
        if (inputObj.get(0)) {
          inputObj.focus();
          inputObj.select();
        }
      },
      setCursorPosition: function (obj, pos) {
        if (obj.setSelectionRange) {
          obj.focus();
          obj.setSelectionRange(pos, pos);
        } else if (obj.createTextRange) {
          var range = obj.createTextRange();
          range.collapse(true);
          range.moveEnd('character', pos);
          range.moveStart('character', pos);
          range.select();
        }
      },
      showIfameMask: function (setting, showSign) {
        var root = data.getRoot(setting);
        // clear full mask
        while (root.dragMaskList.length > 0) {
          root.dragMaskList[0].remove();
          root.dragMaskList.shift();
        }
        if (showSign) {
          // show mask
          var iframeList = $$('iframe', setting);
          for (var i = 0, l = iframeList.length; i < l; i++) {
            var obj = iframeList.get(i),
              r = tools.getAbs(obj),
              dragMask = $$("<div id='zTreeMask_" + i + "' class='zTreeMask' style='top:" + r[1] + 'px; left:' + r[0] + 'px; width:' + obj.offsetWidth + 'px; height:' + obj.offsetHeight + "px;'></div>", setting);
            dragMask.appendTo($$('body', setting));
            root.dragMaskList.push(dragMask);
          }
        }
      }
    },
    // method of operate ztree dom
    _view = {
      addEditBtn: function (setting, node) {
        if (node.editNameFlag || $$(node, consts.id.EDIT, setting).length > 0) {
          return;
        }
        if (!tools.apply(setting.edit.showRenameBtn, [setting.treeId, node], setting.edit.showRenameBtn)) {
          return;
        }
        var aObj = $$(node, consts.id.A, setting),
          editStr = "<span class='" + consts.className.BUTTON + " edit' id='" + node.tId + consts.id.EDIT + "' title='" + tools.apply(setting.edit.renameTitle, [setting.treeId, node], setting.edit.renameTitle) + "' treeNode" + consts.id.EDIT + " style='display:none;'></span>";
        aObj.append(editStr);

        $$(node, consts.id.EDIT, setting).bind('click',
          function () {
            if (!tools.uCanDo(setting) || tools.apply(setting.callback.beforeEditName, [setting.treeId, node], true) == false) return false;
            view.editNode(setting, node);
            return false;
          }
        ).show();
      },
      addRemoveBtn: function (setting, node) {
        if (node.editNameFlag || $$(node, consts.id.REMOVE, setting).length > 0) {
          return;
        }
        if (!tools.apply(setting.edit.showRemoveBtn, [setting.treeId, node], setting.edit.showRemoveBtn)) {
          return;
        }
        var aObj = $$(node, consts.id.A, setting),
          removeStr = "<span class='" + consts.className.BUTTON + " remove' id='" + node.tId + consts.id.REMOVE + "' title='" + tools.apply(setting.edit.removeTitle, [setting.treeId, node], setting.edit.removeTitle) + "' treeNode" + consts.id.REMOVE + " style='display:none;'></span>";
        aObj.append(removeStr);

        $$(node, consts.id.REMOVE, setting).bind('click',
          function () {
            if (!tools.uCanDo(setting) || tools.apply(setting.callback.beforeRemove, [setting.treeId, node], true) == false) return false;
            view.removeNode(setting, node);
            setting.treeObj.trigger(consts.event.REMOVE, [setting.treeId, node]);
            return false;
          }
        ).bind('mousedown',
          function (eventMouseDown) {
            return true;
          }
        ).show();
      },
      addHoverDom: function (setting, node) {
        if (data.getRoots().showHoverDom) {
          node.isHover = true;
          if (setting.edit.enable) {
            view.addEditBtn(setting, node);
            view.addRemoveBtn(setting, node);
          }
          tools.apply(setting.view.addHoverDom, [setting.treeId, node]);
        }
      },
      cancelCurEditNode: function (setting, forceName, isCancel) {
        var root = data.getRoot(setting),
          nameKey = setting.data.key.name,
          node = root.curEditNode;

        if (node) {
          var inputObj = root.curEditInput,
            newName = forceName || (isCancel ? node[nameKey] : inputObj.val());
          if (tools.apply(setting.callback.beforeRename, [setting.treeId, node, newName, isCancel], true) === false) {
            return false;
          }
          node[nameKey] = newName;
          var aObj = $$(node, consts.id.A, setting);
          aObj.removeClass(consts.node.CURSELECTED_EDIT);
          inputObj.unbind();
          view.setNodeName(setting, node);
          node.editNameFlag = false;
          root.curEditNode = null;
          root.curEditInput = null;
          view.selectNode(setting, node, false);
          setting.treeObj.trigger(consts.event.RENAME, [setting.treeId, node, isCancel]);
        }
        root.noSelection = true;
        return true;
      },
      editNode: function (setting, node) {
        var root = data.getRoot(setting);
        view.editNodeBlur = false;
        if (data.isSelectedNode(setting, node) && root.curEditNode == node && node.editNameFlag) {
          setTimeout(function () {
            tools.inputFocus(root.curEditInput);
          }, 0);
          return;
        }
        var nameKey = setting.data.key.name;
        node.editNameFlag = true;
        view.removeTreeDom(setting, node);
        view.cancelCurEditNode(setting);
        view.selectNode(setting, node, false);
        $$(node, consts.id.SPAN, setting).html("<input type=text class='rename' id='" + node.tId + consts.id.INPUT + "' treeNode" + consts.id.INPUT + ' >');
        var inputObj = $$(node, consts.id.INPUT, setting);
        inputObj.attr('value', node[nameKey]);
        if (setting.edit.editNameSelectAll) {
          tools.inputSelect(inputObj);
        } else {
          tools.inputFocus(inputObj);
        }

        inputObj.bind('blur', function (event) {
          if (!view.editNodeBlur) {
            view.cancelCurEditNode(setting);
          }
        }).bind('keydown', function (event) {
          if (event.keyCode == '13') {
            view.editNodeBlur = true;
            view.cancelCurEditNode(setting);
          } else if (event.keyCode == '27') {
            view.cancelCurEditNode(setting, null, true);
          }
        }).bind('click', function (event) {
          return false;
        }).bind('dblclick', function (event) {
          return false;
        });

        $$(node, consts.id.A, setting).addClass(consts.node.CURSELECTED_EDIT);
        root.curEditInput = inputObj;
        root.noSelection = false;
        root.curEditNode = node;
      },
      moveNode: function (setting, targetNode, node, moveType, animateFlag, isSilent) {
        var root = data.getRoot(setting),
          childKey = setting.data.key.children;
        if (targetNode == node) return;
        if (setting.data.keep.leaf && targetNode && !targetNode.isParent && moveType == consts.move.TYPE_INNER) return;
        var oldParentNode = (node.parentTId ? node.getParentNode() : root),
          targetNodeIsRoot = (targetNode === null || targetNode == root);
        if (targetNodeIsRoot && targetNode === null) targetNode = root;
        if (targetNodeIsRoot) moveType = consts.move.TYPE_INNER;
        var targetParentNode = (targetNode.parentTId ? targetNode.getParentNode() : root);

        if (moveType != consts.move.TYPE_PREV && moveType != consts.move.TYPE_NEXT) {
          moveType = consts.move.TYPE_INNER;
        }

        if (moveType == consts.move.TYPE_INNER) {
          if (targetNodeIsRoot) {
            // parentTId of root node is null
            node.parentTId = null;
          } else {
            if (!targetNode.isParent) {
              targetNode.isParent = true;
              targetNode.open = !!targetNode.open;
              view.setNodeLineIcos(setting, targetNode);
            }
            node.parentTId = targetNode.tId;
          }
        }

        // move node Dom
        var targetObj, target_ulObj;
        if (targetNodeIsRoot) {
          targetObj = setting.treeObj;
          target_ulObj = targetObj;
        } else {
          if (!isSilent && moveType == consts.move.TYPE_INNER) {
            view.expandCollapseNode(setting, targetNode, true, false);
          } else if (!isSilent) {
            view.expandCollapseNode(setting, targetNode.getParentNode(), true, false);
          }
          targetObj = $$(targetNode, setting);
          target_ulObj = $$(targetNode, consts.id.UL, setting);
          if (!!targetObj.get(0) && !target_ulObj.get(0)) {
            var ulstr = [];
            view.makeUlHtml(setting, targetNode, ulstr, '');
            targetObj.append(ulstr.join(''));
          }
          target_ulObj = $$(targetNode, consts.id.UL, setting);
        }
        var nodeDom = $$(node, setting);
        if (!nodeDom.get(0)) {
          nodeDom = view.appendNodes(setting, node.level, [node], null, -1, false, true).join('');
        } else if (!targetObj.get(0)) {
          nodeDom.remove();
        }
        if (target_ulObj.get(0) && moveType == consts.move.TYPE_INNER) {
          target_ulObj.append(nodeDom);
        } else if (targetObj.get(0) && moveType == consts.move.TYPE_PREV) {
          targetObj.before(nodeDom);
        } else if (targetObj.get(0) && moveType == consts.move.TYPE_NEXT) {
          targetObj.after(nodeDom);
        }

        // repair the data after move
        var i, l,
          tmpSrcIndex = -1,
          tmpTargetIndex = 0,
          oldNeighbor = null,
          newNeighbor = null,
          oldLevel = node.level;
        if (node.isFirstNode) {
          tmpSrcIndex = 0;
          if (oldParentNode[childKey].length > 1) {
            oldNeighbor = oldParentNode[childKey][1];
            oldNeighbor.isFirstNode = true;
          }
        } else if (node.isLastNode) {
          tmpSrcIndex = oldParentNode[childKey].length - 1;
          oldNeighbor = oldParentNode[childKey][tmpSrcIndex - 1];
          oldNeighbor.isLastNode = true;
        } else {
          for (i = 0, l = oldParentNode[childKey].length; i < l; i++) {
            if (oldParentNode[childKey][i].tId == node.tId) {
              tmpSrcIndex = i;
              break;
            }
          }
        }
        if (tmpSrcIndex >= 0) {
          oldParentNode[childKey].splice(tmpSrcIndex, 1);
        }
        if (moveType != consts.move.TYPE_INNER) {
          for (i = 0, l = targetParentNode[childKey].length; i < l; i++) {
            if (targetParentNode[childKey][i].tId == targetNode.tId) tmpTargetIndex = i;
          }
        }
        if (moveType == consts.move.TYPE_INNER) {
          if (!targetNode[childKey]) targetNode[childKey] = new Array();
          if (targetNode[childKey].length > 0) {
            newNeighbor = targetNode[childKey][targetNode[childKey].length - 1];
            newNeighbor.isLastNode = false;
          }
          targetNode[childKey].splice(targetNode[childKey].length, 0, node);
          node.isLastNode = true;
          node.isFirstNode = (targetNode[childKey].length == 1);
        } else if (targetNode.isFirstNode && moveType == consts.move.TYPE_PREV) {
          targetParentNode[childKey].splice(tmpTargetIndex, 0, node);
          newNeighbor = targetNode;
          newNeighbor.isFirstNode = false;
          node.parentTId = targetNode.parentTId;
          node.isFirstNode = true;
          node.isLastNode = false;
        } else if (targetNode.isLastNode && moveType == consts.move.TYPE_NEXT) {
          targetParentNode[childKey].splice(tmpTargetIndex + 1, 0, node);
          newNeighbor = targetNode;
          newNeighbor.isLastNode = false;
          node.parentTId = targetNode.parentTId;
          node.isFirstNode = false;
          node.isLastNode = true;
        } else {
          if (moveType == consts.move.TYPE_PREV) {
            targetParentNode[childKey].splice(tmpTargetIndex, 0, node);
          } else {
            targetParentNode[childKey].splice(tmpTargetIndex + 1, 0, node);
          }
          node.parentTId = targetNode.parentTId;
          node.isFirstNode = false;
          node.isLastNode = false;
        }
        data.fixPIdKeyValue(setting, node);
        data.setSonNodeLevel(setting, node.getParentNode(), node);

        // repair node what been moved
        view.setNodeLineIcos(setting, node);
        view.repairNodeLevelClass(setting, node, oldLevel);

        // repair node's old parentNode dom
        if (!setting.data.keep.parent && oldParentNode[childKey].length < 1) {
          // old parentNode has no child nodes
          oldParentNode.isParent = false;
          oldParentNode.open = false;
          var tmp_ulObj = $$(oldParentNode, consts.id.UL, setting),
            tmp_switchObj = $$(oldParentNode, consts.id.SWITCH, setting),
            tmp_icoObj = $$(oldParentNode, consts.id.ICON, setting);
          view.replaceSwitchClass(oldParentNode, tmp_switchObj, consts.folder.DOCU);
          view.replaceIcoClass(oldParentNode, tmp_icoObj, consts.folder.DOCU);
          tmp_ulObj.css('display', 'none');
        } else if (oldNeighbor) {
          // old neigbor node
          view.setNodeLineIcos(setting, oldNeighbor);
        }

        // new neigbor node
        if (newNeighbor) {
          view.setNodeLineIcos(setting, newNeighbor);
        }

        // repair checkbox / radio
        if (!!setting.check && setting.check.enable && view.repairChkClass) {
          view.repairChkClass(setting, oldParentNode);
          view.repairParentChkClassWithSelf(setting, oldParentNode);
          if (oldParentNode != node.parent) {
            view.repairParentChkClassWithSelf(setting, node);
          }
        }

        // expand parents after move
        if (!isSilent) {
          view.expandCollapseParentNode(setting, node.getParentNode(), true, animateFlag);
        }
      },
      removeEditBtn: function (setting, node) {
        $$(node, consts.id.EDIT, setting).unbind().remove();
      },
      removeRemoveBtn: function (setting, node) {
        $$(node, consts.id.REMOVE, setting).unbind().remove();
      },
      removeTreeDom: function (setting, node) {
        node.isHover = false;
        view.removeEditBtn(setting, node);
        view.removeRemoveBtn(setting, node);
        tools.apply(setting.view.removeHoverDom, [setting.treeId, node]);
      },
      repairNodeLevelClass: function (setting, node, oldLevel) {
        if (oldLevel === node.level) return;
        var liObj = $$(node, setting),
          aObj = $$(node, consts.id.A, setting),
          ulObj = $$(node, consts.id.UL, setting),
          oldClass = consts.className.LEVEL + oldLevel,
          newClass = consts.className.LEVEL + node.level;
        liObj.removeClass(oldClass);
        liObj.addClass(newClass);
        aObj.removeClass(oldClass);
        aObj.addClass(newClass);
        ulObj.removeClass(oldClass);
        ulObj.addClass(newClass);
      },
      selectNodes: function (setting, nodes) {
        for (var i = 0, l = nodes.length; i < l; i++) {
          view.selectNode(setting, nodes[i], i > 0);
        }
      }
    },

    _z = {
      tools: _tools,
      view: _view,
      event: _event,
      data: _data
    };
  $.extend(true, $.fn.zTree.consts, _consts);
  $.extend(true, $.fn.zTree._z, _z);

  var zt = $.fn.zTree,
    tools = zt._z.tools,
    consts = zt.consts,
    view = zt._z.view,
    data = zt._z.data,
    event = zt._z.event,
    $$ = tools.$;

  data.exSetting(_setting);
  data.addInitBind(_bindEvent);
  data.addInitUnBind(_unbindEvent);
  data.addInitCache(_initCache);
  data.addInitNode(_initNode);
  data.addInitProxy(_eventProxy);
  data.addInitRoot(_initRoot);
  data.addZTreeTools(_zTreeTools);

  var _cancelPreSelectedNode = view.cancelPreSelectedNode;
  view.cancelPreSelectedNode = function (setting, node) {
    var list = data.getRoot(setting).curSelectedList;
    for (var i = 0, j = list.length; i < j; i++) {
      if (!node || node === list[i]) {
        view.removeTreeDom(setting, list[i]);
        if (node) break;
      }
    }
    if (_cancelPreSelectedNode) _cancelPreSelectedNode.apply(view, arguments);
  };

  var _createNodes = view.createNodes;
  view.createNodes = function (setting, level, nodes, parentNode, index) {
    if (_createNodes) {
      _createNodes.apply(view, arguments);
    }
    if (!nodes) return;
    if (view.repairParentChkClassWithSelf) {
      view.repairParentChkClassWithSelf(setting, parentNode);
    }
  };

  var _makeNodeUrl = view.makeNodeUrl;
  view.makeNodeUrl = function (setting, node) {
    return setting.edit.enable ? null : (_makeNodeUrl.apply(view, arguments));
  };

  var _removeNode = view.removeNode;
  view.removeNode = function (setting, node) {
    var root = data.getRoot(setting);
    if (root.curEditNode === node) root.curEditNode = null;
    if (_removeNode) {
      _removeNode.apply(view, arguments);
    }
  };

  var _selectNode = view.selectNode;
  view.selectNode = function (setting, node, addFlag) {
    var root = data.getRoot(setting);
    if (data.isSelectedNode(setting, node) && root.curEditNode == node && node.editNameFlag) {
      return false;
    }
    if (_selectNode) _selectNode.apply(view, arguments);
    view.addHoverDom(setting, node);
    return true;
  };

  var _uCanDo = tools.uCanDo;
  tools.uCanDo = function (setting, e) {
    var root = data.getRoot(setting);
    if (e && (tools.eqs(e.type, 'mouseover') || tools.eqs(e.type, 'mouseout') || tools.eqs(e.type, 'mousedown') || tools.eqs(e.type, 'mouseup'))) {
      return true;
    }
    if (root.curEditNode) {
      view.editNodeBlur = false;
      root.curEditInput.focus();
    }
    return (!root.curEditNode) && (_uCanDo ? _uCanDo.apply(view, arguments) : true);
  };
})(jQuery);
