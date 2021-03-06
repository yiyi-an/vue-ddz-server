const playsMap = {}

class Player {
  static create({uid,sid,index} ){
    const p ={
      uid,
      sid,
      isReady:false,
      message:'', //文字消息,可表示 当前下注 过牌  空场
      topPoke:[], //牌型消息
      index
    }
    playsMap[uid] = p
    return p
  }
  static getPlayByUid(uid){
    if(playsMap[uid]){
      return playsMap[uid]
    }
    else{
      console.log('玩家不存在')
    }
  }
  static resetPlayer(...users){
    users.forEach(u=>{
      u.isReady = false,
      u.message = '',
      u.topPoke = []
    })
  }
    // 该谁操作 把谁的状态清掉
   
  static clearRoomsPlayerView(room){
    const p = room.currentPlayer.filter(p=>p.index ==room.currentIndex)[0]
    if(p){
      p.message = ''
      p.topPoke = []
    }
  }

}

module.exports = Player