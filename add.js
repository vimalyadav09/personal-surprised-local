/* ================= FIREBASE IMPORTS ================= */
import { initializeApp } from
  "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  get
} from
  "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";

/* ================= FIREBASE CONFIG ================= */
const firebaseConfig = {
  apiKey: "AIzaSyALT8BxBAdagSeaAjo9F2aogjaYFctIAEI",
  authDomain: "personalized-surprises.firebaseapp.com",
  databaseURL: "https://personalized-surprises-default-rtdb.firebaseio.com",
  projectId: "personalized-surprises",
  storageBucket: "personalized-surprises.firebasestorage.app",
  messagingSenderId: "270931064294",
  appId: "1:270931064294:web:a12ee5118035445c735227"
};

/* ================= INIT ================= */
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

/* ================= DOM READY ================= */
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".product-form");
  const submitBtn = document.querySelector(".primary-btn");
  const imageInput = document.getElementById("image-upload");

  if (!form || !submitBtn || !imageInput) {
    console.error("❌ Required form elements missing");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    submitBtn.disabled = true;
    submitBtn.textContent = "Uploading...";

    try {
      /* ================= READ VALUES ================= */
      const name = getValue("product-name");
      const shortdescription = getValue("short-desc");
      const longdescription = getValue("long-desc");
      const price = Number(getValue("product-price"));
      const categoryRaw = getValue("product-type");
      const badge = getValue("product-badge");
      const deliveryTime = getValue("delivery-time");

      const customizable =
        document.getElementById("customizable")?.checked === true;

      const occasion = getCheckedValues("occasion");
      const forWhom = getCheckedValues("forWhom");

      /* ================= VALIDATION ================= */
      if (!name || !price || !categoryRaw) {
        alert("Please fill all required fields");
        throw new Error("Missing required fields");
      }

      if (!imageInput.files.length) {
        alert("Please upload at least one image");
        throw new Error("No images selected");
      }

      /* ================= SAFE IDS ================= */
      const categoryId = toSafeId(categoryRaw);
      const productId = toSafeId(name);

      const productRef = ref(db, `products/${categoryId}/${productId}`);

      /* ================= DUPLICATE CHECK ================= */
      const existing = await get(productRef);
      if (existing.exists()) {
        alert("Product already exists in this category");
        throw new Error("Duplicate product");
      }

      /* ================= IMAGE RULES ================= */
      const MAX_IMAGES = 3;
      const MAX_SIZE_MB = 1;

      if (imageInput.files.length > MAX_IMAGES) {
        alert("Maximum 3 images allowed");
        throw new Error("Too many images");
      }

      const images = [];

      for (const file of imageInput.files) {
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
          alert("Each image must be under 1MB");
          throw new Error("Image too large");
        }

        const base64 = await compressToBase64(file);
        images.push(base64);
      }

      /* ================= PRODUCT OBJECT ================= */
      const product = {
        productId,
        name,
        shortdescription,
        longdescription,
        price,
        category: categoryId,
        badge,
        deliveryTime,
        customizable,          // ✅ FIXED & SAFE
        occasion,              // ✅ array
        forWhom,               // ✅ array
        images,
        status: "active",
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      /* ================= SAVE ================= */
      await set(productRef, product);

      alert("✅ Product added successfully!");
      form.reset();
      location.href = "index.html";

    } catch (err) {
      console.error("❌ Upload error:", err);
      alert("❌ Failed to add product");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Add Product";
    }
  });
});

/* ================= HELPERS ================= */
function getValue(id) {
  return document.getElementById(id)?.value.trim() || "";
}

function getCheckedValues(name) {
  return Array.from(
    document.querySelectorAll(`input[name="${name}"]:checked`)
  ).map(el => el.value);
}

function toSafeId(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

/* ================= IMAGE COMPRESSION ================= */
function compressToBase64(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    const img = new Image();

    reader.onload = e => img.src = e.target.result;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const MAX_WIDTH = 800;
      const scale = MAX_WIDTH / img.width;

      canvas.width = MAX_WIDTH;
      canvas.height = img.height * scale;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.7));
    };

    reader.readAsDataURL(file);
  });
}
