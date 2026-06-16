// Shared site navigation + BST clock, injected into <nav id="site-nav"> on every page.
(function () {
  const learn = [
    ["why.html", "Why Meditate"],
    ["rationale.html", "Rationale"],
    ["benefits.html", "Health Benefits"],
    ["pabb.html", "The PABB Goal"],
    ["reflections.html", "Intentional Reflections"],
    ["position.html", "Posture & Position"],
    ["breathing.html", "Ohmmm Breathing"],
    ["techniques.html", "Techniques"],
    ["wandering.html", "Mind Wandering"],
    ["mistakes.html", "Common Mistakes"],
    ["boredom.html", "Boredom & Flow"],
    ["consciousness.html", "Maps of Consciousness"],
  ];

  const current = location.pathname.split("/").pop() || "index.html";
  const cur = (h) => (h === current ? ' aria-current="page"' : "");
  const isLearn = learn.some(([h]) => h === current);
  const learnItems = learn
    .map(([h, l]) => `<li><a href="${h}"${cur(h)}>${l}</a></li>`)
    .join("");

  const nav = document.getElementById("site-nav");
  if (nav) {
    nav.innerHTML = `
      <ul><li><strong>🧘 Meditate</strong></li></ul>
      <ul>
        <li><a href="index.html"${cur("index.html")}>Sessions</a></li>
        <li>
          <details class="dropdown">
            <summary${isLearn ? ' aria-current="page"' : ""}>Learn</summary>
            <ul>${learnItems}</ul>
          </details>
        </li>
        <li><a href="generate.html"${cur("generate.html")}>🎙 Generate Audio</a></li>
        <li><small id="bstClock" title="London time (BST)" style="opacity:0.8;">🇬🇧 --:--</small></li>
      </ul>`;
  }

  function tickBST() {
    const el = document.getElementById("bstClock");
    if (!el) return;
    const t = new Date().toLocaleTimeString("en-GB", {
      timeZone: "Europe/London",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    });
    el.textContent = `🇬🇧 ${t} BST`;
  }
  tickBST();
  setInterval(tickBST, 1000);
})();
