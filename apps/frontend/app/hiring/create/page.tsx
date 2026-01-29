"use client";

import { useState, useEffect } from "react";
import { Button, Input, Label, Card, CardContent, Separator } from "@everleap/design-system";
import { ChevronRight, Check, Briefcase, Sparkles, ExternalLink, Loader2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { ORG_SETTINGS } from "@/lib/org-settings";

// Utility functions for number formatting
function formatNumberWithCommas(value: string): string {
    const num = value.replace(/,/g, '');
    if (!num || isNaN(Number(num))) return value;
    return Number(num).toLocaleString('en-US');
}

function numberToWords(num: number): string {
    if (num === 0) return 'Zero';

    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

    function convertHundreds(n: number): string {
        if (n === 0) return '';
        if (n < 10) return ones[n];
        if (n < 20) return teens[n - 10];
        if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
        return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertHundreds(n % 100) : '');
    }

    if (num < 1000) return convertHundreds(num);
    if (num < 1000000) {
        const thousands = Math.floor(num / 1000);
        const remainder = num % 1000;
        return convertHundreds(thousands) + ' Thousand' + (remainder !== 0 ? ' ' + convertHundreds(remainder) : '');
    }
    if (num < 1000000000) {
        const millions = Math.floor(num / 1000000);
        let remainder = num % 1000000;
        let result = convertHundreds(millions) + ' Million';
        if (remainder >= 1000) {
            const thousands = Math.floor(remainder / 1000);
            result += ' ' + convertHundreds(thousands) + ' Thousand';
            remainder = remainder % 1000;
        }
        if (remainder !== 0) result += ' ' + convertHundreds(remainder);
        return result;
    }
    return num.toLocaleString();
}

const STEPS = [
    { id: 1, name: "Basic Info", description: "Job details and location" },
    { id: 2, name: "AI Generation", description: "Generate job description" },
    { id: 3, name: "Review & Edit", description: "Refine content" },
    { id: 4, name: "Publishing", description: "Post to platforms" },
    { id: 5, name: "Complete", description: "Job is live" }
];

