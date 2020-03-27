const Room = require('../room')

const playerRoomMap = {} // [rid] : Room实例
const uidToRoom = {} // [uid] : [rid]
const sidToRoom = {} // [sid] : [rid]

module.exports =  class RoomsController {
  // 创建房间
  static createRoom(socket){
    const rid = `${+new Date()}`
    const room  = new Room(rid,socket)
    playerRoomMap[rid]=room
    return room
  }
  // 加入房间
  static joinRoom(uid,room,socket){
    room.joinUser(uid,socket.id)
    socket.join(room.id)
    socket.join(room.chatId)
    uidToRoom[uid]=room.id
    sidToRoom[socket.id] = room.id
    
  }
  static getPlayerBySid(sid){
    return sidToRoom[sid]
  }
  // 获取某个房间
  static getRoomByUser(uid){
    const rid = uidToRoom[uid]
    return playerRoomMap[rid]
  }
  // 获取所有房间
  static getRooms(){
    return Object.entries(playerRoomMap).map(arr=>arr[1])
  }
  static getRoomByRid(rid){
    return playerRoomMap[rid]
  }
  static delRoom(rid){
    delete playerRoomMap[rid]
  }
  static delUser(sid,uid){
    delete sidToRoom[sid]
    delete uidToRoom[uid]
  }
}