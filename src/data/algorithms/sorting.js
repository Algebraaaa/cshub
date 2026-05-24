// 自动从 algorithms.js 拆分（10 个算法 · sorting 学科）
import { bubbleSort } from '../../algorithms/sorting/bubbleSort'
import { bucketSort } from '../../algorithms/sorting/bucketSort'
import { countingSort } from '../../algorithms/sorting/countingSort'
import { heapSort } from '../../algorithms/sorting/heapSort'
import { insertionSort } from '../../algorithms/sorting/insertionSort'
import { mergeSort } from '../../algorithms/sorting/mergeSort'
import { quickSort } from '../../algorithms/sorting/quickSort'
import { radixSort } from '../../algorithms/sorting/radixSort'
import { selectionSort } from '../../algorithms/sorting/selectionSort'
import { shellSort } from '../../algorithms/sorting/shellSort'

export const SORTING_ALGORITHMS = {
  bubblesort: {
    slug: 'bubblesort',
    name: '冒泡排序',
    nameEn: 'Bubble Sort',
    category: 'sorting',
    difficulty: '基础',
    fn: bubbleSort,
    viz: 'sorting',
    timeComplexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
    spaceComplexity: 'O(1)',
    stable: true,
    inPlace: true,
    description: '相邻元素两两比较，每轮把当前最大值"冒泡"到末尾。',
    intuition: `想象一杯汽水中的气泡：较大的气泡会从底部"冒泡"上升到顶部。冒泡排序的工作方式与此类似——每一轮遍历都会将当前未排序部分的最大元素"冒泡"到末尾。

核心思想是：通过比较相邻元素并交换错误顺序的对，使得每一轮遍历后至少有一个元素到达最终位置。

虽然时间复杂度较高，但它实现简单、稳定，且在数组接近有序时可以通过提前终止（一轮无交换则停止）退化为 O(n)。`,
    pseudocode: `procedure bubbleSort(A):
    n ← length(A)
    repeat:
        swapped ← false
        for i from 0 to n-2:
            if A[i] > A[i+1]:
                swap(A[i], A[i+1])
                swapped ← true
        n ← n - 1
    until not swapped`,
    code: {
      cpp: `void bubbleSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; i++) {
        bool swapped = false;
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                swap(arr[j], arr[j + 1]);
                swapped = true;
            }
        }
        if (!swapped) break;  // 已经有序，提前结束
    }
}`,
      python: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        swapped = False
        for j in range(n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        if not swapped:
            break  # 已经有序，提前结束
    return arr`,
    },
    applications: [
      '教学场景：演示比较排序最直观的算法',
      '小规模数据排序（n < 50）',
      '近乎有序的数据（提前终止优化使其接近 O(n)）',
    ],
  },

  selectionsort: {
    slug: 'selectionsort',
    name: '选择排序',
    nameEn: 'Selection Sort',
    category: 'sorting',
    difficulty: '基础',
    fn: selectionSort,
    viz: 'sorting',
    timeComplexity: { best: 'O(n²)', average: 'O(n²)', worst: 'O(n²)' },
    spaceComplexity: 'O(1)',
    stable: false,
    inPlace: true,
    description: '每轮在剩余部分选出最小值，与当前位置交换。',
    intuition: `选择排序的思路非常直白：每一轮从未排序部分选出最小值，放到已排序部分的末尾。

具体来说，第 i 轮在 [i..n-1] 中扫描找到最小元素的位置，然后与 arr[i] 交换。这样每一轮固定一个元素的最终位置，n-1 轮后整个数组有序。

它的特点是**交换次数极少**（最多 n-1 次），但**比较次数固定**为 O(n²)，无论输入是否有序——这是它与冒泡排序最大的区别。

由于交换时可能跨越相等元素，选择排序是不稳定的。例如 [5a, 5b, 3]，第一轮 5a 与 3 交换，结果 5a 跑到了 5b 的右侧。`,
    pseudocode: `procedure selectionSort(A):
    n ← length(A)
    for i from 0 to n-2:
        minIdx ← i
        for j from i+1 to n-1:
            if A[j] < A[minIdx]:
                minIdx ← j
        if minIdx ≠ i:
            swap(A[i], A[minIdx])`,
    code: {
      cpp: `void selectionSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; i++) {
        int minIdx = i;
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIdx]) minIdx = j;
        }
        if (minIdx != i) swap(arr[i], arr[minIdx]);
    }
}`,
      python: `def selection_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        min_idx = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        if min_idx != i:
            arr[i], arr[min_idx] = arr[min_idx], arr[i]
    return arr`,
    },
    applications: [
      '交换成本远高于比较成本的场景（如外存元素移动昂贵）',
      '小规模数据 + 想要最少写入次数的场景',
      '教学：演示"每轮固定一个元素"的思想',
    ],
  },

  shellsort: {
    slug: 'shellsort',
    name: '希尔排序',
    nameEn: 'Shell Sort',
    category: 'sorting',
    difficulty: '中等',
    fn: shellSort,
    viz: 'sorting',
    timeComplexity: { best: 'O(n log n)', average: 'O(n^1.3)', worst: 'O(n²)' },
    spaceComplexity: 'O(1)',
    stable: false,
    inPlace: true,
    description: '以递减的 gap 序列做多轮插入排序，使数组逐渐接近有序。',
    intuition: `希尔排序是插入排序的改进版，核心思想是"让离最终位置很远的元素能快速移动"。

