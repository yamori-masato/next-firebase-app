import { FC } from 'react'
import dayjs from 'dayjs'

type Props = {
  text: string,
  date: string,
}

const Card: FC<Props> = ({text, date}) => {
  return (
    <div>
      <div className="card my-3">
        <div className="card-body">
          <div className="text-truncate">{text}</div>
          <div className="text-muted text-end">
            <small>{date}</small>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Card
