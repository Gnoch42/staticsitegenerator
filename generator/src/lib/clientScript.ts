// Script vanilla (aucune dépendance) partagé par la preview et le site
// publié : bascule FR/EN sans recharger la structure de la page.
export const LANG_TOGGLE_JS = `
(function () {
  function apply(root, lang) {
    root.setAttribute("data-active-lang", lang);
    root.querySelectorAll(".lang-btn[data-set-lang]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-set-lang") === lang));
    });
    try { localStorage.setItem("cv-lang", lang); } catch (e) {}
  }
  function init() {
    var root = document.querySelector(".site-root");
    if (!root) return;
    var langs = Array.prototype.map.call(
      root.querySelectorAll(".lang-btn[data-set-lang]"),
      function (b) { return b.getAttribute("data-set-lang"); }
    );
    var stored = null;
    try { stored = localStorage.getItem("cv-lang"); } catch (e) {}
    var initial = (stored && langs.indexOf(stored) !== -1)
      ? stored
      : (root.getAttribute("data-active-lang") || langs[0]);
    apply(root, initial);
    root.addEventListener("click", function (e) {
      var btn = e.target.closest && e.target.closest(".lang-btn[data-set-lang]");
      if (btn) { e.preventDefault(); apply(root, btn.getAttribute("data-set-lang")); }
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else { init(); }
})();
`;
