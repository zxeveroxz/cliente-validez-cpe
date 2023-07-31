const { parseISO, format } = require('date-fns');

function FechaHoraActual() {
  const fecha = new Date();

  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, '0');
  const day = String(fecha.getDate()).padStart(2, '0');

  const hours = String(fecha.getHours()).padStart(2, '0');
  const minutes = String(fecha.getMinutes()).padStart(2, '0');
  const seconds = String(fecha.getSeconds()).padStart(2, '0');

  const fechaFormateada = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

  return fechaFormateada;
}

//const fechaHoraActual = FechaHoraActual();
//console.log(fechaHoraActual.fecha);

function FormatearFecha(fecha) {
  const fecha_ = parseISO(fecha.toString());
  const fechaFormateada = format(fecha_, 'd/MM/yyyy');
  return fechaFormateada;
}

module.exports = { FechaHoraActual, FormatearFecha }