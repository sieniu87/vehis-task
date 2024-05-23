import { defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { carValue, carYear, hasGPS, paymentOption } = body
  const output = {
    message: '',
    premium: 0,
    installments: 0
  }
  
  if (carValue > 400000) {
    output.message = 'Skontaktuj się z ubezpieczycielem, aby dokładnie obliczyć składkę.'
    return output
  }
  
  const currentYear = new Date().getFullYear()
  if (carYear < currentYear - 5) {
    output.message = 'Nie obsługujemy samochodów starszych niż 5 lat.'
    return output
  }
  
  let coefficient
  if (carValue < 40000) {
    coefficient = 8
  } else if (carValue < 100000) {
    coefficient = 5
  } else if (carValue < 200000) {
    coefficient = 4
  } else if (carValue <= 400000) {
    coefficient = 2
  }
  
  if (carYear < currentYear) {
    coefficient += 1
  }
  
  let premium = (carValue * coefficient) / 100
  if (!hasGPS) {
    premium *= 1.11
  }
  
  let installments = null
  if (paymentOption > 1) {
    premium += 200
    if (paymentOption === 2) {
      premium *= 1.02
    } else if (paymentOption === 4) {
      premium *= 1.04
    }
    installments = (premium / paymentOption).toFixed(2)
  }
  
  output.premium = premium.toFixed(2)
  output.installments = installments
  
  return output
})
