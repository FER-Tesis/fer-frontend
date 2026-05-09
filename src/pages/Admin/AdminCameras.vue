<template>
  <div class="cams-wrap">
    <Toast position="bottom-right" />
    <ConfirmDialog class="camera-confirm-dialog" />

    <!-- TOP BAR -->
    <header class="cams-top">
      <button class="btn-ghost small" @click="goBack">
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
        <p class="kpi-value">{{ kpis.totalCameras }}</p>
      </article>

      <article class="kpi-card">
        <div class="kpi-head">
          <span>Operativas</span>
          <div class="kpi-icon kpi-icon-green">
            <i class="pi pi-check"></i>
          </div>
        </div>
        <p class="kpi-value">{{ kpis.activeCameras }}</p>
      </article>

      <article class="kpi-card">
        <div class="kpi-head">
          <span>No Operativas</span>
          <div class="kpi-icon kpi-icon-red">
            <i class="pi pi-times"></i>
          </div>
        </div>
        <p class="kpi-value danger">{{ kpis.inactiveCameras }}</p>
      </article>

      <article class="kpi-card">
        <div class="kpi-head">
          <span>En Mantenimiento</span>
          <div class="kpi-icon kpi-icon-orange">
            <i class="pi pi-wrench"></i>
          </div>
        </div>
        <p class="kpi-value">{{ kpis.maintenanceCameras }}</p>
      </article>
    </section>

    <!-- PANEL PRINCIPAL -->
    <section class="cams-panel">
      <div class="panel-head">
        <div>
          <h3 class="panel-title">Administración de Cámaras</h3>
          <p class="panel-sub">CRUD completo con actualización en tiempo real</p>
        </div>

        <button class="btn-primary" @click="openNewCamera">
          <i class="pi pi-plus"></i>
          Agregar Cámara
        </button>
      </div>

      <div class="table">
        <div class="thead">
          <div>Cámara</div>
          <div>Ubicación</div>
          <div>Agente Asignado</div>
          <div>Estado</div>
          <div>Última Conexión</div>
          <div class="center">Acciones</div>
        </div>

        <div
          v-for="cam in cameras"
          :key="cam.id"
          class="trow"
        >
          <div class="cam-cell">
            <div class="cam-name">{{ cam.name }}</div>
            <div class="cam-ip">{{ cam.ip_address }}</div>
          </div>

          <div class="muted">{{ cam.location }}</div>
          <div class="muted">{{ cam.assigned_user_name || 'Sin asignar' }}</div>

          <div>
            <span :class="['chip', statusClass(cam.status)]">
              {{ statusLabel(cam.status) }}
            </span>
          </div>

          <div class="muted">{{ formatLastChecked(cam.last_checked) }}</div>

          <div class="actions">
            <button class="iconbtn" title="Editar" @click="openEditCamera(cam)">
              <i class="pi pi-pencil"></i>
            </button>

            <select
              class="status-select"
              :value="cam.status"
              :disabled="updatingStatusId === cam.id"
              title="Cambiar estado"
              @change="changeCameraStatus(cam, $event.target.value)"
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
              @click="deleteCameraConfirm(cam)"
            >
              <i class="pi pi-trash"></i>
            </button>
          </div>
        </div>

        <div v-if="!loadingCameras && cameras.length === 0" class="trow">
          <div class="muted" style="grid-column: 1 / -1">
            No hay cámaras registradas todavía.
          </div>
        </div>

        <div v-if="loadingCameras" class="trow">
          <div class="muted" style="grid-column: 1 / -1">
            Cargando cámaras...
          </div>
        </div>
      </div>
    </section>

    <!-- MODAL NUEVA / EDITAR CÁMARA -->
    <div v-if="cameraModalOpen" class="modal">
      <div class="modal-backdrop" @click="closeCameraModal"></div>

      <div class="modal-card">
        <div class="modal-head">
          <h4>{{ isEditing ? 'Editar Cámara' : 'Agregar Nueva Cámara' }}</h4>
          <button class="iconbtn" @click="closeCameraModal">
            <i class="pi pi-times" />
          </button>
        </div>

        <p class="modal-sub">
          Completa la información de la cámara. El estado y la última conexión se gestionan automáticamente.
        </p>

        <div class="modal-body">
          <label class="lbl">Nombre de la cámara</label>
          <input
            class="input"
            v-model.trim="form.name"
            placeholder="Ej: Cámara Estación 1"
          />

          <label class="lbl">Ubicación</label>
          <input
            class="input"
            v-model.trim="form.location"
            placeholder="Ej: Zona Norte - Piso 2"
          />

          <label class="lbl">Dirección IP</label>
          <input
            class="input"
            v-model.trim="form.ip_address"
            placeholder="Ej: 192.168.1.101"
          />

          <hr class="divider" />

          <label class="lbl">Usuario asignado</label>
          <select class="input" v-model="form.assigned_user_id">
            <option :value="null">Sin asignar</option>
            <option
              v-for="agent in availableAgents"
              :key="agent.id"
              :value="agent.id"
            >
              {{ agent.name }}
            </option>
          </select>

          <div v-if="selectedAgent" class="assigned-row">
            <span class="agent-name">{{ selectedAgent.name }}</span>
            <button
              class="iconbtn danger"
              title="Quitar agente"
              @click="form.assigned_user_id = null"
            >
              <i class="pi pi-minus-circle" />
            </button>
          </div>
        </div>

        <div class="modal-foot">
          <button class="btn ghost" @click="closeCameraModal">Cancelar</button>
          <button class="btn primary" @click="submitCamera" :disabled="savingCamera">
            {{ savingCamera ? 'Guardando…' : isEditing ? 'Guardar Cambios' : 'Agregar Cámara' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, reactive, onMounted } from 'vue'
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import { useRouter } from 'vue-router'

import {
  getCameras,
  getCamerasMetrics,
  createCamera,
  updateCamera,
  updateCameraStatus,
  deleteCamera
} from '@/services/camera.api'

import { getUsers } from '@/services/user.api'

const toast = useToast()
const confirm = useConfirm()
const router = useRouter()

function goBack () {
  router.push({ name: 'admin.home' })
}

const alerts = ref(0)

const kpis = ref({
  totalCameras: 0,
  activeCameras: 0,
  inactiveCameras: 0,
  maintenanceCameras: 0
})

const statusOptions = [
  { value: 'active', label: 'Operativa' },
  { value: 'inactive', label: 'No operativa' },
  { value: 'maintenance', label: 'En mantenimiento' }
]

const cameras = ref([])
const allAgents = ref([])
const loadingCameras = ref(false)

const cameraModalOpen = ref(false)
const isEditing = ref(false)
const savingCamera = ref(false)
const updatingStatusId = ref(null)

const form = reactive({
  id: null,
  name: '',
  location: '',
  ip_address: '',
  assigned_user_id: null
})

const assignedAgentIds = computed(() => {
  return new Set(
    cameras.value
      .filter(camera => !isEditing.value || camera.id !== form.id)
      .map(camera => camera.assigned_user_id)
      .filter(Boolean)
  )
})

const availableAgents = computed(() => {
  return allAgents.value.filter(agent => !assignedAgentIds.value.has(agent.id))
})

const selectedAgent = computed(() => {
  return allAgents.value.find(agent => agent.id === form.assigned_user_id)
})

function mapCamera (camera) {
  const assignedUser = camera.assigned_user || camera.assignedUser || null
  const assignedUserId = camera.assigned_user_id || assignedUser?._id || assignedUser?.id || ''

  return {
    id: camera._id || camera.id,
    name: camera.name || '',
    location: camera.location || '',
    ip_address: camera.ip_address || camera.ip || '',
    status: camera.status || 'inactive',
    assigned_user_id: assignedUserId,
    assigned_user_name: assignedUser?.name || findAgentName(assignedUserId),
    last_checked: camera.last_checked || camera.lastChecked || null
  }
}

function findAgentName (agentId) {
  if (!agentId) return ''
  const found = allAgents.value.find(agent => agent.id === agentId)
  return found?.name || ''
}

function resetForm () {
  form.id = null
  form.name = ''
  form.location = ''
  form.ip_address = ''
  form.assigned_user_id = null
}

async function loadAgents () {
  try {
    const data = await getUsers()
    allAgents.value = Array.isArray(data)
      ? data
          .filter(user => user.role === 'agent')
          .map(user => ({
            id: user._id || user.id,
            name: user.name,
            email: user.email
          }))
      : []
  } catch (e) {
    console.error(e)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo cargar la lista de agentes.',
      life: 4000
    })
  }
}

