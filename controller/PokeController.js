const Pock = require('../poker')

const roomToPoke = {}

// 负责组织 发牌,出牌,判断牌型
class PokeController {
  constructor(room){
    const dealedPock = Pock.created()
    this.players = room.currentPlayer.map(item=>JSON.parse(JSON.stringify(item)))
    this.floorPock = dealedPock.dealedList.floorList
    this.dealedObj = dealedPock.dealedList.playerObj
    this.players.forEach( u =>{
      u.pock = this.dealedObj[u.index]
    })
    roomToPoke[room.id] = this
  }
  static dealPoke(room){
    new PokeController(room)
  }
  static getPokeByRUid(rid,uid){
    const pock =  roomToPoke[rid]
    const user = pock.players.filter( u =>{
      return u.uid === uid
    })
    return user[0]
  }
  static getFloorByRid(rid){
    const pock =  roomToPoke[rid]
    return roomToPoke[rid].floorPock
  }

  static floorToPlayer(rid,uid){
    const pock =  roomToPoke[rid]
    const floorPoke = PokeController.getFloorByRid(rid)
    console.log(`当前底牌${JSON.stringify(floorPoke,null,2)}`)
    const u = PokeController.getPokeByRUid(rid,uid)
    u.pock = u.pock.concat(floorPoke)
  }

  static removePokeFromPlayer(rid,uid,pokeList){
    const a = pokeList.map(i=>i.id)
    const u = PokeController.getPokeByRUid(rid,uid)
    u.pock = u.pock.filter((p)=> {
      p.checked = false
      return !a.includes(p.id)
    } )
  }
  // 牌型检测器
  static checkModel(creent,playTop){
    // TODO
    return true
  }
}


module.exports = PokeController