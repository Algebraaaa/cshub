import PageHeader from '../features/ielts/components/PageHeader.jsx'
import ReviewWorkbench from '../features/ielts/components/ReviewWorkbench.jsx'

export default function IeltsListeningPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-20">
      <PageHeader
        title="听力复盘"
        desc="一个 Part（10 题）为单位：贴入听力文稿、题目、答案册和你的答案，写下当时的反思，逐题定位信号词、改口与干扰信息。"
      />
      <ReviewWorkbench module="listening" />
    </div>
  )
}
