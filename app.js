//app.js
App({
  conf:{
    //host:'http://xugang.free.ngrok.cc'
    //host:'http://localhost:8080'
    //host:'http://192.168.3.114:8080'
   // host:'http://192.168.43.213:7777',
    host:'http://192.168.0.105:7777',
    //ws:'ws://192.168.0.104:8888'
    ws:'ws://192.168.0.105:7777',
    ws2:'ws://192.168.0.105:8888'
    //ws:'ws://192.168.43.213:7777',
   // ws2:'ws://192.168.43.213:8888'
  },
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  globalData: {
    userInfo: null,
    clear:false,//判断是否退出登录
    edit:false//判断是否进行修改
  }
})