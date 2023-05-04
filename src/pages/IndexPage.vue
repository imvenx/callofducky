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
    <!-- <circle r="10" :cx="`${(x).toFixed(4)}%`" :cy="`${y.toFixed(4)}%`" fill="transparent" stroke="red" /> -->

    <g ref="bullsEyeCont" class="bullsEye" style="transform: translate(50%, 50%);">
      <circle ref="bullsEye5" r="100" stroke="black" stroke-width=".5px" fill="white" :cx="0" :cy="0" />
      <circle ref="bullsEye4" r="80" stroke="black" stroke-width=".5px" fill="rgb(100, 180, 200)" :cx="0" :cy="0" />
      <circle ref="bullsEye3" r="60" stroke="black" stroke-width=".5px" fill="white" :cx="0" :cy="0" />
      <circle ref="bullsEye2" r="40" stroke="black" stroke-width=".5px" fill="rgb(100, 180, 200)" :cx="0" :cy="0" />
      <circle ref="bullsEye1" r="20" stroke="black" stroke-width=".5px" fill="red" :cx="0" :cy="0" />
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

    <g id="aim" :style="`transform:translate(${x.toFixed(4)}%, ${y.toFixed(4)}%)`">
      <line x1="0" y1="0" x2="10" y2="0" stroke="green" stroke-width="5px" />
      <line x1="20" y1="0" x2="30" y2="0" stroke="green" stroke-width="5px" />
      <line x1="15" y1="-15" x2="15" y2="-5" stroke="green" stroke-width="5px" />
      <line x1="15" y1="5" x2="15" y2="15" stroke="green" stroke-width="5px" />
    </g>

  </svg>

  <!-- 
  <audio ref="shootAudio">
    <source src="../assets/sounds/shotgun_fire.mp3" type="audio/mpeg">
  </audio> -->
</template>

<script setup lang="ts">
import { socket } from 'src/global';
import { onMounted, ref } from 'vue';

const shootAudio = ref()

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

const rootSvg = ref<SVGSVGElement>()

onMounted(() => {
  socket.on('updatePointer', updatePointer)

  socket.on('shoot', ({ alpha, beta }: any) => {


    console.log('shoot')

    if (Object.keys(topLeft.value).length <= 0) {
      topLeft.value.x = alpha
      topLeft.value.y = beta
      console.log('a')

      return
    }

    if (Object.keys(bottomRight.value).length <= 0) {
      bottomRight.value.x = alpha
      bottomRight.value.y = beta
      console.log('b')

      return
    }
    console.log('c')

    shots.value.push({ x: x.value, y: y.value });

    checkIfHit()


  })
})

const points = ref(0)
function checkIfHit() {
  requestAnimationFrame(function () {
    const lastShot: SVGCircleElement = shotsEl.value[shotsEl.value.length - 1]

    let addPoints = 0
    if (circlesIntersect(bullsEye1.value, lastShot)) addPoints = 100
    else if (circlesIntersect(bullsEye2.value, lastShot)) addPoints = 80
    else if (circlesIntersect(bullsEye3.value, lastShot)) addPoints = 60
    else if (circlesIntersect(bullsEye4.value, lastShot)) addPoints = 40
    else if (circlesIntersect(bullsEye5.value, lastShot)) addPoints = 20

    points.value += addPoints

    setTimeout(() => {
      lastShot.remove()
    }, 150);
    shotsEl.value.splice(0, 1)

    if (addPoints > 0) {
      var text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', (shots.value[shots.value.length - 1]?.x.toString() ?? '0') + '%')
      text.setAttribute('y', (shots.value[shots.value.length - 1]?.y.toString() ?? '0') + '%')
      text.innerHTML = '+' + addPoints
      text.style.fill = 'green'
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

    // setTimeout(() => , 1000);
    // if (addPoints > 0) {
    //   lastShot.parentElement?.removeChild(lastShot)
    //   bullsEyeCont.value.appendChild(lastShot)
    // }
  })
}

function circlesIntersect(circle1: SVGCircleElement, circle2: SVGCircleElement) {
  const rect1 = circle1.getBoundingClientRect();
  const rect2 = circle2.getBoundingClientRect();

  const dx = (rect1.x + rect1.width / 2) - (rect2.x + rect2.width / 2);
  const dy = (rect1.y + rect1.height / 2) - (rect2.y + rect2.height / 2);

  // circle2.parentElement?.removeChild(circle2)
  // bullsEyeCont.value.appendChild(circle2)

  console.log(dx, dy)
  const distance = Math.sqrt(dx * dx + dy * dy);

  return distance < (rect1.width + rect2.width) / 2;
}

function updatePointer({ alpha, beta, gamma }: any) {

  angles.value = { alpha: alpha, beta: beta, gamma: gamma }

  const { alphaSmoothed, betaSmoothed } = smoothDeviceOrientation(alpha, beta, 5)

  x.value = normalizeAngle(alphaSmoothed, bottomRight.value.x ?? 0, topLeft.value.x ?? 0, true)
  y.value = normalizeAngle(betaSmoothed, bottomRight.value.y ?? 0, topLeft.value.y ?? 0, true)

}

function normalizeAngle(angle: number, minAngle: number, maxAngle: number, invert: boolean = false): number {
  // Calculate the range of angles
  let angleRange = maxAngle - minAngle;
  if (angleRange < 0) {
    angleRange += 360;
  }

  // Calculate the normalized angle value
  let normalizedAngle = ((angle - minAngle) / angleRange) * 100;

  // Invert the direction if specified
  if (invert) {
    normalizedAngle = 100 - normalizedAngle;
  }

  // Ensure the normalized angle value is between 0 and 100
  normalizedAngle = Math.max(0, Math.min(100, normalizedAngle));

  return normalizedAngle;
}

function smoothDeviceOrientation(alpha: number, beta: number, smoothingFactor: number) {
  // Initialize the previous smoothed values to the current raw values
  let alphaSmoothed = alpha;
  let betaSmoothed = beta;

  // Apply exponential smoothing to the raw values
  alphaSmoothed = alpha * smoothingFactor + alphaSmoothed * (1 - smoothingFactor);
  betaSmoothed = beta * smoothingFactor + betaSmoothed * (1 - smoothingFactor);

  return { alphaSmoothed, betaSmoothed };
}

//this is to prevent alpha jump when gamma changes from 90 to -90
function getAlphaFiltered(alpha: number) {
  let alphaFiltered = 0; // Initialize the filtered alpha value
  let alphaLast = 0; // Initialize the previous alpha value
  let alphaRaw = 0; // Initialize the raw alpha value

  // Define the filter coefficients
  const alphaFilterCoeff = 0.95;
  const alphaHighPassCoeff = 0.02;

  // Update the raw alpha value from the device orientation event
  alphaRaw = alpha ?? 0;

  // Apply the high-pass filter to the raw alpha value
  const alphaHighPass = alphaHighPassCoeff * (alphaRaw - alphaLast);

  // Apply the low-pass filter to the filtered alpha value
  alphaFiltered = alphaFilterCoeff * (alphaFiltered + alphaHighPass) + (1 - alphaFilterCoeff) * alphaRaw;

  // Store the current alpha value as the previous value for the next iteration
  alphaLast = alphaRaw;

  return alphaFiltered
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
</style>