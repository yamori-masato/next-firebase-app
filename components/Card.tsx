import { FC } from 'react'

type Props = {
  text: string,
}

const Card: FC<Props> = ({text}) => {
  return (
    <div>
      <div className="card my-3">
        <div className="card-body">
          <div className="text-truncate">{text}</div>
        </div>
      </div>
    </div>
  )
}

export default Card
