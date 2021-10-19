import './styles/styles.css'

let canvas
let ctx
let art
let generateArtAnimation

const mouse = {
  x: 0,
  y: 0
}
window.addEventListener('mousemove', (event) => {
  mouse.x = event.offsetX
  mouse.y = event.offsetY
})

window.onload = () => {
  canvas = document.getElementById('canvas1')
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  ctx = canvas.getContext('2d')
  art = new GenerativeArt(ctx, canvas.width, canvas.height)
  art.generate(0)
}

window.addEventListener('resize', () => {
  cancelAnimationFrame(generateArtAnimation)
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  art = new GenerativeArt(ctx, canvas.width, canvas.height)
  art.generate(0)
})

class GenerativeArt {
  #ctx
  #width
  #height
  constructor(ctx, width, height) {
    this.#ctx = ctx
    this.#ctx.lineWidth = 1
    // this.#ctx.strokeStyle = 'white'
    this.#width = width
    this.#height = height
    // this.angle = 0
    this.lastTime = 0
    this.interval = 1000/60
    this.timer = 0
    //espace entre les lines (3 c trop beau)
    this.cellSize = 15
    this.gradient
    this.radius = 0
    this.vr = 0.03
    this.#createGradient()
    this.#ctx.strokeStyle = this.gradient
  }

  #createGradient = () => {
    this.gradient = this.#ctx.createLinearGradient(0, 0, this.#width, this.#height)
    this.gradient.addColorStop("0.1", '#04CCC9')
    this.gradient.addColorStop("0.9", '#7421FC')
  }

  #drawLine = (angle, x, y) => {
    let positionX = 10
    let positionY = 10
    let dx = mouse.x - positionX
    let dy = mouse.y - positionY
    let distance = dx * dy + dy * dy
    console.log(dx, dy, distance)
    if (distance > 100000) distance = 50000
    //else if (distance < 50000) distance = 50000
    // size of the line
    let length = distance/1000

    this.#ctx.beginPath()
    // this.#ctx.lineTo(x + length, y + length)
    // fonctionne avec la souris
    // this.#ctx.lineTo(mouse.x, mouse.y)
    this.#ctx.moveTo(x, y)
    this.#ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length)
    this.#ctx.stroke()
  }

  generate(timeStamp) {
    const deltaTime = timeStamp - this.lastTime
    this.lastTime = timeStamp

    if (this.timer > this.interval) {
      // this.angle += 0.1
      // permet d'avoir des beaux enchainements si commenter
      this.#ctx.clearRect(0, 0, this.#width, this.#height)
      this.radius += this.vr
      if(this.radius > 5 || this.radius < -5) this.vr *= -1
      // this.#drawLine(this.#width/2 + Math.sin(this.angle) * 100,this.#height/2 + Math.cos(this.angle) * 100)
      // this.#drawLine(this.#width / 2, this.#height / 2)

      for (let y = 0; y < this.#height; y += this.cellSize) {
        for (let x = 0; x < this.#width; x += this.cellSize) {
          const angle = (Math.cos(x * 0.01) + Math.sin(y * 0.01)) * this.radius
          this.#drawLine(angle ,x, y)
        }
      }
      this.timer = 0
    } else {
      this.timer += deltaTime
    }

    //console.log(deltaTime)
    generateArtAnimation = requestAnimationFrame(this.generate.bind(this))
  }
}
