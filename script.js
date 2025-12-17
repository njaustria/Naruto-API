document.addEventListener("DOMContentLoaded", () => {
    const gallery = document.getElementById("gallery");
    const modalBody = document.getElementById("modalBody");
    const searchInput = document.getElementById("searchInput");
    const searchBtn = document.getElementById("searchBtn");
    const paginationContainer = document.getElementById("paginationContainer");
    const homeLink = document.getElementById("homeLink");

    const charModal = new bootstrap.Modal(document.getElementById('charModal'));

    const NARUTO_ID = 20;
    let allCharacters = [];
    let filteredCharacters = [];
    let currentPage = 1;
    const perPage = 8;

    async function loadCharacters() {
        try {
            const res = await fetch(`https://api.jikan.moe/v4/anime/${NARUTO_ID}/characters`);
            const data = await res.json();
            allCharacters = data.data.map(item => item.character);
            filteredCharacters = [...allCharacters];
            renderPage();
        } catch (error) {
            console.error("Error loading characters:", error);
            gallery.innerHTML = `<p class="text-center text-danger">Failed to load characters. Please try again later.</p>`;
        }
    }

    function renderPage() {
        gallery.innerHTML = "";
        const start = (currentPage - 1) * perPage;
        const end = start + perPage;
        const itemsToShow = filteredCharacters.slice(start, end);

        if (itemsToShow.length === 0) {
            gallery.innerHTML = `<div class="col-12 text-center mt-5"><h3>No characters found matching that name.</h3></div>`;
        }

        itemsToShow.forEach(char => {
            const col = document.createElement("div");
            col.className = "col-6 col-md-4 col-lg-3 mb-4";
            col.innerHTML = `
                <div class="card card-custom shadow-sm position-relative">
                    <img src="${char.images.jpg.image_url}" alt="${char.name}">
                    <div class="card-overlay">
                        <h5 class="m-0">${char.name}</h5>
                    </div>
                </div>
            `;
            col.onclick = () => showDetails(char.mal_id);
            gallery.appendChild(col);
        });

        renderPagination();
    }

    function renderPagination() {
        const totalPages = Math.ceil(filteredCharacters.length / perPage);
        paginationContainer.innerHTML = `
            <button class="btn btn-warning px-4" ${currentPage === 1 ? "disabled" : ""} id="prevBtn">Prev</button>
            <span class="align-self-center fw-bold">Page ${currentPage} of ${totalPages || 1}</span>
            <button class="btn btn-warning px-4" ${currentPage >= totalPages ? "disabled" : ""} id="nextBtn">Next</button>
        `;

        document.getElementById("prevBtn").onclick = () => {
            currentPage--;
            renderPage();
            window.scrollTo(0, 0);
        };
        document.getElementById("nextBtn").onclick = () => {
            currentPage++;
            renderPage();
            window.scrollTo(0, 0);
        };
    }

    function handleSearch() {
        const query = searchInput.value.toLowerCase().trim();
        filteredCharacters = allCharacters.filter(char =>
            char.name.toLowerCase().includes(query)
        );
        currentPage = 1;
        renderPage();
    }

    async function showDetails(id) {
        modalBody.innerHTML = `<div class="text-center p-5"><div class="spinner-border text-warning" role="status"></div></div>`;
        charModal.show();

        try {
            const res = await fetch(`https://api.jikan.moe/v4/characters/${id}/full`);
            const json = await res.json();
            const char = json.data;

            modalBody.innerHTML = `
                <div class="row">
                    <div class="col-md-5">
                        <img src="${char.images.jpg.image_url}" class="img-fluid rounded shadow">
                    </div>
                    <div class="col-md-7">
                        <h2 class="fw-bold text-orange">${char.name}</h2>
                        <p class="text-muted italic">${char.name_kanji || ''}</p>
                        <hr>
                        <p><strong>Favorites:</strong> ❤️ ${char.favorites.toLocaleString()}</p>
                        <div class="overflow-auto" style="max-height: 250px;">
                            <p>${char.about ? char.about.replace(/\n/g, '<br>') : "No biography available."}</p>
                        </div>
                    </div>
                </div>
            `;
        } catch (err) {
            modalBody.innerHTML = "<p>Error loading details.</p>";
        }
    }

    searchBtn.onclick = handleSearch;
    searchInput.onkeyup = (e) => {
        handleSearch();
    };

    homeLink.onclick = (e) => {
        searchInput.value = "";
        handleSearch();
        window.scrollTo(0, 0);
    };

    loadCharacters();
});