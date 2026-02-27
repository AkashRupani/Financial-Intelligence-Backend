function normalize(line) {
  return line.replace(/\s+/g, " ").toLowerCase();
}

function findHeaderLineIndex(lines) {
  for (let i = 0; i < lines.length; i++) {
    const line = normalize(lines[i]);

    if (
      line.includes("date") &&
      line.includes("narration") &&
      (line.includes("withdrawal") || line.includes("debit")) &&
      (line.includes("deposit") || line.includes("credit"))
    ) {
      return i;
    }
  }
  return -1;
}

module.exports = findHeaderLineIndex;
