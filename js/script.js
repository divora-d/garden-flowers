const flowersContainer = document.querySelector("#flowers-container");
const searchInput = document.querySelector("#search");
const filterButtons = document.querySelectorAll(".filter-btn");
const playerFilter = document.querySelector("#player-filter");
const minPointsInput = document.querySelector("#min-points");

let flowers = [];
let currentCategory = "all";


async function loadFlowers() {
    try {
        const response = await fetch("data/flowers.json");

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        flowers = await response.json();

        populatePlayerFilter();
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


function populatePlayerFilter() {
    const players = [
        ...new Set(
            flowers.flatMap((flower) => flower.players ?? [])
        )
    ].sort((a, b) => a.localeCompare(b, "ru"));

    players.forEach((player) => {
        const option = document.createElement("option");

        option.value = player;
        option.textContent = player;

        playerFilter.appendChild(option);
    });
}


function renderFlowers() {
    const searchQuery = searchInput.value.trim().toLowerCase();
    const selectedPlayer = playerFilter.value;
    const minPointsValue = minPointsInput.value.trim();

    const hasMinPointsFilter = minPointsValue !== "";
    const minPoints = Number(minPointsValue);

    const filteredFlowers = flowers
        .filter((flower) => {
            const matchesCategory =
                currentCategory === "all" ||
                flower.category === currentCategory;

            const matchesSearch =
                flower.name.toLowerCase().includes(searchQuery);

            const matchesPlayer =
                selectedPlayer === "" ||
                (flower.players ?? []).includes(selectedPlayer);

            const matchesMinPoints =
                !hasMinPointsFilter ||
                (
                    typeof flower.points === "number" &&
                    flower.points >= minPoints
                );

            return (
                matchesCategory &&
                matchesSearch &&
                matchesPlayer &&
                matchesMinPoints
            );
        })
        .sort((a, b) => a.name.localeCompare(b.name, "ru"));

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

        const imageContainer = document.createElement("div");
        imageContainer.classList.add("flower-image");

        const image = document.createElement("img");
        image.src = flower.image;
        image.alt = flower.name;

        const title = document.createElement("h2");
        title.textContent = flower.name;

        const points = document.createElement("p");
        points.classList.add("flower-points");

        if (
            typeof flower.points === "number" &&
            typeof flower.upgradedPoints === "number"
        ) {
            points.textContent =
                `Баллы ${flower.points}/${flower.upgradedPoints}`;
        } else {
            points.textContent = "Баллы не указаны";
        }

        imageContainer.appendChild(image);
        card.appendChild(imageContainer);
        card.appendChild(title);
        card.appendChild(points);

        flowersContainer.appendChild(card);
    });
}


searchInput.addEventListener("input", renderFlowers);

playerFilter.addEventListener("change", renderFlowers);

minPointsInput.addEventListener("input", renderFlowers);


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