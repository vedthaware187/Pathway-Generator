import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import axios from "axios";

interface Question {
  question: string;
  options: string[];
  correct_answer: string;
}

interface SkillCategory {
  [key: string]: {
    language: any;
    level?: string;
    skill?: string;
    proficiency?: string;
  }[];
}

interface AssessmentResult {
  report: string;
  accuracy: number;
}

const SkillAssessmentPage: React.FC = () => {
  const [userSkills, setUserSkills] = useState<SkillCategory | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [skillAssessments, setSkillAssessments] = useState<{ [key: string]: number }>({});
  const [activeAssessment, setActiveAssessment] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<{ [index: number]: string }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [assessmentReport, setAssessmentReport] = useState<string | null>(null);

  const STUDENT_ID = 9; // You might want to get this from authentication context

  useEffect(() => {
    fetchSkills(STUDENT_ID);
  }, []);

  const fetchSkills = async (studentId: number) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/skills/${studentId}`);
      setUserSkills(response.data);
    } catch (error) {
      setError("Failed to load skills.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getIndividualSkills = () => {
    if (!userSkills) return { technicalSkills: [], languageSkills: [] };
    return {
      technicalSkills: userSkills.technical?.flatMap(item => item.skill?.split(',').map(s => s.trim()) || []) || [],
      languageSkills: userSkills.languages?.flatMap(item => item.language?.split(',').map(s => s.trim()) || []) || []
    };
  };

  const startAssessment = async (skill: string) => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5001/api/assess', {
        student_id: STUDENT_ID,
        action: 'start',
        skill
      });
      
      if (response.data.status === 'success') {
        setQuestions(response.data.questions);
        setActiveAssessment(skill);
        setAnswers({});
        setIsSubmitted(false);
        setCurrentQuestionIndex(0);
        setAssessmentReport(null);
      } else {
        setError('Failed to fetch questions');
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      setError('Failed to start assessment');
    }
    setLoading(false);
  };

  const handleAnswerChange = (index: number, answer: string) => {
    setAnswers(prev => ({ ...prev, [index]: answer }));
  };

  const submitAssessment = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5001/api/assess', {
        student_id: STUDENT_ID,
        action: 'submit',
        skill: activeAssessment,
        questions,
        answers
      });

      if (response.data.status === 'success') {
        const result: AssessmentResult = response.data;
        setSkillAssessments(prev => ({ 
          ...prev, 
          [activeAssessment!]: result.accuracy 
        }));
        setAssessmentReport(result.report);
        setIsSubmitted(true);
      } else {
        setError('Failed to submit assessment');
      }
    } catch (error) {
      console.error('Error submitting assessment:', error);
      setError('Failed to submit assessment');
    }
    setLoading(false);
  };

  const { technicalSkills, languageSkills } = getIndividualSkills();
  const availableAssessments = [...technicalSkills, ...languageSkills];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-2xl font-semibold text-blue-600 animate-pulse">Loading, please wait</p>
      </div>
    );
  }

  if (error) return <p className="text-red-600">{error}</p>;
  if (!userSkills) return <p>No skills found.</p>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Skill Assessment Dashboard</h1>
        {activeAssessment && <Button onClick={() => setActiveAssessment(null)}>Back</Button>}
      </header>

      {activeAssessment ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{activeAssessment} - Question {currentQuestionIndex + 1} of {questions.length}</CardTitle>
            </CardHeader>
            <CardContent>
              {!isSubmitted ? (
                <>
                  <p className="text-xl font-medium mb-4">{questions[currentQuestionIndex].question}</p>
                  <RadioGroup 
                    value={answers[currentQuestionIndex] || ""} 
                    onValueChange={value => handleAnswerChange(currentQuestionIndex, value)}
                  >
                    {questions[currentQuestionIndex].options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2 mb-2">
                        <RadioGroupItem value={option[0]} id={`option-${index}`} />
                        <Label htmlFor={`option-${index}`}>{option}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                  <div className="flex justify-between mt-6">
                    <Button 
                      variant="outline" 
                      disabled={currentQuestionIndex === 0} 
                      onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                    >
                      Previous
                    </Button>
                    <Button 
                      onClick={currentQuestionIndex === questions.length - 1 ? submitAssessment : () => setCurrentQuestionIndex(prev => prev + 1)}
                    >
                      {currentQuestionIndex === questions.length - 1 ? 'Submit' : 'Next'}
                    </Button>
                  </div>
                </>
              ) : (
                <div 
                  className="prose max-w-none" 
                  dangerouslySetInnerHTML={{ __html: assessmentReport || '' }} 
                />
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle>Your Skills</CardTitle></CardHeader>
            <CardContent>
              {availableAssessments.map(skill => (
                <div key={skill} className="mb-2">
                  <div className="flex justify-between">
                    <span className="font-medium">{skill}</span>
                    <span>{skillAssessments[skill]?.toFixed(1) || 0}%</span>
                  </div>
                  <Progress value={skillAssessments[skill] || 0} />
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Available Assessments</CardTitle></CardHeader>
            <CardContent>
              {availableAssessments.map(skill => (
                <div key={skill} className="border rounded-lg p-4 hover:shadow-md mb-4">
                  <div className="flex justify-between mb-2">
                    <h4 className="font-semibold">{skill}</h4>
                    <Badge>12 Questions</Badge>
                  </div>
                  <Button className="w-full" onClick={() => startAssessment(skill)}>
                    Start Assessment
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SkillAssessmentPage;