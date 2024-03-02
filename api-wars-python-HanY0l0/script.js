const tbody = document.getElementById("tbody");
const nextButton = document.getElementById("next");
const previousButton = document.getElementById("prev");
const tableBody = document.getElementById("residents_tbody");
let currentUrl = "https://swapi.dev/api/planets/";
let prevUrl = "";
let nextUrl = "";
let residentsURL = [];

//Zgarnianie planet i mieszkańców
const getPlanets = function (url) {
  fetch(url).then((response) =>
    response.json().then((data) => {
      populateRows(data);
      nextUrl = data.next;
      prevUrl = data.previous;
      updateButtons();
    })
  );
};

const updateButtons = function () {
  nextButton.disabled = !nextUrl;
  previousButton.disabled = !prevUrl;
};

function format(number, suffix) {
  if (number === "unknown") return "unknown";
  let text = new Intl.NumberFormat().format(number);
  return text + suffix;
}

function residentsButton(residents, row) {
  if (residents.length === 0) {
    return "No known residents";
  } else {
    residentsURL[row] = residents;
  }
  return `<button type="button" class="btn btn-light" data-row=${row} button onclick="showModal(${row})">Show Residents</button>`;
}

const populateRows = function (planetData) {
  tbody.innerHTML = "";
  let rowNo = 0;
  planetData.results.forEach((planet) => {
    let row = document.createElement("tr");
    tableRow = `
    <td>${planet.name}</td>
    <td>${format(planet.diameter, " km")}</td>
    <td>${planet.climate}</td>
    <td>${planet.terrain}</td>
    <td>${format(planet.surface_water, "%")}</td>
    <td>${format(planet.population, " people")}</td>
    <td>${residentsButton(planet.residents, rowNo++)}</td>
    `;
    row.innerHTML = tableRow;
    tbody.appendChild(row);
  });
};

function showModal(row) {
  const residents = residentsURL[row];
  const modal = document.getElementById("residentsModal");
  const modalLabel = document.getElementById("residentsLabel");
  const tableBody = document.getElementById("residents_tbody");

  tableBody.innerHTML = "";

  Promise.all(
    residents.map((url) =>
      fetch(url)
        .then((response) => response.json())
        .catch((error) => console.error("Failed to fetch resident:", error))
    )
  )
    .then((residentsDetails) => {
      residentsDetails.forEach((resident) => {
        const row = tableBody.insertRow();
        const cellData = [
          resident.name,
          resident.height,
          resident.mass,
          resident.hair_color,
          resident.skin_color,
          resident.eye_color,
          resident.birth_year,
          resident.gender,
        ];

        cellData.forEach((data) => {
          const cell = row.insertCell();
          cell.textContent = data;
        });
      });

      modal.classList.remove("hidden");
    })
    .catch((error) => {
      console.error("Failed to fetch residents:", error);
    });
}

document.querySelectorAll(".close-modal-button").forEach((button) => {
  button.addEventListener("click", () => {
    const modal = document.getElementById("residentsModal");
    modal.classList.add("hidden");
  });
});

nextButton.addEventListener("click", () => {
  if (nextUrl) {
    getPlanets(nextUrl);
  }
});
previousButton.addEventListener("click", () => {
  if (prevUrl) getPlanets(prevUrl);
});

document.addEventListener("click", function (e) {
  if (e.target && e.target.matches("button.btn.btn-light")) {
    const row = e.target.getAttribute("data-row");
    showModal(row);
  }
});

getPlanets(currentUrl);
