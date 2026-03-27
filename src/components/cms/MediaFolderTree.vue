<template>
  <div class="neu-media-folder-tree">
    <!-- Корневая папка (все файлы) -->
    <div
      class="neu-media-folder-item"
      :class="{ 'neu-media-folder-item--active': !currentFolderId }"
      @click="selectFolder(null)"
    >
      <span class="neu-media-folder-icon">📁</span>
      <span class="neu-media-folder-name">Все файлы</span>
    </div>

    <!-- Дерево папок -->
    <div v-for="folder in folderTree" :key="folder.id">
      <div
        class="neu-media-folder-item"
        :class="{ 'neu-media-folder-item--active': currentFolderId === folder.id }"
        @click="selectFolder(folder.id)"
      >
        <span class="neu-media-folder-icon">📁</span>
        <span class="neu-media-folder-name">{{ folder.name }}</span>
      </div>
    </div>

    <!-- Кнопка создания папки -->
    <button class="neu-media-create-folder-btn" @click.stop="openCreateFolder(null)">
      <span class="neu-media-create-folder-icon">+</span>
      Новая папка
    </button>
  </div>
</template>

<script>
import { computed, ref, defineComponent, watch } from 'vue'
import { useMediaStore } from '@/stores/media'

// ── Folder Node Component ──
const FolderNode = defineComponent({
  name: 'FolderNode',
  props: {
    folder: { type: Object, required: true },
    currentFolderId: { type: String, default: null },
    fileCounts: { type: Object, default: () => ({}) }
  },
  emits: ['select', 'create', 'delete'],
  setup(props, { emit }) {
    const isExpanded = ref(true)

    const hasChildren = computed(() => props.folder.children && props.folder.children.length > 0)
    const isActive = computed(() => props.currentFolderId === props.folder.id)
    const fileCount = computed(() => props.fileCounts[props.folder.id] || 0)

    const toggleExpand = (event) => {
      event.stopPropagation()
      isExpanded.value = !isExpanded.value
    }

    const selectFolder = () => {
      emit('select', props.folder.id)
    }

    const openCreateFolder = (event) => {
      event.stopPropagation()
      emit('create', props.folder.id)
    }

    const confirmDelete = (event) => {
      event.stopPropagation()
      emit('delete', props.folder.id, event)
    }

    return {
      isExpanded,
      hasChildren,
      isActive,
      fileCount,
      toggleExpand,
      selectFolder,
      openCreateFolder,
      confirmDelete
    }
  },
  template: `
    <div class="neu-media-folder-node">
      <div
        class="neu-media-folder-item"
        :class="{ 'neu-media-folder-item--active': isActive }"
        @click="selectFolder"
      >
        <button
          v-if="hasChildren"
          class="neu-media-folder-expand"
          @click="toggleExpand"
        >
          {{ isExpanded ? '▼' : '▶' }}
        </button>
        <span v-else class="neu-media-folder-expand-placeholder"></span>
        <span class="neu-media-folder-icon">📁</span>
        <span class="neu-media-folder-name">{{ folder.name }}</span>
        <span v-if="fileCount > 0" class="neu-media-folder-count">{{ fileCount }}</span>
        <button class="neu-media-folder-delete" @click="confirmDelete" title="Удалить папку">
          🗑️
        </button>
      </div>
      <div v-if="hasChildren && isExpanded" class="neu-media-folder-children">
        <FolderNode
          v-for="child in folder.children"
          :key="child.id"
          :folder="child"
          :current-folder-id="currentFolderId"
          :file-counts="fileCounts"
          @select="(id) => $emit('select', id)"
          @create="(parentId) => $emit('create', parentId)"
          @delete="(id, event) => $emit('delete', id, event)"
        />
      </div>
    </div>
  `,
  mounted() {
    console.log('FolderNode mounted:', this.folder?.name, 'children:', this.folder?.children?.length)
  }
})

// ── Main Component ──
export default defineComponent({
  name: 'MediaFolderTree',
  components: { FolderNode },
  props: {
    currentFolderId: {
      type: String,
      default: null
    }
  },
  emits: ['select-folder', 'create-folder', 'delete-folder'],
  setup(props, { emit }) {
    const mediaStore = useMediaStore()
    // Прямое обращение к store для реактивности
    const folderTree = computed(() => {
      const tree = mediaStore.folderTree
      console.log('folderTree computed:', tree?.length)
      return tree
    })
    const files = computed(() => mediaStore.files)
    
    console.log('MediaFolderTree setup: folderTree=', folderTree.value?.length, files.value?.length)
    
    // Следим за изменениями folderTree
    watch(() => mediaStore.folderTree, (newTree) => {
      console.log('folderTree changed:', newTree?.length, newTree)
    }, { deep: true })
    
    const fileCounts = computed(() => getFileCounts())

    function getFileCounts() {
      const counts = {}
      files.value.forEach(file => {
        if (file.folder_id) {
          counts[file.folder_id] = (counts[file.folder_id] || 0) + 1
        }
      })
      return counts
    }

    function selectFolder(folderId) {
      emit('select-folder', folderId)
    }

    function openCreateFolder(parentId = null) {
      emit('create-folder', parentId)
    }

    function confirmDeleteFolder(folderId, event) {
      event.stopPropagation()
      emit('delete-folder', folderId)
    }

    return {
      folderTree,
      fileCounts,
      selectFolder,
      openCreateFolder,
      confirmDeleteFolder
    }
  }
})
</script>

<style scoped>
.neu-media-folder-node {
  display: flex;
  flex-direction: column;
}

.neu-media-create-folder-btn {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  width: 100%;
  padding: var(--space-xs) var(--space-sm);
  border: none;
  border-radius: var(--radius-md);
  background: linear-gradient(145deg, var(--neu-bg-secondary), var(--neu-bg-primary));
  box-shadow:
    2px 2px 4px var(--neu-shadow-dark),
    -2px -2px 4px var(--neu-shadow-light);
  font-family: var(--fn);
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--neu-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  margin-top: var(--space-sm);
}

.neu-media-create-folder-btn:hover {
  color: var(--neu-primary);
  box-shadow:
    3px 3px 6px var(--neu-shadow-dark),
    -3px -3px 6px var(--neu-shadow-light);
}

.neu-media-create-folder-icon {
  font-size: 1.2rem;
  font-weight: 700;
}

.neu-media-folder-expand,
.neu-media-folder-expand-placeholder {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  font-size: 0.6rem;
  color: var(--neu-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.neu-media-folder-expand:hover {
  color: var(--neu-primary);
}

.neu-media-folder-expand-placeholder {
  visibility: hidden;
}

.neu-media-folder-delete {
  padding: 2px;
  border: none;
  background: transparent;
  font-size: 0.9rem;
  cursor: pointer;
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.neu-media-folder-item:hover .neu-media-folder-delete {
  opacity: 1;
}

.neu-media-folder-delete:hover {
  transform: scale(1.1);
}
</style>
