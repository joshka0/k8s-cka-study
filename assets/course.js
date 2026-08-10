const expand = document.querySelector("#expand-all");

expand.addEventListener("click", () => {
  const details = [...document.querySelectorAll("details")];
  const shouldOpen = details.some((item) => !item.open);
  details.forEach((item) => { item.open = shouldOpen; });
  expand.textContent = shouldOpen ? "Collapse answers" : "Reveal all answers";
});
