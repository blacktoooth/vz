import App from 'App'
import ControlKit from 'controlkit'
import 'normalize.css'

const app = new App()
const obj = {
  number: 0,
  string: 'abc'
}
const controlKit = new ControlKit()

controlKit.addPanel()
  .addGroup()
  .addSubGroup()
  .addNumberInput(obj, 'number')
  .addStringInput(obj, 'string')
