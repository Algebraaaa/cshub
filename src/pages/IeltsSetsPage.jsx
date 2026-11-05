import PageHeader from '../features/ielts/components/PageHeader.jsx'
import FullSetView from '../features/ielts/components/FullSetView.jsx'

export default function IeltsSetsPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-20">
      <PageHeader title="整套复盘报告" desc="同一套题的阅读三篇 / 听力四个 Part：整套用时、各部分正确率、估算分数段趋势，可导出 Markdown 或打印 PDF。" />
      <FullSetView />
    </div>
  )
}