async function loadCameras () {
  loadingCameras.value = true
  try {
    const data = await getCameras()
    cameras.value = Array.isArray(data) ? data.map(mapCamera) : []
  } catch (e) {
    console.error(e)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo cargar la lista de cámaras.',
      life: 4000
    })
  } finally {
    loadingCameras.value = false
  }
}

async function loadKpis () {
  try {
    const data = await getCamerasMetrics()
    kpis.value.totalCameras = data.totalCameras ?? 0
    kpis.value.activeCameras = data.activeCameras ?? 0
    kpis.value.inactiveCameras = data.inactiveCameras ?? 0
    kpis.value.maintenanceCameras = data.maintenanceCameras ?? 0
  } catch (e) {
    console.error(e)
  }
}

function openNewCamera () {
  isEditing.value = false
  resetForm()
  cameraModalOpen.value = true
}

function openEditCamera (camera) {
  isEditing.value = true
  form.id = camera.id
  form.name = camera.name
  form.location = camera.location
  form.ip_address = camera.ip_address
  form.assigned_user_id = camera.assigned_user_id || null
  cameraModalOpen.value = true
}

function closeCameraModal () {
  cameraModalOpen.value = false
  resetForm()
}

function validateCameraForm () {
  if (!form.name.trim() || !form.location.trim() || !form.ip_address.trim()) {
    toast.add({
      severity: 'warn',
      summary: 'Campos incompletos',
      detail: 'Completa nombre, ubicación e IP.',
      life: 3000
    })
    return false
  }

  return true
}

