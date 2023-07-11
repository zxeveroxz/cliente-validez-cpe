require('dotenv').config();
const RUC_LOCAL = process.env.RUC_LOCAL
const {TOKEN,VERIFICAR} =  require('./token');
const {obtenerCabeceras,guardarRespuesta} = require('./consultas.js');


let aa = async ()=>{
    let to = await TOKEN();
    //console.log(to.access_token);

    let rows = await obtenerCabeceras('20522094120');

    rows.map(async (row,index)=>{
        let DATOS = {
                    'numRuc':row.ruc_,
                    'codComp':row.tip_ope,
                    'numeroSerie':row.SERIE,
                    'numero':row.NUMERO,
                    'fechaEmision':row.fec_ope,
                    'monto':row.tot_vta
                    };
                
        setTimeout(async () => {                        
            let RESP = await VERIFICAR(RUC_LOCAL,to.access_token,DATOS);
            if(RESP.success==true) {
                const fecha = new Date(); // Obtén la fecha actual de JavaScript            
                const now = fecha.toISOString().slice(0, 19).replace('T', ' ');
                await guardarRespuesta([row.idx,row.ruc_,row.tip_ope,RESP.data.estadoCp,null,now,null]);
            }
          }, 250*index )
    });


    setTimeout(async() => {
        console.log("Volviendo a buscar ");
        await aa();
    }, 90*1000);

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