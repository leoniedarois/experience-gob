import './styles/styles.css'
import * as dat from 'dat.gui'

const gui = new dat.GUI()
gui.close()

const audioContext = new AudioContext()
const analyzer = audioContext.createAnalyser()
analyzer.fftSize = 1024

class GenerativeArt {
  #ctx
  #width
  #height
  constructor() {
    this.#ctx = null
    this.#width = 0
    this.#height = 0
    this.cellSize = 25
    this.radius = 0
    this.vr = 0.03
    this.zoomX = 0.01
    this.zoomY = 0.01
    this.lineLength = 150
    this.gradient = null
    this.averageActivity = 0
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

  createGradient = () => {
    this.gradient = this.#ctx.createLinearGradient(0, 0, this.#width, this.#height)
    this.gradient.addColorStop("0.1", '#00E3DF')
    this.gradient.addColorStop("0.9", '#7421FC')
    this.#ctx.strokeStyle = this.gradient
  }

  drawLine = (angle, x, y) => {
    if (this.averageActivity > 0) {
      let length = Math.max(0, this.averageActivity)

      this.#ctx.beginPath()
      this.#ctx.moveTo(x, y)
      this.#ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length)
      this.#ctx.stroke()
    }
  }

  getAudio() {
    navigator.mediaDevices
      .getUserMedia({audio: true})
      .then(s => {
        const micro = audioContext.createMediaStreamSource(s)
        micro.connect(analyzer)
        const getSpectrum = () => {
          const frequencyCount = analyzer.frequencyBinCount
          const timeData = new Uint8Array(frequencyCount)
          analyzer.getByteFrequencyData(timeData)

          let sum = 0;
          for (let i = timeData.length - 1; i >= 0; i--) {
            sum += timeData[i]
          }

          this.averageActivity = sum / timeData.length
          this.generateLines(0)

          requestAnimationFrame(getSpectrum.bind(this))
        }
        getSpectrum()
      })
  }

  generateLines() {
    this.#ctx.clearRect(0, 0, this.#width, this.#height)
    this.#ctx.fillStyle = 'black'
    this.#ctx.fillRect(0, 0, this.#width, this.#height)
    this.radius += this.vr
    if (this.radius > 15 || this.radius < -15) this.vr *= -1
    for (let y = 0; y < this.#height; y += this.cellSize) {
      for (let x = 0; x < this.#width; x += this.cellSize) {
        const angle = (Math.cos(x * this.zoomX) + Math.sin(y * this.zoomY)) * this.radius
        this.drawLine(angle, x, y)
      }
    }
  }

  init({ canvas }) {
    this.#width = canvas.width
    this.#height = canvas.height
    this.#ctx = canvas.getContext('2d')
    this.createGradient()
  }

  onClick() {
    audioContext.resume().then(() => {
      this.getAudio()
      this.gui()
    })
  }
}

export default GenerativeArt
