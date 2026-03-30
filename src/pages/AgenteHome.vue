<!-- src/pages/AgenteHome.vue -->
<template>
  <div class="page">
    <!-- Topbar -->
    <header class="topbar">
      <div class="left">
        <Avatar label="AG" shape="circle" class="mr-2" />
        <div>
          <h2 class="title">Panel del Agente</h2>
          <small class="subtitle">¡Hola! Monitorea tu bienestar emocional</small>
        </div>
      </div>

      <div class="actions">
        <Button
          :label="cameraStatusLabel"
          icon="pi pi-video"
          :severity="cameraStatusSeverity"
          disabled
        />
        <Button
          :label="monitoringLabel"
          :icon="monitoringIcon"
          :class="isMonitoring ? 'btn-orange' : 'btn-green'"
          :loading="monitoringLoading"
          :disabled="isToggleDisabled"
          @click="toggleMonitoring"
        />
        <Button
          label="Reportar Falla de Cámara"
          icon="pi pi-exclamation-triangle"
          severity="danger"
          @click="reportCameraFailure"
        />
        <ConfirmDialog />
        <Toast position="bottom-right" />
        <Button label="Cerrar sesión" @click="handleLogout" />
      </div>
    </header>

    <!-- Content -->
    <div class="grid">
      <!-- Emoción actual -->
      <Card class="card">
        <template #title>Tu estado emocional actual</template>
        <template #content>
          <div class="current-state">
            <span class="emoji">{{ emotionEmoji }}</span>
            <div class="state-chip">{{ emotionLabel }}</div>
          </div>
        </template>
      </Card>

      <!-- Historial -->
      <Card class="card chart-card">
        <template #title>
          <div class="card-header-row">
            <div>
              Historial emocional
              <div class="subtitle-sm">Gráfico basado en registros reales</div>
            </div>

            <div class="range-controls">
              <Dropdown
                v-model="selectedRange"
                :options="ranges"
                optionLabel="label"
                optionValue="value"
                class="w-14rem"
                @change="buildChart"
              />
            </div>
          </div>
        </template>

        <template #content>
          <Chart
            ref="chartRef"
            type="line"
            :data="chartData"
            :options="chartOptions"
            style="height:260px"
          />

          <div class="legend">
            <span class="lvl l1">1 - Enojo</span>
            <span class="lvl l2">2 - Disgusto</span>
            <span class="lvl l3">3 - Miedo</span>
            <span class="lvl l4">4 - Tristeza</span>
            <span class="lvl l5">5 - Neutral</span>
            <span class="lvl l6">6 - Sorpresa</span>
            <span class="lvl l7">7 - Felicidad</span>
          </div>
        </template>
      </Card>
    </div>

    <!-- Consejos -->
    <Card class="tips">
      <template #title>💡 Consejos de bienestar</template>
      <template #content>
        <div class="tips-grid">
          <div class="tip tip-green">
            <h4>Respiración</h4>
            <p>Toma 3 respiraciones profundas entre llamadas</p>
          </div>
          <div class="tip tip-blue">
            <h4>Postura</h4>
            <p>Mantén una postura erguida y relajada</p>
          </div>
          <div class="tip tip-orange">
            <h4>Descanso</h4>
            <p>Toma descansos cortos cada hora</p>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'

import Toast from 'primevue/toast'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Avatar from 'primevue/avatar'
import Chart from 'primevue/chart'
import Dropdown from 'primevue/dropdown'
import ConfirmDialog from 'primevue/confirmdialog'

import { useAuthStore } from '@/stores/auth'
import { logout as logoutApi } from '@/services/auth.api'
import { createCameraReport } from '@/services/reports.api'
import {
  getAgentCurrent,
  getAgentDayHistory,
  getAgentWeekHistory,
  connectAgentCurrentWS
} from '@/services/monitoring.api'
import { 
  getCaptureStatus, 
  startCapture, 
  stopCapture 
} from '@/services/capture.api'
import { updateCameraStatus } from '@/services/camera.api'

const auth = useAuthStore()
const router = useRouter()
const toast = useToast()
const confirm = useConfirm()

/* ------------------ LOGOUT ------------------ */
const handleLogout = async () => {
  try {
    const token = auth.token
    if (!token) return

    await logoutApi(token)

    auth.logout()
    await router.replace({ name: "login" })
  } catch (error) {
    console.error("Logout backend failed", error)
    alert("No se pudo cerrar sesión correctamente. Inténtalo de nuevo.")
  }
}

