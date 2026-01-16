const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const db = require("./firebase-config");
const path = require("path");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const port = 3000;

app.use(express.static(path.join(__dirname, "../public")));
app.use(cors());
app.use(bodyParser.json());

wss.on("connection", (ws) => {
    ws.stationId = null;
    ws.role = null

    console.log("📡 New WebSocket client connected")

    ws.on("message", (message) => {
        try {
            const data = JSON.parse(message);

            if (data.type === "register") {
                ws.stationId = data.stationId; // E.g. Station-000
                ws.role = data.role; // Borrow or Return
                console.log(`Registered Client: station = ${ws.stationId}, role= ${ws.role}`);
            }
            
            if (data.type === "uid") {
                const { uid } = data;

                console.log(`UID from Station ${ws.stationId}: ${uid}`);

                wss.clients.forEach(client => {
                    if (
                        client != ws &&
                        client.readyState === WebSocket.OPEN &&
                        client.stationId === ws.stationId
                    ) {
                        client.send(JSON.stringify({ type: "uid", uid }));
                    }
                });
            }
        } catch (err) {
            console.error("Error Parsing message: ", err);
        }
    });

    ws.on("close", () => {
       console.log(`Client Disconected (station= ${ws.stationId}, role= ${ws.role})`) 
    });
});

app.post("/get-book", async (req, res) => {
    const { uid } = req.body;

    if (!uid) {
        return res.status(400).json({error: "UID Missing"});
    }

    try {
        const bookRef = db.ref("Buku/" + uid);
        const snapshot = await bookRef.once("value");
        const bookData = snapshot.val();

        if (!bookData) {
            return res.status(404).json({error: "Book not found!"});
        }
        return res.json(bookData)
    } catch (err) {
        return res.status(500).json({error: err.message});
    }
});

app.post("/get-member", async (req, res) => {
    const { uid } = req.body;

    if (!uid) {
        return res.status(400).json({ error: "UID Missing" });
    }

    try {
        const memberRef = db.ref("Anggota/" + uid);
        const snapshot = await memberRef.once("value");
        const memberData = snapshot.val();

        if (!memberData) {
            return res.status(404).json({ error: "Member not found!" });
        }
        return res.json(memberData);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
// TODO: Add return due date
app.post("/borrow-book", async (req, res) => {
    const { memberUID, bookUID } = req.body;

    if (!memberUID || !bookUID) {
        return res.status(400).send("Missing UID(s)");
    }

    try {
        const memberRef = db.ref("Anggota/" + memberUID);
        const bookRef = db.ref("Buku/" + bookUID);

        const [memberSnap, bookSnap] = await Promise.all([
            memberRef.once("value"),
            bookRef.once("value")
        ]);

        const member = memberSnap.val();
        const book = bookSnap.val();

        if (!member) return res.status(404).send("Member Not Found!");
        if (!book) return res.status(404).send("Book Not Found!");
        if (!book.isAvailable) return res.status(400).send("Buku sudah dipinjam.");

        const timestamp = Date.now();

        await bookRef.update({
            isAvailable: false,
            status: "Dipinjam",
            borrowedBy: memberUID,
            borrowedAt: timestamp
        });

        return res.send("Peminjaman Buku Berhasil!");
    } catch (err) {
        return res.status(500).send("Error: " + err.message);
    }
});
// TODO: add return time to the log
app.post("/return-book", async (req, res) => {
    const { bookUID } = req.body;

    if (!bookUID) {
        res.status(400).send("Missing UID(s)!")
    }

    try {
        const bookRef = db.ref("Buku/" + bookUID);

        const bookSnap = await bookRef.once("value");

        const book = bookSnap.val();

        if (!book) return res.status(404).send("Book not found!");
        if (book.isAvailable) return res.status(400).send("Buku belum bipinjam!");

        await bookRef.update({
            isAvailable: true,
            status: "Tersedia",
            borrowedBy: "-",
            borrowedAt: "-"
        });

        return res.send("Pengembalian buku berhasil!");
    } catch (err) {
        return res.status(500).send("Error: " + err.message);
    }
});

app.post("/search-books", async (req, res) => {
    const { keyword } = req.body;

    if (!keyword) {
        return res.status(400).json({ error: "Keyword is missing" });
    }

    try {
        bookRef = db.ref("Buku");
        const snapshot = await bookRef.once("value");
        const booksData = snapshot.val();

        const lowerKeyword = keyword.toLowerCase();
        const results = [];

        for (const uid in booksData) {
            const book = booksData[uid];

            const match =
                (book.title && book.title.toLowerCase().includes(lowerKeyword)) ||
                (book.author && book.author.toLowerCase().includes(lowerKeyword)) ||
                (Array.isArray(book.category) && book.category.some(cat => cat.toLowerCase().includes(lowerKeyword))) ||
                (book.year && book.year.toString().includes(lowerKeyword));
            
            if (match) {
                results.push({ uid, ...book });
            }
        }

        return res.status(200).json(results)
    } catch(err){
        return res.status(404).json({ error: err.message });
    }
});

app.post("/books-by-category", async (req, res) => {
    const { category } = req.body;

    if (!category) {
        return res.status(400).json({ error: "Category is missing" });
    }

    try {
        const bookRef = db.ref("Buku");
        const snapshot = await bookRef.once("value");
        const booksData = snapshot.val();

        const lowerKeyword = category.toLowerCase();
        const results = [];

        for (const uid in booksData) {
            const book = booksData[uid];
            
            if (
                Array.isArray(book.category) &&
                book.category.some(cat => cat.toLowerCase().includes(lowerKeyword))
            ) {
                results.push({ uid, ...book });
            }
        }

        return res.status(200).json(results);
    } catch (err) {
        return res.status(404).json({ error: err.message });
    }
});

app.post("/add-book", async (req, res) => {
    const { uid, bookData } = req.body;

    if (!uid) {
        return res.status(400).json({ error: "Missing UID" });
    }

    if (!bookData) {
        return res.status(400).json({ error: "Missing book infromation" });
    }
    
    try {
        const bookRef = db.ref("Buku/" + uid);  
        await bookRef.set(bookData);            
        return res.status(200).json({ message: "Book added successfully." });
    } catch (error) {
        console.error("Error adding book:", error);
        return res.status(500).json({ error: "Failed to add book." });
    }
});

server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});