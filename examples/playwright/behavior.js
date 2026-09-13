const form = document.querySelector("#form");
const email = document.querySelector("#email");
const submit = document.querySelector("#submit");
const status = document.querySelector("#status");

globalThis.__behaviorNodes = { form, email, submit };
form.addEventListener("submit", (event) => {
  event.preventDefault();
  status.textContent = new URL(location.href).searchParams.has("broken")
    ? "Broken fixture did not submit"
    : `Submitted ${email.value}`;
});
document.documentElement.dataset.ready = "true";
