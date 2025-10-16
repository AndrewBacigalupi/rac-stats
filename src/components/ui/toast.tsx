"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ToastProps {
  message: string
  type: "success" | "error"
  isVisible: boolean
  onClose: () => void
}

export function Toast({ message, type, isVisible, onClose }: ToastProps) {
  React.useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-2 duration-500">
      <div
        className={cn(
          "px-6 py-4 rounded-2xl shadow-2xl border-2 backdrop-blur-md max-w-sm",
          type === "success"
            ? "text-gray-900 border-gray-200"
            : "bg-red-500 text-white border-red-400"
        )}
        style={type === "success" ? {backgroundColor: '#91D2FD'} : {}}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={cn(
                "w-2 h-2 rounded-full",
                type === "success" ? "bg-green-500" : "bg-white"
              )}
            />
            <span className="text-sm font-semibold">{message}</span>
          </div>
          <button
            onClick={onClose}
            className={cn(
              "ml-4 text-lg opacity-60 hover:opacity-100 transition-all duration-200 hover:scale-110 rounded-full w-6 h-6 flex items-center justify-center",
              type === "success" ? "text-gray-600 hover:bg-gray-200" : "text-white hover:bg-red-400"
            )}
          >
            ×
          </button>
        </div>
      </div>
    </div>
  )
}
