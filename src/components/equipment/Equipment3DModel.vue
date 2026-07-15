<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as THREE from 'three'

const props = defineProps<{
  model: 'formwork' | 'pit'
}>()

const containerRef = ref<HTMLDivElement>()
let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let frameId = 0
let resizeObserver: ResizeObserver | null = null
let rotatingGroup: THREE.Group | null = null

function addBar(group: THREE.Group, start: THREE.Vector3, end: THREE.Vector3, color: number, radius = 0.025) {
  const direction = new THREE.Vector3().subVectors(end, start)
  const length = direction.length()
  const geometry = new THREE.CylinderGeometry(radius, radius, length, 8)
  const material = new THREE.MeshStandardMaterial({ color, roughness: 0.46, metalness: 0.18 })
  const mesh = new THREE.Mesh(geometry, material)
  const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5)

  mesh.position.copy(midpoint)
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize())
  group.add(mesh)
}

function addLabelPlate(group: THREE.Group, x: number, z: number, color: number) {
  const geometry = new THREE.SphereGeometry(0.09, 18, 18)
  const material = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.18 })
  const point = new THREE.Mesh(geometry, material)
  point.position.set(x, 1.45 + Math.sin(x + z) * 0.05, z)
  group.add(point)
}

function buildFormwork() {
  const group = new THREE.Group()
  const blue = 0x244f9f
  const teal = 0x4bb7aa
  const amber = 0xf59e0b

  const slabGeometry = new THREE.BoxGeometry(5.8, 0.08, 4.3)
  const slabMaterial = new THREE.MeshStandardMaterial({
    color: 0x67c5bb,
    transparent: true,
    opacity: 0.48,
    roughness: 0.58
  })
  const slab = new THREE.Mesh(slabGeometry, slabMaterial)
  slab.position.y = 1.52
  group.add(slab)

  for (let x = -2.8; x <= 2.8; x += 0.7) {
    addBar(group, new THREE.Vector3(x, 0, -2), new THREE.Vector3(x, 1.5, -2), blue)
    addBar(group, new THREE.Vector3(x, 0, 2), new THREE.Vector3(x, 1.5, 2), blue)
    addBar(group, new THREE.Vector3(x, 1.52, -2.1), new THREE.Vector3(x, 1.52, 2.1), teal, 0.02)
    addLabelPlate(group, x, -2.05, Math.abs(x) < 0.2 ? amber : blue)
  }

  for (let z = -2; z <= 2; z += 0.5) {
    addBar(group, new THREE.Vector3(-2.8, 1.52, z), new THREE.Vector3(2.8, 1.52, z), teal, 0.02)
    addBar(group, new THREE.Vector3(-2.8, 0.72, z), new THREE.Vector3(2.8, 0.72, z), blue, 0.018)
  }

  for (let x = -2.45; x <= 2.45; x += 0.7) {
    for (let z = -1.5; z <= 1.5; z += 0.7) {
      addBar(group, new THREE.Vector3(x, 0, z), new THREE.Vector3(x + 0.36, 0.72, z + 0.32), blue, 0.014)
      addLabelPlate(group, x, z, blue)
    }
  }

  return group
}

