import axios, { AxiosRequestConfig } from 'axios'

import basUrl from '../baseU.js'

import { IPrintOrder } from 'interfaces/print-order'

export const requestPrintOffline = (order): Promise<string> => {
  return new Promise((resolve, reject) => {
    console.log(order)
    resolve('Thanks')
  })
}

export const requestPrint = (order: IPrintOrder): Promise<string> => {
  return new Promise((resolve, reject) => {
    const config: AxiosRequestConfig = {
      method: 'post',
      baseURL: basUrl,
      url: '/print',
      headers: {
        'Content-Type': 'application/json',
      },
      data: JSON.stringify(order),
    }
    axios(config)
      .then(function (response) {
        if (response.data.success) {
          resolve(response.data)
        } else reject()
      })
      .catch(function (error) {
        reject()
      })
  })
}

export const getPrinters = (): Promise<object[]> => {
  return new Promise((resolve, reject) => {
    const config: AxiosRequestConfig = {
      method: 'get',
      baseURL: basUrl,
      url: '/getprinters',
      headers: {},
    }
    axios(config)
      .then(function (response) {
        if (!response.data) {
          //   setIsError(true)
          return reject()
        }
        if (response.data.printers.length === 0) {
          return reject
        } else {
          // console.log(response.data)
          let printersArr = []
          response.data.printers.forEach((p) => {
            let printer = { name: p.name }
            printersArr.push(printer)
          })
          // console.log(printersArr)
          resolve(printersArr)
        }
      })
      .catch(function (error) {
        console.log(error)
        // setIsError(true)
        reject()
      })
  })
}