普通插入排序每次只能移动相邻元素，如果一个很小的元素在最右端，需要 n-1 步才能到头部。希尔排序用一个递减的 gap 序列（如 Knuth 序列：1, 4, 13, 40, …）解决了这个问题：

- 第一轮用大 gap（如 13），让每个元素与 13 步之外的元素比较并交换——大跳步移动，快速将元素移到大致正确的区域。
- 逐步缩小 gap，每轮做一次 gap-插入排序，让数组越来越有序。
- 最后一轮 gap=1，就是普通插入排序，但此时数组已接近有序，几乎不需要移动，非常快。

复杂度取决于 gap 序列的选取，Knuth 序列在实践中约为 O(n^1.3)，比普通插入排序 O(n²) 好很多，同时保持原地、无需额外空间。`,
    pseudocode: `procedure shellSort(A):
    gap ← 1
    while gap < length(A)/3: gap ← gap*3 + 1  // Knuth sequence
    while gap ≥ 1:
        for i from gap to length(A)-1:
            key ← A[i]
            j ← i
            while j ≥ gap and A[j-gap] > key:
                A[j] ← A[j-gap]
                j ← j - gap
            A[j] ← key
        gap ← ⌊gap/3⌋`,
    code: {
      cpp: `void shellSort(vector<int>& arr) {
    int n = arr.size();
    int gap = 1;
    while (gap < n / 3) gap = gap * 3 + 1;  // Knuth sequence

    while (gap >= 1) {
        for (int i = gap; i < n; i++) {
            int key = arr[i];
            int j = i;
            while (j >= gap && arr[j - gap] > key) {
                arr[j] = arr[j - gap];
                j -= gap;
            }
            arr[j] = key;
        }
        gap /= 3;
    }
}`,
      python: `def shell_sort(arr):
    n = len(arr)
    gap = 1
    while gap < n // 3:
        gap = gap * 3 + 1  # Knuth sequence

    while gap >= 1:
        for i in range(gap, n):
            key = arr[i]
            j = i
            while j >= gap and arr[j - gap] > key:
                arr[j] = arr[j - gap]
                j -= gap
            arr[j] = key
        gap //= 3
    return arr`,
    },
    applications: [
      '嵌入式系统：内存极度受限时的排序',
      'Introsort 的小数组后备（替换插入排序）',
      '链表不方便随机访问时，希尔排序比归并更实用',
      '了解"gap 序列影响复杂度"的最直观案例',
    ],
  },

  insertionsort: {
    slug: 'insertionsort',
    name: '插入排序',
    nameEn: 'Insertion Sort',
    category: 'sorting',
    difficulty: '基础',
    fn: insertionSort,
    viz: 'sorting',
    timeComplexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
    spaceComplexity: 'O(1)',
    stable: true,
    inPlace: true,
    description: '把元素一个一个插入到左侧已排序区的正确位置。',
    intuition: `想象你在打扑克牌，左手抓到的牌按顺序排好，每抓到一张新牌就插到合适的位置。插入排序的思路就是这样。

