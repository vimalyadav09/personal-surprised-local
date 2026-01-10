/* ===============================
   FIREBASE IMPORTS
================================ */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
  update
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";

/* ===============================
   FIREBASE CONFIG
================================ */
const firebaseConfig = {
  apiKey: "AIzaSyCgeS0Qo-2K1RQ2his1lwhgSfVtIMlCfZw",
  authDomain: "personalised-surprise.firebaseapp.com",
  databaseURL:
    "https://personalised-surprise-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "personalised-surprise",
  storageBucket: "personalised-surprise.appspot.com",
  messagingSenderId: "847601751688",
  appId: "1:847601751688:web:023d58ce5200eca9ff313d"
};

/* ===============================
   INIT FIREBASE
================================ */
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

/* ===============================
   WAIT FOR DOM
================================ */
document.addEventListener("DOMContentLoaded", () => {

  /* ===============================
     QUERY PARAMS
  ================================ */
  const params = new URLSearchParams(window.location.search);
  const category = params.get("category");
  const productId = params.get("id");

  if (!category || !productId) {
    alert("Invalid product link");
    return;
  }

  /* ===============================
     DOM ELEMENTS (SAFE)
  ================================ */
  const preview = document.getElementById("imagePreview");
  const newImagesInput = document.getElementById("newImages");
  const saveBtn = document.querySelector(".save-btn");

  const nameInput = document.getElementById("product-name");
  const descInput = document.getElementById("product-desc");
  const priceInput = document.getElementById("product-price");
  const badgeInput = document.getElementById("product-badge");
  const deliveryInput = document.getElementById("delivery-time");
  const customizableInput = document.getElementById("customizable");

  if (!nameInput || !priceInput) {
    console.error("❌ Input IDs missing in edit.html");
    return;
  }

  let images = [];

  /* ===============================
     LOAD PRODUCT
  ================================ */
  async function loadProduct() {
    try {
      const snap = await get(ref(db, `products/${category}/${productId}`));

      if (!snap.exists()) {
        alert("Product not found");
        return;
      }

      const product = snap.val();

      /* FILL INPUTS */
      nameInput.value = product.name || "";
      descInput.value = product.description || "";
      priceInput.value = product.price || "";
      badgeInput.value = product.badge || "";
      deliveryInput.value = product.deliveryTime || "";
      customizableInput.checked = product.customizable || false;

      /* LOAD IMAGES */
      images = Array.isArray(product.images)
        ? product.images
        : Object.values(product.images || {});

      renderImages();

    } catch (err) {
      console.error(err);
      alert("Failed to load product");
    }
  }

  loadProduct();

  /* ===============================
     RENDER IMAGES
  ================================ */
  function renderImages() {
    preview.innerHTML = "";

    images.forEach((img, index) => {
      const box = document.createElement("div");
      box.className = "image-box";

      box.innerHTML = `
        <img src="${img}">
        <button type="button">&times;</button>
      `;

      box.querySelector("button").addEventListener("click", () => {
        images.splice(index, 1);
        renderImages();
      });

      preview.appendChild(box);
    });
  }

  /* ===============================
     ADD MORE IMAGES
  ================================ */
  newImagesInput?.addEventListener("change", async () => {
    for (const file of newImagesInput.files) {
      const base64 = await toBase64(file);
      images.push(base64);
    }
    renderImages();
    newImagesInput.value = "";
  });

  /* ===============================
     SAVE PRODUCT
  ================================ */
  saveBtn.addEventListener("click", async () => {
    if (!nameInput.value || !priceInput.value) {
      alert("Name and price are required");
      return;
    }

    if (images.length === 0) {
      alert("At least one image required");
      return;
    }

    const updatedProduct = {
      name: nameInput.value.trim(),
      description: descInput.value.trim(),
      price: Number(priceInput.value),
      badge: badgeInput.value.trim(),
      deliveryTime: deliveryInput.value.trim(),
      customizable: customizableInput.checked,
      images,
      updatedAt: Date.now()
    };

    try {
      await update(
        ref(db, `products/${category}/${productId}`),
        updatedProduct
      );

      alert("✅ Product updated successfully");
      location.href = "product.html";

    } catch (err) {
      console.error(err);
      alert("❌ Failed to update product");
    }
  });
});

/* ===============================
   FILE → BASE64
================================ */
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
