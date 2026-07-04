import { useState, useEffect } from "react";
import { X, Shield, Scroll, Check, Info } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "privacy" | "terms";
}

export default function PrivacyModal({ isOpen, onClose, initialTab = "privacy" }: PrivacyModalProps) {
  const [activeTab, setActiveTab] = useState<"privacy" | "terms">(initialTab);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  return (
    <AnimatePresence>
      {isOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          className="bg-white w-full max-w-2xl rounded-[28px] border-4 border-[#d8dadd] shadow-[0_8px_0_0_#d8dadd] overflow-hidden max-h-[90vh] flex flex-col font-sans"
        >
          {/* Header */}
          <div className="bg-[#2b6c00] text-white p-5 flex items-center justify-between border-b-4 border-[#1b4600] shrink-0 select-none">
            <div className="flex items-center gap-2.5">
              {activeTab === "privacy" ? (
                <Shield className="w-5 h-5 text-[#d7ffb8] stroke-[2.5px]" />
              ) : (
                <Scroll className="w-5 h-5 text-[#ffd580] stroke-[2.5px]" />
              )}
              <h3 className="font-title text-lg font-black tracking-wide">
                {activeTab === "privacy" ? "EduQuest AI 隐私政策" : "EduQuest AI 用户服务条款"}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-[#3f9e00] rounded-full text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 stroke-[2.5px]" />
            </button>
          </div>

          {/* Tab Selector */}
          <div className="bg-[#f2f4f7] border-b-2 border-[#d8dadd] flex p-1 shrink-0 select-none">
            <button
              onClick={() => setActiveTab("terms")}
              className={`flex-1 py-3 font-title text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 ${
                activeTab === "terms"
                  ? "bg-white text-[#2b6c00] border-2 border-[#58cc02] shadow-sm scale-[1.02]"
                  : "text-[#3f4a36] hover:bg-white/50"
              }`}
            >
              <Scroll className="w-4 h-4" />
              <span>服务条款</span>
            </button>
            <button
              onClick={() => setActiveTab("privacy")}
              className={`flex-1 py-3 font-title text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 ${
                activeTab === "privacy"
                  ? "bg-white text-[#2b6c00] border-2 border-[#58cc02] shadow-sm scale-[1.02]"
                  : "text-[#3f4a36] hover:bg-white/50"
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>隐私政策</span>
            </button>
          </div>

          {/* Scrollable Document Content */}
          <div className="p-6 overflow-y-auto space-y-6 flex-grow select-text selection:bg-[#d7ffb8]">
            {activeTab === "privacy" ? (
              // Privacy Policy Template
              <div className="space-y-5 text-[#3f4a36]">
                <div className="text-right text-[10px] font-bold text-[#3f4a36]/60">
                  版本更新日期：2026年07月03日
                  <br />
                  生效日期：2026年07月03日
                </div>

                <div className="bg-[#f7f9fc] p-4 rounded-xl border-2 border-[#d8dadd] flex gap-2.5 items-start">
                  <Info className="w-4.5 h-4.5 text-[#2b6c00] shrink-0 mt-0.5" />
                  <p className="text-xs leading-relaxed font-semibold">
                    提示：我们非常重视您的个人信息及隐私权。本隐私政策旨在向您清晰地介绍在您使用 EduQuest AI 平台时，我们如何收集、使用、存储和分享您的个人信息，以及您所享有的管理这些信息的权利。
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-title text-sm font-black text-[#191c1e] flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-[#58cc02] rounded-full"></span>
                    一、我们收集哪些信息
                  </h4>
                  <p className="text-xs leading-relaxed">
                    为了向您提供基本服务以及改善您的个性化学习体验，我们可能会收集以下类型的信息：
                  </p>
                  <ul className="list-disc pl-5 text-xs space-y-1 leading-relaxed">
                    <li><strong className="text-[#191c1e]">账户信息：</strong> 在您使用手机号登录时，我们会收集您的手机号码以便为您创建学者账户并验证身份。</li>
                    <li><strong className="text-[#191c1e]">个人资料及属性：</strong> 您可以自愿设置学者名字、头像文本/Emoji、获得的勋爵称号等。</li>
                    <li><strong className="text-[#191c1e]">学习记录与统计：</strong> 我们会保存您的日常经验值 (XP)、学习天数、学习火花状态 (Streak) 以及学习关卡解锁进度，以便为您展示个人的学者成就。</li>
                    <li><strong className="text-[#191c1e]">错题记录：</strong> 我们的 AI 引擎会自动提炼和收集您在对话中理解存在偏差的难点、疑问并收录在“深度错题本”中，以便您巩固提高。</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-title text-sm font-black text-[#191c1e] flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-[#58cc02] rounded-full"></span>
                    二、我们如何使用收集到的信息
                  </h4>
                  <ul className="list-disc pl-5 text-xs space-y-1 leading-relaxed">
                    <li>提供、维护、改进和个性化我们的游戏化学习服务与 AI 导师对话。</li>
                    <li>评估并优化 AI 导师的讲解风格（如苏格拉底提问、趣味比喻讲解等），满足您的个性化认知需求。</li>
                    <li>进行匿名或汇总性质的数据分析，以便研究不同学者群体的学习效率和互动模式，改进整体教学算法。</li>
                    <li>通过系统通知向您提供学术周报、错题提醒或达成成就的通知。</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-title text-sm font-black text-[#191c1e] flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-[#58cc02] rounded-full"></span>
                    三、信息安全与存储
                  </h4>
                  <p className="text-xs leading-relaxed">
                    我们采用行业通用的技术手段和严格的安全防护措施来保护您的个人信息，防止信息遭到未经授权的访问、公开披露、使用、修改、损坏或丢失。我们会在提供服务所需的合理期限内保留您的个人信息。
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-title text-sm font-black text-[#191c1e] flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-[#58cc02] rounded-full"></span>
                    四、您的权利与管理
                  </h4>
                  <p className="text-xs leading-relaxed">
                    您有权随时访问、更正或删除您的账户信息。您可以在“设置”面板中轻松修改个人学者名字、头像配色和称号。如需彻底注销个人账户或清空全部学习历史，您可以通过本政策下方列出的联系方式与我们的客服取得联系。
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-title text-sm font-black text-[#191c1e] flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-[#58cc02] rounded-full"></span>
                    五、联系与意见反馈
                  </h4>
                  <p className="text-xs leading-relaxed">
                    如果您对本隐私政策有任何疑问、意见、建议或需要客服支持，请随时与我们取得联系。
                    <br />
                    官方学术运营与客服QQ：<strong className="text-[#e65100] font-mono">2961286707</strong>
                  </p>
                </div>
              </div>
            ) : (
              // Terms of Service Template
              <div className="space-y-5 text-[#3f4a36]">
                <div className="text-right text-[10px] font-bold text-[#3f4a36]/60">
                  版本更新日期：2026年07月03日
                  <br />
                  生效日期：2026年07月03日
                </div>

                <div className="bg-[#f7f9fc] p-4 rounded-xl border-2 border-[#d8dadd] flex gap-2.5 items-start">
                  <Info className="w-4.5 h-4.5 text-[#2b6c00] shrink-0 mt-0.5" />
                  <p className="text-xs leading-relaxed font-semibold">
                    请您仔细阅读本《用户服务条款》（尤其是加粗提示部分）。当您按照注册或登录页面提示填写信息、同意本服务条款或通过手机号登录后，即表示您已充分阅读并完全接受本条款的全部内容。
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-title text-sm font-black text-[#191c1e] flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-[#ff9c27] rounded-full"></span>
                    一、服务范围与使用规范
                  </h4>
                  <p className="text-xs leading-relaxed">
                    EduQuest AI 是一款集成先进人工智能对话模型的科学自学与概念掌握应用。用户可以使用手机号码登录并保存其个人成长数据。
                  </p>
                  <ul className="list-disc pl-5 text-xs space-y-1 leading-relaxed">
                    <li>用户应当为自己注册账户下的一切行为承担完全的责任。</li>
                    <li><strong className="text-[#191c1e]">学术诚实守信：</strong> 用户不得使用外部自动化工具在对话大厅中进行非正常的刷 XP、恶意攻击接口或破坏游戏化成就平衡的行为。</li>
                    <li>不得传输任何违法、反动、色情、谩骂、政治不当、侵犯他人版权或有损社会公德的信息及学术内容。</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-title text-sm font-black text-[#191c1e] flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-[#ff9c27] rounded-full"></span>
                    二、知识产权与内容所有权
                  </h4>
                  <p className="text-xs leading-relaxed">
                    1. 平台中所有 AI 导师形象、交互逻辑、学术徽章插画、背景美术设计、UI 元素以及底层自适应算法，均属于 EduQuest AI 所有。未经事先书面许可，用户不得私自克隆、反编译、爬取或商用。
                    <br />
                    2. 平台中的对话生成内容由 AI 导师和用户共同构建，仅作为学习、教辅及科学探索探讨之用，不具有任何正式的法律、金融、医学诊断或特定科学发明的正式证明效力。
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-title text-sm font-black text-[#191c1e] flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-[#ff9c27] rounded-full"></span>
                    三、免责声明
                  </h4>
                  <p className="text-xs leading-relaxed">
                    由于人工智能算法固有的幻觉特征，AI 导师生成的学术讲解、代码逻辑或计算结果可能存在不准确或失真的情况。用户在关键学术考试或专业研究中应对生成的答案自行核对。平台不承担因使用 AI 生成建议而导致的任何直接或间接的成绩损失或专业损失。
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-title text-sm font-black text-[#191c1e] flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-[#ff9c27] rounded-full"></span>
                    四、服务的中断和终止
                  </h4>
                  <p className="text-xs leading-relaxed">
                    我们保留随时根据系统迭代维护或政策调整，而中断、变更或终止部分或全部服务的权利。若用户存在违反学术诚信、发表不正当言论等违规操作，我们有权限制、冻结甚至注销其学者账户。
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-title text-sm font-black text-[#191c1e] flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-[#ff9c27] rounded-full"></span>
                    五、条款更新与客服联系
                  </h4>
                  <p className="text-xs leading-relaxed">
                    我们可能会根据产品改进不时对本服务条款进行更新。更新后的服务条款一经在平台发布即代替原有条款。若您继续使用本应用，即视为您接受修改后的服务条款。
                    <br />
                    如对本条款存在疑问，请联系我们的官方客服 QQ：<strong className="text-[#e65100] font-mono">2961286707</strong>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer Close Button */}
          <div className="p-5 border-t-2 border-[#e0e3e6] bg-white flex shrink-0">
            <button
              onClick={onClose}
              className="btn-chunky w-full py-3 px-4 rounded-xl bg-[#2b6c00] text-white border-b-4 border-[#1b4600] hover:bg-[#3f9e00] font-title font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3.5px]" />
              <span>我已经阅读并同意</span>
            </button>
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
}
