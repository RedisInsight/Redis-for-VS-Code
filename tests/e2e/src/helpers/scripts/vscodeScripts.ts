import { execSync } from 'child_process'

export class VScodeScripts {

  /**
   * Function to terminate specific Node processes
   * @param path - The path of node process
   */
  static terminateSpecificNodeProcesses(path: string) {
    try {
      // Find PIDs of Node processes matching the specific pattern
      const pids = execSync(`pgrep -f "node ${path}"`)
        .toString()
        .trim()
        .split('\n')

      if (pids.length > 0) {
        // Terminate processes with the found PIDs
        pids.forEach(pid => {
          execSync(`kill ${pid}`)
        })
      } else {
        console.log('No matching processes found.')
      }
    } catch (error: any) {
      console.error(
        `Error terminating specific Node processes: ${error.message}`,
      )
    }
  }

  /**
   * Function to terminate specific Node processes on Windows
   * @param path - The path of node process
   */
  static terminateSpecificNodeProcessesOnWindows(path: string) {
    try {
      // Find PIDs of Node processes matching the specific pattern
      const taskListOutput = execSync(`tasklist /FI "IMAGENAME eq node.exe" /FO CSV`)
        .toString()
        .trim()
        .split('\n')

      // Filter out Node processes related to the specific path
      const filteredProcesses = taskListOutput.filter(line =>
        line.includes(path)
      )

      if (filteredProcesses.length > 0) {
        // Extract PIDs and terminate processes
        filteredProcesses.forEach(process => {
          const processInfo = process.split(',')
          const pid = processInfo[1].replace(/"/g, '') // PID is in the second column
          execSync(`taskkill /PID ${pid} /F`)
        })
      } else {
        console.log('No matching processes found.')
      }
    } catch (error: any) {
      console.error(
        `Error terminating specific Node processes: ${error.message}`,
      )
    }
  }
}
