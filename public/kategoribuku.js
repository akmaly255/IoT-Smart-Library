let kategoriAktif = null;
const daftarBuku = document.getElementById("daftar-buku");

async function tampilkanBuku(kategori) {
  daftarBuku.innerHTML = "<p>Loading...</p>";

  try {
    const response = await fetch("/books-by-category", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: kategori })
    });

    const books = await response.json();

    if (books.error) {
      daftarBuku.innerHTML = `<p>${books.error}</p>`;
      return;
    }

    if (!books.length) {
      daftarBuku.innerHTML = "<p>Tidak ada buku ditemukan.</p>";
      return;
    }

    daftarBuku.innerHTML = "";

    books.forEach(buku => {
      const bukuDiv = document.createElement("div");
      bukuDiv.classList.add("buku-item");

      bukuDiv.innerHTML = `
        <img src="${buku.cover || 'assets/cover_placeholder.png'}" alt="${buku.title}">
        <div class="buku-info">
          <strong>${buku.title}</strong>
          <small>Author: ${buku.author || 'Penulis tidak diketahui'}</small>
          <p>Status: <span class="${buku.status === 'Tersedia' ? 'status-tersedia' : 'status-tidak'}">
             ${buku.status || 'Status tidak diketahui'}
          </span></p>
        </div>
      `;

      daftarBuku.appendChild(bukuDiv);
    });

  } catch (error) {
    console.error("Gagal mengambil data:", error);
    daftarBuku.innerHTML = "<p>Gagal mengambil data dari server.</p>";
  }
}

// Event listener kategori
document.querySelectorAll(".category").forEach(el => {
  el.addEventListener("click", () => {
    kategoriAktif = el.querySelector("p").textContent.toLowerCase();
    document.getElementById("hasilPencarian").innerHTML = "";
    document.getElementById("searchInput").value = "";
    tampilkanBuku(kategoriAktif);
  });
});