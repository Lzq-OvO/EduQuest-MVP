import { useState, useRef, useEffect, FormEvent } from "react";
import { Clock, Flame, ArrowRight, Send, Camera, AlertTriangle, Sparkles, MessageSquare, Brain, Check, Image as ImageIcon, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Message, UserStats, UserProfile } from "../types";

interface StudyHallProps {
  currentSubject: string;
  onSubjectChange: (subj: string) => void;
  tutorStyle: "Socrates" | "Analogy" | "Standard";
  userStats: UserStats;
  onUpdateStats: (updater: (prev: UserStats) => UserStats) => void;
  userProfile: UserProfile;
}

export default function StudyHall({
  currentSubject,
  onSubjectChange,
  tutorStyle,
  userStats,
  onUpdateStats,
  userProfile,
}: StudyHallProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-cn-1",
      role: "assistant",
      content: "你好！今天我们来品鉴一篇经典的文言文或现代散文。你最近在读哪一篇文章呢？",
      timestamp: "08:10",
    }
  ]);

  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [apiError, setApiError] = useState("");
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Handle subject changes
  useEffect(() => {
    setActiveSessionId(null); // 切换学科时开启新会话
    // Reset conversation based on current subject
    if (currentSubject === "语文") {
      setMessages([
        { id: "cn-1", role: "assistant", content: "你好！今天我们来品鉴一篇经典的文言文或现代散文。你最近在读哪一篇文章呢？", timestamp: "08:10" }
      ]);
    } else if (currentSubject === "数学") {
      setMessages([
        { id: "math-1", role: "assistant", content: "嗨！数学的魅力在于逻辑的严密。今天我们要挑战代数还是几何？", timestamp: "08:10" }
      ]);
    } else if (currentSubject === "英语") {
      setMessages([
        { id: "en-1", role: "assistant", content: "Hello! Ready to practice some English today? 我们可以练习语法、阅读或者写作，你选哪一个？", timestamp: "08:10" }
      ]);
    } else if (currentSubject === "物理") {
      setMessages([
        { id: "phy-1", role: "assistant", content: "欢迎来到物理课堂！从微观的量子到宏观的力学，你对哪个物理现象最感兴趣？", timestamp: "08:10" }
      ]);
    } else if (currentSubject === "化学") {
      setMessages([
        { id: "chem-1", role: "assistant", content: "化学是物质变化的魔法。今天我们研究无机物还是有机反应呢？", timestamp: "08:10" }
      ]);
    } else if (currentSubject === "生物") {
      setMessages([
        { id: "bio-1", role: "assistant", content: "探索生命奥秘的时刻到了！你最近在学生态系统还是遗传学？", timestamp: "08:10" }
      ]);
    } else if (currentSubject === "地理") {
      setMessages([
        { id: "geo-1", role: "assistant", content: "地理不仅是地图上的线条，更是自然与人文的交织。今天我们去看哪里？", timestamp: "08:10" }
      ]);
    } else if (currentSubject === "历史") {
      setMessages([
        { id: "hist-1", role: "assistant", content: "以史为鉴，可知兴替。你最近在研究哪段波澜壮阔的历史事件？", timestamp: "08:10" }
      ]);
    } else if (currentSubject === "政治") {
      setMessages([
        { id: "pol-1", role: "assistant", content: "你好！政治涵盖了哲学思维与社会经济规律。今天我们要讨论哪个知识点？", timestamp: "08:10" }
      ]);
    }
  }, [currentSubject]);

  // Handle local file upload
  const handleAttachImage = () => {
    if (attachedImage) {
      setAttachedImage(null);
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle clipboard paste (Ctrl+V) for images
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setAttachedImage(reader.result as string);
          };
          reader.readAsDataURL(file);
        }
        // Prevent default text paste behavior if it's an image
        e.preventDefault();
        break; // Only attach the first image found
      }
    }
  };

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() && !attachedImage) return;

    const userText = inputValue;
    const userImg = attachedImage;
    
    const timestampStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsgId = `msg-user-${Date.now()}`;

    // 1. Add user message
    const newUserMsg: Message = {
      id: userMsgId,
      role: "user",
      content: userText,
      timestamp: timestampStr,
      image: userImg || undefined,
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInputValue("");
    setAttachedImage(null);
    setApiError("");
    setIsTyping(true);

    // 2. Fetch from Express backend Socratic AI
    try {
      const chatHistory = [...messages, newUserMsg].map((m) => ({
        role: m.role,
        content: m.image ? `${m.content} (注：学生附带了一张关于当前学科的学习手稿图。)` : m.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: chatHistory,
          tutorStyle: tutorStyle,
          currentSubject: currentSubject,
          sessionId: activeSessionId,
        }),
      });

      if (!res.ok) {
        throw new Error("Tutor failed to respond. Make sure GEMINI_API_KEY is configured.");
      }

      const data = await res.json();
      
      if (data.sessionId && data.sessionId !== activeSessionId) {
        setActiveSessionId(data.sessionId);
      }
      
      // 3. Add AI Socratic response
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-ai-${Date.now()}`,
          role: "assistant",
          content: data.content,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);

      // 4. Update stats for rewarding the student
      onUpdateStats((prev) => {
        const nextXp = prev.xp + 5;
        const leveledUp = nextXp >= prev.maxXp;
        return {
          ...prev,
          xp: leveledUp ? nextXp - prev.maxXp : nextXp,
          level: leveledUp ? prev.level + 1 : prev.level,
          deepThinkingMinutes: prev.deepThinkingMinutes + 1,
          streakCount: prev.streakCount + 1,
        };
      });

    } catch (err: any) {
      console.error(err);
      setApiError(err.message || "无法获得导师回答");
      // Add simulated helper fallback if API fails
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-ai-fallback-${Date.now()}`,
            role: "assistant",
            content: "很好！c 确实代表光速（真空中的光速）。你附带的练习本上的图非常棒，它展现了动能和质能的关系！在我们进入质能公式之前，你觉得光速有什么特别的地方？为什么它总是恒定不变的？✨",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }, 1000);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClaimChest = () => {
    // Fill up XP to claim reward
    onUpdateStats((prev) => ({
      ...prev,
      xp: prev.maxXp,
    }));
    alert("🎉 恭喜获得今日宝箱！获得 20 额外经验值奖励和“百日真金”徽章进度！");
    onUpdateStats((prev) => ({
      ...prev,
      xp: 0,
      level: prev.level + 1,
    }));
  };

  return (
    <div className="flex flex-1 h-full overflow-hidden">
      {/* Center Column: Socratic Chat */}
      <main className="flex-1 flex flex-col bg-white md:border-2 border-[#d8dadd] md:rounded-[24px] md:my-6 shadow-[0_4px_0_0_#d8dadd] overflow-hidden relative">
        {/* Center Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b-2 border-[#e0e3e6] bg-white shrink-0 z-10 gap-2">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-title text-base sm:text-lg font-bold text-[#006590]">
                  当前主题：{currentSubject}
                </h2>
                
                {/* Subject dropdown for high fidelity toggling */}
                <select
                  value={currentSubject}
                  onChange={(e) => onSubjectChange(e.target.value)}
                  className="bg-[#f2f4f7] border-0 text-xs font-bold text-[#2b6c00] py-1 px-2 pr-6 rounded-lg focus:outline-none cursor-pointer"
                >
                  <option value="语文">📚 语文</option>
                  <option value="数学">📐 数学</option>
                  <option value="英语">🔤 英语</option>
                  <option value="物理">⚛️ 物理</option>
                  <option value="化学">🧪 化学</option>
                  <option value="生物">🧬 生物</option>
                  <option value="地理">🌍 地理</option>
                  <option value="历史">📜 历史</option>
                  <option value="政治">🏛️ 政治</option>
                </select>
              </div>
              <p className="text-xs text-[#3f4a36] font-medium">苏格拉底式引导式提问进行中...</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#ff9c27]/10 text-[#2d1600] px-3.5 py-1.5 rounded-full border-b-2 border-[#ff9c27] shadow-sm shrink-0 self-start sm:self-center">
            <Flame className="w-4 h-4 text-[#ff9c27] fill-[#ff9c27] animate-pulse" />
            <span className="font-title text-xs font-extrabold">
              深度思考连击：x{userStats.streakCount}
            </span>
          </div>
        </header>

        {/* Chat Messages */}
        <div className="flex-grow overflow-y-auto p-4 md:p-6 flex flex-col gap-6 relative bg-[#f7f9fc]">
          
          {/* Subtle physics formulas backdrop */}
          <div className="absolute top-10 right-10 text-[#d8dadd] opacity-15 pointer-events-none transform rotate-12 select-none">
            <Brain className="w-24 h-24 stroke-[1.5]" />
          </div>

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[85%] ${
                msg.role === "assistant" ? "self-start" : "self-end flex-row-reverse"
              }`}
            >
              {/* Avatar */}
              {msg.role === "assistant" ? (
                <img
                  alt="AI Avatar"
                  className="w-10 h-10 rounded-full border-2 border-[#2b6c00] shrink-0 self-end select-none shadow-sm"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuByxIKR0yqnjVSb-6Xkzam2KsoQylyg1y5t1FcMTzZFzL4tlQi_tfm4z9J8hqZFXLOi0wBB9h60rHmktkyfbCzv0NSMYc42rhSVCnj1Wx5Pp9xqkoi7Z2qJYUcyyD3l3RB0G5bT0oXQvuWRfk8yo1W403dC16rFUhg7tkAeSjDdf-Xdd-DxlRzV1HxRpp7QR7xkrXfbOIN6B679v3lLaLjyWLWMexI2gFofvkKEJIddXHzCjOnOCfFlSNEd_uopbwyynVkI8ox0SbE"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className={`w-10 h-10 rounded-full ${userProfile.avatarBg} border-2 border-[#8c5000] shrink-0 self-end flex items-center justify-center font-title font-extrabold ${userProfile.avatarColor} select-none shadow-sm`}>
                  {userProfile.avatarChar}
                </div>
              )}

              {/* Chat bubble body */}
              <div
                className={`p-4 rounded-2xl relative ${
                  msg.role === "assistant"
                    ? "bg-[#006590] text-white rounded-bl-none border-b-4 border-[#004c6e]"
                    : "bg-white text-[#191c1e] rounded-br-none border-2 border-[#d8dadd] border-b-4 shadow-sm"
                }`}
              >
                <p className="text-sm md:text-base leading-relaxed font-medium whitespace-pre-line">
                  {msg.content}
                </p>

                {/* Specific formatting for the physics equation block */}
                {msg.content.includes("E = mc²") && (
                  <div className="mt-3 bg-[#2fb8ff]/20 text-[#c8e6ff] border border-[#2fb8ff]/30 p-3 rounded-xl font-mono text-center text-lg font-bold shadow-inner">
                    E = mc²
                  </div>
                )}

                {/* Hand-drawn math problem attachment support */}
                {msg.image && (
                  <div className="mt-3 w-48 h-32 rounded-lg bg-[#e0e3e6] border-2 border-[#d8dadd] overflow-hidden relative">
                    <img
                      alt="Physics problem paper"
                      className="w-full h-full object-cover"
                      src={msg.image}
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 max-w-[85%] self-start items-end">
              <img
                alt="AI Avatar"
                className="w-8 h-8 rounded-full border-2 border-[#2b6c00] shrink-0 opacity-70 select-none"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuByxIKR0yqnjVSb-6Xkzam2KsoQylyg1y5t1FcMTzZFzL4tlQi_tfm4z9J8hqZFXLOi0wBB9h60rHmktkyfbCzv0NSMYc42rhSVCnj1Wx5Pp9xqkoi7Z2qJYUcyyD3l3RB0G5bT0oXQvuWRfk8yo1W403dC16rFUhg7tkAeSjDdf-Xdd-DxlRzV1HxRpp7QR7xkrXfbOIN6B679v3lLaLjyWLWMexI2gFofvkKEJIddXHzCjOnOCfFlSNEd_uopbwyynVkI8ox0SbE"
                referrerPolicy="no-referrer"
              />
              <div className="bg-[#f2f4f7] text-[#191c1e] p-3 rounded-2xl rounded-bl-none border border-[#d8dadd] border-b-2 flex items-center gap-1.5 w-16 h-10">
                <span className="w-2 h-2 rounded-full bg-[#006590] animate-bounce" style={{ animationDelay: "0s" }}></span>
                <span className="w-2 h-2 rounded-full bg-[#006590] animate-bounce" style={{ animationDelay: "0.25s" }}></span>
                <span className="w-2 h-2 rounded-full bg-[#006590] animate-bounce" style={{ animationDelay: "0.5s" }}></span>
              </div>
            </div>
          )}

          {apiError && (
            <div className="text-xs text-red-500 bg-red-50 p-2.5 rounded-lg border border-red-200 self-center max-w-[90%] text-center font-semibold">
              ⚠️ {apiError} (正在启动备用离线物理教学逻辑)
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Area with dynamic upload overlay */}
        <div className="p-4 border-t-2 border-[#e0e3e6] bg-white shrink-0 z-10">
          <form onSubmit={handleSendMessage} className="space-y-2">
            {attachedImage && (
              <div className="flex items-center gap-2 bg-[#f2f4f7] border border-[#d8dadd] p-2 rounded-xl w-fit">
                <ImageIcon className="w-4 h-4 text-[#006590]" />
                <span className="text-xs font-bold text-[#3f4a36]">已附加本地图片</span>
                <button
                  type="button"
                  onClick={() => setAttachedImage(null)}
                  className="p-1 hover:bg-[#e0e3e6] rounded-full text-red-500"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="flex items-end gap-3 bg-[#f7f9fc] rounded-[20px] border-2 border-[#d8dadd] p-2 focus-within:border-[#2b6c00] transition-all">
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
              />
              <button
                type="button"
                onClick={handleAttachImage}
                title="上传本地图片"
                className={`p-3 rounded-full transition-colors shrink-0 ${
                  attachedImage
                    ? "bg-[#c8e6ff] text-[#006590]"
                    : "text-[#3f4a36] bg-white hover:bg-[#eceef1]"
                }`}
              >
                <Camera className="w-5 h-5 stroke-[2.5px]" />
              </button>
              
              <textarea
                className="w-full bg-transparent border-none focus:ring-0 resize-none max-h-32 min-h-[48px] py-2 px-1 text-sm md:text-base font-medium text-[#191c1e] placeholder:text-[#3f4a36]/50"
                placeholder="输入你的回答，或者直接 Ctrl+V 粘贴截图..."
                rows={1}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onPaste={handlePaste}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />

              <button
                type="submit"
                className="bg-[#58cc02] text-white p-3 rounded-full hover:bg-[#6ee026] border-b-4 border-[#2b6c00] btn-chunky flex items-center justify-center shrink-0 w-11 h-11"
              >
                <Send className="w-4 h-4 stroke-[3px]" />
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Right Sidebar: Profile Rail */}
      <aside className="hidden lg:flex flex-col h-full w-[280px] shrink-0 py-6 pl-6 bg-[#f7f9fc] ml-6 border-l-4 border-[#d8dadd]">
        
        {/* User Profile Header */}
        <div className="flex items-center gap-4 p-4 bg-[#f2f4f7] rounded-2xl border-2 border-[#e0e3e6] mb-6 select-none">
          <div className="relative">
            <div className={`w-14 h-14 rounded-full ${userProfile.avatarBg} border-2 border-[#006590] flex items-center justify-center font-title text-2xl ${userProfile.avatarColor} font-black`}>
              {userProfile.avatarChar}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-[#ffdcbf] text-[#2d1600] text-[10px] font-black px-2 py-0.5 rounded-full border border-white">
              Lv.{userStats.level}
            </div>
          </div>
          <div>
            <h3 className="font-title text-base font-bold text-[#191c1e]">{userProfile.name}</h3>
            <p className="font-title text-[10px] font-extrabold text-[#006590] tracking-wider uppercase">
              {userProfile.academicTitle}
            </p>
          </div>
        </div>

        <h4 className="font-title text-[10px] font-extrabold text-[#3f4a36] uppercase tracking-widest mb-4 pl-1">
          CURRENT SESSION STATS
        </h4>

        {/* Core Stats */}
        <div className="flex flex-col gap-4 mb-6">
          {/* Learning Time */}
          <div className="bg-white p-4 rounded-xl border-2 border-[#e0e3e6] border-b-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#006590]/10 rounded-lg text-[#006590]">
                <Clock className="w-5 h-5 stroke-[2.5px]" />
              </div>
              <div>
                <p className="font-title text-[10px] font-extrabold text-[#3f4a36]">学习时长</p>
                <p className="font-title text-lg font-black text-[#191c1e]">
                  {userStats.learningTimeMinutes} Mins
                </p>
              </div>
            </div>
          </div>

          {/* Deep Thinking Energy */}
          <div className="bg-white p-4 rounded-xl border-2 border-[#e0e3e6] border-b-4">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-1.5 text-[#8c5000]">
                <Flame className="w-4 h-4 fill-[#8c5000]" />
                <span className="font-title text-[10px] font-extrabold">深度思考</span>
              </div>
              <span className="font-title text-sm font-black text-[#8c5000]">
                {userStats.deepThinkingMinutes} Min
              </span>
            </div>
            {/* Cylindrical Glass-shimmer Progress Bar */}
            <div className="h-4 w-full bg-[#e0e3e6] rounded-full overflow-hidden relative border border-gray-200">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#8c5000] to-[#ff9c27] rounded-full progress-bar-shimmer transition-all duration-300"
                style={{ width: "65%" }}
              ></div>
            </div>
          </div>
        </div>

        {/* Playful Interactive Warning Alert (家校互联) */}
        <div className="bg-[#ffdad6] text-[#93000a] p-4 rounded-xl border-2 border-[#ba1a1a]/20 border-b-4 mb-6 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-10">
            <AlertTriangle className="w-20 h-20" />
          </div>
          <div className="flex items-start gap-3 relative z-10">
            <AlertTriangle className="w-5 h-5 text-[#ba1a1a] shrink-0 mt-0.5 stroke-[2.5px]" />
            <div>
              <h5 className="font-title text-xs font-bold text-[#ba1a1a]">家校互联</h5>
              <p className="text-xs font-medium mt-1 leading-relaxed opacity-95">
                老师要求在周五前复习多项式。
              </p>
              <button
                onClick={() => onSubjectChange("多项式")}
                className="mt-2 text-xs font-bold underline hover:text-[#ba1a1a] transition-colors"
              >
                跳转至课程
              </button>
            </div>
          </div>
        </div>

        {/* Daily Goal Ring (Interactive progress ring to open chest!) */}
        <div className="mt-auto bg-[#f2f4f7] p-5 rounded-[24px] border-2 border-[#e0e3e6] flex flex-col items-center justify-center text-center">
          <h5 className="font-title text-sm font-bold text-[#191c1e] mb-3">每日目标</h5>
          
          <div className="relative w-24 h-24 flex items-center justify-center">
            {/* SVG Ring */}
            <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle className="stroke-[#d8dadd]" cx="50" cy="50" fill="none" r="40" strokeWidth="8"></circle>
              <circle
                className="stroke-[#58cc02] transition-all duration-500"
                cx="50"
                cy="50"
                fill="none"
                r="40"
                strokeWidth="8"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * userStats.xp) / userStats.maxXp}
                strokeLinecap="round"
              ></circle>
            </svg>
            {/* Inner Interactive Chest */}
            <button
              onClick={handleClaimChest}
              title={userStats.xp >= userStats.maxXp ? "点击领取宝箱！" : "点击增加练习能量"}
              className={`rounded-full w-16 h-16 flex items-center justify-center shadow-inner border border-[#d8dadd] relative z-10 transition-transform active:scale-90 ${
                userStats.xp >= userStats.maxXp
                  ? "bg-[#87fe45]/20 border-[#58cc02] animate-bounce"
                  : "bg-white"
              }`}
            >
              <span className="text-3xl select-none">🎁</span>
            </button>
          </div>

          <p className="font-title text-[11px] font-bold text-[#3f4a36] mt-3">
            还差 {userStats.maxXp - userStats.xp}/{userStats.maxXp} 经验值开启下一个宝箱
          </p>
        </div>
      </aside>
    </div>
  );
}
