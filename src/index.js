require('dotenv').config();
const CLIENTE_ID = process.env.client_id;
const CLIENTE_SECRET = process.env.client_secret;

const {TOKEN} =  require('./token');


let aa = async ()=>{
    let a = await TOKEN();
    console.log(a);
}    

aa();