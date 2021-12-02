const semantic = require('./index.js')

const _syntax = new semantic('es')

console.log(_syntax.analisis('me pones 30 docenas de churritos fritos').morfologico() )
