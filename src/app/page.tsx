import LoginForm from "@/forms/login-form";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="hidden lg:flex lg:w-3/5 relative overflow-hidden bg-black">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src="/videos/1.mp4"
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-8 text-center">
          <h1 className="text-4xl font-bold">Cruz Control Tours</h1>
          <p className="mt-2 text-white/80">Panel de administración</p>
        </div>
      </div>
      <div className="w-full flex flex-col items-center justify-center">
        <Image alt="Cruz Control Tours" src="/logocruztours.png" width={120} height={120} style={{ width: 'auto', height: 'auto' }} />
        <LoginForm />
      </div>
    </div>
  );
}
