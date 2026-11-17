// Applies the saved theme before first paint (no flash). Dark is the default.
(function () {
  try {
    var mode = localStorage.getItem("nexivo-theme");
    if (mode === "light") document.documentElement.classList.remove("dark");
    var accent = localStorage.getItem("nexivo-accent");
    if (accent && /^#[0-9a-fA-F]{6}$/.test(accent)) document.documentElement.style.setProperty("--brand", accent);
  } catch (e) { /* storage blocked: keep defaults */ }
  // Attach the preloaded Google Fonts stylesheet without blocking first paint (CSP-safe: no inline handlers).
  document.addEventListener("DOMContentLoaded", function () {
    var pre = document.getElementById("fonts");
    if (!pre) return;
    var css = document.createElement("link");
    css.rel = "stylesheet"; css.href = pre.getAttribute("href");
    document.head.appendChild(css);
  });
})();
