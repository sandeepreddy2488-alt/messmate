import { useState, useEffect } from 'react';

/**
 * Single source of truth for MessMate meal configuration, timings, and dishes.
 * Meal timings:
 * - Breakfast: 07:30 AM – 09:30 AM
 * - Lunch:     12:30 PM – 02:30 PM
 * - Snacks:    05:00 PM – 06:00 PM
 * - Dinner:    07:30 PM – 09:30 PM
 */
export const MEAL_THEME_IMAGES = {
  breakfast: '/images/menu/meal_breakfast.jpg',
  lunch: '/images/menu/meal_lunch.jpg',
  snacks: '/images/menu/meal_snacks.jpg',
  dinner: '/images/menu/meal_dinner.jpg',
  Breakfast: '/images/menu/meal_breakfast.jpg',
  Lunch: '/images/menu/meal_lunch.jpg',
  Snacks: '/images/menu/meal_snacks.jpg',
  Dinner: '/images/menu/meal_dinner.jpg',
};

export const MEAL_TIMINGS = [
  {
    id: 'breakfast',
    name: 'Breakfast',
    startTimeStr: '07:30 AM',
    endTimeStr: '09:30 AM',
    timeDisplay: '07:30 AM – 09:30 AM',
    icon: 'fa-mug-saucer',
    iconColor: 'var(--accent)',
    menuItems: 'Steamed Idli, Medu Vada, Sambar, Coconut Chutney, Poha, Tea & Coffee.',
    specialDish: 'Steamed Idli & Medu Vada',
    specialDesc: 'Sambar, Coconut Chutney, Poha, Tea & Coffee.',
    dishIcon: 'fa-mug-saucer',
    themeImage: MEAL_THEME_IMAGES.breakfast
  },
  {
    id: 'lunch',
    name: 'Lunch',
    startTimeStr: '12:30 PM',
    endTimeStr: '02:30 PM',
    timeDisplay: '12:30 PM – 02:30 PM',
    icon: 'fa-bowl-food',
    iconColor: 'var(--primary)',
    menuItems: 'Shahi Paneer Butter Masala, Dal Tadka, Ghee Phulka, Curd & Warm Gulab Jamun.',
    specialDish: 'Shahi Paneer Butter Masala',
    specialDesc: 'Dal Tadka, Soft Phulka, Jeera Rice, Curd, Salad & Warm Gulab Jamun.',
    dishIcon: 'fa-bowl-rice',
    themeImage: MEAL_THEME_IMAGES.lunch
  },
  {
    id: 'snacks',
    name: 'Snacks',
    startTimeStr: '05:00 PM',
    endTimeStr: '06:00 PM',
    timeDisplay: '05:00 PM – 06:00 PM',
    icon: 'fa-cookie-bite',
    iconColor: 'var(--accent)',
    menuItems: 'Crispy Vegetable Samosa with Mint Chutney and Special Cardamom Tea.',
    specialDish: 'Crispy Vegetable Samosa',
    specialDesc: 'Mint Chutney and Special Cardamom Tea.',
    dishIcon: 'fa-cookie-bite',
    themeImage: MEAL_THEME_IMAGES.snacks
  },
  {
    id: 'dinner',
    name: 'Dinner',
    startTimeStr: '07:30 PM',
    endTimeStr: '09:30 PM',
    timeDisplay: '07:30 PM – 09:30 PM',
    icon: 'fa-plate-wheat',
    iconColor: 'var(--primary-dark)',
    menuItems: 'Mixed Veg Korma, Yellow Moong Dal, Steamed Rice, Tawa Roti, and Cut Watermelon.',
    specialDish: 'Mixed Veg Korma',
    specialDesc: 'Yellow Moong Dal, Steamed Rice, Tawa Roti, and Cut Watermelon.',
    dishIcon: 'fa-plate-wheat',
    themeImage: MEAL_THEME_IMAGES.dinner
  }
];

/**
 * Converts a 12-hour formatted time string (e.g., "07:30 AM", "02:30 PM")
 * into total minutes from midnight (0 to 1439).
 */
