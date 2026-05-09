<template>
  <div class="admin-users">
    <!-- HEADER SUPERIOR -->
    <div class="admin-header">
      <div class="admin-header-left">
        <button class="btn-back" @click="goBack">
          <i class="pi pi-arrow-left" />
          <span>Volver al panel</span>
        </button>
        <div class="admin-title-block">
          <h2>Panel de Administración</h2>
          <p>Gestión global de la plataforma EmotiCall</p>
        </div>
      </div>
    </div>
    <Toast position="bottom-right" />
    <ConfirmDialog class="user-confirm-dialog" />

    <!-- KPIs -->
    <section class="kpis">
      <div class="kpi">
        <div class="kpi-head">
          <span>Total Usuarios</span>
          <i class="pi pi-users"></i>
        </div>
        <h3>{{ kpis.totalUsers }}</h3>
      </div>

      <div class="kpi">
        <div class="kpi-head">
          <span>Agentes Activos</span>
          <i class="pi pi-chart-line"></i>
        </div>
        <h3>{{ kpis.activeAgents }}</h3>
      </div>

      <div class="kpi">
        <div class="kpi-head">
          <span>Alertas Activas</span>
          <i class="pi pi-cog"></i>
        </div>
        <h3 class="danger">{{ kpis.activeAlerts }}</h3>
      </div>
    </section>

    <!-- Tabs (rail central como el mockup) -->
    <div class="tabs-rail">
      <div class="tabs">
        <button
          class="tab"
          :class="{ active: activeTab === 'users' }"
          @click="activeTab = 'users'"
        >
          Gestión de Usuarios
        </button>
      </div>
    </div>

    <!-- PANEL PRINCIPAL -->
    <section class="panel">
      <!-- TAB 1: Gestión de Usuarios -->
      <div v-if="activeTab === 'users'">
        <div class="panel-head">
          <div class="title">
            <h3>Gestión de Usuarios</h3>
            <p>Administra usuarios, roles y permisos del sistema</p>
          </div>

          <button class="btn primary" @click="openNewUser">
            <i class="pi pi-plus"></i>
            <span>Agregar Usuario</span>
          </button>
        </div>

        <div class="table">
          <div class="thead">
            <div>Usuario</div>
            <div>Correo</div>
            <div>Rol</div>
            <div>Estado</div>
            <div class="center">Acciones</div>
          </div>

          <div
            v-for="u in users"
            :key="u.id || u.email"
            class="trow"
          >
            <div class="usercell">
              <span class="avatar">{{ initials(u.name) }}</span>
              <span>{{ u.name }}</span>
            </div>
            <div class="muted">{{ u.email }}</div>
            <div>
              <span
                :class="[
                  'chip',
                  u.role === 'supervisor'
                    ? 'chip-blue'
                    : u.role === 'admin'
                      ? 'chip-gray'
                      : 'chip-orange'
                ]"
              >
                {{ roleLabel(u.role) }}
              </span>
            </div>
            <div>
              <span :class="['chip', u.is_active ? 'chip-green' : 'chip-gray']">
                {{ u.is_active ? 'Activo' : 'Inactivo' }}
              </span>
            </div>
            <div class="actions">
              <button class="iconbtn" title="Editar" @click="openEditUser(u)">
                <i class="pi pi-pencil" />
              </button>
              <button
                class="iconbtn"
                title="Ver"
                @click="viewUser(u)"
              >
                <i class="pi pi-eye" />
              </button>
              <button
                v-if="u.role === 'supervisor'"
                class="iconbtn"
                title="Gestionar agentes"
                @click="manageAgents(u)"
              >
                <i class="pi pi-users" />
              </button>
              <button
                class="iconbtn danger"
                title="Eliminar"
                @click="deleteUserConfirm(u)"
              >
                <i class="pi pi-trash" />
              </button>
            </div>
          </div>

          <div v-if="!loadingUsers && users.length === 0" class="trow">
            <div class="muted" style="grid-column: 1 / -1">
              No hay usuarios registrados todavía.
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- MODAL NUEVO / EDITAR USUARIO -->
    <div v-if="newUserOpen" class="modal">
      <div class="modal-backdrop" @click="closeNewUser"></div>

      <div class="modal-card">
        <div class="modal-head">
          <h4>{{ isEditing ? 'Editar Usuario' : 'Agregar Nuevo Usuario' }}</h4>
          <button class="iconbtn" @click="closeNewUser">
            <i class="pi pi-times" />
          </button>
        </div>

        <p class="modal-sub">
          Completa la información del usuario del sistema.
        </p>

        <div class="modal-body">
          <label class="lbl">Nombre Completo</label>
          <input
            class="input"
            v-model.trim="form.name"
            placeholder="Ej: Ana García"
          />

          <label class="lbl">Correo</label>
          <input
            class="input"
            type="email"
            v-model.trim="form.email"
            placeholder="ana.garcia@empresa.com"
          />

          <label class="lbl">Rol</label>
          <select class="input" v-model="form.role">
            <option value="agent">Agente</option>
            <option value="supervisor">Supervisor</option>
            <option value="admin">Administrador</option>
          </select>

          <!-- Campo: Contraseña (solo al crear) -->
          <label v-if="!isEditing" class="lbl">Contraseña</label>
          <input
            v-if="!isEditing"
            class="input"
            type="password"
            v-model.trim="form.password"
            placeholder="Ingresa la contraseña"
          />

          <!-- Campo: Repetir Contraseña (solo al crear) -->
          <label v-if="!isEditing" class="lbl">Repetir Contraseña</label>
          <input
            v-if="!isEditing"
            class="input"
            type="password"
            v-model.trim="form.passwordRepeat"
            placeholder="Repite la contraseña"
          />

          <hr class="divider" />
        </div>

        <div class="modal-foot">
          <button class="btn ghost" @click="closeNewUser">Cancelar</button>
          <button class="btn primary" @click="submitUser" :disabled="savingUser">
            {{ savingUser ? 'Guardando…' : isEditing ? 'Guardar Cambios' : 'Agregar Usuario' }}
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL: GESTIONAR AGENTES DE UN SUPERVISOR -->
    <div v-if="manageAgentsOpen" class="modal">
      <div class="modal-backdrop" @click="closeManageAgents"></div>
    
      <div class="modal-card">
        <div class="modal-head">
          <h4>Agentes asignados</h4>
          <button class="iconbtn" @click="closeManageAgents">
            <i class="pi pi-times" />
          </button>
        </div>
      
        <p class="modal-sub">
          Gestión de agentes bajo supervisión de <strong>{{ selectedSupervisor?.name }}</strong>.
        </p>
      
        <div class="modal-body">
        
          <!-- LISTA DE AGENTES ASIGNADOS -->
          <label class="lbl">Agentes actuales</label>
        
          <div v-if="assignedAgents.length > 0" class="assigned-list">
            <div
              class="assigned-row"
              v-for="agent in assignedAgents"
              :key="agent.id"
            >
              <span class="agent-name">{{ agent.name }}</span>
          
              <button
                class="iconbtn danger"
                title="Quitar agente"
                @click="removeAgentBtn(agent)"
              >
                <i class="pi pi-minus-circle" />
              </button>
            </div>
          </div>
        
          <div v-else class="muted">
            Este supervisor aún no tiene agentes asignados.
          </div>
        
          <hr class="divider" />
        
          <!-- AGREGAR NUEVO AGENTE -->
          <label class="lbl">Agregar agente</label>
        
          <select class="input" v-model="selectedAgentToAdd">
            <option disabled value="">Selecciona un agente disponible</option>
            <option
              v-for="a in availableAgents"
              :key="a.id"
              :value="a.id"
            >
              {{ a.name }}
            </option>
          </select>
        
          <button
            class="btn primary mt-2"
            :disabled="!selectedAgentToAdd"
            @click="addAgentToSupervisor"
          >
            Agregar Agente
          </button>
        
        </div>
      
        <div class="modal-foot">
          <button class="btn ghost" @click="closeManageAgents">Cerrar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import { useRouter } from 'vue-router'

