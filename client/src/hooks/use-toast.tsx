import { createContext, useContext, useState } from "react"
import type { ToastActionElement, ToastProps } from "@/components/ui/toast"

type ToastType = Omit<ToastProps, "id"> & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

type ToasterToast = ToastType

type ToasterContextProps = {
  toasts: ToasterToast[]
  toast: (props: ToastType) => void
  dismiss: (toastId?: string) => void
}

const ToasterContext = createContext<ToasterContextProps | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToasterToast[]>([])

  const toast = ({ ...props }: ToastType) => {
    const id = crypto.randomUUID()
    const newToast = { ...props, id }
    setToasts((prevToasts) => [...prevToasts, newToast])
    
    // Auto dismiss toast after 5 seconds
    setTimeout(() => {
      dismiss(id)
    }, 5000)
  }

  const dismiss = (toastId?: string) => {
    if (toastId) {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== toastId))
    } else {
      setToasts([])
    }
  }

  return (
    <ToasterContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
    </ToasterContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToasterContext)
  
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  
  return context
}