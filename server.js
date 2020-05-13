var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const  { createClientId }  = require('./utils')

var RoomsController = require('./controller/RoomsController.js')
var PockController = require('./controller/PokerController.js')


io.on('connection', function(socket){

  // 登录
  socket.on('login',(uid)=>{
    socket.emit('login', {
      uid:uid !== null ? uid:createClientId(),
      msg: `登录成功`,
      code: 200
    });  
    console.log(`用户登录:${socket.id}`);
    socket.emit('roomList',{ list:RoomsController.getRooms(),code:200 } )
  })

  // 创建房间
  socket.on('createRoom',(uid)=>{
    // todo 判断user是否已经有房间
    const room = RoomsController.createRoom()
    RoomsController.joinRoom(uid,room,socket)
    io.to(room.id).emit('roomChannel',{ room ,code:200})
    socket.emit('chat',{ message: '聊天弹幕链接成功'})
    io.sockets.emit('roomList',{ list:RoomsController.getRooms(),code:200 } )
    console.log(`${uid}创建了房间`)
  })
  // 加入房间
  socket.on('joinRoom',(uid,rid)=>{
    const room = RoomsController.getRoomByRid(rid)
    RoomsController.joinRoom(uid,room,socket)
    io.to(room.id).emit('roomChannel',{ room ,code:200})
    socket.emit('chat',{ message: '聊天弹幕链接成功'})
    io.to(room.chatId).emit('chat',{ message: `${uid}加入了房间`})
    io.sockets.emit('roomList',{ list:RoomsController.getRooms(),code:200 } )
  })

  // 房内聊天
  socket.on('chat',(message,uid)=>{
    const room =  RoomsController.getRoomByUser(uid)
    io.to(room.chatId).emit('chat',{ message: message})
  })
  

   // 获取房间信息,玩家状态 不包括手牌 
   socket.on('roomChannel',(uid,data)=>{
    const room =  RoomsController.getRoomByUser(uid)
    if(room.gameStatus==='grab'){
      room.graber(uid,data)
      if(room.gameStatus==='game'){
        const { pokers }  = PockController.getPokeByRidUid(room.id,uid)
        socket.emit('getPokers',{ room,pokers,code:200 })
      }
    }else if(room.gameStatus==='game'){
      // 
      const flag = room.render(uid,data)
      switch(flag){
        case "error":
          socket.emit('chat',{type:'info',message:'所选牌型不合理'})
          return
        case "success":
          if(data!=='pass'){
            // 出牌后和玩家同步手牌 放作弊
            const { pokers }  = PockController.getPokeByRidUid(room.id,uid)
            socket.emit('getPokers',{ room,pokers,code:200 })
          }
          break
        case "win":
          room.gameover()
          break
      }
    }
    io.to(room.id).emit('roomChannel',{ room,code:200 })

  })

 
  //玩家准备
  socket.on('ready' , (uid,flag)=>{
    const room =  RoomsController.getRoomByUser(uid)
    const isGame = room.userReady(uid,flag)
    if(isGame) console.log('玩家都准备,游戏开始=====',room)
    io.to(room.id).emit('roomChannel',{ room ,code:200})
  })

  // 玩家获取手牌
  socket.on('getPokers',(uid,type)=>{
    const room =  RoomsController.getRoomByUser(uid)
    const { pokers }  = PockController.getPokeByRidUid(room.id,uid)
    socket.emit('getPokers',{ room,pokers,code:200 })

  })


  //玩家掉线
  socket.on('disconnect',()=>{
    console.log(`${socket.id}断开了链接!!!!!!!`)
    var leaveRid = RoomsController.getPlayerBySid(socket.id)
    if(leaveRid){
      // 如果玩家在房间 
      const room = RoomsController.getRoomByRid(leaveRid)
      const {sid,uid} =  room.userLeve(socket.id)
      RoomsController.delUser(sid,uid)
      
      if(room.currentPlayer.length ===0){
        RoomsController.delRoom(room.id)
      }
      io.to(room.id).emit('roomChannel',{ room ,code:200})
      io.to(room.chatId).emit('chat',{ message: `${uid} 离开了房间!`})
      io.sockets.emit('roomList',{ list:RoomsController.getRooms(),code:200 } )
    }else{
      console.log("玩家不在房间,默默的离开")
    }
  })
})




http.listen(10068, function(){
	console.log('服务启动,端口号:10086');
});
