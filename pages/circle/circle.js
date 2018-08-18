//index.js
//获取应用实例
const app = getApp()
var sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置
const token = 'token'
Page({
  data: {
    tabs: ['精选', '创建中', '我的'],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    page: 1,
    circleList: [],
    focusCircleList: [],
    right: [],
    rightPage: 1,
    toView: 'red1',
    _click: 0,
    left: [
      { name: '足球', value: '0' },
      { name: '影视', value: '1' },
      { name: '音乐', value: '2' },
      { name: '二次元', value: '3' },
      { name: '三次元', vaue: '4' },
      { name: '游戏', value: '5' },
      { name: '学习', value: '6' },
      { name: '体育', value: '7' },
      { name: '搞笑', value: '8' },
      { name: '高校', value: '9' },
      { name: '其他', value: '10' }
    ],
    inputShowed: false,
    inputVal: "",
    isSearch: false,
    searchList: [],
    nosearchData: false
  },
  onLoad: function () {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
          sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex
        });
      }
    });
    this.getCircleByType(0)
  },
  tabClick: function (e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });
    if (e.currentTarget.id == 0) { } else if (e.currentTarget.id == 1) {
      this.getUnCircle()
    } else {
      this.getFocusCircle()
    }
  },
  //正在积攒的圈子
  getUnCircle() {
    var that = this
    wx.showLoading({
      title: '加载中'
    })
    wx.request({
      url: app.conf.host + '/football/api/circle/cclist?statue=0&page=' + that.data.page,
      data: '',
      header: {},
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: function (res) {
        if (res.data.code == 20000) {
          that.setData({
            circleList: res.data.data,
            page: that.data.page + 1
          })
        }
      },
      fail: function (res) { },
      complete: function (res) {
        wx.hideLoading()
      },
    })
  },
  support: function (e) {
    //支持开圈
    var id = e.currentTarget.dataset.id
    var that = this
    wx.showLoading({
      title: '提交中'
    })
    wx.request({
      url: app.conf.host + '/football/api/circle/creation',
      data: {
        title: that.data.circleList[parseInt(id)].title
      },
      header: {
        'X-AUTH-TOKEN': wx.getStorageSync(token)
      },
      method: 'POST',
      dataType: 'json',
      responseType: 'text',
      success: function (res) {
        if (res.data.code == 20000) {
          wx.showToast({
            title: '支持成功',
            duration: 1000,
          })
          that.getUnCircle()
        }
      },
      fail: function (res) { },
      complete: function (res) {
        wx.hideLoading()
      },
    })
  },
  addCircle: function (e) {
    if (wx.getStorageSync(token) == '') {
      wx.navigateTo({
        url: '/pages/login/login'
      })
    } else {
      wx.navigateTo({
        url: '/pages/circleCreate/circleCreate'
      })
    }
  },
  refresh: function (e) {
    this.setData({
      page: 1
    })
    this.getUnCircle()
  },
  tap: function (e) {
    var j = parseInt(e.currentTarget.dataset.i);
    this.setData({
      toView: this.data.left[j].value,//控制视图滚动到为此id的<view>
      _click: j                     //控制左侧点击后样式
    })
    this.setData({
      rightPage: 1
    })
    this.getCircleByType(j)
  },
  getCircleByType(type) {
    var that = this
    wx.showLoading({
      title: '加载中'
    })
    wx.request({
      url: app.conf.host + '/football/api/circle/cclist?statue=1&type=' + type,
      header: {},
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: function (res) {
        if (res.data.code == 20000) {
          that.setData({
            right: res.data.data,
            rightPage: that.data.rightPage
          })
        }
      },
      fail: function (res) { },
      complete: function (res) {
        wx.hideLoading()
      },
    })
  },
  getFocusCircle() {
    //获取用户关注的圈子
    if (wx.getStorageSync(token) == '') {
      wx.navigateTo({
        url: '/pages/login/login'
      })
    } else {
      var that = this
      wx.showLoading({
        title: '加载中'
      })
      wx.request({
        url: app.conf.host + '/football/api/circle/focus',
        data: '',
        header: {
          'X-AUTH-TOKEN': wx.getStorageSync(token)
        },
        method: 'GET',
        dataType: 'json',
        responseType: 'text',
        success: function (res) {
          if (res.data.code == 20000) {
            that.setData({
              focusCircleList: res.data.data
            })
          }
        },
        fail: function (res) { },
        complete: function (res) {
          wx.hideLoading()
        },
      })
    }

  },
  toCircle: function (e) {
    var id = parseInt(e.currentTarget.dataset.id)
    var info = null
    if (this.data.activeIndex == 0) {
      if (this.data.isSearch) {
        info = this.data.searchList[id]
      } else {
        info = this.data.right[id]
      }
    } else {
      info = this.data.focusCircleList[id]
    }
    var json = JSON.stringify(info)
    wx.navigateTo({
      url: '/pages/circleDetail/circleDetail?json=' + json
    })
  },
  doSearch: function () {
    //搜索
    var that = this
    wx.showLoading({
      title: '加载中'
    })
    wx.request({
      url: app.conf.host + '/football/api/search/list?name=' + that.data.inputVal,
      data: '',
      header: {},
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: function (res) {
        if (res.data.code == 20000) {
          that.setData({
            searchList: res.data.data
          })
          if (res.data.data.length == 0) {
            that.setData({
              nosearchData: true
            })
          }
        } else {
          wx.showToast({
            title: '加载错误',
            icon: 'none',
            duration: 1500
          })
        }
      },
      fail: function (res) { },
      complete: function (res) {
        wx.hideLoading()
      },
    })
  },
  showInput: function () {
    this.setData({
      inputShowed: true,
      isSearch: true
    });
  },
  hideInput: function () {
    this.setData({
      inputVal: "",
      inputShowed: false,
      isSearch: false,
      searchList: []
    });
  },
  clearInput: function () {
    this.setData({
      inputVal: "",
      searchList: []
    });
  },
  inputTyping: function (e) {
    this.setData({
      inputVal: e.detail.value
    });
  }
});