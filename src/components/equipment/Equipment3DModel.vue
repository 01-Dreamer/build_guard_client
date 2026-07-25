<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const props = defineProps<{
  model: 'formwork' | 'pit' | 'tower' | 'elevator'
}>()

const containerRef = ref<HTMLDivElement>()
let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let controls: OrbitControls | null = null
let frameId = 0
let resizeObserver: ResizeObserver | null = null
let rotatingGroup: THREE.Group | null = null
let loadingModel: THREE.Object3D | null = null
let elevatorCab: THREE.Object3D | null = null
let userInteracting = false

function addBar(group: THREE.Group, start: THREE.Vector3, end: THREE.Vector3, color: number, radius = 0.025) {
  const direction = new THREE.Vector3().subVectors(end, start)
  const length = direction.length()
  const geometry = new THREE.CylinderGeometry(radius, radius, length, 8)
  const material = new THREE.MeshStandardMaterial({ color, roughness: 0.46, metalness: 0.18 })
  const mesh = new THREE.Mesh(geometry, material)
  const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5)

  mesh.position.copy(midpoint)
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize())
  mesh.castShadow = true
  mesh.receiveShadow = true
  group.add(mesh)
}

function addBox(
  group: THREE.Group,
  size: [number, number, number],
  position: [number, number, number],
  color: number,
  options: { opacity?: number; metalness?: number; roughness?: number; emissive?: number } = {}
) {
  const material = new THREE.MeshStandardMaterial({
    color,
    roughness: options.roughness ?? 0.54,
    metalness: options.metalness ?? 0.12,
    transparent: options.opacity !== undefined,
    opacity: options.opacity ?? 1,
    emissive: options.emissive ?? 0x000000,
    emissiveIntensity: options.emissive ? 0.18 : 0
  })
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material)
  mesh.position.set(...position)
  mesh.castShadow = true
  mesh.receiveShadow = true
  group.add(mesh)
  return mesh
}

function addLabelPlate(group: THREE.Group, x: number, z: number, color: number) {
  const geometry = new THREE.SphereGeometry(0.09, 18, 18)
  const material = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.18 })
  const point = new THREE.Mesh(geometry, material)
  point.position.set(x, 1.45 + Math.sin(x + z) * 0.05, z)
  point.castShadow = true
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

function buildElevator() {
  const group = new THREE.Group()
  const blue = 0x2f6fed
  const cyan = 0x38bdf8
  const orange = 0xf59e0b
  const steel = 0x64748b

  addBox(group, [1.25, 0.12, 1.05], [0, 0.02, 0], 0x334155, { roughness: 0.78 })
  addBox(group, [2.1, 0.08, 1.5], [0, -0.02, 0], 0xdbeafe, { opacity: 0.72, roughness: 0.86 })

  for (let y = 0.18; y <= 4.3; y += 0.44) {
    addBar(group, new THREE.Vector3(-0.24, y, -0.18), new THREE.Vector3(0.24, y, -0.18), blue, 0.014)
    addBar(group, new THREE.Vector3(-0.24, y, 0.18), new THREE.Vector3(0.24, y, 0.18), blue, 0.014)
    addBar(group, new THREE.Vector3(-0.24, y, -0.18), new THREE.Vector3(-0.24, y + 0.34, 0.18), blue, 0.01)
    addBar(group, new THREE.Vector3(0.24, y, -0.18), new THREE.Vector3(0.24, y + 0.34, 0.18), blue, 0.01)
  }

  addBar(group, new THREE.Vector3(-0.34, 0.08, -0.26), new THREE.Vector3(-0.34, 4.52, -0.26), steel, 0.018)
  addBar(group, new THREE.Vector3(0.34, 0.08, -0.26), new THREE.Vector3(0.34, 4.52, -0.26), steel, 0.018)
  addBar(group, new THREE.Vector3(-0.34, 0.08, 0.26), new THREE.Vector3(-0.34, 4.52, 0.26), steel, 0.018)
  addBar(group, new THREE.Vector3(0.34, 0.08, 0.26), new THREE.Vector3(0.34, 4.52, 0.26), steel, 0.018)

  addBox(group, [0.92, 0.12, 0.78], [0, 4.62, 0], 0x1e3a8a, { metalness: 0.22, roughness: 0.42 })
  addBox(group, [0.2, 0.2, 0.2], [-0.52, 4.47, 0], orange, { emissive: orange })
  addBox(group, [0.2, 0.2, 0.2], [0.52, 4.47, 0], orange, { emissive: orange })

  const cabGroup = new THREE.Group()
  cabGroup.name = 'elevator-cab'
  addBox(cabGroup, [0.86, 0.78, 0.76], [0, 0, 0], orange, { metalness: 0.12, roughness: 0.36 })
  addBox(cabGroup, [0.72, 0.5, 0.79], [0, 0.04, -0.012], 0xffd166, { opacity: 0.54, roughness: 0.26 })
  addBox(cabGroup, [0.34, 0.42, 0.81], [-0.2, 0.02, -0.02], 0x93c5fd, { opacity: 0.52, metalness: 0.05, roughness: 0.18 })
  addBox(cabGroup, [0.34, 0.42, 0.81], [0.2, 0.02, -0.02], 0x93c5fd, { opacity: 0.52, metalness: 0.05, roughness: 0.18 })
  cabGroup.position.set(0.82, 2.0, 0)
  group.add(cabGroup)
  elevatorCab = cabGroup

  addBox(group, [0.42, 0.7, 0.58], [-0.78, 3.0, 0], 0xfbbf24, { metalness: 0.12 })
  addBar(group, new THREE.Vector3(0.82, 2.42, 0), new THREE.Vector3(0.82, 4.58, 0), 0x0f172a, 0.008)
  addBar(group, new THREE.Vector3(-0.78, 3.35, 0), new THREE.Vector3(-0.78, 4.58, 0), 0x0f172a, 0.008)

  for (let i = 0; i < 5; i += 1) {
    addBox(group, [1.2, 0.04, 0.1], [-1.25, 0.55 + i * 0.72, -0.52], 0xcbd5e1, { opacity: 0.82 })
    addBox(group, [0.05, 0.46, 0.1], [-1.75, 0.75 + i * 0.72, -0.52], 0x94a3b8, { opacity: 0.82 })
  }

  const beacon = new THREE.PointLight(cyan, 2.2, 3)
  beacon.position.set(0.82, 2.55, 0.42)
  group.add(beacon)

  return group
}

