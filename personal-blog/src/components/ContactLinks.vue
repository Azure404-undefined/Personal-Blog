<script setup lang="ts">
import type { PopoverInstance } from 'element-plus'

import qqQrCode from '@/assets/imgs/QQlink.jpg'
import wechatQrCode from '@/assets/imgs/WeChatlink.jpg'

defineOptions({ name: 'ContactLinks' })

type ContactBase = {
  label: string
  path: string
  ariaLabel: string
}

type LinkContact = ContactBase & {
  type: 'link'
  href: string
  newTab?: boolean
}

type QrContact = ContactBase & {
  type: 'qr'
  image: string
  imageAlt: string
}

type Contact = LinkContact | QrContact

const qrPopoverRefs = new Map<string, PopoverInstance>()

const setQrPopoverRef = (label: string, instance: unknown) => {
  if (instance && typeof (instance as PopoverInstance).hide === 'function') {
    qrPopoverRefs.set(label, instance as PopoverInstance)
  } else {
    qrPopoverRefs.delete(label)
  }
}

const hideQrPopover = (label: string) => {
  qrPopoverRefs.get(label)?.hide()
}

const contacts: Contact[] = [
  {
    type: 'link',
    label: '邮箱',
    ariaLabel: '发送邮件至 chengjiye18@gmail.com',
    href: 'mailto:chengjiye18@gmail.com',
    path: 'M838.954667 234.666667H170.666667c-3.626667 0-7.168 0.448-10.56 1.322666l323.690666 323.669334a21.333333 21.333333 0 0 0 30.165334 0L838.954667 234.666667z m46.144 14.186666l-260.693334 260.693334 262.933334 262.912c5.44-7.168 8.661333-16.106667 8.661333-25.792V277.333333c0-10.944-4.117333-20.906667-10.88-28.48zM843.861333 789.333333l-249.6-249.621333-50.133333 50.133333a64 64 0 0 1-90.517333 0l-50.112-50.133333L156.373333 786.88c4.48 1.578667 9.28 2.453333 14.314667 2.453333h673.194667zM128.661333 754.218667L373.333333 509.525333 129.578667 265.813333A42.709333 42.709333 0 0 0 128 277.333333v469.333334c0 2.56 0.213333 5.098667 0.661333 7.552zM170.666667 192h682.666666a85.333333 85.333333 0 0 1 85.333334 85.333333v469.333334a85.333333 85.333333 0 0 1-85.333334 85.333333H170.666667a85.333333 85.333333 0 0 1-85.333334-85.333333V277.333333a85.333333 85.333333 0 0 1 85.333334-85.333333z',
  },
  {
    type: 'qr',
    label: 'QQ',
    ariaLabel: '显示 QQ 联系二维码',
    image: qqQrCode,
    imageAlt: 'QQ 联系二维码',
    path: 'M824.8 613.2c-16-51.4-34.4-94.6-62.7-165.3C766.5 262.2 689.3 112 511.5 112 331.7 112 256.2 265.2 261 447.9c-28.4 70.8-46.7 113.7-62.7 165.3-34 109.5-23 154.8-14.6 155.8 18 2.2 70.1-82.4 70.1-82.4 0 49 25.2 112.9 79.8 159-26.4 8.1-85.7 29.9-71.6 53.8 11.4 19.3 196.2 12.3 249.5 6.3 53.3 6 238.1 13 249.5-6.3 14.1-23.8-45.3-45.7-71.6-53.8 54.6-46.2 79.8-110.1 79.8-159 0 0 52.1 84.6 70.1 82.4 8.5-1.1 19.5-46.4-14.5-155.8z',
  },
  {
    type: 'qr',
    label: '微信',
    ariaLabel: '显示微信联系二维码',
    image: wechatQrCode,
    imageAlt: '微信联系二维码',
    path: 'M664.250054 368.541681c10.015098 0 19.892049 0.732687 29.67281 1.795902-26.647917-122.810047-159.358451-214.077703-310.826188-214.077703-169.353083 0-308.085774 114.232694-308.085774 259.274068 0 83.708494 46.165436 152.460344 123.281791 205.78483l-30.80868 91.730191 107.688651-53.455469c38.558178 7.53665 69.459978 15.308661 107.924012 15.308661 9.66308 0 19.230993-0.470721 28.752858-1.225921-6.025227-20.36584-9.521864-41.723264-9.521864-63.862493C402.328693 476.632491 517.908058 368.541681 664.250054 368.541681zM498.62897 285.87389c23.200398 0 38.557154 15.120372 38.557154 38.061874 0 22.846334-15.356756 38.156018-38.557154 38.156018-23.107277 0-46.260603-15.309684-46.260603-38.156018C452.368366 300.994262 475.522716 285.87389 498.62897 285.87389zM283.016307 362.090758c-23.107277 0-46.402843-15.309684-46.402843-38.156018 0-22.941502 23.295566-38.061874 46.402843-38.061874 23.081695 0 38.46301 15.120372 38.46301 38.061874C321.479317 346.782098 306.098002 362.090758 283.016307 362.090758zM945.448458 606.151333c0-121.888048-123.258255-221.236753-261.683954-221.236753-146.57838 0-262.015505 99.348706-262.015505 221.236753 0 122.06508 115.437126 221.200938 262.015505 221.200938 30.66644 0 61.617359-7.609305 92.423993-15.262612l84.513836 45.786813-23.178909-76.17082C899.379213 735.776599 945.448458 674.90216 945.448458 606.151333zM598.803483 567.994292c-15.332197 0-30.807656-15.096836-30.807656-30.501688 0-15.190981 15.47546-30.477129 30.807656-30.477129 23.295566 0 38.558178 15.286148 38.558178 30.477129C637.361661 552.897456 622.099049 567.994292 598.803483 567.994292zM768.25071 567.994292c-15.213493 0-30.594809-15.096836-30.594809-30.501688 0-15.190981 15.381315-30.477129 30.594809-30.477129 23.107277 0 38.558178 15.286148 38.558178 30.477129C806.808888 552.897456 791.357987 567.994292 768.25071 567.994292z',
  },
  {
    type: 'link',
    label: 'GitHub',
    ariaLabel: '在新标签页打开 Azure 的 GitHub 主页',
    href: 'https://github.com/Azure404-undefined',
    newTab: true,
    path: 'M512 42.666667A464.64 464.64 0 0 0 42.666667 502.186667 460.373333 460.373333 0 0 0 363.52 938.666667c23.466667 4.266667 32-9.813333 32-22.186667v-78.08c-130.56 27.733333-158.293333-61.44-158.293333-61.44a122.026667 122.026667 0 0 0-52.053334-67.413333c-42.666667-28.16 3.413333-27.733333 3.413334-27.733334a98.56 98.56 0 0 1 71.68 47.36 101.12 101.12 0 0 0 136.533333 37.973334 99.413333 99.413333 0 0 1 29.866667-61.44c-104.106667-11.52-213.333333-50.773333-213.333334-226.986667a177.066667 177.066667 0 0 1 47.36-124.16 161.28 161.28 0 0 1 4.693334-121.173333s39.68-12.373333 128 46.933333a455.68 455.68 0 0 1 234.666666 0c89.6-59.306667 128-46.933333 128-46.933333a161.28 161.28 0 0 1 4.693334 121.173333A177.066667 177.066667 0 0 1 810.666667 477.866667c0 176.64-110.08 215.466667-213.333334 226.986666a106.666667 106.666667 0 0 1 32 85.333334v125.866666c0 14.933333 8.533333 26.88 32 22.186667A460.8 460.8 0 0 0 981.333333 502.186667 464.64 464.64 0 0 0 512 42.666667',
  },
]
</script>

