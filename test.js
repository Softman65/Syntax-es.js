const semantic = require('./index.js')

const _syntax = new semantic()

console.log(JSON.stringify(_syntax.analisis('Es sencillo hacer que las cosas sean complicadas, pero difícil hacer que sean sencillas.').morfologico(),null,2) )