function addSceneStage() {
  if (!scene) return

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(props.model === 'elevator' ? 4.8 : 5.8, 96),
    new THREE.MeshStandardMaterial({
      color: 0xdbeafe,
      roughness: 0.82,
      metalness: 0.02,
      transparent: true,
      opacity: 0.72
    })
  )
  floor.rotation.x = -Math.PI / 2
  floor.position.y = -0.04
  floor.receiveShadow = true
  scene.add(floor)

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(props.model === 'elevator' ? 3.7 : 4.45, props.model === 'elevator' ? 3.75 : 4.5, 128),
    new THREE.MeshBasicMaterial({ color: 0x3f6fed, transparent: true, opacity: 0.42 })
  )
  ring.rotation.x = -Math.PI / 2
  ring.position.y = -0.035
  scene.add(ring)

  const grid = new THREE.GridHelper(props.model === 'elevator' ? 8.6 : 11, props.model === 'elevator' ? 18 : 22, 0x94a3b8, 0xcbd5e1)
  grid.position.y = -0.03
  ;(grid.material as THREE.Material).transparent = true
  ;(grid.material as THREE.Material).opacity = 0.24
  scene.add(grid)

  const buildingMaterial = new THREE.MeshStandardMaterial({
    color: 0x9db1c9,
    roughness: 0.76,
    metalness: 0.04,
    transparent: true,
    opacity: 0.54
  })
  const positions = [
    [-3.9, 0.42, -2.8, 0.52, 0.84, 0.58],
    [-3.2, 0.66, -3.35, 0.66, 1.32, 0.74],
    [3.2, 0.5, -3.05, 0.64, 1.0, 0.64],
    [4.05, 0.74, -2.45, 0.52, 1.48, 0.62],
    [2.8, 0.34, 2.75, 0.72, 0.68, 0.62]
  ]
  positions.forEach(([x, y, z, w, h, d]) => {
    const block = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), buildingMaterial)
    block.position.set(x, y, z)
    block.castShadow = true
    block.receiveShadow = true
    scene?.add(block)
  })
}

