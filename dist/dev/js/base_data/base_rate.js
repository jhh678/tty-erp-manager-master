$(function () {
  // table
  $('table').GM({
    gridManagerName: 'test',
    // disableCache: true,
    supportCheckbox: false,
    width: 'auto',
    height: 'auto',
    disabledKey: 'status',
    supportAjaxPage: true,
    supportSorting: true,
    ajax_url: 'http://rap.taobao.org/mockjsdata/29745/api/base_brand/get_rate_list',
    ajax_type: 'POST',
    query: {
      pluginId: 1
    },
    pageSize: 20,
    columnData: [{
      key: 'name',
      text: '名称',
      sorting: '',
      align: 'center'
    }, {
      key: 'brate',
      text: '税率',
      sorting: '',
      align: 'center'
    }, {
      key: 'action',
      text: '操作',
      minWidth: '120px',
      align: 'center',
      template: function (action, rowObject) {
        return '<span class="plugin-action edit-action brand-edit" learnLink-id="' + rowObject.id +
          '">编辑</span>' +
          '<span class="plugin-action del-action" learnLink-id="' + rowObject.id +
          '">删除</span>';
      }
    }],
    pagingBefore: function (query) {
      console.log('pagingBefore', query);
    },
    pagingAfter: function (data) {
      console.log('pagingAfter', data);
    },
    sortingBefore: function (data) {
      console.log('sortBefore', data);
    },
    sortingAfter: function (data) {
      console.log('sortAfter', data);
    },
    adjustBefore: function (event) {
      console.log('adjustBefore', event);
    },
    adjustAfter: function (event) {
      console.log('adjustAfter', event);
    },
    dragBefore: function (event) {
      console.log('dragBefore', event);
    },
    dragAfter: function (event) {
      console.log('dragAfter', event);
    }
  });

  // 点击出现新增
  $('#depotAdd').on('click', function () {
    $('#formModalLabel').text('商品品牌新增');
    $('#formModal').modal('toggle');
  })
  // 点击出现编辑
  $('.table-demo').on('click', '.brand-edit', function () {
    $('#formModalLabel').text('商品品牌编辑');
    $('#formModal').modal('toggle');
  })
  // 删除
  $('.table-demo').on('click', '.del-action', function () {
    console.log($(this).attr('learnlink-id'))
  })
  // 仓库表单保存
  $('#form-validator').formValidation({
    excluded: ':disabled',
    fields: {
      brandName: {
        validators: {
          notEmpty: {
            message: '商品名称不能为空'
          }
        }
      }
    }
  }).on('success.form.fv', function (e) {
    // Prevent form submission
    e.preventDefault();

    var $form = $(e.target),
      $button = $form.data('formValidation').getSubmitButton();
    $form.data('formValidation');

    // Use Ajax to submit form data
    $.ajax({
      url: $form.attr('action'),
      type: 'POST',
      data: $form.serialize(),
      success: function (result) {
        // ... Process the result ...
        switch ($button.data('type')) {
          case 'saveAndAdd':
            console.log('saveAndAdd');
            break;

          case 'save':
            console.log('save');
            break;
          default:
            console.log('default');
            break;
        }
      }
    });
  });
})
