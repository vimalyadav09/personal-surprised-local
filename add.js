import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
  getDatabase,
  ref,
  set
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

// Firebase Config
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const home = document.getElementById("home");
const discount = document.getElementById("discount");
const order = document.getElementById("order")

home.addEventListener('click',()=>{
    window.location.href="index.html"
})

discount.addEventListener('click',()=>{
    window.location.href="discount.html"
})

order.addEventListener('click',()=>{
    window.location.href="order.html"
})

// Wait for DOM to load
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".add-products-form");
  const imageInput = document.getElementById("image-upload");

  if (!form || !imageInput) {
    console.error("Form or image input not found. Check your HTML.");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("product-name").value.trim();
    const desc = document.getElementById("product-desc").value.trim();
    const price = document.getElementById("product-price").value.trim();
    const category = document.getElementById("product-category").value.trim();

    if (!name || !desc || !price || !category) {
      alert("Please fill all the fields.");
      return;
    }

    const files = imageInput.files;
    const base64Images = [];

    for (let i = 0; i < files.length; i++) {
      const base64 = await convertToBase64(files[i]);
      base64Images.push(base64);
    }

    const productData = {
      name,
      desc,
      price,
      category,
      images: base64Images
    };

    const productPath = `Personalised Surprise/products/${category}/${name}`;
    const productRef = ref(db, productPath);

    set(productRef, productData)
      .then(() => {
        alert("Product added successfully!");
        form.reset();
        window.location.href="index.html"
      })
      .catch((err) => {
        console.error("Error uploading product:", err);
        alert("Failed to upload product.");
      });
  });
});

// Convert image to base64 string
function convertToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}