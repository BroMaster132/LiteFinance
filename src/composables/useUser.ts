import {
  collection,
  getDocs,
  addDoc,
  type DocumentData,
  getDoc,
  doc,
  setDoc,
} from 'firebase/firestore'
import { db, storage } from '@/firebase'
import { getStorage, uploadBytes, getDownloadURL } from 'firebase/storage'
import { ref, computed, watch } from 'vue'
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { signInWithEmailAndPassword } from 'firebase/auth'

const auth = getAuth()

const user = ref()
const userList = ref([] as DocumentData)

const loading = ref({
  user: false,
  userList: false,
})

const userToObject = computed(() => {
  if (user.value) {
    return {
      uid: user.value.uid,
      email: user.value.email,
      displayName: user.value.displayName,
      photoURL: user.value.photoURL,
      favourites: user.value.favourites ?? [],
      status: user.value.status ?? 'user',
      reviews: user.value.reviews ?? [],
    }
  }
  return null
})

export const useUser = () => {
  const auth = getAuth()

  // войти с помощью окна гугл
  function googleRegister() {
    const provider = new GoogleAuthProvider()

    signInWithPopup(auth, provider)
      .then(async (userCredential) => {
        user.value = userCredential.user

        // проверка первый ли раз он зашел
        await addUserToMainDatabase()

        // достаем данные если не первый раз
        await getFromMainDatabase()

        // добавляем в локал сторадж
        addToLocalStorage()
      })
      .catch((error) => {
        console.error(error)
      })
  }
  function initAuthListener() {
    if (authInitialized) return
    authInitialized = true

    onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // юзер залогинен в Firebase
        user.value = firebaseUser
        addToLocalStorage()
      } else {
        // юзер вышел
        user.value = null
        removeFromLocalStorage()
      }
    })
  }

  async function addUserToMainDatabase() {
    loading.value.user = true
    try {
      if (userToObject.value) {
        await getAllUsers()
        if (!checkUserInDatabase()) {
          await addDoc(collection(db, 'users'), userToObject.value)
        } else {
          console.error('User already in database')
        }
      }
      loading.value.user = false
    } catch (error) {
      console.error(error)
    }
  }

  // получить всех юзеров
  async function getAllUsers() {
    loading.value.userList = true
    try {
      const querySnapshot = await getDocs(collection(db, 'users'))
      querySnapshot.forEach((doc) => {
        userList.value.push(doc.data())
      })
      loading.value.userList = false
    } catch (error) {
      console.error(error)
    }
  }

  // проверка есть ли юзер в базе данных
  function checkUserInDatabase() {
    return userList.value.some((item: any) => item.uid === userToObject.value?.uid)
  }

  // получить данные из базы данных
  async function getFromMainDatabase() {
    await getAllUsers()
    user.value = userList.value.find((item: any) => item.uid === user.value?.uid)
  }

  // обновить данные в базе данных
  async function updateUserInDatabase() {
    if (user.value) {
      try {
        const userDocRef = doc(db, 'users', user.value.uid)
        const existingUserDoc = await getDoc(userDocRef)
        if (existingUserDoc.exists()) {
          const userData = existingUserDoc.data()
          const updatedData = {
            ...userData,
            ...user.value,
          }
          await setDoc(userDocRef, updatedData)
        }
      } catch (error) {
        console.error(error)
      }
    }
  }
  let authInitialized = false

  function addToLocalStorage() {
    if (user.value) {
      localStorage.setItem('user', JSON.stringify(user.value))
    }
  }

  function getUserFromLocalStorage() {
    const userFromLocalStorage = localStorage.getItem('user')
    if (userFromLocalStorage) {
      user.value = JSON.parse(userFromLocalStorage)
    }
  }

  function removeFromLocalStorage() {
    localStorage.removeItem('user')
  }

  // выйти из гугла
  function googleLogout() {
    auth.signOut()
    user.value = null

    // удаляем из локал сторадж
    removeFromLocalStorage()
  }

  async function createUser(email: string, password: string) {
    // 1. Валидация email (синтаксис)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/

    if (!emailRegex.test(email)) {
      const error: any = new Error('Invalid email format')
      error.code = 'custom/invalid-email-format'
      throw error
    }

    // 2. Валидация пароля по политике Firebase (скрин)
    const errors: string[] = []

    if (password.length < 6) {
      errors.push('at least 6 characters')
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('an uppercase letter')
    }
    if (!/[a-z]/.test(password)) {
      errors.push('a lowercase letter')
    }

    if (errors.length > 0) {
      const error: any = new Error('Password does not meet requirements')
      error.code = 'custom/weak-password'
      error.details = errors
      throw error
    }

    // 3. Создание пользователя в Firebase Auth
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      user.value = userCredential.user
      addToLocalStorage()
    } catch (error) {
      // auth/email-already-in-use и т.п. пойдут выше
      throw error
    }
  }

  async function loginUser(email: string, password: string) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/

    if (!emailRegex.test(email)) {
      const error: any = new Error('Invalid email format')
      error.code = 'custom/invalid-email-format'
      throw error
    }

    if (!password) {
      const error: any = new Error('Password is required')
      error.code = 'custom/empty-password'
      throw error
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      user.value = userCredential.user
      addToLocalStorage()
    } catch (error: any) {
      throw error
    }
  }

  function initAuthListener() {
    if (authInitialized) return
    authInitialized = true

    onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        user.value = firebaseUser
        addToLocalStorage()
      } else {
        user.value = null
        removeFromLocalStorage()
      }
    })
  }

  return {
    user,
    loading,
    googleRegister,
    googleLogout,
    getAllUsers,
    userToObject,
    userList,
    addToLocalStorage,
    getUserFromLocalStorage,
    removeFromLocalStorage,
    createUser,
    loginUser,
    initAuthListener,
  }
}
