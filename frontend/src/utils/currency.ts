export function formatCurrencyBRL(valueInCentsOrDecimal: number): string {
  const normalizedValue = Number.isInteger(valueInCentsOrDecimal) && valueInCentsOrDecimal > 1000
    ? valueInCentsOrDecimal / 100
    : valueInCentsOrDecimal;

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(normalizedValue);
}
