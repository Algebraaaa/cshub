// ─────────────────────────────────────────────────────────────
// IntroSection · 首页第 2 屏「引言」
// 内容由用户后续提供，这里先搭好版式骨架：
//   - 顶部 eyebrow 小标题
//   - 巨型标题「引言」
//   - 一段占位副标题（待替换）
//   - 留白 main content 区给后续注入正文 / 图片 / 卡片
// ─────────────────────────────────────────────────────────────

export default function IntroSection() {
  return (
    <section className="intro-section relative flex h-screen w-full items-center justify-center overflow-hidden px-6 py-12">
      <div className="relative z-10 mx-auto flex max-w-[860px] flex-col items-center text-center">
        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-glass-border bg-surface px-4 py-1.5 text-[12.5px] font-bold text-fg-muted backdrop-blur-xl">
          <span aria-hidden>📖</span>
          <span>Preface · 引言</span>
        </span>

        <h2 className="font-black leading-[0.95] tracking-[-0.04em] text-[52px] sm:text-[72px] md:text-[96px] lg:text-[112px]">
          <span className="block bg-gradient-to-r from-[#38bdf8] via-[#a855f7] to-[#ec4899] bg-clip-text text-transparent">
            写在前面
          </span>
        </h2>

        <p className="mt-7 max-w-[640px] text-[15.5px] font-medium leading-[1.95] text-fg-muted sm:text-[16.5px]">
          <span className="text-fg-faint">（这里的引言内容稍后填入）</span>
        </p>

        {/* 留白：后续在此插入正文、图片、卡片或时间线 */}
        <div className="mt-10 min-h-[80px] w-full" />
      </div>
    </section>
  )
}
