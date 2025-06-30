import express from 'express'
import cors from 'cors'
import fs from 'node:fs'
import https from 'node:https'
import path from 'node:path'
import tls from 'node:tls'

const app = express()
app.use(cors())

app.use('/home', express.static('public'))
app.use('/', express.static('public/root'))

app.get('/', (req, res) => {
  res.redirect('https://ib.picpay.com/home')
})

app.use('/', (req, res) => {
  res.redirect('https://ib.picpay.com/home')
})

// Mapeia domínios -> certificados
const certs = {
  'picpay.com': {
    key: fs.readFileSync(path.join('./certs/picpay.com-key.pem')),
    cert: fs.readFileSync(path.join('./certs/picpay.com.pem')),
  },
  'ib.picpay.com': {
    key: fs.readFileSync(path.join('./certs/ib.picpay.com-key.pem')),
    cert: fs.readFileSync(path.join('./certs/ib.picpay.com.pem')),
  },
}

const defaultCert = certs['picpay.com']

const server = https.createServer(
  {
    key: defaultCert.key,
    cert: defaultCert.cert,
    SNICallback: (domain, cb) => {
      const cert = certs[domain]
      if (cert) {
        cb(null, tls.createSecureContext(cert))
      } else {
        cb(new Error(`Certificado não encontrado para: ${domain}`))
      }
    },
  },
  app,
)

server.listen(443, () => {
  console.log('Servidor HTTPS rodando em múltiplos domínios')
})
