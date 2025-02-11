import React from 'react';
import { motion } from 'framer-motion';

const testimonials = [
  {
    id: 1,
    name: "Pournima Bhosale",
    role: "Computer Science Student",
    college: "IIT(B)",
    testimonial: "This platform completely transformed my career journey! I was confused about what career path to choose, but the AI-driven recommendations and assessments gave me a clear direction. I landed my first job in just three months with their personalized guidance!",
    image: "/src/images/image3.jpg"
  },
  {
    id: 2,
    name: "Dev Pahade",
    role: "Graduate Student",
    college: "MIT",
    testimonial: "This platform makes career counseling so much easier! It provides structured insights into students' strengths and weaknesses, helping them choose the right path. It’s a game-changer for educators and mentors.",
    image: "/src/images/WhatsApp Image 2025-02-09 at 07.41.10_d62091c7.jpg"
  },
  {
    id: 3,
    name: "Ved Bhojwani",
    role: "Engineering Student",
    college: "IIT(Delhi)",
    testimonial: "As a mid-career professional, I was looking to transition into data science, but I had no idea where to start. This platform provided a tailored learning pathway, connecting me with the right courses, mentorship, and job opportunities. Within six months, I secured a role as a Data Analyst!",
    image: "/src/images/WhatsApp Image 2025-02-09 at 07.36.45_318919c3.jpg"
  }
];

const TestimonialsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
      >
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl font-bold text-gray-900 mb-4"
          >
            What Our Users Say
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl text-gray-600"
          >
            Read about the experiences of students who have used Sahay
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              whileHover={{ scale: 1.03 }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-center justify-center mb-6">
                  <motion.img
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.6, delay: index * 0.2 + 0.3 }}
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                </div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.2 + 0.4 }}
                >
                  <p className="text-gray-600 italic mb-6">"{testimonial.testimonial}"</p>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900">{testimonial.name}</h3>
                    <p className="text-gray-600">{testimonial.role}</p>
                    <p className="text-gray-500 text-sm">{testimonial.college}</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="text-center mt-16"
        >
          <button className="bg-primary text-white px-8 py-3 rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25">
            Share Your Story
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default TestimonialsPage;