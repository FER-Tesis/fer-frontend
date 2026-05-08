<template>
  <div class="page">
    <!-- Topbar -->
    <header class="topbar">
      <div class="left">
        <Avatar label="SV" shape="circle" class="mr-2" />
        <div>
          <h2 class="title">Dashboard del Supervisor</h2>
          <small class="subtitle">Monitoreo en tiempo real del equipo</small>
        </div>
      </div>

      <div class="actions">
        <!-- BOTÓN ALERTAS EMOCIONALES -->
        <Button class="actionlink" text @click="openAlerts">
          <i class="pi pi-bell mr-1" />
          Alertas
          <Badge :value="alertsCount" class="count red" v-if="alertsCount > 0" />
        </Button>

        <!-- BOTÓN REPORTES DE CÁMARA -->
        <Button class="actionpill warn" text @click="openReports">
          <i class="pi pi-video-off mr-1" />
          Reportes de Cámaras
          <Badge
            :value="pendingReportsCount"
            class="count amber"
            v-if="pendingReportsCount > 0"
          />
        </Button>

        <Button label="Cerrar sesión" @click="handleLogout" />
      </div>
    </header>

    <!-- Barra de pestañas -->
    <div class="tabs-bar">
      <Button
        label="Monitoreo de Agentes"
        class="tab-pill"
        :class="{ active: activeTab === 'agents' }"
        text
        @click="activeTab = 'agents'"
      />
      <Button
        label="Gestión de Cámaras"
        class="tab-pill"
        :class="{ active: activeTab === 'cameras' }"
        text
        @click="activeTab = 'cameras'"
      />
    </div>

    <!-- ===================== MONITOREO DE AGENTES ===================== -->
    <div v-if="activeTab === 'agents'">
      <div class="grid-2">
        <!-- Estado general -->
        <Card class="card">
          <template #title>
            <div>Estado general del equipo</div>
            <div class="subtitle-sm">
              Distribución de emociones detectadas en tiempo real
            </div>
          </template>
          <template #content>
            <Chart type="bar" :data="barData" :options="barOptions" style="height: 280px" />
            <div class="legend legend-bars">
              <span class="lvl l1">Enojo</span>
              <span class="lvl l2">Disgusto</span>
              <span class="lvl l3">Miedo</span>
              <span class="lvl l4">Tristeza</span>
              <span class="lvl l5">Neutral</span>
              <span class="lvl l6">Sorpresa</span>
              <span class="lvl l7">Felicidad</span>
            </div>
          </template>
        </Card>

        <!-- Detalles del agente -->
        <Card class="card">
          <template #title>Detalles del Agente</template>
          <template #subtitle>
            {{
              selectedAgent
                ? `Historial detallado de ${selectedAgent.name}`
                : 'Selecciona un agente'
            }}
          </template>

          <template #content>
            <div v-if="selectedAgent">
              <div class="agent-header">
                <Avatar :label="getInitials(selectedAgent.name)" size="large" class="mr-2" />
                <div>
                  <h4 class="agent-name">{{ selectedAgent.name }}</h4>
                  <div class="agent-email muted small">
                    {{ selectedAgent.email }}
                  </div>
                </div>
              </div>

              <div class="mt-3">
                <Chart
                  type="line"
                  :data="agentChartData"
                  :options="agentChartOptions"
                  style="height: 220px"
                />
              </div>

              <div class="kpis">
                <div class="kpi">
                  <div class="kpi-label">Última actualización</div>
                  <div class="kpi-value">{{ selectedAgent.updatedAt }}</div>
                </div>
              
                <div class="kpi" :class="emotionKpiClass">
                  <div class="kpi-label">Emoción actual</div>
                  <div class="kpi-value">{{ selectedAgent.emotionLabel }}</div>
                </div>
              </div>
            </div>

            <div v-else class="muted small">
              Haz clic en <b>“Ver detalles”</b> en la tabla para mostrar el historial detallado de un
              agente.
            </div>
          </template>
        </Card>
      </div>

      <!-- Tabla de agentes -->
      <Card class="card">
        <template #title>
          <div class="row-between">
            <div>
              Agentes en tiempo real
              <div class="subtitle-sm">
                Monitoreo detallado del equipo con filtros avanzados
              </div>
            </div>

            <!-- DESCARGA AUTOMATIZADA DE REPORTES (deprecado)
            <Button
              icon="pi pi-download"
              label="Exportar"
              outlined
              size="small"
              @click="openExportDialog"
            />
            -->

            <!-- DESCARGA DE REPORTES MANUAL -->
            <div class="row gap">
              <Button
                icon="pi pi-download"
                label="Exportar"
                outlined
                size="small"
                @click="openExportDialog"
              />
               
              <Button
                v-if="readyExportJob"
                icon="pi pi-download"
                label="Descargar reporte"
                severity="success"
                size="small"
                @click="downloadReadyExport"
              />
            </div>
          </div>
        </template>

        <template #content>
          <div class="filters">
            <span class="p-input-icon-left">
              <i class="pi pi-search" />
              <InputText v-model="searchTerm" placeholder="Buscar por nombre..." class="w-16rem" />
            </span>

            <Dropdown
              v-model="filterEmotion"
              :options="emotionOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Todas las emociones"
              class="w-16rem"
            />
          </div>

          <DataTable
            :value="filteredAgents"
            :rows="5"
            paginator
            responsiveLayout="scroll"
            class="p-datatable-sm"
          >
            <Column field="name" header="Agente">
              <template #body="{ data }">
                <div class="row">
                  <Avatar :label="getInitials(data.name)" class="mr-2" />
                  <span>{{ data.name }}</span>
                </div>
              </template>
            </Column>

            <Column header="Estado Emocional">
              <template #body="{ data }">
                <Tag :value="data.emotionLabel" :severity="emotionSeverity(data.emotion)" rounded />
              </template>
            </Column>

            <Column field="updatedAt" header="Última actualización" />

            <Column header="Acciones">
              <template #body="{ data }">
                <Button label="Ver detalles" size="small" outlined @click="viewDetails(data)" />
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>
    </div>

    <!-- ===================== GESTIÓN DE CÁMARAS ===================== -->
    <div v-else>
      <Card class="card">
        <template #title>
          <div>Gestión de Cámaras Activas</div>
          <div class="subtitle-sm">
            Administra la visualización y estado de las cámaras del sistema
          </div>
        </template>

        <template #content>
          <DataTable :value="cameras" responsiveLayout="scroll" class="p-datatable-sm">
            <Column field="name" header="Cámara">
              <template #body="{ data }">
                <span class="row">
                  <i
                    :class="[
                      'pi',
                      data.status === 'active'
                        ? 'pi-video'
                        : data.status === 'maintenance'
                        ? 'pi-wrench'
                        : 'pi-video-off'
                    ]"
                    style="margin-right: 0.5rem"
                  />
                  {{ data.name }}
                </span>
              </template>
            </Column>

            <Column field="agent" header="Agente Asignado" />

            <Column header="Estado">
              <template #body="{ data }">
                <Tag
                  :value="
                    data.status === 'active'
                      ? 'Activa'
                      : data.status === 'inactive'
                      ? 'Inactiva'
                      : data.status === 'maintenance'
                      ? 'Mantenimiento'
                      : '—'
                  "
                  :severity="
                    data.status === 'active'
                      ? 'success'
                      : data.status === 'inactive'
                      ? 'danger'
                      : data.status === 'maintenance'
                      ? 'warning'
                      : 'secondary'
                  "
                  rounded
                />
              </template>
            </Column>

            <Column header="En monitoreo">
              <template #body="{ data }">
                <Tag
                  :value="data.monitoringActive ? 'Sí' : 'No'"
                  :severity="data.monitoringActive ? 'success' : 'secondary'"
                  rounded
                />
              </template>
            </Column>

            <Column field="last" header="Última Conexión" />

            <Column header="Acciones" style="min-width: 12rem">
              <template #body="{ data }">
                <div class="row gap">
                  <Button
                    :label="
                      data.status === 'active'
                        ? 'Desactivar'
                        : data.status === 'inactive'
                        ? 'Activar'
                        : 'No disponible'
                    "
                    :severity="
                      data.status === 'active'
                        ? 'warning'
                        : data.status === 'inactive'
                        ? 'success'
                        : 'secondary'
                    "
                    :disabled="data.status === 'maintenance' || !data.id"
                    size="small"
                    outlined
                    @click="toggleCamera(data)"
                  />
                </div>
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>
    </div>

    <!-- Panel lateral de ALERTAS EMOCIONALES -->
    <Transition name="slide-left">
      <aside v-if="showAlertsPanel" class="alerts-drawer">
        <header class="alerts-header">
          <div>
            <h3>Alertas Emocionales</h3>
            <p class="alerts-sub">
              Agentes detectados en estado tenso / estresado en tiempo real
            </p>
          </div>
          <Button icon="pi pi-times" text rounded @click="closeAlerts" />
        </header>

        <div class="alerts-list">
          <div v-if="alerts.length === 0" class="alerts-empty">
            No hay alertas emocionales activas.
          </div>

          <article
            v-for="al in alerts"
            :key="al.id"
            class="alert-item"
            :class="al.emotionLevel <= 2 ? 'high' : 'medium'"
          >
            <div class="alert-top">
              <span class="alert-pill" :class="al.emotionLevel <= 2 ? 'pill-high' : 'pill-med'">
                {{ al.emotionLabel }}
              </span>
              <span class="alert-time">{{ formatTime(al.createdAt) }}</span>
            </div>

            <div class="alert-title">
              {{ al.agentName }}
            </div>
            <div class="alert-desc">
              {{ al.message || 'Nivel de estrés elevado detectado por la cámara.' }}
            </div>
            <div class="alert-foot">
              <span v-if="al.cameraName">Cámara: <b>{{ al.cameraName }}</b></span>
            </div>
          </article>
        </div>
      </aside>
    </Transition>

    <!-- Panel lateral de reportes de cámara -->
    <Transition name="slide-left">
      <aside v-if="showReportsPanel" class="reports-drawer">
        <header class="reports-header">
          <div>
            <h3>Reportes de Fallas de Cámara</h3>
            <p class="reports-sub">
              Alertas reportadas por los agentes sobre problemas técnicos
            </p>
          </div>
          <Button icon="pi pi-times" text rounded @click="closeReports" />
        </header>

        <div class="reports-list">
          <div v-if="activeCameraAlerts.length === 0" class="reports-empty">
            No hay alertas activas de cámara.
          </div>

          <article
            v-for="rep in activeCameraAlerts"
            :key="rep.id"
            class="report-item pending"
          >
            <div class="report-top">
              <span class="status-pill pending">
                Activa
              </span>
              <span class="report-time">{{ formatTime(rep.createdAt) }}</span>
            </div>

            <div class="report-title">
              {{ rep.cameraName }}
            </div>
            <div class="report-desc">
              {{ rep.description }}
            </div>
            <div class="report-foot">
              Reportado por <b>{{ rep.agentName }}</b>
            </div>
          </article>
        </div>
      </aside>
    </Transition>

    <Dialog
      v-model:visible="showExportDialog"
      modal
      header="Exportar reporte"
      :style="{ width: '40rem', maxWidth: '95vw' }"
    >
      <div class="export-form">
        <div class="field-block">
          <label class="field-label">Tipo de exportación</label>
          <Dropdown
            v-model="exportForm.type"
            :options="exportTypeOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Selecciona una opción"
            class="w-full"
          />
        </div>
      
        <div v-if="exportForm.type === 'current'" class="export-hint">
          Se exportarán los agentes visibles actualmente en la tabla, respetando los filtros aplicados.
        </div>
      
        <template v-if="exportForm.type === 'team' || exportForm.type === 'agent'">
          <div v-if="exportForm.type === 'agent'" class="field-block">
            <label class="field-label">Agente</label>
            <Dropdown
              v-model="exportForm.agentId"
              :options="exportAgentOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Selecciona un agente"
              class="w-full"
            />
          </div>
        
          <div class="field-block">
            <label class="field-label">Rango de fechas</label>
            <Calendar
              v-model="exportForm.dateRange"
              selectionMode="range"
              :manualInput="false"
              dateFormat="dd/mm/yy"
              showIcon
              class="w-full"
            />
          </div>
        
          <div class="field-grid">
            <div class="field-block">
              <label class="field-label">Agrupación</label>
              <Dropdown
                v-model="exportForm.groupBy"
                :options="groupByOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Selecciona agrupación"
                class="w-full"
              />
            </div>
          
            <div class="field-block">
              <label class="field-label">Formato</label>
              <Dropdown
                v-model="exportForm.format"
                :options="formatOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Selecciona formato"
                class="w-full"
              />
            </div>
          </div>
        
          <div class="field-block">
            <label class="field-label">Agregados del reporte</label>
            <MultiSelect
              v-model="exportForm.aggregates"
              :options="aggregateOptions"
              optionLabel="label"
              optionValue="value"
              display="chip"
              placeholder="Selecciona uno o más agregados"
              class="w-full"
            />
          </div>
        </template>
      </div>
    
      <template #footer>
        <div class="row-end gap">
          <Button
            label="Cancelar"
            text
            @click="closeExportDialog"
          />
          <Button
            label="Descargar archivo"
            icon="pi pi-download"
            :disabled="!canExport"
            @click="handleExport"
          />
        </div>
      </template>
    </Dialog>

    <Toast position="bottom-right" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'

