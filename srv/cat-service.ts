import cds from '@sap/cds'
import { Books, ExcelUpload } from '#cds-models/CatalogService'
import { PassThrough } from 'stream'
import * as XLSX from 'xlsx'

export class CatalogService extends cds.ApplicationService {
  init() {

    this.on('PUT', ExcelUpload, async (req, next) => {
      if (!req.data.excel) {
        return next()
      } 
      else {
        // var entity = req.headers.slug;
        const stream = new PassThrough()
        let buffers: Buffer[] = []
        req.data.excel.pipe(stream)
        await new Promise((resolve, reject) => {
          stream.on('data', (chunk) => {
            buffers.push(chunk)
          })
          stream.on('end', async () => {
            const buffer = Buffer.concat(buffers)
            const workbook = XLSX.read(buffer, { type: 'buffer' })
            let data: object[] = []
            const sheets = workbook.SheetNames
            for (let i = 0; i < sheets.length; i++) {
              const temp = XLSX.utils.sheet_to_json(
                workbook.Sheets[sheets[i]], { rawNumbers: false, dateNF: 'yyyy-mm-dd' })

              temp.forEach((res, index) => {
                if (index === 0) {
                  return
                }
                data.push(JSON.parse(JSON.stringify(res)))
              })
            }
            if (data) {
              console.log('Data to be saved:', data)
              const responseCall = await saveBooks(data)
              if (responseCall == -1) {
                req.error(400, 'Error while saving data')
              } else {
                resolve(req.notify(200, 'Upload Successful'))
              }
            }            
          })
        })

      } 
    })

    return super.init()
  }
}

async function saveBooks(data: object[]): Promise<any> {
  const insertQuery = INSERT.into(Books).entries(data)
  const insertResult = await cds.run(insertQuery)
  return insertResult
}
