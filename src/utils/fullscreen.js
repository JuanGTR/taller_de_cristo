export function toggleFullscreen() {
  const doc = document
  const el = doc.documentElement
  const isFull = doc.fullscreenElement || doc.webkitFullscreenElement
  if (!isFull) {
    (el.requestFullscreen || el.webkitRequestFullscreen)?.call(el)
  } else {
    (doc.exitFullscreen || doc.webkitExitFullscreen)?.call(doc)
  }
}