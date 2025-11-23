import React from "react";
import { FaClock, FaUtensils, FaCheckCircle, FaTimesCircle, FaExclamationCircle } from "react-icons/fa";

export default function MealCard({ meal }) {
  const isServed = meal.srvSts === "C";

  // Get current time
  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    return hours * 60 + minutes;
  };

  // Check if meal time has passed
  const isMealTimePassed = (mealTiming) => {
    if (!mealTiming) return false;
    
    const timeMatch = mealTiming.match(/(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!timeMatch) return false;
    
    let hours = parseInt(timeMatch[1]);
    const minutes = parseInt(timeMatch[2]);
    const period = timeMatch[3].toUpperCase();
    
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

  // Check if meal is from today
  const isMealToday = () => {
    const dayMatch = meal.msCde.match(/\(([^)]+)\)/);
    const mealDay = dayMatch ? dayMatch[1] : "";
    return mealDay === getCurrentDay();
  };

  // Check if meal day is in the past
  const isMealDayPast = () => {
    const dayMatch = meal.msCde.match(/\(([^)]+)\)/);
    const mealDay = dayMatch ? dayMatch[1] : "";
    const dayOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const mealDayIndex = dayOrder.indexOf(mealDay);
    const currentDayIndex = dayOrder.indexOf(getCurrentDay());
    return mealDayIndex < currentDayIndex;
  };

  // Determine meal status
  const getMealStatus = () => {
    if (isServed) return "served";
    if (isMealDayPast()) return "missed";
    if (isMealToday() && isMealTimePassed(meal.mealTm)) return "missed";
    return "pending";
  };

  const mealStatus = getMealStatus();

  return (
    <div className={`bg-white rounded-2xl shadow-lg border-2 p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
      mealStatus === "served" ? "border-green-200" : 
      mealStatus === "missed" ? "border-red-200" : 
      "border-blue-200"
    }`}>
      {/* Meal Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b-2 border-gray-100">
        <div className="flex items-center gap-2">
          <FaUtensils className="text-blue-600 text-xl" />
          <h2 className="text-2xl font-bold text-gray-800">{meal.msCde}</h2>
        </div>
        {/* Status Badge */}
        {mealStatus === "served" ? (
          <div className="flex items-center gap-1 bg-green-100 px-3 py-1 rounded-full">
            <FaCheckCircle className="text-green-600 text-sm" />
            <span className="text-green-700 text-xs font-semibold">Served</span>
          </div>
        ) : mealStatus === "missed" ? (
          <div className="flex items-center gap-1 bg-red-100 px-3 py-1 rounded-full">
            <FaTimesCircle className="text-red-600 text-sm" />
            <span className="text-red-700 text-xs font-semibold">Missed</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 bg-blue-100 px-3 py-1 rounded-full">
            <FaExclamationCircle className="text-blue-600 text-sm" />
            <span className="text-blue-700 text-xs font-semibold">Pending</span>
          </div>
        )}
      </div>

      {/* Timing */}
      <div className={`flex items-center gap-2 mb-4 px-3 py-2 rounded-lg ${
        mealStatus === "served" ? "bg-green-50" :
        mealStatus === "missed" ? "bg-red-50" :
        "bg-blue-50"
      }`}>
        <FaClock className={`text-sm ${
          mealStatus === "served" ? "text-green-600" :
          mealStatus === "missed" ? "text-red-600" :
          "text-blue-600"
        }`} />
        <p className={`text-sm font-medium ${
          mealStatus === "served" ? "text-green-700" :
          mealStatus === "missed" ? "text-red-700" :
          "text-blue-700"
        }`}>{meal.mealTm}</p>
      </div>

      {/* Served Time */}
      {isServed && meal.srvDte && (
        <div className="mb-4 bg-green-50 px-3 py-2 rounded-lg">
          <p className="text-green-700 text-sm">
            <span className="font-semibold">Availed at:</span> {meal.srvDte}
          </p>
        </div>
      )}

      {/* Missed Message */}
      {mealStatus === "missed" && !isServed && (
        <div className="mb-4 bg-red-50 px-3 py-2 rounded-lg">
          <p className="text-red-700 text-sm font-semibold">
            Meal time has passed
          </p>
        </div>
      )}

      {/* Menu Items */}
      <ul className="space-y-2">
        {meal.msNme.split("\n").map((line, idx) =>
          line.trim() ? (
            <li key={idx} className="flex items-start gap-2 text-gray-700">
              <span className="text-blue-600 mt-1 font-bold">•</span>
              <span className="flex-1">{line}</span>
            </li>
          ) : null
        )}
      </ul>
    </div>
  );
}