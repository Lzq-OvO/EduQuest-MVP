import { useState, useEffect } from "react";
import { X, Check, User, Sparkles, Sliders, Target, Shield } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { UserProfile, UserStats } from "../types";
import { supabase } from "../lib/supabase";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  userStats: UserStats;
  onUpdateStats: (updater: (prev: UserStats) => UserStats) => void;
}

const AVATAR_PRESETS = ["A", "🧑‍🔬", "🦖", "🧠", "🦊", "🚀", "🎓", "🌟", "👾", "🐼"];

const COLOR_THEMES = [
  { name: "冰蓝", bg: "bg-[#c8e6ff]", text: "text-[#004666]", border: "border-[#006590]", ring: "ring-[#006590]" },
  { name: "多邻绿", bg: "bg-[#d7ffb8]", text: "text-[#2b6c00]", border: "border-[#58cc02]", ring: "ring-[#58cc02]" },
  { name: "日落橘", bg: "bg-[#ffe0b2]", text: "text-[#e65100]", border: "border-[#ff9c27]", ring: "ring-[#ff9c27]" },
  { name: "丁香紫", bg: "bg-[#f3e5f5]", text: "text-[#4a148c]", border: "border-[#af52de]", ring: "ring-[#af52de]" },
  { name: "樱花粉", bg: "bg-[#fce4ec]", text: "text-[#880e4f]", border: "border-[#ff2d55]", ring: "ring-[#ff2d55]" },
  { name: "香蕉黄", bg: "bg-[#fff9c4]", text: "text-[#fbc02d]", border: "border-[#ffcc00]", ring: "ring-[#ffcc00]" },
];

const ACADEMIC_TITLES = [
  "量子探索者",
  "代数大宗师",
  "物理发明家",
  "科学大侦探",
  "好奇学者",
  "苏格拉底学徒",
  "真理探寻者",
];

