import Image from "next/image";
import Link from "next/link";
import { sampleBooks } from "../lib/books";

export default function Home() {
  return (
    <div className="home-root">
      <section className="dashboard grid gap-6">
        <div className="stats-grid grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="stat-card p-4 rounded-md border bg-[color:var(--panel)]">
            <div className="text-sm text-[color:var(--muted)]">Total books</div>
            <div className="text-2xl font-semibold">{sampleBooks.length * 10}</div>
          </div>
          <div className="stat-card p-4 rounded-md border bg-[color:var(--panel)]">
            <div className="text-sm text-[color:var(--muted)]">Active members</div>
            <div className="text-2xl font-semibold">1,234</div>
          </div>
          <div className="stat-card p-4 rounded-md border bg-[color:var(--panel)]">
            <div className="text-sm text-[color:var(--muted)]">Loans today</div>
            <div className="text-2xl font-semibold">52</div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">New & recommended</h2>
          <div className="books-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sampleBooks.map((b, i) => (
              <article key={b.id} className="book-card p-4 rounded-md border bg-[color:var(--card)]">
                <div className="flex items-start gap-4">
                  <div className="w-20 h-28 rounded-sm flex-shrink-0 overflow-hidden bg-gray-100">
                    <Image
                      src={`/covers/cover-${i + 1}.svg`}
                      alt={`${b.title} cover`}
                      width={80}
                      height={112}
                      className="block"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{b.title}</h3>
                    <div className="text-sm text-[color:var(--muted)]">{b.author} — {b.year}</div>
                    <div className="mt-3 flex gap-2">
                      <Link href={`/books/${b.id}`} className="btn-outline px-3 py-1 rounded text-sm inline-block">Details</Link>
                      <button className="btn-primary px-3 py-1 rounded text-sm">Borrow</button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
