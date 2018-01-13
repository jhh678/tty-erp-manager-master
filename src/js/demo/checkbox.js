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