把数组的左半部分视为"已排序手牌"（最初只有 arr[0]），然后从 arr[1] 开始，依次取出每个元素 key，与已排序部分从右往左比较：比 key 大的元素都向右移动一位，直到找到 key 的合适位置插入。

它在**接近有序**的数组上极快——每次插入只需移动很少元素，最好情况 O(n)。这一优势让它成为许多复杂排序的"小数组优化"分支：例如 Timsort、introsort 在子数组小于一定阈值时切换到插入排序。

它是**稳定**的：相等元素不会跨越彼此，因为只在 A[j] > key 时才后移。`,
    pseudocode: `procedure insertionSort(A):
    n ← length(A)
    for i from 1 to n-1:
        key ← A[i]
        j ← i - 1
        while j ≥ 0 and A[j] > key:
            A[j+1] ← A[j]
            j ← j - 1
        A[j+1] ← key`,
    code: {
      cpp: `void insertionSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 1; i < n; i++) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
}`,
      python: `def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key
    return arr`,
    },
    applications: [
      '小规模或近乎有序的数据（最好 O(n)）',
      'Timsort、introsort 等混合排序的小数组优化',
      '在线排序：流式接收数据并保持有序',
      '链表排序（向已排序前缀插入只需 O(1) 移动）',
    ],
  },

  countingsort: {
    slug: 'countingsort',
    name: '计数排序',
    nameEn: 'Counting Sort',
    category: 'sorting',
    difficulty: '基础',
    fn: countingSort,
    viz: 'counting',
    timeComplexity: { best: 'O(n+k)', average: 'O(n+k)', worst: 'O(n+k)' },
    spaceComplexity: 'O(n+k)',
    stable: true,
    inPlace: false,
    description: '计数每个值出现次数，再用前缀和确定每个元素的输出位置。',
    intuition: `计数排序不基于比较，因此可以突破 O(n log n) 下界，达到线性时间 O(n+k)（k 为值域范围）。

三步走：
1. **计数**：遍历输入，对每个值 v，counts[v]++。时间 O(n)。
2. **前缀和**：counts[i] += counts[i-1]，将计数数组变为"位置数组"——counts[v] 表示值 ≤ v 的元素共有多少个，也就是最后一个值为 v 的元素在输出中的（右边界）位置。时间 O(k)。
3. **反向填充**（保证稳定性）：从右向左遍历输入，对元素 v，放到 output[counts[v]-1]，然后 counts[v]--。时间 O(n)。

