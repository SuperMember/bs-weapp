var sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置
var app = getApp();
Page({
  data: {
    bodyList: [],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    hiddenLoading: false,
    hiddenContent: true,
    dataVisiable: true,
    currentIndex: 0,
    currentTable: [],
    currentTitleIndex: 0,
    name: '进球数',
    defaultType: 'team_rank',
    score: [
      '球队', '胜/平/负', '进/失', '净胜球', '积分'
    ],
    goal: [
      '排名', '球员', '球队', '进球数'
    ],
    titleList: [
      {
        name: '积分',
        link: 'team_rank'
      }, {
        name: '进球',
        link: 'goal_rank'
      }, {
        name: '助攻',
        link: 'assist_rank'
      }, {
        name: '赛程',
        link: 'schedule'
      }
    ],
    dataList: [],
    //赛程需要的参数
    currentTime: '',
    roundId: null,
    seasonId: null,
    pre: false,
    next: false,
    toprank: 0,
    bottomrank: 0,
    //赛程
    time: [],
    index: 0,
    scrollLeft: 0
  },
  onLoad: function () {
    var mythis = this;
    wx.getSystemInfo({
      success: function (res) {
        mythis.setData({
          windowHeight: res.windowHeight - 51, windowWidth: res.windowWidth, sliderLeft: 10, sliderOffset: res.windowWidth / mythis.data.bodyList.length * mythis.data.activeIndex
        });
      }
    })
    //加载标题
    this.getTitle();

  },
  onPullDownRefresh:function(e){
    //刷新
    //加载内容
    this.setData({
      currentIndex: 0,
      currentTitleIndex: 0
    })
    this.getTitle()
  },
  tabClick: function (e) {
    var mythis = this;
    var id = e.currentTarget.id;
    mythis.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: id,
      currentTitleIndex: id,
      //重新初始化所有变量
      currentTime: '',
      roundId: null,
      seasonId: null,
      currentIndex: 0,
      currentTable: [],
    });

    //联赛切换
    this.getLeagueInfo(this.data.bodyList[parseInt(id)].link, this.data.defaultType);
  }
  ,
  getTitle: function (e) {
    var that = this
    wx.request({
      url: app.conf.host + '/football/api/league',
      // url: '',
      header: {},
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: function (res) {
        if (res.data.code === 20000) {
          that.setData({
            bodyList: res.data.data
          })
          //加载内容
          that.getLeagueInfo(res.data.data[that.data.currentTitleIndex].link, that.data.defaultType);
        }
      },
      fail: function (res) { },
      complete: function (res) {
        that.setData({
          hiddenLoading: true,
          hiddenContent: false
        })
        wx.stopPullDownRefresh()
      },
    })
  },
  tabTitleClick: function (e) {
    //切换
    var index = e.currentTarget.id
    if (index == 2) {
      this.setData({
        name: '助攻数'
      })
    } else {
      this.setData({
        name: '进球数'
      })
    }
    this.setData({
      currentIndex: index
    })
    this.getLeagueInfo(this.data.bodyList[this.data.currentTitleIndex].link, this.data.titleList[parseInt(index)].link);
  },
  getLeagueInfo: function (id, tp, gameweek, roundId, seasonId) {
    //获取数据
    wx.showLoading({
      title: '加载中...',
    })
    var that = this
    wx.request({
      url: tp != 'schedule' ? app.conf.host + '/football/api/league/data?id=' + id + "&type=" + tp : app.conf.host + '/football/api/league/data?id=' + id + "&type=" + tp + "&current=" + gameweek + "&round_id=" + roundId + "&season_id=" + seasonId,
      header: {},
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: function (res) {
        that.setData({
          dataList: res.data.data.data,
          dataVisiable: false
        })
        if (tp == 'team_rank') {
          that.setData({
            toprank: res.data.data.top_rank,
            bottomrank: res.data.data.bottom_rank
          })
        }
        if (tp == 'schedule') {
          if (that.data.roundId == null && that.data.seasonId == null) {
            //设置比赛总轮次
            var times = []
            for (var i = 0; i < res.data.data.count; i++) {
              times.push('第' + (i + 1) + '轮')
            }
            that.setData({
              roundId: res.data.data.round_id,
              seasonId: res.data.data.season_id,
              time: times
            })
          }
          that.setData({
            currentTime: res.data.data.current,
            index: parseInt(res.data.data.current.substring(1, res.data.data.current.length - 1)) - 1
          })
        }
      },
      fail: function (res) { },
      complete: function (res) {
        wx.hideLoading()
      },
    })
  }
  ,
  getSchedule(e) {
    //上一轮/下一轮
    var id = e.currentTarget.id
    var gameweek = null;
    if (id == 'pre') {
      gameweek = parseInt(this.data.currentTime.substring(1, this.data.currentTime.length)) - 1
    } else {
      gameweek = parseInt(this.data.currentTime.substring(1, this.data.currentTime.length)) + 1
    }
    if (gameweek == 0) {
      wx.showToast({
        title: '当前为第一轮',
        duration: 0,
        mask: true,
        success: function (res) { },
        fail: function (res) { },
        complete: function (res) { },
      })
    } else {
      this.getLeagueInfo(this.data.bodyList[this.data.currentTitleIndex].link, this.data.titleList[parseInt(this.data.currentIndex)].link, gameweek, this.data.roundId, this.data.seasonId)
    }
  }
  ,
  bindPickerChange: function (e) {
    //赛程选择事件
    this.getLeagueInfo(this.data.bodyList[this.data.currentTitleIndex].link, this.data.titleList[parseInt(this.data.currentIndex)].link, parseInt(e.detail.value)+1, this.data.roundId, this.data.seasonId)
  }
});
