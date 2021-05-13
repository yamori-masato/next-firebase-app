import firebase from 'firebase/app'

export type Question = {
  id: string
  senderUid: string
  receiverUid: string
  body: string
  isReplied: boolean
  createdAt: firebase.firestore.Timestamp
}