/* ===============================
   FIREBASE IMPORTS
================================ */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  remove
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";

/* ===============================
   FIREBASE CONFIG
================================ */
const firebaseConfig = {
  apiKey: "AIzaSyCgeS0Qo-2K1RQ2his1lwhgSfVtIMlCfZw",
  authDomain: "personalised-surprise.firebaseapp.com",
  databaseURL: "https://personalised-surprise-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "personalised-surprise",
  storageBucket: "personalised-surprise.appspot.com",
  messagingSenderId: "847601751688",
  appId: "1:847601751688:web:023d58ce5200eca9ff313d"
};

/* ===============================
   INIT
================================ */
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

/* ===============================
   DOM ELEMENTS
================================ */
const productsContainer = document.querySelector(".products");
const searchInput = document.getElementById("searchInput");
const loader = document.getElementById("loader");

/* ===============================
   NAVIGATION
================================ */
document.getElementById("add")?.addEventListener("click", () => {
  location.href = "add.html";
});

document.getElementById("discount")?.addEventListener("click", () => {
  location.href = "discount.html";
});

document.getElementById("order")?.addEventListener("click", () => {
  location.href = "order.html";
});

/* ===============================
   STATE
================================ */
let allProducts = [];

/* ===============================
   DATABASE REF
================================ */
const productsRef = ref(db, "products");

/* ===============================
   FETCH PRODUCTS
================================ */
loader.style.display = "block";

onValue(productsRef, (snapshot) => {
  loader.style.display = "none";
  allProducts = [];
  productsContainer.innerHTML = "";

  if (!snapshot.exists()) {
    renderEmptyState();
    return;
  }

  snapshot.forEach((categorySnap) => {
    const categoryId = categorySnap.key;
    const productsObj = categorySnap.val();

    Object.keys(productsObj).forEach((productId) => {
      const product = productsObj[productId];

      allProducts.push({
        category: categoryId,
        productId,
        ...product
      });
    });
  });

  renderProducts(allProducts);
});

/* ===============================
   RENDER PRODUCTS
================================ */
function renderProducts(products) {
  productsContainer.innerHTML = "";

  if (products.length === 0) {
    renderEmptyState();
    return;
  }

  const grouped = groupByCategory(products);

  Object.keys(grouped).forEach((category) => {
    const heading = document.createElement("h2");
    heading.textContent =
      category.charAt(0).toUpperCase() + category.slice(1);
    productsContainer.appendChild(heading);

    const list = document.createElement("div");
    list.className = "list";

    grouped[category].forEach((product) => {
      list.appendChild(createProductCard(product));
    });

    productsContainer.appendChild(list);
  });
}

/* ===============================
   PRODUCT CARD
================================ */
function createProductCard(product) {
  const card = document.createElement("div");
  card.className = "product";

  const imageArray = product.images
    ? Array.isArray(product.images)
      ? product.images
      : Object.values(product.images)
    : [];

  card.innerHTML = `
    <div class="image-wrapper">
      <img src="${imageArray[0] || "placeholder.jpg"}" alt="${product.name}">
    </div>

    <h3>${product.name}</h3>
    <p class="price">₹ ${product.price}</p>

    <!-- 🔥 FIXED CLASS -->
    <div class="product-actions">
      <button class="edit">Edit</button>
      <button class="delete">Delete</button>
    </div>
  `;

  /* VIEW PRODUCT */
  card.addEventListener("click", (e) => {
    if (e.target.tagName === "BUTTON") return;

    location.href = `product.html?category=${encodeURIComponent(
      product.category
    )}&id=${encodeURIComponent(product.productId)}`;
  });

  /* EDIT */
  card.querySelector(".edit").addEventListener("click", (e) => {
    e.stopPropagation();
    location.href = `edit.html?category=${encodeURIComponent(
      product.category
    )}&id=${encodeURIComponent(product.productId)}`;
  });

  /* DELETE */
  card.querySelector(".delete").addEventListener("click", (e) => {
    e.stopPropagation();
    deleteProduct(product);
  });

  return card;
}


/* ===============================
   SEARCH
================================ */
searchInput.addEventListener("input", (e) => {
  const term = e.target.value.toLowerCase();

  const filtered = allProducts.filter((p) =>
    p.name.toLowerCase().includes(term) ||
    p.category.toLowerCase().includes(term)
  );

  renderProducts(filtered);
});

/* ===============================
   DELETE PRODUCT
================================ */
function deleteProduct(product) {
  const confirmDelete = confirm(`Delete "${product.name}"?`);
  if (!confirmDelete) return;

  const productRef = ref(
    db,
    `products/${product.category}/${product.productId}`
  );

  remove(productRef)
    .then(() => alert("✅ Product deleted"))
    .catch(() => alert("❌ Failed to delete product"));
}

/* ===============================
   HELPERS
================================ */
function groupByCategory(products) {
  return products.reduce((acc, p) => {
    acc[p.category] = acc[p.category] || [];
    acc[p.category].push(p);
    return acc;
  }, {});
}

function renderEmptyState() {
  productsContainer.innerHTML = `
    <div class="empty-state">
      <p>No products found.</p>
    </div>
  `;
}
