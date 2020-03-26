var PokeController = require('./controller/PokeController.js')
var PlayerController = require('./controller/PlayerController.js')
/**
  gameStatus {
    等待: wating,
    抢地主: grab,
    游戏中: game
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
    this.currentPlayer= []
    this.currentPoke=[] //当前牌型
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
  userReady(uid,flag){
    const statusArr = this.currentPlayer.map(u=>{
      if(u.uid === uid) {
        u.isReady = flag
        return 1
      }else{
        return 0
      }
    })
    // 如果准备玩家数量 === 3 并且都准备游戏开始 就发牌
    if(statusArr.length ===1 ){
      if(statusArr.sort()[0] !== 0 ){
        this.currentIndex = Math.floor(Math.random()*3)
        this.gameStatus = "grab"
        PokeController.dealing(this)
        return true
      }
    }
  }
  graber(uid,jetton){
    if(jetton == 3){
      // 如果是3分 , 1.发地主牌  2.清空所有玩家message 3.改变room状态为game
      console.log(`${uid}抢到了地主`)
      this.landlord = uid
      this.jetton = jetton
      this.gameStatus = 'game'
      this.currentPlayer.forEach(p=>p.message = '')
      const player = PlayerController.getPlayByUid(uid)
      player.message = `地主当定了`
      player.isLandlord = true
      PokeController.floorToPlayer(this.id,uid)
    }
    if(jetton==0){
      this.currentIndex = (this.currentIndex+1) % 3
      const player = PlayerController.getPlayByUid(uid)
      player.message = `不 叫`
    }else{
      this.jetton== jetton
      const player = PlayerController.getPlayByUid(uid)
      player.message = `${jetton} 分`
      this.currentIndex = (this.currentIndex+1) % 3
    }
    
  }
  render(uid,data){
    if(data=='pass'){
      this.currentIndex = (this.currentIndex+1) % 3
      const player = PlayerController.getPlayByUid(uid)
      player.message = `Pass`
      player.topPoke = []
    }else{
      const flag = PokeController.checkModel(this.currentPoke,data)
      if(flag){
        // 牌型合理
        this.currentIndex = (this.currentIndex+1) % 3
        PokeController.removePokeFromPlayer(this.id,uid,data)
        const player = PlayerController.getPlayByUid(uid)
        player.topPoke = data

      }else{
        return false
      }
     
    }
  }
}