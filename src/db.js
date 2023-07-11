require('dotenv').config();
const {createPool} = require('mysql2/promise');

const pool = createPool({
    host        :process.env.MY_host,
    user        :process.env.MY_user,
    password    :process.env.MY_password,
    port        :process.env.MY_port,
    database    :process.env.MY_database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
})

module.exports=pool;

