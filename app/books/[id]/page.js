import Image from "next/image";
import { sampleBooks } from "../../../lib/books";
import ReservationButton from "../../components/ReservationButton";

export async function generateStaticParams() {
  return sampleBooks.map((b) => ({ id: b.id }));
}

export default function BookPage({ params }) {
  const { id } = params;
  const book = sampleBooks.find((b) => b.id === id);

  if (!book) {
    return <div className="container mx-auto p-6">Book not found</div>;
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="grid md:grid-cols-[200px_1fr] gap-6">
        <div>
          <Image src={book.cover} alt={`${book.title} cover`} width={160} height={220} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold mb-2">{book.title}</h1>
          <div className="text-sm text-[color:var(--muted)] mb-4">{book.author} — {book.year}</div>
          <p className="mb-4">{book.description}</p>
          <div className="flex gap-2">
            <button className="btn-primary px-3 py-2 rounded">Borrow</button>
            <ReservationButton bookId={book.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
