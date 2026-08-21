export const focusField = (ref) => {
  ref.current?.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });

  ref.current?.focus();
};