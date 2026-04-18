export function isValidAge(age: number) {
  return Number.isFinite(age) && age >= 0 && age <= 120;
}
