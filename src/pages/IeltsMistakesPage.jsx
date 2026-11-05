import PageHeader from '../features/ielts/components/PageHeader.jsx'
import MistakesDashboard from '../features/ielts/components/MistakesDashboard.jsx'

export default function IeltsMistakesPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-20">
      <PageHeader title="错题库与弱点画像" desc="阅读与听力的每道错题：规则判定或模型建议的错因、定位句、讲解摘要与你的反思。" />
      <MistakesDashboard />
    </div>
  )
}
