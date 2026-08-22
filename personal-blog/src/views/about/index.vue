<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import authAvatar from '@/assets/imgs/authavatar.jpg'
import ContactLinks from '@/components/ContactLinks.vue'
import { usePageMeta } from '@/utils/meta'

defineOptions({ name: 'AboutView' })

usePageMeta('关于我', '认识 Azure，了解这个博客关注的方向与技术架构')

const focusAreas = [
  {
    label: 'Frontend',
    title: '前端工程',
    description: '围绕 Vue 与 TypeScript，记录界面实现、工程实践和真实问题的解决过程。',
  },
  {
    label: 'Cloud',
    title: '云端架构',
    description: '探索 CloudBase 与 Serverless，让个人项目拥有清晰、轻量且可维护的后端链路。',
  },
  {
    label: 'Writing',
    title: '内容表达',
    description: '把零散的思考整理成文章，也保留阅读、生活和持续学习留下的片段。',
  },
]

const techStack = [
  'Vue 3',
  'TypeScript',
  'Vite',
  'Pinia',
  'Element Plus',
  'Node.js',
  'CloudBase',
  'SCSS',
]

const AItool = [
  'DeepSeek API',
  'Claude Code',
  'Codex',
  'GitHub Copilot',
]

const blogFlow = [
  {
    index: '01',
    title: 'Vue SPA',
    description: '浏览、搜索与阅读',
  },
  {
    index: '02',
    title: 'CloudBase BFF',
    description: '鉴权与业务编排',
  },
  {
    index: '03',
    title: 'Data & Storage',
    description: '文章、评论与图片',
  },
]

// ── 代码块打字机 ──
type CodeTokenCls = 'tok-comment' | 'tok-keyword' | 'tok-string' | 'tok-prop'
type CodeToken = { text: string; cls?: CodeTokenCls }

const codeLines: CodeToken[][] = [
  [{ text: '/**', cls: 'tok-comment' }],
  [{ text: " * Hello, I'm Azure — 关注前端工程、云开发与 Serverless，", cls: 'tok-comment' }],
  [{ text: ' * 把解决问题的过程，写成下一次可以复用的经验。', cls: 'tok-comment' }],
  [{ text: ' */', cls: 'tok-comment' }],
  [
    { text: 'const ', cls: 'tok-keyword' },
    { text: 'azure = {' },
  ],
  [
    { text: 'role', cls: 'tok-prop' },
    { text: ': ' },
    { text: "'Frontend Engineer'", cls: 'tok-string' },
    { text: ',' },
  ],
  [
    { text: 'focus', cls: 'tok-prop' },
    { text: ': [' },
    { text: "'前端工程'", cls: 'tok-string' },
    { text: ', ' },
    { text: "'云端架构'", cls: 'tok-string' },
    { text: ', ' },
    { text: "'内容表达'", cls: 'tok-string' },
    { text: '],' },
  ],
  [
    { text: 'stack', cls: 'tok-prop' },
    { text: ': [' },
    { text: "'Vue3'", cls: 'tok-string' },
    { text: ', ' },
    { text: "'TypeScript'", cls: 'tok-string' },
    { text: ', ' },
    { text: "'Vite'", cls: 'tok-string' },
    { text: ', ' },
    { text: "'Pinia'", cls: 'tok-string' },
    { text: ', ' },
    { text: "'CloudBase'", cls: 'tok-string' },
    { text: '],' },
  ],
  [
    { text: 'blog', cls: 'tok-prop' },
    { text: ': ' },
    { text: "'一个长期维护的个人博客'", cls: 'tok-string' },
    { text: ',' },
  ],
  [{ text: '}' }],
]

const lineTotal = (line: CodeToken[]) => line.reduce((sum, tok) => sum + tok.text.length, 0)
const lineEnds = codeLines.reduce<number[]>((acc, line) => {
  acc.push((acc[acc.length - 1] ?? 0) + lineTotal(line))
  return acc
}, [])
const totalChars = lineEnds[lineEnds.length - 1] ?? 0

const typedCount = ref(0)
let typingTimer: number | undefined

/** 由 typedCount 计算每行的显示内容与「正在输入」标记 */
const rendered = computed(() => {
  const lines: { tokens: { text: string; cls?: CodeTokenCls }[]; current: boolean }[] = []
  const done = typedCount.value >= totalChars
  let offset = 0

  codeLines.forEach((tokens) => {
    const shown = Math.max(0, Math.min(lineTotal(tokens), typedCount.value - offset))
    offset += lineTotal(tokens)
    
    const out: { text: string; cls?: CodeTokenCls }[] = []
    let left = shown
    for (const tok of tokens) {
      if (left <= 0) break
      const take = Math.min(tok.text.length, left)
      if (take > 0) out.push({ text: tok.text.slice(0, take), cls: tok.cls })
      left -= take
    }
    lines.push({ tokens: out, current: done ? offset >= totalChars : shown > 0 && shown < lineTotal(tokens) })
  })

  return lines
})

