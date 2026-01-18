import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const testimonials = [
  {
    id: 1,
    name: 'Alex Peterson',
    role: 'Real Estate Investor',
    company: 'Peterson Holdings',
    avatar: '👨‍💼',
    rating: 5,
    text: 'Found my first deal in 3 minutes. The AI matching is incredible. ROI was 10x in 6 months.',
    deal: '$250K',
    location: 'Austin, TX'
  },
  {
    id: 2,
    name: 'Sarah Chen',
    role: 'Angel Investor',
    company: 'Chen Ventures',
    avatar: '👩‍💼',
    rating: 5,
    text: 'FlashFusion replaced my entire research team. The deal flow quality is unmatched.',
    deal: '$1.2M',
    location: 'San Francisco, CA'
  },
  {
    id: 3,
    name: 'Marcus Johnson',
    role: 'Portfolio Manager',
    company: 'Summit Capital',
    avatar: '🧑‍💼',
    rating: 5,
    text: 'Cut our deal sourcing time by 95%. The scenario modeling feature alone is worth the subscription.',
    deal: '$5M',
    location: 'New York, NY'
  },
  {
    id: 4,
    name: 'Lisa Rodriguez',
    role: 'Startup Founder',
    company: 'TechFlow Inc',
    avatar: '👩',
    rating: 5,
    text: 'As a busy founder, FlashFusion helps me find side opportunities without sacrificing my main hustle.',
    deal: '$80K',
    location: 'Miami, FL'
  }
];

export default function TestimonialCarousel() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 7000);

    return () => clearInterval(timer);
  }, []);

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  const testimonial = testimonials[current];

  return (
    <section className="relative py-20">
      <div className="max-w-5xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
            What 3,000+ Builders Say
          </h2>
          <p className="text-gray-400">
            Real results from real passive income builders
          </p>
        </motion.div>

        <div className="relative h-[400px] overflow-hidden">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={current}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              className="absolute w-full"
            >
              <div className="bg-gradient-to-br from-purple-900/20 via-indigo-900/20 to-violet-900/20 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-white/10">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-3xl">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white">
                        {testimonial.name}
                      </h4>
                      <p className="text-sm text-gray-400">
                        {testimonial.role} at {testimonial.company}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        📍 {testimonial.location}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i} className="text-yellow-400 text-xl">⭐</span>
                    ))}
                  </div>
                </div>

                <blockquote className="text-xl md:text-2xl text-gray-100 italic mb-6 leading-relaxed">
                  "{testimonial.text}"
                </blockquote>

                <div className="inline-block bg-green-500/20 border border-green-500/30 rounded-full px-6 py-2">
                  <span className="text-green-400 font-semibold">
                    First Deal: {testimonial.deal}
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setDirection(index > current ? 1 : -1);
                  setCurrent(index);
                }}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === current 
                    ? 'bg-purple-500 w-8' 
                    : 'bg-gray-600 hover:bg-gray-500'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}