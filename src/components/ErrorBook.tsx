import { useState } from "react";
import { BookOpen, Search, Share2, HelpCircle, CheckCircle2, RotateCcw, AlertCircle, X, Sparkles, Check, Play } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { WrongQuestion, UserStats } from "../types";

interface ErrorBookProps {
  wrongQuestions: WrongQuestion[];
  onUpdateQuestions: (questions: WrongQuestion[]) => void;
  userStats: UserStats;
  onUpdateStats: (updater: (prev: UserStats) => UserStats) => void;
}

interface PracticeProblem {
  problem: string;
  options: string[];
  correctIndex: number;
  hint: string;
  explanation: string;
}

export default function ErrorBook({
  wrongQuestions,
  onUpdateQuestions,
  userStats,
  onUpdateStats,
}: ErrorBookProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sharingId, setSharingId] = useState<string | null>(null);
  const [activePracticeItem, setActivePracticeItem] = useState<WrongQuestion | null>(null);
  
  // Quiz states
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizProblem, setQuizProblem] = useState<PracticeProblem | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizError, setQuizError] = useState("");

  const pendingCount = wrongQuestions.filter((q) => q.status === "pending").length;
  const masteredCount = wrongQuestions.filter((q) => q.status === "mastered").length;

  const filteredQuestions = wrongQuestions.filter(
    (q) =>
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleShare = (id: string) => {
    setSharingId(id);
    setTimeout(() => {
      setSharingId(null);
      alert("📤 二维码与 PDF 错题报告打包成功！已自动复制微信分享链接，可直接发送给辅导老师。");
    }, 1000);
  };

  const handleStartPractice = async (q: WrongQuestion) => {
    setActivePracticeItem(q);
    setQuizLoading(true);
    setQuizProblem(null);
    setSelectedOption(null);
    setQuizSubmitted(false);
    setQuizError("");

    try {
      const res = await fetch("/api/retrain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: q.title }),
      });

      if (!res.ok) {
        throw new Error("Could not connect to AI service.");
      }

      const data = await res.json();
      setQuizProblem(data);
    } catch (err) {
      console.error(err);
      // Fallback offline question
      setQuizProblem({
        problem: `在解二次多项式 ${q.title} 时，如果将常数项移到等号右边，我们必须注意什么？`,
        options: [
          "必须给常数项乘以 a 的系数",
          "必须改变常数项的正负符号",
          "常数项不需要任何变化",
          "必须给常数项求平方根"
        ],
        correctIndex: 1,
        hint: "想想当你把 +3 移动到等号另一边时，它会变成什么？",
        explanation: "移项时，原项前面的正负符号需要反转。比如 +3 变成 -3，-5 变成 +5。这是做因式分解和求解方程的最基本守则！"
      });
    } finally {
      setQuizLoading(false);
    }
  };

  const handleCheckAnswer = (qId: string) => {
    if (selectedOption === null || !quizProblem) return;
    setQuizSubmitted(true);

    const isCorrect = selectedOption === quizProblem.correctIndex;
    if (isCorrect) {
      // Graduate question from pending to mastered
      const updated = wrongQuestions.map((item) => {
        if (activePracticeItem && item.id === activePracticeItem.id) {
          return { ...item, status: "mastered" as const };
        }
        return item;
      });
      onUpdateQuestions(updated);

      // Reward XP
      onUpdateStats((prev) => {
        const nextXp = prev.xp + 15;
        const leveledUp = nextXp >= prev.maxXp;
        return {
          ...prev,
          xp: leveledUp ? nextXp - prev.maxXp : nextXp,
          level: leveledUp ? prev.level + 1 : prev.level,
          deepThinkingMinutes: prev.deepThinkingMinutes + 3,
        };
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f7f9fc] p-4 md:p-6 overflow-y-auto relative font-sans">
      
      {/* Title Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 select-none">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#006590] text-white rounded-2xl border-b-4 border-[#004c6e] shadow-sm">
            <BookOpen className="w-6 h-6 stroke-[2.5px]" />
          </div>
          <div>
            <h1 className="font-title text-2xl font-black text-[#191c1e]">深刻错题本</h1>
            <p className="text-xs text-[#3f4a36] font-semibold">将挑战转化为深度思考的力量</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-[#3f4a36]/50" />
          <input
            className="input-chunky w-full py-2.5 pl-10 pr-4 text-xs font-bold text-[#191c1e] placeholder:text-[#3f4a36]/40 shadow-sm"
            placeholder="搜索科目或难点题目..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      {/* Overview stats cards block */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 select-none">
        {/* Red Warning/Pending */}
        <div className="bg-[#fff0f0] border-2 border-[#ffdad6] p-5 rounded-[20px] shadow-[0_4px_0_0_#ffdad6] border-b-4 flex items-center justify-between">
          <div>
            <p className="font-title text-xs font-bold text-[#ba1a1a] mb-1">⚠️ 待解决</p>
            <p className="font-title text-3xl font-black text-[#93000a]">{pendingCount} <span className="text-sm font-medium text-[#ba1a1a]">道题</span></p>
          </div>
          <span className="text-3xl">⏰</span>
        </div>

        {/* Green Mastered */}
        <div className="bg-[#f3ffeb] border-2 border-[#becbb1] p-5 rounded-[20px] shadow-[0_4px_0_0_#becbb1] border-b-4 flex items-center justify-between">
          <div>
            <p className="font-title text-xs font-bold text-[#2b6c00] mb-1">✓ 已掌握</p>
            <p className="font-title text-3xl font-black text-[#1e5000]">{masteredCount} <span className="text-sm font-medium text-[#2b6c00]">道题</span></p>
          </div>
          <span className="text-3xl">🎓</span>
        </div>

        {/* Blue AI Tip Alert */}
        <div className="bg-[#eef8ff] border-2 border-[#c8e6ff] p-5 rounded-[20px] shadow-[0_4px_0_0_#c8e6ff] border-b-4">
          <div className="flex gap-2">
            <Sparkles className="w-5 h-5 text-[#006590] shrink-0 fill-[#006590]/15" />
            <div>
              <p className="font-title text-xs font-extrabold text-[#006590] uppercase tracking-wider mb-1">AI 学习建议</p>
              <p className="text-xs text-[#004666] leading-relaxed font-semibold">
                你在 <span className="underline font-bold">[二次方程]</span> 上卡住次数较多。建议向老师寻求帮助并尝试AI再次训练！
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Wrong question list section */}
      <h2 className="font-title text-sm font-extrabold text-[#3f4a36] uppercase tracking-widest mb-4 pl-1 select-none">
        最近错题记录
      </h2>

      <div className="flex flex-col gap-6">
        {filteredQuestions.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-[#d8dadd] p-12 text-center text-gray-500 font-title font-bold text-sm">
            🛸 未找到匹配的错题记录，干得漂亮！继续保持！
          </div>
        ) : (
          filteredQuestions.map((q) => (
            <div
              key={q.id}
              className={`bg-white rounded-[20px] border-2 border-[#d8dadd] p-5 md:p-6 shadow-[0_4px_0_0_#d8dadd] border-b-4 transition-all duration-200 ${
                q.status === "mastered" ? "opacity-80" : ""
              }`}
            >
              <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Note photo or thumbnail placeholder */}
                {q.image ? (
                  <div className="w-full md:w-48 h-32 rounded-xl bg-[#e0e3e6] border-2 border-[#d8dadd] overflow-hidden shrink-0 relative select-none">
                    <img
                      alt="Wrong question snapshot"
                      className="w-full h-full object-cover"
                      src={q.image}
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2 left-2 bg-[#ffdcbf] text-[#2d1600] font-title text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                      {q.subject}
                    </div>
                  </div>
                ) : (
                  <div className="w-full md:w-48 h-32 rounded-xl bg-[#eceef1] border-2 border-dashed border-[#d8dadd] flex flex-col items-center justify-center gap-1 shrink-0 text-[#3f4a36]/40 select-none">
                    <span className="text-3xl">📝</span>
                    <span className="text-[10px] font-bold">无手绘截图</span>
                    <div className="bg-[#ffdcbf] text-[#2d1600] font-title text-[9px] font-black px-2 py-0.5 rounded-full uppercase mt-1">
                      {q.subject}
                    </div>
                  </div>
                )}

                {/* Problem details */}
                <div className="flex-grow">
                  <div className="flex flex-wrap items-center justify-between mb-2 gap-2 select-none">
                    <div className="flex items-center gap-2">
                      <h3 className="font-title text-base sm:text-lg font-black text-[#191c1e]">
                        {q.title}
                      </h3>
                      {q.status === "mastered" ? (
                        <span className="bg-[#58cc02]/10 text-[#1e5000] text-xs font-extrabold px-2.5 py-0.5 rounded-full border border-[#58cc02]/30 flex items-center gap-0.5">
                          ✓ 已掌握
                        </span>
                      ) : (
                        <span className="bg-[#ba1a1a]/10 text-[#ba1a1a] text-xs font-extrabold px-2.5 py-0.5 rounded-full border border-[#ba1a1a]/20 flex items-center gap-0.5">
                          ⚠️ 待攻克
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-[#3f4a36] font-bold">📅 {q.date}</span>
                  </div>

                  {/* AI Tip Alert description box */}
                  <div className="bg-red-50 text-red-900 border border-red-100 p-3.5 rounded-xl text-xs sm:text-sm font-semibold leading-relaxed mb-4 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-red-700 font-extrabold">易错难点：</span>
                      {q.aiTip}
                    </div>
                  </div>

                  {/* Operational actions footer */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => handleShare(q.id)}
                      className="btn-chunky flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-title text-xs font-bold bg-[#58cc02] text-white border-b-4 border-[#2b6c00] hover:bg-[#6ee026] active:border-b-2"
                    >
                      <Share2 className="w-4 h-4 stroke-[2.5px]" />
                      <span>分享给老师 (PDF/微信)</span>
                    </button>

                    <button
                      onClick={() => handleStartPractice(q)}
                      className={`btn-chunky flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-title text-xs font-bold border-b-4 active:border-b-2 ${
                        q.status === "mastered"
                          ? "bg-[#eceef1] text-[#3f4a36] border-[#c0c4c8] hover:bg-[#e0e3e6]"
                          : "bg-white text-[#006590] border-2 border-[#006590] border-b-4 hover:bg-[#eef8ff]"
                      }`}
                    >
                      <Sparkles className="w-4 h-4 stroke-[2.5px] text-[#006590]" />
                      <span>{q.status === "mastered" ? "再次练习" : "AI再次训练"}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* AI Retrain Practice Overlay Modal */}
      <AnimatePresence>
        {activePracticeItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-lg rounded-[24px] border-4 border-[#d8dadd] shadow-[0_8px_0_0_#d8dadd] overflow-hidden"
            >
              {/* Modal header */}
              <div className="bg-[#006590] text-white p-4 flex items-center justify-between border-b-4 border-[#004c6e]">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#58cc02]" />
                  <h3 className="font-title text-base sm:text-lg font-black">AI 特训: {activePracticeItem.title}</h3>
                </div>
                <button
                  onClick={() => {
                    setActivePracticeItem(null);
                    setQuizProblem(null);
                  }}
                  className="p-1 hover:bg-[#004c6e] rounded-full text-white/80 transition-colors"
                >
                  <X className="w-5 h-5 stroke-[2.5px]" />
                </button>
              </div>

              {/* Modal content */}
              <div className="p-6">
                {quizLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <div className="inline-block border-4 border-[#006590] border-t-transparent rounded-full w-10 h-10 animate-spin"></div>
                    <p className="text-sm text-[#006590] font-title font-bold animate-pulse">
                      Socratic AI 正在根据你的难点为您组装特训题目...
                    </p>
                  </div>
                ) : quizProblem ? (
                  <div className="space-y-6">
                    <div className="bg-[#f7f9fc] p-4 rounded-xl border-2 border-[#d8dadd] border-b-4">
                      <p className="text-sm md:text-base font-bold text-[#191c1e] leading-relaxed">
                        {quizProblem.problem}
                      </p>
                    </div>

                    {/* Multiple choices options */}
                    <div className="flex flex-col gap-3">
                      {quizProblem.options.map((option, idx) => (
                        <button
                          key={idx}
                          disabled={quizSubmitted}
                          onClick={() => setSelectedOption(idx)}
                          className={`btn-chunky w-full text-left p-4 rounded-xl font-title text-sm font-bold border-b-4 active:border-b-2 flex items-center justify-between ${
                            selectedOption === idx
                              ? "bg-[#c8e6ff] text-[#004666] border-[#006590] translate-y-0.5"
                              : "bg-white text-[#191c1e] border-2 border-[#d8dadd] border-b-4 hover:bg-[#f2f4f7]"
                          }`}
                        >
                          <span>{option}</span>
                          {selectedOption === idx && <Check className="w-4 h-4 text-[#006590] stroke-[3px]" />}
                        </button>
                      ))}
                    </div>

                    {/* Socratic explanation check */}
                    {quizSubmitted ? (
                      <div
                        className={`p-4 rounded-xl border-2 border-b-4 ${
                          selectedOption === quizProblem.correctIndex
                            ? "bg-[#f3ffeb] border-[#becbb1] text-[#1e5000]"
                            : "bg-[#fff0f0] border-[#ffdad6] text-[#ba1a1a]"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2 font-black text-sm">
                          {selectedOption === quizProblem.correctIndex ? (
                            <>
                              <CheckCircle2 className="w-5 h-5 text-[#58cc02]" />
                              <span>回答正确！解锁 15 XP 奖励</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-5 h-5 text-red-600" />
                              <span>需要再想想！Socratic 导师给你个提示</span>
                            </>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm font-semibold leading-relaxed">
                          {quizProblem.explanation}
                        </p>

                        <div className="mt-4 flex justify-end">
                          <button
                            onClick={() => {
                              setActivePracticeItem(null);
                              setQuizProblem(null);
                            }}
                            className="bg-[#58cc02] text-white font-title text-xs font-extrabold px-4 py-2 rounded-lg border-b-4 border-[#2b6c00] btn-chunky"
                          >
                            完成挑战
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center gap-4 pt-4 border-t-2 border-[#e0e3e6]">
                        <span className="text-xs text-[#3f4a36] font-bold">
                          💡 提示：{quizProblem.hint}
                        </span>
                        
                        <button
                          disabled={selectedOption === null}
                          onClick={() => handleCheckAnswer(activePracticeItem.id)}
                          className={`btn-chunky px-6 py-2.5 rounded-xl font-title text-sm font-black border-b-4 active:border-b-2 ${
                            selectedOption === null
                              ? "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed"
                              : "bg-[#58cc02] text-white border-[#2b6c00] hover:bg-[#6ee026]"
                          }`}
                        >
                          提交回答
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-center text-red-500 font-bold">题目加载失败，请重试！</p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
