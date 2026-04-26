import { Star, Quote } from "lucide-react";

export interface Testimonial {
  name: string;
  age: number;
  occupation: string;
  policyName: string;
  testimonialText: string;
  rating: number;
}

interface TestimonialsProps {
  testimonials: Testimonial[];
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating
              ? "fill-amber-400 text-amber-400"
              : "fill-gray-200 text-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

export default function Testimonials({ testimonials }: TestimonialsProps) {
  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-2 text-center text-2xl font-bold text-[#1e3a5f] sm:text-3xl">
          What Our Policyholders Say
        </h2>
        <p className="mx-auto mb-10 max-w-2xl text-center text-gray-500">
          Real stories from people who secured their future with LIC
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="relative rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <Quote className="absolute right-4 top-4 h-8 w-8 text-amber-100" />

              <StarRating rating={t.rating} />

              <p className="mt-4 text-sm leading-relaxed text-gray-600 line-clamp-5">
                &ldquo;{t.testimonialText}&rdquo;
              </p>

              <div className="mt-5 border-t border-gray-100 pt-4">
                <p className="text-sm font-semibold text-[#1e3a5f]">{t.name}</p>
                <p className="text-xs text-gray-500">
                  {t.age} yrs &middot; {t.occupation}
                </p>
                <span className="mt-1.5 inline-block rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium text-amber-700">
                  {t.policyName}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
