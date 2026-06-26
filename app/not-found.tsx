import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <div className="text-7xl">🧭</div>
      <h1 className="mt-4 text-3xl font-extrabold text-bpk-ink">404</h1>
      <p className="mt-2 font-bold text-bpk-ink">We couldn't find this brand</p>
      <p className="mt-1 text-sm font-semibold text-bpk-muted">
        Try “Explore a new brand” and let AI make one for you!
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-1 rounded-2xl bg-bpk-primary px-5 py-2.5 font-extrabold text-white shadow-[0_5px_0_#e8623f]"
      >
        ← Back home
      </Link>
    </main>
  );
}
