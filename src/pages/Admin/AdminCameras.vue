<template>
  <div class="cams-wrap">
    <!-- TOP BAR -->
    <header class="cams-top">
      <button class="btn-ghost small" @click="$router.back()">
        <i class="pi pi-angle-left"></i>
        Volver
      </button>

      <div class="cams-info">
        <div class="avatar-big">CM</div>
        <div>
          <h1 class="title">Gestión de Cámaras</h1>
          <p class="subtitle">Administración completa del sistema de cámaras</p>
        </div>
      </div>

      <button class="btn-ghost alerts">
        <i class="pi pi-bell"></i>
        Alertas
        <span class="badge">{{ alerts }}</span>
      </button>
    </header>

    <!-- KPIS -->
    <section class="kpis">
      <article class="kpi-card">
        <div class="kpi-head">
          <span>Total Cámaras</span>
          <div class="kpi-icon kpi-icon-blue">
            <i class="pi pi-camera"></i>
          </div>
        </div>
        <p class="kpi-value">{{ totalCameras }}</p>
      </article>

      <article class="kpi-card">
        <div class="kpi-head">
          <span>Operativas</span>
          <div class="kpi-icon kpi-icon-green">
            <i class="pi pi-check"></i>
          </div>
        </div>
        <p class="kpi-value">{{ operationalCameras }}</p>
      </article>

      <article class="kpi-card">
        <div class="kpi-head">
          <span>No Operativas</span>
          <div class="kpi-icon kpi-icon-red">
            <i class="pi pi-times"></i>
          </div>
        </div>
        <p class="kpi-value danger">{{ downCameras }}</p>
      </article>

      <article class="kpi-card">
        <div class="kpi-head">
          <span>En Mantenimiento</span>
          <div class="kpi-icon kpi-icon-orange">
            <i class="pi pi-wrench"></i>
          </div>
        </div>
        <p class="kpi-value">{{ maintenanceCameras }}</p>
      </article>
    </section>

    <!-- PANEL PRINCIPAL -->
    <section class="cams-panel">
      <div class="panel-head">
        <div>
          <h3 class="panel-title">Administración de Cámaras</h3>
          <p class="panel-sub">CRUD completo con actualización en tiempo real</p>
        </div>

        <button class="btn-primary" @click="onAddCamera">
          <i class="pi pi-plus"></i>
          Agregar Cámara
        </button>
      </div>

      <div class="table">
        <!-- encabezado -->
        <div class="thead">
          <div>Cámara</div>
          <div>Ubicación</div>
          <div>Agente Asignado</div>
          <div>Estado</div>
          <div>Última Conexión</div>
          <div class="center">Acciones</div>
        </div>

        <!-- filas -->
        <div
          v-for="cam in cameras"
          :key="cam.id"
          class="trow"
        >
          <div class="cam-cell">
            <div class="cam-name">{{ cam.name }}</div>
            <div class="cam-ip">{{ cam.ip }}</div>
          </div>

          <div class="muted">{{ cam.location }}</div>
          <div class="muted">{{ cam.agent }}</div>

          <div>
            <span :class="['chip', statusClass(cam.status)]">
              {{ statusLabel(cam.status) }}
            </span>
          </div>

          <div class="muted">{{ cam.lastConnection }}</div>

          <div class="actions">
            <button class="iconbtn" title="Editar">
              <i class="pi pi-pencil"></i>
            </button>

            <select
              v-model="cam.status"
              class="status-select"
            >
              <option
                v-for="opt in statusOptions"
                :key="opt.value"
                :value="opt.value"
              >
                {{ opt.label }}
              </option>
            </select>

            <button
              class="iconbtn danger"
              title="Eliminar"
              @click="removeCamera(cam.id)"
            >
              <i class="pi pi-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { reactive, computed, ref } from 'vue'

const alerts = ref(3)

// Estados disponibles
const statusOptions = [
  { value: 'operativa', label: 'Operativa' },
  { value: 'no_operativa', label: 'No operativa' },
  { value: 'mantenimiento', label: 'En mantenimiento' }
]

// Datos demo de cámaras (puedes luego conectarlo a tu API)
const cameras = reactive([
  {
    id: 1,
    name: 'Cámara Estación 1',
    ip: '192.168.1.101',
    location: 'Zona Norte - Piso 2',
    agent: 'Ana García',
    status: 'operativa',
    lastConnection: '15:32'
  },
  {
    id: 2,
    name: 'Cámara Estación 2',
    ip: '192.168.1.102',
    location: 'Zona Sur - Piso 1',
    agent: 'Carlos López',
    status: 'operativa',
    lastConnection: '15:31'
  },
  {
    id: 3,
    name: 'Cámara Estación 3',
    ip: '192.168.1.103',
    location: 'Zona Este - Piso 2',
    agent: 'María Rodríguez',
    status: 'no_operativa',
    lastConnection: '14:15'
  },
  {
    id: 4,
    name: 'Cámara Estación 4',
    ip: '192.168.1.104',
    location: 'Zona Oeste - Piso 2',
    agent: 'Juan Pérez',
    status: 'mantenimiento',
    lastConnection: '13:45'
  },
  {
    id: 5,
    name: 'Cámara Estación 5',
    ip: '192.168.1.105',
    location: 'Zona Centro - Piso 2',
    agent: 'Laura Martín',
    status: 'operativa',
    lastConnection: '15:33'
  }
])

