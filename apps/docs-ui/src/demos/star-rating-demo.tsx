'use client'

import { useState } from 'react'
import { StarRating } from '@choblue/ui/star-rating'
import { Preview } from './preview'

export function StarRatingReadOnly() {
  return (
    <Preview>
      <StarRating value={3} readOnly size="sm" />
      <StarRating value={4} readOnly size="md" />
      <StarRating value={5} readOnly size="lg" />
    </Preview>
  )
}

export function StarRatingInteractive() {
  const [rating, setRating] = useState(0)

  return (
    <Preview>
      <StarRating value={rating} onChange={setRating} size="lg" />
      <span className="text-sm text-muted-foreground">
        {rating > 0 ? `${rating}점` : '클릭하여 평가'}
      </span>
    </Preview>
  )
}
