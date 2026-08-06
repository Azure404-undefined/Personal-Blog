<template>
  <footer class="app-footer">
    <p class="footer-text">&copy; 2026 Azure &middot; Built with Vue &amp; CloudBase</p>
  </footer>
</template>

<style lang="scss" scoped>
.app-footer {
  padding: $spacing-xl 0;
  text-align: center;
  border-top: 1px solid var(--color-border-light);
  margin-top: $spacing-2xl;
}

.footer-text {
  margin: 0;
  font-size: $font-size-small;
  color: var(--color-text-muted);
}
</style>
