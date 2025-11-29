<template>
  <div class="admin-landing">
    <div class="grid">
      <!-- Usuarios -->
      <section class="card">
        <div class="icon" style="background:#EAF7EE;color:#16a34a">
          <i class="pi pi-users"></i>
        </div>

        <h3 class="card-title">Gestión de Usuarios</h3>
        <p class="card-desc">Administra usuarios, roles y permisos del sistema</p>

        <div class="chips">
          <div class="chip">
            <b>{{ totalUsers }}</b>
            <span>Total Usuarios</span>
          </div>
          <div class="chip">
            <b>{{ activeAgents }}</b>
            <span>Usuarios Activos</span>
          </div>
        </div>

        <Button
          label="Acceder a Gestión de Usuarios"
          class="btn btn-green"
          @click="go('admin.users')"
        />
      </section>

      <!-- Cámaras -->
      <section class="card">
        <div class="icon" style="background:#EAF2FF;color:#3b82f6">
          <i class="pi pi-camera"></i>
        </div>

        <h3 class="card-title">Gestión de Cámaras</h3>
        <p class="card-desc">Administra cámaras, estados y configuración del sistema</p>

        <div class="chips">
          <div class="chip">
            <b>5</b>
            <span>Cámaras Totales</span>
          </div>
          <div class="chip">
            <b>3</b>
            <span>Operativas</span>
          </div>
        </div>

        <Button
          label="Acceder a Gestión de Cámaras"
          class="btn btn-blue"
          @click="go('admin.cameras')"
        />
      </section>

      <!-- Dashboard -->
      <section class="card">
        <div class="icon" style="background:#F3EAFF;color:#8b5cf6">
          <i class="pi pi-chart-bar"></i>
        </div>

        <h3 class="card-title">Dashboard de Cámaras</h3>
        <p class="card-desc">Análisis avanzado con gráficos y estadísticas en tiempo real</p>

        <div class="chips">
          <div class="chip">
            <b>98%</b>
            <span>Disponibilidad</span>
          </div>
          <div class="chip">
            <b>6</b>
            <span>Activas Ahora</span>
          </div>
        </div>

        <Button
          label="Acceder al Dashboard"
          class="btn btn-purple"
          @click="go('admin.cameras.dashboard')"
        />
      </section>
    </div>
  </div>
</template>

<script setup>
import Button from 'primevue/button'
import { useRouter } from 'vue-router'

import { ref, onMounted } from 'vue'
import { getUserSummary } from '@/services/user.api'

const router = useRouter()
const go = (name) => router.push({ name })

const totalUsers = ref(0)
const activeAgents = ref(0)

onMounted(async () => {
  try {
    const data = await getUserSummary()
    totalUsers.value = data.totalUsers ?? 0
    activeAgents.value = data.activeAgents ?? 0
  } catch (e) {
    console.error('Error cargando KPIs', e)
  }
})
</script>

<style scoped>
.admin-landing {
  padding: 24px;
  display: flex;
  justify-content: center;
}

/* Grid centrado y con anchos de tarjeta tipo mockup */
.grid {
  display: grid;
  gap: 28px;
  justify-content: center;
  grid-template-columns: repeat(3, 340px);
}

/* Tarjeta elegante */
.card {
  background: #fff;
  border: 1px solid #eceff3;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  transition: 0.2s;
}

/* Icono pastel redondo */
.icon {
  width: 60px;
  height: 60px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.icon i {
  font-size: 22px;
}

/* Título y descripción */
.card-title {
  margin: 2px 0 0;
  text-align: center;
  font-weight: 600;
  font-size: 15px;
  color: #111827;
}
.card-desc {
  margin: 0;
  text-align: center;
  color: #8b939f;
  font-size: 12.5px;
  line-height: 1.35;
}

/* Chips */
.chips {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}
.chip {
  background: #f6f7f9;
  border: 1px solid #eceff3;
  border-radius: 12px;
  padding: 10px 12px;
  min-width: 130px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.chip b {
  font-weight: 700;
  color: #111827;
}
.chip span {
  font-size: 12px;
  opacity: 0.7;
}

/* Botones */
.btn {
  width: 100%;
  border: none !important;
  font-weight: 700;
}
:deep(.p-button) {
  height: 34px;
  font-size: 12.5px;
}

/* Tipos de botones */
.btn-green {
  background: #22c55e !important;
}
.btn-green:hover {
  background: #1fb155 !important;
}
.btn-blue {
  background: #3b82f6 !important;
}
.btn-blue:hover {
  background: #336fce !important;
}
.btn-purple {
  background: #8b5cf6 !important;
}
.btn-purple:hover {
  background: #7b4ee3 !important;
}

/* Responsive */
@media (max-width: 1180px) {
  .grid {
    grid-template-columns: repeat(2, 340px);
  }
}

@media (max-width: 760px) {
  .grid {
    grid-template-columns: 1fr;
  }
  .card {
    max-width: 360px;
  }
}
</style>

