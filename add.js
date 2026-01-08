import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  set
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

/* =====================
   FIREBASE INIT
===================== */
const firebaseConfig = {
  apiKey: "AIzaSyCgeS0Qo-2K1RQ2his1lwhgSfVtIMlCfZw",
  authDomain: "personalised-surprise.firebaseapp.com",
  databaseURL: "https://personalised-surprise-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "personalised-surprise",
  storageBucket: "personalised-surprise.appspot.com",
  messagingSenderId: "847601751688",
  appId: "1:847601751688:web:023d58ce5200eca9ff313d"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

/* =====================
   NAVIGATION
===================== */
document.getElementById("home")?.addEventListener("click", () => {
  location.href = "index.html";
});

document.getElementById("discount")?.addEventListener("click", () => {
  location.href = "discount.html";
});

document.getElementById("order")?.addEventListener("click", () => {
  location.href = "order.html";
});

/* =====================
   FORM LOGIC
===================== */
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
      /* BASIC INFO */
      const product = {
        name: getValue("product-name"),
        description: getValue("product-desc"),
        price: Number(getValue("product-price")),
        type: getValue("product-type"),
        badge: getValue("product-badge"),
        deliveryTime: getValue("delivery-time"),
        customizable: document.getElementById("customizable")?.checked || false,
        occasion: getCheckedValues("occasion"),
        forWhom: getCheckedValues("forWhom"),
        images: [],
        createdAt: Date.now()
      };

      if (!product.name || !product.price) {
        alert("Please fill required fields");
        throw new Error("Missing fields");
      }

      /* IMAGE HANDLING (TEMP BASE64) */
      if (imageInput.files.length === 0) {
        alert("Please upload at least one image");
        throw new Error("No images");
      }

      for (const file of imageInput.files) {
        const base64 = await toBase64(file);
        product.images.push(base64);
      }

      /* SAVE TO DB */
      const productsRef = ref(db, "products");
      const newProductRef = push(productsRef);

      await set(newProductRef, product);

      alert("✅ Product added successfully!");
      form.reset();
      location.href = "index.html";

    } catch (err) {
      console.error(err);
      alert("❌ Failed to add product");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Add Product";
    }
  });
});

/* =====================
   HELPERS
===================== */
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
