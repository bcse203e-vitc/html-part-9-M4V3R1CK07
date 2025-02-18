// DOM Elements
const bookingModal = document.getElementById("bookingModal");
const confirmationModal = document.getElementById("confirmationModal");
const appointmentForm = document.getElementById("appointmentForm");
const appointmentsList = document.getElementById("appointmentsList");
const searchInput = document.getElementById("searchAppointments");
const confirmationText = document.getElementById("confirmationText");

// Form Elements
const fullNameInput = document.getElementById("fullName");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const serviceInput = document.getElementById("service");
const datetimeInput = document.getElementById("datetime");
const termsInput = document.getElementById("terms");

// Event Listeners
document.querySelectorAll(".book-btn").forEach((button) => {
  button.addEventListener("click", (e) => {
    const service = e.target.closest(".service-card").dataset.service;
    serviceInput.value = service;
    openModal(bookingModal);
  });
});

document.querySelectorAll(".close-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    closeAllModals();
  });
});

window.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal")) {
    closeAllModals();
  }
});

appointmentForm.addEventListener("submit", handleFormSubmit);
searchInput.addEventListener("input", handleSearch);

// Initialize
loadAppointments();
setMinDateTime();

// Functions
function openModal(modal) {
  modal.style.display = "block";
  document.body.style.overflow = "hidden";
}

function closeAllModals() {
  bookingModal.style.display = "none";
  confirmationModal.style.display = "none";
  document.body.style.overflow = "auto";
  resetForm();
}

function setMinDateTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  const minDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
  datetimeInput.min = minDateTime;
}

function validateForm() {
  let isValid = true;
  const errors = {};

  // Validate Name
  if (!fullNameInput.value.trim()) {
    errors.fullName = "Name is required";
    isValid = false;
  }

  // Validate Email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(emailInput.value)) {
    errors.email = "Please enter a valid email address";
    isValid = false;
  }

  // Validate Phone
  const phoneRegex = /^\d{10}$/;
  if (!phoneRegex.test(phoneInput.value)) {
    errors.phone = "Please enter a valid 10-digit phone number";
    isValid = false;
  }

  // Validate Service
  if (!serviceInput.value) {
    errors.service = "Please select a service";
    isValid = false;
  }

  // Validate DateTime
  const selectedDate = new Date(datetimeInput.value);
  if (!datetimeInput.value || selectedDate < new Date()) {
    errors.datetime = "Please select a future date and time";
    isValid = false;
  }

  // Validate Terms
  if (!termsInput.checked) {
    errors.terms = "You must agree to the terms and conditions";
    isValid = false;
  }

  displayErrors(errors);
  return isValid;
}

function displayErrors(errors) {
  // Clear all existing error messages
  document.querySelectorAll(".error-message").forEach((element) => {
    element.textContent = "";
  });

  // Display new error messages
  Object.keys(errors).forEach((field) => {
    const errorElement = document.querySelector(`#${field}`).nextElementSibling;
    errorElement.textContent = errors[field];
    document.querySelector(`#${field}`).classList.add("shake");
    setTimeout(() => {
      document.querySelector(`#${field}`).classList.remove("shake");
    }, 500);
  });
}

function handleFormSubmit(e) {
  e.preventDefault();

  if (!validateForm()) {
    return;
  }

  const appointment = {
    id: Date.now(),
    fullName: fullNameInput.value,
    email: emailInput.value,
    phone: phoneInput.value,
    service: serviceInput.value,
    datetime: datetimeInput.value,
    requests: document.getElementById("requests").value,
    status: "Confirmed", // Automatically confirm new appointments
  };

  saveAppointment(appointment);
  showConfirmation(appointment);
}

function saveAppointment(appointment) {
  let appointments = JSON.parse(localStorage.getItem("appointments")) || [];
  appointments.push(appointment);
  localStorage.setItem("appointments", JSON.stringify(appointments));
  loadAppointments();
}

function loadAppointments() {
  const appointments = JSON.parse(localStorage.getItem("appointments")) || [];
  appointmentsList.innerHTML = "";

  appointments.forEach((appointment) => {
    const row = createAppointmentRow(appointment);
    appointmentsList.appendChild(row);
  });
}

