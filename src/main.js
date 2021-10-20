import './styles/styles.css'
import * as dat from 'dat.gui'
import regeneratorRuntime from 'regenerator-runtime';

const gui = new dat.GUI()

let canvas
let ctx
let art
let generateArtAnimation
let generateAudio
let drawTimeData

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
  art.getAudio()
  art.generate(0)
  art.gui()
}

window.addEventListener('resize', () => {
  cancelAnimationFrame(generateArtAnimation)
  cancelAnimationFrame(generateAudio)
  cancelAnimationFrame(drawTimeData)
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  art = new GenerativeArt(ctx, canvas.width, canvas.height)
  art.getAudio()
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
    this.gradient.addColorStop("0.1", '#04CCC9')
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

  getAudio = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const audioCtx = new AudioContext()
    this.analyzer = audioCtx.createAnalyser()
    const source = audioCtx.createMediaStreamSource(stream)
    source.connect(this.analyzer)

    // How much data should we collect
    this.analyzer.fftSize = 2 ** 10
    //console.log(this.analyzer)
    // pull the data off the audio
    const timeData = new Uint8Array(this.analyzer.frequencyBinCount)
    //console.log('time', timeData)
    const frequencyData = new Uint8Array(this.analyzer.frequencyBinCount)
    //console.log('fr', frequencyData)
    this.analyzer.getByteTimeDomainData(timeData)
    console.log('ici', timeData)

    //art.drawTimeData(timeData)
    generateAudio = requestAnimationFrame(this.getAudio.bind(this))
  }

  drawTimeData(timeData) {
    this.analyzer.getByteTimeDomainData(timeData);

    console.log('ici', timeData)
    // call itself as soon as possible
    drawTimeData = requestAnimationFrame(this.drawTimeData.bind(this))
  }
  generate(timeStamp) {
    const deltaTime = timeStamp - this.lastTime
    this.lastTime = timeStamp

    if (this.timer > this.interval) {
      // this.angle += 0.1
      // permet d'avoir des beaux enchainements si commenter
      this.#ctx.clearRect(0, 0, this.#width, this.#height)
      this.radius += this.vr
      // pour que ça boucle
      if(this.radius > 15 || this.radius < -15) this.vr *= -1
      // this.#drawLine(this.#width/2 + Math.sin(this.angle) * 100,this.#height/2 + Math.cos(this.angle) * 100)
      // this.#drawLine(this.#width / 2, this.#height / 2)
      // this.gamepad = this.radius += navigator.getGamepads()[0] !== null ? navigator.getGamepads()[0].axes[0] * 10 : this.radius

      // navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
      //   source = audioCtx.createMediaStreamSource(stream)
      //   //source.connect(gainNode)
      //  // gainNode.connect(audioCtx.destination)
      //   console.log('work', source)
      // }).catch(function(err) {
      //   console.log('sorry, an error occured', err.name + ": " + err.message)
      // })

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
