import { useState, useEffect } from "react";
import { Compass, BookOpen, BarChart3, GraduationCap, LayoutGrid, Award, HelpCircle } from "lucide-react";
import Login from "./components/Login";
import Sidebar from "./components/Sidebar";
import StudyHall from "./components/StudyHall";
import ErrorBook from "./components/ErrorBook";
import Achievements from "./components/Achievements";
import SettingsModal from "./components/SettingsModal";
import HelpModal from "./components/HelpModal";
import { WrongQuestion, Badge, MapNode, UserStats, UserProfile } from "./types";
import { supabase } from "./lib/supabase";

export default function App() {
  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // User Profile State
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "加载中...",
    avatarChar: "?",
    avatarBg: "bg-[#e0e3e6]",
    avatarColor: "text-white",
    academicTitle: "...",
  });

  // Settings & Help Modal states
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  
  // View Routing State
  const [activeView, setActiveView] = useState<"study" | "errors" | "achievements">("study");
  
  // Custom Settings States
  const [currentSubject, setCurrentSubject] = useState("语文");
  const [tutorStyle, setTutorStyle] = useState<"Socrates" | "Analogy" | "Standard">("Socrates");

  // Playful gamified stats
  const [userStats, setUserStats] = useState<UserStats>({
    level: 1,
    xp: 0,
    maxXp: 100,
    learningTimeMinutes: 0,
    deepThinkingMinutes: 0,
    streakCount: 0,
  });

  // Wrong questions
  const [wrongQuestions, setWrongQuestions] = useState<WrongQuestion[]>([]);

  // Loading / error state for data fetch
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  // Fetch initial data on login
  useEffect(() => {
    if (isLoggedIn) {
      async function fetchData() {
        setDataLoading(true);
        setDataError(null);
        try {
          const { data: profile, error: profileErr } = await supabase.from('profiles').select('*').single();
          if (profileErr) {
            console.error('Profile fetch error:', profileErr.message);
            setDataError(`个人资料加载失败: ${profileErr.message}`);
          } else if (profile) {
            setUserStats({
              level: profile.level,
              xp: profile.xp,
              maxXp: profile.max_xp,
              learningTimeMinutes: profile.learning_time_minutes,
              deepThinkingMinutes: profile.deep_thinking_minutes,
              streakCount: profile.streak_count,
            });
            setUserProfile({
              name: profile.name,
              avatarChar: profile.avatar_char,
              avatarBg: profile.avatar_bg,
              avatarColor: profile.avatar_color,
              academicTitle: profile.academic_title,
            });
          }

          const { data: errors, error: errorsErr } = await supabase.from('profound_errors').select('*');
          if (errorsErr) {
            console.error('Errors fetch error:', errorsErr.message);
          } else if (errors) {
            setWrongQuestions(errors.map((e: any) => ({
              id: e.id,
              subject: e.subject,
              date: new Date(e.created_at).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' }),
              title: e.title,
              description: e.description,
              image: e.image_url || undefined,
              difficulty: e.difficulty,
              status: e.status,
              aiTip: e.ai_tip,
            })));
          }
        } catch (err) {
          console.error('Data fetch error:', err);
          setDataError('数据加载失败，请刷新页面重试。');
        } finally {
          setDataLoading(false);
        }
      }
      fetchData();
    }
  }, [isLoggedIn]);

  // Achievements Badges
  const [badges, setBadges] = useState<Badge[]>([
    {
      id: "b-1",
      name: "学霸启航",
      description: "成功开启第一次 Socratic 引导式思考和学习物理之旅。",
      icon: "rocket",
      unlocked: true,
      color: "bg-green-100 border-green-300 text-green-700",
      iconChar: "🚀",
    },
    {
      id: "b-2",
      name: "10连击大师",
      description: "在量子物理主题上连对/深度思考对话完成 10 次。",
      icon: "zap",
      unlocked: true,
      color: "bg-blue-100 border-blue-300 text-blue-700",
      iconChar: "⚡",
    },
    {
      id: "b-3",
      name: "灵光一闪",
      description: "在 AI 导师提示下，自主领悟多项式因式分解的核心逻辑并解开谜题。",
      icon: "lightbulb",
      unlocked: true,
      color: "bg-orange-100 border-orange-300 text-orange-700",
      iconChar: "💡",
    },
    {
      id: "b-4",
      name: "爱因斯坦传人",
      description: "在量子探索航线上，完全掌握质能转换方程（E = mc²）推导和含义。",
      icon: "graduation-cap",
      unlocked: false,
      color: "bg-purple-100 border-purple-300 text-purple-700",
      iconChar: "🎓",
    },
    {
      id: "b-5",
      name: "百日真金",
      description: "连续完成每日目标累计 100 天，并解锁了全部航线宝箱奖励。",
      icon: "trophy",
      unlocked: false,
      color: "bg-amber-100 border-amber-300 text-amber-700",
      iconChar: "💯",
    },
  ]);

  const [mapNodes] = useState<MapNode[]>([
    { id: "n-1", title: "基础扎实", status: "completed", x: 10, y: 35 },
    { id: "n-2", title: "量子探索", status: "locked", x: 80, y: 35 },
  ]);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  // Dynamically render active child component inside main panel
  const renderActiveView = () => {
    switch (activeView) {
      case "study":
        return (
          <StudyHall
            currentSubject={currentSubject}
            onSubjectChange={(subj) => {
              setCurrentSubject(subj);
              // Focus study view when redirecting from warning link
              setActiveView("study");
            }}
            tutorStyle={tutorStyle}
            userStats={userStats}
            onUpdateStats={setUserStats}
            userProfile={userProfile}
          />
        );
      case "errors":
        return (
          <ErrorBook
            wrongQuestions={wrongQuestions}
            onUpdateQuestions={(updated) => {
              setWrongQuestions(updated);
              // Unlock badge "百日真金" or another badge if they resolve errors!
              if (updated.filter((q) => q.status === "pending").length === 0) {
                setBadges((prev) =>
                  prev.map((b) => (b.id === "b-5" ? { ...b, unlocked: true } : b))
                );
              }
            }}
            userStats={userStats}
            onUpdateStats={setUserStats}
          />
        );
      case "achievements":
        return (
          <Achievements
            badges={badges}
            mapNodes={mapNodes}
            userStats={userStats}
          />
        );
      default:
        return (
          <StudyHall
            currentSubject={currentSubject}
            onSubjectChange={setCurrentSubject}
            tutorStyle={tutorStyle}
            userStats={userStats}
            onUpdateStats={setUserStats}
            userProfile={userProfile}
          />
        );
    }
  };

  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="bg-[#f7f9fc] text-[#191c1e] h-screen overflow-hidden font-sans antialiased flex flex-col">
      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 z-40 bg-white border-b-4 border-[#d8dadd] px-5 py-4 flex items-center justify-between shadow-sm select-none">
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity text-left cursor-pointer"
        >
          <div className={`w-10 h-10 rounded-full ${userProfile.avatarBg} border-2 border-[#d8dadd] flex items-center justify-center font-title text-base ${userProfile.avatarColor} font-black shadow-inner`}>
            {userProfile.avatarChar}
          </div>
          <div>
            <span className="font-title text-sm font-black text-[#2b6c00] block leading-tight">
              {userProfile.name}
            </span>
            <span className="text-[10px] font-bold text-[#3f4a36] uppercase tracking-wider block">
              等级 {userStats.level} · {userProfile.academicTitle}
            </span>
          </div>
        </button>
        
        {/* Simple Utilities for mobile */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsHelpOpen(true)}
            className="bg-sky-50 text-sky-600 font-title text-xs font-bold px-3 py-1.5 rounded-lg border border-sky-200 flex items-center gap-1 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>帮助</span>
          </button>
          
          <button
            onClick={handleLogout}
            className="bg-red-50 text-red-600 font-title text-xs font-bold px-3 py-1.5 rounded-lg border border-red-200"
          >
            退出
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex h-full w-full max-w-[1400px] mx-auto md:px-6 relative overflow-hidden">
        
        {/* Left Sidebar navigation for desktop */}
        <Sidebar
          activeView={activeView}
          onViewChange={setActiveView}
          tutorStyle={tutorStyle}
          onTutorStyleChange={setTutorStyle}
          onLogout={handleLogout}
          userLevel={userStats.level}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenHelp={() => setIsHelpOpen(true)}
        />

        {/* Render child view */}
        {renderActiveView()}
      </div>

      {/* Mobile Bottom Tab-Bar Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t-2 border-[#d8dadd] flex justify-around p-2 pb-safe z-40 shadow-lg">
        <button
          onClick={() => setActiveView("study")}
          className={`flex flex-col items-center gap-1 p-2 flex-1 transition-colors ${
            activeView === "study" ? "text-[#2b6c00]" : "text-[#3f4a36]/60 hover:text-[#2b6c00]"
          }`}
        >
          <div
            className={`px-5 py-1 rounded-full transition-colors ${
              activeView === "study" ? "bg-[#58cc02]/25 text-[#1e5000]" : "hover:bg-[#eceef1]"
            }`}
          >
            <LayoutGrid className="w-5 h-5 stroke-[2.5px]" />
          </div>
          <span className="text-[10px] font-title font-bold">学习大厅</span>
        </button>

        <button
          onClick={() => setActiveView("errors")}
          className={`flex flex-col items-center gap-1 p-2 flex-1 transition-colors ${
            activeView === "errors" ? "text-[#006590]" : "text-[#3f4a36]/60 hover:text-[#006590]"
          }`}
        >
          <div
            className={`px-5 py-1 rounded-full transition-colors ${
              activeView === "errors" ? "bg-[#2fb8ff]/20 text-[#004666]" : "hover:bg-[#eceef1]"
            }`}
          >
            <BookOpen className="w-5 h-5 stroke-[2.5px]" />
          </div>
          <span className="text-[10px] font-title font-bold">深度错题</span>
        </button>

        <button
          onClick={() => setActiveView("achievements")}
          className={`flex flex-col items-center gap-1 p-2 flex-1 transition-colors ${
            activeView === "achievements" ? "text-[#ff9c27]" : "text-[#3f4a36]/60 hover:text-[#ff9c27]"
          }`}
        >
          <div
            className={`px-5 py-1 rounded-full transition-colors ${
              activeView === "achievements" ? "bg-[#ff9c27]/20 text-[#683a00]" : "hover:bg-[#eceef1]"
            }`}
          >
            <Award className="w-5 h-5 stroke-[2.5px]" />
          </div>
          <span className="text-[10px] font-title font-bold">我的成就</span>
        </button>
      </nav>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        userProfile={userProfile}
        onUpdateProfile={setUserProfile}
        userStats={userStats}
        onUpdateStats={setUserStats}
      />

      {/* Help Modal */}
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
}
