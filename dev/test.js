const Blockchain = require('./blockchain');

const bitcoin = new Blockchain();

bitcoin.createNewBlock(7618, 'hvajdad58a4s6', 'ajsvda468646')

bitcoin.createNewTransaction(500, '123', '345')
bitcoin.createNewTransaction(1500, '123', '345')
bitcoin.createNewTransaction(5200, '123', '345')

bitcoin.createNewBlock(5615, 'aj53dad58a4s6', 'hvajdad58a4s6')

bitcoin.createNewTransaction(1000, '123', '345')

bitcoin.createNewBlock(5646, 'aj53dad5a8a4s6', 'aj53dad58a4s6')
bitcoin.createNewTransaction(1210, '123', '345')


console.log(JSON.stringify(bitcoin))