import Card from 'primevue/card'
import Button from 'primevue/button'
import Avatar from 'primevue/avatar'
import Badge from 'primevue/badge'
import Tag from 'primevue/tag'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Toast from 'primevue/toast'
import Chart from 'primevue/chart'
import Dialog from 'primevue/dialog'
import Calendar from 'primevue/calendar'
import MultiSelect from 'primevue/multiselect'

import { useAuthStore } from '@/stores/auth'

import { getAgentsSupervisor, connectSupervisorAgentsWS, getAgentDayHistory, getSupervisorCameras, connectSupervisorCamerasWS } from '@/services/monitoring.api'
import { updateCameraStatus } from '@/services/camera.api'
import { getEmotionAlerts } from '@/services/alerts.api'
import {
  getSupervisorActiveCameraAlerts,
  connectSupervisorActiveCameraAlertsWS
} from '@/services/camera_alert.api'
import {
  createSupervisorExportJob,
  getExportJobStatus,
  getExportDownloadUrl
} from '@/services/export.api'

const EMOTIONS = {
  1: 'Enojo',
  2: 'Disgusto',
  3: 'Miedo',
  4: 'Tristeza',
  5: 'Neutral',
  6: 'Sorpresa',
  7: 'Felicidad'
}

const EMOTION_CODES = {
  anger: 1,
  disgust: 2,
  fear: 3,
  sad: 4,
  neutral: 5,
  surprise: 6,
  happy: 7
}

