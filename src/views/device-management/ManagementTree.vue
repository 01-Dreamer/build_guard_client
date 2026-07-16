<script setup lang="ts">
import { Folder, CircleCheckFilled } from '@element-plus/icons-vue'
import type { TreeItem } from './data'

defineProps<{
  title?: string
  items: TreeItem[]
}>()
</script>

<template>
  <aside class="management-sidebar">
    <h2 v-if="title">{{ title }}</h2>
    <div class="tree-list">
      <div v-for="item in items" :key="item.label" class="tree-node">
        <div class="tree-title" :class="{ active: item.active }">
          <el-icon class="tree-icon">
            <Folder />
          </el-icon>
          <span>{{ item.label }}</span>
        </div>
        <div
          v-for="child in item.children"
          :key="child.label"
          class="tree-child"
          :class="{ active: child.active }"
        >
          <el-icon class="tree-icon">
            <CircleCheckFilled />
          </el-icon>
          <span>{{ child.label }}</span>
        </div>
      </div>
    </div>
  </aside>
</template>
