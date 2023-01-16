import { saveAs } from 'file-saver'
import { compressImage } from './compressImage'
import JSZip from 'jszip'
// import { billboardImage } from './data'
import axios from 'axios'
import { useEffect, useRef } from 'react'
// import { fetchImageData } from './fetchData'
import './App.css'

// const baseURL = 'https://lkstorageprod.blob.core.windows.net/lkmediadata-prod/'
const mediaLinkProd =
  'https://lkstorageprod.blob.core.windows.net/lkmediadata-prod/'
const mediaLinkDev =
  'https://lkstoragedev.blob.core.windows.net/lkmediadata-dev/'

export default function App() {
  const zip = new JSZip()

  const textAreaRef = useRef()
  const limitSizeToCompress = useRef()

  const urlToCompressBlob = async (url, mediaLink) => {
    try {
      const config = { url, method: 'get', responseType: 'blob' }
      const blob = await axios.request(config)
      // console.log('res', blob.data)

      console.log('limitSizeToCompress', limitSizeToCompress.current.value)

      const fileName = url.split(mediaLink).pop()

      if (blob.data.size < +limitSizeToCompress.current.value * 1024) {
        zip.file(fileName, blob.data)
        return
      }

      const compressFile = await compressImage(blob.data)

      zip.file(fileName, compressFile)

      return compressFile
    } catch (error) {
      console.log('error', error)
    }
  }

  const fetchImage = async (data, mediaLink) => {
    for (let i = 0; i < data.length; i++) {
      await urlToCompressBlob(data[i], mediaLink)
    }

    zip.generateAsync({ type: 'blob' }).then(function (content) {
      saveAs(content, 'image-list-compressed.zip')
    })
  }

  const handleDownloadCompressImage = (type) => {
    // if (type === 'input') {
    //   console.log('textAreaRef', JSON.parse(textAreaRef.current.value))
    //   return
    // }

    const mediaLink = type === 'dev' ? mediaLinkDev : mediaLinkProd
    const inputData = JSON.parse(textAreaRef.current.value)

    const data = [...inputData].filter(
      (item) =>
        item.includes(mediaLink) &&
        !item.slice(-4).toLowerCase().includes('.mp4')
    )

    fetchImage(data, mediaLink)
  }

  return (
    <div className="app">
      <div className="options-container">
        <label htmlFor="limit-size-to-compress">
          Nén file có kích thước lớn hơn ... kb
        </label>
        <input
          ref={limitSizeToCompress}
          defaultValue={400}
          max={1000}
          type="number"
          name="limit-size-to-compress"
          id="limit-size-to-compress"
        />
      </div>
      <textarea ref={textAreaRef} />
      <div className="btn-container">
        <button onClick={() => handleDownloadCompressImage('dev')}>
          Download image - Dev
        </button>
        <button onClick={() => handleDownloadCompressImage('prod')}>
          Download image - Prod
        </button>
        {/* <button onClick={() => handleDownloadCompressImage('input')}>
          Download InputLink
        </button> */}
      </div>
    </div>
  )
}