// KPIs
const totalCameras = computed(() => cameras.length)
const operationalCameras = computed(
  () => cameras.filter(c => c.status === 'operativa').length
)
const downCameras = computed(
  () => cameras.filter(c => c.status === 'no_operativa').length
)
const maintenanceCameras = computed(
  () => cameras.filter(c => c.status === 'mantenimiento').length
)

// Helpers de estado
function statusLabel (value) {
  const found = statusOptions.find(o => o.value === value)
  return found ? found.label : value
}

function statusClass (value) {
  if (value === 'operativa') return 'chip-green'
  if (value === 'no_operativa') return 'chip-red'
  if (value === 'mantenimiento') return 'chip-orange'
  return ''
}

// Acciones
function onAddCamera () {
  alert('Aquí abrirías el modal para agregar una nueva cámara 😊')
}

function removeCamera (id) {
  const idx = cameras.findIndex(c => c.id === id)
  if (idx !== -1 && confirm('¿Eliminar esta cámara?')) {
    cameras.splice(idx, 1)
  }
}
</script>

<style scoped>
.cams-wrap {
  padding: 18px;
  background: #f5f6f8;
}

/* TOP BAR */
.cams-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.cams-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar-big {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  background: #e9efff;
  display: grid;
  place-items: center;
  font-weight: 800;
  color: #3553a8;
  font-size: 14px;
}

.title {
  margin: 0;
  font-size: 16px;
  font-weight: 800;
}

.subtitle {
  margin: 2px 0 0;
  font-size: 11px;
  color: #6b7280;
}

/* Botones top */
.btn-ghost {
  border: 1px solid #e5e7eb;
  background: #fff;
  border-radius: 999px;
  padding: 6px 12px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  cursor: pointer;
}

.btn-ghost.small {
  padding-inline: 10px;
}

.btn-ghost.alerts {
  gap: 8px;
}

.badge {
  min-width: 18px;
  height: 18px;
  border-radius: 999px;
  background: #f97316;
  color: #fff;
  font-size: 11px;
  display: grid;
  place-items: center;
}

/* KPIs */
.kpis {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.kpi-card {
  background: #fff;
  border-radius: 14px;
  border: 1px solid #ebeef3;
  padding: 12px 14px;
}

.kpi-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
  color: #6b7280;
}

.kpi-icon {
  width: 26px;
  height: 26px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  font-size: 14px;
}

.kpi-icon-blue {
  background: #e0edff;
  color: #2563eb;
}

.kpi-icon-green {
  background: #dcfce7;
  color: #16a34a;
}

.kpi-icon-red {
  background: #fee2e2;
  color: #dc2626;
}

.kpi-icon-orange {
  background: #ffedd5;
  color: #f97316;
}

.kpi-value {
  margin: 6px 0 0;
  font-size: 22px;
  font-weight: 800;
}

.kpi-value.danger {
  color: #dc2626;
}

/* PANEL PRINCIPAL */
.cams-panel {
  background: #fff;
  border: 1px solid #ebeef3;
  border-radius: 14px;
  padding: 14px 16px 18px;
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.panel-title {
  margin: 0;
  font-size: 14px;
  font-weight: 800;
}

.panel-sub {
  margin: 2px 0 0;
  font-size: 11px;
  color: #6b7280;
}

/* Tabla */
.table {
  border: 1px solid #eef1f5;
  border-radius: 12px;
  overflow: hidden;
}

.thead,
.trow {
  display: grid;
  grid-template-columns: 1.7fr 1.6fr 1.4fr 1fr 1fr 1.2fr;
  align-items: center;
  gap: 10px;
}

.thead {
  background: #f8fafc;
  font-size: 11px;
  font-weight: 700;
  color: #6b7280;
  padding: 8px 12px;
}

.trow {
  background: #fff;
  padding: 10px 12px;
  border-top: 1px solid #f1f3f6;
}

.cam-cell {
  display: flex;
  flex-direction: column;
}

.cam-name {
  font-size: 13px;
  font-weight: 600;
}

.cam-ip {
  font-size: 11px;
  color: #9ca3af;
}

.muted {
  font-size: 12px;
  color: #6b7280;
}

.center {
  text-align: center;
}

/* Chips estado */
.chip {
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  background: #f3f4f6;
}

.chip-green {
  background: #dcfce7;
  border-color: #bbf7d0;
  color: #15803d;
}

.chip-red {
  background: #fee2e2;
  border-color: #fecaca;
  color: #b91c1c;
}

.chip-orange {
  background: #ffedd5;
  border-color: #fed7aa;
  color: #c05621;
}

/* Acciones */
.actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
}

.iconbtn {
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #fff;
  padding: 5px 6px;
  cursor: pointer;
}

.iconbtn.danger {
  border-color: #fecaca;
  color: #dc2626;
}

.status-select {
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  padding: 4px 8px;
  font-size: 11px;
  background: #f9fafb;
}

/* Botón principal */
.btn-primary {
  border: none;
  border-radius: 999px;
  padding: 7px 14px;
  background: #22c55e;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

/* Icons */
.pi {
  font-size: 14px;
}

/* Responsive simple */
@media (max-width: 960px) {
  .kpis {
    grid-template-columns: repeat(2, 1fr);
  }

  .thead,
  .trow {
    grid-template-columns: 1.8fr 1.6fr 1.4fr 1fr;
  }

  .thead > :nth-child(5),
  .thead > :nth-child(6),
  .trow > :nth-child(5),
  .trow > :nth-child(6) {
    display: none;
  }
}
</style>
