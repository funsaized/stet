export function mountApp(): void {
  document.querySelector<HTMLButtonElement>("#target")!.addEventListener("click", () => {
    document.querySelector<HTMLOutputElement>("#status")!.value = "Clicked";
  });
  document.documentElement.dataset.ready = "true";
}
