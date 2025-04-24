// ts/click.ts
export function addClickDelay(
  button: HTMLButtonElement,
  callback: (e: Event) => void,
  delay = 500
) {
  if (!button) return;

  button.addEventListener("click", (e) => {
    if (button.disabled) return;

    button.disabled = true;
    button.classList.add("opacity-50", "pointer-events-none");

    callback(e);

    setTimeout(() => {
      button.disabled = false;
      button.classList.remove("opacity-50", "pointer-events-none");
    }, delay);
  });
}

export function addClickDelayToSelector(
  selector: string,
  callback: (e: Event, button: HTMLButtonElement) => void,
  delay = 500
) {
  document.querySelectorAll(selector).forEach((el) => {
    const button = el as HTMLButtonElement;
    addClickDelay(button, (e) => callback(e, button), delay);
  });
}