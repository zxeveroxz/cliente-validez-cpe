require('dotenv').config();
const axios = require('axios');
const fs = require('fs');

const CLIENTE_ID = process.env.client_id;
const CLIENTE_SECRET = process.env.client_secret;


const options = {
    method: 'POST',
    url: `https://api-seguridad.sunat.gob.pe/v1/clientesextranet/${CLIENTE_ID}/oauth2/token/`,
    params: {
        "grant_type": "client_credentials",
        "scope": "https://api.sunat.gob.pe/v1/contribuyente/contribuyentes",
        "client_id": CLIENTE_ID,
        "client_secret": CLIENTE_SECRET
    },
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    data: [],
};


axios
    .request(options)
    .then(function (response) {
        let token = JSON.stringify(response.data);
        //console.log(response.data);

        try {
            fs.writeFileSync("TOKEN/token.json",token);
        } catch (error) {
            console.error('Error al Guardar el Toekn ',error);
        }
    })
    .catch(function (error) {
        console.error(error);
    });