const flowersContainer = document.querySelector("#flowers-container");
const searchInput = document.querySelector("#search");
const filterButtons = document.querySelectorAll(".filter-btn");
const playerFilter = document.querySelector("#player-filter");
const minPointsInput = document.querySelector("#min-points");
const flowerModal = document.querySelector("#flower-modal");
const modalTitle = document.querySelector("#modal-title");
const modalPlayers = document.querySelector("#modal-players");
const closeModalButton = document.querySelector("#close-modal");
const resetButton = document.querySelector("#reset-filters");

let flowers = [];
let currentCategory = "all";

resetButton.addEventListener("click", () => {
    searchInput.value = "";
    playerFilter.value = "";
    minPointsInput.value = "";

    currentCategory = "all";

    filterButtons.forEach((button) => {
        button.classList.toggle(
            "active",
            button.dataset.category === "all"
        );
    });

    renderFlowers();
});

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

function openFlowerModal(flower) {
    modalTitle.textContent = flower.name;
    modalPlayers.innerHTML = "";

    const players = flower.players ?? [];

    if (players.length === 0) {
        const item = document.createElement("li");
        item.textContent = "Игроки не указаны";
        modalPlayers.appendChild(item);
    } else {
        players.forEach((player) => {
            const item = document.createElement("li");
            item.textContent = player;
            modalPlayers.appendChild(item);
        });
    }

    flowerModal.showModal();
}

function normalizeText(text) {
    return text
        .toLowerCase()
        .replace(/ё/g, "е")
        .replace(/э/g, "е")
        .replace(/є/g, "е")
        .replace(/ы/g, "и")
        .replace(/і/g, "и");
}

function renderFlowers() {
    const searchQuery = normalizeText(searchInput.value.trim());
    const selectedPlayer = playerFilter.value;
    const minPointsValue = minPointsInput.value.trim();

    const hasMinPointsFilter = minPointsValue !== "";
    const minPoints = Number(minPointsValue);

    const filteredFlowers = flowers
        .filter((flower) => {
            const matchesCategory =
                currentCategory === "all" ||
                flower.category === currentCategory;

            const normalizedFlowerName = flower.name
                .toLowerCase()
                .replace(/ё/g, "е");

            const matchesSearch =
                normalizeText(flower.name).includes(searchQuery);

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
        card.tabIndex = 0;
        card.setAttribute("role", "button");
        card.setAttribute(
            "aria-label",
            `Показать игроков цветка ${flower.name}`
        );

        card.addEventListener("click", () => {
            openFlowerModal(flower);
        });

        card.addEventListener("keydown", (event) => {
            if (event.target !== card) {
                return;
            }

            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openFlowerModal(flower);
            }
        });
        const imageContainer = document.createElement("div");
        imageContainer.classList.add("flower-image");

        const image = document.createElement("img");
        image.src = flower.image;
        image.alt = flower.name;

        const title = document.createElement("h2");
        title.textContent = flower.name;

        const points = document.createElement("p");
        points.classList.add("flower-points");

        const pointsBadge = document.createElement("div");
        pointsBadge.classList.add("flower-points-badge");

        if (
            typeof flower.points === "number" &&
            typeof flower.upgradedPoints === "number"
        ) {
            points.textContent =
                `Баллы ${flower.points}/${flower.upgradedPoints}`;
        } else {
            points.textContent = "Баллы не указаны";
        }

        pointsBadge.appendChild(points);

        imageContainer.appendChild(image);
        card.appendChild(imageContainer);
        card.appendChild(title);
        card.appendChild(pointsBadge);

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

closeModalButton.addEventListener("click", () => {
    flowerModal.close();
});

flowerModal.addEventListener("click", (event) => {
    if (event.target === flowerModal) {
        flowerModal.close();
    }
});

loadFlowers();