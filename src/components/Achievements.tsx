import { useState } from "react";
import { Award, Trophy, Compass, Clock, Check, Lock, Star, ChevronRight, Zap, Target } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Badge, MapNode, UserStats } from "../types";

interface AchievementsProps {
  badges: Badge[];
  mapNodes: MapNode[];
  userStats: UserStats;
}

export default function Achievements({ badges, mapNodes, userStats }: AchievementsProps) {
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  return (
    <div className="flex-1 h-full bg-[#f7f9fc] p-4 md:p-6 overflow-y-auto relative font-sans">
      
      {/* Banner Card */}
      <section className="bg-white rounded-[24px] border-2 border-[#d8dadd] border-b-4 p-6 md:p-8 shadow-[0_4px_0_0_#d8dadd] mb-8 relative overflow-hidden select-none">
        {/* Playful background blobs */}
        <div className="absolute right-0 top-0 w-48 h-full bg-[#ff9c27]/5 rounded-l-full blur-3xl pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 text-center md:text-left">
            <h1 className="font-title text-2xl md:text-3xl font-black text-[#191c1e]">成就殿堂</h1>
            <p className="text-sm text-[#3f4a36] font-semibold leading-relaxed">
              见证你每一次闪耀的进步与突破。
            </p>
          </div>
          
          <div className="shrink-0 w-32 h-24 flex items-center justify-center bg-[#ff9c27]/10 rounded-2xl border-2 border-[#ff9c27] border-b-4">
            <div className="relative">
              <Trophy className="w-12 h-12 text-[#ff9c27] fill-[#ff9c27]/15 animate-pulse" />
              <span className="absolute -top-4 -right-7 text-xl select-none">✨</span>
            </div>
          </div>
        </div>
      </section>

      {/* Rank and stats dual columns */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 select-none">
        {/* Left column: Division badge */}
        <div className="bg-white rounded-[24px] border-2 border-[#d8dadd] border-b-4 p-6 shadow-[0_4px_0_0_#d8dadd] flex flex-col items-center justify-center text-center">
          <div className="relative w-32 h-32 flex items-center justify-center rounded-full bg-[#c8e6ff] border-4 border-[#2fb8ff] shadow-inner mb-4">
            <Award className="w-16 h-16 text-[#006590]" />
            <div className="absolute -top-1 -right-1 bg-[#ffdcbf] text-[#2d1600] text-xs font-black px-2.5 py-1 rounded-full border border-white">
              Lv.{userStats.level}
            </div>
          </div>
          <h3 className="font-title text-xl font-black text-[#191c1e]">Lv.{userStats.level} 探索者</h3>
          <p className="text-xs text-[#006590] font-extrabold uppercase mt-1 tracking-wider">
            当前最高段位
          </p>
        </div>

        {/* Right column: Life time counters */}
        <div className="bg-white rounded-[24px] border-2 border-[#d8dadd] border-b-4 p-6 shadow-[0_4px_0_0_#d8dadd] flex flex-col justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#ff9c27]/10 text-[#ff9c27] rounded-xl shrink-0">
              <Clock className="w-8 h-8 stroke-[2.5px]" />
            </div>
            <div>
              <p className="font-title text-xs font-extrabold text-[#3f4a36] tracking-wider uppercase">
                终身深度思考时长
              </p>
              <p className="font-title text-3xl font-black text-[#1e5000]">
                {Math.floor(userStats.deepThinkingMinutes / 60)} <span className="text-sm font-bold text-[#2b6c00]">小时</span> {userStats.deepThinkingMinutes % 60} <span className="text-sm font-bold text-[#2b6c00]">分钟</span>
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {/* Shimmer progress bar */}
            <div className="h-5 w-full bg-[#e0e3e6] rounded-full overflow-hidden relative border border-gray-200">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#2b6c00] to-[#58cc02] rounded-full progress-bar-shimmer transition-all duration-300"
                style={{ width: `${Math.min(100, Math.round((userStats.xp / (userStats.level * 100)) * 100))}%` }}
              ></div>
            </div>
            <p className="text-[11px] font-bold text-[#3f4a36] text-right">
              距离 Lv.{userStats.level + 1} 还需要 {Math.max(0, userStats.level * 100 - userStats.xp)} XP
            </p>
          </div>
        </div>
      </section>

      {/* Badges gallery */}
      <section className="bg-white rounded-[24px] border-2 border-[#d8dadd] border-b-4 p-6 shadow-[0_4px_0_0_#d8dadd] mb-8 select-none">
        <h3 className="font-title text-sm font-extrabold text-[#3f4a36] uppercase tracking-widest mb-6 pl-1 flex items-center gap-2">
          <Star className="w-4 h-4 text-[#ff9c27] fill-[#ff9c27]" /> 荣誉徽章库
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {badges.map((badge) => (
            <button
              key={badge.id}
              onClick={() => setSelectedBadge(badge)}
              className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center text-center transition-all duration-100 ${
                badge.unlocked
                  ? "bg-[#f3ffeb]/30 border-[#becbb1] hover:bg-[#f3ffeb]/50"
                  : "bg-[#f2f4f7] border-gray-200 opacity-60"
              }`}
            >
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-inner border mb-3 ${
                  badge.unlocked ? badge.color : "bg-gray-300 border-gray-400"
                }`}
              >
                {badge.unlocked ? badge.iconChar : <Lock className="w-5 h-5 text-gray-500 stroke-[2.5]" />}
              </div>
              <h4 className="font-title text-xs font-bold text-[#191c1e] truncate w-full">{badge.name}</h4>
              <p className="text-[10px] text-[#3f4a36] mt-0.5 font-semibold truncate w-full">
                {badge.unlocked ? "已解锁" : "未解锁"}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* Learning Flight Path map */}
      <section className="bg-white rounded-[24px] border-2 border-[#d8dadd] border-b-4 p-6 shadow-[0_4px_0_0_#d8dadd] select-none">
        <h3 className="font-title text-sm font-extrabold text-[#3f4a36] uppercase tracking-widest mb-8 pl-1 flex items-center gap-2">
          <Compass className="w-4 h-4 text-[#006590]" /> 学习航线图
        </h3>

        {/* Custom SVG Curved Roadmap */}
        <div className="relative w-full aspect-[2.2] bg-[#f7f9fc] border-2 border-[#d8dadd] rounded-2xl overflow-hidden p-6">
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            {/* Winding road path */}
            <path
              d="M 100 150 C 300 150, 400 400, 500 400 C 600 400, 700 150, 900 150"
              fill="none"
              stroke="#eceef1"
              strokeWidth="24"
              strokeLinecap="round"
            />
            {/* Unlocked green path line */}
            <path
              d="M 100 150 C 300 150, 400 400, 500 400"
              fill="none"
              stroke="#58cc02"
              strokeWidth="12"
              strokeLinecap="round"
            />
          </svg>

          {/* Node 1: Completed node (基础扎实) */}
          <div className="absolute top-[25%] left-[10%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 z-10">
            <div className="w-10 h-10 rounded-full bg-[#58cc02] border-4 border-white flex items-center justify-center text-white shadow-md">
              <Check className="w-5 h-5 stroke-[3px]" />
            </div>
            <span className="font-title text-xs font-bold text-[#1e5000] bg-white px-2 py-0.5 rounded-lg border border-[#becbb1]">
              基础扎实
            </span>
          </div>

          {/* Path active curve avatar container */}
          <div className="absolute top-[65%] left-[45%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 z-20 animate-float">
            <div className="relative">
              {/* Little cute owl avatar */}
              <img
                alt="AI scholar avatar on path"
                className="w-12 h-12 rounded-full border-2 border-[#006590] shadow-lg select-none bg-white p-1"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuByxIKR0yqnjVSb-6Xkzam2KsoQylyg1y5t1FcMTzZFzL4tlQi_tfm4z9J8hqZFXLOi0wBB9h60rHmktkyfbCzv0NSMYc42rhSVCnj1Wx5Pp9xqkoi7Z2qJYUcyyD3l3RB0G5bT0oXQvuWRfk8yo1W403dC16rFUhg7tkAeSjDdf-Xdd-DxlRzV1HxRpp7QR7xkrXfbOIN6B679v3lLaLjyWLWMexI2gFofvkKEJIddXHzCjOnOCfFlSNEd_uopbwyynVkI8ox0SbE"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-1 -right-1 bg-[#2fb8ff] text-white p-1 rounded-full border border-white">
                <Target className="w-3 h-3 stroke-[2.5px]" />
              </div>
            </div>
          </div>

          {/* Node 2: Upcoming active/locked node (量子探索) */}
          <div className="absolute top-[25%] left-[80%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 z-10">
            <div className="w-10 h-10 rounded-full bg-white border-4 border-[#d8dadd] flex items-center justify-center text-gray-400 shadow-sm">
              <Lock className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="font-title text-xs font-bold text-gray-500 bg-white px-2 py-0.5 rounded-lg border border-gray-200">
              量子探索
            </span>
          </div>
        </div>
      </section>

      {/* Badge info drawer/popup */}
      <AnimatePresence>
        {selectedBadge && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-sm rounded-[24px] border-4 border-[#d8dadd] shadow-[0_8px_0_0_#d8dadd] overflow-hidden p-6 text-center space-y-4"
            >
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-inner border mx-auto ${
                  selectedBadge.unlocked ? selectedBadge.color : "bg-gray-300 border-gray-400"
                }`}
              >
                {selectedBadge.unlocked ? selectedBadge.iconChar : <Lock className="w-8 h-8 text-gray-500" />}
              </div>

              <div className="space-y-1">
                <h3 className="font-title text-lg font-black text-[#191c1e]">{selectedBadge.name}</h3>
                <p className="text-xs text-[#006590] font-extrabold uppercase">
                  {selectedBadge.unlocked ? "已经解锁的荣耀" : "还需继续加油"}
                </p>
              </div>

              <p className="text-sm text-[#3f4a36] leading-relaxed font-semibold">
                {selectedBadge.description}
              </p>

              <button
                onClick={() => setSelectedBadge(null)}
                className="btn-chunky w-full bg-[#58cc02] text-white py-3 rounded-xl border-b-[4px] border-[#2b6c00] hover:bg-[#6ee026] font-title font-extrabold text-sm"
              >
                知道了，关闭
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
