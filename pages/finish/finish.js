Page({

  /**
   * 页面的初始数据
   */
  data: {
    tiku: [
      [{ id: 1, result: true }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }],
      [{ id: 6 }, { id: 7 }, { id: 8, result: false }, { id: 9 }, { id: 10 }],
      [{ id: 11 }, { id: 12 }, { id: 13 }, { id: 14 }, { id: 15 }],
      [{ id: 16 }, { id: 17 }, { id: 18 }, { id: 19 }, { id: 20 }]
    ],
    correct: '正确数',
    time: '时间'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var data = {};
    // 注意这里, 引入的 SDK 文件不一样的话, 你可能需要使用 SDK.NIM.getInstance 来调用接口
    var nim = NIM.getInstance({
      // debug: true,
      appKey: 'appKey',
      account: 'account',
      token: 'token',
      onconnect: onConnect,
      onwillreconnect: onWillReconnect,
      ondisconnect: onDisconnect,
      onerror: onError
    });
    function onConnect() {
      console.log('连接成功');
    }
    function onWillReconnect(obj) {
      // 此时说明 SDK 已经断开连接, 请开发者在界面上提示用户连接已断开, 而且正在重新建立连接
      console.log('即将重连');
      console.log(obj.retryCount);
      console.log(obj.duration);
    }
    function onDisconnect(error) {
      // 此时说明 SDK 处于断开状态, 开发者此时应该根据错误码提示相应的错误信息, 并且跳转到登录页面
      console.log('丢失连接');
      console.log(error);
      if (error) {
        switch (error.code) {
          // 账号或者密码错误, 请跳转到登录页面并提示错误
          case 302:
            break;
          // 重复登录, 已经在其它端登录了, 请跳转到登录页面并提示错误
          case 417:
            break;
          // 被踢, 请提示错误后跳转到登录页面
          case 'kicked':
            break;
          default:
            break;
        }
      }
    }
    function onError(error) {
      console.log(error);
    }
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

  },
  toDetail: function (e) {

  }
})