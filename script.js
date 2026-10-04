/* =========================================================
   EDIT THESE DETAILS. Everything on the site updates from here.
   ========================================================= */
const CONFIG = {
  doctorName: "Dr. Akshita Nittala",
  degrees: ["BHMS", "DNHE"], // each shown on its own line
  gradYear: "2026",
  college: "Maharajah's Institute Of Medical Sciences",
  regNo: "", // e.g. "12345". Leave empty to hide it on the site

  // Instagram (public page only)
  instaPageHandle: "@urs.homoeo.doc",
  instaPageUrl: "https://www.instagram.com/urs.homoeo.doc/",

  // YouTube
  youtubeHandle: "@dr.akshitanittala",
  youtubeUrl: "https://www.youtube.com/@dr.akshitanittala",

  // WhatsApp number (10 digits is fine; 91 is added automatically)
  whatsappNumber: "9121380624",
  phoneDisplay: "9121380624",
  email: "nittala0803@gmail.com",

  // Days closed for consultations (0 = Sunday, 1 = Monday ... 6 = Saturday)
  closedDays: [0],
};

/* ---------- Fill config values into the page ---------- */
document.querySelectorAll("[data-config]").forEach((el) => {
  const value = CONFIG[el.dataset.config];
  if (Array.isArray(value)) {
    // One item per line
    el.replaceChildren(...value.flatMap((v, i) => (i ? [document.createElement("br"), v] : [v])));
  } else if (value) {
    el.textContent = value;
  }
});
document.getElementById("year").textContent = new Date().getFullYear();

if (!CONFIG.regNo) {
  document.querySelectorAll(".js-reg").forEach((el) => (el.hidden = true));
}

/* ---------- Links ---------- */
// Accept the number with or without 91; WhatsApp needs the country code
const digits = CONFIG.whatsappNumber.replace(/\D/g, "");
const fullNumber = digits.length === 10 ? `91${digits}` : digits;
const waBase = `https://wa.me/${fullNumber}`;
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
setLinks(".js-youtube", CONFIG.youtubeUrl);

document.getElementById("callLink").href = `tel:+${fullNumber}`;
document.getElementById("emailLink").href = `mailto:${CONFIG.email}`;

/* ---------- Header shadow on scroll ---------- */
const header = document.querySelector(".header");
const onScroll = () => header.classList.toggle("header--scrolled", window.scrollY > 10);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// Keep jump links from hiding section titles under the sticky header (its height changes per screen size)
const syncHeaderHeight = () =>
  document.documentElement.style.setProperty("--header-h", `${header.offsetHeight}px`);
window.addEventListener("resize", syncHeaderHeight);
syncHeaderHeight();

/* ---------- Mobile menu ---------- */
const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".nav");

function setMenu(open) {
  nav.classList.toggle("nav--open", open);
  toggle.classList.toggle("nav-toggle--open", open);
  toggle.setAttribute("aria-expanded", open);
  toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
}
toggle.addEventListener("click", () => setMenu(!nav.classList.contains("nav--open")));
nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
// Close when tapping outside the header or pressing Escape
document.addEventListener("click", (e) => {
  if (!header.contains(e.target)) setMenu(false);
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") setMenu(false);
});

/* ---------- Highlight the menu link of the section on screen ---------- */
const navLinks = [...nav.querySelectorAll('a[href^="#"]')];
if ("IntersectionObserver" in window) {
  const spy = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      navLinks.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === `#${e.target.id}`));
    }),
    { rootMargin: "-45% 0px -50% 0px" }
  );
  navLinks.forEach((a) => {
    const section = document.querySelector(a.getAttribute("href"));
    if (section) spy.observe(section);
  });
}

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
    `Consultation: Online (video call)`,
    `Preferred date: ${date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}`,
    `Preferred time: ${data.time}`,
    `Language: ${data.language}`,
    data.concern.trim() ? `Concern: ${data.concern.trim()}` : null,
  ].filter((line) => line !== null);

  window.open(`${waBase}?text=${encodeURIComponent(lines.join("\n"))}`, "_blank", "noopener");
  form.reset();
});

function showError(msg) {
  errorBox.textContent = msg;
}
