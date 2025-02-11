import React, { useState } from 'react';
import {
  Trophy,
  Medal,
  Calendar,
  Gift,
  Moon,
  Sun,
  Search,
  Clock,
  Award,
  Star,
  Book,
  Users,
  ChevronRight,
  Filter,
  Flame,
  Lock,
  Timer,
  Target,
  Check,
  AlertCircle,
  Upload,
  Sparkles,
  BookOpen
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

const LeaderboardEntry = ({ rank, user, points, badges, isCurrentUser, darkMode }) => (
  <div className={`flex items-center justify-between p-3 ${
    isCurrentUser 
      ? 'bg-blue-500 text-white' 
      : darkMode 
        ? 'bg-gray-800' 
        : 'bg-white'
  } rounded-lg mb-2 transition-all hover:scale-[1.02]`}>
    <div className="flex items-center space-x-4">
      <span className={`w-8 font-bold ${isCurrentUser ? 'text-white' : ''}`}>#{rank}</span>
      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white">
        {user.slice(0, 2)}
      </div>
      <span className={isCurrentUser ? 'text-white' : ''}>{user}</span>
    </div>
    <div className="flex items-center space-x-4">
      <span>{points} pts</span>
      <div className="flex space-x-1">
        {badges.map((badge, i) => (
          <div key={i} className={`w-6 h-6 rounded-full ${badge.color} flex items-center justify-center text-white text-xs`}>
            {badge.icon}
          </div>
        ))}
      </div>
    </div>
  </div>
);

const CourseChallenge = ({ challenge, darkMode }) => (
  <div className="p-4 border rounded-lg transition-all hover:shadow-lg">
    <div className="flex justify-between items-center mb-2">
      <div>
        <h4 className="font-medium flex items-center">
          {challenge.name}
          {challenge.isLocked && <Lock className="w-4 h-4 ml-2 text-gray-400" />}
          {challenge.certificate && (
            <div 
              className="ml-2 p-1 rounded-full bg-green-500 hover:bg-green-600 cursor-pointer transition-colors"
              title="Download Certificate"
            >
              <Award className="w-4 h-4 text-white" />
            </div>
          )}
        </h4>
        <p className="text-sm text-gray-500">
          {challenge.deadline && (
            <span className="flex items-center">
              <Timer className="w-4 h-4 mr-1" />
              {challenge.deadline}
            </span>
          )}
        </p>
      </div>
      <div className="flex items-center space-x-2">
        {challenge.reward && (
          <div className={`p-2 rounded-full ${challenge.reward.color} text-white`}>
            {challenge.reward.icon}
          </div>
        )}
      </div>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div 
        className="bg-green-500 rounded-full h-2 transition-all duration-500" 
        style={{ width: `${challenge.progress}%` }}
      />
    </div>
    {challenge.steps && (
      <div className="mt-2 space-y-1">
        {challenge.steps.map((step, index) => (
          <div key={index} className="flex items-center text-sm">
            {step.completed ? (
              <Check className="w-4 h-4 text-green-500 mr-2" />
            ) : (
              <div className="w-4 h-4 rounded-full border-2 border-gray-300 mr-2" />
            )}
            <span className={step.completed ? 'text-gray-500 line-through' : ''}>
              {step.name}
            </span>
          </div>
        ))}
      </div>
    )}
  </div>
);

const EnhancedLearningPlatform = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('Machine Learning');
  const [leaderboardFilter, setLeaderboardFilter] = useState('global');
  const [searchQuery, setSearchQuery] = useState('');
  const [userPoints, setUserPoints] = useState(12500);
  const [certificateCount, setCertificateCount] = useState(0);
  const [userLevel, setUserLevel] = useState(1);
  const [achievements, setAchievements] = useState([]);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  const [loadingUpload, setLoadingUpload] = useState(false);

  // Gamification constants
  const POINTS_PER_CERTIFICATE = 100;
  const POINTS_FOR_FIRST_UPLOAD = 50;
  const STREAK_BONUS = 25;

  const courses = [
    { id: 'ml', name: 'Machine Learning', progress: 70 },
    { id: 'web', name: 'Web Development', progress: 45 },
    { id: 'data', name: 'Data Science', progress: 30 }
  ];

  const badges = [
    { id: 1, name: 'Python Master', icon: '🐍', color: 'bg-indigo-500 hover:bg-indigo-600' },
    { id: 2, name: 'AI Expert', icon: '🤖', color: 'bg-violet-500 hover:bg-violet-600' },
    { id: 3, name: 'Data Wizard', icon: '📊', color: 'bg-purple-500 hover:bg-purple-600' },
    { id: 4, name: 'Algorithm Ace', icon: '🎯', color: 'bg-blue-500 hover:bg-blue-600', locked: true },
    { id: 5, name: 'Code Ninja', icon: '⚔', color: 'bg-green-500 hover:bg-green-600', locked: true }
  ];

  const challenges = {
    'Machine Learning': [
      {
        name: 'Build a Neural Network',
        progress: 75,
        deadline: '2 days left',
        reward: { icon: '🏆', color: 'bg-yellow-500' },
        certificate: true,
        steps: [
          { name: 'Setup Environment', completed: true },
          { name: 'Data Preprocessing', completed: true },
          { name: 'Model Architecture', completed: false },
          { name: 'Training', completed: false }
        ]
      },
      {
        name: 'Advanced CNN Project',
        progress: 0,
        isLocked: true,
        reward: { icon: '🎖', color: 'bg-purple-500' }
      }
    ],
    'Web Development': [
      {
        name: 'Full-Stack App',
        progress: 30,
        deadline: '5 days left',
        certificate: true,
        reward: { icon: '💻', color: 'bg-blue-500' }
      }
    ],
    'Data Science': [
      {
        name: 'Data Visualization',
        progress: 60,
        deadline: '3 days left',
        certificate: true,
        reward: { icon: '📊', color: 'bg-green-500' }
      }
    ]
  };

  const rewards = [
    { brand: 'Nike', discount: '20% Off', points: 5000, image: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg' },
    { brand: 'Apple', discount: '$50 Gift Card', points: 10000, image: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg' },
    { brand: 'Adidas', discount: '15% Off', points: 3000, image: 'https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg' },
    { brand: 'Samsung', discount: '$30 Gift Card', points: 7500, image: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg' }
  ];

  const practiceTests = [
    {
      name: 'Python Basics',
      progress: 50,
      reward: { icon: '🐍', color: 'bg-green-500' },
      steps: [
        { name: 'Variables', completed: true },
        { name: 'Loops', completed: true },
        { name: 'Functions', completed: false }
      ]
    },
    {
      name: 'JavaScript Advanced',
      progress: 20,
      reward: { icon: '📜', color: 'bg-yellow-500' },
      steps: [
        { name: 'Closures', completed: false },
        { name: 'Promises', completed: false }
      ]
    }
  ];

  const handleRedeem = (reward) => {
    if (userPoints >= reward.points) {
      setUserPoints(userPoints - reward.points);
      alert(`You have successfully redeemed ${reward.brand} ${reward.discount}!`);
    } else {
      alert('Not enough points to redeem this reward.');
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (
        selectedFile.type.startsWith('image/') ||
        selectedFile.type === 'application/pdf'
      ) {
        setFile(selectedFile);
        if (selectedFile.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setPreview(reader.result);
          };
          reader.readAsDataURL(selectedFile);
        } else {
          setPreview(null);
        }
        setUploadError(null);
      } else {
        setUploadError('Please upload an image or PDF file');
        setFile(null);
        setPreview(null);
      }
    }
  };

  const calculatePoints = () => {
    let points = POINTS_PER_CERTIFICATE;
    if (certificateCount === 0) {
      points += POINTS_FOR_FIRST_UPLOAD;
    }
    if (certificateCount > 0) {
      points += STREAK_BONUS;
    }
    return points;
  };

  const updateUserProgress = (points) => {
    const newTotal = userPoints + points;
    setUserPoints(newTotal);

    const newLevel = Math.floor(newTotal / 500) + 1;
    if (newLevel !== userLevel) {
      setUserLevel(newLevel);
      unlockAchievement('level_up', `Reached Level ${newLevel}!`);
    }
  };

  const unlockAchievement = (id, title) => {
    if (!achievements.find((a) => a.id === id)) {
      setAchievements([...achievements, { id, title, date: new Date() }]);
    }
  };

  const checkAchievements = () => {
    if (certificateCount === 0) {
      unlockAchievement('first_certificate', 'First Certificate Uploaded!');
    }
    if ((certificateCount + 1) % 5 === 0) {
      unlockAchievement(
        `certificate_${certificateCount + 1}`,
        `Uploaded ${certificateCount + 1} Certificates!`
      );
    }
  };

  const uploadCertificate = async () => {
    try {
      setLoadingUpload(true);
      setUploadError(null);
      setUploadProgress(0);
  
      // Create FormData
      const formData = new FormData();
      formData.append('file', file);
  
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => (prev >= 90 ? prev : prev + 10));
      }, 500);
  
      // Make the API call
      const response = await fetch('http://localhost:5006/verify-certificate', {
        method: 'POST',
        body: formData,
      });
  
      clearInterval(progressInterval);
      setUploadProgress(95);
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to verify certificate');
      }
  
      const data = await response.json();
      
      if (data.status === 'error') {
        throw new Error(data.message);
      }
  
      setUploadProgress(100);
  
      // Process verification result
      if (data.authenticity_report.authentic) {
        // Certificate is authentic
        const points = calculatePoints();
        updateUserProgress(points);
        setCertificateCount((prev) => prev + 1);
        checkAchievements();
  
        // Show success message
        alert('Certificate verified successfully! Points awarded: ' + points);
      } else {
        // Certificate verification failed
        throw new Error(
          'Certificate verification failed: ' + 
          (data.authenticity_report.reasons?.join(', ') || 'Invalid certificate')
        );
      }
  
    } catch (error) {
      setUploadError(error.message);
      console.error('Certificate verification error:', error);
    } finally {
      setLoadingUpload(false);
      setFile(null);
      setPreview(null);
      setUploadProgress(0);
    }
  };

  const streakDays = Array(30).fill(null).map((_, index) => ({
    day: index + 1,
    active: index < 7
  }));

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'} transition-colors duration-200`}>
      {/* Header */}
      <div className={`p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <span className="text-white font-bold">JD</span>
            </div>
            <div>
              <h2 className="font-bold">anirudh</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <button className="flex items-center text-sm text-gray-500 hover:text-blue-500 transition-colors">
                    <Trophy className="w-4 h-4 mr-1" />
                    <span>#25 Global</span>
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh]">
                  <DialogHeader>
                    <DialogTitle>Global Leaderboard</DialogTitle>
                  </DialogHeader>
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <div className="relative flex-1 mr-4">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search users..."
                          className={`w-full pl-10 pr-4 py-2 rounded-lg ${
                            darkMode 
                              ? 'bg-gray-700 text-white' 
                              : 'bg-gray-100'
                          }`}
                        />
                      </div>
                      <select
                        value={leaderboardFilter}
                        onChange={(e) => setLeaderboardFilter(e.target.value)}
                        className={`p-2 rounded-lg ${
                          darkMode 
                            ? 'bg-gray-700 text-white' 
                            : 'bg-gray-100'
                        }`}
                      >
                        <option value="global">Global</option>
                        <option value="country">Country</option>
                        <option value="friends">Friends</option>
                      </select>
                    </div>
                    <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                      {Array(100).fill(null).map((_, index) => (
                        <LeaderboardEntry
                          key={index}
                          rank={index + 1}
                          user={`User ${index + 1}`}
                          points={10000 - index * 50}
                          badges={badges.slice(0, 3)}
                          isCurrentUser={index === 24}
                          darkMode={darkMode}
                        />
                      ))}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition">
              <Trophy className="w-4 h-4 mr-2" />
              <span>Level {userLevel} • {userPoints} XP</span>
            </button>
            
            <Sheet>
              <SheetTrigger asChild>
                <button className="flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition">
                  <Flame className="w-4 h-4 mr-2" />
                  <span>7 Day Streak!</span>
                </button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Your Learning Streak</SheetTitle>
                </SheetHeader>
                <div className="p-4">
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold mb-1">Current Streak: 7 days</h3>
                        <p className="text-gray-500">Longest Streak: 15 days</p>
                      </div>
                      <div className="p-3 bg-orange-500 rounded-full">
                        <Flame className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-500 rounded-full h-2 w-[47%]"></div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">7 days to next reward!</p>
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {streakDays.map((day, index) => (
                      <div
                        key={index}
                        className={`aspect-square rounded-lg flex items-center justify-center text-sm ${
                          day.active
                            ? 'bg-orange-500 text-white'
                            : darkMode
                            ? 'bg-gray-700'
                            : 'bg-gray-200'
                        }`}
                      >
                        {day.day}
                      </div>
                    ))}
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg ${
                darkMode ? 'bg-gray-700' : 'bg-gray-200'
              }`}
            >
              {darkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Left Sidebar */}
          <div className="col-span-3 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {courses.map(course => (
                    <button
                      key={course.id}
                      onClick={() => setSelectedCourse(course.name)}
                      className={`w-full p-3 rounded-lg flex items-center justify-between ${
                        selectedCourse === course.name
                          ? 'bg-blue-500 text-white'
                          : darkMode
                          ? 'bg-gray-800 hover:bg-gray-700'
                          : 'bg-gray-100 hover:bg-gray-200'
                      } transition-colors`}
                    >
                      <span>{course.name}</span>
                      <div className="flex items-center">
                        <span className="mr-2">{course.progress}%</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Badges</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2">
                  {badges.map(badge => (
                    <div
                      key={badge.id}
                      className={`relative p-2 rounded-lg ${badge.color} cursor-pointer transition-transform hover:scale-105`}
                      title={badge.name}
                    >
                      <div className="flex items-center justify-center text-white text-xl">
                        {badge.icon}
                      </div>
                      {badge.locked && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                          <Lock className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rewards</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rewards.map((reward, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg ${
                        darkMode ? 'bg-gray-800' : 'bg-gray-100'
                      } flex items-center justify-between`}
                    >
                      <div className="flex items-center space-x-4">
                        <img
                          src={reward.image}
                          alt={reward.brand}
                          className="w-10 h-10"
                        />
                        <div>
                          <h4 className="font-medium">{reward.brand}</h4>
                          <p className="text-sm text-gray-500">
                            {reward.discount}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRedeem(reward)}
                        className={`px-4 py-2 rounded-lg ${
                          userPoints >= reward.points
                            ? 'bg-blue-500 hover:bg-blue-600 text-white'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        } transition-colors`}
                        disabled={userPoints < reward.points}
                      >
                        {reward.points} pts
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="col-span-6 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Course Challenges</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {challenges[selectedCourse].map((challenge, index) => (
                    <CourseChallenge
                      key={index}
                      challenge={challenge}
                      darkMode={darkMode}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Practice Tests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {practiceTests.map((test, index) => (
                    <CourseChallenge
                      key={index}
                      challenge={test}
                      darkMode={darkMode}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Certificate Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Award className="w-6 h-6" />
                  Certificate Verification
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Upload Area */}
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept="image/*,.pdf"
                      className="hidden"
                      id="certificate-upload"
                    />
                    <label
                      htmlFor="certificate-upload"
                      className="cursor-pointer flex flex-col items-center space-y-2"
                    >
                      <Upload className="w-8 h-8 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        Drop your certificate here or click to upload
                      </span>
                      <span className="text-xs text-gray-400">Supports images and PDF files</span>
                    </label>
                  </div>

                  {/* Preview Area */}
                  {file && (
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <BookOpen className="w-6 h-6 text-blue-500" />
                          <div>
                            <p className="text-sm font-medium">{file.name}</p>
                            <p className="text-xs text-gray-500">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button onClick={uploadCertificate} disabled={loadingUpload}>
                          {loadingUpload ? 'Verifying...' : 'Verify Certificate'}
                        </Button>
                      </div>

                      {preview && (
                        <div className="mt-4">
                          <img
                            src={preview}
                            alt="Certificate preview"
                            className="max-h-64 mx-auto rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Upload Progress */}
                  {loadingUpload && (
                    <div className="space-y-2">
                      <Progress value={uploadProgress} />
                      <p className="text-sm text-gray-500 text-center">
                        Verifying certificate...
                      </p>
                    </div>
                  )}

                  {/* Error Message */}
                  {uploadError && (
                    <Alert variant="destructive">
                      <AlertDescription>{uploadError}</AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="col-span-3 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Deadlines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {challenges[selectedCourse]
                    .filter((challenge) => challenge.deadline)
                    .map((challenge, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg ${
                          darkMode ? 'bg-gray-800' : 'bg-gray-100'
                        }`}
                      >
                        <h4 className="font-medium">{challenge.name}</h4>
                        <p className="text-sm text-gray-500">
                          {challenge.deadline}
                        </p>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {achievements.slice(-3).reverse().map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`p-4 rounded-lg ${
                        darkMode ? 'bg-gray-800' : 'bg-gray-100'
                      } flex items-center space-x-4`}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-medium">{achievement.title}</h4>
                        <p className="text-sm text-gray-500">
                          {new Date(achievement.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedLearningPlatform;