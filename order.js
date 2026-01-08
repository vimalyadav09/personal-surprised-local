// ================= FIREBASE IMPORTS =================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  update
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";

// ================= FIREBASE CONFIG =================
const firebaseConfig = {
  apiKey: "AIzaSyCgeS0Qo-2K1RQ2his1lwhgSfVtIMlCfZw",
  authDomain: "personalised-surprise.firebaseapp.com",
  databaseURL: "https://personalised-surprise-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "personalised-surprise",
  storageBucket: "personalised-surprise.appspot.com",
  messagingSenderId: "847601751688",
  appId: "1:847601751688:web:023d58ce5200eca9ff313d"
};

// ================= INIT =================
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ================= ELEMENTS =================
const activeOrdersEl = document.getElementById("activeOrders");
const completedOrdersEl = document.getElementById("completedOrders");

const tabs = document.querySelectorAll(".tab");
const filterDate = document.getElementById("filterDate");
const filterMonth = document.getElementById("filterMonth");
const clearFilter = document.getElementById("clearFilter");

// ================= STATE =================
let allOrders = [];

// ================= TAB SWITCH =================
tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");

    const isActive = tab.dataset.tab === "active";
    activeOrdersEl.classList.toggle("hidden", !isActive);
    completedOrdersEl.classList.toggle("hidden", isActive);
  });
});

// ================= FETCH ORDERS =================
onValue(ref(db, "orders"), snapshot => {
  allOrders = [];

  snapshot.forEach(orderSnap => {
    allOrders.push({
      id: orderSnap.key,
      ...orderSnap.val()
    });
  });

  // Sort latest first
  allOrders.sort((a, b) => b.createdAt - a.createdAt);

  renderOrders(allOrders);
});

// ================= RENDER ORDERS =================
function renderOrders(orders) {
  activeOrdersEl.innerHTML = "";
  completedOrdersEl.innerHTML = "";

  if (orders.length === 0) {
    activeOrdersEl.innerHTML = "<p>No orders found.</p>";
    completedOrdersEl.innerHTML = "";
    return;
  }

  orders.forEach(order => {
    const card = document.createElement("div");
    card.className = "order-card";

    card.innerHTML = `
      <div class="order-header">
        <span class="order-id">Order #${order.id}</span>
        <span class="order-status ${order.status}">
          ${order.status}
        </span>
      </div>

      <div class="order-body">
        <p><strong>Customer:</strong> ${order.customerName || "—"}</p>
        <p><strong>Total:</strong> ₹${order.total || 0}</p>
        <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
      </div>

      ${
        order.status !== "Delivered"
          ? `<div class="order-actions">
              <select data-id="${order.id}">
                <option ${order.status === "Pending" ? "selected" : ""}>Pending</option>
                <option ${order.status === "Processing" ? "selected" : ""}>Processing</option>
                <option ${order.status === "Delivered" ? "selected" : ""}>Delivered</option>
              </select>
            </div>`
          : ""
      }
    `;

    if (order.status === "Delivered") {
      completedOrdersEl.appendChild(card);
    } else {
      activeOrdersEl.appendChild(card);
    }
  });

  attachStatusHandlers();
}

// ================= UPDATE STATUS =================
function attachStatusHandlers() {
  document.querySelectorAll(".order-actions select").forEach(select => {
    select.addEventListener("change", e => {
      const orderId = e.target.dataset.id;
      const newStatus = e.target.value;

      update(ref(db, `orders/${orderId}`), {
        status: newStatus,
        updatedAt: Date.now()
      });
    });
  });
}

// ================= FILTER BY DATE =================
filterDate.addEventListener("change", () => {
  const selectedDate = filterDate.value;
  filterMonth.value = "";

  if (!selectedDate) {
    renderOrders(allOrders);
    return;
  }

  const filtered = allOrders.filter(order => {
    const orderDate = new Date(order.createdAt)
      .toISOString()
      .split("T")[0];
    return orderDate === selectedDate;
  });

  renderOrders(filtered);
});

// ================= FILTER BY MONTH =================
filterMonth.addEventListener("change", () => {
  const selectedMonth = filterMonth.value;
  filterDate.value = "";

  if (!selectedMonth) {
    renderOrders(allOrders);
    return;
  }

  const filtered = allOrders.filter(order => {
    const orderMonth = new Date(order.createdAt)
      .toISOString()
      .slice(0, 7);
    return orderMonth === selectedMonth;
  });

  renderOrders(filtered);
});

// ================= CLEAR FILTER =================
clearFilter.addEventListener("click", () => {
  filterDate.value = "";
  filterMonth.value = "";
  renderOrders(allOrders);
});
