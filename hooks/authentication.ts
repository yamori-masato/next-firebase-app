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
    console.log('Start useEffect')

    firebase
      .auth()
      .signInAnonymously()
      .catch((error) => {
        console.error(error)
      })

    firebase.auth().onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        console.log('Set user')
        setUser({
          uid: firebaseUser.uid,
          isAnonymous: firebaseUser.isAnonymous,
        })
      } else {
        // User is signed out.
        setUser(null)
      }
    })
  }, [])

  return { user }
}