function createAppointmentRow(appointment) {
  const row = document.createElement("tr");
  row.classList.add("fade-in");

  const datetime = new Date(appointment.datetime);
  const formattedDate =
    datetime.toLocaleDateString() + " " + datetime.toLocaleTimeString();

  // Action buttons
  let actionButtons = `
    <button onclick="rescheduleAppointment('${appointment.id}')"
            class="book-btn" style="padding: 5px 10px; font-size: 0.8rem; background-color: #2196F3; margin-right: 5px;">
      Reschedule
    </button>
    <button onclick="cancelAppointment('${appointment.id}')"
            class="book-btn" style="padding: 5px 10px; font-size: 0.8rem; background-color: #ffc107; margin-right: 5px;">
      Cancel
    </button>
    <button onclick="deleteAppointment('${appointment.id}')"
            class="book-btn" style="padding: 5px 10px; font-size: 0.8rem; background-color: #dc3545;">
      Delete
    </button>
  `;

  // Adjust buttons based on status
  if (appointment.status === "Cancelled") {
    actionButtons = `
      <span class="status-badge status-cancelled">Cancelled</span>
      <button onclick="deleteAppointment('${appointment.id}')"
              class="book-btn" style="padding: 5px 10px; font-size: 0.8rem; background-color: #dc3545;">
        Delete
      </button>
    `;
  }

  row.innerHTML = `
    <td>${appointment.fullName}</td>
    <td>${appointment.service}</td>
    <td>${formattedDate}</td>
    <td>
      <span class="status-badge status-${appointment.status.toLowerCase()}">
        ${appointment.status}
      </span>
    </td>
    <td>${actionButtons}</td>
  `;

  return row;
}

function cancelAppointment(id) {
  if (confirm("Are you sure you want to cancel this appointment?")) {
    let appointments = JSON.parse(localStorage.getItem("appointments")) || [];
    const index = appointments.findIndex((apt) => apt.id.toString() === id);

    if (index !== -1) {
      appointments[index].status = "Cancelled";
      localStorage.setItem("appointments", JSON.stringify(appointments));
      loadAppointments();
    }
  }
}

function rescheduleAppointment(id) {
  let appointments = JSON.parse(localStorage.getItem("appointments")) || [];
  const appointment = appointments.find((apt) => apt.id.toString() === id);

  if (appointment) {
    // Pre-fill the form with existing appointment details
    fullNameInput.value = appointment.fullName;
    emailInput.value = appointment.email;
    phoneInput.value = appointment.phone;
    serviceInput.value = appointment.service;
    document.getElementById("requests").value = appointment.requests;

    // Remove the old appointment
    appointments = appointments.filter((apt) => apt.id.toString() !== id);
    localStorage.setItem("appointments", JSON.stringify(appointments));

    // Open booking modal for rescheduling
    openModal(bookingModal);

    // Update appointments list
    loadAppointments();
  }
}

function deleteAppointment(id) {
  if (
    confirm(
      "Are you sure you want to delete this appointment? This action cannot be undone."
    )
  ) {
    let appointments = JSON.parse(localStorage.getItem("appointments")) || [];
    appointments = appointments.filter((apt) => apt.id.toString() !== id);
    localStorage.setItem("appointments", JSON.stringify(appointments));
    loadAppointments();
  }
}

function showConfirmation(appointment) {
  const datetime = new Date(appointment.datetime);
  const formattedDate =
    datetime.toLocaleDateString() + " " + datetime.toLocaleTimeString();

  confirmationText.textContent = `Thank you, ${appointment.fullName}! Your appointment for ${appointment.service} on ${formattedDate} is confirmed.`;

  closeAllModals();
  openModal(confirmationModal);
}

function resetForm() {
  appointmentForm.reset();
  document.querySelectorAll(".error-message").forEach((element) => {
    element.textContent = "";
  });
}

function handleSearch(e) {
  const searchTerm = e.target.value.toLowerCase();
  const appointments = JSON.parse(localStorage.getItem("appointments")) || [];

  const filteredAppointments = appointments.filter(
    (appointment) =>
      appointment.fullName.toLowerCase().includes(searchTerm) ||
      appointment.service.toLowerCase().includes(searchTerm) ||
      appointment.status.toLowerCase().includes(searchTerm)
  );

  appointmentsList.innerHTML = "";
  filteredAppointments.forEach((appointment) => {
    const row = createAppointmentRow(appointment);
    appointmentsList.appendChild(row);
  });
}
