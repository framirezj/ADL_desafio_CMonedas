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

//Variables
const API_URL = "https://mindicador.cl/api/";
const metadatos = ["version", "autor", "fecha"];
const selectIndicadores = document.querySelector("#indicadores");
const botonCalcular = document.querySelector("#calcular");
const cantidadCLP = document.querySelector("#cantidad");
const resultado = document.querySelector("#resultado");

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
    .filter(
      (indicador) =>
        !metadatos.includes(indicador) &&
        data[indicador].unidad_medida !== "Porcentaje"
    )
    .map((indicador) => ({
      nombre: data[indicador].nombre,
      valor: data[indicador].valor,
      unidad: data[indicador].unidad_medida,
    }));
  //const indicadores = Object.keys(data).filter( indicador => console.log(data[indicador].valor));

  console.log("indicadores", indicadores);
  return indicadores;
};

//Funcion para poner el listado de indicadores
const listadoIndicadores = async () => {
  const indicadores = await getIndicadores();

  let template = "";
  for (const indicador of indicadores) {
    template += `
        <option value="${indicador.valor}">${indicador.nombre}</option>
    `;
  }

  selectIndicadores.innerHTML = template;
};

//Funcion al momento de apretar el boton para obtener el resultado
botonCalcular.addEventListener("click", async () => {
  //obtener la lista de indicadores y el valor del dolar observado
  const valorDolar = (await getIndicadores()).find(
    (indicador) => indicador.nombre === "Dólar observado"
  ).valor;

  const opcionSeleccionada =
    selectIndicadores.options[selectIndicadores.selectedIndex];

  if (opcionSeleccionada.textContent === "Bitcoin") {
    const dolaresCLP = cantidadCLP.value / valorDolar;

    const bitcoinCLP = dolaresCLP / selectIndicadores.value;
    resultado.innerHTML = Math.trunc(bitcoinCLP * 1000000) / 1000000;
  } else {
    resultado.innerHTML =
      Math.trunc((cantidadCLP.value / selectIndicadores.value) * 100) / 100;
  }
});

//llamadas
getIndicadores();
listadoIndicadores();
