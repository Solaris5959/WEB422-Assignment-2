/********************************************************************************
*  WEB422 – Assignment 2
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
* 
*  Name: Connor McDonald Student ID: 136123221 Date: Feb 9 2024
*
********************************************************************************/

let page = 1;
const perPage = 10;
let searchName = null;

/**
 * Loads listings data from the server and updates the table, pagination buttons, and click events.
 */
function loadListingsData() {
  const url = `/api/listings?page=${page}&perPage=${perPage}${
    searchName ? `&name=${searchName}` : ""
  }`;

  fetch(url)
    .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
    .then((data) => {
      if (data.length > 0) {
        updateTable(data);
        addClickEvents();
        updatePaginationButtons(data);
      } else {
        if (page > 1)
          page--; 
        else
          showNoDataMessage(); 
      }
    })
    .catch((err) => {
      console.error("Error fetching listings:", err);
    });
}

/**
 * Updates the table with the provided data.
 * @param {Array} data - The data to populate the table with.
 */
function updateTable(data) {
  const tableBody = document
    .getElementById("listingsTable")
    .querySelector("tbody");

  if (tableBody) {
    tableBody.innerHTML = "";

    data.forEach((listing) => {
      const tableRow = document.createElement("tr");
      tableRow.dataset.id = listing._id;

      const nameCell = document.createElement("td");
      nameCell.textContent = listing.name;

      const typeCell = document.createElement("td");
      typeCell.textContent = listing.room_type;

      const locationCell = document.createElement("td");
      locationCell.textContent = listing.address
        ? listing.address.street
        : "N/A";

      const summaryCell = document.createElement("td");
      summaryCell.innerHTML = `${
        listing.summary ? listing.summary : "N/A"
      }<br><br>
            <strong>Accommodates:</strong> ${listing.accommodates || "N/A"}<br>
            <strong>Rating:</strong> ${
              listing.review_scores
                ? listing.review_scores.review_scores_rating
                : "N/A"
            } 
            (${listing.number_of_reviews || 0} Reviews)`;

      tableRow.appendChild(nameCell);
      tableRow.appendChild(typeCell);
      tableRow.appendChild(locationCell);
      tableRow.appendChild(summaryCell);

      tableBody.appendChild(tableRow);
    });
  } else {
    console.error("Error: Unable to find tableBody element.");
  }
}

/**
 * Adds click events to each row in the listings table.
 */
function addClickEvents() {
  const rows = document
    .getElementById("listingsTable")
    .querySelectorAll("tbody tr");

  rows.forEach((row) => {
    row.addEventListener("click", () => {
      const listingId = row.dataset.id;
      loadListingDetails(listingId);
    });
  });
}

/**
 * Loads the details of a listing.
 * @param {number} listingId - The ID of the listing.
 */
function loadListingDetails(listingId) {
  const detailsUrl = `/api/listings/${listingId}`;

  fetch(detailsUrl)
    .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
    .then((data) => {
      const modalBody = document.querySelector(".modal-body");
      modalBody.innerHTML = "";

      const imageElement = document.createElement("img");
      imageElement.id = "photo";
      imageElement.onerror = function () {
        this.onerror = null;
        this.src = "https://placehold.co/600x400?text=Photo+Not+Available";
      };
      imageElement.classList.add("img-fluid", "w-100");
      imageElement.src =
        data.images &&
        data.images.picture_url &&
        data.images.picture_url.length > 0
          ? data.images.picture_url
          : "https://placehold.co/600x400?text=Photo+Not+Available";
      modalBody.appendChild(imageElement);

      modalBody.appendChild(document.createElement("br"));
      modalBody.appendChild(document.createElement("br"));

      if (data.neighborhood_overview) {
        const neighborhoodText = document.createTextNode(data.neighborhood_overview);
        modalBody.appendChild(neighborhoodText);
      }

      modalBody.appendChild(document.createElement("br"));
      modalBody.appendChild(document.createElement("br"));

      const detailsText = document.createElement("div");
      detailsText.innerHTML = `
        <strong>Price:</strong> ${
          data.price ? `$${data.price.toFixed(2)}` : "N/A"
        }<br>
        <strong>Room:</strong> ${data.room_type || "N/A"}<br>
        <strong>Bed:</strong> ${
          data.bed_type ? `${data.bed_type} (${data.beds || 1})` : "N/A"
        }<br><br>
      `;
      modalBody.appendChild(detailsText);

      const modal = new bootstrap.Modal(document.getElementById("detailsModal"));
      modal.show();
    })
    .catch((err) => {
      console.error("Error fetching listing details:", err);
    });
}