/* ------------------ RANGO ------------------ */
const ranges = [
  { label: 'Día actual', value: 'day' },
  { label: 'Semana actual', value: 'week' }
]
const selectedRange = ref('day')

/* ------------------ MONITOREO ------------------ */
const isMonitoring = ref(false)
const monitoringLoading = ref(false)
const statusLoading = ref(false)

const monitoringLabel = computed(() =>
  isMonitoring.value ? 'Pausar Monitoreo' : 'Activar Monitoreo'
)

const monitoringIcon = computed(() =>
  isMonitoring.value ? 'pi pi-pause' : 'pi pi-play'
)

const cameraStatusLabel = computed(() =>
  isMonitoring.value ? 'Cámara Activa' : 'Cámara Desactivada'
)

const cameraStatusSeverity = computed(() =>
  isMonitoring.value ? 'success' : 'secondary'
)

const isToggleDisabled = computed(() =>
  !auth.cameraId || monitoringLoading.value || statusLoading.value
)

async function loadCameraStatus() {
  console.log("Llamando status con:", auth.cameraId)
  if (!auth.cameraId) {
    isMonitoring.value = false
    return
  }

  statusLoading.value = true

  try {
    const res = await getCaptureStatus(auth.cameraId)
    isMonitoring.value = res.active
  } catch (e) {
    console.error("Error loading camera status:", e)
    isMonitoring.value = false
  } finally {
    statusLoading.value = false
  }
}

async function toggleMonitoring() {
  if (!auth.cameraId || monitoringLoading.value) return

  monitoringLoading.value = true

  try {
    if (isMonitoring.value) {
      await stopCapture(auth.cameraId)
      isMonitoring.value = false
    } else {
      await startCapture(auth.cameraId)
      isMonitoring.value = true
    }
  } catch (e) {
  console.error("Error toggling monitoring:", e)

  const status = e?.response?.status
  const detail = e?.response?.data?.detail

  let message = 'Intenta nuevamente. Si el problema continúa, reporta una falla de cámara.'

  if (status === 409 && detail === 'Camera is inactive') {
    message = 'La cámara está inactiva y no puede iniciar monitoreo.'
  } 
  else if (status === 409 && detail === 'Camera is in maintenance') {
    message = 'La cámara está en mantenimiento y no puede iniciar monitoreo.'
  } 
  else if (status === 502) {
    message = 'No se pudo iniciar el monitoreo en el hub.'
  } 
  else if (status === 503) {
    message = 'El hub de cámaras no está disponible.'
  }

  toast.add({
    severity: 'warn',
    summary: 'No se pudo cambiar el monitoreo',
    detail: message,
    life: 4000
  })
} finally {
    monitoringLoading.value = false
  }
}

/* ------------------ EMOCIÓN ACTUAL ------------------ */
const currentEmotion = ref(null)
let wsCurrentEmotion = null

const emotionEmoji = computed(() => {
  const map = {
    happy: '😊',
    neutral: '😐',
    angry: '😠',
    sad: '😢',
    fear: '😨',
    disgust: '🤢',
    surprise: '😲'
  }
  return map[currentEmotion.value] || '😐'
})

const emotionLabel = computed(() => {
  const map = {
    happy: 'Felicidad',
    neutral: 'Neutral',
    angry: 'Enojo',
    sad: 'Tristeza',
    fear: 'Miedo',
    disgust: 'Disgusto',
    surprise: 'Sorpresa'
  }
  return map[currentEmotion.value] || '--'
})

async function loadCurrent() {
  const id = auth.user?.id
  if (!id) return
  try {
    const data = await getAgentCurrent(id)
    currentEmotion.value = data.emotion
  } catch (err) {
    console.error('Error cargando emoción actual:', err)
  }
}

function connectCurrentEmotionStream() {
  if (!auth.user?.id) return

  wsCurrentEmotion = connectAgentCurrentWS(auth.user.id)

  wsCurrentEmotion.onmessage = (event) => {
    try {
      const payload = JSON.parse(event.data)
      if (payload.emotion) {
        currentEmotion.value = payload.emotion
      }
    } catch (err) {
      console.error("WS parse error:", err)
    }
  }

  wsCurrentEmotion.onclose = () => {
    console.warn("WS cerrado. Reintentando en 2s…")
    setTimeout(connectCurrentEmotionStream, 2000)
  }
}

