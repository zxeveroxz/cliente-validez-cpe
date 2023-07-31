require('dotenv').config();
const axios = require('axios');
const fs = require('fs');

const CLIENTE_ID = process.env.client_id;
const CLIENTE_SECRET = process.env.client_secret;
const CLIENTE_RUC = process.env.client_RUC; //+ Date.now();
const RUTA_TOKEN = `TOKEN/${CLIENTE_RUC}.json`;


function changeTimeZone(date, timeZone = 'America/Lima') {
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

function cambiarZonaHora(date, timeZone = 'America/Lima') {
    //console.log(Date.now());
    const fecha = date.toLocaleString('es-ES', 'America/Lima').split(",");
    return { fecha: fecha[0], hora: fecha[1].trim() };
}

async function crearArchivo(pathToFile, contenido) {
    try {
        await fs.promises.writeFile(pathToFile, contenido);
        console.log('El archivo se ha creado correctamente.');
        return true;
    } catch (error) {
        console.error('Error al crear el archivo:', error);
        return false;
    }
}

async function borrarArchivo(pathToFile) {
    try {
        await fs.promises.unlink(pathToFile);
        console.log('El archivo se ha borrado correctamente.');
        return true;
    } catch (error) {
        console.error('Error al borrar el archivo:', error);
        return false;
    }
}

function calcularTiempoSegundos(fecha, ahora = '') {
    if (ahora === '')
        ahora = Date.now();
    //console.log((ahora - fecha) / 1000);
    return parseInt((ahora - fecha) / 1000);
}

async function TOKEN_VALIDO() {
    if (fs.existsSync(RUTA_TOKEN)) {
        let info = fs.statSync(RUTA_TOKEN);
        if (calcularTiempoSegundos(info.birthtimeMs) < 2900) {
            console.log("token valido ");
            return true
        } else {
            console.log("token NOOOOOO valido ");
            return false;
        }
    }
}

async function TOKEN() {

    if (fs.existsSync(RUTA_TOKEN)) {
        let estado = await TOKEN_VALIDO();
        if (estado) {
            let rawdata = fs.readFileSync(RUTA_TOKEN);
            let data = JSON.parse(rawdata);
            return data;
        } else {
            if (borrarArchivo(RUTA_TOKEN)) {
                return await CREAR_TOKEN();
            }
            return null;
        }

    } else {
        let r = await CREAR_TOKEN();
        return r
    }
}


async function CREAR_TOKEN() {

    let r = null

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
            if (crearArchivo(RUTA_TOKEN, JSON.stringify(response.data)))
                return response.data;
            else
                return null;
        })
        .finally(function () {
            return r
        })
        .catch(function (error) {
            return null
        });

    return f;
}




async function VERIFICAR(RUC_LOCAL,TOKEN,DATOS) {

    try {
        const url = `https://api.sunat.gob.pe/v1/contribuyente/contribuyentes/${RUC_LOCAL}/validarcomprobante`;
        const token = TOKEN;

        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        const respuesta = await axios.post(url, DATOS, {
            headers: headers
        });

        //console.log(respuesta.data);
        return respuesta.data;
    } catch (error) {       
        return null;
        console.error('Error al hacer la solicitud:', error.message);
    }

}



module.exports = { TOKEN,VERIFICAR }


