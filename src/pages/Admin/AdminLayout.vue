<template>
  <div class="wrap">
    <header class="topbar">
      <div class="left">
        <Avatar label="AD" size="large" class="avatar" />
        <div>
          <h1 class="title">Panel de Administración</h1>
          <small class="subtitle">Selecciona el área que deseas gestionar</small>
        </div>
      </div>
      <Button label="Cerrar Sesión" size="small" text @click="logout" />
    </header>

    <main class="container">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import Avatar from 'primevue/avatar'
import Button from 'primevue/button'
import { useAuthStore } from '@/stores/auth'
const auth = useAuthStore?.()
const logout = () => { auth?.logout?.(); location.href = '/login' }
</script>

<style scoped>
.wrap{min-height:100vh;background:#f6f7f9;display:flex;flex-direction:column}
.topbar{
  background:#fff;border-bottom:1px solid #ebeef3;
  padding:10px 18px;display:flex;align-items:center;justify-content:space-between
}
.left{display:flex;align-items:center;gap:12px}
.avatar :deep(.p-avatar){
  background:#7c3aed1a;color:#7c3aed;border:1px solid #ece7ff;
}
.title{margin:0;font-weight:600;font-size:14px;color:#111827}
.subtitle{margin:0;color:#9aa3af;font-size:12px}
.container{max-width:1100px;margin:0 auto;padding:30px 18px}
</style>
