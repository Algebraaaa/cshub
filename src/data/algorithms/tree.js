// 自动从 algorithms.js 拆分（4 个算法 · tree 学科）
import { avlInsertSequence } from '../../algorithms/tree/avl'
import { bstInsertSequence } from '../../algorithms/tree/bst'
import { rbInsertSequence } from '../../algorithms/tree/redBlack'
import { treapInsertSequence } from '../../algorithms/tree/treap'

export const TREE_ALGORITHMS = {
  bst: {
    slug: 'bst',
    name: '二叉搜索树 BST',
    nameEn: 'Binary Search Tree',
    category: 'tree',
    difficulty: '基础',
    fn: bstInsertSequence,
    viz: 'bst',
    timeComplexity: { best: 'O(log n)', average: 'O(log n)', worst: 'O(n)' },
    spaceComplexity: 'O(n)',
    description: '左子树都比根小，右子树都比根大。',
    intuition: `BST 是有序数据结构，关键不变量是：对任意节点，左子树所有值 < 节点值 < 右子树所有值。

查找时，与当前节点比较，小则向左、大则向右，每次砍掉一半。插入沿同样路径走到 null 处挂上新节点。

BST 的性能取决于树高。理想平衡时高度 O(log n)，但**插入顺序决定形状**——按升序插入会退化为链表，所有操作变 O(n)。

为解决退化问题，工业实现使用自平衡 BST：红黑树、AVL 树等。`,
    pseudocode: `procedure insert(root, value):
    if root is null: return new Node(value)
    if value < root.value:
        root.left ← insert(root.left, value)
    else:
        root.right ← insert(root.right, value)
    return root

procedure search(root, value):
    if root is null or root.value = value: return root
    if value < root.value: return search(root.left, value)
    else: return search(root.right, value)`,
    code: {
      cpp: `struct Node {
    int value;
    Node *left, *right;
    Node(int v) : value(v), left(nullptr), right(nullptr) {}
};

Node* insert(Node* root, int value) {
    if (!root) return new Node(value);
    if (value < root->value)
        root->left = insert(root->left, value);
    else if (value > root->value)
        root->right = insert(root->right, value);
    return root;
}

Node* search(Node* root, int value) {
    if (!root || root->value == value) return root;
    return value < root->value
        ? search(root->left, value)
        : search(root->right, value);
}`,
      python: `class Node:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None

def insert(root, value):
    if not root:
        return Node(value)
    if value < root.value:
        root.left = insert(root.left, value)
    elif value > root.value:
        root.right = insert(root.right, value)
    return root

def search(root, value):
    if not root or root.value == value:
        return root
    if value < root.value:
        return search(root.left, value)
    return search(root.right, value)`,
    },
    applications: [
      '有序集合的基础结构（思想被红黑树/AVL 继承）',
      '范围查询、k-th 元素查询',
      '理解所有平衡 BST 的前置基础',
    ],
  },

  redblack: {
    slug: 'redblack',
    name: '红黑树',
    nameEn: 'Red-Black Tree',
    category: 'tree',
    difficulty: '进阶',
    fn: rbInsertSequence,
    viz: 'rb',
    timeComplexity: { best: 'O(log n)', average: 'O(log n)', worst: 'O(log n)' },
    spaceComplexity: 'O(n)',
    description: '通过颜色和旋转规则保证树高不超过 2log(n+1)。',
    intuition: `红黑树是自平衡 BST，通过给每个节点染色（红或黑）并强制以下五条性质，把高度限制在 O(log n)：

1. 每个节点要么红，要么黑
2. 根节点是黑的
3. 所有叶子（NIL）是黑的
4. 红节点的孩子必须是黑的（不能有连续红节点）
5. 任一节点到其后代叶子的所有路径包含相同数量的黑节点

插入新节点时染红（不破坏性质 5），可能破坏性质 4（红红冲突）。修复（fixup）通过三种 case：
- **Case 1**：叔叔是红色 → 父叔变黑，祖父变红，问题上移
- **Case 2**：叔叔是黑色，z 是父的"内侧"孩子 → 旋转父变成 Case 3
- **Case 3**：叔叔是黑色，z 是父的"外侧"孩子 → 父变黑、祖父变红、对祖父旋转`,
    pseudocode: `procedure rbInsert(T, z):
    BST insert z, color z RED
    rbInsertFixup(T, z)

procedure rbInsertFixup(T, z):
    while z.parent.color = RED:
        if z.parent = z.parent.parent.left:
            uncle ← z.parent.parent.right
            if uncle.color = RED:                    # Case 1
                z.parent.color ← BLACK
                uncle.color ← BLACK
                z.parent.parent.color ← RED
                z ← z.parent.parent
            else:
                if z = z.parent.right:                # Case 2
                    z ← z.parent
                    leftRotate(T, z)
                z.parent.color ← BLACK                # Case 3
                z.parent.parent.color ← RED
                rightRotate(T, z.parent.parent)
        else: # symmetric
            ...
    T.root.color ← BLACK`,
    code: {
      cpp: `enum Color { RED, BLACK };

struct RBNode {
    int value;
    Color color;
    RBNode *left, *right, *parent;
    RBNode(int v) : value(v), color(RED),
                    left(nullptr), right(nullptr), parent(nullptr) {}
};

void rotateLeft(RBNode*& root, RBNode* x) {
    RBNode* y = x->right;
    x->right = y->left;
    if (y->left) y->left->parent = x;
    y->parent = x->parent;
    if (!x->parent) root = y;
    else if (x == x->parent->left) x->parent->left = y;
    else x->parent->right = y;
    y->left = x;
    x->parent = y;
}

void rbInsertFixup(RBNode*& root, RBNode* z) {
    while (z->parent && z->parent->color == RED) {
        RBNode* gp = z->parent->parent;
        if (z->parent == gp->left) {
            RBNode* uncle = gp->right;
            if (uncle && uncle->color == RED) {        // Case 1
                z->parent->color = BLACK;
                uncle->color = BLACK;
                gp->color = RED;
                z = gp;
            } else {
                if (z == z->parent->right) {           // Case 2
                    z = z->parent;
                    rotateLeft(root, z);
                }
                z->parent->color = BLACK;              // Case 3
                gp->color = RED;
                rotateRight(root, gp);
            }
        } else {
            // 对称情况：左右互换
        }
    }
    root->color = BLACK;
}`,
      python: `RED, BLACK = 'RED', 'BLACK'

class RBNode:
    def __init__(self, value):
        self.value = value
        self.color = RED
        self.left = None
        self.right = None
        self.parent = None

def rotate_left(tree, x):
    y = x.right
    x.right = y.left
    if y.left:
        y.left.parent = x
    y.parent = x.parent
    if not x.parent:
        tree['root'] = y
    elif x is x.parent.left:
        x.parent.left = y
    else:
        x.parent.right = y
    y.left = x
    x.parent = y

def rb_insert_fixup(tree, z):
    while z.parent and z.parent.color == RED:
        gp = z.parent.parent
        if z.parent is gp.left:
            uncle = gp.right
            if uncle and uncle.color == RED:        # Case 1
                z.parent.color = BLACK
                uncle.color = BLACK
                gp.color = RED
                z = gp
            else:
                if z is z.parent.right:             # Case 2
                    z = z.parent
                    rotate_left(tree, z)
                z.parent.color = BLACK              # Case 3
                gp.color = RED
                rotate_right(tree, gp)
        else:
            pass  # 对称情况：左右互换
    tree['root'].color = BLACK`,
    },
    applications: [
      'C++ STL 的 std::map / std::set',
      'Java 的 TreeMap / TreeSet / HashMap（链表过长时）',
      'Linux 内核的 CFS 调度器、epoll、虚拟内存管理',
      '对最坏 O(log n) 有要求的有序数据结构场景',
    ],
  },

  avl: {
    slug: 'avl',
    name: 'AVL 树',
    nameEn: 'AVL Tree',
    category: 'tree',
    difficulty: '进阶',
    fn: avlInsertSequence,
    viz: 'avl',
    timeComplexity: { best: 'O(log n)', average: 'O(log n)', worst: 'O(log n)' },
    spaceComplexity: 'O(n)',
    description: '自平衡二叉搜索树，任意节点左右子树高度差不超过1。',
    intuition: `AVL 树是第一个被发明的自平衡 BST（1962年，Adelson-Velsky & Landis）。它通过维护**平衡因子**（左子树高 - 右子树高）保证树高始终为 O(log n)。\n\n每次插入后，从插入点回溯到根，若某节点平衡因子变为 ±2，触发旋转：\n- **LL**：右旋一次\n- **RR**：左旋一次\n- **LR**：先左旋子树再右旋\n- **RL**：先右旋子树再左旋\n\n与红黑树相比，AVL 树更严格平衡，查找更快；但插入/删除旋转更频繁。`,
    pseudocode: `procedure insert(node, val):\n    // 1. 普通 BST 插入\n    if val < node.val: node.left = insert(node.left, val)\n    else: node.right = insert(node.right, val)\n    // 2. 更新高度\n    updateHeight(node)\n    // 3. 检查平衡因子并旋转\n    bf ← height(left) - height(right)\n    if bf > 1:  // 左重\n        if val < node.left.val: return rotateRight(node)   // LL\n        else: node.left = rotateLeft(node.left); return rotateRight(node)  // LR\n    if bf < -1:  // 右重\n        if val >= node.right.val: return rotateLeft(node)  // RR\n        else: node.right = rotateRight(node.right); return rotateLeft(node)  // RL`,
    code: {
      cpp: `struct Node { int val, height; Node *left, *right; };\n\nint height(Node* n) { return n ? n->height : 0; }\nvoid updateH(Node* n) { if(n) n->height = 1 + max(height(n->left), height(n->right)); }\n\nNode* rotateRight(Node* y) {\n    Node* x = y->left; y->left = x->right; x->right = y;\n    updateH(y); updateH(x); return x;\n}\nNode* rotateLeft(Node* x) {\n    Node* y = x->right; x->right = y->left; y->left = x;\n    updateH(x); updateH(y); return y;\n}\n\nNode* insert(Node* node, int val) {\n    if (!node) return new Node{val, 1, nullptr, nullptr};\n    if (val < node->val) node->left = insert(node->left, val);\n    else node->right = insert(node->right, val);\n    updateH(node);\n    int bf = height(node->left) - height(node->right);\n    if (bf > 1 && val < node->left->val) return rotateRight(node);   // LL\n    if (bf > 1) { node->left = rotateLeft(node->left); return rotateRight(node); } // LR\n    if (bf < -1 && val >= node->right->val) return rotateLeft(node); // RR\n    if (bf < -1) { node->right = rotateRight(node->right); return rotateLeft(node); } // RL\n    return node;\n}`,
      python: `class Node:\n    def __init__(self, val): self.val=val; self.h=1; self.l=self.r=None\n\ndef height(n): return n.h if n else 0\ndef upd(n):\n    if n: n.h = 1 + max(height(n.l), height(n.r))\n\ndef rot_right(y):\n    x=y.l; y.l=x.r; x.r=y; upd(y); upd(x); return x\ndef rot_left(x):\n    y=x.r; x.r=y.l; y.l=x; upd(x); upd(y); return y\n\ndef insert(node, val):\n    if not node: return Node(val)\n    if val < node.val: node.l = insert(node.l, val)\n    else: node.r = insert(node.r, val)\n    upd(node)\n    bf = height(node.l) - height(node.r)\n    if bf > 1 and val < node.l.val: return rot_right(node)\n    if bf > 1: node.l = rot_left(node.l); return rot_right(node)\n    if bf < -1 and val >= node.r.val: return rot_left(node)\n    if bf < -1: node.r = rot_right(node.r); return rot_left(node)\n    return node`,
    },
    applications: [
      '数据库索引（对查询频率极高的场景）',
      '需要严格 O(log n) 查找的实时系统',
      '计算几何中的区间树、线段树底层',
    ],
  },

  treap: {
    slug: 'treap',
    name: 'Treap',
    nameEn: 'Treap',
    category: 'tree',
    difficulty: '进阶',
    fn: treapInsertSequence,
    viz: 'treap',
    timeComplexity: { best: 'O(log n)', average: 'O(log n)', worst: 'O(n)' },
    spaceComplexity: 'O(n)',
    description: 'BST（按键值）+ 堆（按随机优先级），期望树高 O(log n)。',
    intuition: `Treap = **Tr**ee + H**eap**，每个节点有两个属性：键值 key（满足 BST 性质）和随机优先级 priority（满足堆性质，父节点优先级小于子节点）。\n\n随机优先级让 Treap 期望树高为 O(log n)，以极高概率避免退化。插入时先按 BST 规则找到位置插入，若堆性质被破坏则旋转修复。\n\n优点：**实现简单**（相比 AVL/红黑树），且期望性能等同于随机化 BST。竞赛中常用。`,
    pseudocode: `procedure insert(node, key, prio):\n    if node = null: return newNode(key, prio)\n    if key < node.key:\n        node.left = insert(node.left, key, prio)\n        if node.left.prio < node.prio:  // 堆性质破坏\n            node = rotateRight(node)\n    else:\n        node.right = insert(node.right, key, prio)\n        if node.right.prio < node.prio:\n            node = rotateLeft(node)\n    return node`,
    code: {
      cpp: `struct Node { int key, prio; Node *l, *r; };\n\nNode* rotR(Node* y) { Node* x=y->l; y->l=x->r; x->r=y; return x; }\nNode* rotL(Node* x) { Node* y=x->r; x->r=y->l; y->l=x; return y; }\n\nNode* insert(Node* t, int key) {\n    if (!t) return new Node{key, rand(), nullptr, nullptr};\n    if (key < t->key) {\n        t->l = insert(t->l, key);\n        if (t->l->prio < t->prio) t = rotR(t);\n    } else {\n        t->r = insert(t->r, key);\n        if (t->r->prio < t->prio) t = rotL(t);\n    }\n    return t;\n}`,
      python: `import random\nclass Node:\n    def __init__(self, k): self.k=k; self.p=random.random(); self.l=self.r=None\n\ndef rot_r(y): x=y.l; y.l=x.r; x.r=y; return x\ndef rot_l(x): y=x.r; x.r=y.l; y.l=x; return y\n\ndef insert(t, key):\n    if not t: return Node(key)\n    if key < t.k:\n        t.l = insert(t.l, key)\n        if t.l.p < t.p: t = rot_r(t)\n    else:\n        t.r = insert(t.r, key)\n        if t.r.p < t.p: t = rot_l(t)\n    return t`,
    },
    applications: [
      '竞赛编程中的有序集合实现',
      '随机化平衡树，避免故意构造的退化输入',
      '可持久化数据结构的基础',
    ],
  },

}

export default TREE_ALGORITHMS
