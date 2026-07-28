function parseProjectId(args) {
  const optionIndex = args.indexOf("--project-id");
  const value = optionIndex >= 0 ? Number(args[optionIndex + 1]) : NaN;

  if (!Number.isInteger(value) || value <= 0) {
    throw new Error("--project-id must be a positive integer");
  }

  return value;
}

module.exports = {
  parseProjectId
};
