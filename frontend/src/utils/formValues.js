export function normalizePhone(value) {
  const digits = String(value ?? "").replace(/\D/g, "");
  return digits.length > 10 ? digits.slice(-10) : digits;
}

export function normalizeWebsite(value) {
  const website = String(value ?? "").trim();
  if (!website || /^https?:\/\//i.test(website)) return website;
  return `https://${website}`;
}
