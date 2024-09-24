console.log("main.js cargado");
//import translate from "node-google-translate-skidz";
let traducir = false;
const form = document.getElementById("form");
const ubicacion = document.getElementById("ubicacion");
const busqueda = document.getElementById("busqueda");
const departamentSelect = document.getElementById("departament");
const URL = "https://collectionapi.metmuseum.org/public/collection/v1/";

function llenarSelect() {
  fetch(URL + "departments")
    .then((res) => res.json())
    .then((data) => {
      // Creo la opcion TODOS para que muestre todos los departamentos
      const todos = document.createElement("option");
      todos.setAttribute("value", 0);
      todos.text = "Todos los departamentos";
      departamentSelect.appendChild(todos);
      data.departments.forEach((department) => {
        // Creo la opción para el select
        const option = document.createElement("option");
        option.value = department.departmentId;
        option.text = department.displayName;
        // Agrego la opción al select
        departamentSelect.appendChild(option);
      });
    })
    .catch((error) => {
      console.error("Error al obtener los departamentos:", error);
    });
}
llenarSelect(); //Funciona flama

// buscar por nombre, ubicacion y departamento
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const busquedaValue = busqueda.value.trim();
  const departamentvalue = departamentSelect.value; //devuelve lam posicion de el select
  //Creo la URl que va a buscar solo los resultados que solo tengan imagenes
  let searchUrl = `${URL}search?hasImages=true&q=${busquedaValue}`;
  if (departamentvalue !== "0") {
    searchUrl += `&departmentId=${departamentvalue}`;
  }
  console.log(searchUrl);
  obtenerDatos(searchUrl);
});

document.getElementById("btn-traducir").addEventListener("click", () => {
  traducir = !traducir;
  const btnTraducir = document.getElementById("btn-traducir");
  btnTraducir.innerText = traducir ? "No traducir" : "Traducir";
});

function obtenerDatos(searchUrl) {
  fetch(searchUrl)
    .then((res) => res.json())
    .then((data) => {
      if (data.total === 0) {
        console.log("No se encontraron resultados", data);
      } else {
        console.log(`Se encontraron ${data.total} resultados`);
        const objetsID = data.objectIDs.slice(0, 20);
        obtenerDatosDeObjetos(objetsID);
      }
    })
    .catch((error) => {
      console.error("Error al traer los datos ", error);
    });
}

function obtenerDatosDeObjetos(objetsID) {
  const resultados = document.getElementById("resultados");
  resultados.innerHTML = ""; // Limpiar resultados anteriores

  objetsID.forEach((id) => {
    const url = `${URL}objects/${id}`;
    fetch(url)
      .then((res) => res.json())
      .then((objeto) => {
        const title = objeto.title || "Sin título";
        const culture = objeto.culture || "Sin cultura";
        const dynasty = objeto.dynasty || "Sin dinastía";

        const traduccionPromises = traducir
          ? Promise.all([
              translate({ text: title, target: "es" }),
              translate({ text: culture, target: "es" }),
              translate({ text: dynasty, target: "es" }),
            ])
          : Promise.resolve([
              { translation: title },
              { translation: culture },
              { translation: dynasty },
            ]);

        traduccionPromises
          .then(
            ([titleTranslation, cultureTranslation, dynastyTranslation]) => {
              const card = document.createElement("div");
              card.classList.add("col-lg-3", "col-md-4", "col-sm-6"); // 4 por fila en pantallas grandes

              // Si no hay imagen, usa la imagen predeterminada
              const imagen = objeto.primaryImage || "./images/images.png";

              card.innerHTML = `
                        <div class="card h-100">
                          <img src="${imagen}" class="card-img-top" alt="${
                titleTranslation.translation || "Imagen no disponible"
              }">
                          <div class="card-body">
                            <h5 class="card-title">${
                              titleTranslation.translation || "Sin título"
                            }</h5>
                            <p class="card-text">${
                              cultureTranslation.translation || "Sin cultura"
                            }</p>
                            <p class="card-text">${
                              dynastyTranslation.translation || "Sin dinastía"
                            }</p>
                          </div>
                        </div>
                      `;
              resultados.appendChild(card);
            }
          )
          .catch((error) => {
            console.error("Error al traducir los datos", error);
          });
      })
      .catch((error) => {
        console.error("Error al traer los datos del objeto", error);
      });
  });
}
