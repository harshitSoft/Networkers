import { useEffect } from "react";

export default function useFormValidation() {
  useEffect(() => {
    function configure(root = document) {
      const fields = [
        ...(root.matches?.("input, textarea") ? [root] : []),
        ...(root.querySelectorAll?.("input, textarea") || []),
      ];
      fields.forEach((field) => {
        const hint = `${field.name} ${field.id} ${field.placeholder}`.toLowerCase();
        if (field.tagName === "TEXTAREA") {
          if (field.maxLength < 0) field.maxLength = 2000;
        } else if (field.type === "tel" || /mobile|phone|contact number/.test(hint)) {
          field.type = "tel"; field.inputMode = "numeric"; field.maxLength = 10;
          field.pattern = "[0-9]{10}"; field.title = "Enter a valid 10-digit mobile number";
        } else if (/email/.test(hint)) {
          field.type = "email"; field.maxLength = 254;
        } else if (/website|url/.test(hint) && field.type !== "file") {
          field.type = "url"; field.title = "Enter a complete URL, for example https://example.com";
        } else if (field.type === "password") {
          field.minLength = Math.max(field.minLength, 8); field.maxLength = 128;
        } else if (/year/.test(hint)) {
          field.type = "number"; field.min = "1800"; field.max = String(new Date().getFullYear());
        } else if (field.type === "number" && !field.hasAttribute("min")) {
          field.min = "0";
        } else if (field.type === "text" && field.maxLength < 0) {
          field.maxLength = 150;
        }
      });
    }
    configure();
    const observer = new MutationObserver((entries) => entries.forEach((entry) => entry.addedNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) configure(node);
    })));
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);
}
