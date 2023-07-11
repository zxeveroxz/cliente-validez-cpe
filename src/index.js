require('dotenv').config();
const RUC_LOCAL = process.env.RUC_LOCAL
const {TOKEN} =  require('./token');
const {obtenerCabeceras} = require('./consultas.js');


let aa = async ()=>{
    let a = await TOKEN();
    console.log(a);

    obtenerCabeceras('20600853563');

/*
    let r = { 'error': true, 'token':null};

    const options = {
        method: 'POST',
        url: `https://api.sunat.gob.pe/v1/contribuyente/contribuyentes/${RUC_LOCAL}/validarcomprobante`,
        params: {
            "grant_type": "client_credentials",
            "scope": "https://api.sunat.gob.pe/v1/contribuyente/contribuyentes",
            "client_id": CLIENTE_ID,
            "client_secret": CLIENTE_SECRET
        },
        headers: { 'Authorization': 'Bearer '+a.access_token },
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

*/

}    

aa();