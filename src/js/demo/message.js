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
