import { db, auth } from "./firebase.js";
import {
  collection, addDoc, getDocs, deleteDoc,
  doc, updateDoc, setDoc, getDoc,
  query, where
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

/* ================= LOGIN ================= */
window.login = () => {
  signInWithEmailAndPassword(auth, email.value, password.value)
    .catch(err => alert("Login Failed: " + err.message));
};

onAuthStateChanged(auth, (u) => {
  if (u) {
    loginPage.style.display = "none";
    app.style.display = "block";
    loadAll();
  } else {
    loginPage.style.display = "block";
    app.style.display = "none";
  }
});

/* ================= NAV ================= */
window.show = (id) => {
  console.log("Trying to open page:", id);

  document.querySelectorAll(".page").forEach(p => {
    p.style.display = "none";
  });

  const el = document.getElementById(id);

  if (el) {
    el.style.display = "block";
  } else {
    console.error("❌ Page not found:", id);
  }
};


window.onload = () => {
  show("dashboard");
};

/* ================= SHOP ================= */
window.saveShop = async () => {
  const name = shopInput.value?.trim();

  const addressInput = document.getElementById("shopAddress");
  const phoneInput = document.getElementById("ownerPhone");

  const address = addressInput?.value?.trim();
  const phone = phoneInput?.value?.trim();

  if (!name) {
    alert("Enter shop name");
    return;
  }

  await setDoc(doc(db, "settings", "shop"), {
    name: name,
    address: address || "",
    phone: phone || ""
  });

  loadShop();
  shopInput.value = "";
  if (addressInput) addressInput.value = "";
  if (phoneInput) phoneInput.value = "";

};

async function loadShop() {
  const d = await getDoc(doc(db, "settings", "shop"));

  const data = d.exists() ? d.data() : {};

  const name = data.name || "My Shop";
  const address = data.address || "";
  const phone = data.phone || "";

  // existing shop name display
  const el = document.getElementById("shopName");
  if (el) el.innerText = name;

  // OPTIONAL: if you have these elements in UI
  const addrEl = document.getElementById("shopAddressDisplay");
  if (addrEl) addrEl.innerText = address;

  const phoneEl = document.getElementById("ownerPhoneDisplay");
  if (phoneEl) phoneEl.innerText = phone;
}

/* ================= OFFER ================= */

window.saveOffer = async () => {
  const name = document.getElementById("offerName")?.value || "";
  const desc = document.getElementById("offerDesc")?.value || "";
  const discountInput = document.getElementById("offerDiscount");
  const minPurchase = document.getElementById("offerMin")?.value || 0;
  const startDate = document.getElementById("offerStart")?.value || "";
  const endDate = document.getElementById("offerEnd")?.value || "";

  if (!discountInput.value) {
    alert("Enter discount");
    return;
  }

  await setDoc(doc(db, "settings", "offer"), {
    name: name,
    description: desc,

   
    discount: Number(discountInput.value),

    minPurchase: Number(minPurchase),
    startDate: startDate,
    endDate: endDate
  });

  alert("Offer Saved ✅");

  document.getElementById("offerName").value = "";
  document.getElementById("offerDesc").value = "";
  document.getElementById("offerDiscount").value = "";
  document.getElementById("offerMin").value = "";
  document.getElementById("offerStart").value = "";
  document.getElementById("offerEnd").value = "";
};

async function loadOffer() {
  const d = await getDoc(doc(db, "settings", "offer"));

  const offerBox = document.getElementById("offerBox");
  if (!offerBox) return;

  if (!d.exists()) {
    offerBox.innerHTML = "<p>No active offer</p>";
    return;
  }

  const o = d.data();

  offerBox.innerHTML = `
    <div class="offer-card">
      <h2>🎉 ${o.name}</h2>
      <p>${o.description || ""}</p>

      <div class="offer-grid">
        <div><b>💸 Discount:</b> ${o.discount || 0}%</div>
        <div><b>📦 Applicable On:</b> ${o.applicableOn || "All Items"}</div>
        <div><b>🛒 Min Purchase:</b> ₹${o.minPurchase || 0}</div>
        <div><b>📅 Start:</b> ${o.startDate || "-"}</div>
        <div><b>📅 End:</b> ${o.endDate || "-"}</div>
      </div>
    </div>
  `;
}

/* ================= WORKERS ================= */

window.addWorker = async () => {
  if (!wname.value) return;

  
  const editField = document.getElementById("editId");
  const id = editField ? editField.value : "";

  const workerData = {
    name: wname.value,
    salary: Number(salary.value),

    role: role?.value || "",
    age: age?.value ? Number(age.value) : "",
    mobile: mobile?.value || "",
    qualification: qualification?.value || "",
    address: address?.value || "",
  };

  if (id) {
    await updateDoc(doc(db, "workers", id), workerData);

    if (editField) editField.value = "";

    const btn = document.getElementById("workerBtn");
    if (btn) btn.innerText = "Add Worker";

  } else {
    await addDoc(collection(db, "workers"), {
      ...workerData,
      attendance: {}
    });
  }
  wname.value = "";
  salary.value = "";

  if (role) role.value = "";
  if (age) age.value = "";
  if (mobile) mobile.value = "";
  if (qualification) qualification.value = "";
  if (address) address.value = "";

  loadWorkers();
  loadAttendance();
};

window.delWorker = async (id) => {
  if (confirm("Delete worker?")) {
    await deleteDoc(doc(db, "workers", id));
    loadWorkers();
    loadAttendance();
  }
};

/* ================= EDIT WORKER ================= */

window.editWorker = async (id) => {
  const snap = await getDoc(doc(db, "workers", id));
  if (!snap.exists()) return;

  const x = snap.data();
  if (wname) wname.value = x.name || "";
  if (salary) salary.value = x.salary || "";
  if (role) role.value = x.role || "";
  if (age) age.value = x.age || "";
  if (mobile) mobile.value = x.mobile || "";
  if (qualification) qualification.value = x.qualification || "";
  if (address) address.value = x.address || "";

  const editField = document.getElementById("editId");
  if (editField) editField.value = id;

  const btn = document.getElementById("workerBtn");
  if (btn) btn.innerText = "Update Worker";

  window.scrollTo({ top: 0, behavior: "smooth" });
};

/* ================= LOAD WORKERS ================= */

async function loadWorkers() {
  const snap = await getDocs(collection(db, "workers"));
  let html = "";

  snap.forEach(d => {
    const x = d.data();

    html += `
    <div class="card worker-card">

      <div class="worker-header">
        <h3>${x.name}</h3>
        <span class="salary">₹${x.salary}</span>
      </div>

      <div class="worker-details">
        <p>🧑‍💼 Role: ${x.role || "N/A"}</p>
        <p>👤 Age: ${x.age || "N/A"}</p>
        <p>📱 Mobile: ${x.mobile || "N/A"}</p>
        <p>🎓 Qualification: ${x.qualification || "N/A"}</p>
        <p>🏠 Address: ${x.address || "N/A"}</p>
      </div>

      <div class="worker-actions">
        <button onclick="editWorker('${d.id}')">✏️ Edit</button>
        <button onclick="delWorker('${d.id}')"> Delete</button>
      </div>

    </div>`;
  });

  const list = document.getElementById("workerList");
  if (list) list.innerHTML = html;
}
// ================= LOAD ATTENDANCE =================
async function loadAttendance() {
  const snap = await getDocs(collection(db, "workers"));
  let html = "";

  const monthInput = document.getElementById("monthSelect");
  const selectedMonth =
    monthInput?.value || new Date().toISOString().slice(0, 7);

  const year = Number(selectedMonth.split("-")[0]);
  const month = Number(selectedMonth.split("-")[1]);
  const daysInMonth = new Date(year, month, 0).getDate();

  snap.forEach((d) => {
    const x = d.data();
    let att = x.attendance || {};
    for (let i = 1; i <= daysInMonth; i++) {
      const dayStr = String(i).padStart(2, "0");
      const fullDate = `${selectedMonth}-${dayStr}`;

      if (!att[fullDate]) {
        att[fullDate] = "A"; // default absent
      }
    }

    let presentCount = 0;
    let absentCount = 0;
    let daysHTML = "";

    for (let i = 1; i <= daysInMonth; i++) {
      const dayStr = String(i).padStart(2, "0");
      const fullDate = `${selectedMonth}-${dayStr}`;

      let status = att[fullDate];
      let symbol = "";
      let cls = "day";

      if (status === "P") {
        symbol = "✅";
        cls += " present";
        presentCount++;
      } else {
        symbol = "❌";
        cls += " absent";
        absentCount++;
      }

      daysHTML += `
        <div class="${cls}" onclick="markDate('${d.id}','${fullDate}')">
          ${i}<br>${symbol}
        </div>`;
    }

    const salary = Number(x.salary) || 0;
    const salaryPerDay = salary ? salary / 30 : 0;
    const currentSalary = salaryPerDay * presentCount;

    html += `
    <div class="card attendance-card">

      <h3>${x.name}</h3>

      <!-- QUICK BUTTONS -->
      <div class="att-buttons">
        <button onclick="mark('${d.id}','P')">✅ Today</button>
        <button onclick="mark('${d.id}','A')">❌ Today</button>
      </div>

      <p><b>Month:</b> ${selectedMonth}</p>

      <!-- 🔥 CALENDAR -->
      <div class="calendar-grid">
        ${daysHTML}
      </div>

      <p>Present: ${presentCount} | Absent: ${absentCount}</p>

      <p>💰 Salary: ₹${currentSalary.toFixed(2)}</p>

    </div>`;
  });

  document.getElementById("attendanceList").innerHTML = html;
}


// ================= MARK TODAY =================
window.mark = async (id, status) => {
  const today = new Date().toISOString().split("T")[0];

  await updateDoc(doc(db, "workers", id), {
    [`attendance.${today}`]: status
  });

  loadAttendance();
};


// ================= CLICK DATE ( NEW FEATURE) =================
window.markDate = async (id, date) => {
  const current = confirm("Mark Present? OK = Present, Cancel = Absent");

  const status = current ? "P" : "A";

  await updateDoc(doc(db, "workers", id), {
    [`attendance.${date}`]: status
  });

  loadAttendance();
};
/* ================= STOCK ================= */

window.addStock = async () => {

  const id = document.getElementById("editStockId")?.value;

  const stockData = {
    n: n.value,
    q: Number(q.value),
    price: Number(price.value),
    unit: unit?.value || "pcs",
    expiry: expiry.value
  };

  if (id) {
    await updateDoc(doc(db, "stock", id), stockData);

    document.getElementById("stockBtn").innerText = "Add Stock";
    document.getElementById("editStockId").value = "";
  } else {
    await addDoc(collection(db, "stock"), stockData);
  }
  n.value = "";
  q.value = "";
  price.value = "";
  expiry.value = "";
  if (unit) unit.value = "";

  loadStock();
  loadProducts();
};


/* ================= LOAD STOCK ================= */
async function loadStock() {
  const snap = await getDocs(collection(db, "stock"));
  let html = "";

  snap.forEach(d => {
    const x = d.data();

    const qty = Number(x.q) || 0;
    const price = Number(x.price) || 0;
    const unit = x.unit || "pcs";

    const totalValue = qty * price;
    const expired = x.expiry && new Date(x.expiry) < new Date();

    html += `
    <div class="card stock-card">

      <div class="stock-header">
        <h3>${x.n}</h3>
        <span class="stock-price">₹${price}/${unit}</span>
      </div>

      <div class="stock-details">
        <p>📦 Quantity: ${qty} ${unit}</p>
        <p>💰 Total Value: ₹${totalValue.toFixed(2)}</p>
        <p>📅 Expiry: ${x.expiry || "N/A"}</p>
      </div>

      ${qty < 5 ? '<p class="low">⚠️ Low Stock</p>' : ''}
      ${expired ? '<p class="expired">Expired</p>' : ''}

      <div class="stock-actions">
        <button onclick="editStock('${d.id}')">✏️ Edit</button>
        <button onclick="delStock('${d.id}')">❌ Delete</button>
      </div>

    </div>`;
  });

  document.getElementById("stockList").innerHTML = html;
}


/* ================= EDIT STOCK ================= */
window.editStock = async (id) => {
  const snap = await getDoc(doc(db, "stock", id));
  if (!snap.exists()) return;

  const x = snap.data();

  n.value = x.n || "";
  q.value = x.q || "";
  price.value = x.price || "";
  expiry.value = x.expiry || "";
  if (unit) unit.value = x.unit || "";

  document.getElementById("editStockId").value = id;
  document.getElementById("stockBtn").innerText = "Update Stock";

  window.scrollTo({ top: 0, behavior: "smooth" });
};


/* DELETE */
window.delStock = async (id) => {
  if (confirm("Delete stock?")) {
    await deleteDoc(doc(db, "stock", id));
    loadStock();
    loadProducts();
  }
};

/* ================= PRODUCTS ================= */
async function loadProducts() {
  const snap = await getDocs(collection(db, "stock"));

  let options = "<option value=''>Select Product</option>";

  snap.forEach(d => {
    const x = d.data();
    options += `<option value="${x.n}">${x.n}</option>`;
  });

  const productEl = document.getElementById("product");
  const qpEl = document.getElementById("qp");

  if (productEl) productEl.innerHTML = options;
  if (qpEl) qpEl.innerHTML = options;
}

/* ================= BILLING ================= */    
let shopSettingsCache = {  
  name: "My Shop",  
  address: "",  
  phone: ""  
};    
async function loadShopSettings() {  
  const d = await getDoc(doc(db, "settings", "shop"));  

  if (d.exists()) {  
    shopSettingsCache = {  
      name: d.data().name || "My Shop",  
      address: d.data().address || "",  
      phone: d.data().phone || ""  
    };  
  }  
}  

/* ================= OFFER LOGIC ================= */  
async function getActiveOffer(subtotal) {  
  const d = await getDoc(doc(db, "settings", "offer"));  

  if (!d.exists()) return null;  

  const o = d.data();  
  const today = new Date().toISOString().split("T")[0];  

  if (o.startDate && o.endDate) {  
    if (today < o.startDate || today > o.endDate) return null;  
  }  

  if (subtotal < Number(o.minPurchase || 0)) return null;  

  return o;  
}   
window.addItemRow = () => {  
  const container = document.getElementById("itemsContainer");  

  getDocs(collection(db, "stock")).then(snap => {  
    let options = "";  

    snap.forEach(d => {  
      const x = d.data();  

      options += `  
      <option value="${x.n}"   
        data-price="${x.price}"   
        data-id="${d.id}"   
        data-stock="${x.q}"   
        data-unit="${x.unit || 'pcs'}">  
        ${x.n} (${x.unit || 'pcs'})  
      </option>`;  
    });  

    const row = document.createElement("div");  
    row.className = "item-row";  

    row.innerHTML = `  
      <select onchange="calculateTotal()">  
        <option value="">Select Product</option>  
        ${options}  
      </select>  

      <input type="number" placeholder="Qty" oninput="calculateTotal()">  

      <select class="unit-select">  
        <option value="pcs">pcs</option>  
        <option value="kg">kg</option>  
        <option value="g">g</option>  
        <option value="liter">liter</option>  
        <option value="ml">ml</option>  
        <option value="pack">pack</option>  
      </select>  

      <button onclick="this.parentElement.remove(); calculateTotal()">❌</button>  
    `;  

    container.appendChild(row);  
  });  
};    
window.calculateTotal = () => {  
  let total = 0;  

  document.querySelectorAll(".item-row").forEach(row => {  
    const select = row.querySelector("select");  
    const qty = Number(row.querySelector("input").value);  
    const price = Number(select.selectedOptions[0]?.dataset.price || 0);  

    total += qty * price;  
  });  

  document.getElementById("billTotal").innerText =  
    "Subtotal: ₹" + total.toFixed(2);  
};  
window.addBill = async () => {  

  if (!c.value || !phone.value) {  
    alert("Enter customer details");  
    return;  
  }  

  const editId = document.getElementById("editBillId")?.value;  

  let items = [];  
  let subtotal = 0;  

  const rows = document.querySelectorAll(".item-row");  

  for (let row of rows) {  
    const select = row.querySelector("select");  
    const qty = Number(row.querySelector("input").value);  

    const name = select.value;  
    const price = Number(select.selectedOptions[0]?.dataset.price || 0);  
    const docId = select.selectedOptions[0]?.dataset.id;  
    const stockQty = Number(select.selectedOptions[0]?.dataset.stock);  
    const unit = row.querySelector(".unit-select").value;  

    if (!name || !qty) continue;  

    if (qty > stockQty) {  
      alert(`${name} stock not enough`);  
      return;  
    }  

    const total = qty * price;  
    subtotal += total;  

    items.push({ name, qty, price, total, unit, docId, stockQty });  
  }  

  if (items.length === 0) {  
    alert("Add at least one item");  
    return;  
  }  

  const offer = await getActiveOffer(subtotal);  

  let discount = 0;  
  if (offer) {  
    discount = (subtotal * Number(offer.discount || 0)) / 100;  
  }  

  const afterDiscount = subtotal - discount;  
  const gst = afterDiscount * 0.18;  
  const total = afterDiscount + gst;  

  const billData = {  
    c: c.value,  
    phone: phone.value,  
    items,  
    subtotal,  
    discount,  
    gst,  
    total,  
    offerName: offer ? offer.name : null,  
    date: new Date().toISOString()  
  };  

  if (editId) {  
    await updateDoc(doc(db, "bills", editId), billData);  
    document.getElementById("editBillId").value = "";  
    document.getElementById("billBtn").innerText = "Add Bill";  
  } else {  
    await addDoc(collection(db, "bills"), billData);  

    for (let item of items) {  
      await updateDoc(doc(db, "stock", item.docId), {  
        q: item.stockQty - item.qty,  
        totalValue: (item.stockQty - item.qty) * item.price  
      });  
    }  
  }  
  c.value = "";  
  phone.value = "";  
  document.getElementById("itemsContainer").innerHTML = "";  
  document.getElementById("billTotal").innerText = "";  

  loadBills();  
  loadStock();  
};   
async function loadBills() {  
  const snap = await getDocs(collection(db, "bills"));  
  let html = "";  

  const shopNameText = shopSettingsCache.name || "Shop";  
  const shopAddress = shopSettingsCache.address || "";  
  const shopPhone = shopSettingsCache.phone || "";  

  snap.forEach(d => {  
    const x = d.data();  

    const subtotal = Number(x.subtotal) || 0;  
    const discount = Number(x.discount) || 0;  
    const gst = Number(x.gst) || 0;  
    const total = Number(x.total) || 0;  

    let itemsHTML = "";  
    let msgItems = "";  

    if (x.items && Array.isArray(x.items)) {  
      x.items.forEach(item => {  
        itemsHTML += `<p>📦 ${item.name} - ${item.qty} ${item.unit} × ₹${item.price}</p>`;  
        msgItems += `• ${item.name} → ${item.qty}${item.unit} ₹${item.total}\n`;  
      });  
    }  

    let cleanPhone = (x.phone || "").replace(/\D/g, "");  
    if (cleanPhone && !cleanPhone.startsWith("91")) {  
      cleanPhone = "91" + cleanPhone;  
    }  

    const hasPhone = cleanPhone.length >= 10;  

    const msg = `  
🧾 *${shopNameText}*  
📍 ${shopAddress}  
📞 ${shopPhone}  

👤 Customer: ${x.c || "N/A"}  

${msgItems}  

Subtotal: ₹${subtotal.toFixed(2)}  
Discount: ₹${discount.toFixed(2)}  
GST: ₹${gst.toFixed(2)}  
💰 *Total: ₹${total.toFixed(2)}*  

🙏 Thank you! 😊  
`;  

    const link = hasPhone  
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`  
      : "#";  

    html += `  
<div class="card bill-card">  
  <div class="bill-header">  
    <div>  
      <h3>${x.c || "Customer"}</h3>  
      <small>📞 ${x.phone || "N/A"}</small>  
    </div>  
    <div class="bill-total">₹${total.toFixed(2)}</div>  
  </div>  

  <hr>  

  <div class="bill-items">  
    ${itemsHTML || "<p>No items</p>"}  
  </div>  

  <hr>  

  <div class="bill-summary">  
    <p>Subtotal: ₹${subtotal.toFixed(2)}</p>  
    <p style="color:green;">Discount: -₹${discount.toFixed(2)}</p>  
    <p>GST (18%): ₹${gst.toFixed(2)}</p>  
    <h4>Total: ₹${total.toFixed(2)}</h4>  
  </div>  

  <div class="bill-actions">  
    ${hasPhone ? `<a href="${link}" target="_blank">📲 WhatsApp</a>` : `<span style="color:red;">⚠️ No valid phone</span>`}  
    <button onclick="editBill('${d.id}')">✏️ Edit</button>  
    <button onclick="delBill('${d.id}')">❌ Delete</button>  
  </div>  
</div>`;  
  });  

  billList.innerHTML = html;  
}
// ================= EDIT BILL =================
window.editBill = async (id) => {
  try {
    const docRef = doc(db, "bills", id);
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      alert("Bill not found");
      return;
    }

    const data = snap.data();
    document.getElementById("c").value = data.c || "";
    document.getElementById("phone").value = data.phone || "";
    document.getElementById("editBillId").value = id;
    document.getElementById("billBtn").innerText = "Update Bill";
    document.getElementById("billing").scrollIntoView();

  } catch (err) {
    console.error(err);
    alert("Error loading bill");
  }
};
/* ================= QUOTATION ================= */
window.addQItemRow = async () => {
  const container = document.getElementById("qItemsContainer");

  const snap = await getDocs(collection(db, "stock"));

  let options = `<option value="">Select Product</option>`;

  snap.forEach(d => {
    const x = d.data();
    options += `<option value="${x.n}" data-price="${x.price}">
      ${x.n} (₹${x.price})
    </option>`;
  });

  const row = document.createElement("div");
  row.className = "item-row";

  row.innerHTML = `
    <select onchange="updateQTotal()">${options}</select>
    <input type="number" placeholder="Qty" oninput="updateQTotal()">
    <span class="qPrice">₹0</span>
    <button onclick="this.parentElement.remove(); updateQTotal()">❌</button>
  `;

  container.appendChild(row);
};
window.updateQTotal = async () => {
  let subtotal = 0;

  document.querySelectorAll("#qItemsContainer .item-row").forEach(row => {
    const select = row.querySelector("select");
    const qty = Number(row.querySelector("input").value);

    const price = Number(select.selectedOptions[0]?.dataset.price || 0);

    const rowTotal = price * qty;
    subtotal += rowTotal;

    row.querySelector(".qPrice").innerText = "₹" + rowTotal.toFixed(2);
  });
  const offer = await getActiveOffer(subtotal);
  console.log("Offer object:", offer);
console.log("Offer discount raw:", offer?.discount);
  let discount = 0;

  if (offer && offer.discount) {
    const discountValue = parseFloat(offer.discount);

    if (!isNaN(discountValue)) {
      discount = (subtotal * discountValue) / 100;
    }
  }

  const afterDiscount = subtotal - discount;

  const gst = Number((afterDiscount * 0.18).toFixed(2));
  const total = Number((afterDiscount + gst).toFixed(2));

  document.getElementById("qTotal").innerText =
    `Subtotal: ₹${subtotal.toFixed(2)} | Discount: ₹${discount.toFixed(2)} | GST: ₹${gst.toFixed(2)} | Total: ₹${total.toFixed(2)}`;
};
window.addQuotation = async () => {

  const customer = document.getElementById("qc").value;
  const editId = document.getElementById("editQId")?.value;

  if (!customer) {
    alert("Enter customer name");
    return;
  }

  const rows = document.querySelectorAll("#qItemsContainer .item-row");

  let items = [];
  let subtotal = 0;

  rows.forEach(row => {
    const select = row.querySelector("select");
    const qty = Number(row.querySelector("input").value);

    const name = select.value;
    const price = Number(select.selectedOptions[0]?.dataset.price || 0);

    if (!name || !qty) return;

    const rowTotal = price * qty;
    subtotal += rowTotal;

    items.push({
      name,
      qty,
      price,
      total: rowTotal
    });
  });

  if (items.length === 0) {
    alert("Add at least one item");
    return;
  }
  const offer = await getActiveOffer(subtotal);
  console.log("Offer object:", offer);
console.log("Offer discount raw:", offer?.discount);

  let discount = 0;
  if (offer && offer.discount) {
    discount = (subtotal * Number(offer.discount )) / 100;
  }

  const afterDiscount = subtotal - discount;
  const gst = Number((afterDiscount * 0.18).toFixed(2));
  const total = Number((afterDiscount +gst).toFixed(2));

  console.log("DEBUG VALUES:");
console.log("Subtotal:", subtotal);
console.log("Discount:", discount);
console.log("GST:", gst);
console.log("Total:", total);

  const data = {
    c: customer,
    items,
    subtotal,
    discount,
    gst,
    total,
    offerName: offer ? offer.name : null,
    date: new Date().toISOString()
  };

  if (editId) {
    await updateDoc(doc(db, "quotation", editId), data);

    document.getElementById("editQId").value = "";
    document.getElementById("qBtn").innerText = "Create Quotation";

  } else {
    await addDoc(collection(db, "quotation"), data);
  }

  alert("Quotation Saved ✅");
  document.getElementById("qc").value = "";
  document.getElementById("qItemsContainer").innerHTML = "";
  document.getElementById("qTotal").innerText = "";

  loadQuotation();
};


//  LOAD QUOTATIONS
async function loadQuotation() {
  const snap = await getDocs(collection(db, "quotation"));
  let html = "";

  snap.forEach(d => {
    const x = d.data();

    let itemsHTML = "";

    x.items?.forEach(item => {
      itemsHTML += `<p>📦 ${item.name} - ${item.qty} × ₹${item.price}</p>`;
    });

    html += `
    <div class="card bill-card">

      <div class="bill-header">
        <div>
          <h3>${x.c}</h3>
        </div>
        <div class="bill-total">₹${Number(x.total || 0).toFixed(2)}</div>
      </div>

      <hr>

      <div class="bill-items">
        ${itemsHTML}
      </div>

      <hr>

      <div class="bill-summary">
        <p>Subtotal: ₹${Number(x.subtotal || 0).toFixed(2)}</p>
        <p style="color:green;">Discount: -₹${Number(x.discount || 0).toFixed(2)}</p>
        <p>GST: ₹${Number(x.gst || 0).toFixed(2)}</p>
        <h4>Total: ₹${Number(x.total || 0).toFixed(2)}</h4>
      </div>

      <div class="bill-actions">
        <button onclick="editQuotation('${d.id}')">✏️ Edit</button>
        <button onclick="delQuotation('${d.id}')">❌ Delete</button>
      </div>

    </div>`;
  });

  document.getElementById("qList").innerHTML = html;
}
window.editQuotation = async (id) => {
  const snap = await getDoc(doc(db, "quotation", id));
  if (!snap.exists()) return;

  const x = snap.data();

  document.getElementById("qc").value = x.c || "";

  document.getElementById("qItemsContainer").innerHTML = "";

  x.items?.forEach(item => {
    addQItemRow();

    setTimeout(() => {
      const rows = document.querySelectorAll("#qItemsContainer .item-row");
      const lastRow = rows[rows.length - 1];

      const select = lastRow.querySelector("select");
      const input = lastRow.querySelector("input");

      select.value = item.name;
      input.value = item.qty;

      updateQTotal();
    }, 200);
  });

  document.getElementById("editQId").value = id;
  document.getElementById("qBtn").innerText = "Update Quotation";

  window.scrollTo({ top: 0, behavior: "smooth" });
};
window.delQuotation = async (id) => {
  if (confirm("Delete quotation?")) {
    await deleteDoc(doc(db, "quotation", id));
    loadQuotation();
  }
};
/* ================= AI (GEMINI ENHANCED) ================= */
window.askAI = async () => {
  if (!aiInput.value) return;

  aiResult.innerText = "Analyzing all business data...";

  const API_KEY = "AQ.Ab8RN6Kgfk_d2sYrWkJppR0jDH19xbGFDjzJeBAcqywCrcPQmw";
  const URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent?key=${API_KEY}`;

  try {
    const [
      dashboardSnap,
      workerSnap,
      attendanceSnap,
      stockSnap,
      billSnap,
      quotationSnap,
      settingsShopSnap,
      settingsOfferSnap
    ] = await Promise.all([
      getDocs(collection(db, "dashboard")),
      getDocs(collection(db, "workers")),
      getDocs(collection(db, "attendance")),
      getDocs(collection(db, "stock")),
      getDocs(collection(db, "bills")),
      getDocs(collection(db, "quotation")),
      getDoc(doc(db, "settings", "shop")),
      getDoc(doc(db, "settings", "offer"))
    ]);
    let inventoryContext = "\n📦 STOCK:\n";
    stockSnap.forEach(d => {
      const i = d.data();
      inventoryContext += `- ${i.n}: Qty=${i.q}, Price=₹${i.price}, Unit=${i.unit || "pcs"}\n`;
    });
    let workerContext = "\n👷 WORKERS:\n";
    workerSnap.forEach(d => {
      const w = d.data();
      workerContext += `- ${w.name}: Salary=₹${w.salary}\n`;
    });
let attendanceContext = "\n📅 ATTENDANCE (TODAY):\n";

const today = new Date().toISOString().split("T")[0];

workerSnap.forEach(d => {
  const w = d.data();
  const att = w.attendance || {};

  const status =
    att[today] === "P" ? "Present" :
    att[today] === "A" ? "Absent" :
    "No data";

  attendanceContext += `- ${w.name}: ${status}\n`;
});
    let billContext = "\n🧾 BILLS:\n";
    billSnap.forEach(d => {
      const b = d.data();
      billContext += `- ${b.c}: ₹${b.total || 0}, Phone=${b.phone || "N/A"}\n`;
    });
    let quotationContext = "\n📄 QUOTATIONS:\n";
    quotationSnap.forEach(d => {
      const q = d.data();
      quotationContext += `- ${q.c || "Customer"}: ₹${q.total || 0}\n`;
    });
    const shopData = settingsShopSnap.exists() ? settingsShopSnap.data() : {};
    const offerData = settingsOfferSnap.exists() ? settingsOfferSnap.data() : {};

    const settingsContext = `
🏪 SHOP INFO:
- Name: ${shopData.name || "N/A"}
- Address: ${shopData.address || "N/A"}
- Phone: ${shopData.phone || "N/A"}

🎁 CURRENT OFFER:
- Name: ${offerData.name || "No Offer"}
- Discount: ${offerData.discount || 0}%
- Applicable On: ${offerData.applicableOn || "N/A"}
`;
    const systemPrompt = `
You are an intelligent AI assistant for a shop management system.

You have access to ALL business data below:

${settingsContext}

${inventoryContext}

${workerContext}

${attendanceContext}

${billContext}

${quotationContext}

RULES:
- If data is available, answer using it.
- If not available, say clearly you don't know.
- Always be precise and helpful.
- You can calculate totals if needed.
`;
    const res = await fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `${systemPrompt}\n\nUSER QUESTION: ${aiInput.value}`
              }
            ]
          }
        ]
      })
    });

    const data = await res.json();

    aiResult.innerText =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response";

  } catch (err) {
    aiResult.innerText = "AI Error: " + err.message;
    console.error(err);
  }
};
/* ================= DASHBOARD ================= */
async function loadDash() {
  const [w, s, b] = await Promise.all([
    getDocs(collection(db, "workers")),
    getDocs(collection(db, "stock")),
    getDocs(collection(db, "bills"))
  ]);
  document.getElementById("w") && (document.getElementById("w").innerText = w.size);
  document.getElementById("s") && (document.getElementById("s").innerText = s.size);
  document.getElementById("b") && (document.getElementById("b").innerText = b.size);

  let revenue = 0;
  let todaySales = 0;
  let totalOrders = 0;
  let customersSet = new Set();

  let salesByDate = {}; 
  let productMap = {}; 

  const today = new Date().toDateString();

  b.forEach(d => {
    const x = d.data();

    const total = Number(x.total) || 0;
    revenue += total;
    totalOrders++;
    if (x.c) customersSet.add(x.c);
    if (x.date) {
      const billDate = new Date(x.date).toDateString();
      if (billDate === today) {
        todaySales += total;
      }
      const date = new Date(x.date).toLocaleDateString();
      salesByDate[date] = (salesByDate[date] || 0) + total;
    }
    if (x.items) {
      x.items.forEach(item => {
        productMap[item.name] = (productMap[item.name] || 0) + item.qty;
      });
    } else if (x.product) {
      productMap[x.product] = (productMap[x.product] || 0) + (x.qty || 1);
    }
  });

let dateMap = {};

b.forEach(d => {
  const x = d.data();
  const total = Number(x.total) || 0;

  if (!x.date) return;

  const date = new Date(x.date).toLocaleDateString();

  if (!dateMap[date]) {
    dateMap[date] = 0;
  }

  dateMap[date] += total;
});

// convert to arrays
let labels = Object.keys(dateMap);
let data = Object.values(dateMap);

// fallback if no data
if (labels.length === 0) {
  labels = ["No Data"];
  data = [0];
}
  let topProduct = "No Sales Yet";
  let maxQty = 0;

  for (let p in productMap) {
    if (productMap[p] > maxQty) {
      maxQty = productMap[p];
      topProduct = p;
    }
  }

  let lowStock = 0;
  s.forEach(d => {
    const x = d.data();
    if ((x.q || 0) < 5) lowStock++;
  });
  document.getElementById("r") && (document.getElementById("r").innerText = revenue.toFixed(2));
  document.getElementById("todaySales") && (document.getElementById("todaySales").innerText = "₹" + todaySales.toFixed(2));
  document.getElementById("orders") && (document.getElementById("orders").innerText = totalOrders);
  document.getElementById("customers") && (document.getElementById("customers").innerText = customersSet.size);
  document.getElementById("lowStock") && (document.getElementById("lowStock").innerText = lowStock);
  document.getElementById("topProduct") && (document.getElementById("topProduct").innerText = topProduct);

  /* ================= CHART ================= */

  if (window.myChart) {
    window.myChart.destroy();
  }

  const ctx = document.getElementById("salesChart");

  if (ctx) {
    window.myChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [{
          label: "Sales ₹",
          data: data,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: 10
        },
        scales: {
          y: {
            beginAtZero: true
          }
        },
        plugins: {
          legend: {
            display: true
          }
        }
      }
    });
  }
}
/* ================= INIT ================= */
function loadAll() {
  loadShop();
  loadOffer();
  loadWorkers();
  loadStock();
  loadProducts();
  loadBills();
  loadQuotation();
  loadAttendance();
  loadDash();
  addItemRow();
  loadShopSettings();
}

const monthInput = document.getElementById("monthSelect");

if (monthInput) {

  monthInput.value = new Date().toISOString().slice(0, 7);
  monthInput.addEventListener("input", () => {
    if (!/^\d{4}-\d{2}$/.test(monthInput.value)) {
      monthInput.style.border = "2px solid red";
    } else {
      monthInput.style.border = "1px solid #ccc";
    }
  });
  monthInput.addEventListener("change", () => {
    loadAttendance();
  });

}