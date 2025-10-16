"use client"
import { useRouter } from "next/navigation" 
import Icon from "./Icon"

const { FaArrowLeft } = Icon

const BackButton = ({ to, text, iconSize }) => {
  const router = useRouter()

  const handleBack = () => {
    if (to) {
      router.push(to)
    } else {
      router.back()
    }
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`flex items-center gap-2 mb-8 text-[#839198] hover:underline hover:text-[#8F141B] font-semibold`}
    >
      <FaArrowLeft size={iconSize} /> {text || "Volver"}
    </button>
  )
}

export default BackButton