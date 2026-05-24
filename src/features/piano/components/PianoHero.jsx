export default function PianoHero() {
  return (
    <header className="relative px-6 pt-16 pb-12 text-center">
      <span className="absolute left-[8%] top-[18%] text-4xl text-[#f5c842] animate-pulse">✦</span>
      <span className="absolute right-[10%] top-[22%] text-3xl text-[#f28b8b]">♥</span>
      <span className="absolute left-[20%] bottom-[10%] text-2xl text-[#f5c842]">✧</span>
      <span className="absolute right-[18%] bottom-[20%] text-2xl text-[#f28b8b]">♡</span>

      <div className="inline-block rounded-full border-2 border-dashed border-[#e8a4a4] bg-white/60 px-6 py-1.5 mb-6 text-sm font-extrabold tracking-[0.12em] text-[#e87c7c]">
        PIANO · PRACTICE ROOM
      </div>

      <h1
        className="text-[clamp(44px,7.5vw,82px)] font-black leading-tight text-[#3d2a2a]"
        style={{ fontFamily: "'ZCOOL KuaiLe','Nunito','PingFang SC','Microsoft YaHei',sans-serif" }}
      >
        <span className="text-[#e86c5d]">弹一首</span>
        给自己听吧
      </h1>

      <div className="flex justify-center items-center gap-3 mt-3">
        <svg viewBox="0 0 600 24" className="w-[min(540px,70vw)] h-6">
          <path d="M10 12 Q150 4 300 12 Q450 20 590 12" stroke="#f5a5a5" strokeWidth="6" strokeLinecap="round" fill="none" />
        </svg>
        <span className="text-2xl text-[#e86c5d] animate-pulse">♥</span>
      </div>

      <p className="mt-6 max-w-xl mx-auto text-[#9e7f7f] font-semibold leading-relaxed">
        从最简单的童谣开始，慢慢拼出能让你心跳的旋律。
        <br />
        <span className="text-sm">不需要成为大师，只需要每天 10 分钟。</span>
      </p>
    </header>
  )
}
