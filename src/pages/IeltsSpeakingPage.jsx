import PageHeader from '../features/ielts/components/PageHeader.jsx'
import SpeakingTrainer from '../features/ielts/components/SpeakingTrainer.jsx'

export default function IeltsSpeakingPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-20">
      <PageHeader title="口语训练" desc="像人和人聊天：先给词块、再给自然示范、只改关键语法；发音仅凭文字无法评估。" />
      <SpeakingTrainer />
    </div>
  )
}
