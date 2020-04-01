const Pock = require('../poker')

const roomToPoke = {}

// 负责组织 发牌,出牌,判断牌型
class PokerController {
  constructor(room){
    const dealedPock = Pock.created()
    this.players = room.currentPlayer.map(item=>JSON.parse(JSON.stringify(item)))
    this.floorPock = dealedPock.dealedList.floorList
    this.dealedObj = dealedPock.dealedList.playerObj
    this.players.forEach( u =>{
      u.pokers = this.dealedObj[u.index]
    })
    roomToPoke[room.id] = this
  }
  static dealPoke(room){
    new PokerController(room)
  }
  
  static getPokeByRidUid(rid,uid){
    const poker =  roomToPoke[rid] || []
     // 如果只传了 roomId 则返回房间的扑克
    if(!uid)  return poker 
    const playerPoker = poker.players.filter( u =>{
      return u.uid === uid
    })
    return playerPoker[0]
  }
  static getFloorByRid(rid){
    return roomToPoke[rid].floorPock
  }

  static floorToRoomAndUser(room,uid){
    const floorPoke = PokerController.getFloorByRid(room.id)
    const u = PokerController.getPokeByRidUid(room.id,uid)
    u.pokers = u.pokers.concat(floorPoke)
    room.floorPoke = floorPoke
  }

  static removePokeFromPlayer(rid,uid,pokerList){
    const pokerIdList = pokerList.map(i=>i.id)
    const player = PokerController.getPokeByRidUid(rid,uid)
    player.pokers = player.pokers.filter((p)=> {
      p.checked = false
      return !pokerIdList.includes(p.id)
    } )
    return player
    
  }
  // 牌型检测器
  static checkModel(currentPoker,player){
    // TODO
    // 判断牌型是否合理
    // 判断大小
    return true
  }
}


module.exports = PokerController