const tick = () => {
  typedCount.value += 1
  if (typedCount.value >= totalChars) return
  // 行末多停一拍,更像真人输入节奏
  const delay = lineEnds.includes(typedCount.value) ? 200 : 38
  typingTimer = window.setTimeout(tick, delay)
}

onMounted(() => {
  typingTimer = window.setTimeout(tick, 200)
})

onUnmounted(() => {
  window.clearTimeout(typingTimer)
})
</script>

<template>
  <div class="about-page">
    <div class="about-container">
      <!-- 编辑器身份卡 -->
      <section class="editor-window" aria-label="关于 Azure">
        <div class="editor-chrome">
          <div class="chrome-dots" aria-hidden="true">
            <i></i>
            <i></i>
            <i></i>
          </div>
          <span class="chrome-title">azure.ts</span>
          <a
            class="chrome-source"
            href="https://github.com/Azure404-undefined/Personal-Blog"
            target="_blank"
            rel="noopener noreferrer"
          >
            查看源码
            <span aria-hidden="true">↗</span>
          </a>
        </div>

        <div class="editor-body">
          <div class="identity-row">
            <img class="identity-avatar" :src="authAvatar" alt="Azure 头像" />
            <div class="identity-text">
              <h1 class="identity-name">
                Azure
                <span class="identity-status"><i aria-hidden="true"></i>持续创作中</span>
              </h1>
              <p class="identity-tagline">写代码，写文章，也记录生活。</p>
            </div>
          </div>

          <div class="code-block">
            <div v-for="(line, i) in rendered" :key="i" class="code-line">
              <span class="ln" aria-hidden="true">{{ i + 1 }}</span>
              <code>
                <template v-for="(tok, j) in line.tokens" :key="j">
                  <span v-if="tok.cls" :class="tok.cls">{{ tok.text }}</span>
                  <template v-else>{{ tok.text }}</template>
                </template>
                <span v-if="line.current" class="cursor" aria-hidden="true"></span>
              </code>
            </div>
          </div>
        </div>
      </section>

      <!-- 找到我 -->
      <section class="about-section contact-panel" aria-labelledby="contact-title">
        <div class="section-heading">
          <div>
            <p class="section-eyebrow">Contact</p>
            <h2 id="contact-title">找到我</h2>
          </div>
          <p>关于合作、反馈或只是打个招呼，都欢迎。</p>
        </div>
        <ContactLinks />
      </section>

      <!-- 关注方向 -->
      <section class="about-section" aria-labelledby="focus-title">
        <div class="section-heading">
          <div>
            <p class="section-eyebrow">Focus</p>
            <h2 id="focus-title">我持续关注的方向</h2>
          </div>
          <p>从实现到表达，让每一次尝试都有迹可循。</p>
        </div>

        <div class="focus-grid">
          <article v-for="area in focusAreas" :key="area.title" class="focus-card">
            <span>{{ area.label }}</span>
            <h3>{{ area.title }}</h3>
            <p>{{ area.description }}</p>
          </article>
        </div>
      </section>

      <!-- 架构链路 -->
      <section class="about-section flow-section" aria-labelledby="flow-title">
        <div class="section-heading">
          <div>
            <p class="section-eyebrow">Architecture</p>
            <h2 id="flow-title">这个博客如何工作</h2>
          </div>
          <p>浏览器只与 BFF 通信，数据访问与鉴权集中在云函数中。</p>
        </div>

        <ol class="blog-flow" aria-label="博客技术链路">
          <li v-for="step in blogFlow" :key="step.index" class="flow-node">
            <span class="flow-index">{{ step.index }}</span>
            <strong>{{ step.title }}</strong>
            <small>{{ step.description }}</small>
          </li>
        </ol>
      </section>

      <!-- 工具箱 -->
      <section class="about-section stack-section" aria-labelledby="stack-title">
        <div class="section-heading">
          <div>
            <p class="section-eyebrow">Toolkit</p>
            <h2 id="stack-title">正在使用的技术</h2>
          </div>
        </div>

        <ul class="stack-list" aria-label="技术栈">
          <li v-for="item in techStack" :key="item">{{ item }}</li>
        </ul>

        <div class="section-heading">
          <div>
            <!-- <p class="section-eyebrow">AI friends</p> -->
            <h2 id="ai-stack-title">AI编程助手</h2>
          </div>
        </div>

        <ul class="stack-list" aria-label="技术栈">
          <li v-for="item in AItool" :key="item">{{ item }}</li>
        </ul>
      </section>

      <blockquote class="about-quote">
        <p>保持好奇，持续学习。</p>
        <span>把今天弄懂的事，留给明天继续生长。</span>
      </blockquote>
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* ── 编辑器专属变量（明暗两套） ── */
.editor-window {
  --editor-bg: #f6f8fa;
  --editor-chrome-bg: var(--color-bg-card);
  --syntax-comment: #6a737d;
  --syntax-keyword: #0550ae;
  --syntax-string: #116329;
  --syntax-prop: #8250df;
}

