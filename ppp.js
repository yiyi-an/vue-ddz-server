var PokerType = {
    danzhang: 1,
    duizi: 2,
    sanzhang: 3,
    sandaiyi: 4,
    sandaiyidui: 5,
    shunzi: 6,
    liandui: 7,
    feiji: 8,
    sidaier: 9,
    sidailiangdui: 10,
    zhadan: 11,
    wangzha: 12,
    error: 13
};

var Poker = {
    sort: function (pokers) {
        pokers.sort(function (prev, next) {
            return next - prev
        })
    },

    getPokerValue: function (poker) {
        if (poker == 52) {
            return 16
        }

        if (poker == 53) {
            return 17
        }

        return Math.floor(poker / 4) + 3
    },

    getPokerType: function (pokers) {
        var len = pokers.length;
        var i = 0;
        var countPoker = 0;
        var duizi = false;
        var sanzhang = false;
        var zhadan = false;
        var tempArray = [];

        if (len == 1) {
            return PokerType.danzhang
        }

        if (len == 2) {
            if (pokers[0] == 53 && pokers[1] == 52) {
                return PokeType.wangzha
            }

            if (this.getPokerValue(pokers[0]) == this.getPokerValue(pokers[1])) {
                return PokerType.duizi
            }
        }

        if (len == 3 && this.getPokerValue(pokers[0]) == this.getPokerValue(pokers[1]) && this.getPokerValue(pokers[1]) == this.getPokerValue(pokers[2])) {
            return PokerType.sanzhang;
        }

        if (len == 4) {
            var countFirstPoker = this.getPokerCount(pokers, pokers[0])
            if (countFirstPoker == 4) {
                return PokerType.zhadan
            }

            if (countFirstPoker == 3 || this.getPokerCount(pokers, pokers[1]) == 3) {
                return PokeType.sandaiyi
            }
        }

        if (len == 5) {
            sanzhang = false;
            duizi = false;
            for (i = 0; i < len; i++) {
                countPoker = this.getPokerCount(pokers, pokers[i])
                if (countPoker == 3) {
                    sanzhang = true
                }

                if (countPoker == 2) {
                    duizi = true
                }
            }

            if (sanzhang && duizi) {
                return PokerType.sandaiyidui
            }
        }

        if (len >= 5 && this.shunzi(pokers)) {
            return PokerType.shunzi;
        }

        if (len == 6) {
            if (pokers[0] == 53 && pokers[1] == 52) {
                return PokerType.error
            }

            zhadan = false;
            for (i = 0; i < len; i++) {
                if (this.getPokerCount(pokers, pokers[i]) == 4) {
                    zhadan = true
                }
            }

            if (zhadan) {
                return PokerType.sidaier
            }
        }

        if (len >= 6 && len % 2 == 0) {
            duizi = true;
            for (i = 0; i < len; i++) {
                if (this.getPokerCount(pokers, pokers[i]) != 2) {
                    duizi = false;
                    break
                }
            }

            tempArray = [];
            if (duizi) {
                for (i = 0; i < len / 2; i++) {
                    tempArray[i] = pokers[i * 2]
                }

                if (this.shunzi(tempArray)) {
                    return PokerType.liandui
                }
            }
        }

        if (len >= 6 && len % 3 == 0) { // 飞机不带
            sanzhang = true;
            for (i = 0; i < len; i++) {
                if (this.getPokerCount(pokers, pokers[i]) != 3) {
                    sanzhang = false;
                    break
                }
            }

            tempArray = [];
            if (sanzhang) {
                for (i = 0; i < len / 3; i++) {
                    tempArray[i] = pokers[i * 3]
                }

                if (this.shunzi(tempArray)) {
                    return PokerType.feiji
                }
            }
        }

        if (len == 8) {
            duizi = false;
            zhadan = false;
            for (i = 0; i < len; i++) {
                countPoker = this.getPokerCount(pokers, pokers[i]);
                if (countPoker == 2) {
                    duizi = true;
                } else if (countPoker == 4) {
                    zhadan = true;
                } else {
                    duizi = false;
                    break
                }
            }

            if (duizi && zhadan) {
                return PokerType.sidailiangdui
            }
        }

        if (len >= 8 && len % 4 == 0) {

            tempArray = [];
            for (i = 0; i < len; i++) {
                countPoker = this.getPokerCount(pokers, pokers[i]);
                if (countPoker == 3) {
                    tempArray.push(pokers[i])
                }
            }

            if (tempArray.length == len / 4 * 3 && this.getPokerType(tempArray) == PokerType.feiji) {
                return PokerType.feiji
            }
        }

        if (len >= 10 && len % 5 == 0) {
            duizi = false;

            tempArray = [];
            for (i = 0; i < len; i++) {
                countPoker = this.getPokerCount(pokers, pokers[i]);
                if (countPoker == 2) {
                    duizi = true;
                } else if (countPoker == 3) {
                    tempArray.push(pokers[i])
                } else {
                    duizi = false;
                    break
                }
            }

            if (duizi && tempArray.length == len / 5 * 3 && this.getPokerType(tempArray) == PokerType.feiji) {
                return PokerType.feiji
            }
        }

        return PokerType.error
    },

    shunzi: function (pokers) {
        var pokeValue = this.getPokerValue(pokers[0]);
        if (pokeValue >= 15) { // 2，大、小王
            return false
        }

        for (var i = 1; i < pokers.length; i++) {
            var pokeValue2 = this.getPokerValue(pokers[i]);
            if (pokeValue - pokeValue2 != 1) {
                return false
            }

            pokeValue = pokeValue2
        }

        return true
    },

    getPokerCount: function (pokers, poker) {
        var count = 0;
        for (var i = 0; i < pokers.length; i++) {
            if (this.getPokerValue(pokers[i]) == this.getPokerValue(poker)) {
                count++
            }
        }

        return count
    },
}

var pokers = [];

// 0 代表方块3 1 代表梅花3 2 代表红桃3 3 代表黑桃3
for (var i = 0; i < 54; i++) {
    pokers[i] = i
}

pokers = [0, 4, 8, 12, 16]; // 3、4、5、6、7
pokers = [0, 1, 2, 4, 5, 6]; // 333、444
pokers = [0, 1, 2, 3, 4, 5, 8, 9]; // 3333、 44、55
pokers = [0, 1, 2, 3, 4, 5, 6, 7]; // 3333、 4444
pokers = [0, 1, 2, 4, 5, 6, 8, 9]; // 333、444、55

Poker.sort(pokers);

console.log("牌型:" , Poker.getPokerType(pokers))