const auth = useAuthStore()
const router = useRouter()
const toast = useToast()

// Logout
const handleLogout = async () => {
  auth.logout()
  await router.replace({ name: 'login' })
}

const activeTab = ref('agents')

/* ====== AGENTES (datos desde API con fallback mock) ====== */

const agents = ref([])

function formatHour(ts) {
  if (!ts) return ''

  const cleaned = ts.replace(/(\.\d{3})\d+$/, '$1')

  const utcTs = cleaned.endsWith('Z') ? cleaned : cleaned + 'Z'

  const d = new Date(utcTs)
  if (Number.isNaN(d.getTime())) return ''

  return d.toLocaleString('es-PE', {
    timeZone: 'America/Lima',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

async function loadAgents () {
  try {
    const supervisorId = auth.user.id
    const data = await getAgentsSupervisor(supervisorId)

    agents.value = data.map(a => {
      let emotionCode = null;
      if (a.emotion) {
        emotionCode = EMOTION_CODES[a.emotion.toLowerCase()] || null;
      }
    
      return {
        id: a.id,
        name: a.name,
        email: a.email,
        emotion: emotionCode,
        emotionLabel: emotionCode ? EMOTIONS[emotionCode] : "Sin datos",
        updatedAt: a.timestamp ? formatHour(a.timestamp) : "—"
      }
    })

  } catch (error) {
    console.error('Error cargando agentes', error)
  }
}

const emotionKpiClass = computed(() => {
  if (!selectedAgent.value) return ''

  const e = selectedAgent.value.emotion
  return {
    1: 'kpi-anger',
    2: 'kpi-disgust',
    3: 'kpi-fear',
    4: 'kpi-sad',
    5: 'kpi-neutral',
    6: 'kpi-surprise',
    7: 'kpi-happy'
  }[e] || ''
})

/* ====== Chart general ====== */
const barData = ref()
const barOptions = ref()

function updateBarData () {
  const emotionOrder = [1, 2, 3, 4, 5, 6, 7]

  const counts = emotionOrder.map(code =>
    agents.value.filter(a => a.emotion === code).length
  )

  barData.value = {
    labels: emotionOrder.map(code => EMOTIONS[code]),
    datasets: [
      {
        data: counts,
        backgroundColor: [
          '#fecaca', // Enojo (1)
          '#fed7aa', // Disgusto (2)
          '#fef3c7', // Miedo (3)
          '#bfdbfe', // Tristeza (4)
          '#e5e7eb', // Neutral (5)
          '#ddd6fe', // Sorpresa (6)
          '#bbf7d0'  // Felicidad (7)
        ],
        borderRadius: 8
      }
    ]
  }

  barOptions.value = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, ticks: { stepSize: 1 } }
    }
  }
}

