var sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置
var app = getApp()
Page({
  data: {
    tabs: ["今日最佳", "圈主"],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    cId: null,
    rankList: null,
    page: 0,
    ownerList: null
  },
  onLoad: function (options) {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
          sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex
        });
      }
    });
    var cId = options.cId
    this.setData({
      cId: cId
    })
    this.getRank()
  },
  tabClick: function (e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });
  },
  getRank() {
    var that = this
    wx.showLoading({
      title: '加载中'
    })
    wx.request({
      url: app.conf.host + '/football/api/circle/rank?cId=' + that.data.cId + "&page=" + that.data.page,
      data: '',
      header: {},
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: function (res) {
        if (res.data.code == 20000) {
          if (res.data.data.list.length != 0) {
            for (var i = 0; i < res.data.data.owner.length; i++) {
              var time = Math.ceil((new Date().getTime() - new Date(res.data.data.owner[i].CREATED).getTime()) / (1000 * 60 * 60 * 24))
              res.data.data.owner[i].CREATED = time
            }
            that.setData({
              rankList: res.data.data.list,
              ownerList: res.data.data.owner,
              page: that.data.page + 1
            })
          }
        } else {

        }
      },
      fail: function (res) { },
      complete: function (res) {
        wx.hideLoading()
      },
    })
  },
  onReachBottom: function (e) {
    this.getRank();
  },
  toUser: function (e) {
    var id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/userInfo/userInfo?userId=' + id
    })
  },
  up: function (e) {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    })
  }
});