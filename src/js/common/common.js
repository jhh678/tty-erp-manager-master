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
