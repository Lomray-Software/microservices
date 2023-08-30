export default {
  ...(await import('@lomray/microservice-config/rollup.config.mjs')).default,
}
