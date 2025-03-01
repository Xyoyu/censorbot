let currentTimeout: number
import { Utils } from './Utils'

export class Logger {
  static log (from: string, message: string) {
    console.log(`%c[${from}]%c ${message}`, 'color: purple; font-weight: bold', '')
  }

  static async tell (message: string): Promise<void> {
    const toast = document.getElementById('toast')    
    if (currentTimeout) {
      clearInterval(currentTimeout)
      toast.setAttribute('gone', '') 
      await Utils.wait(300)
    }   
    toast.innerText = message
    toast.removeAttribute('gone')   
    currentTimeout = setTimeout(() => {
      toast.setAttribute('gone', '')
      currentTimeout = null
    }, 5000) as unknown as number
  }

  static connectionStatus (connected: boolean) {
    const elm = document.getElementById('connection')

    if (connected) elm.setAttribute('hidden', '')
    else elm.removeAttribute('hidden')
  }
}

window.LOGGER = Logger
