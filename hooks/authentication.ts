import { useEffect } from 'react'
import firebase from 'firebase/app'
import { User } from '../models/User'
import { atom, useRecoilState } from 'recoil'

const userState = atom<User>({
  key: 'user',
  default: null,
})

// 匿名ログイン済みならログインユーザを返す
// 未ログインならログインし、ログインユーザを返す
// 未登録(firestoreに登録されていない(indexedDBに情報がない))なら、新規匿名登録して、ログインユーザを返す
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
        createUserIfNotFound(loginUser)
      } else {
        // User is signed out.
        setUser(null)
      }
    })
  }, [])

  return { user }
}

async function createUserIfNotFound(user: User) {
  const userRef = firebase.firestore().collection('users').doc(user.uid)
  const doc = await userRef.get()
  if (doc.exists) {
    return
  }

  await userRef.set({
    name: 'taro' + new Date().getTime()
  })
}