/* ====== Filtros ====== */
const searchTerm = ref('')
const filterEmotion = ref(null)

const emotionOptions = [
  { label: 'Todas las emociones', value: null },
  { label: 'Enojo', value: 1 },
  { label: 'Disgusto', value: 2 },
  { label: 'Miedo', value: 3 },
  { label: 'Tristeza', value: 4 },
  { label: 'Neutral', value: 5 },
  { label: 'Sorpresa', value: 6 },
  { label: 'Felicidad', value: 7 }
]

const filteredAgents = computed(() =>
  agents.value.filter(a => {
    const byName = a.name.toLowerCase().includes((searchTerm.value || '').toLowerCase())
    const byEmotion = filterEmotion.value ? a.emotion === filterEmotion.value : true
    return byName && byEmotion
  })
)

/* ====== Utilidades ====== */
function emotionSeverity (v) {
  const map = {
    1: 'danger',     // Enojo
    2: 'help',       // Disgusto (puedes usar 'warning' si prefieres)
    3: 'warning',    // Miedo
    4: 'secondary',  // Tristeza
    5: 'info',       // Neutral
    6: 'primary',    // Sorpresa
    7: 'success'     // Felicidad
  }
  return map[v] || 'secondary'
}

function getInitials (name) {
  const p = name.split(' ')
  return (p[0][0] + (p[1]?.[0] || '')).toUpperCase()
}

/* ====== Detalles del agente ====== */
const selectedAgent = ref(null)

let agentDailyInterval = null

watch(selectedAgent, (agent) => {
  if (!agent) return

  if (agentDailyInterval) {
    clearInterval(agentDailyInterval)
    agentDailyInterval = null
  }

  agentDailyInterval = setInterval(async () => {
    await buildAgentSeries(agent)
  }, 300000)
})

const agentChartData = ref()
const agentChartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: { x: { grid: { display: false } }, y: { min: 1, max: 7, ticks: { stepSize: 1 } } }
})

async function buildAgentSeries(agent) {
  if (!agent?.id) return

  agentChartData.value = null   // ← limpieza

  try {
    const { labels, values } = await getAgentDayHistory(agent.id)

    const numericValues = values.map(v => {
      if (!v) return null
      return EMOTION_CODES[v.toLowerCase()] || null
    })

    agentChartData.value = {
      labels,
      datasets: [
        {
          label: 'Nivel emocional',
          data: numericValues,
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34,197,94,0.15)',
          borderWidth: 2,
          tension: 0.35,
          fill: true,
          spanGaps: true,
          pointRadius: (ctx) => ctx.raw == null ? 0 : 5,
          pointHoverRadius: (ctx) => ctx.raw == null ? 0 : 8,
          pointBackgroundColor: '#22c55e'
        }
      ]
    }
  } catch (err) {
    console.error('Error construyendo gráfico de agente:', err)
  }
}

function viewDetails (agent) {
  selectedAgent.value = agent
  buildAgentSeries(agent)
  toast.add({
    severity: 'info',
    summary: `Detalles: ${agent.name}`,
    detail: `Estado: ${agent.emotionLabel}`,
    life: 3000
  })
}

/* ====== Gestión de cámaras (API + fallback) ====== */
const cameras = ref([])

