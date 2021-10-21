import './styles/styles.css'
import * as dat from 'dat.gui'

const gui = new dat.GUI()
const button = document.getElementById('buttonId')

let canvas
let ctx
let art
let generateArtAnimation
let generateAudio
let drawTimeData

const audioContext = new AudioContext()
const analyzer = audioContext.createAnalyser()

const mouse = {
  x: 0,
  y: 0
}

window.addEventListener('mousemove', (event) => {
  mouse.x = event.x
  mouse.y = event.y
})

window.onload = () => {
  canvas = document.getElementById('canvas')
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  ctx = canvas.getContext('2d')
  art = new GenerativeArt(ctx, canvas.width, canvas.height)
  art.generate(0)
  art.gui()
}

const getAudio = () => {
  navigator.mediaDevices
    .getUserMedia({ audio: true})
    .then(stream => {
      const micro = audioContext.createMediaStreamSource(stream)
      micro.connect(analyzer)

      analyzer.fftSize = 1024
      const timeData = new Uint8Array(analyzer.frequencyBinCount)

      analyzer.getByteFrequencyData(timeData);
      const frequencyCount = analyzer.frequencyBinCount
      console.log("frequencyCount",  frequencyCount)
      console.log("freqByteData.length",  timeData.length)

      let min = Infinity, max = -Infinity;
      for (let i = timeData.length - 1; i >= 0; i--) {
        min = Math.min(timeData[i], min);
        max = Math.max(timeData[i], max);
      }
      console.log("min:%d , max:%d", min, max);

    })
  generateAudio = requestAnimationFrame(getAudio)
}

button.addEventListener('click', () => {
  audioContext.resume().then(() => {
    getAudio()
    console.log('listen to the mic')
  });
})

window.addEventListener('resize', () => {
  cancelAnimationFrame(generateArtAnimation)
  cancelAnimationFrame(generateAudio)
  cancelAnimationFrame(drawTimeData)
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  art = new GenerativeArt(ctx, canvas.width, canvas.height)
  // art.getAudio()
  art.generate(0)
  art.gui()
})

class GenerativeArt {
  #ctx
  #width
  #height
  constructor(ctx, width, height) {
    this.#ctx = ctx
    this.#width = width
    this.#height = height
    this.#ctx.lineWidth = 1
    this.lastTime = 0
    this.interval = 1000/60
    this.timer = 0
    this.cellSize = 25
    this.gradient
    this.radius = 0
    this.vr = 0.03
    this.#createGradient()
    this.#ctx.strokeStyle = this.gradient
    this.zoomX = 0.01
    this.zoomY = 0.01
    this.lineLength = 150
    this.analyzer
  }

  // to change value on a easy way from the web
  gui = () => {
    gui.add(this.#ctx, 'lineWidth').min(1).max(10)
    gui.add(this, 'cellSize').min(7).max(50)
    gui.add(this, 'vr').min(0.03).max(1)
    gui.add(this, 'radius').min(0).max(10)
    gui.add(this, 'zoomX').min(0).max(10)
    gui.add(this, 'zoomY').min(0).max(10)
    gui.add(this, 'lineLength').min(15).max(300)
  }

  #createGradient = () => {
    this.gradient = this.#ctx.createLinearGradient(0, 0, this.#width, this.#height)
    this.gradient.addColorStop("0.1", '#00E3DF')
    this.gradient.addColorStop("0.9", '#7421FC')
  }

  #drawLine = (angle, x, y) => {
    let positionX = 10
    let positionY = 10
    let dx = mouse.x - positionX
    let dy = mouse.y - positionY
    let distance = dx * dy + dy * dy
    // console.log(dx, dy, distance)
    // if (distance > 100000) distance = 50000
    //else if (distance < 50000) distance = 50000
    let length = distance/3000

    this.#ctx.beginPath()
    this.#ctx.moveTo(x, y)
    this.#ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length)
    this.#ctx.stroke()
  }

  generate(timeStamp) {
    const deltaTime = timeStamp - this.lastTime
    this.lastTime = timeStamp

    if (this.timer > this.interval) {
      this.#ctx.clearRect(0, 0, this.#width, this.#height)
      this.radius += this.vr
      // pour que l'animation boucle
      if(this.radius > 15 || this.radius < -15) this.vr *= -1

      for (let y = 0; y < this.#height; y += this.cellSize) {
        for (let x = 0; x < this.#width; x += this.cellSize) {
          const angle = (Math.cos(x * this.zoomX) + Math.sin(y * this.zoomY)) * this.radius
          this.#drawLine(angle ,x, y)
        }
      }
      this.timer = 0
    } else {
      this.timer += deltaTime
    }
    generateArtAnimation = requestAnimationFrame(this.generate.bind(this))
  }
}