import {
  getUsers,
  getUsersMetrics,
  createUser,
  updateUser,
  deleteUser
} from '@/services/user.api'

import {
  addAgent,
  getAssignedAgents,
  getAvailableAgents,
  removeAgent
} from '@/services/relations.api'

const toast = useToast()
const confirm = useConfirm()
const router = useRouter()

function goBack () {
  router.push({ name: 'admin.home' })
}

const activeTab = ref('users')

const kpis = ref({
  totalUsers: 0,
  activeAgents: 0,
  activeAlerts: 0,
  wellbeing: 0
})

const users = ref([])
const loadingUsers = ref(false)

function initials (name = '') {
  const parts = name.split(' ').filter(Boolean)
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase()
}

function roleLabel (role) {
  if (role === 'admin') return 'Administrador'
  if (role === 'supervisor') return 'Supervisor'
  return 'Agente'
}

/* ====== Cargar usuarios y KPIs ====== */
async function loadUsers () {
  loadingUsers.value = true
  try {
    const data = await getUsers()

    users.value = Array.isArray(data)
      ? data.map(u => ({
          id: u._id,
          name: u.name,
          email: u.email,
          role: u.role,
          is_active: u.is_active
        }))
      : []

  } catch (e) {
    console.error(e)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo cargar la lista de usuarios.',
      life: 4000
    })
  } finally {
    loadingUsers.value = false
  }
}

