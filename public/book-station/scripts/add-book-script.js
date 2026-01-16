const socket = new WebSocket("ws://localhost:3000");

const categoryInput = document.getElementById("new-category");
const addCategoryBtn = document.getElementById("add-category-btn");
const categoryList = document.getElementById("category-list");
const timeoutDuration = 10000;
let inactivityTimer;
let categories = [];
let uidReceived = null;

socket.onopen = () => {
  socket.send(JSON.stringify({
      type: "register",
      stationId: "station-000",
      role: "add"
  }));
};
// TODO: add error handling
socket.onmessage = async (event) => {
  const data = JSON.parse(event.data);

  if (data.type === "uid") {
    console.log("Received UID: ", data.uid);
    document.getElementById("uid").value = data.uid;
    resetTimer()
  }
};

function renderCategories() {
  categoryList.innerHTML = "";
  categories.forEach((cat, idx) => {
    const catElem = document.createElement("div");
    catElem.className = "category-item";
    catElem.textContent = cat;

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "×";
    removeBtn.onclick = () => {
      categories.splice(idx, 1);
      renderCategories();
    };

    catElem.appendChild(removeBtn);
    categoryList.appendChild(catElem);
  });
}

addCategoryBtn.addEventListener("click", () => {
  const val = categoryInput.value.trim();
  if (val && !categories.includes(val)) {
    categories.push(val);
    renderCategories();
    categoryInput.value = "";
  }
});

categoryInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    e.preventDefault(); // Prevent form from submitting
    addCategoryBtn.click(); // Trigger the same add logic
  }
});

document.getElementById("book-form").addEventListener("submit", e => {
  e.preventDefault();

  // Collect data
  const uid = e.target.uid.value.trim();
  const bookData = {
    title: e.target.title.value.trim(),
    author: e.target.author.value.trim(),
    category: {},
    status: e.target.status.value,
    cover: e.target.cover.value.trim(),
    genre: e.target.genre.value.trim(),
    isAvailable: (e.target.status.value === "Tersedia") ? true : false,
    isbn: e.target.isbn.value.trim(),
    language: e.target.language.value.trim(),
    publisher: e.target.publisher.value.trim(),
    shelf_location: e.target.shelf_location.value.trim()
  };

  // Convert categories array to object with numeric keys
  categories.forEach((cat, i) => {
    bookData.category[i] = cat;
  });

  console.log("Data buku siap dikirim:", bookData);
  addBook(uid, bookData);

  // Clear form & categories
  e.target.reset();
  uidReceived = []
  categories = [];
  renderCategories();
});

async function addBook(uid, bookData) {
  try {
    const res = await fetch("/add-book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid, bookData })
    });

    const data = await res.json();

    if (!res.ok) {
      showNotification(data.error);
      return;
    }

    showNotification(data.message);
  } catch (err) {
    showNotification("Error: " + err);
  }
}

function showNotification(message, duration = 3000) {
  const popup = document.getElementById("popup-notification");
  popup.textContent = message;
  popup.classList.add("show");

  setTimeout(() => {
    popup.classList.remove("show");
  }, duration);
}

function resetTimer() {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    window.location.href = "/book-station";
  }, timeoutDuration);
}

window.onload = resetTimer;
document.onmousemove = resetTimer;
document.onkeydown = resetTimer;
document.onclick = resetTimer;
document.ontouchstart = resetTimer;