/**
 * Populates the modal with the details of a listing.
 * @param {Object} listing - The listing object containing the details.
 * @returns {void}
 */
function populateModal(listing) {
  const modalImage = document.getElementById("modalImage");
  const modalDetails = document.getElementById("modalDetails");

  modalImage.src = listing.image_url;
  modalDetails.innerHTML = `<strong>Name:</strong> ${listing.name}<br>
                           <strong>Type:</strong> ${listing.room_type}<br>
                           <strong>Location:</strong> ${
                             listing.address ? listing.address.street : "N/A"
                           }<br>
                           <strong>Summary:</strong> ${
                             listing.summary ? listing.summary : "N/A"
                           }<br>
                           <strong>Accommodates:</strong> ${
                             listing.accommodates || "N/A"
                           }<br>
                           <strong>Rating:</strong> ${
                             listing.review_scores
                               ? listing.review_scores.review_scores_rating
                               : "N/A"
                           } (${listing.number_of_reviews || 0} Reviews)`;
}

/**
 * Updates the pagination buttons based on the current page and data length.
 * @param {Array} data - The data used for pagination.
 */
function updatePaginationButtons(data) {
  document.getElementById("current-page").textContent = page;

  const previousPageButton = document.getElementById("previous-page");
  previousPageButton.disabled = page === 1;

  const nextPageButton = document.getElementById("next-page");
  nextPageButton.disabled = page * perPage >= data.length;
}

/**
 * Displays a message indicating that no data is available in the table.
 */
function showNoDataMessage() {
  const tableBody = document
    .getElementById("listingsTable")
    .querySelector("tbody");
  tableBody.innerHTML = `<tr><td colspan="4"><strong>No data available</strong></td></tr>`;
}

/**
 * Updates the pagination buttons based on the current page and data length.
 * @param {Array} data - The data used for pagination.
 */
function updatePaginationButtons(data) {
  document.getElementById("current-page").textContent = page;

  const previousPageButton = document.getElementById("previous-page");
  previousPageButton.disabled = page === 1;

  const nextPageButton = document.getElementById("next-page");
  nextPageButton.disabled = page * perPage >= data.length;
}

/**
 * Adds event listeners to the pagination buttons, search form, search button, and clear form button.
 */
document.addEventListener("DOMContentLoaded", () => {
  loadListingsData();

  const previousPageButton = document.getElementById("previous-page");
  previousPageButton.addEventListener("click", () => {
    if (page > 1) {
      page--;
      loadListingsData();
    }
  });

  const nextPageButton = document.getElementById("next-page");
  nextPageButton.addEventListener("click", () => {
    page++;
    loadListingsData();
  });

  const searchForm = document.getElementById("searchForm");
  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    searchName = document.getElementById("name").value;
    page = 1;
    loadListingsData();
  });

  const searchBtn = document.getElementById("searchBtn");
  searchBtn.addEventListener("click", () => {
    searchName = document.getElementById("name").value;
    page = 1;
    loadListingsData();
  });

  const clearFormButton = document.getElementById("clearForm");
  clearFormButton.addEventListener("click", () => {
    document.getElementById("name").value = "";
    searchName = null;
    page = 1;
    loadListingsData();
  });

  updateTable(data);
  addClickEvents();
});