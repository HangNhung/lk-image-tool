import { saveAs } from 'file-saver'
import { compressImage } from './compressImage'
import JSZip from 'jszip'
// import { billboardImage } from './data'
import axios from 'axios'
import { useRef, useState } from 'react'
// import { fetchImageData } from './fetchData'
import './App.css'

const mediaLinkProd =
  'https://lkstorageprod.blob.core.windows.net/lkmediadata-prod/'
const mediaLinkDev =
  'https://lkstoragedev.blob.core.windows.net/lkmediadata-dev/'

export default function App() {
  const zip = new JSZip()

  const [loading, setLoading] = useState(false)
  const [loadingPercent, setLoadingPercent] = useState(0)

  const textAreaRef = useRef()
  const limitSizeToCompress = useRef()

  const urlToCompressBlob = async (url, mediaLink, type) => {
    try {
      const config = { url, method: 'get', responseType: 'blob' }
      const blob = await axios.request(config)

      const fileName =
        type === 'all'
          ? url.includes(mediaLinkProd)
            ? url.split(mediaLinkProd).pop()
            : url.split(mediaLinkDev).pop()
          : url.split(mediaLink).pop()

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

  const fetchImage = async (data, mediaLink, type) => {
    setLoading(true)
    for (let i = 0; i < data.length; i++) {
      setLoadingPercent(Math.floor((i / data.length) * 100))
      await urlToCompressBlob(data[i], mediaLink, type)
    }

    zip.generateAsync({ type: 'blob' }).then(function (content) {
      setLoading(false)
      saveAs(content, `image-list-${type}.zip`)
    })
  }

  const handleDownloadCompressImage = (type) => {
    const mediaLink = type === 'dev' ? mediaLinkDev : mediaLinkProd
    const inputData = JSON.parse(textAreaRef.current.value)

    const data = [...inputData].filter((item) =>
      type === 'all'
        ? (item.includes(mediaLinkDev) || item.includes(mediaLinkProd)) &&
          !item.slice(-4).toLowerCase().includes('.mp4')
        : item.includes(mediaLink) &&
          !item.slice(-4).toLowerCase().includes('.mp4')
    )

    fetchImage(data, mediaLink, type)
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
      <p>
        Copy nguyên cái json trả về bỏ vô bên dưới (có dấu "[]") - danh sách url
        image
      </p>
      <textarea ref={textAreaRef} />
      <div className="btn-container">
        <button onClick={() => handleDownloadCompressImage('dev')}>
          Download image - Dev
        </button>
        <button onClick={() => handleDownloadCompressImage('prod')}>
          Download image - Prod
        </button>
        <button onClick={() => handleDownloadCompressImage('all')}>
          Download All
        </button>
      </div>
      {loading ? (
        <p className="loading-text">Loading {loadingPercent}%</p>
      ) : null}
    </div>
  )
}
