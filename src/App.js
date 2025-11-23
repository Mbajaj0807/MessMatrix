import React, { useState, useEffect } from "react";
import axios from "axios";
import Login from "./components/Login";
import MealCard from "./components/MealCard";
import MealProgressCard from "./components/MealProgressCard";
import { FaGithub, FaUtensils, FaSignOutAlt, FaCalendarWeek } from "react-icons/fa";

export default function App() {
  // Get current day automatically
  const getCurrentDay = () => {
    const dayMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date().getDay();
    return dayMap[today];
  };

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authData, setAuthData] = useState(null);
  const [weekMeals, setWeekMeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [selectedDay, setSelectedDay] = useState(getCurrentDay()); // Auto-select current day

  // Check for existing auth on mount
  useEffect(() => {
    const storedAuth = localStorage.getItem("camuAuth");
    const storedEmail = localStorage.getItem("userEmail");
    if (storedAuth) {
      setAuthData(JSON.parse(storedAuth));
      setUserEmail(storedEmail || "");
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch week's menu when authenticated
  useEffect(() => {
    if (isAuthenticated && authData) {
      fetchWeekMenu();
    }
  }, [isAuthenticated, authData]);

  const handleLoginSuccess = (data) => {
    setAuthData(data);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("camuAuth");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("sessionCookie");
    localStorage.removeItem("stuId");
    localStorage.removeItem("instId");
    localStorage.removeItem("isAuthenticated"); // Clear persistent login flag
    setIsAuthenticated(false);
    setAuthData(null);
    setWeekMeals([]);
    setUserEmail("");
  };

const fetchWeekMenu = async () => {
  try {
    setLoading(true);

    // Replace these with your actual values or retrieve from storage/context
    const cookie = localStorage.getItem("sessionCookie") || "663474b11dd0e9412a1f793f";
    const stuId = localStorage.getItem("stuId") || "";
    const instId = localStorage.getItem("instId") || "";

    if (!cookie || !stuId || !instId) {
      throw new Error("Missing authentication data");
    }

    // Days of the week
    const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
    const allMeals = [];

    for (const day of days) {
      try {
        const res = await axios.post(
          "https://mycamu-mess-menu-backend.vercel.app/api/menuv2",
          { cookie, stuId, instId, day },
          { headers: { "Content-Type": "application/json" } }
        );

        if (res.data && Array.isArray(res.data)) {
          allMeals.push(...res.data);
        }
      } catch (err) {
        console.error(`Error fetching menu for ${day}:`, err);
      }
    }

    setWeekMeals(allMeals);
  } catch (err) {
    console.error("Error fetching week menu:", err);
  } finally {
    setLoading(false);
  }
};


  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Group meals by day
  const groupedMeals = weekMeals.reduce((acc, meal) => {
    const day = meal.msCde.match(/\(([^)]+)\)/)?.[1] || "Unknown";
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(meal);
    return acc;
  }, {});

  // const dayOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const dayButtons = [
    { key: "Mon", label: "Monday" },
    { key: "Tue", label: "Tuesday" },
    { key: "Wed", label: "Wednesday" },
    { key: "Thu", label: "Thursday" },
    { key: "Fri", label: "Friday" },
    { key: "Sat", label: "Saturday" },
    { key: "Sun", label: "Sunday" },
  ];

  // Display only selected day
  const displayDays = [selectedDay];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <FaUtensils className="text-2xl text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  College Mess Menu
                </h1>
                <p className="text-blue-100 text-sm">{userEmail}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all duration-300"
            >
              <FaSignOutAlt />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Loading State */}
        {loading && (
          <div className="text-center mb-8">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600 italic">Loading weekly menu...</p>
          </div>
        )}

        {!loading && weekMeals.length > 0 && (
          <>
            {/* Progress Card */}
            <MealProgressCard weekMeals={weekMeals} />

            {/* Day Selector Bubbles */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <FaCalendarWeek className="text-2xl text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-800">Select Day</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                {dayButtons.map((dayBtn) => (
                  <button
                    key={dayBtn.key}
                    onClick={() => setSelectedDay(dayBtn.key)}
                    className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${
                      selectedDay === dayBtn.key
                        ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg scale-105"
                        : "bg-white text-blue-600 border-2 border-blue-200 hover:border-blue-400"
                    }`}
                  >
                    {dayBtn.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Meals by Day */}
            {displayDays.map((day) => {
              const dayMeals = groupedMeals[day];
              if (!dayMeals || dayMeals.length === 0) return null;

              return (
                <div key={day} className="mb-12">
                  {/* Day Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl px-6 py-4 mb-6 shadow-lg">
                    <h3 className="text-2xl font-bold text-white">
                      {day === "Mon" ? "Monday" : 
                       day === "Tue" ? "Tuesday" :
                       day === "Wed" ? "Wednesday" :
                       day === "Thu" ? "Thursday" :
                       day === "Fri" ? "Friday" :
                       day === "Sat" ? "Saturday" : "Sunday"}
                    </h3>
                  </div>

                  {/* Meal Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {dayMeals.map((meal, idx) => (
                      <MealCard key={idx} meal={meal} />
                    ))}
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* Empty State */}
        {!loading && weekMeals.length === 0 && (
          <div className="text-center py-16">
            <FaUtensils className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-xl">No menu data available</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t-2 border-blue-100 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-6">
            <a
              href="https://github.com/Mbajaj0807/mycamu-mess-menu-backend"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors bg-blue-50 px-4 py-2 rounded-lg border-2 border-blue-100 hover:border-blue-300"
            >
              <FaGithub size={20} />
              Backend Repository
            </a>
            <a
              href="https://github.com/Mbajaj0807/mycamu-mess-menu-frontend"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors bg-blue-50 px-4 py-2 rounded-lg border-2 border-blue-100 hover:border-blue-300"
            >
              <FaGithub size={20} />
              Frontend Repository
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}