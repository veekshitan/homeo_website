/* =========================================================
   EDIT THESE DETAILS. Everything on the site updates from here.
   ========================================================= */
const CONFIG = {
  doctorName: "Dr. Akshita Nittala",
  degree: "BHMS",
  gradYear: "2026",
  college: "Maharashtra Institute of Medical Sciences",
  regNo: "", // e.g. "12345". Leave empty to hide it on the site

  // Instagram
  instaPageHandle: "@urs.homoeo.doc",
  instaPageUrl: "https://www.instagram.com/urs.homoeo.doc/",
  instaPersonalHandle: "@akshitanittala",
  instaPersonalUrl: "https://www.instagram.com/akshitanittala/",

  // WhatsApp number with country code, digits only (91 = India)
  whatsappNumber: "8074128388",
  phoneDisplay: "+91 8074128388",
  email: "veekshitanaidu24@gmail.com",

  // Clinic address. Leave empty if she only consults online (hides the map section)
  address: "",

  // Days closed for consultations (0 = Sunday, 1 = Monday ... 6 = Saturday)
  closedDays: [0],
};

/* ---------- Fill config values into the page ---------- */
document.querySelectorAll("[data-config]").forEach((el) => {
  const value = CONFIG[el.dataset.config];
  if (value) el.textContent = value;
});
document.getElementById("year").textContent = new Date().getFullYear();

if (!CONFIG.regNo) {
  document.querySelectorAll(".js-reg").forEach((el) => (el.hidden = true));
}

/* ---------- Links ---------- */
const waBase = `https://wa.me/${CONFIG.whatsappNumber}`;
const waGreeting = encodeURIComponent(`Hello ${CONFIG.doctorName}, I would like to know more about a consultation.`);

function setLinks(selector, href) {
  document.querySelectorAll(selector).forEach((a) => {
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener";
  });
}
setLinks(".js-whatsapp", `${waBase}?text=${waGreeting}`);
setLinks(".js-insta-page", CONFIG.instaPageUrl);
setLinks(".js-insta-personal", CONFIG.instaPersonalUrl);

document.getElementById("callLink").href = `tel:+${CONFIG.whatsappNumber}`;
document.getElementById("emailLink").href = `mailto:${CONFIG.email}`;

/* ---------- Location + map (only when an address is set) ---------- */
if (CONFIG.address) {
  const q = encodeURIComponent(CONFIG.address);
  document.getElementById("location").hidden = false;
  document.getElementById("mapFrame").src = `https://maps.google.com/maps?q=${q}&z=15&output=embed`;
  document.getElementById("directionsLink").href = `https://www.google.com/maps/search/?api=1&query=${q}`;
}

/* ---------- Header shadow on scroll ---------- */
const header = document.querySelector(".header");
const onScroll = () => header.classList.toggle("header--scrolled", window.scrollY > 10);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

/* ---------- Mobile menu ---------- */
const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".nav");

toggle.addEventListener("click", () => {
  const open = nav.classList.toggle("nav--open");
  toggle.classList.toggle("nav-toggle--open", open);
  toggle.setAttribute("aria-expanded", open);
});
nav.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    nav.classList.remove("nav--open");
    toggle.classList.remove("nav-toggle--open");
    toggle.setAttribute("aria-expanded", "false");
  })
);

/* ---------- Fade-in on scroll ---------- */
const reveals = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("reveal--in");
        io.unobserve(e.target);
      }
    }),
    { threshold: 0.12 }
  );
  reveals.forEach((el) => io.observe(el));
} else {
  reveals.forEach((el) => el.classList.add("reveal--in"));
}

/* ---------- Booking form -> WhatsApp ---------- */
const form = document.getElementById("bookingForm");
const errorBox = document.getElementById("formError");

// Earliest date is today (local time)
const today = new Date();
today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
form.elements.date.min = today.toISOString().split("T")[0];

function parseDate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  errorBox.textContent = "";

  const data = Object.fromEntries(new FormData(form));
  const name = data.name.trim();
  const phone = data.phone.trim();

  if (!name) return showError("Please enter your name.");
  if (!/^[6-9]\d{9}$/.test(phone)) return showError("Please enter a valid 10-digit mobile number.");
  if (!data.date) return showError("Please choose a preferred date.");
  if (!data.time) return showError("Please choose a preferred time slot.");

  const date = parseDate(data.date);
  if (CONFIG.closedDays.includes(date.getDay())) {
    return showError("Consultations aren't available on that day. Please choose another date.");
  }

  const lines = [
    `*New Appointment Request*`,
    ``,
    `Name: ${name}`,
    `Phone: ${phone}`,
    data.age ? `Age: ${data.age}` : null,
    `Consultation: ${data.type}`,
    `Preferred date: ${date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}`,
    `Preferred time: ${data.time}`,
    data.concern.trim() ? `Concern: ${data.concern.trim()}` : null,
  ].filter((line) => line !== null);

  window.open(`${waBase}?text=${encodeURIComponent(lines.join("\n"))}`, "_blank", "noopener");
  form.reset();
});

function showError(msg) {
  errorBox.textContent = msg;
}
