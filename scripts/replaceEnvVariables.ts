import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

dotenv.config({ path: path.join(__dirname, '..', '.env') });
const bootstrapFilePath = path.join(__dirname, '..', 'dist', 'server', 'bootstrapBackend.js')

const replaceEnvVariables = () => {
  if (fs.existsSync(bootstrapFilePath)) {
    fs.readFile(bootstrapFilePath, 'utf8', function (err, data) {
      if (err) {
        return console.debug(err);
      }
      // Get all project env variables
      const envVariables = Object.keys(process.env).filter((item) => item.includes('RI_'))
      // Create replace matrix object
      const envObject = [
        ...envVariables
      ].reduce((array, value) => ({ ...array, [`process.env.${value}`]: process.env[value] }), {})
      // Replace variables with values
      const result = replaceAll(data, envObject)
      // Write converted file
      fs.writeFile(bootstrapFilePath, result, 'utf8', function (err) {
        if (err) return console.debug(err);
      });
    });
  } else {
    console.debug('Can\'t find bootstrap file!')
  }
}

function replaceAll(inputData: string, replaceMatrix: { [key: string]: any }) {
  for (const record in replaceMatrix) {
    inputData = inputData.replace(new RegExp(record, 'g'), `"${replaceMatrix[record]}"`);
  }
  return inputData;
};

replaceEnvVariables()