export default function FullPageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F7F8FB]">
      <div className="flex flex-col items-center gap-5 rounded-2xl border border-[#EDEEF2] bg-white px-10 py-8 shadow-sm">
        <div className="relative flex h-14 w-14 items-center justify-center">
          <div className="absolute inset-0 animate-ping rounded-full bg-indigo-100 opacity-60" />
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#EDEEF2] border-t-indigo-600" />
        </div>

        <div className="text-center">
          <h2 className="text-base font-semibold text-[#111827]">Checking your session</h2>
          <p className="mt-1 animate-pulse text-sm text-gray-500">Please wait a moment...</p>
        </div>
      </div>
    </div>
  );
}