module.exports = function (lang,extendArrays) {

    const _ = require('lodash')
    const { StemmerEs, StopwordsEs, TokenizerEs, NormalizerEs } = require('@nlpjs/lang-es');

    if (extendArrays)
        require('./arrays.prototypes.js')(lang,_);

    const back = function () {

        if (lang == 'es') {
            return {
                normalizer: new NormalizerEs(),
                tokenizer: new TokenizerEs,
                stopwords: new StopwordsEs(),
                stemmer: new StemmerEs()
            }
        } else {
            return null
        }
    }

    String.prototype.normalizer = function () {
        const { normalizer } = back(lang)
        const cadena = this.toString()
        const exit =  normalizer.normalize(cadena)
        return exit
    }
    String.prototype.tokenize = function() {
        const { tokenizer } = back(lang)
        return tokenizer.tokenize(this.toString())
    }
    String.prototype.stem = function () {
        const { stemmer } = back(lang)
        return stemmer.stem(this.tokenize(lang))
    }
    String.prototype.stopwords = function () {
        const { stopwords } = back(lang)
        return stopwords.removeStopwords(this.tokenize(lang))
    }

    String.prototype.morfologia = function (sintaxis, options) {

        const _opt = options ? options : { sustantivo: true, articulo: true, pronombre: true, preposicion: true, adjetivo: true, verbo: true, adverbio: true }

        const _previus = function (_m, i, _typeArray) {
            const t = _.isObject(_m[i - 1]) ? _.keys(_m[i - 1]) : []
            return t.length > 0 && _typeArray.indexOf(_m[i - 1][t[0]].type)>-1 
        }

        var _m = sintaxis.words().conjuncion(this.normalize().tokenize())

        _.each(_m, function (e, i) {
            if (_.isString(e)) {
                var _obj = {}
                var map = {
                    articulo: _opt.articulo ? sintaxis.words().articulo(e):null,
                    pronombre: _opt.pronombre ? sintaxis.words().pronombre(e) : null,
                    preposicion: _opt.preposicion ? sintaxis.words().preposicion(e) : null,
                    adjetivo: _opt.adjetivo ? sintaxis.words().adjetivo(e) : null, //,
                    verbo: _opt.verbo ? sintaxis.words().verbo(e) : null,
                    adverbio: _opt.adverbio ? sintaxis.words().adverbio(e) : null
                }
                //analizamos los resultados
                _.each(map, function (content) {
                    if (content && !_obj[e]) {
                        if (_obj[e] && !_.isArray(_obj[e])) {
                            _obj[e] = [_obj[e]]
                        } else {
                            if (_obj[e]) {
                                _obj[e].push(content)
                            } else {
                                _obj[e] = content
                            }
                            
                        }
                        
                    }
                })



                if (_obj[e]) {
                    _m[i] = _obj
                } else {
                    if (_.keys(_obj).length==0 && _m.length > 1 && _opt.sustantivo) {
                        const t = _.isObject(_m[i - 1])?_.keys(_m[i - 1]):[]
                        if ( _previus(_m, i,[ "articulo" ]) ) {
                            _obj[e] = sintaxis.words().sustantivo(e)
                            _m[i] = _obj
                        }
                    }

                }
            }

        })

        _.each(_m, function (objWord, pos) {
            if (_.isString(objWord)) {
                if (objWord.isNumeral()) {
                    _m[pos] = { type: number, value: objWord.numeral() }
                } else {
                    var _obj = {}
                    if (_previus(_m, pos, ["adjetivo","preposicion"])) {                        
                        _obj[objWord] = sintaxis.words().sustantivo(objWord)
                        _m[pos] = _obj
                    }
                    if (_previus(_m, pos, ["sustantivo"])) {
                        _obj[objWord] = { type: 'adjetivo', mode: 'descriptivo' }
                        _m[pos] = _obj
                    }
                }
            }
        })
        return _m
    }



    String.prototype.silabas = function () {
        var silabas = []
        _.each(this.tokenize(lang), function (e) {
            silabas.push(e.comienzaConVocal())
        })
        return silabas
    }

    String.prototype.comienzaConVocal = function () {
        return this.toString().isVocal(0);
    }
    String.prototype.comienzaConConsonante = function () {
        return this.toString().isConsonante(0);
    }
    String.prototype.isVocal = function (n) {
        return !this.toString().isConsonante(n)
    }
    String.prototype.isConsonante = function (n) {
        return ["a", "e", "i", "o", "u"].indexOf(this.toString().toLowerCase().charAt(n)) === -1
    }
    String.prototype.isVerbo = function (verbo) {
        const _word = this.toString()
        const _test = function (word, raiz, sufijo, tiempo, _resp, n) {
            if (word == sufijo.replace('*', raiz)) {
                if (!_resp)
                    _resp = []
                _resp.push(!_.isNumber(n) ? { tiempo: tiempo } : { tiempo: tiempo, persona: n < 3 ? n + 1 : (n - 3) + 1, numero:n<3?'singular':'plural' })
            }
            return _resp
        }
        var _resp = null
        _.each(verbo.tiempos, function (sufijos, tiempo ) {
            if (!_.isArray(sufijos)) {
                _resp = _test(_word, verbo.raiz, sufijos, tiempo, _resp)
            } else {
                _.each(sufijos, function (sufijo, n ) {
                    _resp = _test(_word, verbo.raiz, sufijo, tiempo, _resp, n)
                })
            }
        })
        return _resp
    }

    String.prototype.firstLetter = function (capitalize) {
        return capitalize ? this.substr(0, 1).toUpperCase() : this.substr(0, 1).toLowerCase()
    }
    String.prototype.isNumeral = function () {
        return false
    }
    String.prototype.numeral = function () {
        return 0
    }
}