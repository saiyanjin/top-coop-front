<template>
  <div class="d-flex flex-column h-100 pa-5 ga-0 overflow-hidden">
    <div class="d-flex flex-shrink-0 align-center justify-center ga-2 pa-3">
        <v-btn icon="mdi-chevron-left" variant="text" @click="prev"/>
        <h2 class="ma-0">{{currentMonth}}</h2>
        <v-btn icon="mdi-chevron-right" variant="text" @click="next"/>
    </div>
      <v-sheet class="flex-grow-1 overflow-hidden">
        <v-calendar
          ref="calendar"
          :events="events"
          :model-value="today"
          :first-day-of-week="1"
          :now="today"
          color="primary"
          type="week"
        ></v-calendar>
      </v-sheet>
  </div>
</template>

<script setup>
  import { onMounted, ref, computed } from 'vue'
  import { createVuetify } from 'vuetify'
  import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'

  const calendar = ref()
  
  const currentMonth = computed(() => {
    const [year, month, day] = today.value.split('-');
    const current = new Date(year, month - 1, day);
    let monthName = current.toLocaleDateString('fr-FR', { month: 'long' });
    monthName = monthName.charAt(0).toUpperCase() + monthName.slice(1);
    return `${monthName} ${current.getFullYear()}`;
  })
  
  const today = ref('2026-06-05')
  const events = [
    {
      name: 'Mise en rayon',
      start: '2026-06-01 09:00',
      end: '2026-06-01 12:00',
    },
    {
      name: `Thomas' Birthday`,
      start: '2026-06-7',
    },
    {
      name: 'Mash Potatoes',
      start: '2026-06-04 12:30',
      end: '2026-06-04 15:30',
    },
  ]

  onMounted(() => {
    calendar.value.scrollToTime('08:00')
  })

  createVuetify({
    icons: {
      defaultSet: 'mdi',
      aliases,
      sets: {
        mdi,
      },
    },
  })

  function offsetDate (days) {
    const [year, month, day] = today.value.split('-');
    const date = new Date(year, month - 1, day);
    date.setDate(date.getDate() + days);
    const newYear = date.getFullYear();
    const newMonth = String(date.getMonth() + 1).padStart(2, '0');
    const newDay = String(date.getDate()).padStart(2, '0');
    today.value = `${newYear}-${newMonth}-${newDay}`;
  }

  function prev () {
    offsetDate(-7);
  }

  function next () {
    offsetDate(7);
  }
    
</script>