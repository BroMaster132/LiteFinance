import { deleteDoc, doc, collection, getDocs, addDoc, type DocumentData } from 'firebase/firestore'
import { db, storage } from '@/firebase'
import { getStorage, uploadBytes, getDownloadURL } from 'firebase/storage'
import { ref, computed } from 'vue'
import * as firebase from 'firebase/storage'
import { useUser } from './useUser'
import { createId} from '@/services/methods'

export const useContent = () => {
  const movie = ref(null)
  const movieList = ref([] as DocumentData)
  const newMovie = ref({
    name: '',
    url: '',
    image: '',
    rates: '',
    description: '',
    trailer: '',
    id: createId(),
  })

  const loading = ref({
    movie: false,
    movieList: false,
    newMovie: false
  })

  async function getAllMovies() {
    loading.value.movieList = true
    try {
      const querySnapshot = await getDocs(collection(db, 'movies'))
      movieList.value = querySnapshot.docs.map((doc) => doc.data())
      loading.value.movieList = false
    } catch (error) {
      console.error(error)
    }
  }

  async function getMovieById(id: number) {
    loading.value.movie = true
    try {
      const querySnapshot = await getDocs(collection(db, 'movies'))
      movie.value = querySnapshot.docs
        .map((doc) => doc.data())
        .find((item: any) => item.id === id)
      loading.value.movie = false
    } catch (error) {
      console.error(error)
    }
  }

  async function createMovie() {
    loading.value.newMovie = true
    try {
      if (newMovie.value) {
        await addDoc(collection(db, 'movies'), newMovie.value)
        loading.value.newMovie = false
      }
    } catch (error) {
      console.error(error)
    }
  }
  async function uploadImage(file : any) {
    console.log(file)
    const storage = getStorage()
    console.log(storage)
    const storageRef = firebase.ref(storage, 'movies/' + file.name)
    console.log(storageRef)

    uploadBytes(storageRef, file)
      .then(() => {
        console.log('Файл успешно загружен!')

        getDownloadURL(storageRef)
          .then((downloadURL) => {
            newMovie.value.image = downloadURL
            console.log(downloadURL);
          })
          .catch((error) => {
            console.error('Ошибка получения ссылки на загруженный файл:', error)
          })
      })
      .catch((error) => {
        console.error('Ошибка загрузки файла:', error)
      })
  }

  async function deleteMovie() {
    try {
      if (movie.value) {
        await deleteDoc(doc(db, 'movies', movie.value.id))
      }
    } catch (error) {
      console.error(error)
    }
  }

  return {
    movie,
    movieList,
    loading,
    getAllMovies,
    getMovieById,
    createMovie,
    deleteMovie,
    uploadImage,
    newMovie,
  }
}