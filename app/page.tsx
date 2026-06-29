import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="text-center max-w-2xl">
        <div className="text-6xl mb-4">⚽</div>
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-green-400 bg-clip-text text-transparent">
          Tipovačka
        </h1>
        <p className="text-2xl font-semibold text-gray-300 mb-2">EURO 2028</p>
        <p className="text-gray-400 mb-10">
          Zadejte své tipy, sledujte výsledky a bojujte o první místo v žebříčku.
        </p>

        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/auth/login"
            className="bg-green-500 hover:bg-green-400 text-black font-bold px-8 py-3 rounded-lg transition-colors"
          >
            Přihlásit se
          </Link>
          <Link
            href="/auth/register"
            className="border border-green-500 hover:bg-green-500/10 text-green-400 font-bold px-8 py-3 rounded-lg transition-colors"
          >
            Registrovat se
          </Link>
        </div>
      </div>
    </main>
  );
}
