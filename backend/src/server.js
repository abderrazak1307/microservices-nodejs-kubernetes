const express = require('express')
const http = require('http')
const mysql = require('mysql2/promise');
const os = require('os')
const app = express()
const server = http.createServer(app);
const port = 8080

//TODO: replace this later with sequelize if needed
const db = mysql.createPool({
    host: 'database', // service name is used here with built-in kubernetes dns service
    user: 'root',
    password: 'root',
    database: 'forza',
    connectionLimit: 10,
    supportBigNumbers: true
});
console.log('[SERVER] Database connection established...');

// Handle SIGTERM & SIGINT for graceful exit
process.on('SIGTERM', (_)=>gracefulExit());
process.on('SIGINT', (_)=>gracefulExit());

gracefulExit = () => {
    server.close(() => {
        console.log('Server closed.');
        process.exit(0);
    });
}


// routes
app.get('/', (req, res) => {
    res.send(os.networkInterfaces())
})
app.get('/wilayas', async (req, res) => {
    try{
        let [data, _] = await db.query('SELECT * FROM `wilayas`');
        res.json(data);
    }catch(e){
        res.send(e)
    }
})
app.get('/wilayas/:wilaya', async (req, res) => {
    try{
        let [data, _] =await db.query("SELECT * FROM `wilayas` WHERE `code`='" + req.params.wilaya +"'");
        res.json(data);
    }catch (e) {
        res.send(e)
    }
})

server.listen(port, () => {
    console.log(`Backend listening on port ${port}`)
})