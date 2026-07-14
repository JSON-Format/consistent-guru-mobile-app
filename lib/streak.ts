// 🔥 DATE FORMAT
export const getLocalDate = (date = new Date()) => {
  return date.toLocaleDateString("en-CA"); // YYYY-MM-DD
};

export const getToday = () => getLocalDate();

// 🔥 MISS COUNT
export const getMissCount = (completedDates: string[]) => {
  const set = new Set(completedDates);

  let miss = 0;

  for (let i = 0; i < 365; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = getLocalDate(d);

    if (!set.has(dateStr)) {
      miss++;
    } else {
      break;
    }
  }

  return miss;
};

// 🔥 ADVANCED DECAY (SAME LOGIC)
export const applyAdvancedDecay = (
  prevStreak: number,
  missCount: number,
  currentStreak: number
) => {
  // MASTER CASE
  if (prevStreak >= 7 && prevStreak < 21) {
    return 1 + (currentStreak - 1);
  }

  let base = 0;

  if (prevStreak >= 100) base = 50;
  else if (prevStreak >= 50) base = 21;
  else if (prevStreak >= 21) base = 7;
  else base = 1;

  // MULTI MISS
  if (missCount >= 2) {
    if (base === 50) base = 21;
    else if (base === 21) base = 7;
    else if (base === 7) base = 1;
  }

  // HARD RESET PREVENT
  if (missCount >= 3) {
    return 1 + (currentStreak - 1);
  }

  return Math.max(1, base + (currentStreak - 1));
};

// 🔥 MAIN STREAK FUNCTION
export const getSmartStreak = (activity: any) => {
  const completedDates = activity.habit_logs
    .filter((l: any) => l.is_complete)
    .map((l: any) => l.date);

  const completedSet = new Set(completedDates);

  const getDate = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return getLocalDate(d);
  };

  // CURRENT STREAK
  // let streak = 0;
  // let i = 0;
  let streak = 0;

// 🔥 today complete illa na skip pannum
let i = completedSet.has(getDate(0)) ? 0 : 1;

  while (i < 365) {
    const date = getDate(i);

    if (completedSet.has(date)) {
      streak++;
      i++;
    } else break;
  }

  // PREVIOUS STREAK
  let prevStreak = 0;
  let j = i + 1;

  while (j < 365) {
    const date = getDate(j);

    if (completedSet.has(date)) {
      prevStreak++;
      j++;
    } else break;
  }

  // MISS COUNT
  let missCount = 0;
  let k = 0;

  while (k < 365) {
    const date = getDate(k);

    if (!completedSet.has(date)) {
      missCount++;
      k++;
    } else break;
  }

  // if (streak === 0) return 0;
  // 🔥 skip today if not completed
// if (streak === 0) {
//   let i = 1; // 👈 start from yesterday

//   while (i < 365) {
//     const date = getDate(i);

//     if (completedSet.has(date)) {
//       streak++;
//       i++;
//     } else break;
//   }

//   return streak;
// }

  return applyAdvancedDecay(prevStreak, missCount, streak);
};