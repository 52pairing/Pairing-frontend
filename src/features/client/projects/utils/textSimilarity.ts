const normalizeText = (value: string) =>
  value
    .normalize("NFKC")
    .toLocaleLowerCase("ko-KR")
    .replace(/[^\p{L}\p{N}]+/gu, "");

const bigrams = (value: string) => {
  if (value.length < 2) return [value];
  return Array.from({ length: value.length - 1 }, (_, index) =>
    value.slice(index, index + 2),
  );
};

export function calculateTextOverlap(left: string, right: string) {
  const normalizedLeft = normalizeText(left);
  const normalizedRight = normalizeText(right);
  if (!normalizedLeft || !normalizedRight) return 0;
  if (normalizedLeft === normalizedRight) return 1;

  const leftBigrams = bigrams(normalizedLeft);
  const rightBigrams = bigrams(normalizedRight);
  const rightCounts = new Map<string, number>();
  for (const value of rightBigrams) {
    rightCounts.set(value, (rightCounts.get(value) ?? 0) + 1);
  }

  let intersection = 0;
  for (const value of leftBigrams) {
    const count = rightCounts.get(value) ?? 0;
    if (count < 1) continue;
    intersection += 1;
    rightCounts.set(value, count - 1);
  }

  return (2 * intersection) / (leftBigrams.length + rightBigrams.length);
}

export function isLikelyRepeatedText(left: string, right: string) {
  const normalizedLeft = normalizeText(left);
  const normalizedRight = normalizeText(right);
  if (normalizedLeft.length < 8 || normalizedRight.length < 8) return false;

  const lengthRatio =
    Math.min(normalizedLeft.length, normalizedRight.length) /
    Math.max(normalizedLeft.length, normalizedRight.length);

  if (normalizedLeft === normalizedRight) return true;
  if (
    lengthRatio >= 0.85 &&
    (normalizedLeft.includes(normalizedRight) ||
      normalizedRight.includes(normalizedLeft))
  ) {
    return true;
  }

  return lengthRatio >= 0.85 && calculateTextOverlap(left, right) >= 0.9;
}
