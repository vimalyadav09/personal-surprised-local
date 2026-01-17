import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getDatabase, ref, update } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";

/* FIREBASE */
const firebaseConfig = {
  apiKey: "AIzaSyALT8BxBAdagSeaAjo9F2aogjaYFctIAEI",
  authDomain: "personalized-surprises.firebaseapp.com",
  databaseURL: "https://personalized-surprises-default-rtdb.firebaseio.com",
  projectId: "personalized-surprises",
  storageBucket: "personalized-surprises.firebasestorage.app",
  messagingSenderId: "270931064294",
  appId: "1:270931064294:web:a12ee5118035445c735227",
  measurementId: "G-ZN01V7FZS3"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

/* ELEMENTS */
const applyType = document.getElementById("applyType");
const productField = document.getElementById("productField");
const categoryField = document.getElementById("categoryField");
const form = document.querySelector(".discount-form");

/* TOGGLE FIELDS */
applyType.addEventListener("change", () => {
  productField.style.display = applyType.value === "single" ? "block" : "none";
  categoryField.style.display = applyType.value === "category" ? "block" : "none";
});

/* APPLY DISCOUNT */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const type = applyType.value;
  const discountType = document.getElementById("discountType").value;
  const discountValue = Number(document.getElementById("discountValue").value);
  const productName = document.getElementById("productName").value.trim();
  const categoryName = document.getElementById("categoryName").value.trim();

  if (!discountValue) {
    alert("Enter discount value");
    return;
  }

  let path = "";

  if (type === "single") {
    if (!productName || !categoryName) {
      alert("Enter product and category");
      return;
    }
    path = `products/${categoryName}/${productName}`;
  }

  if (type === "category") {
    if (!categoryName) {
      alert("Enter category");
      return;
    }
    path = `discounts/category/${categoryName}`;
  }

  if (type === "all") {
    path = `discounts/all`;
  }

  await update(ref(db, path), {
    discountType,
    discountValue,
    updatedAt: Date.now()
  });

  alert("Discount applied successfully!");
  form.reset();
});