async function loadCameras () {
  try {
    const supervisorId = auth.user.id
    const data = await getSupervisorCameras(supervisorId)

    cameras.value = Array.isArray(data)
      ? data.map(c => ({
          id: c.camera_id,
          name: c.camera_name,
          agent: c.agent_name,
          status: c.status,
          last: c.last_connection ? formatHour(c.last_connection) : '—',
          monitoringActive: !!c.monitoring_active
        }))
      : []
  } catch (error) {
    console.error('Error cargando cámaras', error)
    cameras.value = []
  }
}

async function toggleCamera (cam) {
  if (!cam.id || cam.status === 'maintenance') return

  const newStatus = cam.status === 'active' ? 'inactive' : 'active'

  try {
    await updateCameraStatus(cam.id, { status: newStatus })

    cam.status = newStatus

    toast.add({
      severity: cam.status === 'active' ? 'success' : 'warn',
      summary: cam.name,
      detail: cam.status === 'active' ? 'Cámara activada' : 'Cámara desactivada',
      life: 2500
    })

  } catch (error) {
    console.error('Error actualizando estado de cámara', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo actualizar la cámara.',
      life: 2500
    })
  }
}

function viewStream (cam) {
  // Aquí luego pueden abrir un modal o redirigir a vista de streaming
  toast.add({
    severity: 'info',
    summary: cam.name,
    detail: `Abriendo vista de ${cam.location}`,
    life: 2200
  })
}

/* ====== ALERTAS EMOCIONALES ====== */
const alerts = ref([]) // lista de alertas emocionales
const alertsCount = computed(() => alerts.value.filter(a => !a.read).length)

const showAlertsPanel = ref(false)

/**
 * Backend envía / devuelve algo tipo:
 * {
 *   id,
 *   agentName,
 *   emotionLabel,
 *   emotionLevel: 1..5 (o emotion),
 *   cameraName,
 *   message,
 *   createdAt,
 *   read
 * }
 */
function normalizeAlert (msg) {
  const level = msg.emotionLevel ?? msg.emotion ?? 3
  const created =
    msg.createdAt instanceof Date ? msg.createdAt : new Date(msg.createdAt || Date.now())

  return {
    id: msg.id,
    agentName: msg.agentName,
    emotionLabel: msg.emotionLabel,
    emotionLevel: level, // 1 = Estresado, 2 = Tenso, ...
    cameraName: msg.cameraName,
    message: msg.message,
    createdAt: created,
    read: !!msg.read
  }
}

async function loadAlerts () {
  try {
    // BACKEND:
    // GET /alerts/emotions → lista de alertas
    const data = await getEmotionAlerts()
    alerts.value = Array.isArray(data) ? data.map(normalizeAlert) : []
  } catch (error) {
    console.error('Error cargando alertas', error)
    alerts.value = []
  }
}

function openAlerts () {
  showAlertsPanel.value = true
  // marcar como leídas al abrir el panel
  alerts.value = alerts.value.map(a => ({ ...a, read: true }))
}
function closeAlerts () {
  showAlertsPanel.value = false
}

/* ====== Reportes de cámara ====== */
const showReportsPanel = ref(false)
const activeCameraAlerts = ref([])
const pendingReportsCount = computed(() => activeCameraAlerts.value.length)

function normalizeCameraAlert(msg) {
  const created =
    msg.created_at instanceof Date
      ? msg.created_at
      : new Date(msg.created_at || Date.now())

  const camera = cameras.value.find(c => String(c.id) === String(msg.camera_id))
  const agent = agents.value.find(a => String(a.id) === String(msg.agent_id))

  return {
    id: msg._id,
    cameraId: msg.camera_id,
    agentId: msg.agent_id,
    cameraName: camera?.name || msg.camera_id,
    agentName: agent?.name || msg.agent_id,
    status: msg.status || 'active',
    description: msg.description,
    createdAt: created
  }
}

async function loadActiveCameraAlerts() {
  try {
    const supervisorId = auth.user.id
    const data = await getSupervisorActiveCameraAlerts(supervisorId)

    activeCameraAlerts.value = Array.isArray(data)
      ? data.map(normalizeCameraAlert)
      : []
  } catch (error) {
    console.error('Error cargando alertas activas de cámara', error)
    activeCameraAlerts.value = []
  }
}

let supervisorWS = null

function connectSupervisorWS() {
  const supervisorId = auth.user.id
  supervisorWS = connectSupervisorAgentsWS(supervisorId)

  supervisorWS.onmessage = event => {
    const msg = JSON.parse(event.data)

    if (msg.type === "supervisor-agents-snapshot") {
      agents.value = msg.agents.map(a => {
        const emotionCode = a.emotion
          ? EMOTION_CODES[a.emotion.toLowerCase()]
          : null

        return {
          id: a.id,
          name: a.name,
          email: a.email,
          emotion: emotionCode,
          emotionLabel: emotionCode ? EMOTIONS[emotionCode] : "Sin datos",
          updatedAt: a.timestamp ? formatHour(a.timestamp) : "—"
        }
      })

      updateBarData()
    }
  }

  supervisorWS.onclose = () => {
    console.log("Supervisor WS cerrado")
  }

  supervisorWS.onerror = error => {
    console.error("Error en Supervisor WS:", error)
  }
}

let supervisorCameraAlertsWS = null

