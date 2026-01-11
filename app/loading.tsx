export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#F2EAE4] to-white">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[#F2EAE4] rounded-full" />
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-[#F24E29] border-t-transparent rounded-full animate-spin" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <p className="text-[#F24E29] font-bold text-lg">SaveNutri</p>
          <p className="text-gray-500 text-sm">Loading your health journey...</p>
        </div>
      </div>
    </div>
  )
}