[data-theme='dark'] .editor-window {
  --editor-bg: #0d1117;
  --editor-chrome-bg: #161b22;
  --syntax-comment: #8b949e;
  --syntax-keyword: #79c0ff;
  --syntax-string: #7ee787;
  --syntax-prop: #d2a8ff;
}

.about-page {
  min-width: 0;
  padding-bottom: $spacing-2xl;
}

.about-container {
  display: flex;
  width: min(1120px, calc(100% - #{$spacing-xl}));
  flex-direction: column;
  gap: $spacing-2xl;
  margin: $spacing-2xl auto 0;
}

/* ── 编辑器窗口 ── */
.editor-window {
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: $radius-lg;
  background: var(--editor-bg);
  box-shadow: var(--shadow-md);
}

.editor-chrome {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: 11px $spacing-md;
  border-bottom: 1px solid var(--color-border);
  background: var(--editor-chrome-bg);
}

.chrome-dots {
  display: flex;
  gap: 7px;

  i {
    width: 11px;
    height: 11px;
    border-radius: 50%;
  }

  i:nth-child(1) {
    background: #ff5f57;
  }

  i:nth-child(2) {
    background: #febc2e;
  }

  i:nth-child(3) {
    background: #28c840;
  }
}

.chrome-title {
  margin-inline: auto;
  color: var(--color-text-muted);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.02em;
}

.chrome-source {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--color-text-secondary);
  font-size: $font-size-small;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s;

  &:hover {
    color: var(--color-primary);
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 3px;
  }
}

.editor-body {
  padding: $spacing-xl;
}

/* ── 身份区 ── */
.identity-row {
  display: flex;
  align-items: center;
  gap: $spacing-lg;
}

.identity-avatar {
  width: 72px;
  height: 72px;
  flex: 0 0 auto;
  border-radius: 50%;
  box-shadow: var(--shadow-md);
  object-fit: cover;
}

.identity-text {
  min-width: 0;
}

.identity-name {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  margin: 0;
  color: var(--color-text-primary);
  font-size: $font-size-display;
  line-height: 1.25;
}

.identity-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border: 1px solid var(--color-primary-border);
  border-radius: $radius-xl;
  color: var(--color-primary);
  background: var(--color-primary-bg);
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;

  i {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--color-success);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-success) 18%, transparent);
  }
}

.identity-tagline {
  margin: $spacing-xs 0 0;
  color: var(--color-text-secondary);
  font-size: $font-size-body;
}

/* ── 代码块 ── */
.code-block {
  margin-top: $spacing-lg;
  overflow-x: auto;
  font-family: ui-monospace, 'SF Mono', 'Cascadia Code', 'JetBrains Mono', Consolas, monospace;
  font-size: 14px;
  line-height: 1.9;
  -webkit-overflow-scrolling: touch;
}

.code-line {
  display: flex;
  min-width: max-content;
  padding-right: $spacing-lg;
  color: var(--color-text-primary);

  .ln {
    width: 36px;
    flex: 0 0 auto;
    color: var(--color-text-muted);
    text-align: right;
    user-select: none;
  }

  code {
    padding-left: $spacing-md;
    font-family: inherit;
  }
}

.tok-comment {
  color: var(--syntax-comment);
}

.tok-keyword {
  color: var(--syntax-keyword);
  font-weight: 600;
}

.tok-string {
  color: var(--syntax-string);
}

.tok-prop {
  color: var(--syntax-prop);
}

.cursor {
  display: inline-block;
  width: 8px;
  height: 1.25em;
  margin-left: 2px;
  border-radius: 1px;
  background: var(--color-primary);
  vertical-align: text-bottom;
  animation: cursor-blink 1s steps(1) infinite;
}

@keyframes cursor-blink {
  50% {
    opacity: 0;
  }
}

