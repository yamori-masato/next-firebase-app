import { useRouter } from 'next/router'
import { FormEvent, useEffect, useState } from 'react'
import { User } from '../../models/User'
import firebase from 'firebase/app'
import Layout from '../../components/Layout'
import { toast } from 'react-toastify'

type Query = {
  uid: string
}

// uidに対応するユーザの質問ページ
const UserShow = () => {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  const query = router.query as Query
  const [body, setBody] = useState('')
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    if (!query.uid) {
      return
    }

    async function loadUser() {
      const doc = await firebase
        .firestore()
        .collection('user')
        .doc(query.uid)
        .get()
      
      if (!doc.exists) {
        return
      }

      const gotUser = doc.data() as User
      gotUser.uid = doc.id
      setUser(gotUser)
    }
    loadUser()
  }, [query.uid])

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    setIsSending(true)
    e.preventDefault()

    await firebase.firestore().collection('questionis').add({
      senderUid: firebase.auth().currentUser.uid,
      receivedUid: user.uid,
      body,
      isReplied: false,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    })

    setBody('')
    toast.success('質問を送信しました。', {
      position: 'bottom-left',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    })
    setIsSending(false)
  }

  return (
    <Layout>
      {user && (
        <div className="text-center">
          <h1 className="h4">{user.name}さんのページ</h1>
          <div className="m-5">{user.name}さんに質問しよう！</div>
        </div>
      )}
      <div className="row justify-content-center mb-3">
        <div className="col-12 col-md-6">
          <form onSubmit={onSubmit}>
            <textarea
              className="form-control"
              placeholder="おげんきですか？"
              rows={6}
              value={body}
              onChange={e => setBody(e.target.value)}
              required
            ></textarea>
            <div className="m-3">
              {isSending ? (
                <div className="spinner-border text-secondary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              ) : (
                <button type="submit" className="btn btn-primary">
                  質問を送信する
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </Layout>
    
  )
}

export default UserShow