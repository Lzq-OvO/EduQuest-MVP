import { BookOpen, Award, LayoutGrid, HelpCircle, Settings, ChevronDown, Sparkles, LogOut } from "lucide-react";
import { motion } from "motion/react";

interface SidebarProps {
  activeView: "study" | "errors" | "achievements";
  onViewChange: (view: "study" | "errors" | "achievements") => void;
  tutorStyle: "Socrates" | "Analogy" | "Standard";
  onTutorStyleChange: (style: "Socrates" | "Analogy" | "Standard") => void;
  onLogout: () => void;
  userLevel: number;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
}

export default function Sidebar({
  activeView,
  onViewChange,
  tutorStyle,
  onTutorStyleChange,
  onLogout,
  userLevel,
  onOpenSettings,
  onOpenHelp,
}: SidebarProps) {
  const tutorStyleLabels = {
    Socrates: { label: "苏格拉底式导师", icon: "🎓" },
    Analogy: { label: "趣味比喻式导师", icon: "💡" },
    Standard: { label: "标准高效导师", icon: "🤖" },
  };

  return (
    <aside className="hidden md:flex flex-col h-full w-[240px] shrink-0 py-6 pr-6 bg-[#f7f9fc] border-r-4 border-[#d8dadd] mr-6">
      {/* Logo Area */}
      <div className="flex items-center gap-3 mb-8 px-2 select-none">
        <img
          alt="AI Tutor Mascot Logo"
          className="w-12 h-12 rounded-full border-2 border-[#d8dadd] shadow-sm animate-float"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuByxIKR0yqnjVSb-6Xkzam2KsoQylyg1y5t1FcMTzZFzL4tlQi_tfm4z9J8hqZFXLOi0wBB9h60rHmktkyfbCzv0NSMYc42rhSVCnj1Wx5Pp9xqkoi7Z2qJYUcyyD3l3RB0G5bT0oXQvuWRfk8yo1W403dC16rFUhg7tkAeSjDdf-Xdd-DxlRzV1HxRpp7QR7xkrXfbOIN6B679v3lLaLjyWLWMexI2gFofvkKEJIddXHzCjOnOCfFlSNEd_uopbwyynVkI8ox0SbE"
          referrerPolicy="no-referrer"
        />
        <div>
          <h1 className="font-title text-xl font-black text-[#2b6c00] leading-none">EduQuest</h1>
          <p className="font-title text-[10px] font-bold text-[#3f4a36] uppercase tracking-widest mt-1">
            {userLevel}级 学者
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-3 flex-grow">
        {/* Dashboard / Study Hall */}
        <button
          onClick={() => onViewChange("study")}
          className={`w-full flex items-center gap-3 rounded-xl p-3 border-b-4 transition-all duration-100 btn-chunky font-title text-sm font-bold ${
            activeView === "study"
              ? "bg-[#58cc02] text-white border-[#2b6c00] translate-y-0.5"
              : "bg-white text-[#3f4a36] border-[#d8dadd] hover:bg-[#eceef1]"
          }`}
        >
          <LayoutGrid className="w-5 h-5 stroke-[2.5px]" />
          <span>学习大厅</span>
        </button>

        {/* Profound Error Book */}
        <button
          onClick={() => onViewChange("errors")}
          className={`w-full flex items-center gap-3 rounded-xl p-3 border-b-4 transition-all duration-100 btn-chunky font-title text-sm font-bold ${
            activeView === "errors"
              ? "bg-[#2fb8ff] text-white border-[#006590] translate-y-0.5"
              : "bg-white text-[#3f4a36] border-[#d8dadd] hover:bg-[#eceef1]"
          }`}
        >
          <BookOpen className="w-5 h-5 stroke-[2.5px]" />
          <span>深度错题本</span>
        </button>

        {/* Challenges / Achievements */}
        <button
          onClick={() => onViewChange("achievements")}
          className={`w-full flex items-center gap-3 rounded-xl p-3 border-b-4 transition-all duration-100 btn-chunky font-title text-sm font-bold ${
            activeView === "achievements"
              ? "bg-[#ff9c27] text-white border-[#8c5000] translate-y-0.5"
              : "bg-white text-[#3f4a36] border-[#d8dadd] hover:bg-[#eceef1]"
          }`}
        >
          <Award className="w-5 h-5 stroke-[2.5px]" />
          <span>我的成就</span>
        </button>
      </nav>

      {/* Bottom Area: Persona Selector & Actions */}
      <div className="mt-auto space-y-4 pt-4 border-t-2 border-[#e0e3e6]">
        {/* Tutor Persona */}
        <div>
          <p className="font-title text-[10px] font-extrabold text-[#3f4a36] uppercase tracking-wider mb-2 pl-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#58cc02]" /> 人工智能导师
          </p>
          
          <div className="relative group">
            <select
              value={tutorStyle}
              onChange={(e) => onTutorStyleChange(e.target.value as any)}
              className="w-full appearance-none bg-white p-3 pr-8 rounded-xl border-2 border-[#d8dadd] hover:bg-[#eceef1] font-title font-bold text-xs text-[#006590] focus:outline-none cursor-pointer transition-colors shadow-[0_3px_0_0_#d8dadd] active:translate-y-0.5"
            >
              <option value="Socrates">🎓 苏格拉底式导师</option>
              <option value="Analogy">💡 趣味比喻式导师</option>
              <option value="Standard">🤖 标准高效导师</option>
            </select>
            <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-[#006590] pointer-events-none stroke-[2.5px]" />
          </div>
        </div>

        {/* User Utilities */}
        <div className="flex gap-2 text-[#3f4a36] pl-1 font-title font-bold text-xs">
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1 hover:text-[#2b6c00] transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>设置</span>
          </button>
          <span className="text-[#d8dadd]">|</span>
          <button
            onClick={onOpenHelp}
            className="flex items-center gap-1 hover:text-[#2b6c00] transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>帮助</span>
          </button>
          <span className="text-[#d8dadd]">|</span>
          <button
            onClick={onLogout}
            className="flex items-center gap-1 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>退出</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
