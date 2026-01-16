const socket = new WebSocket("ws://localhost:3000");

const timeoutDuration = 10000;
let inactivityTimer;
let scannedBooks = [];
let isScanningBooks = true;
let isScanningMember = false;
let memberUID;

socket.onopen = () => {
    socket.send(JSON.stringify({
        type: "register",
        stationId: "station-000",
        role: "borrow"
    }));
};
// TODO: add error handling
socket.onmessage = async (event) => {
    const data = JSON.parse(event.data);

    if (data.type === "uid") {
        console.log("Received UID: ", data.uid);
        resetTimer()
        handleUID(data.uid);   
    }
};

// TODO:
// Add borrowing time and Due Date
// Show error message to the web page
// show loading animations
// do reload when no input detected within 5 seconds

async function handleUID(uid) {
    if (isScanningBooks) {
        if (scannedBooks.includes(uid)) {
            return;
        }

        try {
            const res = await fetch("/get-book", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ uid })
            });

            const data = await res.json();

            if (!res.ok) {
                showNotification("Book invalid: " + data.error);
                return;
            }
            if (!data.isAvailable) {
                showNotification("Buku tidak tersedia!");
                return;
            }

            scannedBooks.push(uid);
            addBookCard(data, uid);
            document.getElementById("screen-welcome").classList.add("hidden");
            showScreen("screen-books");
        } catch (error) {
            console.error("Error getting book info: " + error);
        }
    } else if (isScanningMember) {
        try {
            const res = await fetch("/get-member", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ uid })
            });

            const data = await res.json();
            if (!res.ok) {
                showNotification("Member invalid:" + data.error);
                return;
            }

            memberUID = uid;
            document.getElementById("member-prompt").classList.add("hidden");
            addMemberCard(data);
            isScanningMember = false;
            document.getElementById("finish-button").classList.remove("hidden");
        } catch (error) {
            showNotification("Error getting member info: " + error);
            console.error("Error getting member info: " + error);
        }
    } 
}

function showScreen(id) {
    document.getElementById(id).classList.remove("hidden");
}

function scanMember() {
    isScanningBooks = false;
    isScanningMember = true;
    document.getElementById("book-button").classList.add("hidden");
    document.getElementById("member-prompt").classList.remove("hidden");
    document.querySelectorAll(".delete-button").forEach(button => {
        button.classList.add("hidden");
    });
    showScreen("screen-member");
}

async function finishBorrow() {
    let allSuccess = true;
    for (const bookUID of scannedBooks) {
        const res = await fetch("/borrow-book", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ memberUID, bookUID})
        });

        if (!res.ok) {
            allSuccess = false;
            break;
        }
    }
    
    document.getElementById("delete-member").classList.add("hidden");
    // TODO: Change notification color based on the borrowing result
    const notif = document.getElementById("status-notification");
    notif.textContent = allSuccess ? "Borrowing Book Success" : "Borrowing Book Failed";
    notif.classList.add(allSuccess ? "status-success" : "status-failed");

    const borrowDate = new Date();
    const returnDate = new Date();
    returnDate.setDate(borrowDate.getDate() + 7);
    
    const formatDate = (date) => {
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
        const year = date.getFullYear(); // Full 4-digit year
        return `${day}-${month}-${year}`;
    };

    
    document.getElementById("borrow-date").textContent = formatDate(borrowDate);
    document.getElementById("return-date").textContent = formatDate(returnDate);
    document.getElementById("member-button").classList.add("hidden");
    showScreen("screen-status");
    setTimeout(() => location.reload(), 5000);
}

function cancelMember() {
    memberUID = null;
    isScanningBooks = true;
    isScanningMember = false;
    const memberCard = document.querySelector(".member-card");
    if (memberCard) {
        memberCard.remove();
    }
    document.getElementById("book-button").classList.remove("hidden");
    document.getElementById("finish-button").classList.add("hidden");
    document.querySelectorAll(".delete-button").forEach(button => {
        button.classList.remove("hidden");
    });
    document.getElementById("screen-member").classList.add("hidden");
}

function cancelBooks() {
    scannedBooks = [];
    memberUID = null;
    const container = document.getElementById("book-list");
    container.innerHTML = "";
    document.getElementById("screen-welcome").classList.remove("hidden");
    document.getElementById("screen-books").classList.add("hidden");
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
  
function addMemberCard(member) {
    const memberScreen = document.getElementById("screen-member");
    const button = document.getElementById("member-button");
    const template = document.createElement("template");

    template.innerHTML = `
        <div class="member-card">
            <img src="${member.picture || '../assets/profile_placeholder.png'}" alt="profile-picture">
            <div id="member-information">
                <p><strong>Name : </strong>${member.name}</p>
                <p><strong>Role : </strong>${member.role}</p>
                <p><strong>Class : </strong>${member.class}<p>
            </div>
            <button onclick="deleteMemberCard()" class="delete-button" id="delete-member">X</button>
        </div>
    `.trim();
    const memberCardHTML = template.content.firstChild;

    memberScreen.insertBefore(memberCardHTML, button)
}
  
function deleteBookCard(event, uidToRemove) {
    scannedBooks = scannedBooks.filter(uid => uid !== uidToRemove);

    const button = event.target;
    const bookCard = button.closest(".book-card");

    if (bookCard) {
        bookCard.remove();
    }

    if (scannedBooks.length === 0) {
        cancelBooks();
    }
}

function deleteMemberCard() {
    memberUID = null;
    isScanningMember = true;
    const memberCard = document.querySelector(".member-card");
    if (memberCard) {
        memberCard.remove();
    }
    document.getElementById("member-prompt").classList.remove("hidden");
    document.getElementById("finish-button").classList.add("hidden");
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