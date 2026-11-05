import PageHeader from '../features/ielts/components/PageHeader.jsx'
import ReviewWorkbench from '../features/ielts/components/ReviewWorkbench.jsx'

export default function IeltsReadingPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-20">
      <PageHeader
        title="阅读复盘"
        desc="做完一篇剑桥真题后，把原文、题目、答案册和你的答案贴进来：先确定性判题，再逐题讲解、归因，错题自动进错题库。"
      />
      <ReviewWorkbench module="reading" />
    </div>
  )
}
