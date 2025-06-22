import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageLayout from '@/components/layout/PageLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface Template {
  id: number;
  category: string;
  question: string;
  questionType: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date' | 'number';
  options?: Option[];
  description?: string;
  commonFields?: string[];
}

interface UserAnswer {
  id?: number;
  templateId: number;
  answer: string | string[] | number;
}

const TemplatesPage: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('work_history');
  const [userAnswers, setUserAnswers] = useState<Record<number, string | string[] | number>>({});

  // Fetch all templates
  const { data: templatesData, isLoading: templatesLoading } = useQuery({
    queryKey: ['/api/questions'],
    staleTime: 60000,
  });

  // Fetch user's saved answers
  const { data: userAnswersData, isLoading: answersLoading } = useQuery({
    queryKey: ['/api/answers'],
    staleTime: 60000,
  });
  
  // Type guard for user answers
  interface UserAnswersResponse { answers: UserAnswer[] }
  
  const hasAnswers = (data: any): data is UserAnswersResponse => {
    return data && Array.isArray(data.answers);
  };
  
  // Process user answers when data changes
  React.useEffect(() => {
    if (hasAnswers(userAnswersData)) {
      const answers: Record<number, string | string[] | number> = {};
      userAnswersData.answers.forEach((answer: UserAnswer) => {
        answers[answer.templateId] = answer.answer;
      });
      setUserAnswers(answers);
    }
  }, [userAnswersData]);

  // Save answer mutation
  const saveAnswerMutation = useMutation({
    mutationFn: async (data: { templateId: number; answer: string | string[] | number }) => {
      const response = await fetch('/api/answers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to save answer');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/answers'] });
      toast({
        title: 'Answer saved',
        description: 'Your response has been saved successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to save your answer. Please try again.',
        variant: 'destructive',
      });
      console.error('Save answer error:', error);
    },
  });

  // Handle answering a question
  const handleAnswerChange = (templateId: number, value: string | string[] | number) => {
    setUserAnswers((prev) => ({
      ...prev,
      [templateId]: value,
    }));
  };

  // Handle saving an answer
  const handleSaveAnswer = (templateId: number) => {
    const answer = userAnswers[templateId];
    if (answer === undefined) return;

    saveAnswerMutation.mutate({
      templateId,
      answer,
    });
  };

  // Group templates by category
  const templatesByCategory: Record<string, Template[]> = {};
  
  // Type guard to ensure templatesData has the correct structure
  const hasTemplates = (data: any): data is Template[] => {
    return Array.isArray(data);
  };
  
  if (hasTemplates(templatesData)) {
    templatesData.forEach((template: Template) => {
      if (!templatesByCategory[template.category]) {
        templatesByCategory[template.category] = [];
      }
      templatesByCategory[template.category].push(template);
    });
  }

  // Get unique categories
  const categories = Object.keys(templatesByCategory);

  // Helper to transform category IDs to readable names
  const getCategoryName = (category: string): string => {
    const names: Record<string, string> = {
      work_history: 'Work History',
      skills: 'Skills',
      education: 'Education',
      personal: 'Personal',
      behavioral: 'Behavioral',
      situational: 'Situational',
    };
    return names[category] || category.charAt(0).toUpperCase() + category.slice(1);
  };

  // Render specific input based on template type
  const renderQuestionInput = (template: Template) => {
    const value = userAnswers[template.id] || '';
    
    switch (template.questionType) {
      case 'text':
        return (
          <Input
            value={value as string}
            onChange={(e) => handleAnswerChange(template.id, e.target.value)}
            placeholder="Your answer"
          />
        );
      case 'textarea':
        return (
          <Textarea
            value={value as string}
            onChange={(e) => handleAnswerChange(template.id, e.target.value)}
            placeholder="Your answer"
            rows={4}
          />
        );
      case 'select':
        return (
          <Select
            value={value as string}
            onValueChange={(val) => handleAnswerChange(template.id, val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {template.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'radio':
        return (
          <RadioGroup
            value={value as string}
            onValueChange={(val) => handleAnswerChange(template.id, val)}
          >
            {template.options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`${template.id}-${option.value}`} />
                <Label htmlFor={`${template.id}-${option.value}`}>{option.label}</Label>
              </div>
            ))}
          </RadioGroup>
        );
      case 'checkbox':
        return (
          <div className="space-y-2">
            {template.options?.map((option) => {
              const values = (value as string[]) || [];
              return (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${template.id}-${option.value}`}
                    checked={values.includes(option.value)}
                    onCheckedChange={(checked) => {
                      const newValues = [...values];
                      if (checked) {
                        if (!newValues.includes(option.value)) {
                          newValues.push(option.value);
                        }
                      } else {
                        const index = newValues.indexOf(option.value);
                        if (index !== -1) {
                          newValues.splice(index, 1);
                        }
                      }
                      handleAnswerChange(template.id, newValues);
                    }}
                  />
                  <Label htmlFor={`${template.id}-${option.value}`}>{option.label}</Label>
                </div>
              );
            })}
          </div>
        );
      case 'number':
        return (
          <Input
            type="number"
            value={value as string}
            onChange={(e) => handleAnswerChange(template.id, parseFloat(e.target.value) || 0)}
            placeholder="Your answer"
          />
        );
      case 'date':
        return (
          <Input
            type="date"
            value={value as string}
            onChange={(e) => handleAnswerChange(template.id, e.target.value)}
          />
        );
      default:
        return <div>Unsupported question type: {template.questionType}</div>;
    }
  };

  if (templatesLoading || answersLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-2">Loading templates...</span>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Application Templates</h1>
        <p className="mb-6 text-gray-600">
          Save your answers to common job application questions to make filling out applications faster 
          and more consistent. Your answers will be available to the browser extension when you apply for jobs.
        </p>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="mb-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 w-full">
            {categories.map((category) => (
              <TabsTrigger
                key={category}
                value={category}
                className="whitespace-nowrap"
              >
                {getCategoryName(category)}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category} value={category} className="space-y-4">
              <Accordion type="single" collapsible className="w-full">
                {templatesByCategory[category].map((template) => (
                  <AccordionItem key={template.id} value={template.id.toString()}>
                    <AccordionTrigger className="text-left">
                      <div className="font-medium">{template.question}</div>
                    </AccordionTrigger>
                    <AccordionContent className="px-2">
                      <Card>
                        <CardContent className="pt-6">
                          {template.description && (
                            <CardDescription className="mb-4">
                              {template.description}
                            </CardDescription>
                          )}
                          <div className="mb-4">{renderQuestionInput(template)}</div>
                          <Button
                            onClick={() => handleSaveAnswer(template.id)}
                            disabled={saveAnswerMutation.isPending}
                          >
                            {saveAnswerMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              'Save Answer'
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default TemplatesPage;
