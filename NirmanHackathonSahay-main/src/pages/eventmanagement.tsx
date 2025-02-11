import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Book,
  Clock,
  Star,
  Trophy,
  Upload,
} from 'lucide-react';

// Define types
interface Course {
  id: string;
  title: string;
  platform: string;
  level: string;
  duration: string;
  progress: number;
  xp: number;
  outcomes: string[];
  prerequisites: string[];
}

interface Topic {
  topic: string;
  courses: Course[];
}

interface Recommendations {
  recommended: Topic[];
  trending: Topic[];
  new: Topic[];
}

const EnhancedCourseRecommendations = () => {
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendations | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('recommended');
  const [totalXP, setTotalXP] = useState(0);

  const categories = [
    { id: 'recommended', label: 'Recommended', icon: Star },

  ];

  useEffect(() => {
    if (!recommendations) return;

    let calculatedXP = 0;
    Object.values(recommendations).forEach((categoryRecommendations) => {
      categoryRecommendations.forEach((topic) => {
        topic.courses.forEach((course) => {
          calculatedXP += course.xp || 0;
        });
      });
    });
    setTotalXP(calculatedXP);
  }, [recommendations]);

  const toggleTopic = (topic: string) => {
    setExpandedTopics((prev) => ({
      ...prev,
      [topic]: !prev[topic],
    }));
  };
  const handleFileUpload = async () => {
    setLoading(true);
  
    // Use the hardcoded file path directly
    const filePath = 'C:\\Users\\aniru\\Desktop\\NirmanHackathonSahay-main\\reports\\report.html';
    const file = new File([new Blob([filePath])], 'report_3python20250209045500.html', { type: 'text/html' });
  
    if (!file) {
      setLoading(false);
      alert('Failed to load the file.');
      return;
    }
  
    const formData = new FormData();
    formData.append('reportfile', file);
  
    try {
      const response = await fetch('http://127.0.0.1:5003/api/upload', {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
  
      // Check if the response is valid JSON
      const text = await response.text();
      let data: Recommendations;
      try {
        data = JSON.parse(text);
      } catch (error) {
        throw new Error('Invalid JSON response from server');
      }
  
      setRecommendations(data);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      alert(error.message || 'Failed to load recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  const markCourseProgress = (courseId, topicIndex) => {
    setRecommendations((prev) => {
      const newRecommendations = { ...prev };
      const course = newRecommendations[selectedCategory][topicIndex].courses.find(
        (c) => c.id === courseId
      );
      course.progress = course.progress === 100 ? 0 : 100;
      return newRecommendations;
    });
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Course Recommendations</h2>
          <div className="flex items-center space-x-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <span className="text-xl font-semibold">Total XP: {totalXP}</span>
          </div>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center w-full">
              <Button
                className="w-full"
                disabled={loading}
                onClick={handleFileUpload}
              >
                {loading ? 'Analyzing Profile...' : 'Get Recommendations'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-4 mb-6">
          {categories.map((category) => {
            const CategoryIcon = category.icon;
            return (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                className="flex items-center space-x-2"
                onClick={() => setSelectedCategory(category.id)}
              >
                <CategoryIcon className="w-4 h-4 mr-2" />
                {category.label}
              </Button>
            );
          })}
        </div>
      </div>

      {recommendations &&
        recommendations[selectedCategory]?.map((topic, topicIndex) => (
          <Card key={topic.topic} className="mb-6">
            <CardHeader
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => toggleTopic(topic.topic)}
            >
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{topic.topic}</CardTitle>
                {expandedTopics[topic.topic] ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </div>
            </CardHeader>

            {expandedTopics[topic.topic] && (
              <CardContent>
                <div className="space-y-6">
                  {topic.courses.map((course) => (
                    <div key={course.id} className="border-l-4 border-blue-500 pl-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold">{course.title}</h3>
                        <Badge variant="secondary">{course.level}</Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="w-4 h-4 mr-2" />
                            <span>{course.duration}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Star className="w-4 h-4 mr-2 text-yellow-500" />
                            <span>{course.xp} XP</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-end">
                          <Button
                            variant={course.progress === 100 ? 'outline' : 'default'}
                            onClick={() => markCourseProgress(course.id, topicIndex)}
                            className="flex items-center"
                          >
                            {course.progress === 100 ? (
                              <>
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Completed
                              </>
                            ) : (
                              'Mark as Complete'
                            )}
                          </Button>
                        </div>
                      </div>

                      <Progress value={course.progress} className="h-2 mt-4" />

                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Learning Outcomes:</h4>
                          <ul className="space-y-1 text-sm text-gray-600">
                            {course.outcomes.map((outcome, i) => (
                              <li key={i} className="flex items-start">
                                <CheckCircle2 className="w-4 h-4 mr-2 mt-1 flex-shrink-0" />
                                {outcome}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Prerequisites:</h4>
                          <ul className="space-y-1 text-sm text-gray-600">
                            {course.prerequisites.map((prereq, i) => (
                              <li key={i} className="flex items-start">
                                <CheckCircle2 className="w-4 h-4 mr-2 mt-1 flex-shrink-0" />
                                {prereq}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="mt-4">
                        <Button variant="outline" className="flex items-center">
                          View Course
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
    </div>
  );
};

export default EnhancedCourseRecommendations;
