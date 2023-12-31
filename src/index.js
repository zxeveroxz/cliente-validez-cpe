require('dotenv').config();
const { FechaHoraActual,FormatearFecha } = require('./util');
const RUC_LOCAL = process.env.RUC_LOCAL
const { TOKEN, VERIFICAR } = require('./token');
const { obtenerCabecerasCDP, obtenerCabecerasPolloCDP, guardarRespuesta, eliminarRespuesta, obtenerCabecerasPolloCDP_COMPROBAR } = require('./consultas.js');


let procesar = async () => {
    try {
        let to = await TOKEN();
        let rows = await obtenerCabecerasCDP(RUC_LOCAL);
        console.log("\nTotal Registros encontrados: ", rows.length);
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
                    if (RESP.data.estadoCp != null)
                        await guardarRespuesta([row.idx, row.ruc_, row.tip_ope, RESP.data.estadoCp, 0, now, null]);
                }
            }, 50 * index)
        });

        setTimeout(async () => {
            console.log(`\n\nVolviendo a buscar ${FechaHoraActual()} \n`);
            await ejecutar();
        }, (rows.length == 0 ? 30 : 15) * 1000);

    } catch (error) {
        console.log("Error de Verificacion: ", error);
        setTimeout(async () => {
            console.log("\n\nVolviendo a buscar desde el error \n");
            await ejecutar();
        }, 15 * 1000);
    }
}

//aqui biene el proceso del pollo
let procesar_pollo2 = async () => {
    try {
        let to = await TOKEN();
        let rows = await obtenerCabecerasPolloCDP(RUC_LOCAL);
        console.log("\nTotal Registros pollo encontrados: ", rows.length);
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
                    const now = FechaHoraActual()
                    if (RESP.data.estadoCp != null)
                        await guardarRespuesta([row.idx, row.ruc_, row.tip_ope, RESP.data.estadoCp, 0, now, null], '_POLLO');
                }
            }, 50 * index)
        });

        setTimeout(async () => {
            console.log(`\n\nVolviendo a buscar ${FechaHoraActual()} \n`);
            await ejecutar();
        }, (rows.length == 0 ? 30 : 15) * 1000);

    } catch (error) {
        console.log("Error de Verificacion: ", error);
        setTimeout(async () => {
            console.log("\n\nVolviendo a buscar desde el error \n");
            await ejecutar();
        }, 15 * 1000);
    }
}


let procesar_pollo = async () => {
    try {
        let to = await TOKEN();
        let rows = await obtenerCabecerasPolloCDP(RUC_LOCAL);
        console.log("\nTotal Registros encontrados: ", rows.length,"\n***************************************");

        if(rows.length==0){

            console.log("\nVamos a Comprobar CPD ya leidos anteriormente: ");
            let rowsC = await obtenerCabecerasPolloCDP_COMPROBAR(RUC_LOCAL);
            
            const guardarPromesas = rowsC.map(async (row, index) => {
                let DATOS = {
                    'numRuc': row.ruc_,
                    'codComp': row.tip_ope,
                    'numeroSerie': row.SERIE,
                    'numero': row.NUMERO,
                    'fechaEmision': FormatearFecha(row.fec_ope.toISOString()),
                    'monto': row.tot_vta
                };
    
                let RESP = await VERIFICAR(RUC_LOCAL, to.access_token, DATOS);
                //console.log("respuesta server: ",RESP.success);
                if (RESP.success == true && RESP.data.estadoCp != null) {
                    await eliminarRespuesta([row.idx, row.ruc_, row.tip_ope], '_POLLO');
                    const now = FechaHoraActual()
                    return guardarRespuesta([row.idx, row.ruc_, row.tip_ope, RESP.data.estadoCp, 0, now, null], '_POLLO');
                }
            });       
            await Promise.all(guardarPromesas); 

        }else{
            const guardarPromesas = rows.map(async (row, index) => {
                let DATOS = {
                    'numRuc': row.ruc_,
                    'codComp': row.tip_ope,
                    'numeroSerie': row.SERIE,
                    'numero': row.NUMERO,
                    'fechaEmision': FormatearFecha(row.fec_ope.toISOString()),
                    'monto': row.tot_vta
                };
    
                let RESP = await VERIFICAR(RUC_LOCAL, to.access_token, DATOS);
                //console.log("respuesta server: ",RESP.success);
                if (RESP.success == true && RESP.data.estadoCp != null) {
                    const now = FechaHoraActual()
                    return guardarRespuesta([row.idx, row.ruc_, row.tip_ope, RESP.data.estadoCp, 0, now, null], '_POLLO');
                }
            });        
            await Promise.all(guardarPromesas);
        }


       



        setTimeout(async () => {
            console.log(`\nVolviendo a buscar ${FechaHoraActual()} \n`);
            await ejecutar();
        }, (rows.length == 0 ? 30 : 5) * 1000);
    } catch (error) {
        console.log("Error de Verificacion: ", error);
        setTimeout(async () => {
            console.log("\n\nVolviendo a buscar desde el error \n");
            await ejecutar();
        }, 25 * 1000);
    }
}


async function ejecutar() {
    if (process.env.TIPO == 'POLLO') {
        console.log("Procendo Pollo")
        await procesar_pollo()
    } else {
        console.log("Procendo Normal")
        await procesar()
    }
}

ejecutar();