/* ------------------ REPORTAR FALLA ------------------ */
async function reportCameraFailure() {
  if (!auth.cameraId) {
    toast.add({
      severity: 'warn',
      summary: 'Sin cámara asignada',
      detail: 'No se encontró una cámara asociada a este agente.',
      life: 4000
    })
    return
  }

  confirm.require({
    message: '¿Deseas reportar una falla de la cámara? La cámara pasará a mantenimiento y se detendrá el monitoreo.',
    header: 'Confirmar reporte',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Sí',
    rejectLabel: 'No',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await updateCameraStatus(auth.cameraId, { status: 'maintenance' })

        try {
          await stopCapture(auth.cameraId)
        } catch (e) {
          console.warn('No se pudo detener la captura o no había sesión activa:', e)
        }

        isMonitoring.value = false

        toast.add({
          severity: 'success',
          summary: 'Falla reportada',
          detail: 'La cámara fue puesta en mantenimiento.',
          life: 4500
        })
      } catch (e) {
        console.error('Error reporting camera failure:', e)

        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo reportar la falla de la cámara.',
          life: 4500
        })
      }
    },
    reject: () => {}
  })
}

/* ------------------ CHART ------------------ */
const chartData = ref(null)
const chartOptions = ref(null)
const chartRef = ref(null)

const lastWeekData = ref(null)

const dailyChartInterval = ref(null)

function emotionToLevel(emotion) {
  return {
    anger: 1,
    disgust: 2,
    fear: 3,
    sad: 4,
    neutral: 5,
    surprise: 6,
    happy: 7
  }[emotion]
}

function getVisibleHourIndex() {
  const now = new Date()
  const hour = now.getHours()

  console.log("Current hour:", hour)

  if (hour < 8) return -1

  let idx = hour - 8

  if (idx > 10) idx = 10

  return idx
}

function getChartOptions(isDay) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        min: 1,
        max: 7.5,
        ticks: {
          stepSize: 1,
          callback: (value) => {
            if (value >= 1 && value <= 7) return value;
            return "";
          }
        }
      },
      x: isDay
        ? {
            type: 'category',
            title: { display: true, text: 'Hora del día' }
          }
        : {
            type: 'category',
            labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
            title: { display: true, text: weekRangeLabel.value }
          }
    },

    plugins: {
      legend: { display: false },

      tooltip: {
        enabled: true,
        callbacks: {
          label: (ctx) => {
            if (ctx.raw == null) return null

            const emotionMap = {
              1: 'Enojo',
              2: 'Disgusto',
              3: 'Miedo',
              4: 'Tristeza',
              5: 'Neutral',
              6: 'Sorpresa',
              7: 'Felicidad'
            }
            return `Emoción: ${emotionMap[ctx.raw] || 'Desconocido'}`
          }
        }
      }
    }
  }
}

function setChart(xsOrLabels, values, isWeek = false) {
  if (isWeek) {
    chartData.value = {
      labels: xsOrLabels,
      datasets: [
        {
          label: 'Nivel emocional',
          data: values.map(v => emotionToLevel(v)),
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34,197,94,0.20)',
          tension: 0.4,
          fill: true,
          pointRadius: 6,
          pointHoverRadius: 9,
          pointBackgroundColor: '#22c55e'
        }
      ]
    }
    return
  }

  const maxVisible = getVisibleHourIndex()

  const filteredData = values.map((v, i) => {
    if (i > maxVisible) return null
    return v ? emotionToLevel(v) : null
  })

  chartData.value = {
    labels: xsOrLabels,
    datasets: [
      {
        label: 'Nivel emocional',
        data: filteredData,
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34,197,94,0.15)',
        tension: 0.4,
        fill: true,
        spanGaps: true,
        pointRadius: (ctx) => ctx.raw == null ? 0 : 5,
        pointHoverRadius: (ctx) => ctx.raw == null ? 0 : 8,
        pointBackgroundColor: '#22c55e'
      }
    ]
  }
}

