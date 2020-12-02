const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));

const uuid = require('uuid');
const nodeAddress = uuid.v1().split('-').join('');
console.log("Node address", nodeAddress);
const Blockchain = require('./blockchain');

const bitcoin = new Blockchain();

app.get('/blockchain', (req, res) => {
    res.send(bitcoin);
});

app.post('/transaction', (req, res) => {
    const blockIndex = bitcoin.createNewTransaction(req.body.amount, req.body.sender, req.body.reciever);
    res.json({
        note: `Transaction will be added to Block ${blockIndex}`
    });
});

app.get('/mine', (req, res) => {
    const lastBlock = bitcoin.getLastBlock();
    const previousBlockHash = lastBlock['hash'];
    const currentBlockData = {
        transaction: bitcoin.pendingTransactions,
        index: lastBlock['index']
    };
    const nonce = bitcoin.proofOfWork(previousBlockHash, currentBlockData);
    const blockHash = bitcoin.hashBlock(previousBlockHash, currentBlockData, nonce);

    bitcoin.createNewTransaction(12.5, "00", nodeAddress);

    const newBlock = bitcoin.createNewBlock(nonce, previousBlockHash, blockHash);
    res.json({
        note: 'New block mined succeffully',
        block: newBlock
    });

});

app.listen(3000, function () {
    console.log("Listeng on 3000...")
});