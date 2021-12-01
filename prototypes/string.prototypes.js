module.exports = function (extendArrays) {

    const _ = require('lodash')
    const { StemmerEs, StopwordsEs, TokenizerEs, NormalizerEs } = require('@nlpjs/lang-es');

    if (extendArrays)
        require('./arrays.prototypes.js')(_);

    const back = function (lang) {

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

    String.prototype.normalizer = function (lang) {
        const { normalizer } = back(lang)
        const cadena = this.toString()
        const exit =  normalizer.normalize(cadena)
        return exit
    }

    String.prototype.tokenize = function(lang) {
        const { tokenizer } = back(lang)
        return tokenizer.tokenize(this.toString())
    }
    String.prototype.stem = function (lang) {
        const { stemmer } = back(lang)
        return stemmer.stem(this.tokenize(lang))
    }
    String.prototype.stopwords = function (lang) {
        const { stopwords } = back(lang)
        return stopwords.removeStopwords(this.tokenize(lang))
    }

    String.prototype.silabas = function (lang) {
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
}