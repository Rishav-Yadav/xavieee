const global = {
  currentPage: window.location.pathname,
  api: {
    apiKey: "d1de15bd",
    apiUrl: "https://www.omdbapi.com/",
  },
  search: {
    term: "",
    type: "",
    page: 1,
    totalPages: 1,
    totalResults: 0,
  },

  fanart: { apiKey: "d815639b36c8b018138bba0d36499313" },
};
// API Functions
async function fetchAPIData(endpoint) {
  const apiKey = global.api.apiKey;
  const apiUrl = global.api.apiUrl;
  const resp = await fetch(`${apiUrl}?apikey=${apiKey}${endpoint}`);
  const data = await resp.json();
  return data;
}
async function getTotalEpisodes(seriesID, season) {
  const apiKey = global.api.apiKey;
  const apiUrl = global.api.apiUrl;
  const resp = await fetch(
    `${apiUrl}?apikey=${apiKey}&i=${seriesID}&type=series&season=${season}`
  );
  const data = await resp.json();

  return data.Episodes.length;
}
async function searchAPIData() {
  const apiKey = global.api.apiKey;
  const apiUrl = global.api.apiUrl;
  const resp = await fetch(
    `${apiUrl}?apikey=${apiKey}&s=${global.search.term}&type=${global.search.type}&page=${global.search.page}`
  );
  const results = await resp.json();

  return results;
}
// Display Search Results
async function searchResults() {
  const queryString = window.location.search;
  const urlParameters = new URLSearchParams(queryString);
  global.search.term = urlParameters.get("search-term");
  global.search.type = urlParameters.get("type");
  if (global.search.term !== "" && global.search.term !== null) {
    const { Search: results, totalResults: total_results } =
      await searchAPIData();
    global.search.page = 1;
    global.search.totalPages = Math.ceil(total_results / 10);
    global.search.totalResults = total_results;
    console.log(results);
    if (results.length === 0) {
      showAlert("No Results Found");
      return;
    }
    displaySearchResults(results);
    document.querySelector("#search-term").value = "";
  } else {
    showAlert("Please Enter a Search Term !");
  }
}

function displaySearchResults(results) {
  document.querySelector("#search-results").innerHTML = "";
  document.querySelector("#search-results-heading").innerHTML = "";
  document.querySelector("#pagination").innerHTML = "";

  results.forEach((result) => {
    const div = document.createElement("div");
    div.classList.add("card");
    div.innerHTML = `
    <a href="${global.search.type}-details.html?id=${result.imdbID}">
    ${
      result.Poster !== "N/A"
        ? `<img src="${result.Poster}" class="card-img-top"/>`
        : `<img src="./images/no-image.jpg" class="card-img-top"/>`
    }
    </a>
    <div class="card-body">
    <h5 class="card-title">${result.Title}</h5>
    <p class="card-text"><small class="text-muted">Release:${
      result.Year
    }</small></p>
    </div>`;
    console.log(global.search.totalResults);
    document.querySelector(
      "#search-results-heading"
    ).innerHTML = `<h2>${results.length} of ${global.search.totalResults} Results for ${global.search.term}</h2>`;
    document.querySelector(`#search-results`).appendChild(div);
  });

  displayPagination();
  window.scrollTo({
    top: 500,
    left: 0,
    behaviour: "smooth",
  });
}

// Pagination

function displayPagination() {
  const div = document.createElement("div");
  div.classList.add("pagination");
  div.innerHTML = `<button class="btn" id="prev">Prev</button>
  <button class="btn" id="next">Next</button>
  <div class="page-counter">Page ${global.search.page} of ${global.search.totalPages}</div>`;
  document.querySelector("#pagination").appendChild(div);
  const prev = document.querySelector("#prev");
  const next = document.querySelector("#next");
  if (global.search.page === 1) {
    console.log("disable prev");
    prev.disabled = true;
  }
  if (global.search.page === global.search.totalPages) {
    next.disabled = true;
  }
  next.addEventListener("click", async () => {
    global.search.page++;
    const { Search: results } = await searchAPIData();
    displaySearchResults(results);
  });
  prev.addEventListener("click", async () => {
    global.search.page--;
    const { Search: results } = await searchAPIData();
    displaySearchResults(results);
  });
}

