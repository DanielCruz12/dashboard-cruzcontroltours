import LoginForm from "@/forms/login-form";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="hidden lg:flex lg:w-3/5 bg-cover bg-center relative">
        <Image src="/colorfull-bg.jpg" alt="Logo" fill sizes="100%" />
        <div className="absolute w-full h-full flex items-center justify-center text-white">
          <h1 className="text-4xl font-bold"></h1>
        </div>
      </div>
      <div className="w-full flex flex-col items-center justify-center">
        <Image alt="logo" src="/logo.png" width={120} height={120} style={{ width: 'auto', height: 'auto' }} />
        <LoginForm />
      </div>
    </div>
  );
}
