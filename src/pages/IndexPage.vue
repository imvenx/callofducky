<template>
  <pre style="position:absolute; ">
    x: {{ x }}
    y: {{ y }}
    topLeft: {{ topLeft }}
    bottomRight: {{ bottomRight }}
    alpha: {{ angles.alpha.toFixed(4) }}
    beta: {{ angles.beta.toFixed(4) }}
    gamma: {{ angles.gamma.toFixed(4) }}
    shots: {{ shots }}
  </pre>

  <pre style="position: absolute; right:1em; font-size: 2rem; font-weight: 800;">
      {{ points }} Points
  </pre>

  <svg ref="rootSvg" width="100%" height="100vh">
    <!-- <circle r="10" :cx="`${(x).toFixed(4)}x`" :cy="`${y.toFixed(4)}%`" fill="transparent" stroke="red" /> -->

    <g ref="bullsEyeCont" class="bullsEye" style="transform: translate(50%, 50%);">
      <circle ref="bullsEye5" r="100" stroke="black" stroke-width=".5px" fill="white" :cx="0" :cy="0"
        @mousedown="onShot(20)" />
      <circle ref="bullsEye4" r="80" stroke="black" stroke-width=".5px" fill="rgb(100, 180, 200)" :cx="0" :cy="0"
        @mousedown="onShot(40)" />
      <circle ref="bullsEye3" r="60" stroke="black" stroke-width=".5px" fill="white" :cx="0" :cy="0"
        @mousedown="onShot(60)" />
      <circle ref="bullsEye2" r="40" stroke="black" stroke-width=".5px" fill="rgb(100, 180, 200)" :cx="0" :cy="0"
        @mousedown="onShot(80)" />
      <circle ref="bullsEye1" r="20" stroke="black" stroke-width=".5px" fill="red" :cx="0" :cy="0" @click="onShot(100)" />
    </g>

    <defs>
      <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:rgb(255,255,0);stop-opacity:1" />
        <stop offset="100%" style="stop-color:rgb(255,0,0);stop-opacity:1" />
      </linearGradient>
    </defs>

    <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#grad1" stroke-width="5px" />

    <!-- <text x="50%" y="50%" fill="yellowgreen" style=" filter: drop-shadow( 0 0 2px rgba(0, 0, 0, 1));">aslkjdaksldj</text> -->

    <circle ref="shotsEl" v-for="shot in shots" r="2" :cx="`${(shot.x).toFixed(4)}%`" :cy="`${shot.y.toFixed(4)}%`"
      fill="yellow" stroke="black" />

    <!-- <g id="aim" :style="`transform:translate(${x.toFixed(4)}px, ${y.toFixed(4)}px)`">
      <line x1="0" y1="0" x2="10" y2="0" stroke="green" stroke-width="5px" />
      <line x1="20" y1="0" x2="30" y2="0" stroke="green" stroke-width="5px" />
      <line x1="15" y1="-15" x2="15" y2="-5" stroke="green" stroke-width="5px" />
      <line x1="15" y1="5" x2="15" y2="15" stroke="green" stroke-width="5px" />
    </g> -->

  </svg>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';


const topLeft = ref({} as any)
const bottomRight = ref({} as any)

const x = ref(0)
const y = ref(0)

const angles = ref({ alpha: 0, beta: 0, gamma: 0 })

const shots = ref<{ x: number, y: number }[]>([])
const shotsEl = ref()

const bullsEyeCont = ref()
const bullsEye5 = ref()
const bullsEye4 = ref()
const bullsEye3 = ref()
const bullsEye2 = ref()
const bullsEye1 = ref()

const points = ref(0)

const rootSvg = ref<SVGSVGElement>()

function onShot(pointsToAdd: number) {
  points.value += pointsToAdd

  var text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  const rect = bullsEye5.value.getBoundingClientRect()
  text.setAttribute('x', (rect.x + 50 ?? '0') + 'px')
  text.setAttribute('y', (rect.y.toString() ?? '0') + 'px')
  text.innerHTML = '+' + pointsToAdd
  text.style.fill = 'green'
  text.style.userSelect = 'none'
  text.style.fontSize = '2rem'
  text.style.fontWeight = '1000'
  text.style.filter = 'drop-shadow( 0 0 2px rgba(0, 0, 0, 1));'

  text.animate([
    { transform: 'translate(0, -30%)', fill: 'red', opacity: 0 },
  ],
    { duration: 1500, fill: 'forwards' })

  rootSvg.value?.appendChild(text)

  setInterval(() => text.remove(), 1500)
}

</script>

<style scoped>
#aim {
  transition: 0.05s all;
}

.bullsEye {
  animation: 20s moveBullsEye infinite linear;
}

@keyframes moveBullsEye {
  25% {
    transform: translate(100vw, 50%);
  }

  75% {
    transform: translate(0vw, 50%);
  }
}

* {
  cursor: crosshair;
}
</style>