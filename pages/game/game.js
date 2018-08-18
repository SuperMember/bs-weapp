//获取应用实例
const app = getApp()

Page({
  data: {
    game: null,
    winHeight: "",//窗口高度
    currentTab: 0, //预设当前项的值
    scrollLeft: 0, //tab标题的滚动条位置
    titleList: [],
    nextData: ''
  },
  // 滚动切换标签样式
  switchTab: function (e) {
    this.setData({
      currentTab: e.detail.current
    });
    this.checkCor();
  },
  // 点击标题切换当前页时改变样式
  swichNav: function (e) {
    var cur = e.target.dataset.current;
    if (this.data.currentTaB == cur) { return false; }
    else {
      this.setData({
        currentTab: cur
      })
    }
    var id = e.target.dataset.current
    this.getGame(this.data.titleList[id].tab)
  },
  //判断当前滚动超过一屏时，设置tab标题滚动条。
  checkCor: function () {
    if (this.data.currentTab > 4) {
      this.setData({
        scrollLeft: 300
      })
    } else {
      this.setData({
        scrollLeft: 0
      })
    }
    this.getGame(this.data.titleList[this.data.currentTab].tab)
  },
  footerTap: app.footerTap,
  onLoad: function () {
    var that = this
    //  高度自适应
    wx.getSystemInfo({
      success: function (res) {
        var clientHeight = res.windowHeight,
          clientWidth = res.windowWidth,
          rpxR = 750 / clientWidth;
        var calc = clientHeight * rpxR;
        that.setData({
          winHeight: calc
        });
      }
    });
    this.getTitle()
  }
  ,
  getGame(tab) {
    var today = new Date();
    var date = today.getFullYear() + "-" + (parseInt(today.getMonth()) + 1) + "-" + today.getDate()
    var that = this
    that.setData({
      game: null
    })
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    wx.request({
      url: app.conf.host + '/football/api/game?date=' + date + "&tab=" + tab,
      header: {},
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: function (res) {
        if (res.data.code == 20000) {
          that.setData({
            game: res.data.data.data,
            nextData: res.data.data.next_date
          })
        } else {
          wx.showToast({
            title: '加载失败',
            icon: 'none',
            duration: 1500
          })
        }
        wx.stopPullDownRefresh()
      },
      fail: function (res) { },
      complete: function (res) {
        wx.hideLoading()
      },
    })
  }
  ,
  getTitle() {
    var that = this
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    wx.request({
      url: app.conf.host + '/football/api/game/list',
      header: {},
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: function (res) {
        that.setData({
          titleList: res.data.data
        })
        var today = new Date();
        var time = today.getFullYear() + "-" + (parseInt(today.getMonth()) + 1) + "-" + today.getDate()
        //加载首页
        that.getGame(res.data.data[0].tab)
      },
      fail: function (res) { },
      complete: function (res) {
        wx.hideLoading()
      },
    })
  }
  ,
  onPullDownRefresh: function () {
    this.setData({
      nextData: ''
    })
    this.getGame(this.data.titleList[this.data.currentTab].tab)
  }
  ,
  onReachBottom: function (e) {
    //下拉刷新
    var that = this
    wx.showNavigationBarLoading()
    wx.request({
      url: app.conf.host + '/football/api/game?date=' + that.data.nextData + "&tab=" + that.data.currentTab,
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: (res) => {
        var game = this.data.game.concat(res.data.data.data)
        this.setData({
          game: game,
          nextData: res.data.data.next_date
        })
      },
      fail: function (res) { },
      complete: function (res) {
        wx.hideNavigationBarLoading() //完成停止加载
      },
    })
  },
  toDetail: function (e) {
    var url = e.currentTarget.dataset.url
    wx.navigateTo({
      url: url
    })
  }
})
