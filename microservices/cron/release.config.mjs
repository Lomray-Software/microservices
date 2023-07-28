export default {
  ...(await import('@lomray/microservice-config/release.config.mjs')).default,
}
