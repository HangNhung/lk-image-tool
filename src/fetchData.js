const baseURL = 'https://lk-backend-dev.azurewebsites.net/api/'

export const fetchImageData = async (url) => {
  try {
    const res = await fetch(`${baseURL}${url}`)

    return res
  } catch (error) {
    console.log('error', error)
  }
}
