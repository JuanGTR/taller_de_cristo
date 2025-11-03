import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { toggleFullscreen } from '../utils/fullscreen'

function useDeckFromLocation() {
  const { state } = useLocation()
  // Simple fallback deck if user opens /present directly
  return useMemo(() => state?.deck ?? [
    { type: 'bible', ref: 'Filipenses 4:13-14', chunks: [[
      { n: '13', t: 'Todo lo puedo en Cristo que me fortalece.' },
      { n: '14', t: 'Sin embargo, bien hicisteis en participar conmigo en mi tribulación.' },
    ]] }
  ], [state])
}

export default function Present() {
const deck = useDeckFromLocation()
return <div>Present screen</div>
}