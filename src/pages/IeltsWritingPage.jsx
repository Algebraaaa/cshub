import PageHeader from '../features/ielts/components/PageHeader.jsx'
import WritingTrainer from '../features/ielts/components/WritingTrainer.jsx'

export default function IeltsWritingPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-20">
      <PageHeader title="写作训练" desc="拆成小步骤反复练：反馈先看任务回应与衔接，最多 3 处问题 + 1–2 个可用表达，不代写。" />
      <WritingTrainer />
    </div>
  )
}
