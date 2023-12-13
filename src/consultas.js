//const {FechaHoraActual} = require('./util');
const pool = require('./db');

async function obtenerCabecerasCDP(RUC) {
    try {
        const connection = await pool.getConnection();
        const query = ` SELECT 
                            CDP.idx,CDP.ruc_,CDP.tip_ope,CONCAT(CDP.DOCUMENTO,ALM.serie) as SERIE, 
                            CDP.NUMERO, 
                            CDP.tot_vta, 
                            DATE_FORMAT(fec_ope, '%d/%m/%Y') as fec_ope  
                         FROM (
                            SELECT 
                                A.idx, A.ruc_, A.tip_ope, A.ANEXO, A.DOCUMENTO, A.NUMERO, A.fec_ope , A.tot_vta  
                            FROM tbl2_CDP_cab A
                            LEFT JOIN tbl2_validez_sunat C ON A.idx = C.idx
                            WHERE 
                                C.idx IS NULL AND A.ruc_='${RUC}' AND A.tip_ope in ('01','03') AND A.usu_del is null AND YEAR(A.fecha)>=2023 
                        UNION
                            SELECT 
                                B.idx, B.ruc_, B.tip_ope, B.ANEXO, B.DOCUMENTO, B.NUMERO, B.fec_ope , B.tot_vta 
                            FROM tbl2_NCD_cab B
                            LEFT JOIN tbl2_validez_sunat C ON B.idx = C.idx
                            WHERE 
                                C.idx IS NULL AND B.ruc_='${RUC}' AND B.tip_ope in ('07','08') AND B.usu_del is null AND YEAR(B.fecha)>=2023 
                        ) AS CDP
                         INNER JOIN tbl2_almacen ALM ON CDP.ANEXO=ALM.idx
                         LIMIT 150

                         
                    `;        
        const [rows, fields] = await connection.query(query);
        //console.log(rows);
        connection.release();
        return rows;        
    } catch (error) {
        console.error('Error al realizar la consulta:', error);
        return false;
    }
}


async function guardarRespuesta(DATA,TABLA=''){    
    try {
        const connection = await pool.getConnection();
        await connection.query(`insert into tbl2_validez_sunat${TABLA} (idx, ruc_, tip_ope, estado,anulado,fecha_consulta,detalles) values (?,?,?,?,?,?,?)`,DATA);
        console.log("Guardando archivo registrado RUC: ", DATA[1],' IDX: ',DATA[0],' Sunat:',DATA[3]);
        connection.release();
    } catch (error) {
        console.error('Error al realizar la consulta:', error);
        
    }
}

async function eliminarRespuesta(DATA,TABLA=''){    
    try {
        const connection = await pool.getConnection();
        await connection.query(`delete from tbl2_validez_sunat${TABLA} where idx=? and ruc_=? and tip_ope=?`,DATA);
        console.log("Archivo eliminado RUC: ", DATA[1],' IDX: ',DATA[0],' Tipo:',DATA[2]);
        connection.release();
    } catch (error) {
        console.error('Error al realizar la eliminacion:', error);
        
    }
}



async function obtenerCabecerasPolloCDP(RUC) {
    try {
        const connection = await pool.getConnection();
        const query = ` 
                        SELECT 
                        CDP.idx, CDP.ruc_, CDP.tip_ope, CDP.SERIE, CDP.NUMERO, CDP.total as tot_vta, fec_ope  
                        FROM (
                                    SELECT 
                                        A.idx, A.ruc_, A.tip_ope,  A.SERIE, A.NUMERO, A.fec_ope , A.total  
                                                FROM TTBL_CAB_VILLA A
                                                LEFT JOIN tbl2_validez_sunat_POLLO C ON A.idx = C.idx
                                                WHERE 
                                                    C.idx IS NULL AND A.ruc_='${RUC}' AND A.tip_ope in ('01','03') AND  A.fec_ope>='2023-01-01 00:00:00'
                                UNION                               
                    
                                    SELECT 
                                        B.idx, B.ruc_, B.tip_ope, B.SERIE, B.NUMERO, B.fec_ope, B.total  
                                                FROM TTBL_CAB_VILLA_NC B
                                                LEFT JOIN tbl2_validez_sunat_POLLO C ON B.idx = C.idx
                                                WHERE 
                                                    C.idx IS NULL AND B.ruc_='${RUC}' AND B.tip_ope in ('07','08') AND B.fec_ope>='2023-01-01 00:00:00'
                            ) AS CDP 
                                ORDER BY CDP.idx DESC     
                                LIMIT 300
                         
                    `;        
        const [rows, fields] = await connection.query(query);        
        connection.release();
        return rows;        
    } catch (error) {
        console.error('Error al realizar la consulta:', error);
        return false;
    }
}

async function obtenerCabecerasPolloCDP_COMPROBAR(RUC) {
    try {
        const connection = await pool.getConnection();
        const query = ` 
                        SELECT 
                        CDP.idx, CDP.ruc_, CDP.tip_ope, CDP.SERIE, CDP.NUMERO, CDP.total as tot_vta, fec_ope  
                        FROM (
                                SELECT 
                                    A.idx, A.ruc_, A.tip_ope, A.SERIE, A.NUMERO, A.fec_ope , A.total 
                                    FROM tbl2_validez_sunat_POLLO as v 
                                    INNER JOIN TTBL_CAB_VILLA A ON v.idx=A.idx and v.ruc_='${RUC}' 
                                    WHERE 
                                        v.estado = 0 and v.tip_ope in('01','03') and v.fecha_consulta <= DATE_SUB(NOW(), INTERVAL 2 HOUR)  
                                        AND A.total > 0  AND A.fec_original >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)
                            UNION                               
                    
                                SELECT 
                                    B.idx, B.ruc_, B.tip_ope, B.SERIE, B.NUMERO, B.fec_ope , B.total 
                                    FROM tbl2_validez_sunat_POLLO as v 
                                    INNER JOIN TTBL_CAB_VILLA_NC B ON v.idx=B.idx and v.ruc_='${RUC}' 
                                    WHERE 
                                        v.estado = 0 and v.tip_ope in('07','08') and v.fecha_consulta <= DATE_SUB(NOW(), INTERVAL 2 HOUR)
                                            AND B.total > 0 AND B.fec_original >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)

                            ) AS CDP 
                                ORDER BY CDP.idx DESC     
                                LIMIT 300
                         
                    `;        
        const [rows, fields] = await connection.query(query);        
        connection.release();
        return rows;        
    } catch (error) {
        console.error('Error al realizar la consulta:', error);
        return false;
    }
}



module.exports = { obtenerCabecerasCDP, obtenerCabecerasPolloCDP,guardarRespuesta, eliminarRespuesta, obtenerCabecerasPolloCDP_COMPROBAR }