关键限制：值域 k 不能太大，否则 O(k) 的空间开销不划算。整数值域适合；浮点数或字符串不适合直接用。`,
    pseudocode: `procedure countingSort(A, maxVal):
    counts ← array of 0 with size maxVal+1
    // Step 1: count
    for each v in A: counts[v]++
    // Step 2: prefix sum
    for i from 1 to maxVal: counts[i] += counts[i-1]
    // Step 3: output (reverse for stability)
    output ← array of size n
    for i from n-1 down to 0:
        output[counts[A[i]]-1] ← A[i]
        counts[A[i]]--
    copy output back to A`,
    code: {
      cpp: `void countingSort(vector<int>& arr) {
    if (arr.empty()) return;
    int maxVal = *max_element(arr.begin(), arr.end());
    vector<int> counts(maxVal + 1, 0);

    // Step 1: count
    for (int v : arr) counts[v]++;

    // Step 2: prefix sum
    for (int i = 1; i <= maxVal; i++) counts[i] += counts[i - 1];

    // Step 3: fill output (reverse for stability)
    vector<int> output(arr.size());
    for (int i = arr.size() - 1; i >= 0; i--) {
        output[--counts[arr[i]]] = arr[i];
    }
    arr = output;
}`,
      python: `def counting_sort(arr):
    if not arr:
        return arr
    max_val = max(arr)
    counts = [0] * (max_val + 1)

    # Step 1: count
    for v in arr:
        counts[v] += 1

    # Step 2: prefix sum
    for i in range(1, max_val + 1):
        counts[i] += counts[i - 1]

    # Step 3: fill output (reverse for stability)
    output = [0] * len(arr)
    for v in reversed(arr):
        counts[v] -= 1
        output[counts[v]] = v
    return output`,
    },
    applications: [
      '整数值域小的排序（学生成绩 0-100、年龄等）',
      '基数排序的内部子程序',
      '桶排序的特殊情况（每桶最多一个元素）',
      '需要稳定、线性时间排序的特定场景',
    ],
  },

  quicksort: {
    slug: 'quicksort',
    name: '快速排序',
    nameEn: 'Quick Sort',
    category: 'sorting',
    difficulty: '进阶',
    fn: quickSort,
    viz: 'sorting',
    timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)' },
    spaceComplexity: 'O(log n)',
    stable: false,
    inPlace: true,
    description: '分治思想：选 pivot 划分数组，递归排序两侧。',
    intuition: `快排的核心是"分而治之"。每一轮选定一个基准值（pivot），通过一次扫描把数组重新排列：所有小于 pivot 的元素移到它左侧，大于的移到右侧。这一步称为 partition（划分）。

划分完成后，pivot 已经在最终位置，左右两部分独立递归即可。

实践中快排通常比归并、堆排序更快，因为常数因子小、缓存友好。最坏情况 O(n²) 出现在 pivot 选取不当（如总是选最大或最小）的有序数组上，工业实现会通过随机化或三数取中规避。`,
    pseudocode: `procedure quickSort(A, low, high):
    if low < high:
        p ← partition(A, low, high)
        quickSort(A, low, p-1)
        quickSort(A, p+1, high)

procedure partition(A, low, high):
    pivot ← A[high]
    i ← low - 1
    for j from low to high-1:
        if A[j] ≤ pivot:
            i ← i + 1
            swap(A[i], A[j])
    swap(A[i+1], A[high])
    return i + 1`,
    code: {
      cpp: `int partition(vector<int>& arr, int low, int high) {
    int pivot = arr[high];
    int i = low - 1;
    for (int j = low; j < high; j++) {
        if (arr[j] <= pivot) {
            i++;
            swap(arr[i], arr[j]);
        }
    }
    swap(arr[i + 1], arr[high]);
    return i + 1;
}

void quickSort(vector<int>& arr, int low, int high) {
    if (low < high) {
        int p = partition(arr, low, high);
        quickSort(arr, low, p - 1);
        quickSort(arr, p + 1, high);
    }
}`,
      python: `def quick_sort(arr, low=0, high=None):
    if high is None:
        high = len(arr) - 1
    if low < high:
        p = partition(arr, low, high)
        quick_sort(arr, low, p - 1)
        quick_sort(arr, p + 1, high)
    return arr

def partition(arr, low, high):
    pivot = arr[high]
    i = low - 1
    for j in range(low, high):
        if arr[j] <= pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    arr[i + 1], arr[high] = arr[high], arr[i + 1]
    return i + 1`,
    },
    applications: [
      '通用排序：C 标准库 qsort、Java 基本类型排序',
      'Quickselect：寻找第 k 大元素，平均 O(n)',
      '需要原地、缓存友好排序的场景',
    ],
  },

  mergesort: {
    slug: 'mergesort',
    name: '归并排序',
    nameEn: 'Merge Sort',
    category: 'sorting',
    difficulty: '中等',
    fn: mergeSort,
    viz: 'sorting',
    timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
    spaceComplexity: 'O(n)',
    stable: true,
    inPlace: false,
    description: '分治：递归拆分至单元素，然后两两有序合并。',
    intuition: `归并排序也是分治算法，但与快排相反：它先无脑拆分，难点在合并。

