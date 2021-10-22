const express = require('express')
const cors = require('cors')
const app = express()
const port = 3000
const corsOption = {
  origin: '*'
}
app.use(express.json())
app.use(cors(corsOption))

const files = []

app.get('/canvas', (req, res) => {
  res.send(files)
})

app.post('/canvas', (req, res) => {
  const result = {
    screenshot: req.body.screenshot
  }
  files.push(result)
  res.json(req.body)
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