/* ── 内容区（减法：无卡片，细线分区） ── */
.section-eyebrow {
  margin: 0 0 $spacing-xs;
  color: var(--color-primary);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.about-section {
  padding-top: $spacing-lg;
  border-top: 1px solid var(--color-border);
}

.section-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: $spacing-lg;
  margin-bottom: $spacing-lg;

  #ai-stack-title {
    margin-top: $spacing-lg;
  }

  h2 {
    margin: 0;
    color: var(--color-text-primary);
    font-size: $font-size-h2;
    line-height: 1.35;
  }

  > p {
    max-width: 320px;
    margin: 0;
    color: var(--color-text-muted);
    font-size: $font-size-small;
    line-height: 1.65;
    text-align: right;
  }
}

.focus-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: $spacing-xl;
}

.focus-card {
  min-width: 0;

  span {
    color: var(--color-primary);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  h3 {
    margin: $spacing-sm 0;
    color: var(--color-text-primary);
    font-size: $font-size-body;
    transition: color 0.2s;
  }

  p {
    margin: 0;
    color: var(--color-text-secondary);
    font-size: $font-size-small;
    line-height: 1.75;
  }

  &:hover h3 {
    color: var(--color-primary);
  }
}

/* ── 架构链路（timeline 连接线，替代绝对定位箭头） ── */
.blog-flow {
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: $spacing-xl;
  margin: 0;
  padding: 0;
  list-style: none;

  &::before {
    content: '';
    position: absolute;
    top: 14px;
    right: 0;
    left: 0;
    height: 2px;
    background: var(--color-primary-border);
  }
}

.flow-node {
  position: relative;
  z-index: 1;
  display: flex;
  min-width: 0;
  flex-direction: column;
  padding-top: $spacing-lg;
}

.flow-index {
  position: absolute;
  top: 0;
  left: 0;
  display: grid;
  width: 30px;
  height: 30px;
  place-items: center;
  border: 1px solid var(--color-primary-border);
  border-radius: 50%;
  color: var(--color-primary);
  background: var(--color-primary-bg);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.05em;
}

.flow-node strong {
  color: var(--color-text-primary);
  font-size: $font-size-body;
}

.flow-node small {
  margin-top: $spacing-xs;
  color: var(--color-text-secondary);
  font-size: 12px;
}

/* ── 工具箱 ── */
.stack-list {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-sm;
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    padding: 8px 13px;
    border: 1px solid var(--color-border);
    border-radius: $radius-xl;
    color: var(--color-text-secondary);
    background: var(--color-bg-card);
    font-size: $font-size-small;
    font-weight: 500;
  }
}

/* ── 收尾引用 ── */
.about-quote {
  position: relative;
  margin: 0;
  padding-left: calc($spacing-xl + 6px);
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 6px;
    background: var(--color-primary);
  }

  p {
    margin: 0 0 $spacing-xs;
    color: var(--color-text-primary);
    font-size: $font-size-h2;
    font-weight: 700;
  }

  span {
    color: var(--color-text-muted);
    font-size: $font-size-small;
  }
}

/* ── 响应式 ── */
@media (max-width: $breakpoint-md) {
  .about-container {
    gap: $spacing-xl;
    margin-top: $spacing-xl;
  }

  .editor-body {
    padding: $spacing-lg;
  }

  .identity-row {
    gap: $spacing-md;
  }

  .identity-avatar {
    width: 56px;
    height: 56px;
  }

  .identity-name {
    flex-wrap: wrap;
    gap: $spacing-sm;
    font-size: $font-size-h1;
  }

  .identity-status {
    padding: 3px 8px;
    font-size: 11px;
  }

  .code-line {
    .ln {
      width: 28px;
    }

    code {
      padding-left: $spacing-sm;
    }
  }

  .focus-grid,
  .blog-flow {
    grid-template-columns: 1fr;
    gap: $spacing-lg;
  }

  /* 移动端 timeline 转竖线 */
  .blog-flow {
    &::before {
      top: 0;
      bottom: 0;
      left: 14px;
      width: 2px;
      height: auto;
    }
  }

  .flow-node {
    padding-top: 0;
    padding-left: calc(30px + #{$spacing-md});
  }

  .flow-index {
    top: 0;
  }

  .section-heading {
    align-items: flex-start;
    flex-direction: column;
    gap: $spacing-sm;

    > p {
      max-width: none;
      text-align: left;
    }
  }
}

@media (max-width: $breakpoint-sm) {
  .about-container {
    width: calc(100% - #{$spacing-lg});
  }

  .about-quote {
    padding-left: calc($spacing-lg + 6px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .cursor {
    animation: none;
  }

  .chrome-source,
  .focus-card h3 {
    transition: none;
  }
}

/* 触屏设备隐藏滚动条,保留触摸滑动 */
@media (hover: none) {
  .code-block {
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }
}
</style>
