(function () {
  var storageKey = "theme";
  var states = ["system", "light", "dark"];
  var root = document.documentElement;
  var toggle = document.querySelector("[data-theme-toggle]");

  if (!toggle) {
    return;
  }

  function readTheme() {
    try {
      var savedTheme = localStorage.getItem(storageKey);
      if (states.indexOf(savedTheme) !== -1) {
        return savedTheme;
      }
    } catch (_) {
    }

    return "system";
  }

  function writeTheme(theme) {
    if (theme === "system") {
      root.removeAttribute("data-theme");
    } else {
      root.setAttribute("data-theme", theme);
    }

    toggle.setAttribute("data-theme-state", theme);
    toggle.setAttribute("aria-label", "Theme: " + theme);
    toggle.setAttribute("title", "Theme: " + theme);

    try {
      if (theme === "system") {
        localStorage.removeItem(storageKey);
      } else {
        localStorage.setItem(storageKey, theme);
      }
    } catch (_) {
    }
  }

  toggle.addEventListener("click", function () {
    var currentTheme = readTheme();
    var nextTheme = states[(states.indexOf(currentTheme) + 1) % states.length];
    writeTheme(nextTheme);
  });

  writeTheme(readTheme());
}());
