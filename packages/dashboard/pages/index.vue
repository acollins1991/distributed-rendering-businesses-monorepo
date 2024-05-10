<template>

    Hello
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

onMounted(() => {
    fetch('http://localhost:8423/user')
})

</script>