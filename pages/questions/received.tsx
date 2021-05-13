import { useEffect, useState } from 'react'
import firebase from 'firebase/app'
import { useAuthentication } from '../../hooks/authentication'
import { Question } from '../../models/Question'
import Layout from '../../components/Layout'
import Card from '../../components/Card'

export default function QuestionsReceived() {
  const { user } = useAuthentication()
  const [questions, setQuestions] = useState<Question[]>([])

  useEffect(() => {
    if (user === null) {
      return
    }

    async function loadQuestions() {
      const snapshot = await firebase
        .firestore()
        .collection('questions')
        .where('receiverUid', '==', user.uid)
        .get()
      
      console.log(
        (await firebase
          .firestore()
          .collection('questions')
          .where('id', '!=', '1')
          .get())
        .docs.map(v => v)
      )
      if (snapshot.empty) {
        return
      }

      const gotQuestions = snapshot.docs.map(doc => {
        const question = doc.data() as Question
        question.id = doc.id
        return question
      })
      setQuestions(gotQuestions)
    }

    loadQuestions()
  }, [user])
  // console.log(user)
  console.log(questions)

  return (
    <Layout>
      <h1 className="h4">受け取った質問一覧</h1>

      <div className="row justify-content-center">
        <div className="col-12 col-md-6">
          {questions.map((question) => (
            <div key={question.id}>
              <Card text={question.body}/>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}