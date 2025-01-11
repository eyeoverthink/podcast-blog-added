import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800">
      <div className="relative w-full max-w-md p-8 rounded-lg shadow-2xl bg-gray-900/50 backdrop-blur-sm border border-gray-800">
        <div className="absolute inset-0 rounded-lg bg-purple-500/10"></div>
        <div className="relative">
          <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
            Welcome Back
          </h1>
          <SignIn 
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "bg-transparent shadow-none",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton: "bg-gray-800 hover:bg-gray-700 transition-colors",
                formButtonPrimary: "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all",
                footerAction: "text-gray-400",
                formField: "bg-gray-800/50",
                formFieldInput: "bg-transparent",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