function connectSupervisorCameraAlertsWS() {
  const supervisorId = auth.user.id
  supervisorCameraAlertsWS = connectSupervisorActiveCameraAlertsWS(supervisorId)

  supervisorCameraAlertsWS.onmessage = event => {
    const msg = JSON.parse(event.data)

    if (msg.type === 'supervisor-camera-active-alerts-snapshot') {
      activeCameraAlerts.value = Array.isArray(msg.alerts)
        ? msg.alerts.map(normalizeCameraAlert)
        : []
    }
  }

  supervisorCameraAlertsWS.onclose = () => {
    console.log('Supervisor Camera Alerts WS cerrado')
  }

  supervisorCameraAlertsWS.onerror = error => {
    console.error('Error en Supervisor Camera Alerts WS:', error)
  }
}

function openReports () {
  showReportsPanel.value = true
}

function closeReports () {
  showReportsPanel.value = false
}

let supervisorCamerasWS = null

function connectSupervisorCamerasSocket() {
  const supervisorId = auth.user.id
  supervisorCamerasWS = connectSupervisorCamerasWS(supervisorId)

  supervisorCamerasWS.onmessage = event => {
    const msg = JSON.parse(event.data)

    if (msg.type === 'supervisor-cameras-snapshot') {
      cameras.value = Array.isArray(msg.cameras)
        ? msg.cameras.map(c => ({
            id: c.camera_id,
            name: c.camera_name,
            agent: c.agent_name,
            status: c.status,
            last: c.last_connection ? formatHour(c.last_connection) : '—',
            monitoringActive: !!c.monitoring_active
          }))
        : []
    }
  }

  supervisorCamerasWS.onclose = () => {
    console.log('Supervisor Cameras WS cerrado')
  }

  supervisorCamerasWS.onerror = error => {
    console.error('Error en Supervisor Cameras WS:', error)
  }
}

function formatTime (date) {
  if (!(date instanceof Date)) {
    const d = new Date(date)
    if (Number.isNaN(d.getTime())) return ''
    date = d
  }
  return date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
}

/* ====== Exportación ====== */
let exportStatusTimer = null

const showExportDialog = ref(false)
const readyExportJob = ref(null)

const exportForm = ref({
  type: null,          // current | team | agent
  agentId: null,
  dateRange: null,     // [startDate, endDate]
  groupBy: 'day',      // day | week | month
  format: 'csv',       // csv | xlsx
  aggregates: []
})

const exportTypeOptions = [
  { label: 'Tabla actual', value: 'current' },
  { label: 'Reporte del equipo', value: 'team' },
  { label: 'Reporte por agente', value: 'agent' }
]

const groupByOptions = [
  { label: 'Por día', value: 'day' },
  { label: 'Por semana', value: 'week' },
  { label: 'Por mes', value: 'month' }
]

const formatOptions = [
  { label: 'CSV', value: 'csv' },
  { label: 'Excel', value: 'xlsx' }
]

const aggregateOptions = [
  { label: 'Conteo por emoción', value: 'emotion_count' },
  { label: 'Porcentaje por emoción', value: 'emotion_percentage' },
  { label: 'Emoción predominante', value: 'dominant_emotion' },
]

const exportAgentOptions = computed(() =>
  filteredAgents.value.map(a => ({
    label: a.name,
    value: a.id
  }))
)

const canExport = computed(() => {
  if (exportForm.value.type === 'current') return true

  if (exportForm.value.type === 'team') {
    return (
      Array.isArray(exportForm.value.dateRange) &&
      exportForm.value.dateRange.length === 2 &&
      exportForm.value.dateRange[0] &&
      exportForm.value.dateRange[1] &&
      exportForm.value.groupBy &&
      exportForm.value.aggregates.length > 0
    )
  }

  if (exportForm.value.type === 'agent') {
    return (
      !!exportForm.value.agentId &&
      Array.isArray(exportForm.value.dateRange) &&
      exportForm.value.dateRange.length === 2 &&
      exportForm.value.dateRange[0] &&
      exportForm.value.dateRange[1] &&
      exportForm.value.groupBy &&
      exportForm.value.aggregates.length > 0
    )
  }

  return false
})

function openExportDialog () {
  resetExportForm()
  showExportDialog.value = true
}

function closeExportDialog () {
  showExportDialog.value = false
}

function resetExportForm () {
  exportForm.value = {
    type: null,
    agentId: null,
    dateRange: null,
    groupBy: 'day',
    format: 'csv',
    aggregates: []
  }
}

