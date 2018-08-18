var app = getApp()
var sliderWidth = 50; // 需要设置slider的宽度，用于计算中间位置
const token = 'token'
var socketOpen = false
var socketMsgQueue = []
Page({

  /**
   * 页面的初始数据
   */
  data: {
    header: {},
    tabs: ["赛况", "阵容", "直播室", "集锦", "赔率"],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    currentIndex: 0,
    gameDetail: {},
    currentId: '',
    match_stat: [],
    match_toprank: [],
    highlights: [],
    odds: {},
    titleList: [
      { name: '亚盘', index: 0 }, { name: '大小球', index: 1 }, { name: '欧盘', index: 2 }
    ],
    currentOdd: [],
    messageList: [],
    content: '',
    isConnection: false,
    focus: false,
    left: '0',
    right: '0',
    leftwidth: "50%",
    rightwidth: "50%",
    startTime: '',
    isChatting: false,
    message: '评论'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var id = options.id
    this.setData({
      currentId: id
    })
    this.getHeader(id)
    var that = this

    wx.onSocketOpen(function (res) {
      socketOpen = true
      for (var i = 0; i < socketMsgQueue.length; i++) {
        sendSocketMessage(socketMsgQueue[i])
      }
      socketMsgQueue = []
      console.log('WebSocket连接已打开！')
      var date = new Date()
      if (date.getTime() - that.data.startTime.getTime() > 7500000) {
        //125分钟
        //关闭聊天室
        wx.closeSocket()
        console.log("链接关闭")
        that.setData({
          message: '聊天已关闭',
          isChatting: true
        })
      }
    })
    wx.onSocketError(function (res) {
    })
    wx.onSocketMessage(function (res) {
      //接收消息
      var messageList = JSON.parse(res.data)
      that.setData({
        messageList: messageList
      })

    })
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
    this.getHeader(this.data.currentId)
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
  getHeader(id) {
    var that = this
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    wx.request({
      url: app.conf.host + '/football/api/game/detail/' + id,
      data: '',
      header: {},
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: function (res) {
        that.setData({
          header: res.data.data,
          left: res.data.data.zan.left,
          right: res.data.data.zan.right
        })
        //设置宽度百分比
        var lpercent = parseInt(that.data.left) / (parseInt(that.data.left) + parseInt(that.data.right))
        var rpercent = parseInt(that.data.right) / (parseInt(that.data.left) + parseInt(that.data.right))
        that.setData({
          leftwidth: lpercent * 100 + "%",
          rightwidth: rpercent * 100 + "%"
        })
        //获取头信息
        //日月
        var m = "2018-" + res.data.data.stat[0].split(" ")[0]
        //时间
        var time = res.data.data.stat[0].split(" ")[3] + ":00"
        var s = that.convertDateFromString(m + " " + time)
        that.setData({
          startTime: s
        })
        var date = new Date()
        //比赛前10分钟开始聊天
        var cha = date.getTime() - that.data.startTime.getTime()
        if (cha > -600000 && cha < 7500000) {
          wx.connectSocket({
            url: app.conf.ws + '/action/webSocket?id=' + that.data.currentId,
            header: {
              'content-type': 'application/json'
            },
            method: "GET"

          })
        }
        that.getGameDetail(id)
      },
      fail: function (res) { },
      complete: function (res) {
        wx.hideLoading()
        wx.stopPullDownRefresh()
      },
    })
  }
  ,
  convertDateFromString: function (dateString) {
    if (dateString) {
      // var arr1 = dateString.split(" ");
      // var sdate = arr1[0].split('-');
      // var date = new Date(sdate[0], sdate[1] - 1, sdate[2]);
      // return date;
      var str = dateString.replace("/-/g", "/");
      var date = new Date(str)
      return date
    }
  },
  tabClick: function (e) {
    var mythis = this;
    var id = e.currentTarget.id;
    mythis.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: id,
      currentTitleIndex: id
    });
    if (id == 0) {
      this.getGameDetail(this.data.currentId)
    } else if (id == 1) {
      this.getGameLineup(this.data.currentId)
    } else if (id == 2) {
      this.chatroom()
    } else if (id == 3) {
      this.getHighlights(this.data.currentId)
    } else {
      this.getOdds(this.data.currentId)
    }
  }
  ,
  // 发送消息
  sendSocketMessage: function (msg) {
    var that = this
    if (socketOpen) {
      wx.sendSocketMessage({
        data: msg,
        complete: function (e) {
          that.setData({
            content: '',
            focus: false
          })
        }
      })
    } else {
      socketMsgQueue.push(msg)
    }
  },

  getGameDetail(id) {
    var that = this
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    wx.request({
      url: app.conf.host + '/football/api/game/detail/situation/' + id,
      header: {},
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: function (res) {
        that.setData({
          gameDetail: res.data.data
        })
      },
      fail: function (res) { },
      complete: function (res) {
        wx.hideLoading()
      },
    })
  }
  ,
  getGameLineup(id) {
    var that = this
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    wx.request({
      url: app.conf.host + '/football/api/game/detail/lineup/' + id,
      header: {},
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: function (res) {
        that.setData({
          match_stat: res.data.data.match_stat,
          match_toprank: res.data.data.match_toprank
        })
      },
      fail: function (res) { },
      complete: function (res) {
        wx.hideLoading()
      },
    })
  }
  ,
  //聊天
  chatroom() {
    if (!this.data.isConnection) {
      this.setData({
        isConnection: true
      })
      var that = this
      var date = new Date()
      var time = date.getTime() - that.data.startTime.getTime()
      if (time > -600000 && time < 7500000) {
        wx.connectSocket({
          url: app.conf.ws2 + '/webSocket?id=' + that.data.currentId,
          method: 'GET'
        })
        this.setData({
          message: '评论',
          isChatting: false
        })
      } else if (time >= 7500000) {
        this.setData({
          message: '聊天已关闭',
          isChatting: true
        })
      } else {

        this.setData({
          message: '聊天未开始',
          isChatting: true
        })
      }
    }
  },
  getHighlights(id) {
    var that = this
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    wx.request({
      url: app.conf.host + '/football/api/game/detail/highlights/' + id,
      header: {},
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: function (res) {
        that.setData({
          highlights: res.data.data
        })
      },
      fail: function (res) { },
      complete: function (res) {
        wx.hideLoading()
      },
    })
  }
  ,
  getOdds(id) {
    var that = this
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    wx.request({
      url: app.conf.host + '/football/api/game/detail/odd/' + id,
      header: {},
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: function (res) {
        that.setData({
          odds: res.data.data,
          currentOdd: res.data.data['asia']
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
    var index = e.currentTarget.id
    this.setData({
      currentIndex: index
    })
    var type = ''
    if (index == 0) {
      type = 'asia'
    } else if (index == 1) {
      type = 'ball'
    } else {
      type = 'european'
    }
    this.setData({
      currentOdd: this.data.odds[type]
    })
  },
  bindInput: function (e) {
    this.setData({
      content: e.detail.value
    })
  },
  submit: function (e) {
    //提交评论
    if (wx.getStorageSync(token) == '') {
      wx.navigateTo({
        url: '/pages/login/login'
      })
      return;
    }
    if (this.data.content == '') {
      wx.showToast({
        title: '内容不能为空',
        icon: 'none',
        duration: 1500
      })
      return;
    }
    //提交
    //整合用户信息
    var map = {
      "content": this.data.content,
      "info": wx.getStorageSync(token)
    }
    var json = JSON.stringify(map)
    this.sendSocketMessage(json)
  },
  toDetail: function (e) {
    var id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/userInfo/userInfo?userId=' + id
    })
  },
  handerZan: function (e) {
    //处理赞
    var type = e.currentTarget.dataset.type
    var that = this
    wx.request({
      url: app.conf.host + '/football/api/index/game',
      data: {
        gameId: that.data.currentId,
        size: type
      },
      header: {},
      method: 'POST',
      dataType: 'json',
      responseType: 'text',
      success: function (res) {
        if (res.data.code == 20000) {
          if (type == 'left') {
            that.setData({
              left: parseInt(that.data.left) + 1
            })
          } else {
            that.setData({
              right: parseInt(that.data.right) + 1
            })
          }
          var lpercent = parseInt(that.data.left) / (parseInt(that.data.left) + parseInt(that.data.right))
          var rpercent = parseInt(that.data.right) / (parseInt(that.data.left) + parseInt(that.data.right))
          that.setData({
            leftwidth: lpercent * 100 + "%",
            rightwidth: rpercent * 100 + "%"
          })
        } else {
          wx.showToast({
            title: '点赞失败',
            icon: 'none',
            duration: 1500,
            mask: true
          })
        }
      },
      fail: function (res) { },
      complete: function (res) { },
    })
  }
})