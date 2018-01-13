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
// TreeGrid.FOLDER_OPEN_ICON = "data:image/png;base64,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";
// TreeGrid.FOLDER_CLOSE_ICON = "data:image/png;base64,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";
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
