// 把提取出的示例代码真正编译/运行，并与 JS 生成器结果比对。
//
// 可执行片段（OS 的置换/磁盘/调度/银行家）：注入最小 main/driver，g++ 编译、
// python3 运行，输出必须与对应 src/algorithms/*.js 生成器一致。
// 标注为“简化/伪代码/节选/框架”的片段是教学节选（依赖页面外的类型定义），
// 不做独立运行，状态如实记为 teaching-fragment。
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { fifo } from '../../src/algorithms/pageReplacement/fifo.js'
import { lru } from '../../src/algorithms/pageReplacement/lru.js'
import { opt } from '../../src/algorithms/pageReplacement/opt.js'
import { fcfs as dFcfs } from '../../src/algorithms/disk/fcfs.js'
import { sstf } from '../../src/algorithms/disk/sstf.js'
import { scan } from '../../src/algorithms/disk/scan.js'
import { cpuSchedule } from '../../src/algorithms/cpuScheduling/nonPreemptive.js'
import { cpuRoundRobin } from '../../src/algorithms/cpuScheduling/roundRobin.js'
import { bankersAlgorithm } from '../../src/algorithms/synchronization/bankers.js'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..', '..')
const work = join(here, '.work', 'run')
rmSync(work, { recursive: true, force: true })
mkdirSync(work, { recursive: true })

const manifest = JSON.parse(readFileSync(join(here, '.work', 'snippets.json'), 'utf8'))

const CLASSIC = [7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2, 1, 2, 0, 1, 7, 0, 1]
const DISK = [55, 58, 39, 18, 90, 160, 150, 38, 184]
const PROCS = [
  { id: 'P1', arrival: 0, burst: 6 }, { id: 'P2', arrival: 1, burst: 3 },
  { id: 'P3', arrival: 2, burst: 8 }, { id: 'P4', arrival: 3, burst: 2 },
  { id: 'P5', arrival: 4, burst: 5 },
]
const faultCount = (steps) => steps.filter((s) => s.fault).length

function jsExpected(slug) {
  switch (slug) {
    case 'fifo': return `answer=${faultCount(fifo(CLASSIC, 3))}`
    case 'lru': return `answer=${faultCount(lru(CLASSIC, 3))}`
    case 'opt': return `answer=${faultCount(opt(CLASSIC, 3))}`
    case 'diskfcfs': return `answer=${dFcfs(DISK, 100).at(-1).totalSeek}`
    case 'sstf': return `answer=${sstf(DISK, 100).at(-1).totalSeek}`
    case 'scan': return `answer=${scan(DISK, 100, 200, 'up').at(-1).totalSeek}`
    case 'cpufcfs':
    case 'cpusjf':
    case 'cpusrtn': {
      const algo = { cpufcfs: 'fcfs', cpusjf: 'sjf', cpusrtn: 'srtn' }[slug]
      const stats = cpuSchedule({ algo, processList: PROCS }).at(-1).stats
      return 'finish=' + PROCS.map((p) => stats.find((s) => s.id === p.id).finish).join(',')
    }
    case 'cpurr': {
      const stats = cpuRoundRobin({ processList: PROCS, quantum: 3 }).at(-1).stats
      return 'finish=' + PROCS.map((p) => stats.find((s) => s.id === p.id).finish).join(',')
    }
    case 'bankers': {
      const safe = bankersAlgorithm().find((s) => s.phase === 'safe')
      return `answer=1\nseq=${safe.safeSequence.map((x) => x.slice(1)).join(',')}`
    }
    default: return null
  }
}

const VECTOR = `vector<int> p={${CLASSIC.join(',')}};`
const DISK_V = `vector<int> d={${DISK.join(',')}};`
const PROC_V = `vector<Proc> ps={{1,0,6,0},{2,1,3,0},{3,2,8,0},{4,3,2,0},{5,4,5,0}};
    sort(ps.begin(), ps.end(), [](auto&a,auto&b){return a.id<b.id;});`

