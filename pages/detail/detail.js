var app = getApp()
var sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置
Page({
  data: {
    team: {},
    member: {},
    honour: [],
    schedule: [],
    tabs: ["赛程", "队员", "资料"],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    currentIndex:0,
    currentId:''
  },
  onLoad: function (e) {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
          sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex
        });
      }
    });
    var type = e.type
    var id = e.id
    this.setData({
      currentId:id
    })
    this.getDetail(type, id)
  },
  getDetail(type, id) {
    var that = this
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    wx.request({
      url: app.conf.host + '/football/api/' + type + '?id=' + id,
      header: {},
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: function (res) {
        that.setData({
          team: res.data.data.team,
          member: res.data.data.member,
          honour: res.data.data.honour,
          schedule: res.data.data.schedule
        })
      },
      fail: function (res) { },
      complete: function (res) {
        wx.hideLoading()
      },
    })
  },
  tabClick: function (e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });
  },
  tabGameClick:function(e){
    var id=e.currentTarget.id;
    if(id=='pre'){
      //前
      if(this.data.currentIndex<=0){
        wx.showToast({
          title: '暂无数据',
          duration: 1000,
          mask: true
        })
      }else{
        this.setData({
          currentIndex:this.data.currentIndex-1
        })
      }
    }else{
      //后
      if (this.data.currentIndex > this.data.schedule.length-2){
        wx.showToast({
          title: '暂无数据',
          duration: 1000,
          mask: true
        })
      }else{
        this.setData({
          currentIndex: this.data.currentIndex +1
        })
      }
    }
  },
  toPlayerInfo:function(e){
    var id=e.currentTarget.dataset.url
    //跳转到队员详情页
    wx.navigateTo({
      url: '/pages/player/player?id='+id
    })
  }
})