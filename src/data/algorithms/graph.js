// 自动从 algorithms.js 拆分（7 个算法 · graph 学科）
import { aStar } from '../../algorithms/graph/aStar'
import { bellmanFord } from '../../algorithms/graph/bellmanFord'
import { bfs } from '../../algorithms/graph/bfs'
import { dfs } from '../../algorithms/graph/dfs'
import { dijkstra } from '../../algorithms/graph/dijkstra'
import { floydWarshall } from '../../algorithms/graph/floydWarshall'
import { topoSort } from '../../algorithms/graph/topoSort'

export const GRAPH_ALGORITHMS = {
  bfs: {
    slug: 'bfs',
    name: 'BFS 广度优先搜索',
    nameEn: 'Breadth-First Search',
    category: 'graph',
    difficulty: '基础',
    fn: bfs,
    viz: 'graph',
    timeComplexity: { best: 'O(V+E)', average: 'O(V+E)', worst: 'O(V+E)' },
    spaceComplexity: 'O(V)',
    description: '使用队列逐层展开，先访问近的，再访问远的。',
    intuition: `BFS 像水波在水面上扩散：从起点开始，先访问所有距离为 1 的节点，再访问距离为 2 的，以此类推。

实现的核心是队列（FIFO）：起点入队 → 反复出队节点、访问它、把它的未访问邻居入队，直到队列为空。

由于按距离分层访问，BFS 在**无权图**上能直接给出最短路径（最少边数）。但在带权图上不行——这种情况要用 Dijkstra。

需要 visited 标记防止重复入队，否则有环图会死循环。`,
    pseudocode: `procedure BFS(graph, start):
    queue ← [start]
    visited ← {start}
    while queue is not empty:
        u ← queue.dequeue()
        process(u)
        for each neighbor v of u:
            if v not in visited:
                visited.add(v)
                queue.enqueue(v)`,
    code: {
      cpp: `vector<int> bfs(unordered_map<int, vector<int>>& graph, int start) {
    queue<int> q;
    unordered_set<int> visited;
    vector<int> order;
    q.push(start);
    visited.insert(start);
    while (!q.empty()) {
        int u = q.front();
        q.pop();
        order.push_back(u);
        for (int v : graph[u]) {
            if (visited.find(v) == visited.end()) {
                visited.insert(v);
                q.push(v);
            }
        }
    }
    return order;
}`,
      python: `from collections import deque

def bfs(graph, start):
    queue = deque([start])
    visited = {start}
    order = []
    while queue:
        u = queue.popleft()
        order.append(u)
        for v in graph.get(u, []):
            if v not in visited:
                visited.add(v)
                queue.append(v)
    return order`,
    },
    applications: [
      '无权图最短路径（迷宫、社交网络度数）',
      '层次遍历（树的逐层打印）',
      '连通性检查、二部图判定',
      '网络爬虫的页面发现',
    ],
  },

  dfs: {
    slug: 'dfs',
    name: 'DFS 深度优先搜索',
    nameEn: 'Depth-First Search',
    category: 'graph',
    difficulty: '基础',
    fn: dfs,
    viz: 'graph',
    timeComplexity: { best: 'O(V+E)', average: 'O(V+E)', worst: 'O(V+E)' },
    spaceComplexity: 'O(V)',
    description: '使用栈一路到底，回溯后再访问其他分支。',
    intuition: `DFS 像走迷宫：选一条路一直走到底，遇到死路就回退一步，再尝试另一条岔路。

实现可以用递归（系统栈）或显式栈。从起点开始，把它压入栈 → 反复弹出栈顶节点、访问它、把未访问邻居压栈。

DFS 与 BFS 是图论的两大基础工具。它的特点是会"深入"某个分支直到尽头，因此天然适合需要探索路径或回溯的问题。`,
    pseudocode: `procedure DFS(graph, start):
    stack ← [start]
    visited ← {}
    while stack is not empty:
        u ← stack.pop()
        if u in visited: continue
        visited.add(u)
        process(u)
        for each neighbor v of u (in reverse order):
            if v not in visited:
                stack.push(v)

// 递归形式
procedure DFSRec(u):
    visited.add(u)
    for each neighbor v of u:
        if v not in visited: DFSRec(v)`,
    code: {
      cpp: `vector<int> dfs(unordered_map<int, vector<int>>& graph, int start) {
    stack<int> st;
    unordered_set<int> visited;
    vector<int> order;
    st.push(start);
    while (!st.empty()) {
        int u = st.top();
        st.pop();
        if (visited.count(u)) continue;
        visited.insert(u);
        order.push_back(u);
        // 反向压栈，让较小邻居先弹出
        for (auto it = graph[u].rbegin(); it != graph[u].rend(); ++it) {
            if (!visited.count(*it)) st.push(*it);
        }
    }
    return order;
}

// 递归形式
void dfsRec(int u, unordered_map<int, vector<int>>& graph,
            unordered_set<int>& visited) {
    visited.insert(u);
    for (int v : graph[u]) {
        if (!visited.count(v)) dfsRec(v, graph, visited);
    }
}`,
      python: `def dfs(graph, start):
    stack = [start]
    visited = set()
    order = []
    while stack:
        u = stack.pop()
        if u in visited:
            continue
        visited.add(u)
        order.append(u)
        # 反向压栈，让较小邻居先弹出
        for v in reversed(graph.get(u, [])):
            if v not in visited:
                stack.append(v)
    return order

# 递归形式
def dfs_rec(u, graph, visited):
    visited.add(u)
    for v in graph.get(u, []):
        if v not in visited:
            dfs_rec(v, graph, visited)`,
    },
    applications: [
      '拓扑排序（依赖关系排序）',
      '连通分量、强连通分量（Tarjan/Kosaraju）',
      '回溯算法骨架（八皇后、数独、生成排列）',
      '环检测、二分图判定',
    ],
  },

  dijkstra: {
    slug: 'dijkstra',
    name: 'Dijkstra 最短路径',
    nameEn: "Dijkstra's Algorithm",
    category: 'graph',
    difficulty: '进阶',
    fn: dijkstra,
    viz: 'graph',
    timeComplexity: { best: 'O((V+E) log V)', average: 'O((V+E) log V)', worst: 'O((V+E) log V)' },
    spaceComplexity: 'O(V)',
    description: '贪心选取距离最小的未访问节点，松弛其邻居。',
    intuition: `Dijkstra 维护从起点到每个节点的"已知最短距离" dist[]。初始 dist[start]=0，其余为 ∞。

每一轮，从未访问节点中挑出 dist 最小的节点 u，把它标记为已访问。然后**松弛** u 的所有边：对每个邻居 v，如果 dist[u] + w(u,v) < dist[v]，就更新 dist[v]。

直觉：一旦节点被选中（dist 最小），它的距离就确定了，因为任何绕道的路径都会更长。这一保证依赖**边权非负**——这也是 Dijkstra 的限制（负权要用 Bellman-Ford）。

朴素实现 O(V²)，用优先队列优化到 O((V+E) log V)。`,
    pseudocode: `procedure Dijkstra(graph, start):
    dist[v] ← ∞ for all v; dist[start] ← 0
    PQ ← {(0, start)}
    while PQ is not empty:
        (d, u) ← PQ.extractMin()
        if d > dist[u]: continue
        for each (v, w) in graph[u]:
            if dist[u] + w < dist[v]:
                dist[v] ← dist[u] + w
                PQ.insert((dist[v], v))
    return dist`,
    code: {
      cpp: `unordered_map<int, int> dijkstra(
    unordered_map<int, vector<pair<int, int>>>& graph, int start) {
    unordered_map<int, int> dist;
    for (auto& [u, _] : graph) dist[u] = INT_MAX;
    dist[start] = 0;

    // 小顶堆：(距离, 节点)
    priority_queue<pair<int, int>,
                   vector<pair<int, int>>,
                   greater<>> pq;
    pq.push({0, start});

    while (!pq.empty()) {
        auto [d, u] = pq.top();
        pq.pop();
        if (d > dist[u]) continue;  // 过期记录
        for (auto& [v, w] : graph[u]) {
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                pq.push({dist[v], v});
            }
        }
    }
    return dist;
}`,
      python: `import heapq

def dijkstra(graph, start):
    dist = {u: float('inf') for u in graph}
    dist[start] = 0
    pq = [(0, start)]  # 小顶堆：(距离, 节点)

    while pq:
        d, u = heapq.heappop(pq)
        if d > dist[u]:
            continue  # 过期记录
        for v, w in graph.get(u, []):
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                heapq.heappush(pq, (dist[v], v))
    return dist`,
    },
    applications: [
      '路径规划（地图导航、网络路由 OSPF）',
      '游戏 AI 寻路（A* 是其加权扩展）',
      '图论问题的最短距离基础组件',
      '注意：边权必须非负，否则用 Bellman-Ford',
    ],
  },

  bellmanford: {
    slug: 'bellmanford',
    name: 'Bellman-Ford 最短路径',
    nameEn: 'Bellman-Ford Algorithm',
    category: 'graph',
    difficulty: '进阶',
    fn: bellmanFord,
    viz: 'graph',
    timeComplexity: { best: 'O(V·E)', average: 'O(V·E)', worst: 'O(V·E)' },
    spaceComplexity: 'O(V)',
    description: '迭代松弛所有边 V-1 次，可处理负权并检测负环。',
    intuition: `Bellman-Ford 与 Dijkstra 都求单源最短路径，但选择策略完全不同：Dijkstra 贪心地选当前最近的节点，而 Bellman-Ford 暴力地"松弛所有边" V-1 次。

**核心观察：** 如果存在最短路径，它最多有 V-1 条边（不会有环，因为环只会让路径变长）。所以经过 V-1 轮、每轮松弛所有 E 条边后，所有最短距离都已收敛。

**松弛操作：** 对每条边 (u,v,w)，如果 dist[u] + w < dist[v]，就更新 dist[v]。

**关键能力：** 与 Dijkstra 不同，Bellman-Ford 能正确处理**负权边**。第 V 轮再扫一遍，如果还能松弛，说明图中存在**负权环**——这种情况下最短路径无意义（绕环可以无限缩短）。

代价是时间复杂度 O(V·E)，比 Dijkstra 的 O((V+E)logV) 慢得多。所以：边权全非负用 Dijkstra，含负权或要检测负环用 Bellman-Ford。`,
    pseudocode: `procedure BellmanFord(graph, start):
    dist[v] ← ∞ for all v; dist[start] ← 0
    repeat V-1 times:
        for each edge (u, v, w) in graph:
            if dist[u] + w < dist[v]:
                dist[v] ← dist[u] + w
    // 负环检测
    for each edge (u, v, w) in graph:
        if dist[u] + w < dist[v]:
            report "negative cycle exists"
    return dist`,
    code: {
      cpp: `struct Edge { int u, v, w; };

bool bellmanFord(int V, vector<Edge>& edges, int start,
                 vector<int>& dist) {
    dist.assign(V, INT_MAX);
    dist[start] = 0;

    for (int i = 1; i < V; i++) {
        bool updated = false;
        for (auto& e : edges) {
            if (dist[e.u] != INT_MAX && dist[e.u] + e.w < dist[e.v]) {
                dist[e.v] = dist[e.u] + e.w;
                updated = true;
            }
        }
        if (!updated) break;  // 提前收敛
    }

    // 负环检测
    for (auto& e : edges) {
        if (dist[e.u] != INT_MAX && dist[e.u] + e.w < dist[e.v]) {
            return false;  // 存在负环
        }
    }
    return true;
}`,
      python: `def bellman_ford(V, edges, start):
    """edges: [(u, v, w), ...]; 返回 (dist, has_negative_cycle)"""
    dist = [float('inf')] * V
    dist[start] = 0

    for _ in range(V - 1):
        updated = False
        for u, v, w in edges:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                updated = True
        if not updated:
            break  # 提前收敛

    # 负环检测
    for u, v, w in edges:
        if dist[u] + w < dist[v]:
            return dist, True
    return dist, False`,
    },
    applications: [
      '含负权边的最短路径（货币套利、博弈收益）',
      '网络路由协议 RIP（基于距离向量）',
      '检测图中的负权环',
      'SPFA 等基于松弛思想的算法的基础',
    ],
  },

  floydwarshall: {
    slug: 'floydwarshall',
    name: 'Floyd-Warshall 全源最短路',
    nameEn: 'Floyd-Warshall Algorithm',
    category: 'graph',
    difficulty: '进阶',
    fn: floydWarshall,
    viz: 'floyd',
    timeComplexity: { best: 'O(V³)', average: 'O(V³)', worst: 'O(V³)' },
    spaceComplexity: 'O(V²)',
    description: '三重循环 DP，枚举中间节点松弛所有点对最短距离。',
    intuition: `Floyd-Warshall 与 Dijkstra/Bellman-Ford 最大的区别是：它一次性求出**所有点对**之间的最短路径，而不是单源最短路。

核心思想是动态规划：让 dist[i][j] 表示"只允许经过编号 1..k 的中间节点时，i 到 j 的最短距离"。

状态转移：dist_k[i][j] = min(dist_{k-1}[i][j], dist_{k-1}[i][k] + dist_{k-1}[k][j])

逻辑是：要么不经过 k，要么经过 k（i→k + k→j）。逐步把所有 V 个节点都纳入"可用中间节点"集合，最终 dist[i][j] 就是真实最短距离。

与 Bellman-Ford 一样，它支持负权边，但不能有负权环。可以用主对角线 dist[i][i] < 0 来检测负权环。`,
    pseudocode: `procedure FloydWarshall(W):
    dist ← W  // 初始为邻接矩阵
    for k from 0 to V-1:
        for i from 0 to V-1:
            for j from 0 to V-1:
                if dist[i][k] + dist[k][j] < dist[i][j]:
                    dist[i][j] ← dist[i][k] + dist[k][j]
    return dist`,
    code: {
      cpp: `void floydWarshall(vector<vector<int>>& dist, int V) {
    // dist 初始化：直接边权，自身为 0，无边为 INT_MAX/2
    for (int k = 0; k < V; k++) {
        for (int i = 0; i < V; i++) {
            for (int j = 0; j < V; j++) {
                if (dist[i][k] + dist[k][j] < dist[i][j]) {
                    dist[i][j] = dist[i][k] + dist[k][j];
                }
            }
        }
    }
    // 负环检测：dist[i][i] < 0
}`,
      python: `def floyd_warshall(dist, V):
    """dist: V×V 矩阵，float('inf') 表示无边"""
    for k in range(V):
        for i in range(V):
            for j in range(V):
                if dist[i][k] + dist[k][j] < dist[i][j]:
                    dist[i][j] = dist[i][k] + dist[k][j]
    # 负环检测: 任意 dist[i][i] < 0
    return dist`,
    },
    applications: [
      '需要所有节点对最短路径的场景（传递闭包、网络延迟矩阵）',
      '小规模图（V ≤ 500）的全源最短路',
      '检测负权环',
      '求图的直径（最远的最短路径对）',
    ],
  },

  toposort: {
    slug: 'toposort',
    name: '拓扑排序',
    nameEn: "Topological Sort (Kahn's)",
    category: 'graph',
    difficulty: '中等',
    fn: topoSort,
    viz: 'topo',
    timeComplexity: { best: 'O(V+E)', average: 'O(V+E)', worst: 'O(V+E)' },
    spaceComplexity: 'O(V)',
    description: '基于入度的 BFS：反复取出入度为 0 的节点输出，并删除其出边。',
    intuition: `拓扑排序将有向无环图（DAG）的节点排成一个序列，使得对每条边 u→v，u 在 v 之前出现。直觉上就是"依赖关系的合法执行顺序"——比如穿衣服、编译依赖、课程先修关系。

Kahn 算法（BFS 版）：
1. 计算所有节点的入度
2. 把入度为 0 的节点全部入队（无依赖，可立即执行）
3. 每次出队一个节点 u，加入拓扑序列，然后把 u 的所有出边删除（邻居入度各 -1），如果邻居入度变为 0 就入队
4. 重复直到队列为空。如果输出序列长度 < V，说明图中存在环，无法拓扑排序。

另一种方法是 DFS 后序（逆序）——两者等价，Kahn 更直观，DFS 版更容易检测环。`,
    pseudocode: `procedure KahnTopoSort(graph):
    inDegree[v] ← 0 for all v
    for each edge (u, v): inDegree[v]++
    queue ← all v with inDegree[v] = 0
    order ← []
    while queue not empty:
        u ← queue.dequeue()
        order.append(u)
        for each neighbor v of u:
            inDegree[v]--
            if inDegree[v] = 0: queue.enqueue(v)
    if len(order) < V: "cycle detected"
    return order`,
    code: {
      cpp: `vector<int> topoSort(int V, vector<vector<int>>& adj) {
    vector<int> inDeg(V, 0);
    for (int u = 0; u < V; u++)
        for (int v : adj[u]) inDeg[v]++;

    queue<int> q;
    for (int v = 0; v < V; v++)
        if (inDeg[v] == 0) q.push(v);

    vector<int> order;
    while (!q.empty()) {
        int u = q.front(); q.pop();
        order.push_back(u);
        for (int v : adj[u]) {
            if (--inDeg[v] == 0) q.push(v);
        }
    }
    if ((int)order.size() < V) throw runtime_error("cycle detected");
    return order;
}`,
      python: `from collections import deque

def topo_sort(V, adj):
    in_deg = [0] * V
    for u in range(V):
        for v in adj[u]:
            in_deg[v] += 1

    queue = deque(v for v in range(V) if in_deg[v] == 0)
    order = []
    while queue:
        u = queue.popleft()
        order.append(u)
        for v in adj[u]:
            in_deg[v] -= 1
            if in_deg[v] == 0:
                queue.append(v)

    if len(order) < V:
        raise ValueError("cycle detected")
    return order`,
    },
    applications: [
      '编译器：依赖关系排序（Makefile、Maven、Gradle）',
      '课程排课：有先修条件的课程安排',
      '任务调度：有前置任务的流水线排序',
      '电子表格：公式的计算顺序（检测循环引用）',
    ],
  },

  astar: {
    slug: 'astar',
    name: 'A* 搜索',
    nameEn: 'A* Search',
    category: 'graph',
    difficulty: '进阶',
    fn: aStar,
    viz: 'astar',
    timeComplexity: { best: 'O(E)', average: 'O(b^d)', worst: 'O(b^d)' },
    spaceComplexity: 'O(b^d)',
    stable: null,
    description: '带启发函数的最短路搜索，f(n)=g(n)+h(n)，比 Dijkstra 更快到达目标。',
    intuition: `A*（A-Star）是游戏 AI 和路径规划中最广泛使用的寻路算法。它在 Dijkstra 的基础上加入了**启发函数 h(n)**，通过估计当前节点到目标的距离来优先探索"更有希望"的路径。

A* 的估价函数：**f(n) = g(n) + h(n)**
- **g(n)**：从起点到节点 n 的已知实际代价
- **h(n)**：从 n 到终点的**启发式估计**（如曼哈顿距离、欧几里得距离）
- **f(n)**：总估计代价

关键性质：若 h(n) 是**可采纳的**（admissible，即永不高估实际代价），则 A* 能找到最优路径。

与 Dijkstra 的区别：Dijkstra 的 h(n)=0，均匀向四周扩展；A* 优先向目标方向扩展，跳过大量无关节点，实际更快。

与贪心最优优先搜索的区别：后者只用 h(n)，可能找到次优路径；A* 同时考虑 g(n) 保证最优性。`,
    pseudocode: `procedure AStar(start, goal, h):
    open ← PriorityQueue({start: f=h(start)})
    g[start] ← 0

    while open not empty:
        curr ← open.pop_min_f()
        if curr = goal: return reconstruct_path()

        closed.add(curr)
        for each neighbor of curr:
            if neighbor in closed: continue
            newG ← g[curr] + cost(curr, neighbor)
            if newG < g[neighbor]:
                g[neighbor] ← newG
                f[neighbor] ← newG + h(neighbor)
                open.push(neighbor, f[neighbor])
                cameFrom[neighbor] ← curr

    return failure  // 无路径`,
    code: {
      cpp: `struct Cell { int r, c, f, g; };
auto cmp = [](Cell a, Cell b){ return a.f > b.f; };

vector<pair<int,int>> aStar(vector<vector<int>>& grid, pair<int,int> start, pair<int,int> goal) {
    int rows = grid.size(), cols = grid[0].size();
    auto h = [&](int r, int c){ return abs(r-goal.first)+abs(c-goal.second); };
    vector<vector<int>> g(rows, vector<int>(cols, INT_MAX));
    vector<vector<pair<int,int>>> came(rows, vector<pair<int,int>>(cols, {-1,-1}));
    priority_queue<Cell, vector<Cell>, decltype(cmp)> pq(cmp);
    g[start.first][start.second] = 0;
    pq.push({start.first, start.second, h(start.first, start.second), 0});
    int dr[]={-1,1,0,0}, dc[]={0,0,-1,1};
    while (!pq.empty()) {
        auto [r, c, f, gv] = pq.top(); pq.pop();
        if (r==goal.first && c==goal.second) {
            vector<pair<int,int>> path;
            for (auto [pr,pc]=goal; pr!=-1; tie(pr,pc)=came[pr][pc])
                path.push_back({pr, pc});
            reverse(path.begin(), path.end());
            return path;
        }
        if (gv > g[r][c]) continue;
        for (int d=0;d<4;d++) {
            int nr=r+dr[d], nc=c+dc[d];
            if (nr<0||nr>=rows||nc<0||nc>=cols||grid[nr][nc]) continue;
            int ng = g[r][c]+1;
            if (ng < g[nr][nc]) {
                g[nr][nc]=ng; came[nr][nc]={r,c};
                pq.push({nr, nc, ng+h(nr,nc), ng});
            }
        }
    }
    return {};
}`,
      python: `import heapq

def a_star(grid, start, goal):
    rows, cols = len(grid), len(grid[0])
    h = lambda r, c: abs(r - goal[0]) + abs(c - goal[1])
    g = [[float('inf')] * cols for _ in range(rows)]
    came_from = [[None] * cols for _ in range(rows)]
    g[start[0]][start[1]] = 0
    pq = [(h(*start), 0, start)]  # (f, g, pos)

    while pq:
        f, gv, (r, c) = heapq.heappop(pq)
        if (r, c) == goal:
            path = []
            while (r, c) is not None:
                path.append((r, c))
                rc = came_from[r][c]
                if rc is None: break
                r, c = rc
            return path[::-1]
        if gv > g[r][c]:
            continue
        for dr, dc in [(-1,0),(1,0),(0,-1),(0,1)]:
            nr, nc = r+dr, c+dc
            if 0<=nr<rows and 0<=nc<cols and not grid[nr][nc]:
                ng = g[r][c] + 1
                if ng < g[nr][nc]:
                    g[nr][nc] = ng
                    came_from[nr][nc] = (r, c)
                    heapq.heappush(pq, (ng + h(nr, nc), ng, (nr, nc)))
    return []`,
    },
    applications: [
      '游戏中的 NPC 寻路（《魔兽争霸》《星际争霸》等 RTS 游戏）',
      '地图导航软件的路径规划（结合实际道路权重）',
      '机器人路径规划与自动驾驶障碍物绕行',
      '迷宫求解与拼图游戏（如 15-Puzzle 的最优解）',
    ],
  },

}

export default GRAPH_ALGORITHMS
