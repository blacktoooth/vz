import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  BoxGeometry,
  MeshBasicMaterial,
  Mesh,
} from 'three'
import 'normalize.css'
import 'app.css'

const scene = new Scene()
const fov = 75 // frustum vertical field of view
const aspect = window.innerWidth / window.innerHeight // frustum aspect ratio
const near = 0.1 // frustum near plane
const far = 1000 // frustum far plane
const camera = new PerspectiveCamera(fov, aspect, near, far)
const renderer = new WebGLRenderer()
const geometry = new BoxGeometry(1, 1, 1)
const material = new MeshBasicMaterial({color: 0x00ff00})
const cube = new Mesh(geometry, material)

scene.add(cube)
camera.position.z = 5
renderer.setSize(window.innerWidth, window.innerHeight)

function animate () {
  requestAnimationFrame(animate)
  cube.rotation.x += 0.1
  cube.rotation.y += 0.1
  renderer.render(scene, camera)
}
animate()
document.body.appendChild(renderer.domElement)
