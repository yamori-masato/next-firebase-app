import { useEffect, useState, FC } from 'react'
import firebase from 'firebase/app'
import { useAuthentication } from '../../hooks/authentication'
import { Question } from '../../models/Question'
import { User } from '../../models/User'
import Layout from '../../components/Layout'
import Card from '../../components/Card'
import dayjs from 'dayjs'
import InfiniteScroll from 'react-infinite-scroller'
import Link from 'next/link'

function createBaseQuery(user: User) {
  return firebase
    .firestore()
    .collection('questions')
    .where('receiverUid', '==', user.uid)
    .orderBy('createdAt', 'desc')
    .limit(10)
}

const QuestionsReceived = () => {
  const { user } = useAuthentication()
  const [questions, setQuestions] = useState<Question[]>([])
  const [hasMore, setHasMore] = useState(true)

  // snapshotを加工してquestionsに追加
  function appendQuestions(
    snapshot: firebase.firestore.QuerySnapshot<firebase.firestore.DocumentData>
  ) {
    if (snapshot.empty) {
      setHasMore(false)
      return
    }
    const additions = snapshot.docs.map(doc => {
      const question = doc.data() as Question
      question.id = doc.id
      return question
    })
    setQuestions(prev => prev.concat(additions))
  }

  // 追加読み込み
  async function loadMore() {
    if (questions.length === 0) return
  
    const lastQuestion = questions[questions.length - 1]
    const snapshot = await createBaseQuery(user)
      .startAfter(lastQuestion.createdAt)
      .get()
    appendQuestions(snapshot)
  }

  // questionsの初期化
  useEffect(() => {
    if (!user) return

    (async function () {
      setQuestions([])
      setHasMore(true)
      const snapshot = await createBaseQuery(user).get()
      appendQuestions(snapshot)
    })()
  }, [user])

  return (
    <Layout>
      <h1 className="h4">受け取った質問一覧</h1>
      <div className="row justify-content-center">
        <div className="col-12 col-md-6">
          <InfiniteScroll
            loadMore={loadMore}
            hasMore={hasMore}
            loader={<div key={0}>Loading...</div>}
          >
            {questions.map((question) => (
              <Link href={`/questions/${question.id}`} key={question.id}>
                <a>
                  <Card
                    text={question.body}
                    date={dayjs(question.createdAt.toDate()).format('YYYY/MM/DD HH:mm')}
                  />
                </a>
              </Link>
            ))}
          </InfiniteScroll>
        </div>
      </div>
    </Layout>
  )
}

export default QuestionsReceived