async function displayMoviedetails() {
  const movieID = window.location.search.split("=")[1];

  const movie = await fetchAPIData(`&i=${movieID}`);

  global.search.type = "movie";

  const div = document.createElement("div");
  div.innerHTML = `<div class="details-top"<div>${
    movie.Poster
      ? `<img src="${movie.Poster}" class="card-img-top"/>`
      : `<img src="./images/no-image.jpg"/>`
  }
</div>
<div class="details-bottom"><h2>${movie.Title}</h2>
<p> <small class="text-muted">Release Date:</small>${movie.Year}</p>
<p><small class="text-muted">Overviews:</small>${movie.Plot}</p>
<p><small class="text-muted">Genres:</small>${movie.Genre}</p></div>
</div>`;

  document.querySelector("#movie-details").appendChild(div);
  document.querySelector(
    "iframe"
  ).src = `https://autoembed.co/movie/imdb/${movieID}`;
}

async function displaySeriesDetails() {
  const seriesID = window.location.search.split("=")[1];

  const series = await fetchAPIData(`&i=${seriesID}`);
  const totalSeasons = series.totalSeasons;
  global.search.type = "series";

  const div = document.createElement("div");
  div.innerHTML = `<div class="details-top"<div>${
    series.Poster
      ? `<img src="${series.Poster}" class="card-img-top"/>`
      : `<img src="./images/no-image.jpg"/>`
  }
</div>
<div class="details-bottom"><h2>${series.Title}</h2>
<p> <small class="text-muted">Release Date:</small>${series.Year}</p>
<p><small class="text-muted">Overviews:</small>${series.Plot}</p>
<p><small class="text-muted">Genres:</small>${series.Genre}</p></div>
</div>`;

  document.querySelector("#series-details").appendChild(div);

  for (let i = 1; i <= totalSeasons; i++) {
    const seasonDiv = document.createElement("div");
    seasonDiv.addEventListener("click", getUL);
    seasonDiv.className = "season-box";
    seasonDiv.innerHTML = `Season ${i} <i class="fa-solid fa-chevron-right"></i>`;
    const totalEpisodes = await getTotalEpisodes(seriesID, i);
    const ul = document.createElement("ul");
    ul.classList.add("ul");
    ul.classList.add("visible");
    for (let j = 1; j <= totalEpisodes; j++) {
      const li = document.createElement("li");
      li.classList.add("box");
      li.innerText = j;
      li.addEventListener("click", changeEpisode);
      ul.appendChild(li);
      if (j === 1) {
        li.classList.add("active");
      }
    }
    seasonDiv.appendChild(ul);
    document.querySelector(".season-container").appendChild(seasonDiv);
    if (i !== 1) {
      ul.classList.remove("visible");
    }
  }
  document.querySelector(
    "iframe"
  ).src = `https://autoembed.co/tv/imdb/${seriesID}-1-1`;
}

function changeEpisode(e, season) {
  if (e.target.tagName !== "LI") return;
  else {
    const allActiveEpisodes = document.querySelectorAll(".active");
    allActiveEpisodes.forEach((i) => {
      i.classList.remove("active");
    });
    e.target.classList.add("active");
    const queryString = window.location.search;
    const urlParameters = new URLSearchParams(queryString);
    const seriesID = urlParameters.get("id");
    const season = e.target.parentElement.parentElement.innerText.toString()[7];
    console.log(seriesID, season);
    const episode = e.target.innerText;

    document.querySelector(
      "iframe"
    ).src = `https://autoembed.co/tv/imdb/${seriesID}-${season}-${episode}`;
  }
}
function getUL(e) {
  let target = e.target;
  if (e.target.tagName === "I") {
    target = e.target.parentElement;
  }
  if (e.target.tagName === "LI" || e.target.tagName === "UL") {
    return;
  }

  target.querySelector(".ul").classList.toggle("visible");
}
function showAlert() {
  // TODO Alert Box
}

function init() {
  console.log(global.currentPage);
  switch (global.currentPage) {
    case "./":
    case "./index.html":
      break;
    case "/search.html":
      console.log("Search case ran");
      searchResults();
      break;
    case "/movie-details.html":
      console.log("Movie Detail case ran");
      displayMoviedetails();
      break;
    case "/series-details.html":
      displaySeriesDetails();
      break;
  }
}
document.addEventListener("DOMContentLoaded", init);
