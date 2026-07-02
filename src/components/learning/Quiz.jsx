import { useEffect, useState } from 'react'
import { useProgressActions } from '../../contexts/ProgressContext'
import { saveWrongForSlug } from '../profile/WrongAnswers'

export default function Quiz({ questions, slug }) {
  // 只写不读:useProgressActions 引用稳定,收藏/完成等进度变化不再重渲染本组件
  const { recordQuiz } = useProgressActions()
  const [answers, setAnswers] = useState({})   // index → chosen option index
  const [revealed, setRevealed] = useState({}) // index → bool
  const [allDone, setAllDone] = useState(false)

  // Persist score + wrong question indices once when the whole quiz is done.
  useEffect(() => {
    if (!allDone || !slug || !questions) return
    const correct = questions.filter((q, i) => answers[i] === q.answer).length
    recordQuiz(slug, correct, questions.length)
    const wrongIndices = questions
      .map((q, i) => (answers[i] !== q.answer ? i : -1))
      .filter(i => i !== -1)
    saveWrongForSlug(slug, wrongIndices)
  }, [allDone, slug, questions, answers, recordQuiz])

  if (!questions || questions.length === 0) return null

  const handlePick = (qi, oi) => {
    if (revealed[qi]) return
    setAnswers(a => ({ ...a, [qi]: oi }))
  }

  const handleCheck = (qi) => {
    if (answers[qi] === undefined) return
    setRevealed(r => ({ ...r, [qi]: true }))
    const newRevealed = { ...revealed, [qi]: true }
    if (Object.keys(newRevealed).length === questions.length) setAllDone(true)
  }

  const handleReset = () => {
    setAnswers({})
    setRevealed({})
    setAllDone(false)
  }

  const score = allDone
    ? questions.filter((q, i) => answers[i] === q.answer).length
    : null

  const doneCount = Object.keys(revealed).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 进度条 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ flex: 1, height: 4, borderRadius: 99, background: 'var(--surface-2)' }}>
          <div style={{
            height: '100%', borderRadius: 99,
            background: 'linear-gradient(90deg, var(--accent), #ec4899)',
            width: `${(doneCount / questions.length) * 100}%`,
            transition: 'width 0.4s ease',
          }} />
        </div>
        <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
          {doneCount} / {questions.length}
        </span>
      </div>

      {questions.map((q, qi) => {
        const chosen = answers[qi]
        const isRevealed = revealed[qi]
        const correct = q.answer

        return (
          <div key={qi} role="group" aria-labelledby={`quiz-q-${qi}`} style={{
            padding: '18px 20px',
            background: 'var(--bg-elev)',
            border: `1px solid ${isRevealed
              ? (chosen === correct ? 'var(--green)' : 'var(--red)')
              : 'var(--border)'}`,
            borderRadius: 10,
            transition: 'border-color 0.2s',
          }}>
            <div id={`quiz-q-${qi}`} style={{
              fontSize: 13, fontWeight: 600, marginBottom: 14,
              color: 'var(--text-primary)', lineHeight: 1.5,
              display: 'flex', gap: 10,
            }}>
              <span aria-hidden="true" style={{
                flexShrink: 0, width: 22, height: 22,
                background: 'var(--accent-soft)', color: 'var(--accent-light)',
                borderRadius: 5, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 11, fontWeight: 700,
              }}>
                {qi + 1}
              </span>
              <span><span style={srOnly}>第 {qi + 1} 题：</span>{q.q}</span>
            </div>

            <div role="radiogroup" aria-labelledby={`quiz-q-${qi}`} style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
              {q.options.map((opt, oi) => {
                let bg = 'var(--surface)'
                let border = 'var(--border)'
                let color = 'var(--text-secondary)'
                let icon = null

                if (isRevealed) {
                  if (oi === correct) {
                    bg = 'var(--green-soft)'; border = 'var(--green)'; color = 'var(--green)'
                    icon = '✓'
                  } else if (oi === chosen && chosen !== correct) {
                    bg = 'var(--red-soft)'; border = 'var(--red)'; color = 'var(--red)'
                    icon = '✗'
                  } else {
                    color = 'var(--text-tertiary)'
                  }
                } else if (oi === chosen) {
                  bg = 'var(--accent-soft)'; border = 'var(--accent)'; color = 'var(--accent-light)'
                }

                return (
                  <button key={oi} onClick={() => handlePick(qi, oi)}
                    disabled={isRevealed}
                    role="radio"
                    aria-checked={oi === chosen}
                    aria-label={`选项 ${String.fromCharCode(65 + oi)}：${opt}${isRevealed && oi === correct ? '（正确答案）' : ''}${isRevealed && oi === chosen && chosen !== correct ? '（你的选择，错误）' : ''}`}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '9px 12px',
                      background: bg,
                      border: `1px solid ${border}`,
                      borderRadius: 6,
                      fontSize: 12.5,
                      color,
                      textAlign: 'left',
                      cursor: isRevealed ? 'default' : 'pointer',
                      transition: 'all 0.15s',
                      opacity: isRevealed && oi !== correct && oi !== chosen ? 0.5 : 1,
                    }}>
                    <span style={{
                      flexShrink: 0, width: 20, height: 20, borderRadius: 4,
                      background: oi === chosen || (isRevealed && oi === correct)
                        ? border : 'var(--surface-2)',
                      border: `1px solid ${oi === chosen ? border : 'var(--border)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 700, color: oi === chosen || (isRevealed && oi === correct) ? 'white' : 'transparent',
                    }}>
                      {icon || (oi === chosen ? '●' : '')}
                    </span>
                    <span style={{ flex: 1 }}>{opt}</span>
                  </button>
                )
              })}
            </div>

            {!isRevealed ? (
              <button onClick={() => handleCheck(qi)}
                disabled={chosen === undefined}
                style={{
                  fontSize: 12, fontWeight: 600,
                  padding: '6px 14px',
                  borderRadius: 5,
                  background: chosen !== undefined ? 'var(--accent)' : 'var(--surface-2)',
                  color: chosen !== undefined ? 'white' : 'var(--text-tertiary)',
                  border: 'none',
                  transition: 'all 0.15s',
                }}>
                确认答案
              </button>
            ) : (
              <div role="status" aria-live="polite" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{
                  fontSize: 12.5, fontWeight: 500,
                  color: chosen === correct ? 'var(--green)' : 'var(--red)',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  {chosen === correct ? '✓ 回答正确！' : `✗ 正确答案是：${q.options[correct]}`}
                </div>
                {chosen !== correct && q.explanation && (
                  <div style={{
                    fontSize: 12, color: 'var(--text-secondary)',
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: 6, padding: '8px 10px', lineHeight: 1.6,
                  }}>
                    💡 {q.explanation}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}

      {allDone && (
        <div role="status" aria-live="polite" style={{
          padding: '16px 20px',
          background: score === questions.length ? 'var(--green-soft)' : 'var(--accent-soft)',
          border: `1px solid ${score === questions.length ? 'var(--green)' : 'var(--accent-border)'}`,
          borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 12,
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>
              {score === questions.length ? '全部答对！🎉' : `答对 ${score} / ${questions.length}`}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              {score === questions.length
                ? '你已掌握这个算法的核心知识点。'
                : '建议再复习一遍算法原理后重新挑战。'}
            </div>
          </div>
          <button onClick={handleReset} style={{
            fontSize: 12, fontWeight: 600,
            padding: '7px 16px',
            borderRadius: 6,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
          }}>重新答题</button>
        </div>
      )}
    </div>
  )
}

const srOnly = {
  position: 'absolute',
  width: 1, height: 1, padding: 0,
  margin: -1, overflow: 'hidden',
  clip: 'rect(0,0,0,0)',
  whiteSpace: 'nowrap',
  border: 0,
}
