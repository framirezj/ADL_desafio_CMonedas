/*
Requerimientos
1. Se obtienen los tipos de cambio desde mindicador.cl (1 punto).
2. Se calcula correctamente el cambio y se muestra en el DOM (3 puntos).
3. El select implementa más de un tipo de moneda (con 2 es suficiente), todos los
cambios funcionan correctamente (3 puntos).
4. Se usa try catch para ejecutar el método fetch y capturar los posibles errores
mostrando el error en el DOM en caso de que haya problemas (2 puntos).
Tip: Recuerda que la guía de APIs hay un capítulo asociado a “Sentencias Try y
Catch”
5. Se Implementa el gráfico pedido (1 punto).
Tip: En la guía de APIs hay un capítulo asociado a “Plugins de JavaScript (Chart Js)”.
Utiliza esto como referencia para generar el gráfico.
*/

//obtener los datos desde la api
const API_URL = "https://mindicador.cl/api/";
const metadatos = ["version", "autor", "fecha"];

//Funcion para obtener los datos de la API
const getDatos = async (url) => {
  try {
    const response = await fetch(url);
    const datos = await response.json();
    return datos;
  } catch (error) {
    console.log(error.message);
  }
};

//Funcion para obtener un nuevo array con los indicadores, valores, unidad de medida.
const getIndicadores = async () => {
  
    
  const data = await getDatos(API_URL);

  //obtener array de indicadores
  const indicadores = Object.keys(data)
    .filter((indicador) => !metadatos.includes(indicador))
    .map((indicador) => ({
      nombre: data[indicador].nombre,
      valor: data[indicador].valor,
      unidad: data[indicador].unidad_medida
    }));
  //const indicadores = Object.keys(data).filter( indicador => console.log(data[indicador].valor));

    console.log("indicadores", indicadores)
    return indicadores

};

getIndicadores();

