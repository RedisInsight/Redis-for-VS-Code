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
}
