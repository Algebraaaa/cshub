import PageHeader from '../features/ielts/components/PageHeader.jsx'
import SettingsPanel from '../features/ielts/components/SettingsPanel.jsx'

export default function IeltsSettingsPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-20">
      <PageHeader title="雅思设置与数据" desc="目标分、反馈严格度、自带 key 的模型配置；数据只存本地，可随时导出或清空。" />
      <SettingsPanel />
    </div>
  )
}
