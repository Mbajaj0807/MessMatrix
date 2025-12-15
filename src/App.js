import React, { useState, useEffect } from "react";
import axios from "axios";
import Login from "./components/Login";
import MealCard from "./components/MealCard";
import QRCode from "qrcode";
import { FaGithub, FaUtensils, FaSignOutAlt, FaCalendarWeek, FaQrcode } from "react-icons/fa";
// eslint-disable-next-line
import { Analytics } from "@vercel/analytics/react";

export default function App() {
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
  const [selectedDay, setSelectedDay] = useState(getCurrentDay());
  const [username, setUsername] = useState("");

  // QR STATE
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrImage, setQrImage] = useState("");

  // Check for existing login
  useEffect(() => {
    const storedAuth = localStorage.getItem("camuAuth");
    const storedEmail = localStorage.getItem("userEmail");
    const storedName = localStorage.getItem("name");

    if (storedAuth) {
      setAuthData(JSON.parse(storedAuth));
      setUserEmail(storedEmail || "");
      setUsername(storedName || "");
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch weekly menu after login
  useEffect(() => {
    if (isAuthenticated && authData) fetchWeekMenu();
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
    localStorage.removeItem("isAuthenticated");

    setIsAuthenticated(false);
    setAuthData(null);
    setWeekMeals([]);
    setUserEmail("");
    setUsername("");
  };

  // Fetch weekly menu
  const fetchWeekMenu = async () => {
    try {
      setLoading(true);

      const cookie = localStorage.getItem("sessionCookie") || "";
      const stuId = localStorage.getItem("stuId") || "";
      const instId = localStorage.getItem("instId") || "";

      if (!cookie || !stuId || !instId) {
        throw new Error("Missing authentication data");
      }

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
        } catch (error) {
          console.error(`Menu fetch failed for ${day}:`, error);
        }
      }

      setWeekMeals(allMeals);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch QR
  const fetchQrCode = async () => {
    try {
      const cookie = localStorage.getItem("sessionCookie");
      const stuId = localStorage.getItem("stuId");
      const instId = localStorage.getItem("instId");

      if (!cookie || !stuId || !instId) {
        alert("Missing authentication details");
        return;
      }

      const res = await axios.post(
        "https://mycamu-mess-menu-backend.vercel.app/api/generate-qr",
        { cookie, stuId, instId },
        { headers: { "Content-Type": "application/json" } }
      );

      const qrString = res.data?.prQrCd;

      if (!qrString) {
        alert("QR Code not found");
        return;
      }

      const img = await QRCode.toDataURL(qrString);
      setQrImage(img);
      setQrModalOpen(true);
    } catch (err) {
      console.error("QR Fetch Error:", err);
      alert("QR generation failed");
    }
  };

  if (!isAuthenticated) return <Login onLoginSuccess={handleLoginSuccess} />;

  const groupedMeals = weekMeals.reduce((acc, meal) => {
    const day = meal.msCde.match(/\(([^)]+)\)/)?.[1] || {userEmail};
    if (!acc[day]) acc[day] = [];
    acc[day].push(meal);
    return acc;
  }, {});

  const dayButtons = [
    { key: "Mon", label: "Monday" },
    { key: "Tue", label: "Tuesday" },
    { key: "Wed", label: "Wednesday" },
    { key: "Thu", label: "Thursday" },
    { key: "Fri", label: "Friday" },
    { key: "Sat", label: "Saturday" },
    { key: "Sun", label: "Sunday" },
  ];

  const displayDays = [selectedDay];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">

      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <FaUtensils className="text-2xl text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">College Mess Menu</h1>
              <p className="text-blue-100 text-sm">{username}</p>

              {/* SHOW QR BUTTON */}
              <button
                onClick={fetchQrCode}
                className="mt-2 flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-lg text-sm transition-all"
              >
                <FaQrcode />
                Show QR
              </button>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all"
          >
            <FaSignOutAlt />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* QR MODAL */}
      {qrModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm text-center">
            <h2 className="text-xl font-semibold mb-4 text-blue-700">Your Mess QR Code</h2>
            <img src={qrImage} alt="QR Code" className="w-56 mx-auto" />
            <button
              onClick={() => setQrModalOpen(false)}
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading && (
          <div className="text-center mb-8">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600 italic">Loading weekly menu...</p>
          </div>
        )}

        {!loading && weekMeals.length > 0 && (
          <>
            {/* <MealProgressCard weekMeals={weekMeals} /> */}

            {/* Day Selector */}
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
                    className={`px-6 py-3 rounded-full font-semibold transition-all ${
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
              if (!dayMeals) return null;

              return (
                <div key={day} className="mb-12">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl px-6 py-4 mb-6 shadow-lg">
                    <h3 className="text-2xl font-bold text-white">{day}</h3>
                  </div>

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

        {!loading && weekMeals.length === 0 && (
          <div className="text-center py-16">
            <FaUtensils className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-xl">No menu data available</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t-2 border-blue-100 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center gap-6">
          <a
            href="https://github.com/Mbajaj0807/mycamu-mess-menu-backend"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 bg-blue-50 px-4 py-2 rounded-lg border-2 border-blue-100 hover:border-blue-300"
          >
            <FaGithub size={20} />
            Backend Repository
          </a>

          <a
            href="https://github.com/Mbajaj0807/mycamu-mess-menu-frontend"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 bg-blue-50 px-4 py-2 rounded-lg border-2 border-blue-100 hover:border-blue-300"
          >
            <FaGithub size={20} />
            Frontend Repository
          </a>
        </div>
      </footer>
    </div>
  );
}
