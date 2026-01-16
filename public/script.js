var tombolMenu = $(".tombol-menu");
var menu = $("nav .menu ul")

function klikMenu(){
  tombolMenu.click(function(){
      menu.toggle();
  });
  menu.click(function(){
      menu.toggle();
  });
}
$(document).ready(function() {
  var width = $(window).width();
  if(width < 990) {
      klikMenu();
  }
})

//check lebar
$ (window).resize(function(){
  var width = $(window).width();
  if (width > 989){
      menu.css("display","block");
      //display:block
  }else{
      menu.css("display","none")
  }
  klikMenu();
});

//efek scroll
$(document).ready(function(){
  var scroll_pos = 0;
  $(document).scroll(function(){
      scroll_pos= $(this).scrollTop();
      if(scroll_pos>0){
          $("nav").addClass("putih");
      }else{
          $("nav").removeClass("putih");
      }

  })
});

async function cariBuku() {
  document.getElementById("daftar-buku").innerHTML = "";
  try {
    const query = document.getElementById("searchInput").value;
    const res = await fetch("/search-books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keyword: query })
    });

    const data = await res.json();

    if (!res.ok) {
      console.log("Error: ", data.error);
      return;
    }

    const listHasil = document.getElementById("hasilPencarian");
    listHasil.innerHTML = "";
  
    if (data.length === 0) {
      listHasil.innerHTML = "<li>Buku tidak ditemukan</li>";
    } else {
      data.forEach(buku => {
        const item = document.createElement("li");
        item.style.display = "flex";
        item.style.alignItems = "center";
        item.style.marginBottom = "15px";
  
        // cover image
        const img = document.createElement("img");
        img.src = buku.cover ? buku.cover : "assets/cover_placeholder.png";
        img.alt = buku.judul;
        img.style.width = "60px";
        img.style.height = "80px";
        img.style.objectFit = "cover";
        img.style.marginRight = "15px";
  
        // text container
        const textDiv = document.createElement("div");
        textDiv.classList.add("book-info");
        const judul = document.createElement("p");
        judul.textContent = `${buku.title}`;
        judul.style.fontWeight = "bold";  
        judul.style.margin = "0";
        
        const penulis = document.createElement("p");
        penulis.textContent = `Penulis: ${buku.author}`;
        penulis.style.margin = "0";
        
        const isbn = document.createElement("p");
        isbn.textContent = `ISBN: ${buku.isbn}`;
        isbn.style.margin = "0";

        const publicationYear = document.createElement("p");
        publicationYear.textContent = `Tahun Terbit: ${buku.publication_year}`;
        publicationYear.style.margin = "0";

        const language = document.createElement("p");
        language.textContent = `Bahasa: ${buku.language}`;
        language.style.margin = "0";

        const status = document.createElement("p");
        status.style.margin = "0";

        const statusPrompt = document.createElement("span")
        statusPrompt.classList.add(buku.isAvailable ? "status-tersedia" : "status-tidak")
        statusPrompt.textContent = `${buku.status}`;
        status.append("Status: ", statusPrompt);

        textDiv.appendChild(judul);
        textDiv.appendChild(penulis);
        textDiv.appendChild(isbn);
        textDiv.appendChild(publicationYear);
        textDiv.appendChild(language);
        textDiv.appendChild(status);
  
        item.appendChild(img);
        item.appendChild(textDiv);
  
        listHasil.appendChild(item);
        });
      }
  } catch (err) {
    console.log("Error: " + err.message);
    }
}
  
searchInput.addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    cariBuku();
  }
});