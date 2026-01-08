import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";

/* FIREBASE CONFIG */
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

/* ELEMENTS */
const totalProducts = document.getElementById("totalProducts");
const totalOrders = document.getElementById("totalOrders");
const totalRevenue = document.getElementById("totalRevenue");
const todayOrders = document.getElementById("todayOrders");
const conversionRate = document.getElementById("conversionRate");
const visitorsToday = document.getElementById("visitorsToday");
const visitorsMonth = document.getElementById("visitorsMonth");
const bestCategory = document.getElementById("bestCategory");
const avgOrder = document.getElementById("avgOrder");

/* PRODUCTS COUNT */
onValue(ref(db, "products"), snap => {
  let count = 0;
  snap.forEach(cat => {
    count += Object.keys(cat.val()).length;
  });
  totalProducts.textContent = count;
});

/* ORDERS & REVENUE */
onValue(ref(db, "orders"), snap => {
  let orders = 0;
  let revenue = 0;
  let today = new Date().toDateString();
  let todayCount = 0;
  let categoryMap = {};

  snap.forEach(o => {
    const order = o.val();
    orders++;
    revenue += Number(order.total || 0);

    if (new Date(order.createdAt).toDateString() === today) {
      todayCount++;
    }

    order.items?.forEach(item => {
      categoryMap[item.category] = (categoryMap[item.category] || 0) + 1;
    });
  });

  totalOrders.textContent = orders;
  totalRevenue.textContent = `₹${revenue}`;
  todayOrders.textContent = todayCount;
  avgOrder.textContent = `₹${Math.round(revenue / orders || 0)}`;

  bestCategory.textContent =
    Object.keys(categoryMap).sort((a, b) =>
      categoryMap[b] - categoryMap[a]
    )[0] || "—";

  conversionRate.textContent = `${Math.round((orders / 200) * 100)}%`; // assuming 200 visitors
});

/* VISITORS (DUMMY FOR NOW) */
visitorsToday.textContent = 87;
visitorsMonth.textContent = 2140;
