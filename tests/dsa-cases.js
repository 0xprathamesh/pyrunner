/**
 * DSA test cases for py-runner.
 * Each case is a complete Python program: reads stdin, prints stdout.
 */
module.exports = [
  // ── Arrays ──────────────────────────────────────────────
  {
    id: 'arr-01',
    title: 'Two Sum indices',
    topic: 'arrays',
    difficulty: 'easy',
    source_code: `
nums = list(map(int, input().split()))
target = int(input())
seen = {}
for i, x in enumerate(nums):
    if target - x in seen:
        print(seen[target - x], i)
        break
    seen[x] = i
`.trim(),
    stdin: '2 7 11 15\n9\n',
    expected_stdout: '0 1',
  },
  {
    id: 'arr-02',
    title: 'Max subarray sum (Kadane)',
    topic: 'arrays',
    difficulty: 'medium',
    source_code: `
nums = list(map(int, input().split()))
best = cur = nums[0]
for x in nums[1:]:
    cur = max(x, cur + x)
    best = max(best, cur)
print(best)
`.trim(),
    stdin: '-2 1 -3 4 -1 2 1 -5 4\n',
    expected_stdout: '6',
  },
  {
    id: 'arr-03',
    title: 'Rotate array right by k',
    topic: 'arrays',
    difficulty: 'medium',
    source_code: `
nums = list(map(int, input().split()))
k = int(input()) % len(nums)
print(*(nums[-k:] + nums[:-k]))
`.trim(),
    stdin: '1 2 3 4 5 6 7\n3\n',
    expected_stdout: '5 6 7 1 2 3 4',
  },
  {
    id: 'arr-04',
    title: 'Product of array except self',
    topic: 'arrays',
    difficulty: 'medium',
    source_code: `
nums = list(map(int, input().split()))
n = len(nums)
out = [1] * n
left = 1
for i in range(n):
    out[i] = left
    left *= nums[i]
right = 1
for i in range(n - 1, -1, -1):
    out[i] *= right
    right *= nums[i]
print(*out)
`.trim(),
    stdin: '1 2 3 4\n',
    expected_stdout: '24 12 8 6',
  },
  {
    id: 'arr-05',
    title: 'Move zeros to end',
    topic: 'arrays',
    difficulty: 'easy',
    source_code: `
nums = list(map(int, input().split()))
j = 0
for i in range(len(nums)):
    if nums[i] != 0:
        nums[j], nums[i] = nums[i], nums[j]
        j += 1
print(*nums)
`.trim(),
    stdin: '0 1 0 3 12\n',
    expected_stdout: '1 3 12 0 0',
  },

  // ── Two pointers / Sliding window ───────────────────────
  {
    id: 'tp-01',
    title: 'Valid palindrome (alphanumeric)',
    topic: 'two-pointers',
    difficulty: 'easy',
    source_code: `
s = ''.join(c.lower() for c in input() if c.isalnum())
print('true' if s == s[::-1] else 'false')
`.trim(),
    stdin: 'A man, a plan, a canal: Panama\n',
    expected_stdout: 'true',
  },
  {
    id: 'tp-02',
    title: 'Container with most water',
    topic: 'two-pointers',
    difficulty: 'medium',
    source_code: `
h = list(map(int, input().split()))
l, r, best = 0, len(h) - 1, 0
while l < r:
    best = max(best, min(h[l], h[r]) * (r - l))
    if h[l] < h[r]:
        l += 1
    else:
        r -= 1
print(best)
`.trim(),
    stdin: '1 8 6 2 5 4 8 3 7\n',
    expected_stdout: '49',
  },
  {
    id: 'tp-03',
    title: 'Longest substring without repeating chars',
    topic: 'sliding-window',
    difficulty: 'medium',
    source_code: `
s = input().strip()
seen, left, best = {}, 0, 0
for right, ch in enumerate(s):
    if ch in seen and seen[ch] >= left:
        left = seen[ch] + 1
    seen[ch] = right
    best = max(best, right - left + 1)
print(best)
`.trim(),
    stdin: 'abcabcbb\n',
    expected_stdout: '3',
  },
  {
    id: 'tp-04',
    title: 'Minimum window length covering chars',
    topic: 'sliding-window',
    difficulty: 'hard',
    source_code: `
from collections import Counter
s = input().strip()
t = input().strip()
need = Counter(t)
missing = len(t)
left = 0
best = float('inf')
best_l = 0
for right, ch in enumerate(s):
    if need[ch] > 0:
        missing -= 1
    need[ch] -= 1
    while missing == 0:
        if right - left + 1 < best:
            best = right - left + 1
            best_l = left
        need[s[left]] += 1
        if need[s[left]] > 0:
            missing += 1
        left += 1
print(best if best != float('inf') else 0)
`.trim(),
    stdin: 'ADOBECODEBANC\nABC\n',
    expected_stdout: '4',
  },
  {
    id: 'tp-05',
    title: '3Sum closest target count pairs',
    topic: 'two-pointers',
    difficulty: 'medium',
    source_code: `
nums = sorted(map(int, input().split()))
target = int(input())
best = nums[0] + nums[1] + nums[2]
for i in range(len(nums) - 2):
    l, r = i + 1, len(nums) - 1
    while l < r:
        s = nums[i] + nums[l] + nums[r]
        if abs(s - target) < abs(best - target):
            best = s
        if s < target:
            l += 1
        elif s > target:
            r -= 1
        else:
            print(s)
            raise SystemExit
print(best)
`.trim(),
    stdin: '-1 2 1 -4\n1\n',
    expected_stdout: '2',
  },

  // ── Strings ─────────────────────────────────────────────
  {
    id: 'str-01',
    title: 'Reverse words in a string',
    topic: 'strings',
    difficulty: 'easy',
    source_code: `
print(' '.join(input().split()[::-1]))
`.trim(),
    stdin: 'the sky is blue\n',
    expected_stdout: 'blue is sky the',
  },
  {
    id: 'str-02',
    title: 'Anagram check',
    topic: 'strings',
    difficulty: 'easy',
    source_code: `
from collections import Counter
a = input().strip()
b = input().strip()
print('true' if Counter(a) == Counter(b) else 'false')
`.trim(),
    stdin: 'anagram\nnagaram\n',
    expected_stdout: 'true',
  },
  {
    id: 'str-03',
    title: 'Longest common prefix',
    topic: 'strings',
    difficulty: 'easy',
    source_code: `
words = input().split()
prefix = words[0]
for w in words[1:]:
    while not w.startswith(prefix):
        prefix = prefix[:-1]
        if not prefix:
            break
print(prefix)
`.trim(),
    stdin: 'flower flow flight\n',
    expected_stdout: 'fl',
  },
  {
    id: 'str-04',
    title: 'String compression RLE',
    topic: 'strings',
    difficulty: 'easy',
    source_code: `
s = input().strip()
if not s:
    print('')
else:
    out = []
    i = 0
    while i < len(s):
        j = i
        while j < len(s) and s[j] == s[i]:
            j += 1
        out.append(s[i] + str(j - i))
        i = j
    print(''.join(out))
`.trim(),
    stdin: 'aaabbc\n',
    expected_stdout: 'a3b2c1',
  },
  {
    id: 'str-05',
    title: 'Group anagrams count',
    topic: 'strings',
    difficulty: 'medium',
    source_code: `
from collections import defaultdict
words = input().split()
groups = defaultdict(list)
for w in words:
    groups[''.join(sorted(w))].append(w)
print(len(groups))
`.trim(),
    stdin: 'eat tea tan ate nat bat\n',
    expected_stdout: '3',
  },

  // ── Stack / Queue ───────────────────────────────────────
  {
    id: 'stk-01',
    title: 'Valid parentheses',
    topic: 'stack',
    difficulty: 'easy',
    source_code: `
s = input().strip()
stack = []
pairs = {')': '(', ']': '[', '}': '{'}
ok = True
for ch in s:
    if ch in '([{':
        stack.append(ch)
    else:
        if not stack or stack[-1] != pairs[ch]:
            ok = False
            break
        stack.pop()
print('true' if ok and not stack else 'false')
`.trim(),
    stdin: '{[()]}\n',
    expected_stdout: 'true',
  },
  {
    id: 'stk-02',
    title: 'Daily temperatures (next warmer)',
    topic: 'stack',
    difficulty: 'medium',
    source_code: `
temps = list(map(int, input().split()))
n = len(temps)
ans = [0] * n
stack = []
for i, t in enumerate(temps):
    while stack and temps[stack[-1]] < t:
        j = stack.pop()
        ans[j] = i - j
    stack.append(i)
print(*ans)
`.trim(),
    stdin: '73 74 75 71 69 72 76 73\n',
    expected_stdout: '1 1 4 2 1 1 0 0',
  },
  {
    id: 'stk-03',
    title: 'Evaluate RPN',
    topic: 'stack',
    difficulty: 'medium',
    source_code: `
tokens = input().split()
stack = []
for t in tokens:
    if t in '+-*/':
        b, a = stack.pop(), stack.pop()
        if t == '+':
            stack.append(a + b)
        elif t == '-':
            stack.append(a - b)
        elif t == '*':
            stack.append(a * b)
        else:
            stack.append(int(a / b))
    else:
        stack.append(int(t))
print(stack[-1])
`.trim(),
    stdin: '2 1 + 3 *\n',
    expected_stdout: '9',
  },
  {
    id: 'stk-04',
    title: 'Next greater element',
    topic: 'stack',
    difficulty: 'medium',
    source_code: `
nums = list(map(int, input().split()))
n = len(nums)
ans = [-1] * n
stack = []
for i in range(n):
    while stack and nums[stack[-1]] < nums[i]:
        ans[stack.pop()] = nums[i]
    stack.append(i)
print(*ans)
`.trim(),
    stdin: '2 1 2 4 3\n',
    expected_stdout: '4 2 4 -1 -1',
  },
  {
    id: 'stk-05',
    title: 'Min stack getMin sequence',
    topic: 'stack',
    difficulty: 'medium',
    source_code: `
ops = input().split()
stack, mins = [], []
out = []
i = 0
while i < len(ops):
    op = ops[i]
    if op == 'push':
        i += 1
        x = int(ops[i])
        stack.append(x)
        mins.append(x if not mins else min(mins[-1], x))
    elif op == 'pop':
        stack.pop()
        mins.pop()
    elif op == 'top':
        out.append(str(stack[-1]))
    elif op == 'min':
        out.append(str(mins[-1]))
    i += 1
print(' '.join(out))
`.trim(),
    stdin: 'push -2 push 0 push -3 min pop top min\n',
    expected_stdout: '-3 0 -2',
  },

  // ── Hashing ─────────────────────────────────────────────
  {
    id: 'hash-01',
    title: 'First unique character index',
    topic: 'hashing',
    difficulty: 'easy',
    source_code: `
from collections import Counter
s = input().strip()
cnt = Counter(s)
ans = -1
for i, ch in enumerate(s):
    if cnt[ch] == 1:
        ans = i
        break
print(ans)
`.trim(),
    stdin: 'leetcode\n',
    expected_stdout: '0',
  },
  {
    id: 'hash-02',
    title: 'Subarray sum equals k (count)',
    topic: 'hashing',
    difficulty: 'medium',
    source_code: `
from collections import defaultdict
nums = list(map(int, input().split()))
k = int(input())
pref = 0
seen = defaultdict(int)
seen[0] = 1
ans = 0
for x in nums:
    pref += x
    ans += seen[pref - k]
    seen[pref] += 1
print(ans)
`.trim(),
    stdin: '1 1 1\n2\n',
    expected_stdout: '2',
  },
  {
    id: 'hash-03',
    title: 'Longest consecutive sequence',
    topic: 'hashing',
    difficulty: 'medium',
    source_code: `
nums = set(map(int, input().split()))
best = 0
for x in nums:
    if x - 1 not in nums:
        y = x
        while y in nums:
            y += 1
        best = max(best, y - x)
print(best)
`.trim(),
    stdin: '100 4 200 1 3 2\n',
    expected_stdout: '4',
  },
  {
    id: 'hash-04',
    title: 'Top K frequent elements',
    topic: 'hashing',
    difficulty: 'medium',
    source_code: `
from collections import Counter
nums = list(map(int, input().split()))
k = int(input())
print(*[x for x, _ in Counter(nums).most_common(k)])
`.trim(),
    stdin: '1 1 1 2 2 3\n2\n',
    expected_stdout: '1 2',
  },

  // ── Sorting / Searching ─────────────────────────────────
  {
    id: 'sort-01',
    title: 'Binary search index',
    topic: 'searching',
    difficulty: 'easy',
    source_code: `
nums = list(map(int, input().split()))
target = int(input())
lo, hi = 0, len(nums) - 1
ans = -1
while lo <= hi:
    mid = (lo + hi) // 2
    if nums[mid] == target:
        ans = mid
        break
    if nums[mid] < target:
        lo = mid + 1
    else:
        hi = mid - 1
print(ans)
`.trim(),
    stdin: '-1 0 3 5 9 12\n9\n',
    expected_stdout: '4',
  },
  {
    id: 'sort-02',
    title: 'Merge intervals count',
    topic: 'sorting',
    difficulty: 'medium',
    source_code: `
n = int(input())
intervals = [tuple(map(int, input().split())) for _ in range(n)]
intervals.sort()
merged = [list(intervals[0])]
for s, e in intervals[1:]:
    if s <= merged[-1][1]:
        merged[-1][1] = max(merged[-1][1], e)
    else:
        merged.append([s, e])
print(len(merged))
`.trim(),
    stdin: '4\n1 3\n2 6\n8 10\n15 18\n',
    expected_stdout: '3',
  },
  {
    id: 'sort-03',
    title: 'Kth largest element',
    topic: 'sorting',
    difficulty: 'medium',
    source_code: `
import heapq
nums = list(map(int, input().split()))
k = int(input())
print(heapq.nlargest(k, nums)[-1])
`.trim(),
    stdin: '3 2 1 5 6 4\n2\n',
    expected_stdout: '5',
  },
  {
    id: 'sort-04',
    title: 'Search in rotated sorted array',
    topic: 'searching',
    difficulty: 'medium',
    source_code: `
nums = list(map(int, input().split()))
target = int(input())
lo, hi = 0, len(nums) - 1
ans = -1
while lo <= hi:
    mid = (lo + hi) // 2
    if nums[mid] == target:
        ans = mid
        break
    if nums[lo] <= nums[mid]:
        if nums[lo] <= target < nums[mid]:
            hi = mid - 1
        else:
            lo = mid + 1
    else:
        if nums[mid] < target <= nums[hi]:
            lo = mid + 1
        else:
            hi = mid - 1
print(ans)
`.trim(),
    stdin: '4 5 6 7 0 1 2\n0\n',
    expected_stdout: '4',
  },
  {
    id: 'sort-05',
    title: 'Find peak element index',
    topic: 'searching',
    difficulty: 'medium',
    source_code: `
nums = list(map(int, input().split()))
lo, hi = 0, len(nums) - 1
while lo < hi:
    mid = (lo + hi) // 2
    if nums[mid] < nums[mid + 1]:
        lo = mid + 1
    else:
        hi = mid
print(lo)
`.trim(),
    stdin: '1 2 1 3 5 6 4\n',
    expected_stdout: '5',
  },

  // ── Linked list (array simulation) ──────────────────────
  {
    id: 'll-01',
    title: 'Reverse linked list values',
    topic: 'linked-list',
    difficulty: 'easy',
    source_code: `
vals = list(map(int, input().split()))
print(*vals[::-1])
`.trim(),
    stdin: '1 2 3 4 5\n',
    expected_stdout: '5 4 3 2 1',
  },
  {
    id: 'll-02',
    title: 'Detect cycle (Floyd simulation)',
    topic: 'linked-list',
    difficulty: 'medium',
    source_code: `
# next[i] = index of next node, -1 = null; start at 0
n = int(input())
nxt = list(map(int, input().split()))
slow = fast = 0
has = False
while fast != -1 and nxt[fast] != -1:
    slow = nxt[slow]
    fast = nxt[nxt[fast]]
    if slow == fast:
        has = True
        break
print('true' if has else 'false')
`.trim(),
    stdin: '4\n1 2 3 1\n',
    expected_stdout: 'true',
  },
  {
    id: 'll-03',
    title: 'Merge two sorted lists',
    topic: 'linked-list',
    difficulty: 'easy',
    source_code: `
a = list(map(int, input().split()))
b = list(map(int, input().split()))
i = j = 0
out = []
while i < len(a) and j < len(b):
    if a[i] <= b[j]:
        out.append(a[i]); i += 1
    else:
        out.append(b[j]); j += 1
out.extend(a[i:])
out.extend(b[j:])
print(*out)
`.trim(),
    stdin: '1 2 4\n1 3 4\n',
    expected_stdout: '1 1 2 3 4 4',
  },

  // ── Trees ───────────────────────────────────────────────
  {
    id: 'tree-01',
    title: 'Binary tree max depth (level order input)',
    topic: 'trees',
    difficulty: 'easy',
    source_code: `
# level-order with -1 as null
vals = input().split()
nodes = [None if v == 'N' else int(v) for v in vals]
from collections import deque
if not nodes or nodes[0] is None:
    print(0)
else:
    q = deque([(0, 1)])
    best = 0
    while q:
        i, d = q.popleft()
        best = max(best, d)
        for j in (2 * i + 1, 2 * i + 2):
            if j < len(nodes) and nodes[j] is not None:
                q.append((j, d + 1))
    print(best)
`.trim(),
    stdin: '3 9 20 N N 15 7\n',
    expected_stdout: '3',
  },
  {
    id: 'tree-02',
    title: 'Invert binary tree level-order',
    topic: 'trees',
    difficulty: 'easy',
    source_code: `
from collections import deque
vals = [None if v == 'N' else int(v) for v in input().split()]

class Node:
    def __init__(self, v):
        self.v = v
        self.l = self.r = None

def build(i):
    if i >= len(vals) or vals[i] is None:
        return None
    n = Node(vals[i])
    n.l = build(2 * i + 1)
    n.r = build(2 * i + 2)
    return n

def invert(n):
    if not n:
        return None
    n.l, n.r = invert(n.r), invert(n.l)
    return n

root = invert(build(0))
out = []
q = deque([root])
while q:
    n = q.popleft()
    if not n:
        out.append('N')
        continue
    out.append(str(n.v))
    q.append(n.l)
    q.append(n.r)
while out and out[-1] == 'N':
    out.pop()
print(' '.join(out))
`.trim(),
    stdin: '4 2 7 1 3 6 9\n',
    expected_stdout: '4 7 2 9 6 3 1',
  },
  {
    id: 'tree-03',
    title: 'Same tree check',
    topic: 'trees',
    difficulty: 'easy',
    source_code: `
a = input().split()
b = input().split()
print('true' if a == b else 'false')
`.trim(),
    stdin: '1 2 3\n1 2 3\n',
    expected_stdout: 'true',
  },

  // ── Graphs ──────────────────────────────────────────────
  {
    id: 'graph-01',
    title: 'Number of islands',
    topic: 'graphs',
    difficulty: 'medium',
    source_code: `
m, n = map(int, input().split())
grid = [list(input().strip()) for _ in range(m)]
def dfs(i, j):
    if i < 0 or j < 0 or i >= m or j >= n or grid[i][j] != '1':
        return
    grid[i][j] = '0'
    dfs(i+1,j); dfs(i-1,j); dfs(i,j+1); dfs(i,j-1)
count = 0
for i in range(m):
    for j in range(n):
        if grid[i][j] == '1':
            dfs(i, j)
            count += 1
print(count)
`.trim(),
    stdin: '4 5\n11110\n11010\n11000\n00000\n',
    expected_stdout: '1',
  },
  {
    id: 'graph-02',
    title: 'BFS shortest path unweighted',
    topic: 'graphs',
    difficulty: 'medium',
    source_code: `
from collections import deque, defaultdict
n, m = map(int, input().split())
g = defaultdict(list)
for _ in range(m):
    u, v = map(int, input().split())
    g[u].append(v)
    g[v].append(u)
src, dst = map(int, input().split())
q = deque([(src, 0)])
seen = {src}
ans = -1
while q:
    u, d = q.popleft()
    if u == dst:
        ans = d
        break
    for v in g[u]:
        if v not in seen:
            seen.add(v)
            q.append((v, d + 1))
print(ans)
`.trim(),
    stdin: '4 4\n1 2\n2 3\n3 4\n1 3\n1 4\n',
    expected_stdout: '2',
  },
  {
    id: 'graph-03',
    title: 'Detect cycle in undirected graph',
    topic: 'graphs',
    difficulty: 'medium',
    source_code: `
from collections import defaultdict
n, m = map(int, input().split())
g = defaultdict(list)
for _ in range(m):
    u, v = map(int, input().split())
    g[u].append(v)
    g[v].append(u)
parent = {}
def dfs(u, p):
    parent[u] = p
    for v in g[u]:
        if v == p:
            continue
        if v in parent or dfs(v, u):
            return True
    return False
has = False
for i in range(1, n + 1):
    if i not in parent and dfs(i, -1):
        has = True
        break
print('true' if has else 'false')
`.trim(),
    stdin: '3 3\n1 2\n2 3\n3 1\n',
    expected_stdout: 'true',
  },
  {
    id: 'graph-04',
    title: 'Course schedule (topo / can finish)',
    topic: 'graphs',
    difficulty: 'medium',
    source_code: `
from collections import defaultdict, deque
num = int(input())
m = int(input())
indeg = [0] * num
g = defaultdict(list)
for _ in range(m):
    a, b = map(int, input().split())  # a depends on b
    g[b].append(a)
    indeg[a] += 1
q = deque([i for i in range(num) if indeg[i] == 0])
taken = 0
while q:
    u = q.popleft()
    taken += 1
    for v in g[u]:
        indeg[v] -= 1
        if indeg[v] == 0:
            q.append(v)
print('true' if taken == num else 'false')
`.trim(),
    stdin: '2\n1\n1 0\n',
    expected_stdout: 'true',
  },

  // ── Dynamic Programming ─────────────────────────────────
  {
    id: 'dp-01',
    title: 'Climbing stairs',
    topic: 'dp',
    difficulty: 'easy',
    source_code: `
n = int(input())
a, b = 1, 1
for _ in range(n):
    a, b = b, a + b
print(a)
`.trim(),
    stdin: '5\n',
    expected_stdout: '8',
  },
  {
    id: 'dp-02',
    title: 'House robber',
    topic: 'dp',
    difficulty: 'medium',
    source_code: `
nums = list(map(int, input().split()))
prev2 = prev1 = 0
for x in nums:
    prev2, prev1 = prev1, max(prev1, prev2 + x)
print(prev1)
`.trim(),
    stdin: '2 7 9 3 1\n',
    expected_stdout: '12',
  },
  {
    id: 'dp-03',
    title: 'Coin change min coins',
    topic: 'dp',
    difficulty: 'medium',
    source_code: `
coins = list(map(int, input().split()))
amount = int(input())
INF = amount + 1
dp = [INF] * (amount + 1)
dp[0] = 0
for a in range(1, amount + 1):
    for c in coins:
        if c <= a:
            dp[a] = min(dp[a], dp[a - c] + 1)
print(dp[amount] if dp[amount] != INF else -1)
`.trim(),
    stdin: '1 2 5\n11\n',
    expected_stdout: '3',
  },
  {
    id: 'dp-04',
    title: 'Longest increasing subsequence length',
    topic: 'dp',
    difficulty: 'medium',
    source_code: `
import bisect
nums = list(map(int, input().split()))
tails = []
for x in nums:
    i = bisect.bisect_left(tails, x)
    if i == len(tails):
        tails.append(x)
    else:
        tails[i] = x
print(len(tails))
`.trim(),
    stdin: '10 9 2 5 3 7 101 18\n',
    expected_stdout: '4',
  },
  {
    id: 'dp-05',
    title: '0/1 Knapsack max value',
    topic: 'dp',
    difficulty: 'medium',
    source_code: `
n, W = map(int, input().split())
wt = list(map(int, input().split()))
val = list(map(int, input().split()))
dp = [0] * (W + 1)
for i in range(n):
    for w in range(W, wt[i] - 1, -1):
        dp[w] = max(dp[w], dp[w - wt[i]] + val[i])
print(dp[W])
`.trim(),
    stdin: '3 50\n10 20 30\n60 100 120\n',
    expected_stdout: '220',
  },
  {
    id: 'dp-06',
    title: 'Edit distance',
    topic: 'dp',
    difficulty: 'hard',
    source_code: `
a = input().strip()
b = input().strip()
m, n = len(a), len(b)
dp = list(range(n + 1))
for i in range(1, m + 1):
    prev = dp[0]
    dp[0] = i
    for j in range(1, n + 1):
        cur = dp[j]
        if a[i - 1] == b[j - 1]:
            dp[j] = prev
        else:
            dp[j] = 1 + min(prev, dp[j], dp[j - 1])
        prev = cur
print(dp[n])
`.trim(),
    stdin: 'horse\nros\n',
    expected_stdout: '3',
  },

  // ── Greedy / Math / Bits ────────────────────────────────
  {
    id: 'grd-01',
    title: 'Jump game can reach',
    topic: 'greedy',
    difficulty: 'medium',
    source_code: `
nums = list(map(int, input().split()))
reach = 0
for i, x in enumerate(nums):
    if i > reach:
        print('false')
        break
    reach = max(reach, i + x)
else:
    print('true')
`.trim(),
    stdin: '2 3 1 1 4\n',
    expected_stdout: 'true',
  },
  {
    id: 'grd-02',
    title: 'Gas station circuit start',
    topic: 'greedy',
    difficulty: 'medium',
    source_code: `
gas = list(map(int, input().split()))
cost = list(map(int, input().split()))
total = tank = start = 0
for i in range(len(gas)):
    diff = gas[i] - cost[i]
    total += diff
    tank += diff
    if tank < 0:
        start = i + 1
        tank = 0
print(start if total >= 0 else -1)
`.trim(),
    stdin: '1 2 3 4 5\n3 4 5 1 2\n',
    expected_stdout: '3',
  },
  {
    id: 'math-01',
    title: 'GCD of two numbers',
    topic: 'math',
    difficulty: 'easy',
    source_code: `
import math
a, b = map(int, input().split())
print(math.gcd(a, b))
`.trim(),
    stdin: '48 18\n',
    expected_stdout: '6',
  },
  {
    id: 'math-02',
    title: 'Prime check',
    topic: 'math',
    difficulty: 'easy',
    source_code: `
n = int(input())
if n < 2:
    print('false')
else:
    ok = True
    i = 2
    while i * i <= n:
        if n % i == 0:
            ok = False
            break
        i += 1
    print('true' if ok else 'false')
`.trim(),
    stdin: '29\n',
    expected_stdout: 'true',
  },
  {
    id: 'bit-01',
    title: 'Single number (XOR)',
    topic: 'bit-manipulation',
    difficulty: 'easy',
    source_code: `
nums = list(map(int, input().split()))
x = 0
for n in nums:
    x ^= n
print(x)
`.trim(),
    stdin: '4 1 2 1 2\n',
    expected_stdout: '4',
  },
  {
    id: 'bit-02',
    title: 'Number of 1 bits',
    topic: 'bit-manipulation',
    difficulty: 'easy',
    source_code: `
n = int(input())
print(bin(n).count('1'))
`.trim(),
    stdin: '11\n',
    expected_stdout: '3',
  },
  {
    id: 'bit-03',
    title: 'Missing number 0..n',
    topic: 'bit-manipulation',
    difficulty: 'easy',
    source_code: `
nums = list(map(int, input().split()))
n = len(nums)
x = n
for i, v in enumerate(nums):
    x ^= i ^ v
print(x)
`.trim(),
    stdin: '3 0 1\n',
    expected_stdout: '2',
  },
];