const CPP_MAIN = {
  fifo: `int main(){ ${VECTOR} cout<<"answer="<<fifo(p,3)<<"\\n"; }`,
  lru: `int main(){ ${VECTOR} cout<<"answer="<<lru(p,3)<<"\\n"; }`,
  opt: `int main(){ ${VECTOR} cout<<"answer="<<opt(p,3)<<"\\n"; }`,
  diskfcfs: `int main(){ ${DISK_V} cout<<"answer="<<fcfs(d,100)<<"\\n"; }`,
  sstf: `int main(){ ${DISK_V} cout<<"answer="<<sstf(d,100)<<"\\n"; }`,
  scan: `int main(){ ${DISK_V} cout<<"answer="<<scan(d,100,200,"up")<<"\\n"; }`,
  cpufcfs: `int main(){ ${PROC_V} vector<Proc> w={{1,0,6,0},{2,1,3,0},{3,2,8,0},{4,3,2,0},{5,4,5,0}}; fcfs(w);
    for(auto&p:ps) for(auto&q:w) if(q.id==p.id) p.finish=q.finish;
    cout<<"finish="; for(auto&p:ps) cout<<p.finish<<","; cout<<"\\n"; }`,
  cpusjf: `int main(){ ${PROC_V} vector<Proc> w={{1,0,6,0},{2,1,3,0},{3,2,8,0},{4,3,2,0},{5,4,5,0}}; sjf(w);
    for(auto&p:ps) for(auto&q:w) if(q.id==p.id) p.finish=q.finish;
    cout<<"finish="; for(auto&p:ps) cout<<p.finish<<","; cout<<"\\n"; }`,
  cpusrtn: `int main(){ ${PROC_V} vector<Proc> w={{1,0,6,0},{2,1,3,0},{3,2,8,0},{4,3,2,0},{5,4,5,0}}; srtn(w);
    for(auto&p:ps) for(auto&q:w) if(q.id==p.id) p.finish=q.finish;
    cout<<"finish="; for(auto&p:ps) cout<<p.finish<<","; cout<<"\\n"; }`,
  cpurr: `int main(){ ${PROC_V} vector<Proc> w={{1,0,6,0},{2,1,3,0},{3,2,8,0},{4,3,2,0},{5,4,5,0}}; roundRobin(w,3);
    for(auto&p:ps) for(auto&q:w) if(q.id==p.id) p.finish=q.finish;
    cout<<"finish="; for(auto&p:ps) cout<<p.finish<<","; cout<<"\\n"; }`,
  bankers: `int main(){
    vector<int> avail={3,3,2};
    vector<vector<int>> mx={{7,5,3},{3,2,2},{9,0,2},{2,2,2},{4,3,3}};
    vector<vector<int>> al={{0,1,0},{2,0,0},{3,0,2},{2,1,1},{0,0,2}};
    vector<int> seq; cout<<"answer="<<isSafe(avail,mx,al,seq)<<"\\n";
    cout<<"seq="; for(int x:seq) cout<<x<<","; cout<<"\\n"; }`,
}

const PY_LIST = `[${CLASSIC.join(',')}]`
const PY_DISK = `[${DISK.join(',')}]`
const PY_PROCS = `[{'id':1,'arrival':0,'burst':6},{'id':2,'arrival':1,'burst':3},{'id':3,'arrival':2,'burst':8},{'id':4,'arrival':3,'burst':2},{'id':5,'arrival':4,'burst':5}]`

const PY_MAIN = {
  fifo: `print('answer=' + str(fifo(${PY_LIST}, 3)))`,
  lru: `print('answer=' + str(lru(${PY_LIST}, 3)))`,
  opt: `print('answer=' + str(opt(${PY_LIST}, 3)))`,
  diskfcfs: `print('answer=' + str(fcfs(${PY_DISK}, 100)['totalSeek']))`,
  sstf: `print('answer=' + str(sstf(${PY_DISK}, 100)['totalSeek']))`,
  scan: `print('answer=' + str(scan(${PY_DISK}, 100, 200, 'up')['totalSeek']))`,
  cpufcfs: `
procs = ${PY_PROCS}
r = fcfs(procs)
r.sort(key=lambda p: p['id'])
print('finish=' + ','.join(str(p['finish']) for p in r))`,
  cpusjf: `
procs = ${PY_PROCS}
sjf(procs)
procs.sort(key=lambda p: p['id'])
print('finish=' + ','.join(str(p['finish']) for p in procs))`,
  cpusrtn: `
procs = ${PY_PROCS}
srtn(procs)
procs.sort(key=lambda p: p['id'])
print('finish=' + ','.join(str(p['finish']) for p in procs))`,
  cpurr: `
procs = ${PY_PROCS}
round_robin(procs, 3)
procs.sort(key=lambda p: p['id'])
print('finish=' + ','.join(str(p['finish']) for p in procs))`,
  bankers: `
avail=[3,3,2]
mx=[[7,5,3],[3,2,2],[9,0,2],[2,2,2],[4,3,3]]
al=[[0,1,0],[2,0,0],[3,0,2],[2,1,1],[0,0,2]]
ok, seq = is_safe(avail, mx, al)
print('answer=' + ('1' if ok else '0'))
print('seq=' + ','.join(map(str, seq)))`,
}

// 检查 Python 磁盘片段返回值形态（int 还是 dict）
function pyDiskWrap(fn) {
  return `_v = ${fn}; print('answer=' + str(_v if isinstance(_v, int) else _v['totalSeek']))`
}

const FRAGMENT_MARKERS = ['简化', '伪代码', '节选', '框架', '教学', 'Linux 内核', 'Volcano', '概念', '思路']

function run(cmd, args, opts = {}) {
  try {
    const out = execFileSync(cmd, args, { encoding: 'utf8', timeout: 30000, ...opts })
    return { ok: true, stdout: out.trim() }
  } catch (e) {
    return { ok: false, stdout: (e.stdout || '').trim(), stderr: (e.stderr || e.message).split('\n').slice(0, 4).join('\n') }
  }
}

