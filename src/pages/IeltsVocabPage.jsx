import PageHeader from '../features/ielts/components/PageHeader.jsx'
import VocabLibrary from '../features/ielts/components/VocabLibrary.jsx'

export default function IeltsVocabPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-20">
      <PageHeader title="词块库" desc="Task 1/Task 2 表达、阅读同义替换、听力信号词，支持搜索、收藏、自定义与导入。" />
      <VocabLibrary />
    </div>
  )
}
