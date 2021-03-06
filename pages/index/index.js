//index.js
//获取应用实例
const app = getApp()
// ajax参数
var goods_obj = {};
// 当前页面对象
var current_page;
// 页面
Page({
  data: {
    // 目录跳转按钮
    cid_btns: [{
      name: '全部',
      value: '0',
      class_name: 'all',
      icon_class_name: 'icon-yingyong'
    }, {
      name: '女装',
      value: '1',
      class_name: 'dress',
      icon_class_name: 'icon-qunzi'
    }, {
      name: '男装',
      value: '2',
      class_name: 'man',
      icon_class_name: 'icon-xizhuang'
    }, {
      name: '内衣',
      value: '3',
      class_name: 'underwear',
      icon_class_name: 'icon-neiyi'
    }, {
      name: '数码',
      value: '4',
      class_name: 'digital',
      icon_class_name: 'icon-bijiben'
    }, {
      name: '美食',
      value: '5',
      class_name: 'food',
      icon_class_name: 'icon-shiwu'
    }, {
      name: '美妆',
      value: '6',
      class_name: 'beauty',
      icon_class_name: 'icon-hufupin'
    }, {
      name: '母婴',
      value: '7',
      class_name: 'infant',
      icon_class_name: 'icon-naiping'
    }, {
      name: '鞋包',
      value: '8',
      class_name: 'shoes',
      icon_class_name: 'icon-nvbao'
    }, {
      name: '家居',
      value: '9',
      class_name: 'household',
      icon_class_name: 'icon-chuang'
    }, {
      name: '文体',
      value: '10',
      class_name: 'sport',
      icon_class_name: 'icon-bangqiu'
    }, {
      name: '其他',
      value: '11',
      class_name: 'else',
      icon_class_name: 'icon-qita'
    }],
    // 商品列表
    goods_list: [],
    // 是否显示正在加载
    is_hidden_loading: false,
    // 是否显示回到顶部按钮
    is_hidden_top: true,
    scroll_goods_list: {
      top: 0, // 用于设置滚动条位置
      height: 0 // 滚动区域可视高度
    },
    // 请求错误计数器
    error_count: 0,
    // 可以进行ajax请求标志
    can_ajax: true,
    // 更多商品标志
    is_more_goods: true
  },
  onLoad() {
    var pages = getCurrentPages() //获取加载的页面
    current_page = pages[pages.length - 1] //获取当前页面的对象
    var query = wx.createSelectorQuery();
    query.select('.js_scroll_box').boundingClientRect()
    query.exec(function(res) {
      current_page.data.scroll_goods_list.height = res[0].height;
      console.log(current_page.data.scroll_goods_list.height);
    })
  },
  // 页面渲染完成
  onReady() {
    this.initGoodsObj();
    setTimeout(function() {
      current_page.getGoods(current_page.parseGoodsList);
    }, 400)
  },
  // 初始化goods_obj
  initGoodsObj: function() {
    goods_obj['page_num'] = 1;
    goods_obj['page_size'] = 10;
    goods_obj['sort'] = 'goods_sale desc';
  },
  // 跳转到搜索页
  jumpToSearch: function() {

    wx.navigateTo({
      url: "../../pages/search/search"
    })
  },
  // 页面跳转
  jumpToCatalog: function(event) {
    var value = event.currentTarget.dataset.value;
    var url = '../../pages/catalog/catalog?cid=' + value + '&title=' + this.data.cid_btns[value].name;
    wx.navigateTo({
      url: url
    })
  },
  // 跳转详情页
  jumpToDetail: function(e) {
    var id = e.currentTarget.dataset.id;
    var url = "../../pages/detail/detail?id=" + id;
    wx.navigateTo({
      url: url
    })
  },
  // 跳转到领券
  jumpToCoupon: function(e) {
    var coupon = e.currentTarget.dataset.url.split("?");
    var temp = coupon[1].split('&');
    var sellerId = temp[0].split('=')[1];
    var activityId = temp[1].split('=')[1];
    var url = "../../pages/coupon/coupon?sellerId=" + sellerId + "&activityId=" + activityId;
    wx.navigateTo({
      url: url
    })
  },
  // 获取商品
  getGoods: function(callback) {
    wx.request({
      url: 'http://localhost:8088/getGoods',
      data: goods_obj,
      method: 'get',
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        current_page.data.error_count = 0;
        if (res != null && res.data != null) {
          callback(res.data);
        }
      },
      fail: function(res) {
        current_page.data.error_count++;
        // 错误三次就无法请求
        if (current_page.data.error_count >= 3) {
          current_page.data.can_ajax = false;
        }
        console.log('请求错误' + res);
        current_page.closeLoading();
      }
    });
  },
  // 解析商品列表
  parseGoodsList: function(data) {
    if (data.goods != null && data.goods.length > 0) {
      this.setData({
        goods_list: this.data.goods_list.concat(data.goods),
        is_hidden_loading: true
      })
    }
    // 显示没有更多商品
    if (data.goods == null || data.goods.length < goods_obj['page_size']) {
      this.setData({
        is_more_goods: false
      })
    }
    this.data.can_ajax = true; // 可以进行下一次ajax请求
  },
  // 关闭动画
  closeLoading: function() {
    this.setData({
      is_hidden_loading: true
    })
  },
  // 底部上滑加载更多
  scrollLowerEvent: function() {
    if (this.data.can_ajax && this.data.is_more_goods) {
      this.data.can_ajax = false;
      this.setData({
        is_hidden_loading: false
      });
      var num = goods_obj['page_num'];
      goods_obj['page_num'] = num + 1;
      setTimeout(function() {
        current_page.getGoods(current_page.parseGoodsList);
      }, 600)
    }
  },
  // 商品列表滚动事件
  scrollGoodsList: function(event) {
    if (event.detail.scrollTop > this.data.scroll_goods_list.height && this.data.is_hidden_top) {
      this.setData({
        is_hidden_top: false
      })
    } else if (event.detail.scrollTop < this.data.scroll_goods_list.height && !this.data.is_hidden_top) {
      this.setData({
        is_hidden_top: true
      })
    }
  },
  // 回到顶部
  scrollToTop: function() {
    this.setData({
      "scroll_goods_list.top": 0
    })
  }

});