console.log("main.js cargado");
let traducir = false;
let paginaActual = 1;
const itemPorPagina = 20;
let totalobjetos = 0;
let searchUrl = "";
let resultadosData = [];

const form = document.getElementById("form");
const busqueda = document.getElementById("busqueda");
const departamentSelect = document.getElementById("departament");
const URL = "https://collectionapi.metmuseum.org/public/collection/v1/";

function llenarSelect() {
  fetch(URL + "departments")
    .then((res) => res.json())
    .then((data) => {
      const todos = document.createElement("option");
      todos.setAttribute("value", 0);
      todos.text = "Todos los departamentos";
      departamentSelect.appendChild(todos);
      data.departments.forEach((department) => {
        const option = document.createElement("option");
        option.value = department.departmentId;
        option.text = department.displayName;
        departamentSelect.appendChild(option);
      });
    })
    .catch((error) => {
      console.error("Error al obtener los departamentos:", error);
    });
}

llenarSelect();

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const busquedaValue = busqueda.value.trim();
  const ubicacionValue = document.getElementById("ubicacion").value.trim();
  const departamentValue = departamentSelect.value;

  searchUrl = `${URL}search?hasImages=true&q=${busquedaValue}`;

  if (ubicacionValue.trim() !== "") {
    searchUrl += `&geoLocation!=${ubicacionValue.trim()}`;
  }

  if (departamentValue !== "0") {
    searchUrl += `&departmentId=${departamentValue}`;
  }
  

  console.log("su busqueda fue " + busquedaValue+" "+ubicacionValue+" "+departamentValue);
  console.log(searchUrl);
  paginaActual = 1;
  obtenerDatos(searchUrl);
});

document.getElementById("btn-traducir").addEventListener("click", () => {
  traducir = !traducir;
  const btnTraducir = document.getElementById("btn-traducir");
  btnTraducir.innerText = traducir ? "No traducir" : "Traducir";
  mostrarResultados();
});

function obtenerDatos(searchUrl) {
  fetch(searchUrl)
    .then((res) => res.json())
    .then((data) => {
      if (data.total === 0) {
        console.log("No se encontraron resultados, URL    " + searchUrl);
        resultados.innerHTML = `<h2>No se encontraron resultados</h2>`;
        console.log(data);
        totalobjetos = 0;
      } else {
        console.log(data);
        totalobjetos = data.total;
        const objectIDs = data.objectIDs.slice(
          (paginaActual - 1) * itemPorPagina,
          paginaActual * itemPorPagina
        );
        resultadosData = [];
        obtenerDatosDeObjetos(objectIDs);
        actualizarPaginacion();
      }
    })
    .catch((error) => {
      console.error("Error al traer los datos", error);
    });
}

function obtenerDatosDeObjetos(objectIDs) {
  const resultados = document.getElementById("resultados");
  resultados.innerHTML = "";

  const promises = objectIDs.map((id) => {
    const url = `${URL}objects/${id}`;
    return fetch(url)
      .then((res) => res.json())
      .then((objeto) => {
        resultadosData.push({
          id,
          title: objeto.title || "Sin título",
          culture: objeto.culture || "Sin cultura",
          dynasty: objeto.dynasty || "Sin dinastía",
          location: objeto.city || objeto.country || "Sin ubicación",
          primaryImage: objeto.primaryImage || "./IMAGES/images.png",
          objectDate: objeto.objectDate || "Fecha desconocida", // La fecha de publicación
        });
      });
  });

  Promise.all(promises)
    .then(() => {
      mostrarResultados();
    })
    .catch((error) => {
      console.error("Error al traer los datos del objeto", error);
    });
}

function mostrarResultados() {
  const resultados = document.getElementById("resultados");
  resultados.innerHTML = "";

  resultadosData.forEach((objeto) => {
    const card = document.createElement("div");
    card.classList.add("col-lg-3", "col-md-4", "col-sm-6");

    const imagen = objeto.primaryImage;

    const titleText = traducir ? translateText(objeto.title) : objeto.title;
    const cultureText = traducir
      ? translateText(objeto.culture)
      : objeto.culture;
    const dynastyText = traducir
      ? translateText(objeto.dynasty)
      : objeto.dynasty;
    const locationText = traducir
      ? translateText(objeto.location)
      : objeto.location; // Traduce o muestra la ubicación

    Promise.all([titleText, cultureText, dynastyText, locationText])
      .then(
        ([
          titleTranslation,
          cultureTranslation,
          dynastyTranslation,
          locationTranslation,
        ]) => {
          card.innerHTML = `
  <div class="card h-100">
    <img src="${imagen}" class="card-img-top" alt="${titleTranslation}" title="Fecha de publicación: ${objeto.objectDate}">
    <div class="card-body">
      <h5 class="card-title">${titleTranslation}</h5>
      <p class="card-text">Cultura: ${cultureTranslation}</p>
      <p class="card-text">Dinastía: ${dynastyTranslation}</p>
      <p class="card-text">Ubicación: ${locationTranslation}</p>
    </div>
  </div>
`;

          resultados.appendChild(card);
        }
      )
      .catch((error) => {
        console.error("Error al traducir los datos", error);
      });
  });
}

function actualizarPaginacion() {
  document.getElementById("pagina-actual").innerHTML = paginaActual;
  document.getElementById("btn-anterior").disabled = paginaActual === 1;
  document.getElementById("btn-siguiente").disabled =
    paginaActual * itemPorPagina >= totalobjetos;

  // Calcular el total de páginas
  const totalPaginas = Math.ceil(totalobjetos / itemPorPagina);
  document.getElementById("total-paginas").innerHTML = totalPaginas; // Muestra el total de páginas
}

function translateText(text) {
  return fetch("/translate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: text,
      source: "en",
      target: "es",
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error en la traducción");
      }
      return response.json();
    })
    .then((data) => data.translation)
    .catch((error) => {
      console.error("Error al traducir el texto:", error);
      return text;
    });
}

document.getElementById("btn-anterior").addEventListener("click", () => {
  if (paginaActual > 1) {
    paginaActual--;
    obtenerDatos(searchUrl);
  }
});

document.getElementById("btn-siguiente").addEventListener("click", () => {
  if (paginaActual * itemPorPagina < totalobjetos) {
    paginaActual++;
    obtenerDatos(searchUrl);
  }
});
