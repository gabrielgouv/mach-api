import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin'
import * as moment from 'moment'
import * as rp from 'request-promise'
import * as AdmZip from 'adm-zip'


/* API Error Handler */
function errorHandler(err, res) {
  console.error(err)
  res.status(500).send('An internal error occurred')
}

// updateRPL
export const updateRpl = functions.https.onRequest(async (req, res) => {
  // Verifica se existe update para hoje
  rp(`http://portal.cgna.gov.br/files/abas/${moment().format('YYYY-MM-DD')}/painel_rpl/companhias/Cia_GLO_CS.txt`)
    .then((dados) => {
      console.log('Iniciando as atualizações')
      return admin.firestore().collection("rotas").get()
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            admin.firestore().collection("rotas").doc(doc.id).delete()
          })
        })
    })
    .then(() => {
      console.log("Banco de dados limpo com sucesso")
      const firs = ['SBAZ', 'SBBS', 'SBCW', 'SBRE']
      return new Promise(res => {
        firs.map(atualizaFIR)
        res()
      })
    })
    .then(() => {
      res.json({ msg: 'Atualizações concluídas com sucesso' })
    })
    .catch(err => errorHandler(err, res))
})

function atualizaFIR(fir) {
  rp({url: `http://portal.cgna.gov.br/files/abas/${moment().format('YYYY-MM-DD')}/painel_rpl/bdr/RPL${fir}.zip`, encoding: null})
    .then((body) => {
      const zip = new AdmZip(body)

      return zip.getEntries().forEach((zipEntry) => {
        if (zipEntry.entryName.indexOf('EOBT') !== -1) {
          const linhas = zip.readAsText(zipEntry.entryName).split("\n")

          // Define
    linhas.forEach((linha) => {
      if (linha.indexOf('EQPT') !== -1) {
          const id = linha.substr(25, 7).trim() + linha.substr(40, 4).trim() + linha.substr(linha.indexOf('EQPT') - 9, 4).trim() + linha.substr(44, 4).trim()
          
          admin.firestore().collection("rotas").doc(id).set({
              identificador: id,
              callsign: linha.substr(25, 7).trim(),
              datainicio: linha.substr(3, 6).trim(),
              datafinal: (linha.substr(10, 6).trim() === "UFN") ? null : linha.substr(10, 6).trim(),
              cia: linha.substr(25, 3).trim(),
              voo: parseInt(linha.substr(28, 4).trim()),
              aeronave: linha.substr(33, 4).trim(),
              esteira: linha.substr(38, 1).trim(),
              partida: linha.substr(40, 4).trim(),
              eobt: linha.substr(44, 4).trim(),
              velocidade: linha.substr(49, 5).trim(),
              dias: linha.substr(17, 8).trim(),
              fl: parseInt(linha.substr(55, 3).trim()),
              rota: linha.substr(59, linha.indexOf('EQPT') - 68).trim(),
              chegada: linha.substr(linha.indexOf('EQPT') - 9, 4).trim(),
              trecho: linha.substr(40, 4).trim() + linha.substr(linha.indexOf('EQPT') - 9, 4).trim(),
              eet: linha.substr(linha.indexOf('EQPT') - 5, 4).trim(),
              rmk: linha.substr(linha.indexOf('EQPT')).trim(),
              eqpt: linha.substr(linha.indexOf('EQPT')).trim().substr(5, linha.substr(linha.indexOf('EQPT')).trim().indexOf(' ') - 4).trim(),
              regra: verificaRegra(linha.substr(59, linha.indexOf('EQPT') - 68).trim())
          })
          .catch(err => console.error(err))
      }
  })
}

    })


    
    })
}


// Verifica a regra
function verificaRegra(rota) {
  if (rota.indexOf(' IFR ') !== -1)
      return 'Y'
  else if (rota.indexOf(' VFR ') !== -1)
      return 'Z'
  else
      return 'I'
}