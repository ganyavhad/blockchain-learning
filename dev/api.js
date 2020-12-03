const express = require('express');
const app = express();
app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));
const rp = require('request-promise');
const uuid = require('uuid');
const port = process.argv[2];
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

// register a node and broadcast it the netork
app.post('/register-and-broadcast-node', (req, res) => {
    const newNodeUrl = req.body.newNodeUrl;
    if (bitcoin.netWorksNodes.indexOf(newNodeUrl) == -1) bitcoin.netWorksNodes.push(newNodeUrl)
    const regNodesPromises = [];
    bitcoin.netWorksNodes.forEach(networkNodeUrl => {
        const requestOption = {
            uri: networkNodeUrl + '/register-node',
            method: 'POST',
            body: {
                newNodeUrl: newNodeUrl
            },
            json: true
        };
        regNodesPromises.push(rp(requestOption));
    });
    Promise.all(regNodesPromises)
        .then(data => {
            const bulkRegistrationOption = {
                uri: newNodeUrl + '/register-nodes-bulk',
                method: 'POST',
                body: {
                    allNetworkNodes: [...bitcoin.netWorksNodes, bitcoin.currentNodeUrl]
                },
                json: true
            };
            return rp(bulkRegistrationOption)
        })
        .then(data => {
            res.json({
                note: 'New node registered with netowrk successfully'
            })
        })
        .catch(err => {
            console.log("error", err)
        });
})

/// register a node with network
app.post('/register-node', (req, res) => {
    const newNodeUrl = req.body.newNodeUrl;
    const nodeNotAlreadyPresent = bitcoin.netWorksNodes.indexOf(newNodeUrl) == -1;
    const notCurrentNode = bitcoin.currentNodeUrl !== newNodeUrl;
    if (nodeNotAlreadyPresent && notCurrentNode) bitcoin.netWorksNodes.push(newNodeUrl);
    res.json({
        note: 'New node registerd successfully'
    })
})

// register multiple nodes at once
app.post('/register-nodes-bulk', (req, res) => {
    const allNetworkNodes = req.body.allNetworkNodes;
    allNetworkNodes.forEach(networkNodeUrl => {
        const nodeNotAlreadyPresent = bitcoin.netWorksNodes.indexOf(networkNodeUrl) == -1;
        const notCurrentNode = bitcoin.currentNodeUrl !== networkNodeUrl;
        if (nodeNotAlreadyPresent && notCurrentNode) bitcoin.netWorksNodes.push(networkNodeUrl);
    })
    res.json({
        note: 'Bulk node registerd successfully'
    })
})


app.listen(port, function () {
    console.log(`Listeng on ${port}...`)
});