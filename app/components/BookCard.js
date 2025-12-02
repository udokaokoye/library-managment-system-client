"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function BookCard({ book }) {
    const router = useRouter();

    const isValidUrl = (url) => {
        return url && (url.startsWith("http") || url.startsWith("/"));
    };

    const placeholder = "https://placehold.co/400x600/1e293b/475569?text=No+Cover";

    const [imgSrc, setImgSrc] = useState(
        isValidUrl(book.pictureUrl) ? book.pictureUrl : placeholder
    );

    return (
        <div className="group bg-slate-800 border border-slate-700 rounded-lg overflow-hidden hover:shadow-xl hover:shadow-blue-900/10 hover:border-blue-500/30 transition-all duration-300 flex flex-col">

            <div className="relative h-40 w-full bg-slate-900 overflow-hidden">
                <Image
                    src={imgSrc}
                    alt={book.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"

                    onError={() => setImgSrc(placeholder)}
                />

                <div className="absolute top-2 right-2">
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold shadow-md uppercase tracking-wide ${
              book.availableCopies > 0
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "bg-red-500/20 text-red-400 border border-red-500/30"
          }`}>
            {book.availableCopies > 0 ? `${book.availableCopies} Left` : "Out of Stock"}
          </span>
                </div>
            </div>

            <div className="p-4 flex flex-col flex-1">
                <h3 className="text-lg font-bold text-white mb-1 line-clamp-1" title={book.title}>
                    {book.title}
                </h3>
                <p className="text-slate-400 text-xs mb-3">
                    {book.author} • {book.publicationYear}
                </p>

                <div className="mt-auto flex gap-2">
                    <Link
                        href={`/books/${book.id}`}
                        className="flex-1 text-center py-1.5 rounded-md border border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors text-xs font-medium"
                    >
                        Details
                    </Link>

                    <button
                        disabled={book.availableCopies === 0}
                        onClick={() => router.push(`/books/${book.id}`)}
                        className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-colors ${
                            book.availableCopies > 0
                                ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20"
                                : "bg-slate-700 text-slate-500 cursor-not-allowed"
                        }`}
                    >
                        {book.availableCopies > 0 ? "Borrow" : "Unavailable"}
                    </button>
                </div>
            </div>
        </div>
    );
}