export default function SettingsModal({
  isOpen,
  onClose,
  userProfile,
  onUpdateProfile,
  userStats,
  onUpdateStats,
}: SettingsModalProps) {
  const [name, setName] = useState(userProfile.name);
  const [avatarChar, setAvatarChar] = useState(userProfile.avatarChar);
  const [customChar, setCustomChar] = useState("");
  const [themeIndex, setThemeIndex] = useState(0);
  const [academicTitle, setAcademicTitle] = useState(userProfile.academicTitle);
  const [dailyGoalXp, setDailyGoalXp] = useState(userStats.maxXp);

  // Sync state with props on open
  useEffect(() => {
    if (isOpen) {
      setName(userProfile.name);
      setAvatarChar(userProfile.avatarChar);
      setAcademicTitle(userProfile.academicTitle);
      setDailyGoalXp(userStats.maxXp);

      // Find current theme index
      const matchedIdx = COLOR_THEMES.findIndex(
        (t) => t.bg === userProfile.avatarBg && t.text === userProfile.avatarColor
      );
      if (matchedIdx !== -1) {
        setThemeIndex(matchedIdx);
      }
    }
  }, [isOpen, userProfile, userStats]);

  const handleSave = async () => {
    if (!name.trim()) return;

    // Use custom character if filled and valid
    let finalChar = avatarChar;
    if (customChar.trim()) {
      finalChar = customChar.trim().substring(0, 2); // support emoji or max 2 chars
    }

    const selectedTheme = COLOR_THEMES[themeIndex];

    const newProfile = {
      name: name.trim(),
      avatarChar: finalChar,
      avatarBg: selectedTheme.bg,
      avatarColor: selectedTheme.text,
      academicTitle: academicTitle,
    };

    onUpdateProfile(newProfile);

    onUpdateStats((prev) => {
      const nextStats = { ...prev, maxXp: dailyGoalXp };
      return nextStats;
    });

    // Background persist to Supabase
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').update({
          name: newProfile.name,
          avatar_char: newProfile.avatarChar,
          avatar_bg: newProfile.avatarBg,
          avatar_color: newProfile.avatarColor,
          academic_title: newProfile.academicTitle,
          max_xp: dailyGoalXp
        }).eq('id', user.id);
      }
    } catch (e) {
      console.error("Failed to persist settings:", e);
    }

    onClose();
  };

  const currentTheme = COLOR_THEMES[themeIndex];

  return (
    <AnimatePresence>
      {isOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          className="bg-white w-full max-w-lg rounded-[28px] border-4 border-[#d8dadd] shadow-[0_8px_0_0_#d8dadd] overflow-hidden max-h-[90vh] flex flex-col font-sans"
        >
          {/* Header */}
          <div className="bg-[#58cc02] text-white p-5 flex items-center justify-between border-b-4 border-[#2b6c00] shrink-0 select-none">
            <div className="flex items-center gap-2.5">
              <Sliders className="w-5 h-5 stroke-[2.5px]" />
              <h3 className="font-title text-lg font-black tracking-wide">学者资料与偏好设置</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-[#6ee026] rounded-full text-white transition-colors"
            >
              <X className="w-5 h-5 stroke-[2.5px]" />
            </button>
          </div>

          {/* Scrollable Content Body */}
          <div className="p-6 overflow-y-auto space-y-6 flex-grow">
            {/* Live Profile Preview */}
            <div className="bg-[#f7f9fc] p-5 rounded-2xl border-2 border-[#d8dadd] border-b-4 flex items-center gap-4 select-none">
              <div className={`w-16 h-16 rounded-full ${currentTheme.bg} border-2 border-[#d8dadd] flex items-center justify-center font-title text-3xl ${currentTheme.text} font-black shadow-inner`}>
                {customChar.trim() ? customChar.trim().substring(0, 2) : avatarChar}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-title text-base font-black text-[#191c1e]">{name || "未命名学者"}</span>
                  <span className="bg-[#ffdcbf] text-[#2d1600] text-[9px] font-black px-2 py-0.5 rounded-full border border-white">
                    Lv.{userStats.level}
                  </span>
                </div>
                <p className="font-title text-xs font-bold text-[#006590] uppercase tracking-wide">
                  {academicTitle}
                </p>
                <p className="text-[10px] text-[#3f4a36] font-semibold">
                  每日目标: {dailyGoalXp} 经验值 (当前: {userStats.xp} XP)
                </p>
              </div>
            </div>

            {/* Field 1: Name */}
            <div className="space-y-2">
              <label className="font-title text-xs font-extrabold text-[#3f4a36] uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#58cc02]" /> 学者名字
              </label>
              <input
                type="text"
                maxLength={16}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-chunky w-full py-3 px-4 font-bold text-sm text-[#191c1e] placeholder:text-[#3f4a36]/30 shadow-sm"
                placeholder="输入你的学者称呼..."
              />
            </div>

            {/* Field 2: Avatar Preset Selector */}
            <div className="space-y-2">
              <label className="font-title text-xs font-extrabold text-[#3f4a36] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#ff9c27]" /> 选择头像文字/Emoji
              </label>
              <div className="grid grid-cols-5 gap-2">
                {AVATAR_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setAvatarChar(preset);
                      setCustomChar("");
                    }}
                    className={`p-2.5 rounded-xl border-2 font-title font-black text-lg transition-all flex items-center justify-center ${
                      avatarChar === preset && !customChar
                        ? "bg-[#c8e6ff] border-[#006590] scale-105"
                        : "bg-white border-[#d8dadd] hover:bg-[#f2f4f7]"
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
              
              {/* Or input custom letter/emoji */}
              <div className="pt-1">
                <input
                  type="text"
                  maxLength={2}
                  value={customChar}
                  onChange={(e) => {
                    setCustomChar(e.target.value);
                  }}
                  className="input-chunky w-full py-2 px-3 text-xs font-bold text-[#191c1e] shadow-sm"
                  placeholder="✍️ 或者在此输入自定义字符/表情 (最多2字)"
                />
              </div>
            </div>

            {/* Field 3: Theme Color select */}
            <div className="space-y-2">
              <label className="font-title text-xs font-extrabold text-[#3f4a36] uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#2fb8ff]" /> 头像卡片配色
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {COLOR_THEMES.map((theme, idx) => (
                  <button
                    key={theme.name}
                    type="button"
                    onClick={() => setThemeIndex(idx)}
                    className={`p-2 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                      themeIndex === idx
                        ? `ring-2 ${theme.ring} border-transparent scale-105`
                        : "bg-white border-[#d8dadd] hover:bg-[#f2f4f7]"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full ${theme.bg} border border-[#d8dadd] flex items-center justify-center font-bold text-xs ${theme.text}`}>
                      {avatarChar}
                    </div>
                    <span className="text-[10px] font-bold text-[#3f4a36]">{theme.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Field 4: Academic Title Select */}
            <div className="space-y-2">
              <label className="font-title text-xs font-extrabold text-[#3f4a36] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#af52de]" /> 获得勋爵称号
              </label>
              <select
                value={academicTitle}
                onChange={(e) => setAcademicTitle(e.target.value)}
                className="w-full appearance-none bg-white p-3 pr-8 rounded-xl border-2 border-[#d8dadd] hover:bg-[#eceef1] font-title font-bold text-xs text-[#006590] focus:outline-none cursor-pointer transition-colors shadow-[0_3px_0_0_#d8dadd] active:translate-y-0.5"
              >
                {ACADEMIC_TITLES.map((title) => (
                  <option key={title} value={title}>
                    🏆 {title}
                  </option>
                ))}
              </select>
            </div>

            {/* Field 5: Daily Goal XP Select */}
            <div className="space-y-2">
              <label className="font-title text-xs font-extrabold text-[#3f4a36] uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-[#ff9c27]" /> 每日思考经验值目标
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[50, 100, 150, 200].map((xpGoal) => (
                  <button
                    key={xpGoal}
                    type="button"
                    onClick={() => setDailyGoalXp(xpGoal)}
                    className={`p-2.5 rounded-xl border-2 font-title font-black text-xs transition-all flex flex-col items-center justify-center gap-1 ${
                      dailyGoalXp === xpGoal
                        ? "bg-[#fff0e0] border-[#ff9c27] scale-105"
                        : "bg-white border-[#d8dadd] hover:bg-[#f2f4f7]"
                    }`}
                  >
                    <span className="text-sm">{xpGoal}</span>
                    <span className="text-[9px] font-bold text-[#3f4a36]/60">XP/日</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="p-5 border-t-2 border-[#e0e3e6] bg-white flex gap-3 shrink-0">
            <button
              onClick={onClose}
              className="btn-chunky flex-1 py-3 px-4 rounded-xl border-2 border-[#d8dadd] border-b-4 hover:bg-[#f2f4f7] font-title font-bold text-xs text-[#3f4a36]"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={!name.trim()}
              className="btn-chunky flex-1 py-3 px-4 rounded-xl bg-[#58cc02] text-white border-b-4 border-[#2b6c00] hover:bg-[#6ee026] font-title font-extrabold text-xs flex items-center justify-center gap-1"
            >
              <Check className="w-4 h-4 stroke-[3px]" />
              <span>保存修改</span>
            </button>
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
}