function buildPit() {
  const group = new THREE.Group()
  const wallColor = 0x2b6cb0
  const strutColor = 0x7c3aed
  const warningColor = 0xeab308

  const groundGeometry = new THREE.BoxGeometry(6.4, 0.08, 4.8)
  const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x9eb6a1, transparent: true, opacity: 0.58 })
  const ground = new THREE.Mesh(groundGeometry, groundMaterial)
  ground.position.y = 1.35
  group.add(ground)

  const bottomGeometry = new THREE.BoxGeometry(5.2, 0.08, 3.4)
  const bottomMaterial = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.72 })
  const bottom = new THREE.Mesh(bottomGeometry, bottomMaterial)
  bottom.position.y = -0.12
  group.add(bottom)

  for (let level = 0; level < 5; level += 1) {
    const y = level * 0.32
    const width = 5.2 - level * 0.18
    const depth = 3.4 - level * 0.12
    addBar(group, new THREE.Vector3(-width / 2, y, -depth / 2), new THREE.Vector3(width / 2, y, -depth / 2), wallColor)
    addBar(group, new THREE.Vector3(-width / 2, y, depth / 2), new THREE.Vector3(width / 2, y, depth / 2), wallColor)
    addBar(group, new THREE.Vector3(-width / 2, y, -depth / 2), new THREE.Vector3(-width / 2, y, depth / 2), wallColor)
    addBar(group, new THREE.Vector3(width / 2, y, -depth / 2), new THREE.Vector3(width / 2, y, depth / 2), wallColor)
  }

  for (let z = -1.4; z <= 1.4; z += 0.7) {
    addBar(group, new THREE.Vector3(-2.35, 0.82, z), new THREE.Vector3(2.35, 0.82, z), strutColor, 0.035)
    addBar(group, new THREE.Vector3(-2.35, 0.38, z), new THREE.Vector3(2.35, 0.38, z), warningColor, 0.032)
  }

  for (let x = -2.4; x <= 2.4; x += 0.6) {
    addBar(group, new THREE.Vector3(x, -0.1, -1.75), new THREE.Vector3(x, 1.35, -1.75), wallColor, 0.016)
    addBar(group, new THREE.Vector3(x, -0.1, 1.75), new THREE.Vector3(x, 1.35, 1.75), wallColor, 0.016)
  }

  return group
}

function disposeObject(object: THREE.Object3D) {
  object.traverse((child) => {
    const mesh = child as THREE.Mesh
    mesh.geometry?.dispose()
    const material = mesh.material
    if (Array.isArray(material)) {
      material.forEach((item) => item.dispose())
    } else {
      material?.dispose()
    }
  })
}

function resize() {
  if (!containerRef.value || !renderer || !camera) return

  const { width, height } = containerRef.value.getBoundingClientRect()
  renderer.setSize(width, height, false)
  camera.aspect = width / Math.max(height, 1)
  camera.updateProjectionMatrix()
}

function buildScene() {
  if (!containerRef.value) return

  if (!renderer) {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    containerRef.value.appendChild(renderer.domElement)
  }

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
  camera.position.set(4.4, 3.6, 5.2)
  camera.lookAt(0, 0.6, 0)

  const ambient = new THREE.HemisphereLight(0xffffff, 0xdbeafe, 2.3)
  const key = new THREE.DirectionalLight(0xffffff, 2.4)
  key.position.set(4, 5, 3)
  scene.add(ambient, key)

  rotatingGroup = props.model === 'formwork' ? buildFormwork() : buildPit()
  rotatingGroup.rotation.x = -0.34
  rotatingGroup.rotation.y = -0.54
  scene.add(rotatingGroup)
  resize()
}

function animate() {
  frameId = requestAnimationFrame(animate)
  if (rotatingGroup) {
    rotatingGroup.rotation.y += 0.0022
  }
  if (renderer && scene && camera) {
    renderer.render(scene, camera)
  }
}

function resetScene() {
  if (scene) {
    scene.traverse((object) => {
      if (object !== scene) disposeObject(object)
    })
  }
  buildScene()
}

onMounted(() => {
  buildScene()
  resizeObserver = new ResizeObserver(resize)
  if (containerRef.value) resizeObserver.observe(containerRef.value)
  animate()
})

watch(() => props.model, resetScene)

onBeforeUnmount(() => {
  cancelAnimationFrame(frameId)
  resizeObserver?.disconnect()
  if (scene) {
    scene.traverse((object) => {
      if (object !== scene) disposeObject(object)
    })
  }
  renderer?.dispose()
  renderer?.domElement.remove()
})
</script>

<template>
  <div ref="containerRef" class="equipment-3d-model" />
</template>

<style scoped>
.equipment-3d-model {
  width: 100%;
  height: 100%;
  min-height: 420px;
  overflow: hidden;
  background:
    linear-gradient(180deg, rgba(248, 250, 252, 0.92), rgba(241, 245, 249, 0.78)),
    radial-gradient(circle at 48% 44%, rgba(96, 165, 250, 0.2), transparent 42%);
  border: 1px solid #e5eaf2;
  border-radius: 6px;
}

.equipment-3d-model :deep(canvas) {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
