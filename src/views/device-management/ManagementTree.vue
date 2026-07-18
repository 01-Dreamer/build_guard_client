<script setup lang="ts">
import { Folder, CircleCheckFilled } from '@element-plus/icons-vue'
import type { TreeItem } from './data'

defineProps<{
  title?: string
  items: TreeItem[]
}>()

const emit = defineEmits<{
  select: [item: TreeItem]
}>()
</script>

<template>
  <aside class="management-sidebar">
    <h2 v-if="title">{{ title }}</h2>
    <div class="tree-list">
      <div v-for="item in items" :key="item.label" class="tree-node">
        <button class="tree-title" :class="{ active: item.active }" type="button" @click="emit('select', item)">
          <el-icon class="tree-icon">
            <Folder />
          </el-icon>
          <span>{{ item.label }}</span>
        </button>
        <button
          v-for="child in item.children"
          :key="child.label"
          class="tree-child"
          :class="{ active: child.active }"
          type="button"
          @click="emit('select', child)"
        >
          <el-icon class="tree-icon">
            <CircleCheckFilled />
          </el-icon>
          <span>{{ child.label }}</span>
        </button>
      </div>
    </div>
  </aside>
</template>