把数组从中间拆成两半，递归排序左右两半，得到两个有序子数组。然后用双指针把两个有序子数组合并成一个有序数组——这一步是 O(n)。

主定理告诉我们 T(n) = 2T(n/2) + O(n) = O(n log n)，且与输入分布无关，因此最坏情况也保证 O(n log n)。代价是需要 O(n) 的额外空间存放合并结果。

它是稳定的，且天然适合外部排序（处理无法装入内存的大文件）。`,
    pseudocode: `procedure mergeSort(A, left, right):
    if left < right:
        mid ← ⌊(left + right) / 2⌋
        mergeSort(A, left, mid)
        mergeSort(A, mid+1, right)
        merge(A, left, mid, right)

procedure merge(A, left, mid, right):
    L ← A[left..mid], R ← A[mid+1..right]
    i ← j ← 0, k ← left
    while i < |L| and j < |R|:
        if L[i] ≤ R[j]: A[k++] ← L[i++]
        else: A[k++] ← R[j++]
    copy remaining from L or R`,
    code: {
      cpp: `void merge(vector<int>& arr, int left, int mid, int right) {
    vector<int> L(arr.begin() + left, arr.begin() + mid + 1);
    vector<int> R(arr.begin() + mid + 1, arr.begin() + right + 1);
    int i = 0, j = 0, k = left;
    while (i < L.size() && j < R.size()) {
        if (L[i] <= R[j]) arr[k++] = L[i++];
        else arr[k++] = R[j++];
    }
    while (i < L.size()) arr[k++] = L[i++];
    while (j < R.size()) arr[k++] = R[j++];
}

void mergeSort(vector<int>& arr, int left, int right) {
    if (left < right) {
        int mid = left + (right - left) / 2;
        mergeSort(arr, left, mid);
        mergeSort(arr, mid + 1, right);
        merge(arr, left, mid, right);
    }
}`,
      python: `def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)

def merge(L, R):
    result = []
    i = j = 0
    while i < len(L) and j < len(R):
        if L[i] <= R[j]:
            result.append(L[i])
            i += 1
        else:
            result.append(R[j])
            j += 1
    result.extend(L[i:])
    result.extend(R[j:])
    return result`,
    },
    applications: [
      '需要稳定排序的场景（保留相等元素相对顺序）',
      '外部排序：磁盘大文件排序',
      '链表排序（无需随机访问，O(1) 额外空间）',
      '逆序对计数等分治问题',
    ],
  },

  heapsort: {
    slug: 'heapsort',
    name: '堆排序',
    nameEn: 'Heap Sort',
    category: 'sorting',
    difficulty: '进阶',
    fn: heapSort,
    viz: 'heap',
    timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
    spaceComplexity: 'O(1)',
    stable: false,
    inPlace: true,
    description: '建大顶堆 → 反复取堆顶交换尾部 → 重新堆化。',
    intuition: `堆排序基于二叉堆数据结构。大顶堆是一棵完全二叉树，满足"父节点 ≥ 子节点"。它可以用数组紧凑存储（节点 i 的左右孩子分别是 2i+1 和 2i+2）。

算法分两阶段：
1. **建堆**：从最后一个非叶节点开始，自下而上对每个节点 sift down（下沉），把无序数组变为大顶堆，O(n)。
2. **排序**：堆顶就是当前最大值，把它与堆末尾交换，堆大小减 1，再对新堆顶 sift down 恢复堆性质。重复 n-1 次。

堆排序保证 O(n log n) 且原地（O(1) 空间），但缓存不友好（跳跃访问），实际比快排慢。它在嵌入式或对最坏情况敏感的场景有优势。`,
    pseudocode: `procedure heapSort(A):
    n ← length(A)
    for i from ⌊n/2⌋-1 down to 0:
        siftDown(A, i, n-1)         // 建堆
    for i from n-1 down to 1:
        swap(A[0], A[i])             // 取出最大值放到末尾
        siftDown(A, 0, i-1)          // 缩小堆并恢复

