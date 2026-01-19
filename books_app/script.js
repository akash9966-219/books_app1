const booksContainer = document.getElementById("books");
const modal = document.getElementById("modal");

const modalImg = document.getElementById("modal-img");
const modalTitle = document.getElementById("modal-title");
const modalAuthor = document.getElementById("modal-author");
const modalSummary = document.getElementById("modal-summary");
const modalRecommend = document.getElementById("modal-recommend");
const fullBookLink = document.getElementById("full-book-link");

let currentPage = 1;
let currentQuery = "subject:fiction";
const maxResults = 8;

let currentBooks = []; // ✅ STORE BOOKS SAFELY

/* Genre buttons */
document.querySelectorAll("nav button").forEach(btn => {
    btn.addEventListener("click", () => {
        currentQuery = `subject:${btn.dataset.genre}`;
        currentPage = 1;
        fetchBooks();
    });
});

/* Pagination */
document.getElementById("nextBtn").addEventListener("click", () => {
    currentPage++;
    fetchBooks();
});

document.getElementById("prevBtn").addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        fetchBooks();
    }
});

/* Fetch books */
function fetchBooks() {
    const startIndex = (currentPage - 1) * maxResults;

    fetch(`https://www.googleapis.com/books/v1/volumes?q=${currentQuery}&startIndex=${startIndex}&maxResults=${maxResults}`)
        .then(res => res.json())
        .then(data => {
            currentBooks = (data.items || [])
                .filter(b => b.volumeInfo?.canonicalVolumeLink);

            displayBooks();
            document.getElementById("pageNum").innerText = currentPage;
        })
        .catch(() => {
            booksContainer.innerHTML = "<p>Error loading books.</p>";
        });
}

/* Display books */
function displayBooks() {
    booksContainer.innerHTML = "";

    currentBooks.forEach((book, index) => {
        const info = book.volumeInfo;

        const card = document.createElement("div");
        card.className = "book-card";

        card.innerHTML = `
            <img src="${info.imageLinks?.thumbnail || ''}">
            <h3>${info.title}</h3>
            <p>${info.authors?.[0] || "Unknown Author"}</p>
            <button>View Details</button>
        `;

        card.querySelector("button").addEventListener("click", () => {
            showDetails(index);
        });

        booksContainer.appendChild(card);
    });
}

/* Summary */
function generateSummary(desc) {
    if (!desc) return "Summary not available.";
    return desc.split(". ").slice(0, 3).join(". ") + ".";
}

/* Recommendation */
function getRecommendation(info) {
    const rating = info.averageRating || 0;
    const pages = info.pageCount || 0;

    if (rating >= 4 || pages >= 300) return "✅ Highly Recommended";
    if (rating >= 3) return "⚠️ Good Read";
    return "❌ Optional / Skip";
}

/* Show modal */
function showDetails(index) {
    const info = currentBooks[index].volumeInfo;

    modal.style.display = "flex";

    modalImg.src = info.imageLinks?.thumbnail || "";
    modalTitle.textContent = info.title;
    modalAuthor.textContent = "Author: " + (info.authors?.join(", ") || "Unknown");
    modalSummary.textContent = generateSummary(info.description);
    modalRecommend.textContent = getRecommendation(info);

    fullBookLink.href = info.canonicalVolumeLink;
}

/* Close modal */
document.querySelector(".close").addEventListener("click", () => {
    modal.style.display = "none";
});

window.addEventListener("click", e => {
    if (e.target === modal) modal.style.display = "none";
});

/* Initial load */
fetchBooks();
