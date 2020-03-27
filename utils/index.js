module.exports = {
  createClientId : function(){
    const attr = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXY'
    const ti = (+new Date()).toString().split('').reverse().slice(0,-2).join("")
    const f = attr[Math.floor(Math.random() * attr.length )]
    const s = attr[Math.floor(Math.random() * attr.length )]
     return `${f}${s}${ti}`
  }
} 