import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Color,
  Clock,
} from 'three'
import { EffectComposer, FilmPass, BloomPass, GodRaysPass, RenderPass } from 'postprocessing'
import {KernelSize} from 'postprocessing/src/materials/convolution.js'
import ControlKit from 'controlkit'
import tinycolor from 'tinycolor2'
import anime from 'animejs'
import Stats from 'stats.js'
import styles from 'app.css'

const stats = new Stats()

stats.showPanel(0)

document.body.appendChild(stats.dom)

export const MAX_POSITION_Z = 0
export const MIN_POSITION_Z = -2000
export const FRAME_RATE = 60
const DEFAULT_CAMERA_CONFIG = {
  // frustum vertical field of view
  fov: {
    value: 100, // 75
    range: [10, 150],
  },
  aspect: window.innerWidth / window.innerHeight, // frustum aspect ratio
  near: 1, // frustum near plane
  far: 2000, // frustum far plane
}
const DEFAULT_OPTIONS = {
  onStart: () => {},
  onAnimate: () => {},
  camera: DEFAULT_CAMERA_CONFIG,
  playbackSpeed: 1,
  scanlineDensity: 1,
  scanlineIntensity: 0.8,
  resolutionScale: 0.5,
  kernelSize: KernelSize.HUGE,
  intensity: 3,
  distinction: 1,
  backgroundColor: new Color(tinycolor.random().toHexString()),
}
const clock = new Clock()

export default class App {
  constructor (options = {}) {
    this.options = {
      ...DEFAULT_OPTIONS,
      ...options,
    }
    this.createScene()
    this.addControlKit()
    this.initAnimations()

    this.options.onStart()
    this.render()
    document.body.appendChild(this.renderer.domElement)
    document.body.addEventListener('mousedown', this.startDownAnimation)
    document.body.addEventListener('mouseup', this.startUpAnimation)
  }

  createScene (options = {}) {
    const fov = this.options.camera.fov.value
    const aspect = this.options.camera.aspect
    const near = this.options.camera.near
    const far = this.options.camera.far

    this.scene = new Scene()
    this.scene.background = new Color(this.options.backgroundColor)
    this.camera = new PerspectiveCamera(fov, aspect, near, far)
    this.camera.translateZ(-100)
    this.renderer = new WebGLRenderer({
      antialias: true
    })
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(window.innerWidth, window.innerHeight)

    this.composer = new EffectComposer(this.renderer, {
      // stencilBuffer: true,
      // depthTexture: true,
    })
    this.composer.setSize(window.innerWidth, window.innerHeight)

    this.filmPass = new FilmPass({
      eskil: false,
      grayscale: false,
      greyscaleIntensity: 1.0,
      noise: true,
      noiseIntensity: 0.5,
      screenMode: true,
      scanlineDensity: this.options.scanlineDensity,
      scanlineIntensity: this.options.scanlineIntensity,
      scanlines: true,
      sepia: false,
      sepiaIntensity: 1.0,
      vignette: false,
      vignetteDarkness: 0.5,
      vignetteOffset: 0.0,
    })
    this.bloomPass = new BloomPass({
      resolutionScale: this.options.resolutionScale,
      kernelSize: this.options.kernelSize,
      intensity: this.options.intensity,
      distinction: this.options.distinction,
      screenMode: true,
    })
    // this.godRaysPass = new GodRaysPass({
    //   resolutionScale: this.options.resolutionScale,
    //   kernelSize: this.options.kernelSize,
    //   intensity: this.options.intensity,
    //   distinction: this.options.distinction,
    //   screenMode: this.options.screenMode,
    // })

    this.filmPass.renderToScreen = true
    this.bloomPass.renderToScreen = true
    this.composer.addPass(new RenderPass(this.scene, this.camera))
    // this.composer.addPass(this.filmPass)
    this.composer.addPass(this.bloomPass)
  }

  initAnimations = () => {
    this.downAnimation = anime({
      autoplay: false,
      targets: this.options.camera.fov,
      value: [80, 100],
      duration: 100,
      easing: 'easeOutCubic',
      complete: () => {
        this.paused = !this.paused

        if (this.paused) {
          this.playbackSpeedStopAnimation.restart()
        }
      },
    })

    this.upAnimation = anime({
      autoplay: false,
      targets: this.options.camera.fov,
      value: [100, 80],
      duration: 1000,
      easing: 'easeOutElastic',
      begin: () => {
        if (!this.paused) {
          this.playbackSpeedStartAnimation.restart()
        }
      },
    })

    this.playbackSpeedStopAnimation = anime({
      autoplay: false,
      targets: this.options,
      playbackSpeed: [1, 0],
      duration: 500,
      easing: 'easeInCubic',
    })

    this.playbackSpeedStartAnimation = anime({
      autoplay: false,
      targets: this.options,
      playbackSpeed: [0, 1],
      duration: 50,
      easing: 'easeInCubic',
    })
  }

  startDownAnimation = (e) => {
    if (e.target.tagName !== 'CANVAS') return
    if (!this.upAnimation.completed) {
      this.upAnimation.pause()
    }
    this.downAnimation.restart()
  }

