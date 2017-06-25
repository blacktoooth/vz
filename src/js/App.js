import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  BoxGeometry,
  MeshBasicMaterial,
  Mesh,
  Color,
} from 'three'
import 'app.css'

const DEFAULT_CAMERA_CONFIG = {
  // frustum vertical field of view
  fov: 75,
  // frustum aspect ratio
  aspect: window.innerWidth / window.innerHeight,
  // frustum near plane
  near: 0.1,
  // frustum far plane
  far: 1000,
}

export default class App {
  constructor (options = {}) {
    this.createScene()

    const geometry = new BoxGeometry(1, 1, 1)
    const material = new MeshBasicMaterial({color: 0x00ff00})
    const cube = new Mesh(geometry, material)
    const animate = () => {
      requestAnimationFrame(animate)
      cube.rotation.x += 0.1
      cube.rotation.y += 0.1
      this.renderer.render(
        this.scene,
        this.camera
      )
    }

    this.scene.add(cube)
    this.camera.position.z = 5
    this.renderer.setSize(window.innerWidth, window.innerHeight)

    animate()
    document.body.appendChild(this.renderer.domElement)
  }

  createScene = (options = {}) => {
    const {fov, aspect, near, far} = {
      ...DEFAULT_CAMERA_CONFIG,
      ...options,
    }

    this.scene = new Scene()
    this.scene.background = new Color(0x111111)
    this.camera = new PerspectiveCamera(fov, aspect, near, far)
    this.renderer = new WebGLRenderer()
  }
}
