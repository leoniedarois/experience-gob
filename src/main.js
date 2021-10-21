import './styles/styles.css'
import GenerativeArt from './GenerativeArt'

const button = document.getElementById('buttonId')
const screenButton = document.getElementById('screenButtonId')
const popin = document.getElementById('popinId')
const mouse = {x: 0, y: 0}

let canvas
let art = new GenerativeArt()

window.addEventListener('mousemove', (event) => {
  mouse.x = event.x
  mouse.y = event.y
})

window.onload = () => {
  canvas = document.getElementById('canvas')
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  art.init({ canvas })
}

button.addEventListener('click', () => {
  art.onClick()
  popin.classList.add('hide')
  screenButton.classList.remove('hide')
})
