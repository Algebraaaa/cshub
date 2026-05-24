// 自动从 algorithms.js 拆分（12 个算法 · os 学科）
import { bankersAlgorithm } from '../../algorithms/synchronization/bankers'
import { cpuFcfs, cpuSjf, cpuSrtn } from '../../algorithms/cpuScheduling/nonPreemptive'
import { cpuRoundRobin } from '../../algorithms/cpuScheduling/roundRobin'
import { diningPhilosophers } from '../../algorithms/synchronization/philosophers'
import { fcfs as diskFcfs } from '../../algorithms/disk/fcfs'
import { fifo } from '../../algorithms/pageReplacement/fifo'
import { lru } from '../../algorithms/pageReplacement/lru'
import { opt } from '../../algorithms/pageReplacement/opt'
import { scan as diskScan } from '../../algorithms/disk/scan'
import { sstf as diskSstf } from '../../algorithms/disk/sstf'

export const OS_ALGORITHMS = {
  fifo: {
    slug: 'fifo',
    name: '先进先出',
    nameEn: 'FIFO Replacement',
    category: 'pageReplacement',
    difficulty: '基础',
    fn: fifo,
    viz: 'pageReplacement',
    timeComplexity: { best: 'O(1)', average: 'O(1)', worst: 'O(1)' },
    spaceComplexity: 'O(Capacity)',
    description: '淘汰最早进入内存的页面，最简单但可能发生 Belady 异常。',
    intuition: '类似超市排队结账，最早来排队的顾客最先结账离开。在页面置换中，内存就是容量有限的队伍，新页面加入队尾，当队列满时，将队头的页面（最早进来的页面）淘汰即可。它实现非常简单，通常可以用一个队列来维护。',
    pseudocode: `procedure FIFO(pages, capacity):
  frames = empty list
  queue = empty queue
  faults = 0
  
  for page in pages:
    if page not in frames:
      faults = faults + 1
      if length(frames) < capacity:
        frames.append(page)
        queue.enqueue(page)
      else:
        replaced = queue.dequeue()
        replace 'replaced' with 'page' in frames
        queue.enqueue(page)
        
  return faults`,
    code: {
      cpp: `int fifo(vector<int>& pages, int capacity) {
    unordered_set<int> frames;
    queue<int> q;
    int faults = 0;
    
    for (int page : pages) {
        if (frames.find(page) == frames.end()) {
            faults++;
            if (frames.size() == capacity) {
                int replaced = q.front();
                q.pop();
                frames.erase(replaced);
            }
            frames.insert(page);
            q.push(page);
        }
    }
    return faults;
}`,
      python: `def fifo(pages, capacity):
    frames = set()
    queue = []
    faults = 0
    
    for page in pages:
        if page not in frames:
            faults += 1
            if len(frames) == capacity:
                replaced = queue.pop(0)
                frames.remove(replaced)
            frames.add(page)
            queue.append(page)
            
    return faults`,
    },
    applications: [
      '对缺页率要求不高的简单系统',
      '早期操作系统',
      '可以和其他算法结合（如 Second Chance）',
    ],
  },

  lru: {
    slug: 'lru',
    name: '最近最少使用',
    nameEn: 'LRU Replacement',
    category: 'pageReplacement',
    difficulty: '进阶',
    fn: lru,
    viz: 'pageReplacement',
    timeComplexity: { best: 'O(1)', average: 'O(1)', worst: 'O(n)' },
    spaceComplexity: 'O(Capacity)',
    description: '淘汰最久未被使用的页面，基于局部性原理。',
    intuition: '因为程序常常会循环或集中访问某一部分数据（时间局部性），所以如果一个页面很久没有被访问过，那么它在未来被访问的可能性也很小。LRU 每次将最近被访问的页面移到最前面，当缺页时淘汰最后面的页面。它是实际系统中最常用的缓存淘汰策略之一。',
    pseudocode: `procedure LRU(pages, capacity):
  frames = empty list
  RU_list = empty list
  faults = 0
  
  for page in pages:
    if page not in frames:
      faults = faults + 1
      if length(frames) < capacity:
        frames.append(page)
      else:
        replaced = RU_list.first() # least recently used
        replace 'replaced' with 'page' in frames
        RU_list.remove_first()
      RU_list.append(page)
    else:
      RU_list.remove(page)
      RU_list.append(page)
      
  return faults`,
    code: {
      cpp: `int lru(vector<int>& pages, int capacity) {
    list<int> lq; 
    unordered_map<int, list<int>::iterator> m; 
    int faults = 0; 
  
    for (int page : pages) { 
        if (m.find(page) == m.end()) { 
            faults++; 
            if (lq.size() == capacity) { 
                int last = lq.back(); 
                lq.pop_back(); 
                m.erase(last); 
            } 
        } 
        else {
            lq.erase(m[page]); 
        }
        lq.push_front(page); 
        m[page] = lq.begin(); 
    } 
    return faults; 
}`,
      python: `from collections import OrderedDict
def lru(pages, capacity):
    cache = OrderedDict()
    faults = 0
    
    for page in pages:
        if page not in cache:
            faults += 1
            if len(cache) == capacity:
                cache.popitem(last=False)
        else:
            cache.move_to_end(page)
        cache[page] = True
            
    return faults`,
    },
    applications: [
      '现代操作系统内存分页',
      'Redis/Memcached 等数据库缓存',
      'CDN 内容分发网络缓存',
    ],
  },

  opt: {
    slug: 'opt',
    name: '最佳置换',
    nameEn: 'OPT Replacement',
    category: 'pageReplacement',
    difficulty: '进阶',
    fn: opt,
    viz: 'pageReplacement',
    timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
    spaceComplexity: 'O(Capacity)',
    description: '淘汰未来最久不使用的页面，理论最优但无法实现。',
    intuition: '拥有预知未来的能力，通过向后看整个访问序列，找出当前在内存中但在未来最长时间内不会被访问的页面进行淘汰。这能保证绝对的最少缺页率。然而在现实中无法预知程序的未来访问，所以 OPT 算法只被用作理论上的天花板，用于衡量其他算法（如 LRU）的优劣。',
    pseudocode: `procedure OPT(pages, capacity):
  frames = empty list
  faults = 0
  
  for i from 0 to length(pages)-1:
    page = pages[i]
    if page not in frames:
      faults = faults + 1
      if length(frames) < capacity:
        frames.append(page)
      else:
        farthest = -1
        replaced_idx = -1
        for j from 0 to length(frames)-1:
          next_use = find_next_occurrence(pages, i+1, frames[j])
          if next_use == -1:
            replaced_idx = j
            break
          if next_use > farthest:
            farthest = next_use
            replaced_idx = j
        frames[replaced_idx] = page
        
  return faults`,
    code: {
      cpp: `int opt(vector<int>& pages, int capacity) {
    vector<int> frames;
    int faults = 0;
    
    for (int i = 0; i < pages.size(); i++) {
        int page = pages[i];
        if (find(frames.begin(), frames.end(), page) == frames.end()) {
            faults++;
            if (frames.size() < capacity) {
                frames.push_back(page);
            } else {
                int res = -1, farthest = -1;
                for (int j = 0; j < frames.size(); j++) {
                    int next_use = -1;
                    for (int k = i + 1; k < pages.size(); k++) {
                        if (frames[j] == pages[k]) {
                            next_use = k;
                            break;
                        }
                    }
                    if (next_use == -1) {
                        res = j;
                        break;
                    }
                    if (next_use > farthest) {
                        farthest = next_use;
                        res = j;
                    }
                }
                frames[res] = page;
            }
        }
    }
    return faults;
}`,
      python: `def opt(pages, capacity):
    frames = []
    faults = 0
    
    for i in range(len(pages)):
        page = pages[i]
        if page not in frames:
            faults += 1
            if len(frames) < capacity:
                frames.append(page)
            else:
                farthest = -1
                replaced_idx = -1
                for j in range(len(frames)):
                    try:
                        next_use = pages.index(frames[j], i + 1)
                    except ValueError:
                        replaced_idx = j
                        break
                    
                    if next_use > farthest:
                        farthest = next_use
                        replaced_idx = j
                frames[replaced_idx] = page
                
    return faults`,
    },
    applications: [
      '理论上的最优解',
      '对比其他算法的基准线',
    ],
  },

  diskfcfs: {
    slug: 'diskfcfs',
    name: '先来先服务',
    nameEn: 'FCFS Disk Scheduling',
    category: 'diskScheduling',
    difficulty: '基础',
    fn: diskFcfs,
    viz: 'disk',
    timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
    spaceComplexity: 'O(n)',
    description: '按请求到达的先后顺序进行服务，不考虑磁头移动距离。',
    intuition: '最简单的磁盘调度算法，维护一个队列，请求按顺序加入队列，磁头依次访问队列中的磁道。优点是公平，不会饿死任何请求；缺点是可能会导致总寻道距离非常大（例如频繁在内外磁道之间来回移动）。',
    pseudocode: `procedure FCFS(requests, initialHead):
    currentHead ← initialHead
    totalSeek ← 0
    for track in requests:
        totalSeek ← totalSeek + |track - currentHead|
        currentHead ← track
    return totalSeek`,
    code: {
      cpp: `int fcfs(vector<int>& requests, int initialHead) {
    int currentHead = initialHead;
    int totalSeek = 0;
    for (int track : requests) {
        totalSeek += abs(track - currentHead);
        currentHead = track;
    }
    return totalSeek;
}`,
      python: `def fcfs(requests, initial_head):
    current_head = initial_head
    total_seek = 0
    for track in requests:
        total_seek += abs(track - current_head)
        current_head = track
    return total_seek`,
    },
    applications: [
      '对系统负载较轻的情况',
      '作为其他算法的基准比较',
    ],
  },

  sstf: {
    slug: 'sstf',
    name: '最短寻道时间优先',
    nameEn: 'SSTF Disk Scheduling',
    category: 'diskScheduling',
    difficulty: '中等',
    fn: diskSstf,
    viz: 'disk',
    timeComplexity: { best: 'O(n²)', average: 'O(n²)', worst: 'O(n²)' },
    spaceComplexity: 'O(n)',
    description: '每次选择距离当前磁头最近的请求进行服务。',
    intuition: '贪心策略。每次都在未完成的请求中找到离当前磁头位置最近的那个磁道并移过去。这可以大幅度减少总的寻道时间。但也带来了一个问题：可能会导致"饥饿"（Starvation）现象，即如果不断有靠近当前磁头的新请求到来，远处磁道的请求就可能永远得不到服务。',
    pseudocode: `procedure SSTF(requests, initialHead):
    queue ← copy(requests)
    currentHead ← initialHead
    totalSeek ← 0
    while queue is not empty:
        target ← find_closest(queue, currentHead)
        totalSeek ← totalSeek + |target - currentHead|
        currentHead ← target
        queue.remove(target)
    return totalSeek`,
    code: {
      cpp: `int sstf(vector<int>& requests, int initialHead) {
    vector<int> q = requests;
    int currentHead = initialHead;
    int totalSeek = 0;
    while (!q.empty()) {
        int closestIdx = -1;
        int minSeek = INT_MAX;
        for (int i = 0; i < q.size(); ++i) {
            int seek = abs(q[i] - currentHead);
            if (seek < minSeek) {
                minSeek = seek;
                closestIdx = i;
            }
        }
        totalSeek += minSeek;
        currentHead = q[closestIdx];
        q.erase(q.begin() + closestIdx);
    }
    return totalSeek;
}`,
      python: `def sstf(requests, initial_head):
    q = list(requests)
    current_head = initial_head
    total_seek = 0
    while q:
        closest_track = min(q, key=lambda x: abs(x - current_head))
        total_seek += abs(closest_track - current_head)
        current_head = closest_track
        q.remove(closest_track)
    return total_seek`,
    },
    applications: [
      '追求较少寻道时间的场景',
    ],
  },

  scan: {
    slug: 'scan',
    name: '电梯调度 (SCAN)',
    nameEn: 'SCAN Disk Scheduling',
    category: 'diskScheduling',
    difficulty: '中等',
    fn: diskScan,
    viz: 'elevator',
    timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
    spaceComplexity: 'O(n)',
    description: '像电梯一样，磁头单向移动，直到碰到尽头才会折返。',
    intuition: '想象电梯的运行规则：电梯总是先向一个方向运行，直到该方向的顶端或者底端，停下后再反向运行。SCAN算法就是把磁头当成了电梯。由于需要对请求进行排序，并分半处理，避免了 SSTF 的饥饿现象，表现比较均匀。',
    pseudocode: `procedure SCAN(requests, initialHead, maxTrack, direction):
    sort(requests)
    left ← elements in requests < initialHead
    right ← elements in requests ≥ initialHead
    
    if direction == 'up':
        for target in right: visit(target)
        if left is not empty:
            visit(maxTrack)
            for target in reverse(left): visit(target)
    else:
        for target in reverse(left): visit(target)
        if right is not empty:
            visit(0)
            for target in right: visit(target)
    
    return totalSeek`,
    code: {
      cpp: `int scan(vector<int>& requests, int initialHead, int maxTrack, string direction) {
    vector<int> left, right;
    for (int r : requests) {
        if (r < initialHead) left.push_back(r);
        else right.push_back(r);
    }
    sort(left.begin(), left.end());
    sort(right.begin(), right.end());
    
    int totalSeek = 0, currentHead = initialHead;
    vector<int> seq;
    
    if (direction == "up") {
        for (int r : right) seq.push_back(r);
        if (!left.empty()) {
            seq.push_back(maxTrack);
            for (int i = left.size()-1; i >= 0; i--) seq.push_back(left[i]);
        }
    } else {
        for (int i = left.size()-1; i >= 0; i--) seq.push_back(left[i]);
        if (!right.empty()) {
            seq.push_back(0);
            for (int r : right) seq.push_back(r);
        }
    }
    
    for (int t : seq) {
        totalSeek += abs(t - currentHead);
        currentHead = t;
    }
    return totalSeek;
}`,
      python: `def scan(requests, initial_head, max_track, direction='up'):
    left = sorted([r for r in requests if r < initial_head])
    right = sorted([r for r in requests if r >= initial_head])
    
    seq = []
    if direction == 'up':
        seq.extend(right)
        if left:
            seq.append(max_track)
            seq.extend(reversed(left))
    else:
        seq.extend(reversed(left))
        if right:
            seq.append(0)
            seq.extend(right)
            
    total_seek = 0
    current_head = initial_head
    for t in seq:
        total_seek += abs(t - current_head)
        current_head = t
    return total_seek`,
    },
    applications: [
      '普通的操作系统磁盘调度',
      '消除饥饿的改良策略',
    ],
  },

  cpufcfs: {
    slug: 'cpufcfs',
    name: 'CPU 调度 - FCFS',
    nameEn: 'First Come First Served',
    category: 'cpuScheduling',
    difficulty: '基础',
    fn: cpuFcfs,
    viz: 'cpuschedule',
    timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
    spaceComplexity: 'O(n)',
    description: '按到达时间先后顺序调度，非抢占式。',
    intuition: `**FCFS（First Come First Served）** 是最简单的 CPU 调度算法：谁先到，谁先用 CPU，**用完为止**（非抢占）。\n\n优点：实现简单、绝对公平。\n\n缺点：**护航效应 (Convoy Effect)**——如果第一个到达的进程 burst 很长，后面的短进程就要等很久，平均等待时间大。\n\n比如：P1 (burst=20)，P2 (burst=2)，P3 (burst=3)。FCFS 顺序 → P2 要等 20，P3 要等 22，平均等待 = (0+20+22)/3 ≈ 14。换成 SJF 调度则平均等待 = (0+2+5)/3 ≈ 2.3。`,
    pseudocode: `// 非抢占式：按到达时间排序，依次执行到完成
sort(processes by arrival_time)
t ← 0
for each p in processes:
    if t < p.arrival: t ← p.arrival
    p.start ← t
    t ← t + p.burst
    p.finish ← t`,
    code: {
      cpp: `struct Proc { int id, arrival, burst, finish; };

void fcfs(vector<Proc>& procs) {
    sort(procs.begin(), procs.end(),
         [](auto& a, auto& b){ return a.arrival < b.arrival; });
    int t = 0;
    for (auto& p : procs) {
        if (t < p.arrival) t = p.arrival;
        t += p.burst;
        p.finish = t;
    }
}`,
      python: `def fcfs(procs):
    procs.sort(key=lambda p: p['arrival'])
    t = 0
    for p in procs:
        if t < p['arrival']:
            t = p['arrival']
        t += p['burst']
        p['finish'] = t
    return procs`,
    },
    applications: [
      '批处理系统中最简单的调度策略',
      '考研 408 操作系统必考',
      '理解非抢占式调度与护航效应',
    ],
  },

  cpusjf: {
    slug: 'cpusjf',
    name: 'CPU 调度 - SJF',
    nameEn: 'Shortest Job First',
    category: 'cpuScheduling',
    difficulty: '基础',
    fn: cpuSjf,
    viz: 'cpuschedule',
    timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)' },
    spaceComplexity: 'O(n)',
    description: '在每次调度时刻选择剩余 burst 最短的进程，非抢占式。',
    intuition: `**SJF（Shortest Job First）**：每次有新进程要调度时，从就绪队列里选 **burst 最短** 的执行。\n\n**理论最优**：SJF 是使平均等待时间最小的非抢占调度算法。\n\n但有两个问题：\n1. **实际不可知**：CPU burst 长度未知，只能用历史数据预测（指数平均）。\n2. **饥饿**：如果长进程后面一直来短进程，长进程永远得不到 CPU。`,
    pseudocode: `t ← 0
ready ← []
while not all done:
    add newly arrived processes to ready
    if ready is empty: t ← next arrival; continue
    pick p with min burst from ready
    t ← t + p.burst
    p.finish ← t`,
    code: {
      cpp: `void sjf(vector<Proc>& procs) {
    int n = procs.size(), done = 0, t = 0;
    vector<bool> finished(n, false);
    while (done < n) {
        int idx = -1;
        for (int i = 0; i < n; i++) {
            if (!finished[i] && procs[i].arrival <= t) {
                if (idx == -1 || procs[i].burst < procs[idx].burst)
                    idx = i;
            }
        }
        if (idx == -1) { t++; continue; }
        t += procs[idx].burst;
        procs[idx].finish = t;
        finished[idx] = true;
        done++;
    }
}`,
      python: `def sjf(procs):
    n = len(procs)
    done = 0
    t = 0
    while done < n:
        candidates = [p for p in procs if p['arrival'] <= t and 'finish' not in p]
        if not candidates:
            t += 1
            continue
        p = min(candidates, key=lambda x: x['burst'])
        t += p['burst']
        p['finish'] = t
        done += 1
    return procs`,
    },
    applications: [
      '批处理系统中追求最小平均等待时间',
      '理论上的最优非抢占调度',
      'CPU burst 可预测的场景（历史指数平均）',
    ],
  },

  cpusrtn: {
    slug: 'cpusrtn',
    name: 'CPU 调度 - SRTN',
    nameEn: 'Shortest Remaining Time Next',
    category: 'cpuScheduling',
    difficulty: '中等',
    fn: cpuSrtn,
    viz: 'cpuschedule',
    timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)' },
    spaceComplexity: 'O(n)',
    description: 'SJF 的抢占式版本：新到进程若剩余更短，立即抢占 CPU。',
    intuition: `**SRTN（Shortest Remaining Time Next）= 抢占式 SJF**。在每个时间单位（或每次新进程到达时）重新检查：如果有进程的剩余时间比当前运行的还短，立即抢占 CPU。\n\n**理论最优**：SRTN 是使平均等待时间最小的 **抢占式** 调度算法。\n\n实际使用更少：① 同样有饥饿问题；② 频繁切换上下文开销大。但在教学和面试中是 SJF 的标配延伸。`,
    pseudocode: `t ← 0
while not all done:
    pick p with min remaining time from ready
    run p for 1 time unit
    t ← t + 1
    p.remaining ← p.remaining - 1
    if p.remaining == 0: mark p as done`,
    code: {
      cpp: `void srtn(vector<Proc>& procs) {
    int n = procs.size(), done = 0, t = 0;
    vector<int> rem(n);
    for (int i = 0; i < n; i++) rem[i] = procs[i].burst;
    while (done < n) {
        int idx = -1;
        for (int i = 0; i < n; i++) {
            if (rem[i] > 0 && procs[i].arrival <= t) {
                if (idx == -1 || rem[i] < rem[idx]) idx = i;
            }
        }
        if (idx == -1) { t++; continue; }
        rem[idx]--;
        t++;
        if (rem[idx] == 0) { procs[idx].finish = t; done++; }
    }
}`,
      python: `def srtn(procs):
    n = len(procs)
    rem = [p['burst'] for p in procs]
    done = 0
    t = 0
    while done < n:
        candidates = [i for i in range(n) if rem[i] > 0 and procs[i]['arrival'] <= t]
        if not candidates:
            t += 1
            continue
        idx = min(candidates, key=lambda i: rem[i])
        rem[idx] -= 1
        t += 1
        if rem[idx] == 0:
            procs[idx]['finish'] = t
            done += 1
    return procs`,
    },
    applications: [
      '抢占式系统中追求最低平均等待时间',
      '考研 408 高频题（抢占 vs 非抢占对比）',
      '现代操作系统的"完全公平调度器" CFS 的灵感来源',
    ],
  },

  cpurr: {
    slug: 'cpurr',
    name: 'CPU 调度 - 时间片轮转 RR',
    nameEn: 'Round Robin',
    category: 'cpuScheduling',
    difficulty: '基础',
    fn: cpuRoundRobin,
    viz: 'cpuschedule',
    timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
    spaceComplexity: 'O(n)',
    description: '每个进程分配固定时间片 q，时间片用完后回到队尾。',
    intuition: `**Round Robin** 是分时系统的核心调度算法。每个进程分一个固定的 **时间片 (quantum / time slice)**，时间片用完就被抢占放回就绪队列尾部。\n\n**关键参数：时间片 q 的选择**：\n- q **太大**（如比所有进程的 burst 都大）→ 退化为 FCFS\n- q **太小** → 上下文切换开销占比过高，CPU 时间被浪费\n- 经验值：让 80% 的 CPU 突发能在一个时间片内完成（通常 10-100 ms）\n\n**优点**：\n- 公平，每个进程都能获得 CPU\n- 响应时间稳定（任何进程最多等 (n-1) × q 就能上 CPU）\n- 没有饥饿\n\n**缺点**：\n- 不像 SJF 那样最小化平均等待时间\n- 频繁切换上下文有开销\n- 不适合一次需要长 CPU 计算的批处理任务`,
    pseudocode: `queue ← []   // FIFO 就绪队列
t ← 0
while not all done:
    add newly arrived processes to queue
    if queue is empty: t++; continue
    p ← queue.dequeue()
    run p for min(quantum, p.remaining) time units
    if p.remaining > 0:
        queue.enqueue(p)`,
    code: {
      cpp: `void roundRobin(vector<Proc>& procs, int quantum) {
    int n = procs.size();
    vector<int> rem(n);
    for (int i = 0; i < n; i++) rem[i] = procs[i].burst;
    queue<int> readyQ;
    set<int> arrived;
    int t = 0, done = 0;

    while (done < n) {
        // 入队新到达的进程
        for (int i = 0; i < n; i++) {
            if (procs[i].arrival <= t && rem[i] > 0 && !arrived.count(i)) {
                readyQ.push(i);
                arrived.insert(i);
            }
        }
        if (readyQ.empty()) { t++; continue; }

        int idx = readyQ.front(); readyQ.pop();
        int run = min(quantum, rem[idx]);
        rem[idx] -= run;
        t += run;

        // 期间到达的也要入队
        for (int i = 0; i < n; i++) {
            if (procs[i].arrival <= t && rem[i] > 0 && !arrived.count(i)) {
                readyQ.push(i);
                arrived.insert(i);
            }
        }
        if (rem[idx] > 0) readyQ.push(idx);
        else { procs[idx].finish = t; done++; }
    }
}`,
      python: `from collections import deque

def round_robin(procs, quantum):
    n = len(procs)
    rem = [p['burst'] for p in procs]
    ready = deque()
    arrived = set()
    t = 0
    done = 0
    while done < n:
        for i in range(n):
            if procs[i]['arrival'] <= t and rem[i] > 0 and i not in arrived:
                ready.append(i)
                arrived.add(i)
        if not ready:
            t += 1
            continue
        idx = ready.popleft()
        run = min(quantum, rem[idx])
        rem[idx] -= run
        t += run
        for i in range(n):
            if procs[i]['arrival'] <= t and rem[i] > 0 and i not in arrived:
                ready.append(i)
                arrived.add(i)
        if rem[idx] > 0:
            ready.append(idx)
        else:
            procs[idx]['finish'] = t
            done += 1
    return procs`,
    },
    applications: [
      '分时操作系统（Unix / Linux 早期）的核心调度',
      '现代系统的多级反馈队列基础（MLFQ 第 0 层就是 RR）',
      '考研 408 必考',
      '理解时间片与上下文切换开销的权衡',
    ],
  },

  bankers: {
    slug: 'bankers',
    name: '银行家算法',
    nameEn: "Banker's Algorithm",
    category: 'synchronization',
    difficulty: '进阶',
    fn: bankersAlgorithm,
    viz: 'bankers',
    timeComplexity: { best: 'O(n²·m)', average: 'O(n²·m)', worst: 'O(n²·m)' },
    spaceComplexity: 'O(n·m)',
    description: '通过模拟资源分配 + 安全序列检测，避免系统进入死锁状态。',
    intuition: `Dijkstra 1965 年提出的 **死锁避免** 算法，把操作系统当成银行家——多个进程（客户）申请资源（贷款），银行家在每次分配前检查："如果给这笔贷款，剩下的钱够不够让所有客户依次完成？"\n\n**四张矩阵**：\n- **Max[i][j]**：进程 i 对资源 j 的最大需求\n- **Allocation[i][j]**：进程 i 当前已分配的资源 j 数量\n- **Need[i][j] = Max[i][j] - Allocation[i][j]**：进程 i 还需要的资源 j 数量\n- **Available[j]**：系统当前可用资源 j 数量\n\n**安全性检查（Safety Algorithm）**：\n1. 初始化 Work = Available, Finish[i] = false\n2. 找一个 Finish[i] = false 且 Need[i] ≤ Work 的进程 i\n3. Work += Allocation[i]，Finish[i] = true\n4. 重复 2-3，直到没有满足条件的进程\n\n如果最后所有 Finish[i] 都是 true，则存在 **安全序列**，系统安全。否则不安全（可能死锁）。\n\n**为什么这样能避免死锁**：安全序列确保至少有一种执行顺序能让所有进程完成。即使将来某进程要更多资源，也能等待某个其他进程释放后继续。\n\n**缺点**：必须预先知道每个进程的最大需求 Max（实际不易知道），故现代 OS 一般用 **死锁检测 + 恢复**（如 Linux）或干脆 **忽略**（鸵鸟策略）。`,
    pseudocode: `function isSafe(Available, Max, Allocation):
    Need ← Max - Allocation
    Work ← Available
    Finish ← all false
    sequence ← []
    while exists i: not Finish[i] and Need[i] ≤ Work:
        Work ← Work + Allocation[i]
        Finish[i] ← true
        sequence.append(i)
    return all Finish[i] is true, sequence`,
    code: {
      cpp: `bool isSafe(vector<int> avail, vector<vector<int>>& max,
            vector<vector<int>>& alloc, vector<int>& seq) {
    int n = alloc.size(), m = avail.size();
    vector<vector<int>> need(n, vector<int>(m));
    for (int i = 0; i < n; i++)
        for (int j = 0; j < m; j++)
            need[i][j] = max[i][j] - alloc[i][j];

    vector<bool> finish(n, false);
    vector<int> work = avail;
    seq.clear();

    while (true) {
        int found = -1;
        for (int i = 0; i < n; i++) {
            if (finish[i]) continue;
            bool canRun = true;
            for (int j = 0; j < m; j++)
                if (need[i][j] > work[j]) { canRun = false; break; }
            if (canRun) { found = i; break; }
        }
        if (found < 0) break;
        for (int j = 0; j < m; j++) work[j] += alloc[found][j];
        finish[found] = true;
        seq.push_back(found);
    }
    return seq.size() == n;
}`,
      python: `def is_safe(available, max_, allocation):
    n = len(allocation)
    m = len(available)
    need = [[max_[i][j] - allocation[i][j] for j in range(m)] for i in range(n)]
    work = list(available)
    finish = [False] * n
    seq = []

    while True:
        found = -1
        for i in range(n):
            if finish[i]: continue
            if all(need[i][j] <= work[j] for j in range(m)):
                found = i
                break
        if found < 0:
            break
        for j in range(m):
            work[j] += allocation[found][j]
        finish[found] = True
        seq.append(found)

    return all(finish), seq`,
    },
    applications: [
      '考研 408 操作系统必考',
      '理解死锁四个必要条件 + 避免策略',
      '实际系统中较少使用（要求预知 Max），但思想被广泛应用',
      '数据库的两阶段锁协议（2PL）有类似思想',
    ],
  },

  philosophers: {
    slug: 'philosophers',
    name: '哲学家就餐问题',
    nameEn: 'Dining Philosophers',
    category: 'synchronization',
    difficulty: '中等',
    fn: diningPhilosophers,
    viz: 'philosophers',
    timeComplexity: { best: 'N/A', average: 'N/A', worst: 'N/A' },
    spaceComplexity: 'O(n)',
    description: 'Dijkstra 提出的经典同步问题：n 个哲学家围圆桌，相邻两人共享一只叉子。',
    intuition: `5 个哲学家围着圆桌，桌上交替摆着 5 只叉子（philosopher_i 和 philosopher_{i+1} 共用 fork_i）。每位哲学家在 **思考 thinking** 和 **进餐 eating** 之间循环；进餐前需要同时拿起左右两只叉子。\n\n**朴素错误解法**：每人先拿左叉，再拿右叉 → 当所有人同时拿起左叉时，每人都在等右邻居放下叉子 → **循环等待，死锁**。这是死锁四个必要条件全部满足的经典案例：\n- 互斥（叉子不能共享）\n- 持有并等待（拿了左叉等右叉）\n- 不剥夺（不能从别人手上抢）\n- 循环等待（环形等待关系）\n\n**常见解法（破除一个或多个必要条件）**：\n1. **资源序号法**（Dijkstra 原版）：给叉子编号，每人按 **min(left, right) 先拿**。破除循环等待。\n2. **服务员法**（Arbiter）：增加一个中央协调者，进餐前先请求允许。破除并发申请。\n3. **限制人数**：最多让 n-1 人同时申请叉子。打破环。\n4. **奇偶法**：奇数哲学家先拿左叉，偶数先拿右叉。打破对称。\n5. **超时回退**：拿不到第二只就放下第一只，等一会再试。可能产生活锁，但实际可用。`,
    pseudocode: `// 资源序号解法
philosopher(i):
    loop:
        think()
        lo ← min(left_fork(i), right_fork(i))
        hi ← max(left_fork(i), right_fork(i))
        wait(lo)         // 先拿编号小的
        wait(hi)         // 再拿编号大的
        eat()
        signal(hi)
        signal(lo)`,
    code: {
      cpp: `// 使用 C++17 mutex + scoped_lock（推荐）
#include <mutex>
#include <thread>
#include <vector>
using namespace std;

const int N = 5;
mutex forks[N];

void philosopher(int i) {
    while (true) {
        // think...
        int lo = min(i, (i + 1) % N);
        int hi = max(i, (i + 1) % N);
        // scoped_lock 同时锁两把，自动避免死锁
        scoped_lock lock(forks[lo], forks[hi]);
        // eat...
    }
}

int main() {
    vector<thread> ths;
    for (int i = 0; i < N; i++) ths.emplace_back(philosopher, i);
    for (auto& t : ths) t.join();
}`,
      python: `import threading
import time
import random

N = 5
forks = [threading.Lock() for _ in range(N)]

def philosopher(i):
    while True:
        # think
        time.sleep(random.random())
        # 资源序号策略：先拿小编号
        lo = min(i, (i + 1) % N)
        hi = max(i, (i + 1) % N)
        with forks[lo]:
            with forks[hi]:
                # eat
                time.sleep(random.random())

threads = [threading.Thread(target=philosopher, args=(i,), daemon=True)
           for i in range(N)]
for t in threads: t.start()`,
    },
    applications: [
      'OS 课程死锁讲解的标杆问题',
      'C++ scoped_lock / Python with 多锁的设计验证',
      '分布式系统资源排序的思想源头',
      '面试常考：写出死锁场景 + 至少一种解法',
    ],
  },

}

export default OS_ALGORITHMS
