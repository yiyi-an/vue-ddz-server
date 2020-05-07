const Pock = require('../poker')
const {
  checkDouble,
  checkKingBomb,
  checkThreeOne,
  checkContinuousSingle,
  checkContinuousDouble,
  checkAirplane,
  checkAirplaneWithWing,
  checkFourWithTwo,
  checkAllCardSame,
} = require('../utils/check')

const roomToPoke = {}




let CARD_TYPE_INVALID = -1;                 // 无效手牌
let CARD_TYPE_SINGLE = 1;                   // 单张
let CARD_TYPE_DOUBLE = 2;                   // 对子
let CARD_TYPE_THREE = 3;                    // 三张
let CARD_TYPE_THREE_ONE = 4;                // 三带一（三带一张或者一对）
let CARD_TYPE_BOMB = 5;                     // 炸弹
let CARD_TYPE_FORE_TWO = 6;                 // 四带二
let CARD_TYPE_CONTINUOUS_SIGNGLE = 7;       // 单顺（5张起）
let CARD_TYPE_CONTINUOUS_DOUBLE = 8;        // 双顺（3对起）
let CARD_TYPE_AIRPLANE = 9;                 // 飞机 （两个三张起）
let CARD_TYPE_AIRPLANE_WING = 10;           // 飞机带翅膀 (三顺+同数量单牌或者对牌）
let CARD_TYPE_KING = 11;                    // 火箭


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
  
  /**
   * @description 牌型检测器
   * @static
   * @param {*} currentPoker 领头牌型
   * @param {*} data   牌对象 
   *  { 
         id: 8,    
         weight: 8,   权重  3~K : 3~13    A:14    2:15    小王:16    大王:17
         color: '方', 
         label: 'J', 
         checked: true 
   * }
   * @returns 
   * @memberof PokerController
   */
  static checkModel(currentPoker,cardsArr){
    // 判断牌型是否合理
    
    if(currentPoker.length){
      // 当前有牌型
      let currentType = PokerController.checkPokerType(currentPoker);
      let cardType = PokerController.checkPokerType(cardsArr)
      if (currentType === cardType){
        // TODO 比较大小
        return true
      }else {
        return false
      }
    }else{
      // 当前没牌型, 随便出
      let currentType = PokerController.checkPokerType(cardsArr);
      return currentType > 0
    }
  }
  static checkPokerType(cardsArr){

    if (!cardsArr || cardsArr.length < 1) return CARD_TYPE_INVALID;

    PokerController.sortPoker(cardsArr);

    let cardType = CARD_TYPE_INVALID;
    let weight = 0


    let len = cardsArr.length;
    if (len === 1) {
        cardType = CARD_TYPE_SINGLE;
        console.log('牌型:单张');
    } else if (len === 2) {
        if (checkDouble(cardsArr)) {
            cardType = CARD_TYPE_DOUBLE;
            console.log('牌型:对子');
        } else if (checkKingBomb(cardsArr)) {
            cardType = CARD_TYPE_KING;
            console.log('牌型:王炸');
        }
    } else if (len === 3) {
        if (checkAllCardSame(cardsArr)) {
            cardType = CARD_TYPE_THREE;
            console.log('牌型:三张');
        }
    } else if (len === 4) {
        if (checkAllCardSame(cardsArr)) {
            cardType = CARD_TYPE_BOMB;
            console.log('牌型:炸弹');
        } else if (checkThreeOne(cardsArr)) {
            cardType = CARD_TYPE_THREE_ONE;
            console.log('牌型:三带一张');
        }
    } else if (len === 5) {
        if (checkContinuousSingle(cardsArr)) {
            cardType = CARD_TYPE_CONTINUOUS_SIGNGLE;
            console.log('牌型:顺子' + len + '张.');
        } else if (checkThreeOne(cardsArr)) {
            cardType = CARD_TYPE_THREE_ONE;
            console.log('牌型:三带一对');
        }
    } else if (len === 6) {
        if (checkContinuousSingle(cardsArr)) {
            cardType = CARD_TYPE_SINGLE;
            console.log('牌型:顺子' + len + '张.');
        } else if (checkContinuousDouble(cardsArr)) {
            cardType = CARD_TYPE_DOUBLE;
            console.log('牌型:连对(3对)');
        } else if (checkAirplane(cardsArr)) {
            cardType = CARD_TYPE_AIRPLANE;
            console.log('牌型:飞机');
        } else if (checkFourWithTwo(cardsArr)) {
            cardType = CARD_TYPE_FORE_TWO;
            console.log('牌型:4带2');
        }
    } else {
        // 6 张以上需要判断单顺、双顺、飞机、飞机带翅膀、4带2
        if (checkContinuousSingle(cardsArr)) {
            cardType = CARD_TYPE_CONTINUOUS_SIGNGLE;
            console.log('牌型:单顺' + len + '张.');
        } else if (checkContinuousDouble(cardsArr)) {
            cardType = CARD_TYPE_CONTINUOUS_DOUBLE;
            console.log('牌型:连对' + len / 2 + '对');
        } else if (checkAirplane(cardsArr)) {
            cardType = CARD_TYPE_AIRPLANE;
            console.log('牌型:飞机');
        } else if (checkAirplaneWithWing(cardsArr)) {
            cardType = CARD_TYPE_AIRPLANE_WING;
            console.log('牌型:飞机带翅膀');
        } else if (checkFourWithTwo(cardsArr)) {
            cardType = CARD_TYPE_FORE_TWO;
            console.log('牌型:4带2');
        }
    }
 
    return cardType;
  }
  /***
 * 从大到小排序手牌
 * @param cardsArr 手牌数组
 */
  static sortPoker(cardsArr) {
  cardsArr.sort(function (c1, c2) {
      return c2.weight - c1.weight;
  });
}

  
}


module.exports = PokerController