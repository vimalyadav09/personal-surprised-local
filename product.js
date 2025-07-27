import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getDatabase, ref, get, update, remove } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "personalised-surprise.firebaseapp.com",
  projectId: "personalised-surprise",
  storageBucket: "personalised-surprise.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  databaseURL: "https://personalised-surprise-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Get query params
const params = new URLSearchParams(window.location.search);
const category = params.get("category");
const name = params.get("name");

const detailsDiv = document.querySelector(".product-details");
const nameInput = document.getElementById("NameInput");
const descriptionInput = document.getElementById("descriptionInput");
const priceInput = document.getElementById("priceInput");
const saveButton = document.getElementById("save");
const deleteButton = document.getElementById("delete");

document.getElementById("home").addEventListener("click", () => {
  window.location.href = "index.html";
});
document.getElementById("add").addEventListener("click", () => {
  window.location.href = "add.html";
});
document.getElementById("discount").addEventListener("click", () => {
  window.location.href = "discount.html";
});
document.getElementById("order").addEventListener("click", () => {
  window.location.href = "order.html";
});

// Load product data
if (category && name) {
  const productRef = ref(db, `Personalised Surprise/products/${category}/${name}`);
  get(productRef).then((snapshot) => {
    if (snapshot.exists()) {
      const product = snapshot.val();

      // Populate details
      nameInput.value = product.name || "";
      descriptionInput.value = product.desc || "";
      priceInput.value = product.price || "";

      // Show images
    } else {
      detailsDiv.textContent = "Product not found.";
    }
  });
} else {
  detailsDiv.textContent = "Missing product details.";
}

// Save changes
saveButton.addEventListener("click", () => {
  const newDesc = descriptionInput.value;
  const newName = nameInput.value;
  const newPrice = priceInput.value;

  const oldRef = ref(db, `Personalised Surprise/products/${category}/${name}`);
  const newRef = ref(db, `Personalised Surprise/products/${category}/${newName}`);

  // If name has changed
  if (newName !== name) {
    // First copy data to new location
    get(oldRef).then((snapshot) => {
      if (snapshot.exists()) {
        const data = {
          ...snapshot.val(),
          name: newName,   // update name inside object too
          desc: newDesc,
          price: newPrice
        };
        update(newRef, data)
          .then(() => {
            // Remove old entry
            remove(oldRef)
              .then(() => {
                alert("Product name and details updated successfully!");
                window.location.href = "index.html";
              })
              .catch((err) => alert("Failed to delete old product: " + err));
          })
          .catch((err) => alert("Failed to update product: " + err));
      }
    });
  } else {
    // If name has not changed, just update details
    update(oldRef, {
      desc: newDesc,
      price: newPrice
    })
      .then(() => alert("Product details updated!"))
      .catch((err) => alert("Update failed: " + err));
  }
});


// Delete product
deleteButton.addEventListener("click", () => {
  const deleteRef = ref(db, `Personalised Surprise/products/${category}/${name}`);
  if (confirm("Are you sure you want to delete this product?")) {
    remove(deleteRef)
      .then(() => {
        alert("Product deleted.");
        window.location.href = "index.html"; // Redirect if needed
      })
      .catch((error) => {
        console.error("Delete failed:", error);
        alert("Failed to delete product.");
      });
  }
});
