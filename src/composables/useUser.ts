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
import { ref, computed } from 'vue'
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  updateEmail,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth'

const auth = getAuth()

const user = ref<any>()
const userList = ref<DocumentData[]>([])

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



let authInitialized = false

export const useUser = () => {
  const auth = getAuth()

  // sign in with Google popup
  async function googleRegister() {
    const provider = new GoogleAuthProvider()

    try {
      const userCredential = await signInWithPopup(auth, provider)
      user.value = userCredential.user

      await addUserToMainDatabase()
      await getFromMainDatabase()
      addToLocalStorage()
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  function initAuthListener() {
    if (authInitialized) return
    authInitialized = true

    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        user.value = firebaseUser
        addToLocalStorage()
        // pull extra data from Firestore if exists
        await getFromMainDatabase()
      } else {
        user.value = null
        removeFromLocalStorage()
      }
    })
  }

  // create/update user document with id = uid
  async function addUserToMainDatabase() {
    if (!userToObject.value) return
    loading.value.user = true
    try {
      const u = userToObject.value
      const userRef = doc(db, 'users', u.uid)
      await setDoc(
        userRef,
        {
          ...u,
        },
        { merge: true },
      )
    } catch (error) {
      console.error(error)
      throw error
    } finally {
      loading.value.user = false
    }
  }

  // get all users
  async function getAllUsers() {
    loading.value.userList = true
    userList.value = []
    try {
      const querySnapshot = await getDocs(collection(db, 'users'))
      querySnapshot.forEach((d) => {
        userList.value.push(d.data())
      })
    } catch (error) {
      console.error(error)
      throw error
    } finally {
      loading.value.userList = false
    }
  }

  // fetch current user's data from Firestore and merge into user.value
  async function getFromMainDatabase() {
    if (!user.value?.uid) return
    try {
      const userDocRef = doc(db, 'users', user.value.uid)
      const snap = await getDoc(userDocRef)
      if (snap.exists()) {
        const data = snap.data()
        user.value = {
          ...user.value,
          ...data,
        }
      } else {
        // if doc does not exist yet, create it
        await addUserToMainDatabase()
      }
    } catch (error) {
      console.error(error)
    }
  }

  // update whole Firestore doc from current user.value (rarely needed)
  async function updateUserInDatabase() {
    if (!user.value?.uid) return
    try {
      const userDocRef = doc(db, 'users', user.value.uid)
      await setDoc(userDocRef, { ...user.value }, { merge: true })
    } catch (error) {
      console.error(error)
    }
  }

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

  // google logout
  function googleLogout() {
    auth.signOut()
    user.value = null
    removeFromLocalStorage()
  }

  async function createUser(email: string, password: string) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/

    if (!emailRegex.test(email)) {
      const error: any = new Error('Invalid email format')
      error.code = 'custom/invalid-email-format'
      throw error
    }

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

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      user.value = userCredential.user
      addToLocalStorage()
      await addUserToMainDatabase()
      await getFromMainDatabase()
    } catch (error) {
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
      await getFromMainDatabase()
    } catch (error: any) {
      throw error
    }
  }

  type ChangeUserPayload = {
    name?: string
    email?: string
    newPassword?: string
    currentPassword?: string
  }

  async function changeUserCredentials(payload: ChangeUserPayload) {
    const currentUser = auth.currentUser
    if (!currentUser) {
      const err = new Error('No authenticated user')
      ;(err as any).code = 'no-auth-user'
      throw err
    }

    const { name, email, newPassword, currentPassword } = payload

    const wantNameChange =
      typeof name === 'string' &&
      name.trim() !== '' &&
      name !== currentUser.displayName

    const wantEmailChange =
      typeof email === 'string' &&
      email.trim() !== '' &&
      email !== currentUser.email

    const wantPasswordChange = !!newPassword

    if (!wantNameChange && !wantEmailChange && !wantPasswordChange) {
      const err = new Error('Nothing to update')
      ;(err as any).code = 'nothing-to-update'
      throw err
    }

    // re-auth if email or password changes
    if ((wantEmailChange || wantPasswordChange) && currentUser.email) {
      if (!currentPassword) {
        const err = new Error('Current password is required')
        ;(err as any).code = 'current-password-required'
        throw err
      }
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        currentPassword,
      )
      await reauthenticateWithCredential(currentUser, credential)
    }

    // 1) Name: Auth + Firestore
    if (wantNameChange && name) {
      await updateProfile(currentUser, { displayName: name })

      const userRef = doc(db, 'users', currentUser.uid)
      await setDoc(userRef, { name }, { merge: true })

      if (user.value) {
        user.value = {
          ...user.value,
          displayName: name,
          name,
        }
      }
    }

    // 2) Email: Auth + Firestore
    if (wantEmailChange && email) {
      await updateEmail(currentUser, email)

      const userRef = doc(db, 'users', currentUser.uid)
      await setDoc(userRef, { email }, { merge: true })

      if (user.value) {
        user.value = {
          ...user.value,
          email,
        }
      }
    }

    // 3) Password: Auth only
    if (wantPasswordChange && newPassword) {
      await updatePassword(currentUser, newPassword)
    }

    if (user.value) {
      addToLocalStorage()
    }
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
    changeUserCredentials,
    updateUserInDatabase,
  }
}