function buildTowerFallback() {
  const group = new THREE.Group()
  const yellow = 0xf5b21a
  const steel = 0x1f4f8f
  const dark = 0x1f2937

  for (let y = 0; y < 4.2; y += 0.42) {
    addBar(group, new THREE.Vector3(-0.22, y, -0.22), new THREE.Vector3(0.22, y, -0.22), yellow, 0.018)
    addBar(group, new THREE.Vector3(-0.22, y, 0.22), new THREE.Vector3(0.22, y, 0.22), yellow, 0.018)
    addBar(group, new THREE.Vector3(-0.22, y, -0.22), new THREE.Vector3(-0.22, y, 0.22), yellow, 0.018)
    addBar(group, new THREE.Vector3(0.22, y, -0.22), new THREE.Vector3(0.22, y, 0.22), yellow, 0.018)
    addBar(group, new THREE.Vector3(-0.22, y, -0.22), new THREE.Vector3(0.22, y + 0.42, 0.22), yellow, 0.012)
    addBar(group, new THREE.Vector3(0.22, y, -0.22), new THREE.Vector3(-0.22, y + 0.42, 0.22), yellow, 0.012)
  }

  addBar(group, new THREE.Vector3(-3.2, 4.0, 0), new THREE.Vector3(3.8, 4.0, 0), yellow, 0.035)
  addBar(group, new THREE.Vector3(-3.2, 4.0, 0), new THREE.Vector3(3.8, 4.32, 0), yellow, 0.018)
  addBar(group, new THREE.Vector3(-3.2, 4.0, 0), new THREE.Vector3(3.8, 3.72, 0), yellow, 0.018)
  addBar(group, new THREE.Vector3(-1.3, 4.0, 0), new THREE.Vector3(-2.8, 4.42, 0), steel, 0.02)
  addBar(group, new THREE.Vector3(0.18, 4.0, 0), new THREE.Vector3(2.8, 4.52, 0), steel, 0.018)

  const cab = new THREE.Mesh(
    new THREE.BoxGeometry(0.58, 0.34, 0.46),
    new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.4, metalness: 0.18 })
  )
  cab.position.set(0.56, 3.84, 0)
  cab.castShadow = true
  group.add(cab)

  addBar(group, new THREE.Vector3(2.65, 3.94, 0), new THREE.Vector3(2.65, 2.72, 0), dark, 0.01)
  const load = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.32, 0.42),
    new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.62 })
  )
  load.position.set(2.65, 2.48, 0)
  load.castShadow = true
  group.add(load)

  return group
}

function normalizeLoadedModel(root: THREE.Object3D) {
  const box = new THREE.Box3().setFromObject(root)
  const size = box.getSize(new THREE.Vector3())
  const center = box.getCenter(new THREE.Vector3())
  const maxAxis = Math.max(size.x, size.y, size.z, 1)
  const scale = props.model === 'tower' ? 7.0 / maxAxis : 4.4 / maxAxis

  root.scale.setScalar(scale)
  root.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale)
  root.traverse((child) => {
    const mesh = child as THREE.Mesh
    if (!mesh.isMesh) return
    mesh.castShadow = true
    mesh.receiveShadow = true
    const material = mesh.material
    const materials = Array.isArray(material) ? material : [material]
    materials.forEach((item) => {
      if (!item) return
      item.side = THREE.DoubleSide
      item.needsUpdate = true
    })
  })
}

