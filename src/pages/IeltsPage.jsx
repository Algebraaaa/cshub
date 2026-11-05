import PageHeader from '../features/ielts/components/PageHeader.jsx'
import IeltsDashboard from '../features/ielts/components/IeltsDashboard.jsx'

export default function IeltsPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-20">
      <PageHeader title="雅思复盘与刻意练习" desc="做完题之后的事：查错、讲解、归因、长期积累弱点画像。" />
      <IeltsDashboard />
    </div>
  )
}
