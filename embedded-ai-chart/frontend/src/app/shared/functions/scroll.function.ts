export function scrollToBottom(element: HTMLElement): void {
  if (!element) {
    return;
  }

  setTimeout(() => {
    try {
      element.scrollTo({
        top: element.scrollHeight,
        behavior: 'smooth'
      });
    } catch (err) { }
  }, 0)
}