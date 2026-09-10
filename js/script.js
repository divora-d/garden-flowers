const flowersContainer = document.querySelector("#flowers-container");
const searchInput = document.querySelector("#search");
const filterButtons = document.querySelectorAll(".filter-btn");

let flowers = [];
let currentCategory = "all";


async function loadFlowers() {
    try {
        const response = await fetch("data/flowers.json");

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        flowers = await response.json();

        renderFlowers();

    } catch (error) {
        console.error("Failed to load flowers:", error);

        flowersContainer.innerHTML = `
            <p class="error-message">
                Не удалось загрузить список цветов.
            </p>
        `;
    }
}


function renderFlowers() {
    const searchQuery = searchInput.value.trim().toLowerCase();

    const filteredFlowers = flowers.filter((flower) => {
        const matchesCategory =
            currentCategory === "all" ||
            flower.category === currentCategory;

        const matchesSearch =
            flower.name.toLowerCase().includes(searchQuery);

        return matchesCategory && matchesSearch;
    });

    flowersContainer.innerHTML = "";

    if (filteredFlowers.length === 0) {
        flowersContainer.innerHTML = `
            <p class="no-results">
                Цветы не найдены.
            </p>
        `;

        return;
    }

    filteredFlowers.forEach((flower) => {
        const card = document.createElement("article");

        card.classList.add(
            "flower-card",
            `category-${flower.category}`
        );

        card.innerHTML = `
            <div class="flower-image">
                <img src="${flower.image}" alt="${flower.name}">
            </div>

            <h2>${flower.name}</h2>
        `;

        flowersContainer.appendChild(card);
    });
}


searchInput.addEventListener("input", () => {
    renderFlowers();
});


filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
        currentCategory = button.dataset.category;

        filterButtons.forEach((btn) => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        renderFlowers();
    });
});


loadFlowers();