const norm = (s) => String(s || '').split('\n').map((l) => l.replace(/,\s*$/, '')).join('\n').trim()
const same = (a, b) => norm(a) === norm(b)
const results = []
let failures = 0

for (const item of manifest) {
  const expected = jsExpected(item.slug)
  const record = { file: item.file, slug: item.slug, status: null, expected, cpp: null, python: null }

  if (expected && CPP_MAIN[item.slug] && item.slug !== 'philosophers') {
    // ── C++ 编译运行 ──
    const cppPath = join(work, `${item.file}-${item.slug}.cpp`)
    const binPath = join(work, `${item.file}-${item.slug}`)
    const needProc = ['cpusjf', 'cpusrtn', 'cpurr'].includes(item.slug)
    const procStruct = needProc ? 'struct Proc { int id, arrival, burst, finish; };\n' : ''
    writeFileSync(cppPath, `#include <bits/stdc++.h>\nusing namespace std;\n${procStruct}${item.cpp}\n${CPP_MAIN[item.slug]}\n`)
    const cc = run('g++', ['-std=c++17', '-O0', cppPath, '-o', binPath])
    if (!cc.ok) {
      record.cpp = { status: 'compile-error', detail: cc.stderr }
    } else {
      const r = run(binPath, [])
      record.cpp = { status: r.ok && same(r.stdout, expected) ? 'match' : 'mismatch', got: r.stdout, detail: r.stderr }
    }

    // ── Python 运行（磁盘片段统一取值包装）──
    const pyPath = join(work, `${item.file}-${item.slug}.py`)
    let driver = PY_MAIN[item.slug]
    if (['diskfcfs', 'sstf', 'scan'].includes(item.slug)) {
      const fn = { diskfcfs: `fcfs(${PY_DISK}, 100)`, sstf: `sstf(${PY_DISK}, 100)`, scan: `scan(${PY_DISK}, 100, 200, 'up')` }[item.slug]
      driver = pyDiskWrap(fn)
    }
    writeFileSync(pyPath, `${item.python}\n\n${driver}\n`)
    const pr = run('python3', [pyPath])
    record.python = { status: pr.ok && same(pr.stdout, expected) ? 'match' : 'mismatch', got: pr.stdout, detail: pr.stderr }

    record.status = (record.cpp.status === 'match' && record.python.status === 'match') ? 'verified' : 'mismatch'
    if (record.status !== 'verified') failures++
  } else if (item.slug === 'philosophers') {
    // 自带 main 的完整程序：编译/解释能跑通即可（输出含死锁演示）
    const cppPath = join(work, 'philosophers.cpp')
    const binPath = join(work, 'philosophers')
    writeFileSync(cppPath, `#include <bits/stdc++.h>\n${item.cpp}\n`)
    const cc = run('g++', ['-std=c++17', '-pthread', cppPath, '-o', binPath])
    // C++ 示例按设计是 while(true) 的常驻并发演示：编译通过、能启动并不立即崩溃即通过，
    // 运行 3 秒后由超时回收（signal=SIGTERM 视为 long-running 正常）。
    let cr = cc.ok ? run(binPath, [], { timeout: 3000 }) : { ok: false }
    const cppRuns = cc.ok && (cr.ok || /ETIMEDOUT|timed out|SIGTERM/.test(cr.stderr || ''))
    const pyPath = join(work, 'philosophers.py')
    writeFileSync(pyPath, item.python)
    const pr = run('python3', [pyPath], { timeout: 5000 })
    const pyRuns = pr.ok || /ETIMEDOUT|timed out|SIGTERM/.test(pr.stderr || '')
    record.cpp = { status: cppRuns ? 'runs' : 'fail' }
    record.python = { status: pyRuns ? 'runs' : 'fail' }
    record.status = cppRuns && pyRuns ? 'runs' : 'mismatch'
    if (!cppRuns || !pyRuns) failures++
  } else {
    // 教学节选：记录其自述标记，不做独立编译
    const head = (item.cpp.split('\n').find((l) => l.trim()) || '').trim()
    const isFragment = FRAGMENT_MARKERS.some((w) => head.includes(w) || item.cpp.includes('伪代码'))
    record.status = 'teaching-fragment'
    record.cpp = { status: 'teaching-fragment', note: head }
    record.python = { status: 'teaching-fragment' }
    if (!isFragment) record.note = '片段依赖页面外类型/环境，未配独立 driver（见 COURSE_AUDIT）'
  }
  results.push(record)
}

writeFileSync(join(here, '.work', 'results.json'), JSON.stringify(results, null, 2))
const groups = {}
for (const r of results) groups[r.status] = (groups[r.status] || 0) + 1
console.log('[run-snippets]', JSON.stringify(groups))
if (failures) {
  for (const r of results.filter((x) => x.status === 'mismatch')) {
    console.error(`MISMATCH ${r.file}/${r.slug}\n  expected: ${JSON.stringify(r.expected)}\n  cpp(${r.cpp.status}): ${r.cpp.got || r.cpp.detail}\n  py(${r.python.status}): ${r.python.got || r.python.detail}`)
  }
  process.exit(1)
}
