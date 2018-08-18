var app = getApp()
var sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置
var wxCharts = require('../../style/chart.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabs: ["比赛数据", "荣誉", "转会", "伤病", "能力"],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    honour: [],
    match_stat: [],
    transfer: [],
    invalid: [],
    player: {},
    ability: {},
    leftInfo: [],
    rightInfo: [],
    windowWidth: 0,
    normalSrc: '../../img/normal.png',
    selectedSrc: '../../img/selected.png',
    titleList: [{
      id: 0,
      name: '总计'
    },
    {
      id: 1,
      name: '联赛'
    },
    {
      id: 2,
      name: '杯赛'
    }, {
      id: 3,
      name: '国家队'
    }
    ],
    currentIndex: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          windowWidth: res.windowWidth,
          sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
          sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex
        });
      }
    });
    var id = options.id
    this.getPlayerInfo(id)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
  ,
  tabClick: function (e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });
  }
  ,
  getPlayerInfo(id) {
    var that = this
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    wx.request({
      url: app.conf.host + '/football/api/player?id=' + id,
      header: {},
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: function (res) {
        that.setData({
          honour: res.data.data.honour,
          ability: res.data.data.ability,
          invalid: res.data.data.invalid,
          match_stat: res.data.data.match_stat,
          transfer: res.data.data.transfer,
          player: res.data.data.player
        })

        //画雷达图
        var abilityList = res.data.data.ability.ability;
        var abilityName = []
        var abilityNum = []
        for (var i = 0; i < abilityList.length; i++) {
          var s = abilityList[i].split(" ")
          abilityName.push(s[0])
          abilityNum.push(s[1])
        }


        new wxCharts({
          canvasId: 'radarCanvas',
          type: 'radar',
          categories: abilityList,
          series: [{
            name: '能力值',
            data: abilityNum
          }],
          width: that.data.windowWidth,
          height: that.data.windowWidth,
          extra: {
            radar: {
              max: 100
            }
          }
        });
        //处理
        var info = res.data.data.player.playerDetail;
        var leftInfo = []
        var rightInfo = []
        for (var i = 0; i < info.length; i++) {
          if (i % 2 == 0) {
            leftInfo.push(info[i])
          } else {
            rightInfo.push(info[i])
          }
        }
        that.setData({
          leftInfo: leftInfo,
          rightInfo: rightInfo
        })
      },
      fail: function (res) { },
      complete: function (res) {
        wx.hideLoading()
      },
    })
  }
  ,
  tabTitleClick: function (e) {
    var id = e.currentTarget.id
    this.setData({
      currentIndex: parseInt(id)
    })
  }
})