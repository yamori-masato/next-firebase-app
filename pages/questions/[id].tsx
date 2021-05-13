import { useEffect, useState, FormEvent } from 'react'
import { useRouter } from 'next/router'
import firebase from 'firebase/app'
import Layout from '../../components/Layout'
import { Question } from '../../models/Question'
import { useAuthentication } from '../../hooks/authentication'
import { Answer } from '../../models/Answer'

type Query = {
  id: string
}

const QuestionsShow = () => {
  const router = useRouter()
  const query = router.query as Query
  const { user } = useAuthentication()
  const [question, setQuestion] = useState<Question>(null)
  const [answer, setAnswer] = useState<Answer>(null)
  const [isSending, setIsSending] = useState<boolean>(false)
  const [body, setBody] = useState('')

  useEffect(() => {
    (async function () {
      if (query.id === undefined) {
        return
      }
  
      const questionDoc = await firebase
        .firestore()
        .collection('questions')
        .doc(query.id)
        .get()
      if (!questionDoc.exists) {
        return
      }
  
      const gotQuestion = questionDoc.data() as Question
      gotQuestion.id = questionDoc.id
      setQuestion(gotQuestion)

      if (!gotQuestion.isReplied) return

      const answerSnapshot = await firebase
        .firestore()
        .collection('answers')
        .where('questionId', '==', gotQuestion.id)
        .limit(1)
        .get()
      if (answerSnapshot.empty) return
      const gotAnswer = answerSnapshot.docs[0].data() as Answer
      gotAnswer.id = answerSnapshot.docs[0].id
      setAnswer(gotAnswer)
    })()
  }, [query.id])

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSending(true)

    const answer = {
      uid: user.uid,
      questionId: question.id,
      body,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    }
  
    await firebase.firestore().runTransaction(async (t) => {
      t.set(firebase.firestore().collection('answers').doc(), answer)
      t.update(firebase.firestore().collection('questions').doc(question.id), {
        isReplied: true,
      })
    })
  
    const now = new Date().getTime()
    setAnswer({
      ...answer,
      id: '',
      createdAt: new firebase.firestore.Timestamp(now / 1000, now % 1000),
    }) // TODO: createdAtの型が違う為
  }

  return (
    <Layout>
      <div className="row justify-content-center">
        <div className="col-12 col-md-6">
          {question && (
            <>
              <div className="card">
                <div className="card-body">{question.body}</div>
              </div>

              <section className="text-center mt-4">
                <h2 className="h4">回答</h2>

                {answer === null ? (
                  <form onSubmit={onSubmit}>
                    <textarea
                      className="form-control"
                      placeholder="おげんきですよ"
                      rows={6}
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      required
                    ></textarea>
                    <div className="m-3">
                      {isSending ? (
                        <div
                          className="spinner-border text-secondary"
                          role="status"
                        ></div>
                      ) : (
                        <button type="submit" className="btn btn-primary">
                          回答する
                        </button>
                      )}
                    </div>
                  </form>
                ) : (
                  <div className="card">
                    <div className="card-body text-left">{answer.body}</div>
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default QuestionsShow