<template>
    <template v-if="user">
        {{ user }}
    </template>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const user = ref()

onMounted(() => {
    const res = $fetch('/api/user')
})

</script>