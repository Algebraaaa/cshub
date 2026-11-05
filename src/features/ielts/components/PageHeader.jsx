import IeltsNav from './IeltsNav.jsx'

export default function PageHeader({ title, desc, children }) {
  return (
    <div className="mx-auto w-full max-w-5xl px-1 pb-4 pt-6">
      <IeltsNav />
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-fg">{title}</h1>
          {desc ? <p className="mt-1 max-w-2xl text-sm text-fg-muted">{desc}</p> : null}
        </div>
        {children}
      </div>
    </div>
  )
}