export default function CreateJobPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [publishProgress, setPublishProgress] = useState<string[]>([]);
    const [createdJobId, setCreatedJobId] = useState<string | null>(null);

    // New States
    const [showEquity, setShowEquity] = useState(false);
    const [inputMethod, setInputMethod] = useState<'ai' | 'manual' | 'upload'>('ai');

    const [formData, setFormData] = useState({
        title: "",
        department: "",
        location: "",
        isRemote: false,
        employmentType: "FULL_TIME",
        salaryMin: "",
        salaryMax: "",
        currency: "USD", // Default
        equity: "",
        description: "",
        responsibilities: "",
        requirements: "",
        screeningQuestions: [] as string[],
        websiteUrl: "",
        linkedinUrl: ""
    });

    // Fetch company settings for currency
    useEffect(() => {
        const fetchCompanySettings = async () => {
            if (user?.company_id) {
                try {
                    // Assuming we have an endpoint or we get it from Profile/Orgs. 
                    // Using a direct fetch or user's org data if available.
                    // For now, defaulting to USD but checking if we can get it.
                    const { data } = await api.get(`/companies/${user.company_id}`);
                    if (data && data.currency) {
                        setFormData(prev => ({ ...prev, currency: data.currency }));
                    }
                } catch (e) {
                    console.error("Failed to fetch company settings", e);
                }
            }
        };
        fetchCompanySettings();
    }, [user?.company_id]);

    const updateField = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Handle file upload for JD
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type === "text/plain" || file.name.endsWith(".md")) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const text = e.target?.result as string;
                    setFormData(prev => ({ ...prev, description: text }));
                    toast.success("Job description loaded from file");
                };
                reader.readAsText(file);
            } else {
                toast.error("Format not supported for direct preview. Please paste the text.");
            }
        }
    };

    const handleGenerateJD = async () => {
        if (!user?.company_id) {
            toast.error("User company not found");
            return;
        }

        setIsGenerating(true);
        setCurrentStep(2);

        try {
            // Prepare payload - only include fields that have values
            const payload: any = {
                job_title: formData.title,
                employment_type: formData.employmentType,
                location: formData.location,
                is_remote: formData.isRemote,
                currency: "USD",
                direct_job_post: false, // AI will generate description
            };

            // Add optional fields only if they have values
            if (formData.department) payload.department = formData.department;
            if (formData.salaryMin) payload.compensation_min = parseInt(formData.salaryMin);
            if (formData.salaryMax) payload.compensation_max = parseInt(formData.salaryMax);
            if (formData.equity) payload.equity = formData.equity;

            // Create job with AI generation
            const { data } = await api.post("/jobs", payload);

            setCreatedJobId(data.id);

            // AI has generated the job description, fetch it
            const { data: jobDetails } = await api.get(`/jobs/${data.id}`);

            updateField("description", jobDetails.job_description || "");
            // Note: Backend doesn't return separate responsibilities/requirements fields
            // They're part of job_description

            setIsGenerating(false);
            setCurrentStep(3);
            toast.success("Job description generated successfully!");
        } catch (error: any) {
            console.error("Failed to create job:", error);
            const errorMessage = error.response?.data?.detail ||
                (Array.isArray(error.response?.data) ? error.response.data[0]?.msg : null) ||
                "Failed to generate job description";
            toast.error(errorMessage);
            setIsGenerating(false);
            setCurrentStep(1);
        }
    };

    const handlePublish = async () => {
        if (!createdJobId) {
            toast.error("Job not created yet");
            return;
        }

        // Validate that we have a job description
        if (!formData.description) {
            toast.error("Cannot publish job without a description. Please wait for AI generation to complete.");
            return;
        }

        setIsPublishing(true);
        setCurrentStep(4);
        setPublishProgress([]);

        try {
            // Update progress
            setPublishProgress(prev => [...prev, "Preparing job posting..."]);
            await new Promise(resolve => setTimeout(resolve, 500));

            // Publish the job
            setPublishProgress(prev => [...prev, "Publishing to career page..."]);
            const { data } = await api.post(`/jobs/${createdJobId}/publish`, {
                post_to_linkedin: true // You can make this configurable
            });

            setPublishProgress(prev => [...prev, "Publishing to LinkedIn..."]);
            await new Promise(resolve => setTimeout(resolve, 800));

            setPublishProgress(prev => [...prev, "Activating candidate sourcing..."]);
            await new Promise(resolve => setTimeout(resolve, 500));

            setPublishProgress(prev => [...prev, "Job is now live! 🎉"]);

            // Update URLs
            updateField("websiteUrl", data.career_page_url || "");
            updateField("linkedinUrl", data.linkedin_url || "");

            setIsPublishing(false);
            setCurrentStep(5);
            toast.success("Job published successfully!");
        } catch (error: any) {
            console.error("Failed to publish job:", error);
            console.error("Error response:", error.response?.data);
            const errorMessage = error.response?.data?.detail ||
                (Array.isArray(error.response?.data) ? error.response.data[0]?.msg : null) ||
                "Failed to publish job";
            toast.error(errorMessage);
            setIsPublishing(false);
            setCurrentStep(3);
        }
    };

    const handleComplete = () => {
        if (createdJobId) {
            router.push(`/hiring/${createdJobId}`);
        } else {
            router.push("/hiring");
        }
    };

    const handleNext = () => {
        if (currentStep === 1) {
            setCurrentStep(2);
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
                            <BasicInfoStep
                                formData={formData}
                                updateField={updateField}
                                showEquity={showEquity}
                                setShowEquity={setShowEquity}
                            />
                        )}
                        {(currentStep === 2 && !isGenerating) && (
                            <InputMethodStep
                                formData={formData}
                                updateField={updateField}
                                inputMethod={inputMethod}
                                setInputMethod={setInputMethod}
                                onGenerate={handleGenerateJD}
                                handleFileUpload={handleFileUpload}
                                onNext={() => setCurrentStep(3)}
                            />
                        )}
                        {(currentStep === 2 && isGenerating) && (
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
                        {currentStep === 2 && inputMethod !== 'ai' && (
                            <Button onClick={() => setCurrentStep(3)} size="lg" disabled={!formData.description}>
                                Continue to Review
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
function InputMethodStep({ formData, updateField, inputMethod, setInputMethod, onGenerate, handleFileUpload, onNext }: any) {
    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-slate-900">Job Description</h3>
                <p className="text-slate-600 mt-2">How would you like to create the job description?</p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
                <button
                    onClick={() => setInputMethod('ai')}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${inputMethod === 'ai'
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-slate-200 hover:border-slate-300'
                        }`}
                >
                    <div className="flex items-center gap-2 font-semibold text-slate-900 mb-1">
                        <Sparkles className="h-4 w-4 text-primary" />
                        Generate with AI
                    </div>
                    <p className="text-xs text-slate-500">Auto-generate from title</p>
                </button>
                <button
                    onClick={() => setInputMethod('manual')}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${inputMethod === 'manual'
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-slate-200 hover:border-slate-300'
                        }`}
                >
                    <div className="flex items-center gap-2 font-semibold text-slate-900 mb-1">
                        <Briefcase className="h-4 w-4 text-blue-600" />
                        Paste / Write
                    </div>
                    <p className="text-xs text-slate-500">Manually enter details</p>
                </button>
                <button
                    onClick={() => setInputMethod('upload')}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${inputMethod === 'upload'
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-slate-200 hover:border-slate-300'
                        }`}
                >
                    <div className="flex items-center gap-2 font-semibold text-slate-900 mb-1">
                        <div className="h-4 w-4 flex items-center justify-center rounded-full border border-slate-400">
                            <span className="text-[10px] font-bold">↑</span>
                        </div>
                        Upload File
                    </div>
                    <p className="text-xs text-slate-500">Import from file</p>
                </button>
            </div>

            {inputMethod === 'ai' && (
                <div className="text-center py-10 space-y-6 animate-in fade-in duration-300">
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                        <Sparkles className="h-8 w-8 text-primary" />
                    </div>
                    <div className="max-w-md mx-auto">
                        <p className="text-slate-600 text-lg">
                            We'll generate a comprehensive description for <span className="font-semibold text-slate-900">{formData.title}</span> using industry best practices.
                        </p>
                    </div>
                    <Button onClick={onGenerate} size="lg" className="mt-4">
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Description
                    </Button>
                </div>
            )}

            {(inputMethod === 'manual' || inputMethod === 'upload') && (
                <div className="space-y-4 animate-in fade-in duration-300">
                    {inputMethod === 'upload' && (
                        <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-lg text-center mb-4">
                            <p className="text-sm text-slate-600 mb-2">Upload a text or markdown file (.txt, .md)</p>
                            <Input
                                type="file"
                                accept=".txt,.md"
                                onChange={handleFileUpload}
                                className="max-w-xs mx-auto"
                            />
                            <p className="text-xs text-slate-400 mt-2">PDF/Docx parsing coming soon. For now, please paste text below.</p>
                        </div>
                    )}

                    <div>
                        <Label htmlFor="manual-desc">Job Description</Label>
                        <textarea
                            id="manual-desc"
                            value={formData.description}
                            onChange={(e) => updateField("description", e.target.value)}
                            placeholder="Paste or write your job description here..."
                            className="mt-1.5 w-full min-h-[300px] px-4 py-3 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary leading-relaxed"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
function BasicInfoStep({ formData, updateField, showEquity, setShowEquity }: any) {
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
                            {ORG_SETTINGS.departments.map((dept) => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
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
                            <option value="FULL_TIME">Full-time</option>
                            <option value="PART_TIME">Part-time</option>
                            <option value="CONTRACT">Contract</option>
                            <option value="INTERNSHIP">Internship</option>
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
                        <Label>Salary Range ({formData.currency})</Label>
                        <div className="grid grid-cols-2 gap-4 mt-1.5">
                            <div>
                                <Input
                                    type="text"
                                    value={formData.salaryMin ? formatNumberWithCommas(formData.salaryMin) : ''}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/,/g, '');
                                        if (value === '' || /^\d+$/.test(value)) {
                                            updateField("salaryMin", value);
                                        }
                                    }}
                                    placeholder="Min (e.g. 100,000)"
                                />
                                {formData.salaryMin && !isNaN(Number(formData.salaryMin)) && Number(formData.salaryMin) > 0 && (
                                    <p className="text-xs text-slate-500 mt-1.5">
                                        {numberToWords(Number(formData.salaryMin))} {formData.currency === "USD" ? "Dollars" : formData.currency}
                                    </p>
                                )}
                            </div>
                            <div>
                                <Input
                                    type="text"
                                    value={formData.salaryMax ? formatNumberWithCommas(formData.salaryMax) : ''}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/,/g, '');
                                        if (value === '' || /^\d+$/.test(value)) {
                                            updateField("salaryMax", value);
                                        }
                                    }}
                                    placeholder="Max (e.g. 150,000)"
                                />
                                {formData.salaryMax && !isNaN(Number(formData.salaryMax)) && Number(formData.salaryMax) > 0 && (
                                    <p className="text-xs text-slate-500 mt-1.5">
                                        {numberToWords(Number(formData.salaryMax))} {formData.currency === "USD" ? "Dollars" : formData.currency}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <input
                                type="checkbox"
                                id="showEquity"
                                checked={showEquity}
                                onChange={(e) => {
                                    setShowEquity(e.target.checked);
                                    if (!e.target.checked) updateField("equity", "");
                                }}
                                className="rounded border-slate-300"
                            />
                            <Label htmlFor="showEquity" className="font-normal cursor-pointer select-none">Include Equity Offering</Label>
                        </div>

                        {showEquity && (
                            <div>
                                <Label htmlFor="equity">Equity (%)</Label>
                                <Input
                                    id="equity"
                                    value={formData.equity}
                                    onChange={(e) => updateField("equity", e.target.value)}
                                    placeholder="e.g. 0.05 - 0.1%"
                                    className="mt-1.5"
                                />
                            </div>
                        )}
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