async function submitCamera () {
  if (!validateCameraForm()) return

  const payload = {
    name: form.name.trim(),
    location: form.location.trim(),
    ip_address: form.ip_address.trim(),
    assigned_user_id: form.assigned_user_id || null
  }

  savingCamera.value = true

  try {
    if (isEditing.value && form.id) {
      await updateCamera(form.id, payload)

      toast.add({
        severity: 'success',
        summary: 'Cámara actualizada',
        detail: payload.name,
        life: 3500
      })
    } else {
      await createCamera(payload)

      toast.add({
        severity: 'success',
        summary: 'Cámara agregada',
        detail: payload.name,
        life: 3500
      })
    }

    closeCameraModal()
    await loadCameras()
    await loadKpis()
  } catch (e) {
    console.error(e)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo guardar la cámara.',
      life: 4000
    })
  } finally {
    savingCamera.value = false
  }
}


async function changeCameraStatus (camera, newStatus) {
  if (!camera?.id || camera.status === newStatus) return

  const previousStatus = camera.status
  camera.status = newStatus
  updatingStatusId.value = camera.id

  try {
    await updateCameraStatus(camera.id, { status: newStatus })

    toast.add({
      severity: 'success',
      summary: 'Estado actualizado',
      detail: `${camera.name}: ${statusLabel(newStatus)}`,
      life: 3000
    })

    await loadKpis()
  } catch (e) {
    camera.status = previousStatus
    console.error(e)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo actualizar el estado de la cámara.',
      life: 4000
    })
  } finally {
    updatingStatusId.value = null
  }
}

function deleteCameraConfirm (camera) {
  confirm.require({
    message: `Esta acción eliminará la cámara ${camera.name} del sistema.`,
    header: 'Eliminar cámara',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Cancelar',
    acceptLabel: 'Eliminar',
    acceptClass: 'confirm-delete-btn',
    rejectClass: 'confirm-cancel-btn',
    accept: async () => {
      try {
        await deleteCamera(camera.id)

        toast.add({
          severity: 'success',
          summary: 'Cámara eliminada',
          detail: camera.name,
          life: 3500
        })

        await loadCameras()
        await loadKpis()
      } catch (e) {
        console.error(e)
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo eliminar la cámara.',
          life: 4000
        })
      }
    }
  })
}

