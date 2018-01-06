import App, {MAX_POSITION_Z, MIN_POSITION_Z} from 'App'
import 'normalize.css'
import {Map} from 'immutable'
import tinycolor from 'tinycolor2'
import Rx from 'rxjs/Rx'
import {
  BoxGeometry,
  PlaneGeometry,
  RingGeometry,
  MeshBasicMaterial,
  Mesh,
  Color,
  DoubleSide,
  Group,
} from 'three'

const chance = require('chance').Chance()
const RADIUS = 50
// const createCube = () => {
//   const tinyColor = tinycolor.random()
//   const color = tinyColor.toHexString()
//   const randomColor = new Color(color)
//   const material = new MeshBasicMaterial({color: randomColor})
//   const geometry = new BoxGeometry(1, 1, 1)
//   const object = new Mesh(geometry, material)
//
//   object.tinycolor = tinyColor
//   return object
// }
const createRing = (options) => {
  options = {
    innerRadius: 30,
    outerRadius: 40,
    // thetaSegments — Number of segments. A higher number means the ring will be more round. Minimum is 3. Default is 8.
    thetaSegments: 32,
    phiSegments: 8,
    thetaStart: Math.PI * 2 * (chance.integer({min: 1, max: 4}) / 4),
    thetaLength: Math.PI * 2 * (chance.integer({min: 0, max: 3}) / 4),
    color: tinycolor.random().toHexString(),
    ...options
  }

  const material = new MeshBasicMaterial({color: options.color})
  const geometry = new RingGeometry(
    options.innerRadius,
    options.outerRadius,
    options.thetaSegments,
    options.phiSegments,
    options.thetaStart,
    options.thetaLength,
  )
  const object = new Mesh(geometry, material)

  return object
}
const createPlane = (options = {}) => {
  const defaultOptions = {
    width: 10,
    height: 100,
    color: tinycolor.random().toHexString(),
    widthSegments: 1, // chance.integer({min: 1, max: 2}),
    heightSegments: 1, // chance.integer({min: 1, max: 2}),
  }

  options = {...defaultOptions, ...options}
  const color = new Color(options.color)
  const material = new MeshBasicMaterial({
    color,
    side: DoubleSide,
    wireframe: options.wireframe,
  })
  const geometry = new PlaneGeometry(
    options.width,
    options.height,
    options.widthSegments,
    options.heightSegments,
  )
  const object = new Mesh(geometry, material)

  geometry.rotateX(Math.PI / 2)
  geometry.translate(0, RADIUS + Math.random(), 0)
  return object
}
const createArcGroup = (objects, arcLength = Math.PI * 2) => {
  const numOfObjects = objects.length
  const group = new Group()
  const rotationX = arcLength / numOfObjects

  objects.forEach((object, index) => {
    object.rotateZ(rotationX * index)
    group.add(object)
  })

  group.position.z = MIN_POSITION_Z - (MIN_POSITION_Z * Math.random())
  group.positionSpeedZ = chance.integer({min: 1, max: 10})
  return group
}

const DEFAULT_OBJECT_MAP = Map({
  position: {
    z: {
      speed: {
        value: 0.01,
        range: [-0.05, 0.05]
      },
    },
  },
  rotation: {
    x: {
      speed: {
        value: 0.01,
        range: [-4, 4]
      }
    },
    y: {
      speed: {
        value: 0.01,
        range: [-4, 4]
      }
    },
    z: {
      speed: {
        value: 0.01,
        range: [-4, 4]
      }
    }
  }
})
const createRandomBurst = (options) => {
  const numOfPlanes = chance.integer({min: 5, max: 36})

  options = {
    width: chance.integer({min: 5, max: 10}),
    height: chance.integer({min: 20, max: 150}),
    wireframe: chance.bool({likelihood: 30}),
    color: tinycolor.random().toHexString(),
    ...options
  }

  return createArcGroup(Array(numOfPlanes).fill('').map(() => {
    return createPlane(options)
  }))
}
const createRandomRing = (options) => {
  options = {
    width: chance.integer({min: 5, max: 10}),
    height: chance.integer({min: 20, max: 200}),
    wireframe: chance.bool({likelihood: 30}),
    color: tinycolor.random().toHexString(),
    ...options
  }
  const ring = createRing(options)

  ring.position.z = MIN_POSITION_Z - (MIN_POSITION_Z * Math.random())
  ring.positionSpeedZ = chance.integer({min: 1, max: 10})
  return ring
}

function changeColor (state) {
  this.schedule(state + 1, 1000)
}

Rx.Scheduler.async.schedule(changeColor, 1000, 0)

const randomColor = tinycolor.random().toHexString()
const colors = tinycolor(randomColor).analogous(24, 10)
const controls = {
  options: {
    color: randomColor,
    onChange: () => {
      console.log('onChange');
    }
  }
}
const addBursts = (numOfBursts) => {
  // const randomColor = tinycolor.random().toHexString()
  // const colors = tinycolor(randomColor).analogous(numOfBursts)
  // const colors = tinycolor(randomColor).monochromatic(numOfBursts)

  Array(numOfBursts).fill('').forEach((item, index) => {
    const burst = createRandomBurst({
      color: colors[index].toHexString()
    })

    app.scene.add(burst)
  })
}
const addRings = (numOfRings) => {
  // const randomColor = tinycolor.random().toHexString()
  // const colors = tinycolor(randomColor).analogous(numOfRings)
  // const colors = tinycolor(randomColor).monochromatic(numOfRings)

  Array(numOfRings).fill('').forEach((item, index) => {
    const burst = createRandomRing({
      color: colors[index].toHexString()
    })

    app.scene.add(burst)
  })
}
const app = new App({
  controls,
  onStart: () => {
  },
  onAnimate: () => {
  }
})

addBursts(24)
addRings(12)
