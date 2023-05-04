<template>
  <pre style="position:absolute; user-select: none;">
    GAMEPAD
    <!-- a: {{ a }}
    b: {{ b }}
    c: {{ c }} -->
    isSupported: {{ isSupported }}
    isActive: {{ isActive }}
    alpha: {{ alpha }}
    beta: {{ beta }}
    gamma: {{ gamma }}
  </pre>

  <!-- <button @click="enter">Full Screen</button>
  <button @click="shoot">Shoot</button>
   -->
  <svg width="100%" height="100vh">

    <g style="transform:translate(-950px) scale(3)">
      <ShotGun />
    </g>

    <rect x="0" y="0%" width="50%" height="50vh" fill="transparent" stroke="red" @click="toggleFullScreen" />
    <rect x="25%" y="50%" width="25%" height="50vh" fill="transparent" stroke="red" @touchstart="shoot" />
    <rect x="50%" y="50%" width="50%" height="50vh" fill="transparent" stroke="red" @touchstart="reload" />

  </svg>

  <!-- <audio autoplay style="visibility: hidden;">
    <source src="../assets/sounds/shotgun-firing.mp3" type="audio/mp3">
    Your browser does not support the audio element.
  </audio> -->

  <audio ref="shootAudio">
    <source src="../assets/sounds/shotgun_fire.mp3" type="audio/mpeg">
  </audio>
  <audio ref="reloadAudio">
    <source src="../assets/sounds/shotgun_reload.mp3" type="audio/mpeg">
  </audio>
</template>

<script setup lang="ts">

import { useDeviceOrientation, useFullscreen } from '@vueuse/core'
import { socket } from 'src/global';
import { onMounted, ref } from 'vue';
import { useWakeLock } from '@vueuse/core'
import ShotGun from 'src/components/ShotGun.vue'

// var audio = new Audio('https://cdn.pixabay.com/audio/2022/01/18/audio_decfb3ba80.mp3?filename=shotgun-firing-3-14483.mp3');
// let audio = new Audio('../assets/shotgun-firing.mp3');
// let audio = new Audio(location.origin + '/assets/audio/shotgun-firing.mp3');
// let audio = new Audio('./shotgun-firing.mp3');
const shootAudio = ref<HTMLAudioElement>()
const reloadAudio = ref<HTMLAudioElement>()
const { isSupported, isActive, request, release } = useWakeLock()

const {
  isAbsolute,
  alpha,
  beta,
  gamma,
} = useDeviceOrientation({})

const { isFullscreen, enter, exit, toggle } = useFullscreen()

onMounted(async () => {
  await request('screen')
  setInterval(() => updatePointer(), 33)
})


function updatePointer() {
  socket.volatile.emit('updatePointer', { alpha: alpha.value ?? 0 + 360, beta: beta.value ?? 0 + 360, gamma: gamma.value ?? 0 + 360 })
}

function shoot() {

  socket.emit('shoot', { alpha: alpha.value ?? 0 + 360, beta: beta.value ?? 0 + 360 })

  navigator.vibrate(50);

  (shootAudio.value?.cloneNode(true) as HTMLAudioElement).play()
}

function reload() {
  socket.emit('reload')

  navigator.vibrate(50);

  (reloadAudio.value?.cloneNode(true) as HTMLAudioElement).play()
}

async function toggleFullScreen() {
  await toggle()
}

// const a = ref<number>()
// const b = ref<number>()
// const c = ref<number>()

// function getDeviceOrientation() {
//   // Add a listener for deviceorientation event
//   window.addEventListener('deviceorientation', (event: DeviceOrientationEvent) => {
//     a.value = event.alpha || 0;
//     b.value = event.beta || 0;
//     c.value = event.gamma || 0;
//   });

//   // Add a listener for orientationchange event
//   // window.addEventListener('orientationchange', () => {
//   //   setTimeout(() => {

//   if (c.value! < 0) {
//     // Get the orientation angle
//     const orientation = window.orientation || 0;

//     // Calculate the correction angle based on the current orientation
//     let correction = 0;
//     if (orientation === -90) {
//       correction = 270;
//     } else if (orientation === 90) {
//       correction = 90;
//     }

//     // Apply the correction to the alpha value
//     a.value = (a.value! + correction) % 360;
//     // }, 200);
//   }
//   // });

//   // return { alpha, beta, gamma };
// }

function convertRelativeAnglesToAbsolute(alpha: number, beta: number, gamma: number): { alpha: number, beta: number, gamma: number } {
  const absGamma = Math.abs(gamma);

  // Calculate the absolute alpha value
  let absAlpha = alpha + gamma;
  if (absAlpha < 0) {
    absAlpha += 360;
  } else if (absAlpha >= 360) {
    absAlpha -= 360;
  }

  // Calculate the absolute beta value
  let absBeta = beta;
  if (absGamma < 90) {
    absBeta = -absBeta;
  }
  absBeta += gamma;

  return {
    alpha: absAlpha,
    beta: absBeta,
    gamma: absGamma
  };
}


// function getDeviceOrientation() {

//   // @ts-ignore
//   window.addEventListener('deviceorientationabsolute', (event: DeviceOrientationEvent) => {
//     a.value = event.alpha || 0;
//     b.value = event.beta || 0;
//     c.value = event.gamma || 0;
//   });

// }

// getDeviceOrientation()


</script>
