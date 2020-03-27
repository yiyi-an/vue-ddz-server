var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const  { createClientId }  = require('./utils')

var RoomsController = require('./controller/RoomsController.js')
var PockController = require('./controller/PokeController.js')


io.on('connection', function(socket){
  console.log(`新建立连接:${socket.id}`);

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
    socket.emit('chat',{msg:'聊天弹幕链接成功'})
    io.sockets.emit('roomList',{ list:RoomsController.getRooms(),code:200 } )
    console.log(`${uid}创建了房间`)
  })
  // 加入房间
  socket.on('joinRoom',(uid,rid)=>{
    const room = RoomsController.getRoomByRid(rid)
    RoomsController.joinRoom(uid,room,socket)
    io.to(room.id).emit('roomChannel',{ room ,code:200})
    socket.emit('chat',{msg:'聊天弹幕链接成功'})
    io.to(room.chatId).emit('chat',{msg:`${uid}加入了房间`})
    io.sockets.emit('roomList',{ list:RoomsController.getRooms(),code:200 } )
  })

  // 房内聊天
  socket.on('chat',(message,uid)=>{
    const room =  RoomsController.getRoomByUser(uid)
    io.to(room.chatId).emit('chat',{msg:message})
  })
  

   // 获取房间信息,玩家状态 不包括手牌 
   socket.on('roomChannel',(uid,data)=>{
    const room =  RoomsController.getRoomByUser(uid)
    if(room.gameStatus==='grab'){
      room.graber(uid,data)
      if(room.gameStatus==='game'){
        const { pock:poke }  = PockController.getPokeByRUid(room.id,uid)
        socket.emit('getPoke',{ room,poke,code:200 })
      }
    }else if(room.gameStatus==='game'){
      const res = room.render(uid,data)
      if(res==='error'){
        // 出牌操作不合理
        return socket.emit('chat',{msg:'所选牌型不合理'})
      }else if(res==='success'){
        // 出牌操作合理并且不是过牌
        if(data!=='pass'){
          const { pock:poke }  = PockController.getPokeByRUid(room.id,uid)
          socket.emit('getPoke',{ room,poke,code:200 })
        }
      }else if(res==='win'){
        room.gameover()
      }

    }
    io.to(room.id).emit('roomChannel',{ room,code:200 })

  })

 
  //玩家准备
  socket.on('ready' , (uid,flag)=>{
    const room =  RoomsController.getRoomByUser(uid)
    const isGame = room.userReady(uid,flag)
    console.log(`${uid}玩家已${flag?'准备':'取消准备'}`)
    if(isGame) console.log('玩家都准备,游戏开始=====',room)
    io.to(room.id).emit('roomChannel',{ room ,code:200})
  })

  // 玩家获取手牌
  socket.on('getPoke',(uid,type)=>{
    const room =  RoomsController.getRoomByUser(uid)
    const { pock:poke }  = PockController.getPokeByRUid(room.id,uid)
    socket.emit('getPoke',{ room,poke,code:200 })

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
      io.to(room.chatId).emit('chat',{msg:`${uid} 离开了房间!`})
      io.sockets.emit('roomList',{ list:RoomsController.getRooms(),code:200 } )
    }else{
      console.log("玩家不在房间,默默的离开")
    }
  })
})




http.listen(10068, function(){
	console.log('服务启动,端口号:10068');
});