async function loadKpis () {
  try {
    const data = await getUsersMetrics()
    kpis.value.totalUsers = data.totalUsers ?? 0
    kpis.value.activeAgents = data.activeAgents ?? 0
    kpis.value.activeAlerts = 0
  } catch (e) {
    console.error(e)
  }
}

/* ====== Métricas (mock visual) ====== */
const emotionDistribution = reactive([
  { label: 'Positivo', color: '#22c55e', percent: 35 },
  { label: 'Relajado', color: '#86efac', percent: 25 },
  { label: 'Neutral', color: '#9ca3af', percent: 20 },
  { label: 'Tenso', color: '#f97316', percent: 15 },
  { label: 'Estresado', color: '#ef4444', percent: 5 }
])

const weeklyTrends = reactive([
  { day: 'Lun', positive: 45, neutral: 35, stressed: 20 },
  { day: 'Mar', positive: 42, neutral: 38, stressed: 20 },
  { day: 'Mié', positive: 48, neutral: 32, stressed: 20 },
  { day: 'Jue', positive: 40, neutral: 38, stressed: 22 },
  { day: 'Vie', positive: 38, neutral: 40, stressed: 22 },
  { day: 'Sáb', positive: 42, neutral: 36, stressed: 22 },
  { day: 'Dom', positive: 41, neutral: 37, stressed: 22 }
])

/* ====== Modal NUEVO / EDITAR USUARIO ====== */
const newUserOpen = ref(false)
const isEditing = ref(false)
const savingUser = ref(false)

const form = reactive({
  id: null,
  name: '',
  email: '',
  role: 'agent',
  password: '',
  passwordRepeat: ''
})

function resetForm() {
  form.id = null
  form.name = ''
  form.email = ''
  form.role = 'agent'
  form.password = ''
  form.passwordRepeat = ''
}

function openNewUser () {
  isEditing.value = false
  resetForm()
  newUserOpen.value = true
}

function openEditUser (user) {
  isEditing.value = true
  form.id = user.id
  form.name = user.name
  form.email = user.email
  form.role = user.role || 'agent'
  newUserOpen.value = true
}

function closeNewUser () {
  newUserOpen.value = false
}

