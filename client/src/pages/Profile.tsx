import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Calendar, Save, Sparkles, Target, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const CURRICULA = ['CBSE', 'ICSE', 'IB', 'A-Levels', 'AP', 'State Board'];
const GRADES = ['6', '7', '8', '9', '10', '11', '12'];
const EXAMS = ['JEE', 'NEET', 'SAT', 'ACT', 'GRE', 'GMAT', 'IELTS', 'TOEFL'];
const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Computer Science', 'History', 'Geography'];
const LANGUAGES = ['English', 'Hindi', 'Spanish', 'French', 'German', 'Mandarin'];

export default function Profile() {
  const { data: profile, refetch } = trpc.profile.get.useQuery();

  const [formData, setFormData] = useState({
    country: '',
    curriculum: '',
    grade: '',
    targetExams: [] as string[],
    preferredLanguages: [] as string[],
    preferredSubjects: [] as string[],
    studyHoursPerDay: 2,
  });

  const [studyPlanData, setStudyPlanData] = useState({
    targetExam: '',
    startDate: '',
    endDate: '',
    dailyTargetMinutes: 120,
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        country: profile.country || '',
        curriculum: profile.curriculum || '',
        grade: profile.grade || '',
        targetExams: profile.targetExams || [],
        preferredLanguages: profile.preferredLanguages || [],
        preferredSubjects: profile.preferredSubjects || [],
        studyHoursPerDay: profile.studyHoursPerDay || 2,
      });
    }
  }, [profile]);

  const updateProfileMutation = trpc.profile.update.useMutation({
    onSuccess: () => {
      toast.success('Profile updated successfully!');
      refetch();
    },
    onError: () => {
      toast.error('Failed to update profile');
    },
  });

  const generateStudyPlanMutation = trpc.profile.generateStudyPlan.useMutation({
    onSuccess: () => {
      toast.success('Study plan generated successfully!');
    },
    onError: () => {
      toast.error('Failed to generate study plan');
    },
  });

  const handleUpdateProfile = () => {
    updateProfileMutation.mutate(formData);
  };

  const handleGenerateStudyPlan = () => {
    if (!studyPlanData.targetExam || !studyPlanData.startDate || !studyPlanData.endDate) {
      toast.error('Please fill all study plan fields');
      return;
    }
    generateStudyPlanMutation.mutate(studyPlanData);
  };

  const toggleArrayItem = (array: string[], item: string) => {
    if (array.includes(item)) {
      return array.filter(i => i !== item);
    }
    return [...array, item];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Student Profile</h1>
          <p className="text-muted-foreground">
            Manage your learning preferences and goals
          </p>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Basic Information
              </CardTitle>
              <CardDescription>Your educational background and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="e.g., India"
                  />
                </div>

                <div>
                  <Label htmlFor="curriculum">Curriculum/Board</Label>
                  <Select
                    value={formData.curriculum}
                    onValueChange={(value) => setFormData({ ...formData, curriculum: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select curriculum" />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRICULA.map((curr) => (
                        <SelectItem key={curr} value={curr}>
                          {curr}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="grade">Grade/Level</Label>
                  <Select
                    value={formData.grade}
                    onValueChange={(value) => setFormData({ ...formData, grade: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {GRADES.map((grade) => (
                        <SelectItem key={grade} value={grade}>
                          Grade {grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="studyHours">Daily Study Hours</Label>
                  <Input
                    id="studyHours"
                    type="number"
                    min="1"
                    max="12"
                    value={formData.studyHoursPerDay}
                    onChange={(e) => setFormData({ ...formData, studyHoursPerDay: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <Label>Target Exams</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {EXAMS.map((exam) => (
                    <Button
                      key={exam}
                      variant={formData.targetExams.includes(exam) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFormData({
                        ...formData,
                        targetExams: toggleArrayItem(formData.targetExams, exam),
                      })}
                    >
                      {exam}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Preferred Subjects</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {SUBJECTS.map((subject) => (
                    <Button
                      key={subject}
                      variant={formData.preferredSubjects.includes(subject) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFormData({
                        ...formData,
                        preferredSubjects: toggleArrayItem(formData.preferredSubjects, subject),
                      })}
                    >
                      {subject}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Preferred Languages</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {LANGUAGES.map((lang) => (
                    <Button
                      key={lang}
                      variant={formData.preferredLanguages.includes(lang) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFormData({
                        ...formData,
                        preferredLanguages: toggleArrayItem(formData.preferredLanguages, lang),
                      })}
                    >
                      {lang}
                    </Button>
                  ))}
                </div>
              </div>

              <Button
                className="w-full"
                onClick={handleUpdateProfile}
                disabled={updateProfileMutation.isPending}
              >
                <Save className="mr-2 h-4 w-4" />
                {updateProfileMutation.isPending ? 'Saving...' : 'Save Profile'}
              </Button>
            </CardContent>
          </Card>

          {/* AI Study Plan Generator */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-600" />
                AI Study Plan Generator
              </CardTitle>
              <CardDescription>
                Generate a personalized study plan based on your goals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="targetExam">Target Exam</Label>
                <Select
                  value={studyPlanData.targetExam}
                  onValueChange={(value) => setStudyPlanData({ ...studyPlanData, targetExam: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select target exam" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXAMS.map((exam) => (
                      <SelectItem key={exam} value={exam}>
                        {exam}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={studyPlanData.startDate}
                    onChange={(e) => setStudyPlanData({ ...studyPlanData, startDate: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="endDate">Target Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={studyPlanData.endDate}
                    onChange={(e) => setStudyPlanData({ ...studyPlanData, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="dailyMinutes">Daily Study Time (minutes)</Label>
                <Input
                  id="dailyMinutes"
                  type="number"
                  min="30"
                  max="720"
                  value={studyPlanData.dailyTargetMinutes}
                  onChange={(e) => setStudyPlanData({ ...studyPlanData, dailyTargetMinutes: parseInt(e.target.value) })}
                />
              </div>

              <Button
                className="w-full"
                onClick={handleGenerateStudyPlan}
                disabled={generateStudyPlanMutation.isPending}
              >
                <Target className="mr-2 h-4 w-4" />
                {generateStudyPlanMutation.isPending ? 'Generating...' : 'Generate Study Plan'}
              </Button>

              {generateStudyPlanMutation.isSuccess && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    ✓ Study plan generated successfully! Check your dashboard for details.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Profile Completion Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Profile Completion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Basic Information</span>
                  <span className={formData.curriculum && formData.grade ? 'text-green-600' : 'text-orange-600'}>
                    {formData.curriculum && formData.grade ? '✓ Complete' : '○ Incomplete'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Target Exams</span>
                  <span className={formData.targetExams.length > 0 ? 'text-green-600' : 'text-orange-600'}>
                    {formData.targetExams.length > 0 ? '✓ Complete' : '○ Incomplete'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Preferred Subjects</span>
                  <span className={formData.preferredSubjects.length > 0 ? 'text-green-600' : 'text-orange-600'}>
                    {formData.preferredSubjects.length > 0 ? '✓ Complete' : '○ Incomplete'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Study Plan</span>
                  <span className="text-orange-600">○ Generate to complete</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
