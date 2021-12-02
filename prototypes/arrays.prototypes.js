module.exports = function (lang, _) {

    const _exploraInto = function (array, _arr, _wp, _e, _p) {
        var _ret = []
        var _objs = {}
        for (let _n = 1; _n < _arr.length; _n++) {
            for (let n = _wp + 1; n < array.length; n++) {
                if (_arr[_n].split(' ').length == 1) {
                    if (array[n] == _arr[_n]) {
                        _objs[_e[_p]] = n
                        _ret.push(_objs)
                    }
                } else {
                    debugger
                }
            }
        }
        return _r
    }
    const _posWordString = function (_nx, array, _string) {
        var _rt = []
        var ok = true

        _.each(_string.split(' '), function (_word, _pos) {
            if (array[_nx + _pos] == _word) {
                _rt.push(_nx + _pos)
            } else {
                ok = false
            }
        })
        return ok ? _rt : null

    }

    Array.prototype.vocales = function () {
        var vocales = {}
        _.each(this, function (w, i) {
            var _v = []
            var _c = []
            _.each(w, function (e, i) {
                console.log(e, i)
                var _vv = {}
                var _cc = {}
                _vv[e] = e.isVocal(0)
                _cc[e] = !e.isVocal(0)
                _v.push(_vv)
                _c.push(_cc)
            })
            vocales[w] = { vocales: _v , consonantes:_c}
        })
        return vocales
    }

    Array.prototype.toMap = function (array) {
        const _ret = []
        _.each(_.keys(array), function (_e) {
            _.each(_.keys(array[_e]), function (_v) {
                var _r = {}
                _r[_e + '_' + _v] = array[_e][_v]
                _ret.push(_r)
            })
        })
        return _ret

    }
    Array.prototype.into = function (array, type, func) {

        const _r = []


        _.each(this, function (_o, _p) {
            const _e = _.keys(_o)
            _.each(_o[_e], function (_arr) {
                _.each(array, function (word,_wp) {
                    if ( word == (_.isArray(_arr) ? _arr[0] : _arr.split(' ')[0]) ) {
                        const _obj = {}
                        _obj[_e[0]] = _wp

                        if (_.isArray(_arr)) {
                            var _ret = _exploraInto(array, _arr, _wp, _e, _p)
                            if (_ret.length > 0)
                                _r.push(_obj)
                                _.each(_ret, function (_v) {
                                    _r.push(_v)
                                })
                        } else {
                            if (_arr.split(' ').length == 1) {
                                _r.push(_obj)
                            } else {
                                var _ex = null
                                var _nx = _wp
                                while (_nx < array.length) {
                                    _ex = _posWordString(_nx, array, _arr)
                                    _nx = _ex?array.length:_nx+1    
                                }
                                _.each(_ex, function (v) {
                                    _obj[_e[0]] = v
                                    _r.push(_obj)
                                })

                            }
                        }
                    } 

                })
            })
        })
        //debugger
        var _ret = []
        _.each(array, function (_v) {
            _ret.push(null)
        })
        _.each(_r, function (_v) {
            const _n = _.keys(_v)
            const _p = _v[_n[0]]
            if (!_ret[_p]) {
                const _obj = {}
                _obj[array[_p]] = func[type](array[_p], { type: type, mode: _n[0] })
                _ret[_p] = _obj
            }
        })
        _.each(_ret, function (_w, _p) {
            if(!_w)
                _ret[_p] = array[_p]
        })
        return _ret
    }

    Array.prototype.haveString = function (pos, string) {
        const _t = string.split(' ')
        const _r = []
        const _ret = -1
        _.each(_t, function (e, p) {
            for (let n = pos + 1; n++; n < this.length) {
                if (this[n] == e) {
                    _r.push( n )
                }
            }
        })
        return _r.length == _t.length ? _r : null
    }
    Array.prototype.populatePos = function (words, pos, func, objPush) {
        var _this = this
        _.each(pos, function ( _p ) {
            if (!_this[_p])
                _this[_p] = func(words[pos],objPush)
        })
        return _this
    }

}