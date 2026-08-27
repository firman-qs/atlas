const semesterKeys = {
  odd: "odd",
  even: "even",
  ganjil: "ganjil",
  genap: "genap",
  antara: "antara",
  spring: "spring",
  fall: "fall",
  summer: "summer",
} as const;

const soloLevelKeys = {
  prestructural: "prestructural",
  unistructural: "unistructural",
  multistructural: "multistructural",
  relational: "relational",
  extended_abstract: "extendedAbstract",
} as const;

export function learningObjectiveNumber(
  code: string,
  displayOrder?: number | null,
) {
  if (typeof displayOrder === "number") {
    return displayOrder;
  }

  const trailingNumber = code.match(/(\d+)$/)?.[1];

  if (trailingNumber) {
    return Number(trailingNumber);
  }

  return null;
}

export function semesterMessageKey(value: string) {
  return semesterKeys[value as keyof typeof semesterKeys] ?? null;
}

export function soloLevelMessageKey(value: string) {
  return soloLevelKeys[value as keyof typeof soloLevelKeys] ?? null;
}

export function formatDomainCode(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
