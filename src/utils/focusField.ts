import { RefObject } from "react";

export const focusField = (ref:RefObject<HTMLInputElement|HTMLSelectElement| HTMLButtonElement|null>)=>{
  ref.current?.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });

  ref.current?.focus();
};