type RatingUsernameProps = {
  username: string
  rating?: number | null
}

export function getRatingTier(rating: number | null | undefined) {
  if (rating == null) return 'rating-gray'
  if (rating >= 2500) return 'rating-red'
  if (rating >= 2300) return 'rating-orange'
  if (rating >= 2000) return 'rating-violet'
  if (rating >= 1700) return 'rating-blue'
  if (rating >= 1400) return 'rating-cyan'
  if (rating >= 1000) return 'rating-green'
  return 'rating-gray'
}

export default function RatingUsername({ username, rating }: RatingUsernameProps) {
  return (
    <span className={`rated-user ${getRatingTier(rating)}`}>
      {username}
      {rating != null ? <span className="rating-value"> {rating}</span> : null}
    </span>
  )
}
