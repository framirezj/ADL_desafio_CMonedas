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

//referencias de elementos HTML
const selectIndicadores = document.querySelector("#indicadores");
const botonCalcular = document.querySelector("#calcular");
const cantidadCLP = document.querySelector("#cantidad");
const resultado = document.querySelector("#resultado");
const items = document.querySelector("#items");

//variables para operar con la API
const API_URL = "https://mindicador.cl/api/";
const metadatos = ["version", "autor", "fecha"];
const codigos = ["uf", "dolar", "euro", "utm"]

//guardo los datos para no hacer varios llamadas a la API
let datosGlobal = [];
let indicadoresGlobal = [];

//variable para guardar la instancia del grafico
let myChart = null;

//Funcion para obtener los datos de la API
const getDatos = async (url) => {
  try {
    const response = await fetch(url);
    return (datosGlobal = await response.json());
  } catch (error) {
    console.log(error.message);
  }
};

//Funcion para obtener un nuevo array con los indicadores, valores, unidad de medida.
const getIndicadores = () => {
  //obtener array de indicadores
  return (indicadoresGlobal = Object.keys(datosGlobal)
    .filter(
      (indicador) =>
        !metadatos.includes(indicador) &&
        datosGlobal[indicador].unidad_medida !== "Porcentaje"
    )
    .map((indicador) => ({
      codigo: datosGlobal[indicador].codigo,
      nombre: datosGlobal[indicador].nombre,
      valor: datosGlobal[indicador].valor,
      unidad: datosGlobal[indicador].unidad_medida,
    })));
};

//Funcion para poner el listado de indicadores
const listadoIndicadores = () => {
  let template = "";
  for (const indicador of indicadoresGlobal) {
    template += `
        <option value="${indicador.valor}" data-codigo="${indicador.codigo}">${indicador.nombre}</option>
    `;
  }
  selectIndicadores.innerHTML = template;
};

//Funcion de calculo
botonCalcular.addEventListener("click", async () => {

  if(!cantidadCLP.value){
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Por favor, intenta de nuevo ingresando un valor válido.",
    });
    return
  }

  //obtener la lista de indicadores y el valor del dolar observado
  const valorDolar = indicadoresGlobal.find(
    (indicador) => indicador.codigo === "dolar"
  ).valor;

  //obtiene la referencia a la opción del listado
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

  //llama al grafico
  await createChart(opcionSeleccionada.dataset.codigo);
});

const banner = () => {
  console.log(indicadoresGlobal)
  let template = ""

  const indicadoresFiltro = indicadoresGlobal.filter(
    indicador => codigos.includes(indicador.codigo)
  )

  for (const indicador of indicadoresFiltro) {
    template += `
    
      <div class="item-divisa">
            <span class="precio">$${indicador.valor}</span>
            <span class="nombre">${indicador.codigo.toUpperCase()}</span>
        </div>
    `
  }
  items.innerHTML = template
}

const getInicio = async () => {
  await getDatos(API_URL);
  getIndicadores();
  listadoIndicadores();
  banner()
};

/*  Luego, utiliza una librería de JavaScript de gráficas
 para mostrar un historial de los últimos
 10 días del valor de la moneda a convertir seleccionada. */

const createChart = async (codigo) => {
  try {
    // Si ya existe un gráfico, destruye la instancia anterior.
    if (myChart) {
      myChart.destroy();
    }

    //solicitud a la API segun el codigo del indicador
    const response = await fetch(`https://mindicador.cl/api/${codigo}/2025`);
    const data = await response.json();

    //verifica los casos cuando no vienen registros en la serie.
    if (!data.serie.length) {
      console.log("No hay registros", data);
      return;
    }

    //ultimos 10 registros
    const dataSlice = data.serie.slice(0, 10);

    //crea los arrays de un dato especifico para presentarlo en el grafico y reverse debido a que los datos los da ascedente
    const valores = dataSlice.map((dato) => dato.valor).reverse();

    const fechas = dataSlice
      .map((dato) => {
        const fecha = new Date(dato.fecha);

        const dia = fecha.getDate();
        const mes = fecha.getMonth() + 1;
        const year = fecha.getFullYear();

        return `${dia}-${mes}-${year}`;
      })
      .reverse();

    /* GRAFICO */
    const ctx = document.getElementById("myChart").getContext("2d");
    myChart = new Chart(ctx, {
      type: "line", // Tipo de gráfico: 'bar', 'line', 'pie', etc.
      data: {
        labels: fechas,
        datasets: [
          {
            label: `Ultimos ${valores.length} registros`,
            data: valores,
            borderWidth: 1,
            borderColor: "#8BE9FD ",
            backgroundColor: "#8BE9FD ",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            //multiplico para generar un margin en el grafico de los valores minimos y maximos
            min: Math.min(...valores) * 0.99,
            max: Math.max(...valores) * 1.01,
            grid: {
              color: "rgba(200, 200, 200, 0.2)", // Color de las líneas de la cuadrícula del eje Y
              borderWidth: 1,
            },
            ticks: {
              color: "hsl(0, 0%, 100%)",
            },
          },
          x: {
            grid: {
              color: "rgba(200, 200, 200, 0.2)", // Color de las líneas de la cuadrícula del eje X
              borderWidth: 1,
            },
            ticks: {
              color: "hsl(0, 0%, 100%)",
            },
          },
        },
      },
    });
  } catch (e) {
    console.log(e.message);
  }
};

//llamadas
getInicio();
