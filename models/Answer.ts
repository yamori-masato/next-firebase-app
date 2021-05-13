import firebase from 'firebase/app'

export type Answer = {
  id: string
  uid: string
  questionId: string
  body: string
  createdAt: firebase.firestore.Timestamp
}