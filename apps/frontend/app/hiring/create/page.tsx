"use client";

import { useState, useEffect } from "react";
import { Button, Input, Label, Card, CardContent, Separator } from "@everleap/design-system";
import { ChevronRight, Check, Briefcase, Sparkles, ExternalLink, Loader2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

const STEPS = [
    { id: 1, name: "Basic Info", description: "Job details and location" },
    { id: 2, name: "AI Generation", description: "Generate job description" },
    { id: 3, name: "Review & Edit", description: "Refine content" },
    { id: 4, name: "Publishing", description: "Post to platforms" },
    { id: 5, name: "Complete", description: "Job is live" }
];

export default function CreateJobPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [publishProgress, setPublishProgress] = useState<string[]>([]);
    const [formData, setFormData] = useState({
        title: "",
        department: "",
        location: "",
        isRemote: false,
        employmentType: "full-time",
        salaryMin: "",
        salaryMax: "",
        equity: "",
        description: "",
        responsibilities: "",
        requirements: "",
        screeningQuestions: [] as string[],
        websiteUrl: "",
        linkedinUrl: ""
    });

    const updateField = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleGenerateJD = async () => {
        setIsGenerating(true);

        await new Promise(resolve => setTimeout(resolve, 2000));

        updateField("description", `We're looking for an exceptional ${formData.title} to join our ${formData.department} team. This role offers the opportunity to work with cutting-edge technology and collaborate with a talented team of professionals.\n\nAs a key member of our organization, you'll have the autonomy to drive meaningful impact while working in a ${formData.isRemote ? 'fully remote' : formData.location} environment.`);

        updateField("responsibilities", `• Lead and execute strategic initiatives for ${formData.department}\n• Collaborate cross-functionally with engineering, design, and business teams\n• Drive data-informed decision making and optimize key metrics\n• Mentor junior team members and contribute to team growth\n• Own end-to-end delivery of high-impact projects`);

        updateField("requirements", `• 5+ years of experience in a similar role\n• Strong analytical and problem-solving skills\n• Excellent communication and stakeholder management\n• Experience with agile methodologies\n• Bachelor's degree in relevant field or equivalent experience`);

        updateField("screeningQuestions", [
            "What interests you most about this role?",
            "Describe your experience with similar projects or responsibilities.",
            "What is your expected salary range?",
            "What is your availability to start?"
        ]);

        setIsGenerating(false);
        setCurrentStep(3);
    };

    const handlePublish = async () => {
        setIsPublishing(true);
        setCurrentStep(4);
        setPublishProgress([]);

        const steps = [
            { message: "Creating job posting...", delay: 800 },
            { message: "Publishing to company website...", delay: 1200 },
            { message: "Posting to LinkedIn...", delay: 1500 },
            { message: "Activating candidate sourcing...", delay: 1000 },
            { message: "Job is now live! 🎉", delay: 500 }
        ];

        for (const step of steps) {
            await new Promise(resolve => setTimeout(resolve, step.delay));
            setPublishProgress(prev => [...prev, step.message]);
        }

        const jobId = `JOB-${Math.floor(Math.random() * 10000)}`;
        updateField("websiteUrl", `https://careers.everleap.com/jobs/${jobId}`);
        updateField("linkedinUrl", `https://linkedin.com/jobs/view/${Math.floor(Math.random() * 100000000)}`);

        setIsPublishing(false);
        setCurrentStep(5);

        toast.success("Job published successfully!");
    };

    const handleComplete = () => {
        router.push(`/hiring/JOB-${Math.floor(Math.random() * 10000)}`);
    };

    const handleNext = () => {
        if (currentStep === 1) {
            setCurrentStep(2);
            // Auto-start AI generation
            setTimeout(() => {
                handleGenerateJD();
            }, 100);
        } else if (currentStep === 3) {
            handlePublish();
        }
    };

    const handleBack = () => {
        if (currentStep > 1 && currentStep !== 4) {
            setCurrentStep(currentStep - 1);
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Vertical Stepper Sidebar - Fixed */}
            <div className="w-80 bg-white border-r border-slate-200 p-8 fixed h-screen overflow-y-auto">
                <Link href="/hiring">
                    <Button variant="ghost" size="sm" className="mb-8">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Jobs
                    </Button>
                </Link>

                <h2 className="text-xl font-bold text-slate-900 mb-6">Create New Job</h2>

                <div className="space-y-6">
                    {STEPS.map((step, index) => {
                        const isCompleted = currentStep > step.id;
                        const isCurrent = currentStep === step.id;
                        const isUpcoming = currentStep < step.id;

                        return (
                            <div key={step.id} className="flex gap-4">
                                {/* Line connector */}
                                <div className="flex flex-col items-center">
                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${isCompleted
                                        ? "bg-primary text-primary-foreground"
                                        : isCurrent
                                            ? "bg-primary/10 text-primary border-2 border-primary"
                                            : "bg-slate-100 text-slate-400 border-2 border-slate-200"
                                        }`}>
                                        {isCompleted ? <Check className="h-5 w-5" /> : step.id}
                                    </div>
                                    {index < STEPS.length - 1 && (
                                        <div className={`w-0.5 flex-1 my-2 min-h-[40px] ${isCompleted ? "bg-primary" : "bg-slate-200"
                                            }`} />
                                    )}
                                </div>

                                {/* Step info */}
                                <div className="flex-1 pb-6">
                                    <p className={`font-semibold text-sm ${isCurrent ? "text-slate-900" : isCompleted ? "text-slate-700" : "text-slate-400"
                                        }`}>
                                        {step.name}
                                    </p>
                                    <p className={`text-xs mt-0.5 ${isCurrent ? "text-slate-600" : "text-slate-400"
                                        }`}>
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Main Content Area - With left margin to account for fixed sidebar */}
            <div className="flex-1 p-12 ml-80">
                <div className="max-w-4xl mx-auto">
                    {/* Step Content */}
                    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-8 min-h-[600px]">
                        {currentStep === 1 && (
                            <BasicInfoStep formData={formData} updateField={updateField} />
                        )}
                        {(currentStep === 2 || isGenerating) && (
                            <GeneratingStep />
                        )}
                        {currentStep === 3 && (
                            <ReviewEditStep formData={formData} updateField={updateField} />
                        )}
                        {currentStep === 4 && (
                            <PublishingStep progress={publishProgress} />
                        )}
                        {currentStep === 5 && (
                            <SuccessStep formData={formData} />
                        )}
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between mt-6">
                        <Button
                            variant="outline"
                            onClick={handleBack}
                            disabled={currentStep === 1 || currentStep === 4 || currentStep === 5 || isGenerating}
                        >
                            Back
                        </Button>
                        {currentStep === 1 && (
                            <Button onClick={handleNext} size="lg">
                                Continue
                                <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                        )}
                        {currentStep === 3 && (
                            <Button onClick={handleNext} disabled={isPublishing} size="lg">
                                <Briefcase className="mr-2 h-4 w-4" />
                                Publish Job
                            </Button>
                        )}
                        {currentStep === 5 && (
                            <Button onClick={handleComplete} size="lg">
                                Go to Job Dashboard
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Step Components (same as before but without dialog context)
function BasicInfoStep({ formData, updateField }: any) {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Basic Information</h3>
                <p className="text-slate-600">Tell us about the role you're hiring for</p>
            </div>

            <div className="space-y-6 mt-8">
                <div>
                    <Label htmlFor="title">Job Title *</Label>
                    <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => updateField("title", e.target.value)}
                        placeholder="e.g. Senior Product Manager"
                        className="mt-1.5"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="department">Department</Label>
                        <select
                            id="department"
                            value={formData.department}
                            onChange={(e) => updateField("department", e.target.value)}
                            className="mt-1.5 w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="">Select department</option>
                            <option value="Engineering">Engineering</option>
                            <option value="Product">Product</option>
                            <option value="Design">Design</option>
                            <option value="Marketing">Marketing</option>
                            <option value="Sales">Sales</option>
                        </select>
                    </div>
                    <div>
                        <Label htmlFor="employmentType">Employment Type</Label>
                        <select
                            id="employmentType"
                            value={formData.employmentType}
                            onChange={(e) => updateField("employmentType", e.target.value)}
                            className="mt-1.5 w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="full-time">Full-time</option>
                            <option value="part-time">Part-time</option>
                            <option value="contract">Contract</option>
                        </select>
                    </div>
                </div>
                <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => updateField("location", e.target.value)}
                        placeholder="e.g. San Francisco, CA"
                        className="mt-1.5"
                    />
                    <div className="flex items-center gap-2 mt-2">
                        <input
                            type="checkbox"
                            id="isRemote"
                            checked={formData.isRemote}
                            onChange={(e) => updateField("isRemote", e.target.checked)}
                            className="rounded border-slate-300"
                        />
                        <Label htmlFor="isRemote" className="font-normal cursor-pointer">Remote work available</Label>
                    </div>
                </div>
            </div>

            <Separator className="my-8" />

            <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-6">Compensation</h3>
                <div className="space-y-4">
                    <div>
                        <Label>Salary Range (USD)</Label>
                        <div className="grid grid-cols-2 gap-4 mt-1.5">
                            <Input
                                type="number"
                                value={formData.salaryMin}
                                onChange={(e) => updateField("salaryMin", e.target.value)}
                                placeholder="Min (e.g. 100000)"
                            />
                            <Input
                                type="number"
                                value={formData.salaryMax}
                                onChange={(e) => updateField("salaryMax", e.target.value)}
                                placeholder="Max (e.g. 150000)"
                            />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="equity">Equity (%)</Label>
                        <Input
                            id="equity"
                            value={formData.equity}
                            onChange={(e) => updateField("equity", e.target.value)}
                            placeholder="e.g. 0.05"
                            className="mt-1.5"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function AIGenerationPrompt({ onGenerate, formData }: any) {
    return (
        <div className="text-center py-20 space-y-6">
            <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <Sparkles className="h-10 w-10 text-primary" />
            </div>
            <div>
                <h3 className="text-2xl font-bold text-slate-900">Ready to generate your job description?</h3>
                <p className="text-slate-600 mt-3 max-w-lg mx-auto text-lg">
                    Our AI will create a comprehensive job description, key responsibilities, requirements, and screening questions based on the details you provided for <span className="font-semibold">{formData.title || "this position"}</span>.
                </p>
            </div>
            <Button onClick={onGenerate} size="lg" className="mt-6">
                <Sparkles className="mr-2 h-5 w-5" />
                Generate with AI
            </Button>
        </div>
    );
}

function GeneratingStep() {
    return (
        <div className="text-center py-20 space-y-6">
            <Loader2 className="h-16 w-16 text-primary animate-spin mx-auto" />
            <div>
                <h3 className="text-2xl font-bold text-slate-900">Generating job description...</h3>
                <p className="text-slate-600 mt-2 text-lg">
                    Our AI is crafting a compelling job posting for you
                </p>
            </div>
        </div>
    );
}

function ReviewEditStep({ formData, updateField }: any) {
    const [newQuestion, setNewQuestion] = useState("");
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editText, setEditText] = useState("");

    const addQuestion = () => {
        if (newQuestion.trim()) {
            updateField("screeningQuestions", [...formData.screeningQuestions, newQuestion.trim()]);
            setNewQuestion("");
        }
    };

    const deleteQuestion = (index: number) => {
        const updated = formData.screeningQuestions.filter((_: any, i: number) => i !== index);
        updateField("screeningQuestions", updated);
    };

    const startEdit = (index: number) => {
        setEditingIndex(index);
        setEditText(formData.screeningQuestions[index]);
    };

    const saveEdit = () => {
        if (editingIndex !== null && editText.trim()) {
            const updated = [...formData.screeningQuestions];
            updated[editingIndex] = editText.trim();
            updateField("screeningQuestions", updated);
            setEditingIndex(null);
            setEditText("");
        }
    };

    const cancelEdit = () => {
        setEditingIndex(null);
        setEditText("");
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Review & Edit</h3>
                <p className="text-slate-600">Review the AI-generated content and make any changes needed</p>
            </div>

            <div className="mt-8 space-y-6">
                <div>
                    <Label htmlFor="description">Job Description</Label>
                    <textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => updateField("description", e.target.value)}
                        className="mt-1.5 w-full min-h-[150px] px-3 py-2 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>

                <div>
                    <Label htmlFor="responsibilities">Key Responsibilities</Label>
                    <textarea
                        id="responsibilities"
                        value={formData.responsibilities}
                        onChange={(e) => updateField("responsibilities", e.target.value)}
                        className="mt-1.5 w-full min-h-[120px] px-3 py-2 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                    />
                </div>

                <div>
                    <Label htmlFor="requirements">Requirements</Label>
                    <textarea
                        id="requirements"
                        value={formData.requirements}
                        onChange={(e) => updateField("requirements", e.target.value)}
                        className="mt-1.5 w-full min-h-[100px] px-3 py-2 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                    />
                </div>

                <Separator />

                <div>
                    <div className="flex items-center justify-between mb-3">
                        <Label>Screening Questions</Label>
                        <span className="text-xs text-slate-500">{formData.screeningQuestions.length} questions</span>
                    </div>

                    <div className="space-y-3">
                        {formData.screeningQuestions.map((question: string, index: number) => (
                            <div key={index} className="flex items-start gap-2 p-3 rounded-lg border border-slate-200 bg-slate-50">
                                {editingIndex === index ? (
                                    <div className="flex-1 space-y-2">
                                        <Input
                                            value={editText}
                                            onChange={(e) => setEditText(e.target.value)}
                                            className="bg-white"
                                            autoFocus
                                        />
                                        <div className="flex gap-2">
                                            <Button size="sm" onClick={saveEdit}>Save</Button>
                                            <Button size="sm" variant="outline" onClick={cancelEdit}>Cancel</Button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <span className="text-sm font-medium text-slate-500 mt-0.5">{index + 1}.</span>
                                        <p className="flex-1 text-sm text-slate-700">{question}</p>
                                        <div className="flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 px-2 text-slate-600 hover:text-primary"
                                                onClick={() => startEdit(index)}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 px-2 text-slate-600 hover:text-red-600"
                                                onClick={() => deleteQuestion(index)}
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="mt-3 flex gap-2">
                        <Input
                            placeholder="Add a new screening question..."
                            value={newQuestion}
                            onChange={(e) => setNewQuestion(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addQuestion()}
                            className="flex-1"
                        />
                        <Button onClick={addQuestion} disabled={!newQuestion.trim()}>
                            Add Question
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function PublishingStep({ progress }: { progress: string[] }) {
    return (
        <div className="py-16 space-y-8">
            <div className="text-center">
                <Loader2 className="h-16 w-16 text-primary animate-spin mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-slate-900">Publishing your job...</h3>
            </div>

            <Card className="border-slate-100 max-w-2xl mx-auto">
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        {progress.map((step, index) => (
                            <div key={index} className="flex items-center gap-3">
                                <Check className="h-5 w-5 text-emerald-600" />
                                <span className="text-slate-700">{step}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function SuccessStep({ formData }: any) {
    return (
        <div className="text-center py-16 space-y-8">
            <div className="mx-auto w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center">
                <Check className="h-10 w-10 text-emerald-600" />
            </div>

            <div>
                <h3 className="text-3xl font-bold text-slate-900">Job Published Successfully!</h3>
                <p className="text-slate-600 mt-3 text-lg">
                    Your job posting for <span className="font-semibold">{formData.title}</span> is now live and accepting applications.
                </p>
            </div>

            <Card className="border-slate-100 text-left max-w-2xl mx-auto">
                <CardContent className="pt-6 space-y-4">
                    <div>
                        <Label className="text-slate-600">Company Website</Label>
                        <a
                            href={formData.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-primary hover:underline mt-1"
                        >
                            {formData.websiteUrl}
                            <ExternalLink className="h-4 w-4" />
                        </a>
                    </div>
                    <Separator />
                    <div>
                        <Label className="text-slate-600">LinkedIn</Label>
                        <a
                            href={formData.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-primary hover:underline mt-1"
                        >
                            {formData.linkedinUrl}
                            <ExternalLink className="h-4 w-4" />
                        </a>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
