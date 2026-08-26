export function learningObjectiveLabel(
  code: string,
  displayOrder?: number | null,
) {
  if (typeof displayOrder === "number") {
    return `Learning Objective ${displayOrder}`;
  }

  const trailingNumber = code.match(/(\d+)$/)?.[1];

  if (trailingNumber) {
    return `Learning Objective ${Number(trailingNumber)}`;
  }

  return "Learning Objective";
}
