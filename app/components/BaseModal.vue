<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    width="auto"
    persistent
  >
    <v-card
      :max-width="maxWidth"
      :min-width="minWidth"
      class="rounded-xl pa-6"
    >
      <v-card-title class="d-flex align-center justify-center text-title-large text-orange font-weight-bold pa-6">
        {{ title }}
      </v-card-title>

      <v-card-text class="pa-6">
        <!-- Contenu (textes inputs) -->
        <slot></slot>
      </v-card-text>

      <v-card-actions class="pa-6 d-flex justify-center ga-3">
        <v-btn
          size="large"
          rounded="lg"
          class="bg-vertFonce text-white px-8 font-weight-bold"
          @click="$emit('cancel')"
        >
          {{ cancelText }}
        </v-btn>
        <v-btn
          size="large"
          rounded="lg"
          class="bg-orange text-white px-8 font-weight-bold"
          @click="$emit('submit')"
        >
          {{ submitText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    required: true
  },
  submitText: {
    type: String,
    default: 'Enregistrer'
  },
  cancelText: {
    type: String,
    default: 'Annuler'
  },
  maxWidth: {
    type: [Number, String],
    default: 800
  },
  minWidth: {
    type: [Number, String],
    default: 600
  }
})

defineEmits(['update:modelValue', 'cancel', 'submit'])
</script>