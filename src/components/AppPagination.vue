<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  page: number
  total: number
  pageSize: number
}>()

const emit = defineEmits<{
  change: [page: number]
}>()

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / Math.max(1, props.pageSize))))
const currentPage = computed(() => Math.min(Math.max(1, props.page), totalPages.value))

function changePage(nextPage: number) {
  const normalizedPage = Math.min(Math.max(1, nextPage), totalPages.value)
  if (normalizedPage === currentPage.value) return
  emit('change', normalizedPage)
}
</script>

<template>
  <footer class="app-pagination">
    <span class="count">共{{ total }}条</span>
    <span class="page-size">{{ pageSize }}条/页</span>
    <div class="pager-controls" aria-label="分页">
      <button type="button" :disabled="currentPage <= 1" aria-label="上一页" @click="changePage(currentPage - 1)">
        ‹
      </button>
      <span class="page-indicator">第 {{ currentPage }} / {{ totalPages }} 页</span>
      <button
        type="button"
        :disabled="currentPage >= totalPages"
        aria-label="下一页"
        @click="changePage(currentPage + 1)"
      >
        ›
      </button>
    </div>
  </footer>
</template>

<style scoped>
.app-pagination {
  display: flex;
  flex: 0 0 auto;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  min-height: 56px;
  padding: 10px 20px 12px;
  color: #64748b;
  font-size: 13px;
  font-weight: 800;
  background: rgba(255, 255, 255, 0.98);
  border-top: 1px solid #edf1f6;
}

.count {
  color: #334155;
}

.page-size {
  color: #64748b;
}

.pager-controls {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  margin-left: auto;
}

.pager-controls button {
  display: grid;
  width: 34px;
  height: 32px;
  place-items: center;
  color: #334155;
  font-size: 17px;
  font-weight: 900;
  cursor: pointer;
  background: #fff;
  border: 1px solid #dbe3ee;
  border-radius: 8px;
}

.pager-controls button:disabled {
  color: #a8b3c3;
  cursor: not-allowed;
  background: #f8fafc;
}

.page-indicator {
  min-width: 108px;
  height: 32px;
  padding: 0 12px;
  color: #2f3f58;
  line-height: 32px;
  text-align: center;
  white-space: nowrap;
  background: #f7faff;
  border: 1px solid #dbe3ee;
  border-radius: 8px;
}
</style>
