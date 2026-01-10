/* =========================
   FIREBASE IMPORTS
========================= */
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  get
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

/* =========================
   FIREBASE CONFIG
========================= */
const firebaseConfig = {
  apiKey: "AIzaSyCgeS0Qo-2K1RQ2his1lwhgSfVtIMlCfZw",
  authDomain: "personalised-surprise.firebaseapp.com",
  databaseURL: "https://personalised-surprise-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "personalised-surprise",
  storageBucket: "personalised-surprise.appspot.com",
  messagingSenderId: "847601751688",
  appId: "1:847601751688:web:023d58ce5200eca9ff313d"
};

/* =========================
   INIT FIREBASE
========================= */
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

/* =========================
   NAVIGATION
========================= */
document.getElementById("home")?.addEventListener("click", () => {
  location.href = "index.html";
});

document.getElementById("discount")?.addEventListener("click", () => {
  location.href = "discount.html";
});

document.getElementById("order")?.addEventListener("click", () => {
  location.href = "order.html";
});

/* =========================
   FORM LOGIC
========================= */
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".product-form");
  const submitBtn = document.querySelector(".primary-btn");
  const imageInput = document.getElementById("image-upload");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    submitBtn.disabled = true;
    submitBtn.textContent = "Uploading...";

    try {
      /* =========================
         GET FORM DATA
      ========================= */
      const name = getValue("product-name");
      const description = getValue("product-desc");
      const price = Number(getValue("product-price"));
      const categoryRaw = getValue("product-type"); // category input
      const badge = getValue("product-badge");
      const deliveryTime = getValue("delivery-time");
      const customizable = document.getElementById("customizable")?.checked || false;
      const occasion = getCheckedValues("occasion");
      const forWhom = getCheckedValues("forWhom");

      if (!name || !price || !categoryRaw) {
        alert("Please fill required fields");
        throw new Error("Missing fields");
      }

      if (!imageInput.files.length) {
        alert("Please upload at least one image");
        throw new Error("No images");
      }

      /* =========================
         CREATE SAFE IDS
      ========================= */
      const categoryId = categoryRaw
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "");

      const productId = name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "");

      const productRef = ref(db, `products/${categoryId}/${productId}`);

      /* =========================
         PREVENT DUPLICATE PRODUCT
      ========================= */
      const existing = await get(productRef);
      if (existing.exists()) {
        alert("Product already exists in this category!");
        throw new Error("Duplicate product");
      }

      /* =========================
         IMAGE → BASE64
      ========================= */
      const images = [];
      for (const file of imageInput.files) {
        const base64 = await toBase64(file);
        images.push(base64);
      }

      /* =========================
         FINAL PRODUCT OBJECT
      ========================= */
      const product = {
        productId,
        name,
        description,
        price,
        category: categoryId,
        badge,
        deliveryTime,
        customizable,
        occasion,
        forWhom,
        images,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        status: "active"
      };

      /* =========================
         SAVE TO FIREBASE
      ========================= */
      await set(productRef, product);

      alert("✅ Product added successfully!");
      form.reset();
      location.href = "index.html";

    } catch (error) {
      console.error(error);
      alert("❌ Failed to add product");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Add Product";
    }
  });
});

/* =========================
   HELPER FUNCTIONS
========================= */
function getValue(id) {
  return document.getElementById(id)?.value.trim() || "";
}

function getCheckedValues(name) {
  return Array.from(
    document.querySelectorAll(`input[name="${name}"]:checked`)
  ).map(el => el.value);
}

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
