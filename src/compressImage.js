import imageCompression from 'browser-image-compression'

export const compressImage = async (image) => {
  const options = {
    maxSizeMB: 0.2,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  }

  try {
    const compressedFile = await imageCompression(image, options)
    return compressedFile
  } catch (error) {
    console.log(error)
  }
}

export const urlExists = (url) => {
  const http = new XMLHttpRequest()
  // http.open('HEAD', url, false)
  http.open('GET', url, true)
  http.responseType = 'blob'
  http.send()
  return http.status != 404 ? http : false
}
