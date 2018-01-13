// 组织架构
$(function () {
  var config = {
    gridId: 'treeGridOrg',
    renderTo: 'treeGridWrap',
    ajaxUrl: 'http://rap.taobao.org/mockjsdata/29745/api/demo/tree_grid_list',
    ajaxType: 'POST',
    disabledKey: 'status',
    disabledValue: 0,
    columns: [{
        headerText: '组织/部门名称',
        dataField: function (row, col) {
          return row.tree_type === 1 ? 'org_name' : 'dept_name';
        },
        iconfont: function (row, col) {
          var icon;
          if (row.tree_type === 1) {
            icon = row.parent_id === '0' ? 'icon-zongzuzh' : 'icon-zuzhi';
          } else {
            icon = 'icon-bumen';
          }
          return icon;
        }
      },
      {
        headerText: '编码',
        dataField: function (row, col) {
          return row.tree_type === 1 ? 'org_code' : 'dept_code';
        }
      },
      {
        headerText: '简称',
        dataField: function (row, col) {
          return row.tree_type === 1 ? 'org_short_name' : 'dept_short_name';
        }
      },
      {
        headerText: '类型',
        template: function (row, col) {
          return row.tree_type === 1 ? '组织' : '部门';
        }
      },
      {
        headerText: '法人/负责人',
        dataField: function (row, col) {
          return row.tree_type === 1 ? 'org_legal_person' : 'dept_admin_name';
        }
      },
      {
        headerText: '状态',
        template: function (row, col) {
          return row.status === 0 ? '禁用' : '启用';
        }
      },
      {
        headerText: '操作',
        dataAlign: 'left',
        width: '165px',
        template: function (row, col) {
          var id = row.tree_type === 1 ? row.org_id : row.dept_id;
          var abledText = row.status === 0 ? '启用' : '禁用';
          var optionContent = '';
          optionContent += '<span class="plugin-action edit-action" data-type="' + row.tree_type + '" data-row-key="' + id + '">编辑</span>';
          optionContent += '<span class="plugin-action delete-action" data-type="' + row.tree_type + '" data-row-key="' + id +
            '">删除</span>';
          optionContent += '<span class="plugin-action abled-action" data-type="' + row.tree_type + '" data-status="' + row.status + '" data-row-key="' + id + '">' +
            abledText + '</span>';
          optionContent += '<span class="plugin-action bank-action" data-row-key="' + id + '">银行</span>';
          if (row.tree_type === 1) {
            optionContent += '<span class="plugin-action add-org-action" data-row-key="' + id +
              '">新增组织</span>';
          }
          optionContent += '<span class="plugin-action add-dept-action" data-row-key="' + id +
            '">新增部门</span>';

          return optionContent;
        }
      }
    ],
    data: []
  };
  var treeGrid = new TreeGrid(config);
  treeGrid.show();
  var treeGridData = treeGrid.treeGridData;

  // 点击编辑操作
  $('#treeGridOrg').on('click', '.edit-action', function () {
    var $this = $(this);
    var type = $this.data('type');
    var rowKey = $this.data('row-key');
    // console.log(treeGrid.getSelectedItem());
    if (type === 1) {
      // var postUrl = $('#orgFormValidator').attr('action') + '?keyValue=' + rowKey;
      // $('#orgFormValidator').attr('action', postUrl);
      $('#orgModal').modal('toggle');
      $('#orgFormValidator').initForm('edit', '编辑组织', treeGrid.getSelectedItem().data, function () {
        var $this = $(this);
        $this.find('#org_number').attr('readonly', 'readonly');
      });
      // $.ttyAjax({
      //   url: "/BaseManage/st_stock/GetFormJson",
      //   type: 'POST',
      //   param: {
      //     keyValue: rowKey
      //   },
      //   success: function (result) {
      //     $('#orgFormValidator').SetWebControls(result.resultdata);
      //     $('#orgModalLabel').text('组织编辑');
      //     $('#orgModal').modal('toggle');
      //   }
      // });
    } else {
      $('#deptModal').modal('toggle');
      initDetpEmpSelect();
      $('#deptFormValidator').initForm('edit', '编辑部门', treeGrid.getSelectedItem().data, function () {
        initDeptParent();
      });
    }
  });

  // 查询遍历表格树查找对应组织|部门名
  function getNameFromGridById(data, id, key, nameKey) {
    var name = '';

    (function getNameById(data, id, key, nameKey) {
      for (var i in data) {
        if (data[i][key] === id) {
          name = data[i][nameKey];
          break;
        } else {
          getNameById(data[i].children, id, key, nameKey);
        }
      }
    })(data, id, key, nameKey);

    return name;
  }

  // 初始化部门上级组织和部门
  function initDeptParent() {
    var rowData = treeGrid.getSelectedItem().data;
    var deptPOrgText = getNameFromGridById(treeGridData, rowData.org_id, 'org_id', 'org_name') || '无';
    var deptPText = rowData.dept_pid === '0' ? '无' : getNameFromGridById(treeGridData, rowData.dept_pid, 'dept_id', 'dept_name');
    $('#deptFormValidator #org_id').val(rowData.org_id);
    $('#deptFormValidator #dept_porgtext').text(deptPOrgText);
    $('#deptFormValidator #dept_pid').val(rowData.dept_pid);
    $('#deptFormValidator #dept_ptext').val(deptPText);
  }

  // 点击新增组织操作
  $('#treeGridOrg').on('click', '.add-org-action', function () {
    var $this = $(this);
    var rowKey = $this.data('row-key');
    $('#orgModal').modal('toggle');
    $('#orgFormValidator').initForm('add', '新增组织');
  });

  // 组织表单验证
  $('#orgFormValidator').find('[name="org_type_id"]').on('change', function (e) {
    /* Revalidate the activiesArea when it is changed */
    $('#orgFormValidator').formValidation('revalidateField', 'org_type_id');
  }).end().formValidation({
    excluded: ':disabled',
    fields: {
      org_number: {
        validators: {
          notEmpty: {
            message: '编码不能为空'
          }
        }
      },
      org_name: {
        validators: {
          notEmpty: {
            message: '组织名称不能为空'
          }
        }
      },
      org_legal_person: {
        validators: {
          notEmpty: {
            message: '法人不能为空'
          }
        }
      },
      org_type_id: {
        validators: {
          notEmpty: {
            message: '组织类型不能为空'
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
      data: $form.serializeObject(),
      success: function (result) {
        // ... Process the result ...
        switch ($button.data('type')) {
          case 'saveAndAdd':
            console.log('saveAndAdd');
            $form.resetFormControls();
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

  // 部门表单验证
  $('#deptFormValidator').find('[name="emp_id"]').on('change', function (e) {
    /* Revalidate the activiesArea when it is changed */
    $('#deptFormValidator').formValidation('revalidateField', 'emp_id');
  }).end().formValidation({
    excluded: ':disabled',
    fields: {
      dept_code: {
        validators: {
          notEmpty: {
            message: '部门编码不能为空'
          }
        }
      },
      dept_name: {
        validators: {
          notEmpty: {
            message: '部门名称不能为空'
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
      data: $form.serializeObject(),
      success: function (result) {
        // ... Process the result ...
        switch ($button.data('type')) {
          case 'saveAndAdd':
            console.log('saveAndAdd');
            $form.resetFormControls();
            break;
          case 'save':
            console.log('save');
            $('#deptModal').modal('toggle');
            parent.$.message({
              type: 'success',
              message: '部门保存成功'
            });
            break;
          default:
            console.log('default');
            break;
        }
      }
    });
  });

  // 点击新增部门操作
  $('#treeGridOrg').on('click', '.add-dept-action', function () {
    var $this = $(this);
    var rowKey = $this.data('row-key');
    $('#deptModal').modal('toggle');
    initDetpEmpSelect();
    $('#deptFormValidator').initForm('add', '新增部门', {}, function () {
      initDeptParent();
    });
  });

  // 点击删除（组织|部门）操作
  $('#treeGridOrg').on('click', '.delete-action', function () {
    var $this = $(this);
    var type = $this.data('type');
    var rowKey = $this.data('row-key');
    if (type === 1) {
      // $.ttyAjax({
      //   url: "/BaseManage/st_stock/GetFormJson",
      //   type: 'POST',
      //   param: {
      //     keyValue: rowKey
      //   },
      //   success: function (result) {
      //     treeGrid.refresh();
      //   }
      // });
    } else {
      // $.ttyAjax({
      //   url: "/BaseManage/st_stock/GetFormJson",
      //   type: 'POST',
      //   param: {
      //     keyValue: rowKey
      //   },
      //   success: function (result) {
      //     treeGrid.refresh();
      //   }
      // });
    }
  });

  // 点击启用|禁用（组织|部门）操作
  $('#treeGridOrg').on('click', '.abled-action', function () {
    var $this = $(this);
    var type = $this.data('type');
    var status = $this.data('status');
    var rowKey = $this.data('row-key');
    if (type === 1) {
      // $.ttyAjax({
      //   url: "/BaseManage/st_stock/GetFormJson",
      //   type: 'POST',
      //   param: {
      //     keyValue: rowKey
      //   },
      //   success: function (result) {
      //     parent.$.message({
      //       message: '禁用成功',
      //       type: 'success'
      //     });
      //     treeGrid.refresh();
      //   }
      // });
    } else {
      // $.ttyAjax({
      //   url: "/BaseManage/st_stock/GetFormJson",
      //   type: 'POST',
      //   param: {
      //     keyValue: rowKey
      //   },
      //   success: function (result) {
      //     treeGrid.refresh();
      //   }
      // });
    }
  });

  // 点击银行操作
  $('#treeGridOrg').on('click', '.bank-action', function () {
    var rowKey = $(this).data('row-key');
    $.tabs.openTab('/html/404.html?org_id=' + rowKey, '银行');
    // window.$utils.urlUtils.getQueryString('a');
  });

  // 初始化部门选择下拉选项
  function initDetpEmpSelect() {
    $('#emp_id').selectpicker('ajaxRequest', {
      url: 'http://rap.taobao.org/mockjsdata/29745/api/demo/select_list',
      param: {},
      async: false,
      template: function (selectObject) {
        return '<option value="' + selectObject.id + '">' + selectObject.name + ' 123</option>';
      }
    });
  }
});
