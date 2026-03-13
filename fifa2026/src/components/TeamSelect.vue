<template>
  <div class="team-select-wrap" ref="wrapRef" :class="{ 'is-open': open }">
    <button
      type="button"
      class="team-select-trigger"
      :class="{ empty: !modelValue }"
      :aria-expanded="open"
      aria-haspopup="listbox"
      :aria-label="label"
      @click="toggle"
      @keydown="onTriggerKeydown"
    >
      <span v-if="selectedTeam" class="fi trigger-flag" :class="`fi-${selectedTeam.flagCode}`"></span>
      <span v-else class="trigger-placeholder">Select team…</span>
      <span v-if="selectedTeam" class="trigger-name">{{ selectedTeam.name }}</span>
      <span class="trigger-chevron" aria-hidden="true">{{ open ? '▼' : '▶' }}</span>
    </button>
    <Transition name="dropdown">
      <ul
        v-show="open"
        ref="listRef"
        class="team-select-list"
        role="listbox"
        tabindex="-1"
        @keydown="onListKeydown"
      >
        <li
          v-for="(team, index) in filteredOptions"
          :key="team.name"
          role="option"
          :aria-selected="modelValue === team.name"
          class="team-option"
          :class="{ highlighted: index === highlightedIndex }"
          @click="select(team.name)"
          @mousemove="highlightedIndex = index"
        >
          <span class="fi option-flag" :class="`fi-${team.flagCode}`"></span>
          <span class="option-name">{{ team.name }}</span>
        </li>
        <li v-if="filteredOptions.length === 0" class="team-option no-results">
          <span class="option-name">No team matching "{{ searchQuery }}"</span>
        </li>
      </ul>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import type { Team } from '../data/groups'

const props = withDefaults(
  defineProps<{
    modelValue: string
    teams: Team[]
    label?: string
  }>(),
  { label: 'Team' }
)

const emit = defineEmits<{ 'update:modelValue': [value: string]; open: []; close: [] }>()

const wrapRef = ref<HTMLElement | null>(null)
const listRef = ref<HTMLElement | null>(null)
const open = ref(false)
const searchQuery = ref('')
const highlightedIndex = ref(0)

const allTeamsSorted = computed(() =>
  [...props.teams].sort((a, b) => a.name.localeCompare(b.name))
)

const filteredOptions = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return allTeamsSorted.value
  return allTeamsSorted.value.filter((t) =>
    t.name.toLowerCase().includes(q)
  )
})

const selectedTeam = computed(() =>
  props.modelValue
    ? allTeamsSorted.value.find((t) => t.name === props.modelValue) ?? null
    : null
)

watch(open, (isOpen) => {
  if (isOpen) {
    searchQuery.value = ''
    highlightedIndex.value = 0
    setTimeout(() => listRef.value?.focus(), 0)
  }
})

watch(filteredOptions, () => {
  highlightedIndex.value = Math.min(highlightedIndex.value, Math.max(0, filteredOptions.value.length - 1))
})

function toggle() {
  open.value = !open.value
  if (open.value) emit('open')
  else emit('close')
}

function select(name: string) {
  emit('update:modelValue', name)
  open.value = false
  emit('close')
}

function close() {
  if (open.value) emit('close')
  open.value = false
}

function onTriggerKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    toggle()
    return
  }
  if (e.key === 'ArrowDown' && !open.value) {
    e.preventDefault()
    open.value = true
    return
  }
}

function onListKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    e.preventDefault()
    close()
    return
  }
  if (e.key === 'Enter') {
    e.preventDefault()
    const opt = filteredOptions.value[highlightedIndex.value]
    if (opt) select(opt.name)
    return
  }
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    highlightedIndex.value = Math.min(highlightedIndex.value + 1, filteredOptions.value.length - 1)
    return
  }
  if (e.key === 'ArrowUp') {
    e.preventDefault()
    highlightedIndex.value = Math.max(highlightedIndex.value - 1, 0)
    return
  }
  if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
    searchQuery.value += e.key
    const next = filteredOptions.value.findIndex((t) =>
      t.name.toLowerCase().startsWith(searchQuery.value.toLowerCase())
    )
    if (next >= 0) highlightedIndex.value = next
    e.preventDefault()
  }
}

function handleClickOutside(e: MouseEvent) {
  if (wrapRef.value && !wrapRef.value.contains(e.target as Node)) {
    close()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.team-select-wrap {
  position: relative;
  flex: 1;
  min-width: 0;
  z-index: 1;
}

.team-select-wrap.is-open {
  z-index: 200;
}

.team-select-trigger {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  font-size: 14px;
  color: #e6f1ff;
  text-align: left;
  background: rgba(10, 25, 47, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease;
}

.team-select-trigger:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.18);
}

.team-select-trigger:focus {
  outline: none;
  border-color: rgba(212, 175, 55, 0.5);
  box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.15);
}

.team-select-trigger.empty .trigger-placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.trigger-flag,
.option-flag {
  font-size: 20px;
  border-radius: 3px;
  flex-shrink: 0;
}

.trigger-name,
.option-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.trigger-chevron {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.4);
  flex-shrink: 0;
}

.team-select-list {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  max-height: 280px;
  overflow-y: auto;
  margin: 0;
  padding: 4px 0;
  list-style: none;
  background: rgba(10, 25, 47, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  z-index: 50;
}

.team-select-list:focus {
  outline: none;
}

.team-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  font-size: 14px;
  color: #e6f1ff;
  cursor: pointer;
  transition: background 0.1s ease;
}

.team-option .option-flag {
  font-size: 18px;
}

.team-option:hover,
.team-option.highlighted {
  background: rgba(255, 255, 255, 0.08);
}

.team-option.no-results {
  cursor: default;
  color: rgba(255, 255, 255, 0.45);
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
