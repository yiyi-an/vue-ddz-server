var PokerController = require('./controller/PokerController.js')
var PlayerController = require('./controller/PlayerController.js')
var RoomsController = require('./controller/RoomsController.js')
/**
  gameStatus {
    等待: wating,
    抢地主: grab,
    出牌阶段: game
    游戏结束: end
  }
 */


module.exports = class Room {
  constructor(
    id,
    socket,
    ){
    this.currentIndex = 0
    this.playerNum = 0
    this.floorPoke = []
    this.currentPlayer= []
    this.currentPoker=[] //当前牌型
    this.id = id
    this.chatId =`chat_${id}` 
    this.empty=['0','1','2'] //空闲座位号
    this.gameStatus = 'wating'
    this.jetton = 0
    // this.setSocket(socket)
   
  }
  joinUser(uid,sid){
    const index = this.empty.splice(0,1)[0] 
    const player = PlayerController.create({uid,sid,index})
    this.currentPlayer.push(player) 
    this.playerNum++
  }
  // 有玩家离开了
  userLeve(sid){
    // 把玩家从current player干掉
    let leaveUser = undefined
    this.currentPlayer.forEach((p,ind)=>{
      if(p.sid === sid){
        leaveUser = p
        console.log('离开用户:',leaveUser)
        this.currentPlayer.splice(ind,1)
      }
    })
    // 重置为等待状态
    this.empty.push(leaveUser.index)
    this.currentPoker =[]
    PlayerController.resetPlayer(...this.currentPlayer)
    this.jetton = 0
    this.playerNum--
    this.gameStatus = "wating"
    
    return {sid:leaveUser.sid,uid:leaveUser.uid}
  }
  userReady(uid,flag){
    const readyStatusArr = this.currentPlayer.map(u=>{
      if(u.uid === uid) {
        u.isReady = flag
        u.message =flag ? '已准备' :''
      }
      return u.isReady
    })
    // 如果准备玩家数量 === 3 并且都准备 就发牌
    if(readyStatusArr.length === 3 ){
      if(readyStatusArr.sort()[0] === true ){
        this.currentIndex = Math.floor(Math.random()*3)
        this.gameStatus = "grab"
        this.currentPlayer.forEach(p=>p.message ='')
        PokerController.dealPoke(this)
        return true
      }
    }

    //测试用
    // if(readyStatusArr.length === 1 ){
    //   if(readyStatusArr.sort()[0] === true ){
    //     this.currentIndex = this.currentPlayer[0].index
    //     this.gameStatus = "grab"
    //     PokerController.dealPoke(this)
    //     return true
    //   }
    // }
  }
  graber(uid,jetton){
    if(jetton == 3){
      // 如果是3分 , 1.发地主牌  2.清空所有玩家message 3.改变room状态为game
      this.landlord = uid
      this.jetton = jetton
      this.gameStatus = "game"
      this.currentPlayer.forEach(p=>p.message = '')
      const player = PlayerController.getPlayByUid(uid)
      player.message = `地主我当了`
      player.isLandlord = true
      PokerController.floorToRoomAndUser(this,uid)
    }else if(jetton==0){
      this.currentIndex = (this.currentIndex+1) % 3
      const player = PlayerController.getPlayByUid(uid)
      player.message = `不 叫`
    }else{
      this.jetton = jetton
      const player = PlayerController.getPlayByUid(uid)
      player.message = `${jetton} 分`
      this.currentIndex = (this.currentIndex+1) % 3
    }
    
  }

  
  /**
   * @description 出牌控制器
   * @param {*} uid
   * @param {*} data
   * @returns {String} | over|error|success  游戏结束 | 牌型错误 | 操作成功
   */
  render(uid,data){
    const player = this.getPlayerByIndex(this.currentIndex)
    const prevPlayer = this.getPlayerByIndex(player.index,'prev')
    if(data=='pass'){
      this.currentIndex = (this.currentIndex+1) % 3
      player.message = `Pass`
      player.topPoke = []
      PlayerController.clearRoomsPlayerView(this)
      if(prevPlayer.message=='Pass'){
        // 如果上家也是过牌 把当前牌型清除
        this.currentPoker = []
      }
      return 'success'
    }else{
      const checkFlag = PokerController.checkModel(this.currentPoker,data)
      if(checkFlag){
        // 牌型合理
        this.currentIndex = (this.currentIndex+1) % 3
        this.currentPoker = data
        player.topPoke = data
        PlayerController.clearRoomsPlayerView(this)
        const playerPoker = PokerController.removePokeFromPlayer(this.id,uid,data)
        if(playerPoker.pokers.length===0){
          return 'win'
        }else{
          return 'success'
        }
      }else{
        return "error"
      }
    }
  }
  getPlayerByIndex(index,desgin){
    let indexNum
    if(desgin){

      indexNum = desgin === 'next' ? `${(index+ 1) % 3}` : `${(index+ 2)%3}`
    }else{
      indexNum = index
    }
    return this.currentPlayer.filter(p=> p.index == indexNum )[0]
  }
  gameover(){
    // TODO 游戏结束
  }

}