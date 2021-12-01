
require('./prototypes/string.prototypes.js')(true);
const _ = require('lodash')
const fs = require('fs')
const path = require('path')
const { StemmerEs, StopwordsEs, TokenizerEs, NormalizerEs } = require('@nlpjs/lang-es');

class Sintaxis {

    constructor(lang) {
         var letras = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'X', 'Y', 'Z']
        //const langdetect = require('langdetect');

        this.lang = lang
        this.articulos = JSON.parse(fs.readFileSync(path.resolve(__dirname, './diccionary/Articulos.json')))
        this.pronombres = JSON.parse(fs.readFileSync(path.resolve(__dirname, './diccionary/Pronombres.json')))
        this.preposiciones = JSON.parse(fs.readFileSync(path.resolve(__dirname, './diccionary/preposiciones.json')))
        this.conjunciones = JSON.parse(fs.readFileSync(path.resolve(__dirname, './diccionary/conjunciones.json')))
        this.adjetivos = {}
        this.verbos = {}

        _.each(letras, function (letra) {
            try {
                this.adjetivos[letra] = JSON.parse(fs.readFileSync(path.resolve(__dirname, './diccionary/Adjetivos/' + letra + '.json')))
            } catch (err) {

            }

            try {
                const _v = JSON.parse(fs.readFileSync(path.resolve(__dirname, './diccionary/Verbos/' + letra + '.json')))
                _.each(_v, function (verbo, word) {
                    this.verbos[verbo.raiz] = word
                })
            } catch (err) {

            }
        })
        console.log('diccionarios cargados')
    }
    analisis(text) {


        return {
            lang: this.lang,
            Original: text,
            morfologia: text.tokenize(this.lang).morfologia(this.lang, this)

        }
    }
    engines() {
        const _this = this
        return {
            es: {
                Adjetivos: function (word) {
                    var _k = null
                    if (_this.adjetivos[word.substr(0, 1).toUpperCase()])
                        _.each(_this.adjetivos[word.substr(0, 1).toUpperCase()], function (arr) {
                            if (word == arr[0])
                                _k = { type: 'adjetivo', mode: arr[1] }
                        })
                    return _k
                },
                Articulos: function (word) {
                    var _k = null
                    _.each(_this.articulos, function (content, key) {
                        _.each(content, function (content, genero) {
                            _.each(content, function (content, numero) {
                                if (word == content)
                                    _k = { type: 'articulo', mode: key, genero: genero, numero: numero }
                            })
                        })
                    })
                    return _k
                },
                Preposiciones: function (word, data) {
                    return data.indexOf(word) > -1 ? { type: 'preposicion' } : null
                },
                Pronombres: {
                    personales: function (word, data) {
                        var _k = null
                        _.each(data, function (content, numero) {
                            _.each(content, function (content, persona) {
                                _.each(content, function (content, genero) {
                                    if (word == content)
                                        _k = { type: 'pronombre', mode: 'personal', persona: persona, genero: genero, numero: numero }
                                })
                            })
                        })
                        return _k
                    },
                    demostrativos: function (word, data) {
                        var _k = null
                        _.each(data, function (content, numero) {
                            _.each(content, function (content, distancia) {
                                _.each(content, function (content, genero) {
                                    if (word == content)
                                        _k = { type: 'pronombre', mode: 'demostrativo', distancia: distancia, genero: genero, numero: numero }
                                })
                            })
                        })
                        return _k
                    },
                    posesivos: function (word, data) {
                        var _k = null
                        _.each(data, function (content, distancia) {
                            _.each(content, function (content, numero) {
                                _.each(content, function (content, persona) {
                                    _.each(content, function (content, genero) {
                                        if (word == content)
                                            _k = { type: 'pronombre', mode: 'posesivo', conjunto: distancia, genero: genero, numero: numero, persona: persona }
                                    })
                                })
                            })
                        })
                        return _k
                    },
                },
                Conjunciones: function (word, data) {
                    return { type: data.type, mode: data.mode }
                },
                Verbos: function (word) {
                    if (_this.verbos[word.stem('es')] && _this.verbos[word.stem('es')]) {
                        const letra = word.substr(0, 1).toUpperCase()
                        const verbo = JSON.parse(fs.readFileSync(path.resolve(__dirname, './diccionary/Verbos/' + letra + '.json')))[verbos[word.stem('es')]]
                        return word.isVerbo(verbo)
                    } else {
                        return null
                    }
                }

            }
        }
    }
    words() {
        const _engine = this.engines()[this.lang]
        const _this =this
        return {
            verbo: function (lang, word) {
                return _engine.Verbos(word)
            },
            adjetivo: function (lang, word) {
                return !_.isObject(word) ? _engine.Adjetivos(word) : null
            },
            articulo: function (lang, word) {
                return _engine.Articulos(word)
            },
            sustantivo: function (lang, word) {
                return { type: 'sustantivo' } //, mode: key, genero: genero, numero: numero }
            },
            pronombre: function (lang, word) {
                var k = null
                _.each(_this.pronombres, function (data, key) {
                    var _q = null
                    if (!k)
                        _q = _engine.Pronombres[key](word, data)
                    if (_q)
                        k = _q
                })
                return k
            },
            preposicion: function (lang, word) {
                return _engine.Preposiciones(word, _this.preposiciones)
            },
            conjuncion: function (lang, words) {
                return [].toMap(_this.conjunciones).into(words, 'Conjunciones', _engine )
            }
        }
    }

    back() {
        var normalizer = null;
        var tokenizer = null;
        var stopwords = null;
        var stemmer = null;

        if (lang == 'es') {
            normalizer = new NormalizerEs();
            tokenizer = new TokenizerEs();
            stopwords = new StopwordsEs();
            stemmer = new StemmerEs();
        }
        return {
            normalizer: normalizer,
            tokenizer: tokenizer,
            stopwords: stopwords,
            stemmer: stemmer
        }
    }
}

module.exports = Sintaxis