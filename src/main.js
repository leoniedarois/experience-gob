import './styles/styles.css'

const windowSize = {
  width: window.innerWidth || document.body.clientWidth,
  height: window.innerHeight || document.body.clientHeight
}

const canvas = document.createElement('canvas')
canvas.width = windowSize.width
canvas.height = windowSize.height
canvas.style.width = windowSize.width
canvas.style.height = windowSize.height

const ctx = canvas.getContext('2d')

const gameLoop = () => {
  ctx.fillStyle = 'yellow'
  ctx.fillRect(0,0,windowSize.width,windowSize.height)
}

document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app')
  app.append(canvas)
  gameLoop()
})