async function submitUser () {
  // Validaciones básicas
  if (!form.name.trim() || !form.email.trim()) {
    toast.add({
      severity: 'warn',
      summary: 'Campos incompletos',
      detail: 'Completa nombre y correo del usuario.',
      life: 3000
    })
    return
  }

  // Solo validar contraseña si estamos creando (no editando)
  if (!isEditing.value) {
    if (!form.password.trim() || !form.passwordRepeat.trim()) {
      toast.add({
        severity: 'warn',
        summary: 'Contraseña requerida',
        detail: 'Debes ingresar y repetir la contraseña.',
        life: 3000
      })
      return
    }

    if (form.password.trim() !== form.passwordRepeat.trim()) {
      toast.add({
        severity: 'error',
        summary: 'Contraseñas no coinciden',
        detail: 'Asegúrate de que ambas contraseñas sean iguales.',
        life: 3500
      })
      return
    }
  }

  const payload = {
    name: form.name.trim(),
    email: form.email.trim(),
    role: form.role
  }

  // Agregar contraseña solo al crear
  if (!isEditing.value) {
    payload.password = form.password.trim()
  }

  savingUser.value = true

  try {
    if (isEditing.value && form.id) {
      // PATCH
      const updated = await updateUser(form.id, payload)
      const idx = users.value.findIndex(u => u.id === form.id)
      if (idx !== -1) {
        users.value[idx] = { ...users.value[idx], ...updated }
      }

      toast.add({
        severity: 'success',
        summary: 'Usuario actualizado',
        detail: form.email,
        life: 3500
      })
    } else {
      // POST
      const created = await createUser(payload)
      users.value.unshift({
        id: created._id,
        name: created.name,
        email: created.email,
        role: created.role,
        is_active: created.is_active
      })
      kpis.value.totalUsers = users.value.length

      toast.add({
        severity: 'success',
        summary: 'Usuario agregado',
        detail: form.email,
        life: 3500
      })
    }

    newUserOpen.value = false
    resetForm()
  } catch (e) {
    console.error(e)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo guardar el usuario.',
      life: 4000
    })
  } finally {
    savingUser.value = false
  }
}

/* ====== Modal GESTIONAR AGENTES DE UN SUPERVISOR ====== */
const manageAgentsOpen = ref(false)
const selectedSupervisor = ref(null)

const assignedAgents = ref([])
const availableAgents = ref([])
const selectedAgentToAdd = ref('')

async function manageAgents(user) {
  selectedSupervisor.value = user
  manageAgentsOpen.value = true

  try {
    assignedAgents.value = await getAssignedAgents(user.id)

    availableAgents.value = await getAvailableAgents()

  } catch (e) {
    console.error(e)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los agentes del supervisor.',
      life: 4000
    })
  }
}

function closeManageAgents() {
  manageAgentsOpen.value = false
  selectedSupervisor.value = null
  assignedAgents.value = []
  availableAgents.value = []
  selectedAgentToAdd.value = ''
}

async function addAgentToSupervisor() {
  try {
    const agentId = selectedAgentToAdd.value
    if (!agentId) return

    const created = await addAgent(selectedSupervisor.value.id, agentId)
    const addedAgent = availableAgents.value.find(a => a.id === agentId)

    if (addedAgent) {
      assignedAgents.value.push(addedAgent)
      availableAgents.value = availableAgents.value.filter(a => a.id !== agentId)
    }

    selectedAgentToAdd.value = ''

    toast.add({
      severity: 'success',
      summary: 'Agente asignado',
      detail: `El agente fue asignado correctamente.`,
      life: 3000
    })

  } catch (e) {
    console.error(e)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo asignar el agente.',
      life: 3000
    })
  }
}

async function removeAgentBtn(agent) {
  try {
    await removeAgent(selectedSupervisor.value.id, agent.id)

    assignedAgents.value = assignedAgents.value.filter(a => a.id !== agent.id)
    availableAgents.value.push(agent)

    toast.add({
      severity: 'success',
      summary: 'Agente removido',
      detail: `${agent.name} fue removido del supervisor.`,
      life: 3000
    })

  } catch (e) {
    console.error(e)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo remover el agente.',
      life: 3000
    })
  }
}

/* ====== Ver usuario (placeholder) ====== */
function viewUser (user) {
  toast.add({
    severity: 'info',
    summary: user.name,
    detail: `${roleLabel(user.role)} · ${user.email}`,
    life: 3000
  })
}

/* ====== Eliminar usuario ====== */
function deleteUserConfirm (user) {
  confirm.require({
    message: `¿Estás seguro de eliminar al usuario ${user.name}?`,
    header: 'Confirmar eliminación',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Cancelar',
    acceptLabel: 'Eliminar',
    acceptClass: 'confirm-delete-btn',
    rejectClass: 'confirm-cancel-btn',

    accept: async () => {
      try {
        await deleteUser(user.id)
        users.value = users.value.filter(u => u.id !== user.id)
        kpis.value.totalUsers = users.value.length

        toast.add({
          severity: 'success',
          summary: 'Usuario eliminado',
          detail: user.email,
          life: 3500
        })
      } catch (e) {
        console.error(e)

        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo eliminar el usuario.',
          life: 4000
        })
      }
    }
  })
}

