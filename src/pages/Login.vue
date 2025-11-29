<template>
  <div class="login-grid">
    <!-- IZQUIERDA -->
    <aside class="pane-left">
      <div class="left-content">
        <h1 class="left-title">Plataforma de Control de Emociones</h1>
        <p class="left-sub">Monitoreo inteligente de emociones para equipos de trabajo</p>

        <img class="left-art" src="@/assets/login.png" alt="Ilustración" />

        <div class="square"></div>
        <div class="dots"></div>
      </div>
    </aside>

    <!-- DERECHA -->
    <main class="pane-right">
      <div class="right-card">
        <div class="logo-round">
          <i class="pi pi-headphones"></i>
        </div>
        <h2 class="right-title">Inicio de Sesión</h2>
        <p class="right-sub">Ingresa tus credenciales para acceder a la Plataforma</p>

        <Message v-if="auth.error" severity="error" :closable="false" class="mb-10">
          {{ auth.error }}
        </Message>

        <form @submit.prevent="onSubmit" class="form">
          <label class="label">Correo corporativo</label>
          <span class="p-input-icon-left w-full">
            <i class="pi pi-envelope" ></i>
            <InputText
              v-model.trim="email"
              type="email"
              class="w-full"
              placeholder="usuario@empresa.com"
              autocomplete="username"
              required
            />
          </span>

          <label class="label">Contraseña</label>
          <Password
            v-model="password"
            :feedback="false"
            toggleMask
            inputClass="w-full"
            :inputStyle="{ width: '100%' }"
            placeholder="••••••"
            autocomplete="current-password"
            required
          />

          <Button type="submit" :loading="auth.loading" label="Ingresar" class="btn-primary" />
        </form>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Message from 'primevue/message'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const email = ref('')
const password = ref('')

watch([email, password], () => { if (auth.error) auth.error = '' })

async function onSubmit () {
  await auth.login(email.value, password.value)

  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : null
  if (redirect && redirect.startsWith('/')) {
    await router.replace(redirect)
    return
  }

  if (auth.role === 'admin') {
    await router.replace({ name: 'admin.home' })
  } else if (auth.role === 'supervisor') {
    await router.replace({ name: 'supervisor' })
  } else if (auth.role === 'agent'){
    await router.replace({ name: 'agent' })
  } else {
    await router.replace({ name: 'login' })
  }
}
</script>

<style scoped>
/* ===== GRID general ===== */
.login-grid {
  display: grid;
  grid-template-columns: 1.15fr 1fr;
  min-height: 100vh;
  background: #f3f5f7;
}

/* ===== PANEL IZQUIERDO ===== */
.pane-left {
  background: #31A854;
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  position: relative;
}
.left-content { width: 100%; max-width: 680px; padding: 28px; }
.left-title { margin: 0; font-size: 20px; font-weight: 800; }
.left-sub   { margin: 6px 0 0 0; font-size: 12.5px; opacity: .95; }

.left-art {
  width: 92%; max-width: 520px;
  display: block; margin: 22px auto 0 auto;
  border-radius: 18px; box-shadow: 0 10px 24px rgba(0,0,0,.18);
  object-fit: contain;
}

/* decorativos */
.square {
  position: absolute; left: 22px; top: 72px;
  width: 60px; height: 60px; border-radius: 10px;
  border: 1px solid rgba(255,255,255,.35);
}
.dots {
  position: absolute; left: 22px; bottom: 22px;
  width: 90px; height: 90px; border-radius: 12px; opacity: .45;
  background: radial-gradient(#ffffff 2px, transparent 3px) 0 0/16px 16px;
}

/* ===== PANEL DERECHO ===== */
.pane-right { display: flex; align-items: center; justify-content: center; }
.right-card {
  width: 100%; max-width: 420px;
  background: #fff; border: 1px solid #e7ebf0; border-radius: 16px;
  box-shadow: 0 8px 22px rgba(0,0,0,.06);
  padding: 22px 22px 16px;
  text-align: center;
}

.logo-round {
  width: 56px; height: 56px; margin: 4px auto 8px auto;
  border-radius: 999px; display: grid; place-items: center;
  background: #E9F7EF; color: #21A658; font-size: 22px;
}
.right-title { margin: 0; font-size: 18px; font-weight: 800; color: #1f2937; }
.right-sub   { margin: 4px 0 12px 0; font-size: 11.5px; color: #6b7280; }

/* ===== FORM ===== */
.form { text-align: left; }
.label { display:block; font-size:12px; color:#374151; margin:8px 0 4px; }

.btn-primary {
  width: 100%;
  margin-top: 12px;
  background: #2DA14F !important;
  border: none !important;
  font-weight: 700;
}
.btn-primary:hover { background: #268E45 !important; }

/* PrimeVue compact look */
:deep(.p-inputtext){ height: 38px; padding: 0 12px; }
:deep(.p-input-icon-left > .p-inputtext){ padding-left: 2.25rem; }
:deep(.p-password .p-inputtext){ height: 38px; padding: 0 40px 0 12px; }
:deep(.p-password .p-password-panel){ display: none !important; }

/* responsive */
@media (max-width: 1024px){
  .login-grid { grid-template-columns: 1fr; }
  .pane-left { display: none; }
  .pane-right { padding: 24px; }
  .right-card { box-shadow: 0 6px 16px rgba(0,0,0,.06); }
}
#vue-devtools-container,
#__VUE_DEVTOOLS_CONTAINER__,
#__VUE_DEVTOOLS_INSTANCE__,
#__VUE_DEVTOOLS_TOGGLE__,
#__VUE_DEVTOOLS_ROOT__ {
  display: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
}
</style>
