const DEFAULT_FRONTEND_URL = 'https://galen.green'

const splitOrigins = (value?: string) =>
  (value || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

export const getAllowedOrigins = () => {
  const productionOrigins = Array.from(
    new Set([
      DEFAULT_FRONTEND_URL,
      ...splitOrigins(process.env.FRONTEND_URL),
      ...splitOrigins(process.env.DEV_FRONTEND_URL),
    ]),
  )

  const developmentOrigins = Array.from(
    new Set(['http://localhost:5173', 'http://localhost:3000', ...productionOrigins]),
  )

  return { productionOrigins, developmentOrigins, DEFAULT_FRONTEND_URL }
}