<template>
  <div class="contact-grid" role="list">
    <div
      v-for="contact in contacts"
      :key="contact.label"
      class="contact-item-container"
      role="listitem"
    >
      <a
        v-if="contact.type === 'link'"
        class="contact-item"
        :href="contact.href"
        :target="contact.newTab ? '_blank' : undefined"
        :rel="contact.newTab ? 'noopener noreferrer' : undefined"
        :aria-label="contact.ariaLabel"
      >
        <span class="contact-icon-wrap">
          <svg
            class="contact-icon"
            viewBox="0 0 1024 1024"
            aria-hidden="true"
            focusable="false"
          >
            <path :d="contact.path" fill="currentColor" />
          </svg>
        </span>
        <span class="contact-label">{{ contact.label }}</span>
      </a>

      <el-popover
        v-else
        :ref="(instance: unknown) => setQrPopoverRef(contact.label, instance)"
        trigger="click"
        placement="top"
        :width="200"
        :aria-label="`${contact.label} 联系二维码`"
      >
        <div class="contact-qr-content">
          <img class="contact-qr-image" :src="contact.image" :alt="contact.imageAlt" />
        </div>

        <template #reference>
          <button
            type="button"
            class="contact-item"
            :aria-label="contact.ariaLabel"
            @keydown.esc.stop.prevent="hideQrPopover(contact.label)"
          >
            <span class="contact-icon-wrap">
              <svg
                class="contact-icon"
                viewBox="0 0 1024 1024"
                aria-hidden="true"
                focusable="false"
              >
                <path :d="contact.path" fill="currentColor" />
              </svg>
            </span>
            <span class="contact-label">{{ contact.label }}</span>
          </button>
        </template>
      </el-popover>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.contact-grid {
  display: grid;
  width: 100%;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: $spacing-sm;
}

.contact-item-container {
  display: flex;
  min-width: 0;
}

.contact-item {
  display: flex;
  width: 100%;
  min-width: 0;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-sm;
  border: 1px solid var(--color-border);
  border-radius: $radius-lg;
  appearance: none;
  color: var(--color-text-secondary);
  background: var(--color-bg-card);
  cursor: pointer;
  font: inherit;
  text-align: left;
  text-decoration: none;
  transition:
    color 0.2s,
    background-color 0.2s,
    border-color 0.2s;

  &:hover {
    color: var(--color-primary);
    background: var(--color-primary-bg);
    border-color: var(--color-primary-border);
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
}

.contact-icon-wrap {
  display: grid;
  width: 36px;
  height: 36px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: $radius-md;
  color: var(--color-primary);
  background: var(--color-primary-bg);
}

.contact-icon {
  display: block;
  width: 22px;
  height: 22px;
  flex: 0 0 auto;
}

.contact-label {
  min-width: 0;
  overflow: hidden;
  font-size: $font-size-small;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.contact-qr-content {
  display: grid;
  width: 100%;
  max-height: 250px;
  place-items: center;
  overflow: auto;
  padding: $spacing-xs;
  border-radius: $radius-md;
  background: #fff;
}

.contact-qr-image {
  display: block;
  width: 100%;
  max-width: 176px;
  max-height: 240px;
  object-fit: contain;
}
</style>