/* ====== Mounted ====== */
onMounted(() => {
  loadUsers()
  loadKpis()
})
</script>

<style scoped>
.admin-users {
  padding: 18px 24px 24px;
}

/* KPIs */
.kpis {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 10px;
}
.kpi {
  background: #fff;
  border: 1px solid #ebeef3;
  border-radius: 14px;
  padding: 12px;
}
.kpi-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #6b7280;
}
.kpi h3 {
  margin: 6px 0 0;
  font-size: 22px;
}
.kpi .danger {
  color: #e11d48;
}

/* Tabs */
.tabs-rail {
  display: flex;
  justify-content: center;
  margin: 8px 0 12px;
}
.tabs {
  background: #eef2f7;
  border: 1px solid #e5e7eb;
  border-radius: 999px;
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 6px;
  width: 100%;
  padding: 4px;
  max-width: 780px;
}
.tab {
  height: 30px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: #6b7280;
  font-size: 12px;
  font-weight: 700;
  display: grid;
  place-items: center;
  cursor: pointer;
}
.tab.active {
  background: #fff;
  border: 1px solid #e5e7eb;
  color: #111827;
}

/* Panel */
.panel {
  background: #fff;
  border: 1px solid #ebeef3;
  border-radius: 14px;
  padding: 16px 18px 20px;
}
.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.panel-head .title h3 {
  margin: 0;
  font-weight: 800;
}
.panel-head .title p {
  margin: 2px 0 0;
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
  grid-template-columns: 1.5fr 2.2fr 0.9fr 0.9fr 1fr 0.9fr;
  gap: 10px;
  align-items: center;
}
.thead {
  background: #f8fafc;
  color: #6b7280;
  font-weight: 700;
  padding: 10px 12px;
}
.trow {
  padding: 12px;
  border-top: 1px solid #f1f3f6;
  background: #fff;
}
.usercell {
  display: flex;
  align-items: center;
  gap: 10px;
}
.avatar {
  width: 30px;
  height: 30px;
  border-radius: 999px;
  background: #e9efff;
  color: #3553a8;
  display: grid;
  place-items: center;
  font-size: 12px;
  font-weight: 800;
}
.muted {
  color: #6b7280;
}
.center {
  text-align: center;
}
.actions {
  display: flex;
  gap: 6px;
  justify-content: center;
}
.iconbtn {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 6px 8px;
  cursor: pointer;
}
.iconbtn.danger {
  color: #e11d48;
  border-color: #f3c0cb;
}

/* Chips */
.chip {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  background: #f6f7f9;
}
.chip-green {
  background: #e9f7ef;
  color: #1b9c55;
  border-color: #ccecd9;
}
.chip-blue {
  background: #e9efff;
  color: #3553a8;
  border-color: #dbe4ff;
}
.chip-gray {
  background: #f1f5f9;
  color: #64748b;
  border-color: #e2e8f0;
}
.chip-orange {
  background: #fff4e6;
  color: #c66900;
  border-color: #ffe0b2;
}

/* Métricas Generales */
.metrics-grid {
  display: grid;
  grid-template-columns: 2.1fr 1.4fr;
  gap: 16px;
}
.metrics-card {
  background: #fff;
  border: 1px solid #ebeef3;
  border-radius: 12px;
  padding: 14px 16px 16px;
}
.metrics-header h3 {
  margin: 0;
  font-weight: 800;
}
.metrics-header p {
  margin: 2px 0 0;
  font-size: 11.5px;
  color: #6b7280;
}
.metrics-body {
  margin-top: 10px;
}
.emotions-body {
  display: grid;
  grid-template-columns: 1.5fr 1.2fr;
  gap: 10px;
  align-items: center;
}

/* Donut “fake” */
.donut-wrap {
  display: flex;
  justify-content: center;
}
.donut-chart {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: conic-gradient(
    #22c55e 0 35%,
    #86efac 35% 60%,
    #9ca3af 60% 80%,
    #f97316 80% 93%,
    #ef4444 93% 100%
  );
  position: relative;
}
.donut-chart::after {
  content: '';
  position: absolute;
  inset: 34px;
  background: #ffffff;
  border-radius: 50%;
}

