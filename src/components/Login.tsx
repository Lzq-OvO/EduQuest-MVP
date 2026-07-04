import { useState, useEffect, FormEvent } from "react";
import { Phone, Lock as LockIcon, ArrowRight, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import PrivacyModal from "./PrivacyModal";
import { supabase } from "../lib/supabase";

interface LoginProps {
  onLoginSuccess: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Privacy & Terms Modal state
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [privacyTab, setPrivacyTab] = useState<"privacy" | "terms">("privacy");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("请输入邮箱地址");
      return;
    }
    if (!password) {
      setError("请输入密码");
      return;
    }
    if (password.length < 6) {
      setError("密码至少需要6个字符");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      if (isSignUp) {
        const { error: signUpErr } = await supabase.auth.signUp({ email, password });
        if (signUpErr) {
          setError(signUpErr.message);
          setIsSubmitting(false);
          return;
        }
      } else {
        const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
        if (signInErr) {
          setError(signInErr.message);
          setIsSubmitting(false);
          return;
        }
      }
      onLoginSuccess();
    } catch (err) {
      setError("登录服务暂时不可用，请稍后重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[#f7f9fc] text-[#191c1e] font-sans antialiased overflow-x-hidden">
      {/* Left Side: Hero Area (Hidden on Mobile) */}
      <div className="hidden md:flex md:w-1/2 lg:w-[55%] flex-col justify-center items-center p-12 bg-white relative overflow-hidden border-r-2 border-[#eceef1]">
        {/* Decorative background gradients */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-[#58cc02]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-[#ffb872]/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="z-10 text-center max-w-lg mb-8">
          <h1 className="font-title text-4xl lg:text-5xl font-extrabold text-[#2b6c00] tracking-tight leading-tight mb-4">
            开启你的
            <br />
            <span className="text-[#58cc02]">深度思考</span>
            <br />
            之旅
          </h1>
          <p className="text-lg text-[#3f4a36] leading-relaxed font-medium">
            加入 EduQuest AI，通过引导式、趣味性课程释放你的学习潜力。
          </p>
        </div>

        {/* Hero Illustration (Mascot owl and scientific floating elements) */}
        <div className="relative w-full max-w-lg aspect-[1.79] z-10 flex-shrink-0 animate-float">
          <img
            alt="EduQuest Mascot and Scientific Symbols"
            className="w-full h-full object-contain drop-shadow-2xl select-none"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBMN_BpbZLQB7Af46g3iBRchecEBNF-dmF3DnbvWlc0DZduraX3AoigzODZD4C3n8CV64jCDsDuMFcTi8cbR359nDFjlw9L2SDlKb3RDaAo4M6wDsGF5bLO_j8DzV6s1ibkD5Hp89hhmC6nuceEF9ETZNVH-1AjkER9UxJUIySdBSZzSxSuL10jxovLGfc3YNd4pgi3lzYX-q3RyhCpDUZd9kIASTLF8G1BAzQJbXm3MrJCOTMtVzybGPMCl5Au87iZiPXNkL3tYug"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      {/* Right Side: Login Panel */}
      <div className="w-full md:w-1/2 lg:w-[45%] flex flex-col justify-center items-center p-6 md:p-12 bg-[#f2f4f7] relative">
        <div className="w-full max-w-md bg-white rounded-[24px] border-2 border-[#d8dadd] p-8 md:p-10 shadow-[0_6px_0_0_#d8dadd] relative z-10">
          
          {/* Mobile Header (Visible only on mobile/tablet) */}
          <div className="md:hidden text-center mb-8">
            <div className="flex justify-center items-center gap-3 mb-2">
              <img
                alt="EduQuest Mascot"
                className="w-10 h-10 rounded-full border-2 border-[#d8dadd]"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuByxIKR0yqnjVSb-6Xkzam2KsoQylyg1y5t1FcMTzZFzL4tlQi_tfm4z9J8hqZFXLOi0wBB9h60rHmktkyfbCzv0NSMYc42rhSVCnj1Wx5Pp9xqkoi7Z2qJYUcyyD3l3RB0G5bT0oXQvuWRfk8yo1W403dC16rFUhg7tkAeSjDdf-Xdd-DxlRzV1HxRpp7QR7xkrXfbOIN6B679v3lLaLjyWLWMexI2gFofvkKEJIddXHzCjOnOCfFlSNEd_uopbwyynVkI8ox0SbE"
                referrerPolicy="no-referrer"
              />
              <span className="font-title text-2xl font-black text-[#2b6c00]">EduQuest AI</span>
            </div>
            <p className="text-sm text-[#3f4a36] font-medium">{isSignUp ? "注册一个新账号" : "登录以继续您的学习旅程"}</p>
          </div>

          {/* Desktop Header */}
          <div className="hidden md:block text-center mb-8">
            <h2 className="font-title text-2xl font-bold text-[#191c1e] mb-2">{isSignUp ? "创建学者账号" : "欢迎回来"}</h2>
            <p className="text-sm text-[#3f4a36] font-medium">{isSignUp ? "注册一个新账号开始学习之旅" : "请输入详细信息以继续"}</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email Input */}
            <div>
              <label className="block font-title text-sm font-bold text-[#3f4a36] mb-2" htmlFor="email">
                邮箱地址
              </label>
              <div className="relative flex items-center">
                <Phone className="absolute left-4 w-5 h-5 text-[#d8dadd]" />
                <input
                  className="input-chunky w-full py-4 pl-12 pr-4 text-base font-semibold text-[#191c1e] placeholder:text-[#d8dadd] placeholder:font-medium"
                  id="email"
                  placeholder="your@email.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block font-title text-sm font-bold text-[#3f4a36] mb-2" htmlFor="password">
                密码
              </label>
              <div className="relative flex items-center">
                <LockIcon className="absolute left-4 w-5 h-5 text-[#d8dadd]" />
                <input
                  className="input-chunky w-full py-4 pl-12 pr-4 text-base font-bold text-[#191c1e] placeholder:text-[#d8dadd] placeholder:font-medium"
                  id="password"
                  placeholder="至少6个字符"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 font-semibold text-center">{error}</p>
            )}

            {/* Primary Action Button */}
            <button
              className="btn-chunky w-full bg-[#58cc02] text-white font-title text-lg font-bold py-4 rounded-xl border-b-[4px] border-[#2b6c00] hover:bg-[#6ee026] active:border-b-2 mt-4 flex items-center justify-center gap-2"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="inline-block border-2 border-white border-t-transparent rounded-full w-5 h-5 animate-spin"></span>
              ) : (
                <>
                  <span>{isSignUp ? "注册并进入" : "进入学习大厅"}</span>
                  <ArrowRight className="w-5 h-5 stroke-[3px]" />
                </>
              )}
            </button>
          </form>

          {/* Toggle Sign Up / Sign In */}
          <div className="mt-6 text-center">
            <p className="text-sm text-[#3f4a36] font-medium">
              <span>{isSignUp ? "已有账号？" : "还没有账号？"}</span>{" "}
              <button
                type="button"
                onClick={() => { setIsSignUp(!isSignUp); setError(""); }}
                className="text-[#2b6c00] font-bold hover:underline cursor-pointer"
              >
                {isSignUp ? "立即登录" : "立即注册"}
              </button>
            </p>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center relative z-10">
          <p className="text-sm text-[#3f4a36] font-medium">
            继续操作即表示你同意我们的{" "}
            <a
              className="text-[#2b6c00] font-bold hover:underline cursor-pointer"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setPrivacyTab("terms");
                setIsPrivacyOpen(true);
              }}
            >
              服务条款
            </a>{" "}
            和{" "}
            <a
              className="text-[#2b6c00] font-bold hover:underline cursor-pointer"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setPrivacyTab("privacy");
                setIsPrivacyOpen(true);
              }}
            >
              隐私政策
            </a>
            。
          </p>
        </div>
      </div>

      {/* Privacy & Terms Modal */}
      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
        initialTab={privacyTab}
      />
    </div>
  );
}