  startUpAnimation = (e) => {
    if (e.target.tagName !== 'CANVAS') return
    if (!this.downAnimation.completed) {
      this.downAnimation.pause()
      this.downAnimation.complete()
    }

    this.upAnimation.duration = this.paused ? 1000 : 150
    this.upAnimation.easing = this.paused ? 'easeOutElastic' : 'easeInCubic'
    this.upAnimation.restart()
  }

  nextObjectStep = (object) => {
    const playbackSpeed = this.options.playbackSpeed
    const acc = (object.positionSpeedZ || 10) * playbackSpeed

    object.position.z = object.position.z + acc

    if (object.position.z > MAX_POSITION_Z) {
      object.position.z = MIN_POSITION_Z
    }
  }

  render = (timestamp) => {
    stats.begin()

    this.options.onAnimate()
    this.scene.children.forEach((object) => this.nextObjectStep(object))
    this.camera.fov = this.options.camera.fov.value
    this.camera.updateProjectionMatrix()
    // defer render to effect composer
    // this.renderer.render(this.scene, this.camera)
    this.composer.render(clock.getDelta())
    requestAnimationFrame(this.render)

    stats.end()
  }

  addControlKit () {
    const options = this.options
    const controls = options.controls

    if (!controls.film) {
      controls.film = {
        scanlineDensity: {
          value: options.scanlineDensity,
          range: [0, 2],
          step: 0.1,
          dp: 1,
        },
        scanlineIntensity: {
          value: options.scanlineIntensity,
          range: [0, 1],
          step: 0.1,
          dp: 1,
        },
      }
      controls.bloom = {
        resolutionScale: {
          value: options.resolutionScale,
          range: [0, 1],
          step: 0.1,
          dp: 1,
        },
        kernelSize: {
          value: options.kernelSize,
          options: [
            KernelSize.VERY_SMALL,
            KernelSize.SMALL,
            KernelSize.MEDIUM,
            KernelSize.LARGE,
            KernelSize.VERY_LARGE,
            KernelSize.HUGE,
          ],
        },
        intensity: {
          value: options.intensity,
          range: [0, 20],
          step: 0.1,
          dp: 1,
        },
        distinction: {
          value: options.distinction,
          range: [1, 10],
          step: 0.1,
          dp: 1,
        },
        screenMode: {
          value: options.screenMode,
        },
      }
    }
    this.controlKit = new ControlKit()
    this.controlKit.addPanel()
      .addGroup({label: 'Camera'})
      .addSlider(
        options.camera.fov,
        'value',
        'range',
        {
          label: 'fov',
          step: 1,
          dp: 0,
        }
      )
      .addGroup({label: 'Options'})
      .addColor(controls.options, 'color', {
        colorMode: 'hex',
        onChange: () => {
          console.log(controls.options.color);
          controls.options.onChange()
        }
      })
      .addGroup({label: 'Film'})
      .addSlider(controls.film.scanlineDensity, 'value', 'range', {
        label: 'count',
        onChange: () => {
          this.filmPass.scanlineDensity = controls.film.scanlineDensity.value
          this.composer.setSize(window.innerWidth, window.innerHeight)
          this.composer.render(clock.getDelta())
        }
      })
      .addSlider(controls.film.scanlineIntensity, 'value', 'range', {
        label: 'intensity',
        onChange: () => {
          this.filmPass.material.uniforms.scanlineIntensity.value = controls.film.scanlineIntensity.value
          this.composer.render(clock.getDelta())
        }
      })
      .addGroup({label: 'Bloom'})
      .addSlider(controls.bloom.resolutionScale, 'value', 'range', {
        label: 'resolutionScale',
        onChange: () => {
          this.bloomPass.resolutionScale = controls.bloom.resolutionScale.value
          this.composer.setSize(window.innerWidth, window.innerHeight)
          this.composer.render(clock.getDelta())
        }
      })
      .addSelect(controls.bloom.kernelSize, 'options', {
        label: 'kernelSize',
        target: 'value',
        onChange: () => {
          this.bloomPass.kernelSize = controls.bloom.kernelSize.value
          this.composer.setSize(window.innerWidth, window.innerHeight)
          this.composer.render(clock.getDelta())
        }
      })
      .addSlider(controls.bloom.intensity, 'value', 'range', {
        label: 'intensity',
        onChange: () => {
          this.bloomPass.intensity = controls.bloom.intensity.value
          this.composer.setSize(window.innerWidth, window.innerHeight)
          this.composer.render(clock.getDelta())
        }
      })
      .addSlider(controls.bloom.distinction, 'value', 'range', {
        label: 'distinction',
        onChange: () => {
          this.bloomPass.distinction = controls.bloom.distinction.value
          this.composer.setSize(window.innerWidth, window.innerHeight)
          this.composer.render(clock.getDelta())
        }
      })
      // .addGroup({label: 'Cube'})
      // .addSubGroup({label: 'Rotation Speed'})
      // .addSlider(controls.cube.rotation.x.speed, 'value', 'range', {label: 'x'})
      // .addSlider(controls.cube.rotation.y.speed, 'value', 'range', {label: 'y'})
      // .addSlider(controls.cube.rotation.z.speed, 'value', 'range', {label: 'z'})
      // .addSubGroup({label: 'Position Speed'})
      // .addSlider(controls.cube.position.z.speed, 'value', 'range', {label: 'z'})
      // .addNumberInput(controls, 'speed')
      // .addStringInput(obj, 'string')
  }
}