procedure siftDown(A, start, end):
    root ← start
    while 2*root+1 ≤ end:
        child ← 2*root+1
        if child+1 ≤ end and A[child+1] > A[child]:
            child ← child+1
        if A[root] ≥ A[child]: return
        swap(A[root], A[child])
        root ← child`,
    code: {
      cpp: `void siftDown(vector<int>& arr, int start, int end) {
    int root = start;
    while (root * 2 + 1 <= end) {
        int child = root * 2 + 1;
        if (child + 1 <= end && arr[child + 1] > arr[child]) child++;
        if (arr[root] >= arr[child]) return;
        swap(arr[root], arr[child]);
        root = child;
    }
}

void heapSort(vector<int>& arr) {
    int n = arr.size();
    // 建堆：从最后一个非叶节点开始 sift down
    for (int i = n / 2 - 1; i >= 0; i--) siftDown(arr, i, n - 1);
    // 反复取堆顶放到末尾
    for (int i = n - 1; i > 0; i--) {
        swap(arr[0], arr[i]);
        siftDown(arr, 0, i - 1);
    }
}`,
      python: `def sift_down(arr, start, end):
    root = start
    while root * 2 + 1 <= end:
        child = root * 2 + 1
        if child + 1 <= end and arr[child + 1] > arr[child]:
            child += 1
        if arr[root] >= arr[child]:
            return
        arr[root], arr[child] = arr[child], arr[root]
        root = child

