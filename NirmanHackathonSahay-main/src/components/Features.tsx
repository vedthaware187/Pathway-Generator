import { useNavigate } from "react-router-dom";
import { Book, Calendar, Users, Briefcase, Globe, House, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const Features = () => {
  const navigate = useNavigate(); // React Router Hook for navigation

  const features = [
    {
      icon: Users,
      title: "AI Skill Assessment & Tracking",
      description: "Evaluates students’ skills and aligns them with career aspirations to identify knowledge gaps and areas for improvement.",
      color: "from-purple-500 to-pink-500",
      link: "/community"
    },
    {
      icon: Calendar,
      title: "Optimized Learning Paths",
      description: "Creates personalized, dynamic learning plans tailored to individual goals, industry trends, and job requirements. Includes local language support and multimedia resources for effective learning.",
      color: "from-pink-500 to-orange-500",
      link: "/eventmanagement" 
    },
    {
      icon: Book,
      title: "Gamified Learning & Motivation",
      description: "Enhances engagement through interactive elements like games, badges, rewards, and leaderboards, making the learning experience fun and motivating.",
      color: "from-orange-500 to-yellow-500",
      link : "/research"
    },
    {
      icon: Briefcase,
      title: "Community Building",
      description: "Provides career advice and answers queries anytime. Uses skill demand forecasting to predict future job trends and recommends suitable courses accordingly.",
      color: "from-yellow-500 to-green-500",
      link : "/jobmatching"
    },
    {
      icon: Globe,
      title: "Job Matching & Career Tool",
      description: "Matches students with relevant internships and jobs, offers a resume builder, and provides AI-driven mock interview practice sessions to prepare for job opportunities.",
      color: "from-green-500 to-blue-500",
      link : "/alumniconnect"
    },
    
  ];

  return (
    <section id="features" className="py-20 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-purple-600">Everything You Need to Shape Your Future</h2>
        <p className="text-center text-gray-600 mt-4 max-w-2xl mx-auto">
        Explore a variety of features tailored to your unique journey, from personalized career assessments to tailored learning paths and job opportunities.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                className="p-6 rounded-2xl bg-white shadow-lg border border-gray-200 transition-transform hover:-translate-y-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                {feature.link && (
                  <button
                    className="text-purple-600 font-medium flex items-center gap-1 hover:text-purple-800"
                    onClick={() => navigate(feature.link)}
                  >
                    Learn more <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
