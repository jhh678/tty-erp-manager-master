$(function () {
  // table
  $('table').GM({
    gridManagerName: 'test',
    // disableCache: true,
    width: 'auto',
    height: 'auto',
    disabledKey: 'status',
    supportAjaxPage: true,
    supportSorting: true,
    ajax_url: 'http://rap.taobao.org/mockjsdata/29745/api/stock/get_stock_list',
    ajax_type: 'POST',
    query: {
      pluginId: 1
    },
    pageSize: 20,
    columnData: [{
      key: 'number',
      text: '仓库编号',
      sorting: 'DESC',
      align: 'center'
    }, {
      key: 'name',
      text: '仓库名称',
      sorting: ''
    }, {
      key: 'orgName',
      text: '所属组织'
    }, {
      key: 'manager',
      text: '仓管'
    }, {
      key: 'phone',
      text: '联系电话'
    }, {
      key: 'address',
      text: '地址'
    }, {
      key: 'mark',
      text: '备注'
    }, {
      key: 'status',
      text: '状态',
      align: 'center'
    }, {
      key: 'action',
      text: '操作',
      minWidth: '120px',
      align: 'center',
      template: function (action, rowObject) {
        return '<span class="plugin-action edit-action depot-edit" learnLink-id="' + rowObject.id +
          '">编辑</span>' +
          '<span class="plugin-action del-action" learnLink-id="' + rowObject.id +
          '">删除</span>' +
          '<span class="plugin-action stop-action" learnLink-id="' + rowObject.id +
          '">停用</span>';
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
    $('#formModalLabel').text('仓库新增');
    $('#formModal').modal('toggle');
  })
  // 点击出现编辑
  $('.table-demo').on('click', '.depot-edit', function () {
    $('#formModalLabel').text('仓库编辑');
    $('#formModal').modal('toggle');
  })
  $('#formModal').on('hidden.bs.modal', function () {
    $('#form-validator')[0].reset();
    $('#form-validator').data('formValidation').resetForm();
  })
  // 禁用
  $('#disable').on('click', function () {
    console.log($('table').GM('getCheckedTr'))
  })
  // 启用
  $('#start').on('click', function () {
    console.log($('table').GM('getCheckedTr'))
  })
  // 删除
  $('#delete').on('click', function () {
    console.log($('table').GM('getCheckedTr'))
  })
  // 仓库表单保存
  $('#form-validator').formValidation({
    excluded: ':disabled',
    fields: {
      depotName: {
        validators: {
          notEmpty: {
            message: '仓库名称不能为空'
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
