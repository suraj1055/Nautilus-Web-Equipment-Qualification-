export const calculateAverage = (values) => {
  const nums = values.filter(v => !isNaN(v) && v !== "");
  if (nums.length === 0) return "";
  return (nums.reduce((a, b) => a + Number(b), 0) / nums.length).toFixed(2);
};

export const calculateIncrease = (avg, base) => {
  if (!avg || !base) return "";
  return (avg - base).toFixed(2);
};

export const calculatePercentage = (inc, base) => {
  if (!inc || !base) return "";
  return ((inc / base) * 100).toFixed(2);
};
