import { X, HelpCircle, MessageSquare, Flame, BookOpen, Award, Sparkles, Star } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
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
          <div className="bg-[#2fb8ff] text-white p-5 flex items-center justify-between border-b-4 border-[#006590] shrink-0 select-none">
            <div className="flex items-center gap-2.5">
              <HelpCircle className="w-5 h-5 stroke-[2.5px]" />
              <h3 className="font-title text-lg font-black tracking-wide">学习指南与帮助中心</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-[#5cd0ff] rounded-full text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 stroke-[2.5px]" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="p-6 overflow-y-auto space-y-6 flex-grow select-none">
            {/* Guide Welcome */}
            <div className="bg-[#e6f7ff] p-5 rounded-2xl border-2 border-[#b3e5ff] flex gap-3.5 items-start">
              <div className="bg-[#2fb8ff] p-2.5 rounded-xl text-white shadow-sm shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-title text-sm font-black text-[#004666]">
                  欢迎来到 EduQuest AI 学习殿堂!
                </h4>
                <p className="text-xs text-[#004666]/90 leading-relaxed font-medium">
                  这是一个基于游戏化机制的 AI 科学探索工具。你可以与不同风格的 AI 导师对话，解答任何科学、数学、历史或工程学难题，并不断升级成为最强学者！
                </p>
              </div>
            </div>

            {/* Q&A Section */}
            <div className="space-y-4">
              <h4 className="font-title text-xs font-black text-[#3f4a36] uppercase tracking-widest pl-1">
                💡 常见问题解答
              </h4>

              <div className="space-y-3">
                {/* Q1 */}
                <div className="p-4 rounded-xl border-2 border-[#d8dadd] space-y-1 bg-white">
                  <div className="flex items-center gap-2 text-[#2b6c00] font-title text-xs font-black">
                    <Flame className="w-4 h-4 text-[#ff9c27]" />
                    <span>如何赚取 XP (经验值) 与升级？</span>
                  </div>
                  <p className="text-xs text-[#3f4a36] font-medium leading-relaxed pl-6">
                    在学习大厅与 AI 导师进行高质量的对话、提出深刻的问题或完成概念探究时，导师会自动为你发放经验值奖励。每日达到设定的 XP 目标，即可维持每日学习火花状态！累积 XP 即可提升等级。
                  </p>
                </div>

                {/* Q2 */}
                <div className="p-4 rounded-xl border-2 border-[#d8dadd] space-y-1 bg-white">
                  <div className="flex items-center gap-2 text-[#006590] font-title text-xs font-black">
                    <Sparkles className="w-4 h-4 text-[#2fb8ff]" />
                    <span>导师风格有什么不同？</span>
                  </div>
                  <p className="text-xs text-[#3f4a36] font-medium leading-relaxed pl-6">
                    你可以随时在左侧栏切换 3 种极具特色的导师模式：
                    <br />
                    • <strong className="text-[#004666]">苏格拉底式</strong>: 不直接给你答案，而是通过递进式提问引导你独立思考。
                    <br />
                    • <strong className="text-[#2b6c00]">趣味比喻式</strong>: 擅长用天马行空、贴近生活的比喻把硬核概念讲得极其有趣。
                    <br />
                    • <strong className="text-[#8c5000]">标准高效式</strong>: 结构清晰、直切痛点，适合快速解答复杂问题。
                  </p>
                </div>

                {/* Q3 */}
                <div className="p-4 rounded-xl border-2 border-[#d8dadd] space-y-1 bg-white">
                  <div className="flex items-center gap-2 text-[#8c5000] font-title text-xs font-black">
                    <BookOpen className="w-4 h-4 text-[#ff2d55]" />
                    <span>深度错题本是什么？</span>
                  </div>
                  <p className="text-xs text-[#3f4a36] font-medium leading-relaxed pl-6">
                    AI 导师在对话中若发现你的概念理解存在偏差或错误，会自动提炼出针对性的弱点错题并收录到错题本。你可以在这里深度剖析和复习，巩固薄弱环节。
                  </p>
                </div>
              </div>
            </div>

            {/* Support / QQ Contact Box */}
            <div className="border-t-2 border-[#e0e3e6] pt-5 space-y-3">
              <h4 className="font-title text-xs font-black text-[#3f4a36] uppercase tracking-widest pl-1">
                💬 意见反馈与技术支持
              </h4>

              <div className="bg-[#fff9c4] p-5 rounded-2xl border-2 border-[#ffcc00] border-b-4 flex gap-4 items-center">
                <div className="bg-[#fbc02d] p-3 rounded-full text-[#4a148c] shrink-0 shadow-sm">
                  <MessageSquare className="w-6 h-6 stroke-[2.5px]" />
                </div>
                <div className="space-y-1">
                  <h5 className="font-title text-sm font-black text-[#4a148c]">
                    加入官方学者反馈群 / 寻找客服帮助
                  </h5>
                  <p className="text-xs text-[#4a148c]/90 leading-relaxed font-bold">
                    欢迎加入我们的 QQ 学术研讨反馈通道，如有任何建议、功能缺失反馈或遭遇漏洞，请联系我们的客服团队：
                  </p>
                  <div className="mt-2 inline-flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-xl border-2 border-[#ffcc00] select-text">
                    <span className="text-[10px] font-black text-[#4a148c]/60">QQ 客服号:</span>
                    <strong className="text-sm font-black text-[#e65100] tracking-wider select-all font-mono">
                      2961286707
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-5 border-t-2 border-[#e0e3e6] bg-white flex shrink-0">
            <button
              onClick={onClose}
              className="btn-chunky w-full py-3 px-4 rounded-xl bg-[#2fb8ff] text-white border-b-4 border-[#006590] hover:bg-[#5cd0ff] font-title font-black text-xs flex items-center justify-center gap-1.5"
            >
              <Star className="w-4 h-4 fill-white" />
              <span>我明白了，去学习！</span>
            </button>
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
}
