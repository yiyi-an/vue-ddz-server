// 检测对子
function checkDouble(arr) {
  if (arr.length !== 2) return false;
  return checkAllCardSame(arr);
}
// 三张不带
function checkThree(arr) {
  if (arr.length !== 3) return false;
  return checkAllCardSame(arr);
}
// 检测炸弹(5555)
function checkBomb(arr) {
  if (arr.length !== 4)  return false;
  return checkAllCardSame(arr);
}

// 检测王炸
function checkKingBomb(arr) {
    if (arr.length !== 2) return false;
    var kingCount = 0;
    for (var i = 0; i < arr.length; i++) {
        if (arr[i].weight === 16 || arr[i].weight === 17) {
            kingCount++;
        }
    }
    return kingCount === 2;
}

// 检测三带一（带一张或者一对）
function checkThreeOne(arr) {
    var len = arr.length;
    if (len !== 4 && len !== 5) return false;
    // 炸弹不算三带一
    if (checkBomb(arr)) return false;
    var ret = false;
    if (len === 4) {
        if (checkAllCardSame(arr.slice(0, arr.length - 1)) || checkAllCardSame(arr.slice(arr.length - 3, arr.length))) {
            ret = true;
        }
    } else if (len === 5) {
        if (checkAllCardSame(arr.slice(0, arr.length - 2)) && checkAllCardSame(arr.slice(arr.length - 2, arr.length))) {
            ret = true;
        } else if (checkAllCardSame(arr.slice(0, arr.length - 3)) && checkAllCardSame(arr.slice(arr.length - 3, arr.length))) {
            ret = true;
        }
    }
    return ret;
}

// 检测单顺(34567)
function checkContinuousSingle(arr) {
    var len = arr.length;
    if (len < 5 || len > 12) {
        return false;
    }
    // 大小王、2不能算在顺子里
    var ret = true;
    for (var i = 0; i < len - 1; i++) {
        var pre = arr[i].weight;
        var next = arr[i + 1].weight;
        if (pre === 15 || pre === 16 || pre == 17 || next === 15 || next === 16 || next === 17) {
            ret = false;
            break;
        }
        else if (pre !== (next + 1)) {
            ret = false;
            break;
        }
    }
    return ret;
}

// 检测双顺(连对334455)
function checkContinuousDouble(arr) {
    var len = arr.length;
    if (len < 6 || len % 2 !== 0) {
        return false;
    }

    var ret = true;
    for (var i = 0; i < len; i = i + 2) {
        // 2不能参与连对
        if (arr[i].weight === 15) {
            ret = false;
            break;
        }
        if (!checkAllCardSame(arr.slice(i, i + 2))) {
            ret = false;
            break;
        }
        if (i < len - 2) {
            if (arr[i].weight !== (arr[i + 2].weight + 1)) {
                ret = false;
                break;
            }
        }
    }

    return ret;
}

// 检测飞机(333444)
function checkAirplane(arr) {
    var len = arr.length;
    if (len < 6 || len % 3 !== 0) {
        return false;
    }
    var ret = true;
    for (var i = 0; i < len; i += 3) {
        // 2不参与飞机
        if (arr[i].weight === 15) {
            ret = false;
            break;
        }
        if (!checkThree(arr.slice(i, i + 3))) {
            ret = false;
            break;
        }
        if (i < len - 3) {
            if (arr[i].weight !== (arr[i + 3].weight + 1)) {
                ret = false;
                break;
            }
        }
    }

    return ret;
}