function statusLabel (value) {
  const found = statusOptions.find(option => option.value === value)
  return found ? found.label : value
}

function statusClass (value) {
  if (value === 'active') return 'chip-green'
  if (value === 'inactive') return 'chip-red'
  if (value === 'maintenance') return 'chip-orange'
  return 'chip-gray'
}

function formatLastChecked (value) {
  if (!value) return '—'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(async () => {
  await loadAgents()
  await loadCameras()
  loadKpis()
})
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

.chip-gray {
  background: #f1f5f9;
  color: #64748b;
  border-color: #e2e8f0;
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

/* Modal */
.modal {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  z-index: 50;
}

.modal-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(2px);
}

.modal-card {
  position: relative;
  background: #fff;
  border: 1px solid #ebeef3;
  border-radius: 18px;
  width: 640px;
  max-width: calc(100vw - 24px);
  padding: 20px 24px 18px;
}

.modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.modal-head h4 {
  margin: 0;
  font-weight: 800;
}

.modal-sub {
  margin: 0 0 12px;
  font-size: 13px;
  color: #6b7280;
}

.modal-body {
  display: grid;
  gap: 10px;
}

.lbl {
  font-size: 12px;
  font-weight: 700;
  color: #374151;
}

.input {
  height: 38px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 0 10px;
}

.divider {
  border: 0;
  border-top: 1px solid #e5e7eb;
  margin: 12px 0;
}

.assigned-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
}

.agent-name {
  font-weight: 500;
  font-size: 13px;
}

.modal-foot {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 14px;
}

.btn {
  border: none;
  border-radius: 10px;
  padding: 8px 12px;
  cursor: pointer;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn.primary {
  background: #22c55e;
  color: #fff;
}

.btn.primary:disabled {
  opacity: 0.7;
  cursor: default;
}

.btn.ghost {
  background: #eef2f7;
  color: #374151;
}

/* Icons */
.pi {
  font-size: 14px;
}


/* PrimeVue ConfirmDialog alineado al diseño de esta vista */
:global(.camera-confirm-dialog) {
  border: 1px solid #ebeef3;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.18);
  font-family: inherit;
  color: #374151;
}

:global(.camera-confirm-dialog .p-dialog-header) {
  padding: 18px 22px 8px;
  border-bottom: 0;
}

:global(.camera-confirm-dialog .p-dialog-title) {
  font-size: 15px;
  font-weight: 800;
  color: #111827;
}

:global(.camera-confirm-dialog .p-dialog-content) {
  padding: 8px 22px 12px;
  color: #6b7280;
  font-size: 13px;
}

:global(.camera-confirm-dialog .p-confirmdialog-icon) {
  color: #dc2626;
  font-size: 18px;
  margin-right: 10px;
}

:global(.camera-confirm-dialog .p-confirmdialog-message) {
  margin-left: 0;
  line-height: 1.5;
}

:global(.camera-confirm-dialog .p-dialog-footer) {
  padding: 10px 22px 18px;
  border-top: 0;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

:global(.camera-confirm-dialog .p-button) {
  border-radius: 10px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 700;
  box-shadow: none;
}

:global(.camera-confirm-dialog .confirm-cancel-btn) {
  background: #eef2f7;
  border-color: #eef2f7;
  color: #374151;
}

:global(.camera-confirm-dialog .confirm-delete-btn) {
  background: #dc2626;
  border-color: #dc2626;
  color: #fff;
}

:global(.camera-confirm-dialog .confirm-cancel-btn:hover) {
  background: #e5e7eb;
  border-color: #e5e7eb;
  color: #374151;
}

:global(.camera-confirm-dialog .confirm-delete-btn:hover) {
  background: #b91c1c;
  border-color: #b91c1c;
  color: #fff;
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

<style>
.p-confirmdialog-icon {
  width: auto !important;
  height: auto !important;
}
</style>