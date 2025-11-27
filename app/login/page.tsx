import { GalleryVerticalEnd } from "lucide-react"

import { LoginForm } from "@/components/login-form"
import Image from "next/image"

export default function LoginPage() {
  return (
    <div className="bg-[url(https://images.pexels.com/photos/1642125/pexels-photo-1642125.jpeg)] flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="relative z-10 flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium text-primary-foreground">
          <div className="bg-white text-primary flex size-6 items-center justify-center rounded-md">
            {/* <GalleryVerticalEnd className="size-4" /> */}
            <Image src={'/favicon.png'} alt="" height={18} width={18}/>
          </div>
          Ungarm-Immo | Admin
        </a>
        <LoginForm />
      </div>
    </div>
  )
}