// 检测飞机带翅膀(33344456、3334445566)
function checkAirplaneWithWing(arr) {
    var len = arr.length;
    if (len < 8) {
        return false;
    }

    var threeArr = [];
    var othersArr = [];
    // 先找出所有的三张
    for (var i = 0; i < len;) {
        // 剩余手牌已经不够三张了
        if (i >= (len - 2)) {
            for (var k = i; k < len; k++) {
                othersArr.push(arr[k]);
            }
            break;
        }
        // 剩余手牌大于二张
        var key = arr[i].weight;
        var count = 1;
        for (var j = i + 1; j < len; j++) {
            if (key === arr[j].weight) {
                count++;
            } else {
                break;
            }
        }
        // 如果count === 4 说明有炸弹，不符合规则
        if (count === 4) {
            return false;
        } else if (count === 3) {
            threeArr.push(arr[i], arr[i + 1], arr[i + 2]);
            i = j;
        } else {
            for (var h = i; h < j; h++) {
                othersArr.push(arr[h]);
            }
            i = j;
        }
    }

    console.log('-------飞机带翅膀判定------');
    console.log('threes:' + JSON.stringify(threeArr));
    console.log('others:' + JSON.stringify(othersArr));
    console.log('-------------------------');

    // 判定三张是不是飞机
    if (!checkAirplane(threeArr)) {
        // 有可能三张相同牌作为单牌带出, 此时剔除一组三张作为带牌
        // 如：333444555+888
        // 如：333444555666 + 8889
        var threeLen = threeArr.length;
        if (checkAirplane(threeArr.slice(0, threeLen - 3))) {
            othersArr.push(threeArr[threeLen - 3], threeArr[threeLen - 2], threeArr[threeLen - 1]);
            threeArr = threeArr.slice(0, threeLen - 3);
        } else if (checkAirplane(threeArr.slice(3, arr.length))) {
            othersArr.push(threeArr[0], threeArr[1], threeArr[2]);
            threeArr = threeArr.slice(3, threeLen);
        } else {
            return false;
        }
    }

    // 需要翅膀数（单牌或者对子个数)
    var threeCounts = threeArr.length / 3;
    // 翅膀是单牌
    if (threeCounts === othersArr.length) {
        // 翅膀不能同时包含大小王
        var kingCount = 0;
        for (var v = 0; v < othersArr.length; v++) {
            if (othersArr[v].weight === 16 || othersArr[v].weight === 17) {
                kingCount++;
            }
        }
        return kingCount < 2;
    } else if (threeCounts === othersArr.length / 2) {
        // 翅膀是对子
        // 判断otherArr是不是全是对子
        for (var u = 0; u < othersArr.length; u = u + 2) {
            if (!checkAllCardSame(othersArr.slice(u, u + 2))) {
                return false;
            }
        }
        return true;
    } else {
        // 翅膀数目不对
        return false;
    }
}

// 检测4带二
function checkFourWithTwo(arr) {
    var ret = false;
    if (checkAllCardSame(arr.slice(0, arr.length - 2))) {
        ret = true;
    } else if (checkAllCardSame(arr.slice(1), arr.length - 1)) {
        ret = true;
    } else if (checkAllCardSame(arr.slice(2), arr.length)) {
        ret = true;
    }

    return ret;
}

  // 检测所有牌都相同
  function checkAllCardSame(arr) {
  var len = arr.length;
  var isSame = true;
  for (var i = 0; i < len - 1; i++) {
      if (arr[i].weight !== arr[i + 1].weight) {
          isSame = false;
          break;
      }
  }
  return isSame
}

// 检测是不是递增(3/4/5, 6/7/8/9...)
function checkIncrease(arr) {
    var len = arr.length;
    if (len < 2) {
        return false;
    }
    var ret = true;
    for (var i = 0; i < len - 1; i++) {
        if (arr[i].weight !== (arr[i + 1].weight + 1)) {
            ret = false;
            break;
        }
    }
    return ret;
}

  module.exports = {
    checkDouble,
    checkKingBomb,
    checkThreeOne,
    checkContinuousSingle,
    checkContinuousDouble,
    checkAirplane,
    checkAirplaneWithWing,
    checkFourWithTwo,
    checkAllCardSame,
    checkIncrease
  }