/* Leyenda emociones */
.emotion-legend {
  list-style: none;
  padding: 0;
  margin: 0;
}
.emotion-row {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  margin-bottom: 6px;
}
.emotion-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.emotion-label {
  color: #374151;
}
.emotion-pct {
  font-weight: 600;
  color: #4b5563;
}

/* Barras semanales */
.week-bars {
  display: flex;
  gap: 10px;
  align-items: flex-end;
  height: 220px;
  margin-top: 6px;
}
.week-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.week-bar {
  width: 32px;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column-reverse;
  background: #e5e7eb;
}
.seg {
  width: 100%;
}
.seg-positive {
  background: #22c55e;
}
.seg-neutral {
  background: #9ca3af;
}
.seg-stress {
  background: #ef4444;
}
.week-label {
  font-size: 11px;
  color: #4b5563;
}
.week-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
  font-size: 11.5px;
  color: #4b5563;
}
.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.swatch {
  width: 10px;
  height: 10px;
  border-radius: 4px;
}
.swatch-positive {
  background: #22c55e;
}
.swatch-neutral {
  background: #9ca3af;
}
.swatch-stress {
  background: #ef4444;
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
.perm-wrap h5 {
  margin: 0 0 4px;
}
.perm-title-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}
.perm-icon {
  font-size: 18px;
}
.perm-sub {
  margin: 0 0 8px;
  font-size: 12px;
  color: #6b7280;
}
.switch {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 0;
  color: #374151;
}
.switch input[type='checkbox'] {
  margin-left: auto;
}
.switch-text {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.switch-main {
  font-size: 13px;
  font-weight: 600;
}
.switch-sub {
  font-size: 11.5px;
  color: #6b7280;
}

.assigned-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
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
}

/* Footer modal */
.modal-foot {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 14px;
}

/* Botones */
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
.pi {
  font-size: 14px;
}

/* utilidades */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.admin-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  padding: 6px 12px;
  background: #ffffff;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  color: #374151;
}

.btn-back i {
  font-size: 12px;
}

.btn-back:hover {
  background: #f3f4f6;
}

.admin-title-block h2 {
  margin: 0;
  font-size: 15px;
  font-weight: 800;
}

.admin-title-block p {
  margin: 2px 0 0;
  font-size: 11.5px;
  color: #6b7280;
}

</style>

<style>
/* PrimeVue ConfirmDialog alineado al diseño de AdminUsers */
.user-confirm-dialog {
  border: 1px solid #ebeef3;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.18);
  font-family: inherit;
  color: #374151;
}

.user-confirm-dialog .p-dialog-header {
  padding: 18px 22px 8px;
  border-bottom: 0;
}

.user-confirm-dialog .p-dialog-title {
  font-size: 15px;
  font-weight: 800;
  color: #111827;
}

.user-confirm-dialog .p-dialog-content {
  padding: 8px 22px 12px;
  color: #6b7280;
  font-size: 13px;
}

.user-confirm-dialog .p-confirmdialog-icon {
  width: auto !important;
  height: auto !important;
  color: #dc2626;
  font-size: 18px;
  margin-right: 10px;
}

.user-confirm-dialog .p-confirmdialog-message {
  margin-left: 0;
  line-height: 1.5;
}

.user-confirm-dialog .p-dialog-footer {
  padding: 10px 22px 18px;
  border-top: 0;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.user-confirm-dialog .p-button {
  border-radius: 10px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 700;
  box-shadow: none;
}

.user-confirm-dialog .confirm-cancel-btn {
  background: #eef2f7;
  border-color: #eef2f7;
  color: #374151;
}

.user-confirm-dialog .confirm-delete-btn {
  background: #dc2626;
  border-color: #dc2626;
  color: #fff;
}

.user-confirm-dialog .confirm-cancel-btn:hover {
  background: #e5e7eb;
  border-color: #e5e7eb;
  color: #374151;
}

.user-confirm-dialog .confirm-delete-btn:hover {
  background: #b91c1c;
  border-color: #b91c1c;
  color: #fff;
}
</style>
