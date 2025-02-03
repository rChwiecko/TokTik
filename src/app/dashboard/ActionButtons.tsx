"use client"

import { Heart, MessageCircle, Share2, Star } from "lucide-react"
import { useState } from "react"

export default function ActionButtons() {
  const [liked, setLiked] = useState(false)
  const [favorited, setFavorited] = useState(false)

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 flex flex-col gap-6">
      <button
        onClick={() => setLiked(!liked)}
        className="p-2 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition-colors"
      >
        <Heart className={`w-6 h-6 ${liked ? "fill-red-500 text-red-500" : ""}`} />
      </button>
      <button className="p-2 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition-colors">
        <MessageCircle className="w-6 h-6" />
      </button>
      <button className="p-2 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition-colors">
        <Share2 className="w-6 h-6" />
      </button>
      <button
        onClick={() => setFavorited(!favorited)}
        className="p-2 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition-colors"
      >
        <Star className={`w-6 h-6 ${favorited ? "fill-yellow-500 text-yellow-500" : ""}`} />
      </button>
    </div>
  )
}

