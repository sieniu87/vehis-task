<template>

  <div class="min-h-screen bg-gradient-to-r from-blue-400 to-blue-900 flex items-center justify-center">
    <div class="container mx-auto p-8 max-w-md bg-white rounded-lg shadow-md">
      <VehisLogo class="pb-3"/>
      <form class="space-y-6 mt-5" @submit.prevent="calculateInsurance">
        <div class="grid w-full max-w-sm items-center gap-1.5">
          <Label for="carValueNetto">Wpisz wartość <b>netto</b> auta:</Label>
          <Input v-model.number="netto" @keyup="updateBrutto" step="0.01" min="0" id="carValueNetto" type="number"
                 placeholder="Wpisz kwotę netto"
                 class="block w-full rounded-lg border-gray-300 shadow-sm text-lg p-3 pr-12"/>
          <span class="text-red-600" v-if="errors.carValueNetto">{{ errors.carValueBrutto }}</span>
        </div>
        <p>lub</p>
        <div class="grid w-full max-w-sm items-center gap-1.5">
          <Label for="carValueNetto">Wpisz wartość <b>brutto</b> auta:</Label>
          <Input v-model.number="brutto" @keyup="updateNetto" step="0.01" min="0" id="carValueNetto" type="number"
                 placeholder="Wpisz kwotę brutto"
                 class="block w-full rounded-lg border-gray-300 shadow-sm text-lg p-3 pr-12"/>
          <span class="text-red-600" v-if="errors.carValueNetto">{{ errors.carValueNetto }}</span>
        </div>

        <FormField v-slot="{ value, handleChange }" name="carYear">
          <FormItem>
            <FormLabel>Wskaż rok produkcji auta:</FormLabel>
            <FormControl>
              <select v-bind="value" @change="handleChange"
                      class="mt-2 block w-full rounded-lg border-gray-300 shadow-sm text-lg p-3">
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
                <option value="2021">2021</option>
                <option value="2020">2020</option>
                <option value="2019">2019</option>
                <option value="2018">2018</option>
              </select>
            </FormControl>
            <FormMessage/>
          </FormItem>
        </FormField>

        <FormField v-slot="{ value, handleChange }" name="hasGPS">
          <FormItem>
            <FormControl>
              <div class="flex items-center space-x-2">
                <Switch id="gps" v-bind="value" :checked="value" @update:checked="handleChange"/>
                <Label for="gps">Zawiera GPS (Pakiet Drive+)</Label>
              </div>
            </FormControl>
            <FormMessage/>
          </FormItem>
        </FormField>

        <FormField v-slot="{ value, handleChange }" name="paymentOption">
          <FormItem>
            <FormLabel>Wybierz opcję płatności ubezpieczenia:</FormLabel>
            <FormControl>
              <select v-bind="value" @change="handleChange"
                      class="mt-2 block w-full rounded-lg border-gray-300 shadow-sm text-lg p-3">
                <option value="1">Płatność jednorazowa</option>
                <option value="2">2 raty</option>
                <option value="4">4 raty</option>
              </select>
            </FormControl>
            <FormMessage/>
          </FormItem>
        </FormField>

        <Button type="submit"
                class="w-full px-4 py-3 bg-blue-600 text-white text-lg rounded-lg shadow-md hover:bg-blue-700">Oblicz
        </Button>
      </form>

      <Card v-if="result.message || result.premium" class="mt-8 bg-gray-100 rounded-lg shadow-md">
        <CardHeader v-if="!result.message">
          <CardTitle class="text-center">Wynik Kalkulacji</CardTitle>
        </CardHeader>
        <CardContent v-if="result.message">
          <p class="p-4 text-lg font-semibold color-red-600 text-center"> {{ result.message }}</p>
        </CardContent>
        <CardContent v-else class="text-center">
          <p class="text-lg">Roczna składka: <b>{{ result.premium }} PLN</b></p>
          <p v-if="result.installments" class="mt-1 text-lg">Raty: <b>{{ result.installments }} PLN </b>każda
          </p>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup>
import VehisLogo from './components/VehisLogo.vue'

useSeoMeta({
  title: 'Vehis.pl - kalkulator ubezpieczenia',
  description: 'Vehis.pl - atrakcyjny leasing samochodów nowych i używanych'
})

import { ref } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const { handleSubmit, setFieldValue, useFieldModel, errors } = useForm({
  validationSchema: toTypedSchema(z.object({
    carValueNetto: z.number().min(1, 'Wartość netto musi być większa od 0'),
    carValueBrutto: z.number().min(1, 'Wartość brutto musi być większa od  0'),
    carYear: z.enum(['2024', '2023', '2022', '2021', '2020', '2019', '2018']),
    hasGPS: z.boolean().default(true),
    paymentOption: z.enum(['1', '2', '4']),
  })),
  initialValues: {
    carValueNetto: 0.00,
    carValueBrutto: 0.00,
    carYear: '2024',
    hasGPS: true,
    paymentOption: '1',
  },
})

const netto = useFieldModel('carValueNetto')
const brutto = useFieldModel('carValueBrutto')

const result = ref({
  message: '',
  premium: 0,
  installments: 0
})

const updateBrutto = (event) => {
  const newValue = parseFloat(event.target.value)
  const brutto = parseFloat((newValue * 1.23).toFixed(2))
  setFieldValue('carValueBrutto', brutto)
}

const updateNetto = (event) => {
  const newValue = parseFloat(event.target.value)
  const netto = parseFloat((newValue / 1.23).toFixed(2))
  setFieldValue('carValueNetto', netto)
}

const calculateInsurance = handleSubmit(async (values) => {
  const response = await fetch('/api/calculate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      carValue: values.carValueNetto,
      carYear: parseInt(values.carYear),
      hasGPS: values.hasGPS,
      paymentOption: parseInt(values.paymentOption),
    }),
  })
  result.value = await response.json()
})
</script>