function formatDateForFile(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function buildExportPayload () {
  if (exportForm.value.type === 'current') {
    return {
      type: 'current',
      format: exportForm.value.format,
      snapshot: filteredAgents.value.map(agent => ({
        name: agent.name,
        emotion_label: agent.emotionLabel,
        updated_at: agent.updatedAt
      }))
    }
  }

  const [startDate, endDate] = exportForm.value.dateRange || []

  const basePayload = {
    type: exportForm.value.type,
    format: exportForm.value.format,
    start_date: formatDateForFile(startDate),
    end_date: formatDateForFile(endDate),
    group_by: exportForm.value.groupBy,
    aggregates: exportForm.value.aggregates
  }

  if (exportForm.value.type === 'agent') {
    return {
      ...basePayload,
      agent_id: exportForm.value.agentId
    }
  }

  return basePayload
}

function clearExportPolling () {
  if (exportStatusTimer) {
    clearTimeout(exportStatusTimer)
    exportStatusTimer = null
  }
}

function scheduleExportStatusCheck (jobId, attempt = 1) {
  clearExportPolling()

  let delay = 3000

  if (attempt === 1) delay = 700
  else if (attempt === 2) delay = 1500
  else if (attempt === 3) delay = 2500

  exportStatusTimer = setTimeout(async () => {
    try {
      const job = await getExportJobStatus(jobId)

      /* DESCARGA AUTOMATICA AL COMPLETAR EL JOB 
      if (job.status === 'completed') {
        clearExportPolling()

        toast.add({
          severity: 'success',
          summary: 'Reporte listo',
          detail: `Archivo disponible: ${job.file_name || 'reporte'}`,
          life: 5000
        })
      
        window.open(getExportDownloadUrl(jobId), '_blank')
        return
      }
      */

      /* DESCARGA MANUAL AL COMPLETAR EL JOB */
      if (job.status === 'completed') {
        clearExportPolling()
      
        readyExportJob.value = {
          jobId,
          fileName: job.file_name || 'reporte'
        }
      
        toast.add({
          severity: 'success',
          summary: 'Reporte listo',
          detail: `Archivo disponible: ${job.file_name || 'reporte'}. Haz clic en Descargar.`,
          life: 5000
        })
      
        return
      }

      if (job.status === 'failed') {
        clearExportPolling()

        toast.add({
          severity: 'error',
          summary: 'Error de exportación',
          detail: job.error || 'No se pudo generar el archivo.',
          life: 5000
        })
        return
      }

      scheduleExportStatusCheck(jobId, attempt + 1)
    } catch (error) {
      clearExportPolling()
      console.error('Error consultando estado del job', error)

      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo consultar el estado de la exportación.',
        life: 4000
      })
    }
  }, delay)
}

async function handleExport () {
  try {
    const supervisorId = auth.user.id
    const payload = buildExportPayload()

    const result = await createSupervisorExportJob(supervisorId, payload)

    closeExportDialog()

    toast.add({
      severity: 'info',
      summary: 'Generando reporte',
      detail: 'Puedes seguir usando la plataforma mientras se prepara el archivo.',
      life: 4000
    })

    scheduleExportStatusCheck(result.job_id)
  } catch (error) {
    console.error('Error creando exportación', error)

    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo iniciar la exportación.',
      life: 4000
    })
  }
}

function downloadReadyExport () {
  if (!readyExportJob.value) return

  window.open(getExportDownloadUrl(readyExportJob.value.jobId), '_blank')
  readyExportJob.value = null
}

/* ====== Ciclo de vida ====== */
onMounted(async () => {
  await loadAgents()
  updateBarData()
  connectSupervisorWS()

  await loadCameras()
  connectSupervisorCamerasSocket()

  await loadAlerts()

  await loadActiveCameraAlerts()
  connectSupervisorCameraAlertsWS()
})

onBeforeUnmount(() => {
  clearExportPolling()
  
  if (agentDailyInterval) clearInterval(agentDailyInterval)

  if (supervisorWS) {
    supervisorWS.close()
    supervisorWS = null
  }

  if (supervisorCamerasWS) {
    supervisorCamerasWS.close()
    supervisorCamerasWS = null
  }

  if (supervisorCameraAlertsWS) {
    supervisorCameraAlertsWS.close()
    supervisorCameraAlertsWS = null
  }
})
</script>

<style scoped>
.page {
  padding: 1rem;
  background: #f5f6f7;
  min-height: 100vh;
}
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  padding: 0.8rem 1rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}
.left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.title {
  margin: 0;
  font-size: 1rem;
}
.subtitle {
  color: #6b7280;
}
.actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tabs-bar {
  width: 100%;
  display: flex;
  gap: 6px;
  background: #ffffff;
  border: 1px solid #eef1f4;
  border-radius: 9999px;
  padding: 6px;
  margin: 14px 0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}
.tab-pill {
  flex: 1;
  justify-content: center;
  border: none;
  font-weight: 600;
  color: #059669;
}
.tab-pill.active {
  background: #eef2ff;
  color: #2563eb;
}

.grid-2 {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1rem;
}
.subtitle-sm {
  color: #6b7280;
  font-size: 0.9rem;
  margin-top: 0.2rem;
}
.row {
  display: flex;
  align-items: center;
}
.row-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.legend {
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
  margin-top: 0.5rem;
  color: #6b7280;
}

/* COLORES DE TEXTO PARA EMOCIONES */

.legend-bars .l1 {
  color: #ef4444;
}

.legend-bars .l2 {
  color: #f59e0b;
}

.legend-bars .l3 {
  color: #9ca3af;
}

.legend-bars .l4 {
  color: #3b82f6;
}

.legend-bars .l5 {
  color: #6b7280;
}

.legend-bars .l6 {
  color: #8b5cf6;
}

.legend-bars .l7 {
  color: #10b981;
}

.filters {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}
.w-16rem {
  width: 16rem;
}
.w-12rem {
  width: 12rem;
}

.agent-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.agent-name {
  margin: 0;
}
.kpis {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  margin-top: 0.75rem;
}
.kpi {
  background: #f9fafb;
  border-radius: 10px;
  padding: 0.75rem;
}
.kpi-label {
  color: #6b7280;
  font-size: 0.85rem;
}
.kpi-value {
  font-weight: 700;
  margin-top: 0.1rem;
}