function loadTowerModel() {
  if (!scene) return
  const loader = new GLTFLoader()
  const placeholder = buildTowerFallback()
  placeholder.name = 'tower-fallback'
  placeholder.position.y = 0
  rotatingGroup = placeholder
  scene.add(placeholder)

  loader.load(
    '/models/tower-crane.glb',
    (gltf) => {
      if (!scene || props.model !== 'tower') return
      scene.remove(placeholder)
      disposeObject(placeholder)
      loadingModel = gltf.scene
      normalizeLoadedModel(loadingModel)
      rotatingGroup = new THREE.Group()
      rotatingGroup.rotation.y = -0.45
      rotatingGroup.add(loadingModel)
      scene.add(rotatingGroup)
      controls?.target.set(0, 1.65, 0)
      controls?.update()
    },
    undefined,
    () => {
      loadingModel = placeholder
    }
  )
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
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.15
    containerRef.value.appendChild(renderer.domElement)
  }

  scene = new THREE.Scene()
  scene.fog = new THREE.Fog(0xf4f8ff, 9, 18)
  camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100)
  const cameraPosition: Record<typeof props.model, [number, number, number]> = {
    tower: [5.9, 4.2, 6.8],
    elevator: [4.1, 3.35, 5.2],
    formwork: [6.2, 4.1, 6.8],
    pit: [6.0, 3.8, 6.4]
  }
  const targetY = props.model === 'tower' ? 1.65 : props.model === 'elevator' ? 2.0 : props.model === 'pit' ? 0.65 : 0.85
  camera.position.set(...cameraPosition[props.model])
  camera.lookAt(0, targetY, 0)

  controls?.dispose()
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.07
  controls.enablePan = false
  controls.minDistance = props.model === 'tower' ? 3.8 : props.model === 'elevator' ? 3.2 : 4.6
  controls.maxDistance = props.model === 'tower' ? 11 : props.model === 'elevator' ? 8 : 10
  controls.maxPolarAngle = Math.PI * 0.48
  controls.minPolarAngle = Math.PI * 0.16
  controls.target.set(0, targetY, 0)
  controls.addEventListener('start', () => {
    userInteracting = true
  })
  controls.addEventListener('end', () => {
    userInteracting = false
  })

  const ambient = new THREE.HemisphereLight(0xffffff, 0xdbeafe, 2.1)
  const key = new THREE.DirectionalLight(0xffffff, 3.1)
  key.position.set(4, 7, 5)
  key.castShadow = true
  key.shadow.mapSize.set(2048, 2048)
  key.shadow.camera.near = 0.5
  key.shadow.camera.far = 18
  const rim = new THREE.DirectionalLight(0x8ec5ff, 1.6)
  rim.position.set(-4, 3, -5)
  scene.add(ambient, key, rim)

  addSceneStage()

  if (props.model === 'tower') {
    loadTowerModel()
  } else {
    rotatingGroup = props.model === 'formwork' ? buildFormwork() : props.model === 'pit' ? buildPit() : buildElevator()
    rotatingGroup.rotation.x = props.model === 'elevator' ? 0 : -0.24
    rotatingGroup.rotation.y = props.model === 'elevator' ? -0.42 : -0.54
    rotatingGroup.scale.setScalar(props.model === 'formwork' ? 0.82 : props.model === 'pit' ? 0.9 : 0.92)
    scene.add(rotatingGroup)
  }
  resize()
}

function animate() {
  frameId = requestAnimationFrame(animate)
  if (rotatingGroup && !userInteracting) {
    rotatingGroup.rotation.y += 0.0022
  }
  if (elevatorCab) {
    elevatorCab.position.y = 2.0 + Math.sin(Date.now() * 0.0012) * 0.08
  }
  controls?.update()
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
  loadingModel = null
  elevatorCab = null
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
  controls?.dispose()
  renderer?.dispose()
  renderer?.domElement.remove()
})
</script>

<template>
  <div ref="containerRef" class="equipment-3d-model" :class="`model-${props.model}`">
    <div class="model-hint">拖动旋转 · 滚轮缩放</div>
  </div>
</template>

<style scoped>
.equipment-3d-model {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 420px;
  overflow: hidden;
  background:
    linear-gradient(180deg, rgba(248, 251, 255, 0.96), rgba(235, 242, 252, 0.84)),
    radial-gradient(circle at 52% 38%, rgba(64, 112, 237, 0.22), transparent 46%);
  border: 1px solid #e5eaf2;
  border-radius: 8px;
}

.equipment-3d-model::before {
  position: absolute;
  inset: 0;
  pointer-events: none;
  content: "";
  background:
    linear-gradient(rgba(59, 130, 246, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(59, 130, 246, 0.08) 1px, transparent 1px);
  background-size: 42px 42px;
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.55), transparent 72%);
}

.equipment-3d-model::after {
  position: absolute;
  right: 18px;
  bottom: 14px;
  width: 38%;
  height: 18%;
  pointer-events: none;
  content: "";
  background: linear-gradient(90deg, transparent, rgba(47, 111, 237, 0.24), transparent);
  filter: blur(18px);
}

.model-hint {
  position: absolute;
  right: 14px;
  bottom: 12px;
  z-index: 2;
  padding: 6px 10px;
  color: #52627a;
  font-size: 12px;
  font-weight: 900;
  line-height: 1;
  pointer-events: none;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(203, 213, 225, 0.78);
  border-radius: 999px;
  backdrop-filter: blur(8px);
}

.equipment-3d-model :deep(canvas) {
  position: relative;
  z-index: 1;
  display: block;
  width: 100%;
  height: 100%;
  cursor: grab;
}

.equipment-3d-model :deep(canvas:active) {
  cursor: grabbing;
}
</style>
