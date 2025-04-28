// 📅 Calendar & UI Elements
const calendar = document.getElementById("calendar");
const monthYear = document.getElementById("monthYear");
const prevMonth = document.getElementById("prevMonth");
const nextMonth = document.getElementById("nextMonth");
const guestListSection = document.getElementById("guestList");
const selectedDateText = document.getElementById("selectedDateText");
const guestTableBody = document.querySelector("#logbookTable tbody");

// 📦 State & Data
let currentDate = new Date();
let selectedCalendarDate = null;
let guestDataByDate = JSON.parse(localStorage.getItem("guestDataByDate")) || {};
let isEditing = false;
let editingGuestOriginalName = "";

// 💾 Save to localStorage
function saveData() {
  localStorage.setItem("guestDataByDate", JSON.stringify(guestDataByDate));
}

// 🗓 Render Calendar Grid
function renderCalendar() {
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const lastDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");

  monthYear.textContent = currentDate.toLocaleString("default", { month: "long", year: "numeric" });
  calendar.innerHTML = "";

  for (let i = 0; i < firstDay; i++) {
    calendar.innerHTML += '<div class="empty"></div>';
  }

  for (let i = 1; i <= lastDate; i++) {
    const day = document.createElement("div");
    day.classList.add("date");
    day.textContent = i;

    const dayStr = String(i).padStart(2, "0");
    const fullDate = `${year}-${month}-${dayStr}`;

    day.addEventListener("click", () => handleDateClick(fullDate));
    calendar.appendChild(day);
  }
}

// 📆 Handle Date Click
function handleDateClick(fullDate) {
  selectedCalendarDate = fullDate;
  selectedDateText.textContent = fullDate;
  guestListSection.style.display = "block";

  if (!guestDataByDate[fullDate]) {
    guestDataByDate[fullDate] = [];
  }

  updateGuestTable(fullDate);
}

// 🧾 Update Guest Table
function updateGuestTable(date) {
  guestTableBody.innerHTML = "";

  const guests = guestDataByDate[date] || [];

  guests.forEach((guest) => {
    const total = guest.downPayment + guest.balance;
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${guest.name}</td>
      <td>${guest.cellphone}</td>
      <td>${guest.pickup}</td>
      <td>${guest.dateOfUse}</td>
      <td>₱${guest.price}</td>
      <td>₱${guest.downPayment}</td>
      <td>₱${guest.balance}</td>
      <td>₱${total}</td>
      <td>${guest.description}</td>
      <td>
        <button class="editBtn" data-date="${date}" data-name="${guest.name}">Edit</button>
        <button class="deleteBtn" data-date="${date}" data-name="${guest.name}">Delete</button>
      </td>
    `;

    guestTableBody.appendChild(row);
  });

  document.querySelectorAll(".editBtn").forEach((btn) =>
    btn.addEventListener("click", () => editGuestEntry(btn.dataset.date, btn.dataset.name))
  );

  document.querySelectorAll(".deleteBtn").forEach((btn) =>
    btn.addEventListener("click", () => deleteGuestEntry(btn.dataset.date, btn.dataset.name))
  );
}

// ➕ Add or Update Guest Entry
function addGuestEntry(event) {
  event.preventDefault();

  const guestName = document.getElementById("guestName").value.trim();
  const cellphone = document.getElementById("cellphoneNumber").value.trim();
  const pickupDate = document.getElementById("pickupDate").value.trim();
  const dateOfUse = document.getElementById("dateOfUse").value.trim();
  const price = parseFloat(document.getElementById("price").value);
  const downPayment = parseFloat(document.getElementById("downPayment").value);
  const balance = parseFloat(document.getElementById("balance").value);
  const description = document.getElementById("description").value.trim();

  if (!guestName || !cellphone || !pickupDate || !dateOfUse || isNaN(price) || isNaN(downPayment) || isNaN(balance) || !description) {
    return alert("All fields are required.");
  }

  if (!selectedCalendarDate) {
    return alert("Please select a date on the calendar.");
  }

  if (!guestDataByDate[selectedCalendarDate]) {
    guestDataByDate[selectedCalendarDate] = [];
  }

  if (isEditing) {
    guestDataByDate[selectedCalendarDate] = guestDataByDate[selectedCalendarDate].filter(
      (guest) => guest.name !== editingGuestOriginalName
    );
    isEditing = false;
    editingGuestOriginalName = "";
  }

  guestDataByDate[selectedCalendarDate].push({
    name: guestName,
    cellphone: cellphone,
    pickup: pickupDate,
    dateOfUse: dateOfUse,
    price: price,
    downPayment: downPayment,
    balance: balance,
    description: description,
  });

  saveData();
  updateGuestTable(selectedCalendarDate);
  document.getElementById("logbookForm").reset();
}

// ✏️ Edit Guest Entry
function editGuestEntry(date, name) {
  const guest = guestDataByDate[date].find((guest) => guest.name === name);
  if (guest) {
    document.getElementById("guestName").value = guest.name;
    document.getElementById("cellphoneNumber").value = guest.cellphone;
    document.getElementById("pickupDate").value = guest.pickup;
    document.getElementById("dateOfUse").value = guest.dateOfUse;
    document.getElementById("price").value = guest.price;
    document.getElementById("downPayment").value = guest.downPayment;
    document.getElementById("balance").value = guest.balance;
    document.getElementById("description").value = guest.description;

    isEditing = true;
    editingGuestOriginalName = guest.name;
  }
}

// ❌ Delete Guest Entry
function deleteGuestEntry(date, name) {
  guestDataByDate[date] = guestDataByDate[date].filter((guest) => guest.name !== name);
  saveData();
  updateGuestTable(date);
}

// 📁 Download Current Month CSV
document.getElementById("downloadCsvBtn").addEventListener("click", () => {
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  let csvContent = "Date,Name,Cellphone,Pickup Date,Date of Use,Price,Down Payment,Balance,Total,Description\n";

  for (let day = 1; day <= 31; day++) {
    const dayStr = String(day).padStart(2, "0");
    const fullDate = `${year}-${month}-${dayStr}`;
    const guests = guestDataByDate[fullDate];

    if (guests) {
      guests.forEach((guest) => {
        const total = guest.downPayment + guest.balance;
        csvContent += `${fullDate},${guest.name},${guest.cellphone},${guest.pickup},${guest.dateOfUse},${guest.price},${guest.downPayment},${guest.balance},${total},${guest.description}\n`;
      });
    }
  }

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `GuestLog-${year}-${month}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

// 🔄 Navigation Controls
prevMonth.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
  guestListSection.style.display = "none";
  selectedCalendarDate = null;
});

nextMonth.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
  guestListSection.style.display = "none";
  selectedCalendarDate = null;
});

// 📅 Initialize Calendar
document.addEventListener("DOMContentLoaded", () => renderCalendar());

// 📝 Form Submit Handler
document.getElementById("logbookForm").addEventListener("submit", addGuestEntry);