export function parseTimeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return 0;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();

  if (period === 'PM' && hours < 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

/**
 * Extracts total elapsed minutes from local midnight for a given Date object.
 */
export function getMinutesFromDate(date) {
  return date.getHours() * 60 + date.getMinutes() + date.getSeconds() / 60;
}

/**
 * Calculates current meal statuses from user device local time or given Date.
 * Status rules:
 * - Before start time: "Upcoming"
 * - During serving window: "Active"
 * - After end time: "Served"
 */
export function getMealScheduleState(date = new Date()) {
  const currentMinutes = getMinutesFromDate(date);

  const meals = MEAL_TIMINGS.map(meal => {
    const startMinutes = parseTimeToMinutes(meal.startTimeStr);
    const endMinutes = parseTimeToMinutes(meal.endTimeStr);

    let status = 'Upcoming';
    if (currentMinutes < startMinutes) {
      status = 'Upcoming';
    } else if (currentMinutes < endMinutes) {
      status = 'Active';
    } else {
      status = 'Served';
    }

    return {
      ...meal,
      startMinutes,
      endMinutes,
      status
    };
  });

  const activeMeal = meals.find(m => m.status === 'Active') || null;
  const nextUpcomingMeal = meals.find(m => m.status === 'Upcoming') || null;
  const allServed = meals.every(m => m.status === 'Served');

  return {
    currentMinutes,
    meals,
    activeMeal,
    nextUpcomingMeal,
    allServed
  };
}

/**
 * Helper to test the calculation logic using a simulated time string (e.g. "08:15 AM").
 */
export function getSimulatedMealStatus(timeString) {
  const simulatedMinutes = parseTimeToMinutes(timeString);
  const dummyDate = new Date();
  dummyDate.setHours(Math.floor(simulatedMinutes / 60), simulatedMinutes % 60, 0, 0);
  return getMealScheduleState(dummyDate);
}

/**
 * Custom React Hook that provides the live meal schedule state.
 * Automatically updates when time crosses meal boundaries (07:30 AM, 09:30 AM, 12:30 PM,
 * 02:30 PM, 05:00 PM, 06:00 PM, 07:30 PM, 09:30 PM).
 * - Interval checks every 10 seconds.
 * - Makes ZERO network/API calls.
 * - Only causes a component re-render when a meal's status changes.
 * - Cleans up the timer on unmount.
 */
export function useMealSchedule() {
  const [schedule, setSchedule] = useState(() => getMealScheduleState(new Date()));

  useEffect(() => {
    const checkAndUpdate = () => {
      const nextState = getMealScheduleState(new Date());
      setSchedule(prev => {
        const prevStatuses = prev.meals.map(m => m.status).join(':');
        const nextStatuses = nextState.meals.map(m => m.status).join(':');
        // If statuses haven't changed, return the previous state reference
        // to prevent unnecessary React re-renders.
        if (prevStatuses !== nextStatuses) {
          return nextState;
        }
        return prev;
      });
    };

    // Immediate verification on mount
    checkAndUpdate();

    // Check every 10 seconds for real-time transition across boundaries
    const intervalId = setInterval(checkAndUpdate, 10000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return schedule;
}

/**
 * Formats a Date object to YYYY-MM-DD string using local device calendar.
 */
export function formatDateISO(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns the 7 days of the week strictly in order from Sunday (index 0) to Saturday (index 6)
 * with their actual calendar dates for the active/current week.
 */
export function getCurrentWeekDates(refDate = new Date()) {
  const current = new Date(refDate);
  const dayOfWeek = current.getDay(); // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
  const sunday = new Date(current.getFullYear(), current.getMonth(), current.getDate() - dayOfWeek);
  const todayStr = formatDateISO(new Date());

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const weekDays = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate() + i);
    const dateStr = formatDateISO(d);

    weekDays.push({
      day: dayNames[i],
      date: dateStr,
      isToday: dateStr === todayStr
    });
  }

  return weekDays;
}

/**
 * Computes dynamic meal status for a specific date:
 * - Past dates: "Served"
 * - Future dates: "Upcoming"
 * - Today: Evaluates current local time against meal boundaries.
 */
export function getMealStatusForDate(mealType, targetDateStr, now = new Date()) {
  const todayStr = formatDateISO(now);

  if (targetDateStr < todayStr) {
    return 'Served';
  }
  if (targetDateStr > todayStr) {
    return 'Upcoming';
  }

  // Same day: evaluate against meal start and end times
  const currentMinutes = getMinutesFromDate(now);
  const meal = MEAL_TIMINGS.find(m => m.name.toLowerCase() === mealType.toLowerCase()) || {
    startTimeStr: '07:30 AM',
    endTimeStr: '09:30 AM'
  };
  const startMinutes = parseTimeToMinutes(meal.startTimeStr);
  const endMinutes = parseTimeToMinutes(meal.endTimeStr);

  if (currentMinutes < startMinutes) return 'Upcoming';
  if (currentMinutes < endMinutes) return 'Active';
  return 'Served';
}

export default useMealSchedule;

