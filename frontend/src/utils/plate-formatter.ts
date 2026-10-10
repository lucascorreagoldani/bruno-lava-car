export function formatLicensePlate(rawPlate: string): string {
  const sanitized = rawPlate.replace(/[^A-Za-z0-9]/g, "").toUpperCase();

  if (sanitized.length === 7) {
    const mercosulRegex = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;
    if (mercosulRegex.test(sanitized)) {
      return sanitized;
    }

    const traditionalRegex = /^[A-Z]{3}[0-9]{4}$/;
    if (traditionalRegex.test(sanitized)) {
      return `${sanitized.slice(0, 3)}-${sanitized.slice(3)}`;
    }
  }

  return sanitized;
}

export function isMercosulPlate(plate: string): boolean {
  const sanitized = plate.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  return /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/.test(sanitized);
}
