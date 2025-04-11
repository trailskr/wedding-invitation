<script setup lang="ts">
const router = useRouter()
</script>

<template>
  <main class="flex flex-col gap-8 px-4 py-10 text-center text-gray-200 text-text">
    <Logo />
    <div class="text-5xl font-artistic">
      <RouterView />
    </div>
    <div>
      <PrimaryButton @click="router.back()">
        Назад
      </PrimaryButton>
    </div>
  </main>
</template>
