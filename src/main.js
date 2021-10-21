import './styles/styles.css'
import GenerativeArt from "./GenerativeArt";

const button = document.getElementById('buttonId')
const mouse = {x: 0, y: 0}

let canvas
let art = new GenerativeArt()

// todo: instanciate your constructor here
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
})
