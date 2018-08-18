var interval;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    count: 3
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    interval = setInterval(function () {
      that.setData({
        count: that.data.count - 1
      })
      if (that.data.count == 0) {
        clearInterval(interval)
        wx.switchTab({
          url: '/pages/index/index'
        })
      }

    }, 1000)
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
  toIndex: function (e) {
    //跳转到主页
    clearInterval(interval)
    wx.switchTab({
      url: '/pages/index/index'      
    })
  }
})