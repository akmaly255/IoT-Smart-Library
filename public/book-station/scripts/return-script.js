const socket = new WebSocket("ws://localhost:3000");

const timeoutDuration = 10000;
let inactivityTimer;
let scannedBooks = [];

socket.onopen = () => {
    socket.send(JSON.stringify({
        type: "register",
        stationId: "station-000",
        role: "return"
    }));
};

socket.onmessage = async (event) => {
    const data = JSON.parse(event.data);

    if (data.type === "uid") {
        console.log("Received UID: ", data.uid);
        resetTimer()
        handleUID(data.uid);
    }
};

async function handleUID(uid) {
    if (scannedBooks.includes(uid)) return;
    try {
        const res = await fetch("/get-book", {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify({uid})
        });

        const data = await res.json();

        if (!res.ok) {
            showNotification("Book Invalid: " + data.error);
            return;
        }

        if (data.isAvailable) {
            showNotification("Buku belum dipinjam!");
            return;
        }

        scannedBooks.push(uid);
        addBookCard(data, uid);
        document.getElementById("screen-welcome").classList.add("hidden");
        showScreen("screen-books");
    } catch (err) {
        showNotification("Error getting book info: " + err);
    }
}

function showScreen(id) {
    document.getElementById(id).classList.remove("hidden");
}

function addBookCard(book, uid) {
    const bookList = document.getElementById("book-list");
    const template = document.createElement("template");

    template.innerHTML = `
        <div class="book-card">
            <div class="book-item">
            <img src="${book.cover || '../assets/cover_placeholder.png'}" alt="cover">
                <div class="book-info">
                    <p class="book-title">${book.title}</p>
                    <p>Author: ${book.author}</p>
                    <p>Status: <span class="${book.isAvailable ? "status-success" : "status-failed"}">${book.status}</span></p>
                </div>
                <button onclick="deleteBookCard(event, '${uid}')" class="delete-button">X</button>
            </div>
        </div>
    `.trim();

    bookList.appendChild(template.content.firstChild);
}

function deleteBookCard(event, uidToRemove) {
    scannedBooks = scannedBooks.filter(uid => uid !== uidToRemove);

    const button = event.target;
    const bookCard = button.closest(".book-card");

    if (bookCard)
        bookCard.remove();

    if (scannedBooks.length === 0)
        cancelBooks();
}

function cancelBooks() {
    scannedBooks = [];
    const container = document.getElementById("book-list");
    container.innerHTML = "";
    document.getElementById("screen-welcome").classList.remove("hidden");
    document.getElementById("screen-books").classList.add("hidden");
}

async function finishReturn() {
    let allSuccess = true;
    for (const bookUID of scannedBooks) {
        const res = await fetch("/return-book", {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify({ bookUID })
        });

        if (!res.ok) {
            allSuccess = false;
            break;
        }
    }

document.querySelectorAll(".delete-button").forEach(button => {
        button.classList.add("hidden");
    });
    document.getElementById("book-button").classList.add("hidden");
    const notif = document.getElementById("status-notification");
    notif.textContent = allSuccess ? "Returning Book Success" : "Returning Book Failed";
    notif.classList.add(allSuccess ? "status-success" : "status-failed");

    const returnDate = new Date();
    
    const formatDate = (date) => {
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
        const year = date.getFullYear(); // Full 4-digit year
        return `${day}-${month}-${year}`;
    };

    document.getElementById("return-date").textContent = formatDate(returnDate);
    showScreen("screen-status");
    setTimeout(() => location.reload(), 5000);
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