async function buildChart() {
  const id = auth.user?.id
  if (!id) return

  const isDay = selectedRange.value === 'day'

  if (chartRef.value?.chart) {
    const chart = chartRef.value.chart
  
    if (chart.data.datasets && chart.data.datasets.length > 0) {
      chart.data.datasets[0].data = []
      chart.update()
    }
  }

  chartOptions.value = getChartOptions(isDay)

  try {
    if (isDay) {
      const { labels, values } = await getAgentDayHistory(id)
      setChart(labels, values, false)
    } else {
      const data = await getAgentWeekHistory(id)
      lastWeekData.value = data
      const { labels, values } = data
      setChart(labels, values, true)
    }

    await nextTick()
    chartRef.value?.chart?.update()
  } catch (err) {
    console.error('Error gráfico:', err)
  }
}

async function refreshDailyChartWithoutAnimation() {
  const id = auth.user?.id

  const { labels, values } = await getAgentDayHistory(id)

  setChart(labels, values, false)

  await nextTick()
  if (chartRef.value?.chart) {
    chartRef.value.chart.update('none')
  }
}

const weekRangeLabel = computed(() => {
  const id = auth.user?.id
  if (!id || !lastWeekData.value) return "Semana"

  const { labels } = lastWeekData.value

  if (!labels.length) return "Semana"

  const first = new Date(labels[0])
  const last = new Date(labels[labels.length - 1])

  return `Semana ${first.toLocaleDateString('es-PE')} - ${last.toLocaleDateString('es-PE')}`
})

/* ------------------ INIT ------------------ */
onMounted(async () => {
  await loadCameraStatus()
  await loadCurrent()
  connectCurrentEmotionStream()

  await buildChart()

  dailyChartInterval.value = setInterval(() => {
    if (selectedRange.value === 'day') {
      refreshDailyChartWithoutAnimation()
    }
  }, 300000)
})

onUnmounted(() => {
  if (dailyChartInterval.value) clearInterval(dailyChartInterval.value)

  if (wsCurrentEmotion) wsCurrentEmotion.close()
})
</script>

<style scoped>
.page{padding:1rem;background:#f5f6f7;min-height:100vh;}
.topbar{display:flex;align-items:center;justify-content:space-between;background:#fff;padding:.8rem 1rem;border-radius:12px;margin-bottom:1rem;box-shadow:0 1px 2px rgba(0,0,0,.06);}
.left{display:flex;align-items:center;gap:.75rem;}
.title{margin:0;font-size:1rem;}
.subtitle{color:#6b7280;}
.actions{display:flex;gap:.5rem;flex-wrap:wrap;}

.grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem;}
.card{border-radius:12px;}
.current-state{display:grid;place-items:center;gap:.5rem;margin-bottom:1rem;}
.emoji{font-size:48px;}
.state-chip{background:#e7f5ee;color:#15803d;padding:.4rem .8rem;border-radius:999px;font-weight:600;}

.legend{display:flex;gap:1rem;font-size:.85rem;margin-top:.5rem;color:#6b7280;}
.lvl.l1 { color: #ef4444; }
.lvl.l2 { color: #f97316; }
.lvl.l3 { color: #eab308; }
.lvl.l4 { color: #3b82f6; }
.lvl.l5 { color: #6b7280; }
.lvl.l6 { color: #10b981; }
.lvl.l7 { color: #22c55e; }

.tips{margin-top:1rem;border-radius:12px;}
.tips-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:.75rem;}
.tip{padding:1rem;border-radius:12px;background:#f3f4f6;min-height:92px;}
.tip-green{background:#ecfdf5;}
.tip-blue{background:#eff6ff;}
.tip-orange{background:#fff7ed;}

@media (max-width:980px){
  .grid{grid-template-columns:1fr;}
  .actions{justify-content:flex-end;}
}

/* botones personalizados */
.btn-orange{background-color:#f97316!important;border:none!important;color:#fff!important;}
.btn-orange:hover{background-color:#ea580c!important;}
.btn-green{background-color:#166534!important;border:none!important;color:#fff!important;}
.btn-green:hover{background-color:#14532d!important;}

/* gráfico */
.chart-card{position:relative;}
.card-header-row{display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;}
.subtitle-sm{color:#6b7280;font-size:.9rem;font-weight:400;}
.range-controls{display:flex;align-items:center;gap:.5rem;}
.w-14rem{width:14rem;}
.ml-2{margin-left:.5rem;}
</style>
