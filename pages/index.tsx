
import Link from 'next/link'
import styles from '../styles/Home.module.css'
import { useAuthentication } from '../hooks/authentication'

export default function Home() {
  return (
    <Link href="/page2">
      <a>Go to page2</a>
    </Link>
  )
}
