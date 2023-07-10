require('dotenv').config();
const axios = require('axios');
const { error, log } = require('console');
const fs = require('fs');
const { resolve } = require('path');

const CLIENTE_ID = process.env.client_id;
const CLIENTE_SECRET = process.env.client_secret;
const CLIENTE_RUC = process.env.client_RUC; //+ Date.now();
const RUTA_TOKEN = `TOKEN/${CLIENTE_RUC}.json`;


function changeTimeZone(date, timeZone='America/Lima') {
    if (typeof date === 'string') {
      return new Date(
        new Date(date).toLocaleString('es-ES', {
          timeZone,
        }),
      );
    }
  
    return new Date(
      date.toLocaleString('es-PE', {
        timeZone,
      }),
    );
  }

function cambiarZonaHora(date, timeZone='America/Lima') {     
        console.log(Date.now());    
        const fecha = date.toLocaleString('es-ES', 'America/Lima').split(",");        
        return {fecha:fecha[0],hora:fecha[1].trim()};
    } 

function calcularTiempoSegundos(fecha,ahora=''){
    if(ahora==='')
        ahora = Date.now(); 
    return parseInt((ahora-fecha)/1000);
}

async function TOKEN_VALIDO(){
    if (fs.existsSync(RUTA_TOKEN)) {        
        let info =  fs.statSync(RUTA_TOKEN);        
        if(calcularTiempoSegundos(info.birthtimeMs)<2900){
            return true
        }else{
            return false;
        }
        
    }
}

async function TOKEN(){

    if (fs.existsSync(RUTA_TOKEN)) {        
        
        if(TOKEN_VALIDO()){
            let rawdata = fs.readFileSync(RUTA_TOKEN);
            let data = JSON.parse(rawdata);
            data.error=false;
            return data;
        }else{
            await fs.removeSync(RUTA_TOKEN);
            return await CREAR_TOKEN();        
        }
        
    }else{
        return await CREAR_TOKEN();        
    }
}


async function CREAR_TOKEN() {

    let r = { 'error': true, 'token':null};

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

   let f = await axios
        .request(options)
        .then(function (response) {
            try {
                fs.writeFileSync(RUTA_TOKEN, JSON.stringify(response.data));
                r.error = false;         
                r.token = response.data;       
                return r
            } catch (error) {
                console.error('Error al Guardar el Toekn ', error);
                r.mensaje = error;
                return r
            }
        })
        .finally(function (){           
            return r     
        })
        .catch(function (error) {
            
            r.mensaje = error;
            return r
        });        
       return f;
}


module.exports = { TOKEN }