/* Pasteles para KPI de emoción */
.kpi-anger {
  background: #ffe5e5;
  border: 1px solid #ffb3b3;
}

.kpi-disgust {
  background: #fff1e6;
  border: 1px solid #ffd1a8;
}

.kpi-fear {
  background: #fffbe6;
  border: 1px solid #f7e9a4;
}

.kpi-sad {
  background: #e7f0ff;
  border: 1px solid #c8ddff;
}

.kpi-neutral {
  background: #f3f4f6;
  border: 1px solid #e4e5e7;
}

.kpi-surprise {
  background: #f6e8ff;
  border: 1px solid #e5caff;
}

.kpi-happy {
  background: #e6ffed;
  border: 1px solid #c0f5cf;
}

:deep(.p-avatar) {
  background: #e0f2fe;
  color: #0b4aa8;
  font-weight: 700;
}

.count {
  margin-left: 8px;
  min-width: 18px;
  height: 18px;
  line-height: 18px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #e5e7eb;
  color: #111827;
}
.count.red {
  background: #fee2e2;
  color: #b91c1c;
}
.count.amber {
  background: #fef3c7;
  color: #b45309;
}

.actionlink {
  color: #16a34a;
}
.actionpill {
  background: #fff7ed;
  border-radius: 12px;
  padding: 6px 10px;
  border: 1px solid #fed7aa;
  color: #0f172a;
}

.row.gap {
  gap: 0.5rem;
}

@media (max-width: 1100px) {
  .grid-2 {
    grid-template-columns: 1fr;
  }
}

/* ===== Drawer ALERTAS ===== */
.alerts-drawer {
  position: fixed;
  inset: 0 0 0 auto;
  width: 360px;
  max-width: 90vw;
  background: #ffffff;
  border-left: 1px solid #e5e7eb;
  box-shadow: -4px 0 12px rgba(15, 23, 42, 0.15);
  padding: 16px 16px 20px;
  z-index: 60;
}
.alerts-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
}
.alerts-header h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
}
.alerts-sub {
  margin: 2px 0 0;
  font-size: 12px;
  color: #6b7280;
}
.alerts-list {
  max-height: calc(100vh - 80px);
  overflow-y: auto;
}
.alerts-empty {
  font-size: 13px;
  color: #6b7280;
}
.alert-item {
  border-radius: 12px;
  padding: 10px 11px;
  border: 1px solid #e5e7eb;
  margin-bottom: 8px;
  font-size: 13px;
}
.alert-item.high {
  border-color: #fecaca;
  background: #fef2f2;
}
.alert-item.medium {
  border-color: #fed7aa;
  background: #fff7ed;
}
.alert-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}
.alert-pill {
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
}
.pill-high {
  background: #fee2e2;
  color: #b91c1c;
}
.pill-med {
  background: #fef3c7;
  color: #b45309;
}
.alert-time {
  font-size: 11px;
  color: #6b7280;
}
.alert-title {
  font-weight: 600;
}
.alert-desc {
  margin-top: 2px;
  color: #4b5563;
}
.alert-foot {
  margin-top: 6px;
  font-size: 11.5px;
  color: #6b7280;
}

/* ===== Drawer reportes ===== */
.reports-drawer {
  position: fixed;
  inset: 0 0 0 auto;
  width: 360px;
  max-width: 90vw;
  background: #ffffff;
  border-left: 1px solid #e5e7eb;
  box-shadow: -4px 0 12px rgba(15, 23, 42, 0.15);
  padding: 16px 16px 20px;
  z-index: 55;
}
.reports-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
}
.reports-header h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
}
.reports-sub {
  margin: 2px 0 0;
  font-size: 12px;
  color: #6b7280;
}
.reports-list {
  max-height: calc(100vh - 80px);
  overflow-y: auto;
}
.reports-empty {
  font-size: 13px;
  color: #6b7280;
}
.report-item {
  border-radius: 12px;
  padding: 10px 11px;
  border: 1px solid #e5e7eb;
  margin-bottom: 8px;
  font-size: 13px;
}
.report-item.pending {
  border-color: #fed7aa;
  background: #fff7ed;
}
.report-item.resolved {
  border-color: #bbf7d0;
  background: #ecfdf5;
}
.report-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}
.status-pill {
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
}
.status-pill.pending {
  background: #fef3c7;
  color: #b45309;
}
.status-pill.resolved {
  background: #dcfce7;
  color: #166534;
}
.report-time {
  font-size: 11px;
  color: #6b7280;
}
.report-title {
  font-weight: 600;
}
.report-desc {
  margin-top: 2px;
  color: #4b5563;
}
.report-foot {
  margin-top: 6px;
  font-size: 11.5px;
  color: #6b7280;
}

/* transición drawer compartida */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.25s ease, opacity 0.25s ease;
}
.slide-left-enter-from,
.slide-left-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.export-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field-block {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.field-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
}

.field-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.export-hint {
  padding: 0.85rem 1rem;
  border-radius: 10px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  color: #4b5563;
  font-size: 0.9rem;
}

.row-end {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.w-full {
  width: 100%;
}

@media (max-width: 768px) {
  .field-grid {
    grid-template-columns: 1fr;
  }
}
</style>