def heap_sort(arr):
    n = len(arr)
    # 建堆：从最后一个非叶节点开始 sift down
    for i in range(n // 2 - 1, -1, -1):
        sift_down(arr, i, n - 1)
    # 反复取堆顶放到末尾
    for i in range(n - 1, 0, -1):
        arr[0], arr[i] = arr[i], arr[0]
        sift_down(arr, 0, i - 1)
    return arr`,
    },
    applications: [
      '优先队列实现（事件调度、任务队列）',
      'Top-K 问题（用小顶堆维护 k 个最大值）',
      '保证最坏 O(n log n) 且原地的排序需求',
      'Dijkstra、Prim 等图算法的内部数据结构',
    ],
  },

  radixsort: {
    slug: 'radixsort',
    name: '基数排序',
    nameEn: 'Radix Sort',
    category: 'sorting',
    difficulty: '中等',
    fn: radixSort,
    viz: 'radix',
    timeComplexity: { best: 'O(nk)', average: 'O(nk)', worst: 'O(nk)' },
    spaceComplexity: 'O(n+k)',
    stable: true,
    inPlace: false,
    description: '按位数从低到高，每位用计数排序，线性时间完成排序。',
    intuition: `基数排序（LSD，最低位优先）的思路是：**不直接比较整个数，而是逐位比较**。\n\n以排序 [170, 45, 75, 90, 802, 24, 2, 66] 为例：\n- 第1轮：按个位（0,5,5,0,2,4,2,6）分配到桶0-9，收集\n- 第2轮：按十位分配收集\n- 第3轮：按百位分配收集\n\n每一轮用计数排序（稳定），所以之前轮的顺序被保留。k 轮后完成排序。\n\n关键：**必须用稳定排序**做每一轮，否则之前位的相对顺序会被破坏。`,
    pseudocode: `procedure radixSort(A):\n    maxVal ← max(A)\n    exp ← 1\n    while maxVal / exp > 0:\n        countSortByDigit(A, exp)   // 按 exp 位做计数排序\n        exp ← exp × 10\n\nprocedure countSortByDigit(A, exp):\n    count[0..9] ← 0\n    for each v in A: count[(v/exp)%10]++\n    // 前缀和 + 反向填充（保证稳定）\n    ...`,
    code: {
      cpp: `void countByDigit(vector<int>& arr, int exp) {\n    int n = arr.size();\n    vector<int> output(n);\n    int count[10] = {};\n    for (int v : arr) count[(v / exp) % 10]++;\n    for (int i = 1; i < 10; i++) count[i] += count[i-1];\n    for (int i = n-1; i >= 0; i--) {\n        int d = (arr[i] / exp) % 10;\n        output[--count[d]] = arr[i];\n    }\n    arr = output;\n}\n\nvoid radixSort(vector<int>& arr) {\n    int maxVal = *max_element(arr.begin(), arr.end());\n    for (int exp = 1; maxVal / exp > 0; exp *= 10)\n        countByDigit(arr, exp);\n}`,
      python: `def radix_sort(arr):\n    max_val = max(arr)\n    exp = 1\n    while max_val // exp > 0:\n        _count_by_digit(arr, exp)\n        exp *= 10\n    return arr\n\ndef _count_by_digit(arr, exp):\n    n = len(arr)\n    output = [0] * n\n    count = [0] * 10\n    for v in arr: count[(v // exp) % 10] += 1\n    for i in range(1, 10): count[i] += count[i-1]\n    for i in range(n-1, -1, -1):\n        d = (arr[i] // exp) % 10\n        count[d] -= 1\n        output[count[d]] = arr[i]\n    arr[:] = output`,
    },
    applications: [
      '整数排序（字符串也可按字符位处理）',
      '基数排序是计数排序的泛化，适合多位整数',
      '固定长度字符串的字典序排序',
      '大规模整数数据的线性时间排序',
    ],
  },

  bucketsort: {
    slug: 'bucketsort',
    name: '桶排序',
    nameEn: 'Bucket Sort',
    category: 'sorting',
    difficulty: '中等',
    fn: bucketSort,
    viz: 'bucket',
    timeComplexity: { best: 'O(n+k)', average: 'O(n+k)', worst: 'O(n²)' },
    spaceComplexity: 'O(n+k)',
    stable: true,
    inPlace: false,
    description: '将数据均匀分配到多个桶，桶内排序后合并。',
    intuition: `桶排序假设输入数据**均匀分布**在某个范围内。将范围划分为 k 个等宽区间（桶），每个元素按值放入对应桶，每个桶内部再用插入排序，最后按桶序拼接。\n\n平均情况下每个桶只有 n/k 个元素，插入排序接近 O(1)，总时间 O(n+k)。\n\n最坏情况（所有元素落到同一桶）退化为 O(n²)。`,
    pseudocode: `procedure bucketSort(A):\n    n ← |A|, maxV ← max(A), minV ← min(A)\n    k ← ⌊√n⌋  // 桶数\n    buckets ← k 个空桶\n    for v in A:\n        bi ← ⌊(v - minV) / (maxV - minV + 1) × k⌋\n        buckets[bi].append(v)\n    for each bucket: insertionSort(bucket)\n    A ← concat(buckets)`,
    code: {
      cpp: `void bucketSort(vector<double>& arr) {\n    int n = arr.size();\n    vector<vector<double>> buckets(n);\n    for (double v : arr) {\n        int bi = (int)(v * n);  // 假设 v ∈ [0,1)\n        buckets[bi].push_back(v);\n    }\n    for (auto& b : buckets)\n        sort(b.begin(), b.end());\n    int idx = 0;\n    for (auto& b : buckets)\n        for (double v : b) arr[idx++] = v;\n}`,
      python: `def bucket_sort(arr):\n    n = len(arr)\n    max_v, min_v = max(arr), min(arr)\n    k = max(2, int(n ** 0.5))\n    buckets = [[] for _ in range(k)]\n    for v in arr:\n        bi = min(k-1, int((v - min_v) / (max_v - min_v + 1e-9) * k))\n        buckets[bi].append(v)\n    result = []\n    for b in buckets:\n        b.sort()\n        result.extend(b)\n    return result`,
    },
    applications: [
      '浮点数均匀分布的排序（如 [0,1) 内的随机数）',
      '数据均匀分布时接近线性时间',
      '外部排序的分片阶段',
    ],
  },

}

export default SORTING_ALGORITHMS
