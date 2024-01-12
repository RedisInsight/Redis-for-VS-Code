import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

dotenv.config({ path: path.join(__dirname, '..', '.env') });
const bootstrapFilePath = path.join(__dirname, '..', 'dist', 'server', 'bootstrapBackend.js')

const replaceEnvVariables = () => {
  if (fs.existsSync(bootstrapFilePath)) {
    fs.readFile(bootstrapFilePath, 'utf8', function (err, data) {
      if (err) {
        return console.log(err);
      }
      const result = data
        .replace(/process.env.RI_BASE_API_URL/g, `"${process.env.RI_BASE_API_URL}"`)
        .replace(/process.env.RI_API_PORT/g, `"${process.env.RI_API_PORT}"`)
        .replace(/process.env.RI_API_PREFIX/g, `"${process.env.RI_API_PREFIX}"`)
        .replace(/process.env.RI_API_FOLDER/g, `"${process.env.RI_API_FOLDER}"`)

      fs.writeFile(bootstrapFilePath, result, 'utf8', function (err) {
        if (err) return console.log(err);
      });
    });
  } else {
    console.log('Can\'t find bootstrap file!')
  }
}

replaceEnvVariables()