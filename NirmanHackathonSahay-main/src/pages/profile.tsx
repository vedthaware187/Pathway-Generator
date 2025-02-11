// profile.tsx
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  User,
  Plus,
  X,
  Upload,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface FormData {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    gender: string;
    location: string;
    profilePicture: File | null;
    bio: string;
    linkedinUrl: string;
    githubUrl: string;
    portfolioUrl: string;
  };
  education: {
    currentLevel: string;
    institution: string;
    field: string;
    graduationYear: string;
    cgpa: string;
    achievements: string[];
    // Certifications field removed.
  };
  skills: {
    technical: { skill: string; level: string }[];
    soft: { skill: string; level: string }[];
    languages: { language: string; proficiency: string }[];
  };
}

const Profile = () => {
  const { toast } = useToast();
  const [formProgress, setFormProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      location: '',
      profilePicture: null,
      bio: '',
      linkedinUrl: '',
      githubUrl: '',
      portfolioUrl: ''
    },
    education: {
      currentLevel: '',
      institution: '',
      field: '',
      graduationYear: '',
      cgpa: '',
      achievements: [''],
      // Removed certifications initial value.
    },
    skills: {
      technical: [{ skill: '', level: 'Beginner' }],
      soft: [{ skill: '', level: 'Beginner' }],
      languages: [{ language: '', proficiency: 'Basic' }]
    },
  });

  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const handleInputChange = (section: keyof FormData, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    updateProgress();
  };

  const updateProgress = () => {
    const calculateSectionProgress = (section: any): number => {
      const fields = Object.entries(section);
      const filledFields = fields.filter(([_, value]) => {
        if (Array.isArray(value)) {
          return value.length > 0 && value.every((item: any) => 
            typeof item === 'string' ? item.trim() !== '' : 
            typeof item === 'object' && item !== null && 
            Object.values(item).some(v => typeof v === 'string' && v.trim() !== '')
          );
        }
        return value !== null && value !== '';
      }).length;
      return (filledFields / fields.length) * 100;
    };

    const personalProgress = calculateSectionProgress(formData.personalInfo);
    const educationProgress = calculateSectionProgress(formData.education);
    const skillsProgress = calculateSectionProgress(formData.skills);

    const totalProgress = (personalProgress + educationProgress + skillsProgress) / 3;
    setFormProgress(totalProgress);
  };

  const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
  
    if (file.type !== 'application/pdf') {
      setUploadError('Please upload a PDF file');
      return;
    }
  
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setUploadError('File size should be less than 10MB');
      return;
    }
  
    setIsUploading(true);
    setUploadError(null);
    setResumeFile(file);

    try {
      // First, save the resume
      const saveFormData = new FormData();
      saveFormData.append('resume', file);
      
      // Add other required fields with minimal data to satisfy the API
      saveFormData.append('personalInfo', JSON.stringify({
        firstName: formData.personalInfo.firstName || '',
        lastName: formData.personalInfo.lastName || '',
        email: formData.personalInfo.email || ''
      }));
      
      saveFormData.append('education', JSON.stringify({
        currentLevel: '',
        institution: '',
        achievements: []
      }));
      
      saveFormData.append('skills', JSON.stringify({
        technical: [],
        soft: [],
        languages: []
      }));

      
      // Now process the resume for autofill
      const autofillFormData = new FormData();
      autofillFormData.append('resume', file);

      const autofillResponse = await fetch('http://localhost:5002/api/auto-fill-resume', {
        method: 'POST',
        body: autofillFormData,
      });

      if (!autofillResponse.ok) {
        throw new Error('Failed to parse resume');
      }

      const result = await autofillResponse.json();
      const parsedData = result.data;

      // Update form with parsed data
      setFormData(prev => ({
        personalInfo: {
          ...prev.personalInfo,
          firstName: parsedData.personal_information?.name?.split(' ')[0] || '',
          lastName: parsedData.personal_information?.name?.split(' ').slice(1).join(' ') || '',
          email: parsedData.personal_information?.email || '',
          phone: parsedData.personal_information?.phone || '',
          location: parsedData.personal_information?.location || '',
        },
        education: {
          ...prev.education,
          currentLevel: parsedData.education?.current_level || '',
          institution: parsedData.education?.institution || '',
          field: parsedData.education?.field || '',
          graduationYear: parsedData.education?.graduation_year || '',
          cgpa: parsedData.education?.cgpa || '',
        },
        skills: {
          technical: parsedData.technical_skills?.map((skill: any) => ({
            skill: skill.name,
            level: skill.level,
          })) || [],
          soft: parsedData.soft_skills?.map((skill: any) => ({
            skill: skill.name,
            level: skill.level,
          })) || [],
          languages: parsedData.languages?.map((lang: any) => ({
            language: lang.name,
            proficiency: lang.proficiency,
          })) || [],
        },
      }));

      toast({
        title: "Success",
        description: "Resume uploaded and parsed successfully!",
      });

      updateProgress();
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Failed to process resume');
      console.error('Resume processing error:', error);
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "Error",
        description: "Image size should be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    handleInputChange('personalInfo', 'profilePicture', file);
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!formData.personalInfo.firstName && 
               !!formData.personalInfo.lastName && 
               !!formData.personalInfo.email;
      case 2:
        return !!formData.education.currentLevel && 
               !!formData.education.institution;
      case 3:
        return formData.skills.technical.some(skill => !!skill.skill) ||
               formData.skills.soft.some(skill => !!skill.skill) ||
               formData.skills.languages.some(lang => !!lang.language);
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    try {
      const submitData = new FormData();
  
      // Append profile picture if exists
      if (formData.personalInfo.profilePicture) {
        submitData.append(
          'profilePicture', 
          formData.personalInfo.profilePicture,
          'profile.jpg'
        );
      }
  
      // Append resume if exists
      if (resumeFile) {
        submitData.append('resume', resumeFile, 'resume.pdf');
      }
  
      // Append other data as JSON
      submitData.append('personalInfo', JSON.stringify(formData.personalInfo));
      submitData.append('education', JSON.stringify(formData.education));
      submitData.append('skills', JSON.stringify(formData.skills));
  
      const response = await fetch('http://localhost:5000/api/profile', {
        method: 'POST',
        body: submitData,
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit profile');
      }
  
      const data = await response.json();
      
      toast({
        title: "Success",
        description: "Your profile has been submitted successfully!",
      });
  
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to submit profile',
        variant: "destructive",
      });
    }
  };

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-center mb-8">
        <div className="relative">
          <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            {previewUrl ? (
              <img 
                src={previewUrl}
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-12 h-12 text-gray-400" />
            )}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="absolute bottom-0 right-0"
            onClick={() => document.getElementById('profile-upload')?.click()}
          >
            <Upload className="w-4 h-4" />
          </Button>
          <input
            id="profile-upload"
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleProfilePictureChange}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          placeholder="First Name"
          value={formData.personalInfo.firstName}
          onChange={(e) => handleInputChange('personalInfo', 'firstName', e.target.value)}
        />
        <Input
          placeholder="Last Name"
          value={formData.personalInfo.lastName}
          onChange={(e) => handleInputChange('personalInfo', 'lastName', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          type="email"
          placeholder="Email Address"
          value={formData.personalInfo.email}
          onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
        />
        <Input
          type="tel"
          placeholder="Phone Number"
          value={formData.personalInfo.phone}
          onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          type="date"
          placeholder="Date of Birth"
          value={formData.personalInfo.dateOfBirth}
          onChange={(e) => handleInputChange('personalInfo', 'dateOfBirth', e.target.value)}
        />
        <Select
          value={formData.personalInfo.gender}
          onValueChange={(value) => handleInputChange('personalInfo', 'gender', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
            <SelectItem value="other">Other</SelectItem>
            <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Input
        placeholder="Location (City, Country)"
        value={formData.personalInfo.location}
        onChange={(e) => handleInputChange('personalInfo', 'location', e.target.value)}
      />

      <Textarea
        placeholder="Tell us about yourself..."
        value={formData.personalInfo.bio}
        onChange={(e) => handleInputChange('personalInfo', 'bio', e.target.value)}
        rows={4}
      />

      <div className="space-y-4">
        <Input
          placeholder="LinkedIn URL"
          value={formData.personalInfo.linkedinUrl}
          onChange={(e) => handleInputChange('personalInfo', 'linkedinUrl', e.target.value)}
        />
        <Input
          placeholder="GitHub URL"
          value={formData.personalInfo.githubUrl}
          onChange={(e) => handleInputChange('personalInfo', 'githubUrl', e.target.value)}
        />
        <Input
          placeholder="Portfolio URL"
          value={formData.personalInfo.portfolioUrl}
          onChange={(e) => handleInputChange('personalInfo', 'portfolioUrl', e.target.value)}
        />
      </div>
    </div>
  );

  const renderEducation = () => (
    <div className="space-y-6">
      <Select
        value={formData.education.currentLevel}
        onValueChange={(value) => handleInputChange('education', 'currentLevel', value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Current Education Level" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="high-school">High School</SelectItem>
          <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
          <SelectItem value="masters">Master's Degree</SelectItem>
          <SelectItem value="phd">Ph.D.</SelectItem>
          <SelectItem value="other">Other</SelectItem>
        </SelectContent>
      </Select>

      <Input
        placeholder="Institution Name"
        value={formData.education.institution}
        onChange={(e) => handleInputChange('education', 'institution', e.target.value)}
      />

      <Input
        placeholder="Field of Study"
        value={formData.education.field}
        onChange={(e) => handleInputChange('education', 'field', e.target.value)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          type="number"
          placeholder="Graduation Year"
          value={formData.education.graduationYear}
          onChange={(e) => handleInputChange('education', 'graduationYear', e.target.value)}
        />
        <Input
          type="number"
          step="0.01"
          placeholder="CGPA"
          value={formData.education.cgpa}
          onChange={(e) => handleInputChange('education', 'cgpa', e.target.value)}
        />
      </div>

      <div className="space-y-4">
        <h4 className="font-medium">Academic Achievements</h4>
        {formData.education.achievements.map((achievement, index) => (
          <div key={index} className="flex gap-2">
            <Input
              placeholder="Achievement"
              value={achievement}
              onChange={(e) => {
                const newAchievements = [...formData.education.achievements];
                newAchievements[index] = e.target.value;
                handleInputChange('education', 'achievements', newAchievements);
              }}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                const newAchievements = formData.education.achievements.filter((_, i) => i !== index);
                handleInputChange('education', 'achievements', newAchievements);
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
        <Button
          variant="outline"
          onClick={() => {
            handleInputChange('education', 'achievements', [...formData.education.achievements, '']);
          }}
        >
          <Plus className="w-4 h-4 mr-2" /> Add Achievement
        </Button>
      </div>
      {/* Certifications section removed */}
    </div>
  );

  const renderSkills = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h4 className="font-medium">Technical Skills</h4>
        {formData.skills.technical.map((skill, index) => (
          <div key={index} className="flex gap-4">
            <Input
              placeholder="Skill (e.g., Python, React)"
              value={skill.skill}
              onChange={(e) => {
                const newSkills = [...formData.skills.technical];
                newSkills[index] = { ...skill, skill: e.target.value };
                handleInputChange('skills', 'technical', newSkills);
              }}
            />
            <Select
              value={skill.level}
              onValueChange={(value) => {
                const newSkills = [...formData.skills.technical];
                newSkills[index] = { ...skill, level: value };
                handleInputChange('skills', 'technical', newSkills);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Skill Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
                <SelectItem value="Expert">Expert</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                const newSkills = formData.skills.technical.filter((_, i) => i !== index);
                handleInputChange('skills', 'technical', newSkills);
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
        <Button
          variant="outline"
          onClick={() => {
            handleInputChange('skills', 'technical', [
              ...formData.skills.technical,
              { skill: '', level: 'Beginner' }
            ]);
          }}
        >
          <Plus className="w-4 h-4 mr-2" /> Add Technical Skill
        </Button>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium">Soft Skills</h4>
        {formData.skills.soft.map((skill, index) => (
          <div key={index} className="flex gap-4">
            <Input
              placeholder="Skill (e.g., Leadership, Communication)"
              value={skill.skill}
              onChange={(e) => {
                const newSkills = [...formData.skills.soft];
                newSkills[index] = { ...skill, skill: e.target.value };
                handleInputChange('skills', 'soft', newSkills);
              }}
            />
            <Select
              value={skill.level}
              onValueChange={(value) => {
                const newSkills = [...formData.skills.soft];
                newSkills[index] = { ...skill, level: value };
                handleInputChange('skills', 'soft', newSkills);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Skill Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Beginner">Basic</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
                <SelectItem value="Expert">Expert</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                const newSkills = formData.skills.soft.filter((_, i) => i !== index);
                handleInputChange('skills', 'soft', newSkills);
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
        <Button
          variant="outline"
          onClick={() => {
            handleInputChange('skills', 'soft', [
              ...formData.skills.soft,
              { skill: '', level: 'Beginner' }
            ]);
          }}
        >
          <Plus className="w-4 h-4 mr-2" /> Add Soft Skill
        </Button>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium">Languages</h4>
        {formData.skills.languages.map((lang, index) => (
          <div key={index} className="flex gap-4">
            <Input
              placeholder="Language"
              value={lang.language}
              onChange={(e) => {
                const newLangs = [...formData.skills.languages];
                newLangs[index] = { ...lang, language: e.target.value };
                handleInputChange('skills', 'languages', newLangs);
              }}
            />
            <Select
              value={lang.proficiency}
              onValueChange={(value) => {
                const newLangs = [...formData.skills.languages];
                newLangs[index] = { ...lang, proficiency: value };
                handleInputChange('skills', 'languages', newLangs);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Proficiency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Basic">Basic</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
                <SelectItem value="Native">Native</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                const newLangs = formData.skills.languages.filter((_, i) => i !== index);
                handleInputChange('skills', 'languages', newLangs);
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
        <Button
          variant="outline"
          onClick={() => {
            handleInputChange('skills', 'languages', [
              ...formData.skills.languages,
              { language: '', proficiency: 'Basic' }
            ]);
          }}
        >
          <Plus className="w-4 h-4 mr-2" /> Add Language
        </Button>
      </div>
    </div>
  );
  const renderResumeUpload = () => (
    <div className="mb-6 p-4 border-2 border-dashed rounded-lg">
      <div className="text-center">
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <div className="mt-4">
          <label htmlFor="resume-upload" className="cursor-pointer">
            <span className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-500">
              Upload your resume to autofill the form
            </span>
            <input
              id="resume-upload"
              type="file"
              className="hidden"
              accept=".pdf"
              onChange={handleResumeUpload}
              disabled={isUploading}
            />
          </label>
          <p className="mt-1 text-xs text-gray-500">PDF up to 10MB</p>
          {/* Conditionally render the file name if a file has been selected */}
          {resumeFile && (
            <p className="mt-2 text-sm font-medium text-gray-700">
              {resumeFile.name}
            </p>
          )}
        </div>
      </div>
      {isUploading && (
        <div className="mt-4 text-center">
          <Progress value={undefined} className="w-full h-2" />
          <p className="mt-2 text-sm text-gray-500">Parsing resume...</p>
        </div>
      )}
      {uploadError && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{uploadError}</AlertDescription>
        </Alert>
      )}
    </div>
  );
  
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderPersonalInfo();
      case 2:
        return renderEducation();
      case 3:
        return renderSkills();
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Student Profile</CardTitle>
          <CardDescription>
            Fill out your profile information or upload your resume to autofill
          </CardDescription>
          <Progress value={formProgress} className="h-2" />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>Step {currentStep} of 3</span>
            <span>{Math.round(formProgress)}% Complete</span>
          </div>
        </CardHeader>
        <CardContent>
          {currentStep === 1 && renderResumeUpload()}
          {renderStepContent()}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              disabled={currentStep === 1}
              onClick={() => setCurrentStep(currentStep - 1)}
            >
              Previous
            </Button>
            <Button
              onClick={() => {
                if (currentStep === 3) {
                  handleSubmit();
                } else {
                  if (validateStep(currentStep)) {
                    setCurrentStep(currentStep + 1);
                  } else {
                    toast({
                      title: "Validation Error",
                      description: "Please fill in all required fields before proceeding.",
                      variant: "destructive",
                    });
                  }
                }
              }}
            >
              {currentStep === 3 ? (
                isUploading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  "Submit"
                )
              ) : (
                "Next"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
