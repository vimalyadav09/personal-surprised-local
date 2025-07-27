// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCgeS0Qo-2K1RQ2his1lwhgSfVtIMlCfZw",
  authDomain: "personalised-surprise.firebaseapp.com",
  databaseURL: "https://personalised-surprise-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "personalised-surprise",
  storageBucket: "personalised-surprise.appspot.com",
  messagingSenderId: "847601751688",
  appId: "1:847601751688:web:023d58ce5200eca9ff313d",
  measurementId: "G-64EDC5QHJT"
};

// Navigation
document.getElementById("add").addEventListener("click", () => {
  window.location.href = "add.html";
});
document.getElementById("discount").addEventListener("click", () => {
  window.location.href = "discount.html";
});
document.getElementById("order").addEventListener("click", () => {
  window.location.href = "order.html";
});

// Firebase init
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// DOM container
const productsContainer = document.querySelector(".products");

// DB ref
const productRef = ref(db, "Personalised Surprise/products");

// Fetch and display
onValue(productRef, (snapshot) => {
  productsContainer.innerHTML = "";

  snapshot.forEach((categorySnap) => {
    const categoryName = categorySnap.key;
    const categoryData = categorySnap.val();

    // Category heading
    const categoryHeading = document.createElement("h2");
    categoryHeading.textContent = categoryName;
    productsContainer.appendChild(categoryHeading);

    // List container
    const listDiv = document.createElement("div");
    listDiv.className = "list";
    listDiv.style.display = "flex";
    listDiv.style.overflowX = "auto";
    listDiv.style.scrollBehavior = "smooth";
    listDiv.style.gap = "20px";
    listDiv.style.padding = "10px 0";

    // Products
    for (let productName in categoryData) {
      const product = categoryData[productName];
      const productDiv = document.createElement("div");
      productDiv.className = "product";
      productDiv.style.minWidth = "150px";
      productDiv.style.flex = "0 0 auto";
      productDiv.style.border = "1px solid #ddd";
      productDiv.style.borderRadius = "10px";
      productDiv.style.padding = "10px";
      productDiv.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
      productDiv.style.cursor = "pointer";
      productDiv.style.background = "#fff";

      // Image
      if (product.images && Array.isArray(product.images)) {
        const imageContainer = document.createElement("div");
        const imgWrapper = document.createElement("div");
        imgWrapper.style.width = "150px";
        imgWrapper.style.height = "120px";
        imgWrapper.style.overflow = "hidden";
        imgWrapper.style.borderRadius = "10px";

        const img = document.createElement("img");
        img.src = product.images[0];
        img.style.width = "100%";
        img.style.height = "100%";
        img.style.objectFit = "cover";

        imgWrapper.appendChild(img);
        imageContainer.appendChild(imgWrapper);
        productDiv.appendChild(imageContainer);
      }

      const title = document.createElement("h3");
      title.textContent = productName;
      productDiv.appendChild(title);

      const price = document.createElement("h2");
      price.textContent = `₹ ${product.price}`;
      productDiv.appendChild(price);

      productDiv.addEventListener("click", () => {
        const url = `product.html?category=${encodeURIComponent(categoryName)}&name=${encodeURIComponent(productName)}`;
        window.location.href = url;
      });

      listDiv.appendChild(productDiv);
    }

    productsContainer.appendChild(listDiv);
  });
});
