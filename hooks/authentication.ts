import { useEffect } from 'react'
import firebase from 'firebase/app'
import { User } from '../models/User'
import { atom, useRecoilState } from 'recoil'

const userState = atom<User>({
  key: 'user',
  default: null,
})


export function useAuthentication() {
  const [user, setUser] = useRecoilState(userState)

  useEffect(() => {
    if (user !== null) {
      return
    }

    firebase
      .auth()
      .signInAnonymously()
      .catch((error) => {
        console.error(error)
      })

    firebase.auth().onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        const loginUser: User = {
          uid: firebaseUser.uid,
          isAnonymous: firebaseUser.isAnonymous,
          name: '',
        }
        setUser(loginUser)
        createUserIfNotFount(loginUser)
      } else {
        // User is signed out.
        setUser(null)
      }
    })
  }, [])

  return { user }
}

async function createUserIfNotFount(user: User) {
  const userRef = firebase.firestore().collection('user').doc(user.uid)
  const doc = await userRef.get()
  if (doc.exists) {
    return
  }

  await userRef.set({
    name: 'taro' + new Date().getTime()
  })
}
