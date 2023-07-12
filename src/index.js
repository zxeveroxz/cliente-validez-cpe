require('dotenv').config();
const RUC_LOCAL = process.env.RUC_LOCAL
const { TOKEN, VERIFICAR } = require('./token');
const { obtenerCabeceras, guardarRespuesta } = require('./consultas.js');


let aa = async () => {
    try {
        let to = await TOKEN();
        //console.log(to.access_token);
        let rows = await obtenerCabeceras('20522094120');

        await rows.map(async (row, index) => {
            let DATOS = {
                'numRuc': row.ruc_,
                'codComp': row.tip_ope,
                'numeroSerie': row.SERIE,
                'numero': row.NUMERO,
                'fechaEmision': row.fec_ope,
                'monto': row.tot_vta
            };

            setTimeout(async () => {
                let RESP = await VERIFICAR(RUC_LOCAL, to.access_token, DATOS);
                if (RESP.success == true) {
                    const fecha = new Date(); // Obtén la fecha actual de JavaScript            
                    const now = fecha.toISOString().slice(0, 19).replace('T', ' ');
                    //console.log(now);
                    if (RESP.data.estadoCp != null)
                        await guardarRespuesta([row.idx, row.ruc_, row.tip_ope, RESP.data.estadoCp, 0, now, null]);
                }



            }, 50 * index)
        });


        setTimeout(async () => {
            console.log("\n\nVolviendo a buscar \n");
            await aa();
        }, 30 * 1000);


    } catch (error) {
        console.log("Error de Verificacion: ", error);

        setTimeout(async () => {
            console.log("\n\nVolviendo a buscar desde el error \n");
            await aa();
        }, 10 * 1000);
    }


}

aa();