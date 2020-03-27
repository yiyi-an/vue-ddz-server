var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

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


  // 房间列表
  socket.on('roomList', ()=>{
    socket.emit('roomList', JSON.stringify(roomArray));
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
  
  // 获取房间信息
  socket.on('roomChannel',uid=>{
    const room =  RoomsController.getRoomByUser(uid)
    io.to(room.id).emit('roomChannel',{ room ,code:200})
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
  socket.on('getPoke',(uid)=>{
    const room =  RoomsController.getRoomByUser(uid)
    const { pock:poke }  = PockController.getPokeByRUid(room.id,uid)
    console.log('获取手牌',poke)
    socket.emit('gameChannel',{ room,poke,code:200 })

  })

   // 玩家出牌
   socket.on('gameChannel',(uid,data)=>{
    const room =  RoomsController.getRoomByUser(uid)
    console.log(room)
    if(room.gameStatus==='grab'){
      room.graber(uid,data)
    }else if(room.gameStatus==='game'){
      console.log('游戏中')
      room.render(uid,data)
    }
    const { pock:poke } = PockController.getPokeByRUid(room.id,uid)
    io.to(room.id).emit('gameChannel',{ room,poke,code:200 })

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



const createClientId = ()=>{
  const attr = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXY'
  const ti = (+new Date()).toString().split('').reverse().slice(0,-2).join("")
  const f = attr[Math.floor(Math.random() * attr.length )]
  const s = attr[Math.floor(Math.random() * attr.length )]
   return `${f}${s}${ti}`
}