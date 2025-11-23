import React from "react";
import { FaCheckCircle, FaTimesCircle, FaClock } from "react-icons/fa";

export default function MealProgressCard({ weekMeals }) {
  // Get current time
  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    return hours * 60 + minutes; // Convert to minutes for easier comparison
  };

  // Check if meal time has passed
  const isMealTimePassed = (mealTiming) => {
    if (!mealTiming) return false;
    
    // Extract end time from meal timing string (e.g., "Breakfast 07:30 AM - 9:30 AM")
    const timeMatch = mealTiming.match(/(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!timeMatch) return false;
    
    let hours = parseInt(timeMatch[1]);
    const minutes = parseInt(timeMatch[2]);
    const period = timeMatch[3].toUpperCase();
    
    // Convert to 24-hour format
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    
    const mealEndTime = hours * 60 + minutes;
    const currentTime = getCurrentTime();
    
    return currentTime > mealEndTime;
  };

  // Get current day
  const getCurrentDay = () => {
    const dayMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date().getDay();
    return dayMap[today];
  };

  const currentDay = getCurrentDay();
  const totalMeals = weekMeals.length;
  
  // Count served meals (srvSts === "C")
  const servedMeals = weekMeals.filter(meal => meal.srvSts === "C").length;
  
  // Count missed meals (pending but time has passed and it's today or past)
  const missedMeals = weekMeals.filter(meal => {
    if (meal.srvSts === "C") return false; // Already served
    
    // Extract day from meal code
    const dayMatch = meal.msCde.match(/\(([^)]+)\)/);
    const mealDay = dayMatch ? dayMatch[1] : "";
    
    // Check if meal is today or in the past
    const dayOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const mealDayIndex = dayOrder.indexOf(mealDay);
    const currentDayIndex = dayOrder.indexOf(currentDay);
    
    // If meal day is before today, it's missed
    if (mealDayIndex < currentDayIndex) return true;
    
    // If meal day is today, check if time has passed
    if (mealDayIndex === currentDayIndex) {
      return isMealTimePassed(meal.mealTm);
    }
    
    return false;
  }).length;
  
  // Remaining meals are total - served - missed
  const remainingMeals = totalMeals - servedMeals - missedMeals;
  
  const percentage = totalMeals > 0 ? Math.round((servedMeals / totalMeals) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border-2 border-blue-100">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Progress Circle */}
        <div className="relative flex items-center justify-center">
          <svg className="transform -rotate-90 w-40 h-40">
            {/* Background circle */}
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="#E0E7FF"
              strokeWidth="12"
              fill="none"
            />
            {/* Progress circle */}
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="url(#blueGradient)"
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 70}`}
              strokeDashoffset={`${2 * Math.PI * 70 * (1 - percentage / 100)}`}
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#1D4ED8" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-blue-600">{percentage}%</span>
            <span className="text-sm text-gray-500">Availed</span>
          </div>
        </div>

        {/* Stats Info */}
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Weekly Meal Progress</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <FaCheckCircle className="text-green-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Meals Availed</p>
                <p className="text-2xl font-bold text-gray-800">{servedMeals}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <FaTimesCircle className="text-red-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Meals Missed</p>
                <p className="text-2xl font-bold text-gray-800">{missedMeals}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <FaClock className="text-blue-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Remaining Meals</p>
                <p className="text-2xl font-bold text-gray-800">{remainingMeals}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}