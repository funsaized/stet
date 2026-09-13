const form = document.querySelector("#form");
const password = document.querySelector("#password");
const status = document.querySelector("#status");

globalThis.__handoffNodes = { password, save: document.querySelector("#save") };
form.addEventListener("submit", (event) => {
  event.preventDefault();
  status.textContent = new URL(location.href).searchParams.has("broken")
    ? "Broken fixture did not submit"
    : `Saved ${password.value.length} characters`;
});
document.querySelector("#handoff").dataset.appState = "ready";
document.documentElement.dataset.handlers = "ready";
