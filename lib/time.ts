export const isTimeValid = (
  scheduled_time?: string,
  now: Date = new Date()
) => {
  if (!scheduled_time) return true;

  const [h, m] = scheduled_time.split(":").map(Number);

  const scheduled = new Date();
  scheduled.setHours(h, m, 0, 0);

  const before = new Date(scheduled.getTime() - 60 * 60 * 1000);
  const after = new Date(scheduled.getTime() + 60 * 60 * 1000);

  return now >= before && now <= after;
};