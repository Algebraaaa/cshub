// 公式审计：扫描全部 10 章课程数据里的 $$/$ 公式，用 KaTeX 严格解析找出渲染失败项
import katex from 'katex'
import { NLP_LESSONS } from '../src/data/ai/chapters/nlp.js'
import { CV_LESSONS } from '../src/data/ai/chapters/cv.js'
import { RL_LESSONS } from '../src/data/ai/chapters/rl.js'
import { LLM_LESSONS } from '../src/data/ai/chapters/llm.js'
import { OPTIM_LESSONS } from '../src/data/ai/chapters/optim.js'
import { ML_LESSONS } from '../src/data/ai/chapters/ml.js'
import { DL_LESSONS } from '../src/data/ai/chapters/dl.js'
import { OR_LESSONS } from '../src/data/ai/chapters/or.js'
import { FEATURE_LESSONS } from '../src/data/ai/chapters/feature.js'
import { INFO_THEORY_LESSONS } from '../src/data/ai/chapters/it.js'

const groups = {
  nlp: NLP_LESSONS, cv: CV_LESSONS, rl: RL_LESSONS, llm: LLM_LESSONS,
  optim: OPTIM_LESSONS, ml: ML_LESSONS, dl: DL_LESSONS, or: OR_LESSONS,
  feature: FEATURE_LESSONS, it: INFO_THEORY_LESSONS,
}
let bad = 0

for (const [name, lessons] of Object.entries(groups)) {
  for (const lesson of lessons) {
    const theory = lesson.theory || ''
    const formulas = []
    for (const m of theory.matchAll(/\$\$([\s\S]+?)\$\$/g)) formulas.push({ tex: m[1], mode: 'block' })
    const noBlocks = theory.replace(/\$\$[\s\S]+?\$\$/g, '')
    for (const m of noBlocks.matchAll(/\$([^$\n]+?)\$/g)) formulas.push({ tex: m[1], mode: 'inline' })

    for (const f of formulas) {
      try {
        katex.renderToString(f.tex, { displayMode: f.mode === 'block', throwOnError: true, strict: false })
      } catch (err) {
        bad++
        console.log(`[${name}] ${lesson.id} (${f.mode}):`)
        console.log(`  TEX: ${f.tex.slice(0, 120)}`)
        console.log(`  ERR: ${String(err.message).slice(0, 160)}`)
      }
    }
  }
}
console.log(bad === 0 ? 'ALL FORMULAS OK' : `${bad} broken formulas found`)
