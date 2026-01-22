"use client";

import { useState } from "react";
import { Button, Input, Label, Textarea, Badge } from "@everleap/design-system";
import { Upload, File, Check, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ApplicationFormProps {
    jobId: string;
    onSubmit: (data: any) => void;
}

export default function ApplicationForm({ jobId, onSubmit }: ApplicationFormProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [isProcessing, setIsProcessing] = useState(false);
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [formData, setFormData] = useState({
        // Personal Info (AI extracted)
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        location: "",
        linkedIn: "",

        // Work Experience (AI extracted)
        workExperience: [] as any[],

        // Education (AI extracted)
        education: [] as any[],

        // Skills (AI extracted)
        skills: [] as string[],

        // Screening Questions
        screeningAnswers: {} as Record<string, string>,

        // Additional
        coverLetter: "",
        portfolioUrl: "",
        startDate: "",
        salaryMin: "",
        salaryMax: ""
    });

    const totalSteps = 5;

    const updateField = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file
        if (file.size > 5 * 1024 * 1024) { // 5MB
            toast.error("File size must be less than 5MB");
            return;
        }

        if (!file.name.match(/\.(pdf|docx)$/i)) {
            toast.error("Please upload a PDF or DOCX file");
            return;
        }

        setResumeFile(file);
        setIsProcessing(true);
        toast.info("Processing your resume with AI...");

        // Simulate AI parsing
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Mock parsed data
        updateField("firstName", "Sarah");
        updateField("lastName", "Chen");
        updateField("email", "sarah.chen@email.com");
        updateField("phone", "+1 (555) 123-4567");
        updateField("location", "San Francisco, CA");
        updateField("linkedIn", "linkedin.com/in/sarahchen");
        updateField("skills", ["JavaScript", "React", "TypeScript", "Node.js", "Product Management"]);
        updateField("workExperience", [
            {
                title: "Senior Product Manager",
                company: "TechCorp",
                startDate: "2021-01",
                endDate: null,
                current: true,
                description: "Leading product strategy and development"
            }
        ]);
        updateField("education", [
            {
                degree: "Bachelor of Science",
                field: "Computer Science",
                institution: "Stanford University",
                graduationYear: "2018"
            }
        ]);

        setIsProcessing(false);
        toast.success("Resume processed successfully!");
        setCurrentStep(2);
    };

    const handleNext = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async () => {
        setIsProcessing(true);
        await new Promise(resolve => setTimeout(resolve, 1000));

        toast.success("Application submitted successfully!");
        onSubmit(formData);
        setIsProcessing(false);
    };

    return (
        <div className="space-y-6">
            {/* Progress Indicator */}
            <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">
                        Step {currentStep} of {totalSteps}
                    </span>
                    <span className="text-slate-500">
                        {currentStep === 1 && "Upload Resume"}
                        {currentStep === 2 && "Review Information"}
                        {currentStep === 3 && "Screening Questions"}
                        {currentStep === 4 && "Additional Details"}
                        {currentStep === 5 && "Review & Submit"}
                    </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                    />
                </div>
            </div>

            {/* Step Content */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
                {/* Step 1: Resume Upload */}
                {currentStep === 1 && (
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">Upload Your Resume</h3>
                            <p className="text-sm text-slate-600">
                                Our AI will extract your information automatically
                            </p>
                        </div>

                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-8">
                            <input
                                type="file"
                                id="resume-upload"
                                className="hidden"
                                accept=".pdf,.docx"
                                onChange={handleResumeUpload}
                                disabled={isProcessing}
                            />
                            <label
                                htmlFor="resume-upload"
                                className={`flex flex-col items-center justify-center cursor-pointer ${isProcessing ? "opacity-50 cursor-not-allowed" : ""
                                    }`}
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                                        <p className="text-lg font-medium text-slate-900 mb-2">
                                            Processing your resume...
                                        </p>
                                        <p className="text-sm text-slate-500">
                                            This usually takes 5-10 seconds
                                        </p>
                                    </>
                                ) : resumeFile ? (
                                    <>
                                        <File className="h-12 w-12 text-green-600 mb-4" />
                                        <p className="text-lg font-medium text-slate-900 mb-2">
                                            {resumeFile.name}
                                        </p>
                                        <p className="text-sm text-slate-500 mb-4">
                                            Click to upload a different file
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-12 w-12 text-slate-400 mb-4" />
                                        <p className="text-lg font-medium text-slate-900 mb-2">
                                            Drop your resume here or click to browse
                                        </p>
                                        <p className="text-sm text-slate-500">
                                            Supports PDF and DOCX (max 5MB)
                                        </p>
                                    </>
                                )}
                            </label>
                        </div>

                        {!resumeFile && (
                            <div className="flex items-center gap-3">
                                <div className="flex-1 border-t border-slate-200" />
                                <span className="text-sm text-slate-500">Or import from</span>
                                <div className="flex-1 border-t border-slate-200" />
                            </div>
                        )}

                        {!resumeFile && (
                            <div className="grid grid-cols-2 gap-3">
                                <Button variant="outline" disabled>
                                    <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                    </svg>
                                    LinkedIn (Coming Soon)
                                </Button>
                                <Button variant="outline" disabled>
                                    <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                                        <path fill="currentColor" d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
                                    </svg>
                                    Google Drive (Coming Soon)
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 2: Review & Confirm */}
                {currentStep === 2 && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="h-5 w-5 text-primary" />
                            <h3 className="text-lg font-semibold text-slate-900">
                                Review AI-Extracted Information
                            </h3>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                                <p className="text-sm text-teal-800">
                                    <Check className="h-4 w-4 inline mr-2" />
                                    We've automatically filled in your information. Please review and edit as needed.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input
                                        id="firstName"
                                        value={formData.firstName}
                                        onChange={(e) => updateField("firstName", e.target.value)}
                                        className="mt-1.5"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input
                                        id="lastName"
                                        value={formData.lastName}
                                        onChange={(e) => updateField("lastName", e.target.value)}
                                        className="mt-1.5"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => updateField("email", e.target.value)}
                                    className="mt-1.5"
                                />
                            </div>

                            <div>
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) => updateField("phone", e.target.value)}
                                    className="mt-1.5"
                                />
                            </div>

                            <div>
                                <Label htmlFor="location">Location</Label>
                                <Input
                                    id="location"
                                    value={formData.location}
                                    onChange={(e) => updateField("location", e.target.value)}
                                    className="mt-1.5"
                                />
                            </div>

                            <div>
                                <Label>Skills</Label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {formData.skills.map((skill, idx) => (
                                        <Badge key={idx} variant="secondary">{skill}</Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Screening Questions */}
                {currentStep === 3 && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                Screening Questions
                            </h3>
                            <p className="text-sm text-slate-600">
                                Help us understand your fit for this role
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <Label htmlFor="q1">Why are you interested in this position?</Label>
                                <Textarea
                                    id="q1"
                                    rows={4}
                                    placeholder="Share what excites you about this opportunity..."
                                    className="mt-1.5"
                                    value={formData.screeningAnswers["q1"] || ""}
                                    onChange={(e) => updateField("screeningAnswers", { ...formData.screeningAnswers, q1: e.target.value })}
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    {formData.screeningAnswers["q1"]?.length || 0} characters
                                </p>
                            </div>

                            <div>
                                <Label htmlFor="q2">Describe your relevant experience for this role</Label>
                                <Textarea
                                    id="q2"
                                    rows={4}
                                    placeholder="Tell us about your background..."
                                    className="mt-1.5"
                                    value={formData.screeningAnswers["q2"] || ""}
                                    onChange={(e) => updateField("screeningAnswers", { ...formData.screeningAnswers, q2: e.target.value })}
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    {formData.screeningAnswers["q2"]?.length || 0} characters
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 4: Additional Details */}
                {currentStep === 4 && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                Additional Information
                            </h3>
                            <p className="text-sm text-slate-600">
                                Optional but helpful for your application
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="coverLetter">Cover Letter (Optional)</Label>
                                <Textarea
                                    id="coverLetter"
                                    rows={6}
                                    placeholder="Tell us why you'd be a great fit..."
                                    className="mt-1.5"
                                    value={formData.coverLetter}
                                    onChange={(e) => updateField("coverLetter", e.target.value)}
                                />
                            </div>

                            <div>
                                <Label htmlFor="portfolioUrl">Portfolio/Website (Optional)</Label>
                                <Input
                                    id="portfolioUrl"
                                    type="url"
                                    placeholder="https://..."
                                    value={formData.portfolioUrl}
                                    onChange={(e) => updateField("portfolioUrl", e.target.value)}
                                    className="mt-1.5"
                                />
                            </div>

                            <div>
                                <Label htmlFor="startDate">Earliest Start Date</Label>
                                <Input
                                    id="startDate"
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => updateField("startDate", e.target.value)}
                                    className="mt-1.5"
                                />
                            </div>

                            <div>
                                <Label>Salary Expectations (Optional)</Label>
                                <div className="grid grid-cols-2 gap-4 mt-1.5">
                                    <Input
                                        type="number"
                                        placeholder="Min"
                                        value={formData.salaryMin}
                                        onChange={(e) => updateField("salaryMin", e.target.value)}
                                    />
                                    <Input
                                        type="number"
                                        placeholder="Max"
                                        value={formData.salaryMax}
                                        onChange={(e) => updateField("salaryMax", e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 5: Review & Submit */}
                {currentStep === 5 && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                Review Your Application
                            </h3>
                            <p className="text-sm text-slate-600">
                                Please review all information before submitting
                            </p>
                        </div>

                        <div className="space-y-4 divide-y divide-slate-200">
                            <div className="pt-4 first:pt-0">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-semibold text-slate-900">Personal Information</h4>
                                    <Button variant="ghost" size="sm" onClick={() => setCurrentStep(2)}>Edit</Button>
                                </div>
                                <div className="text-sm text-slate-600 space-y-1">
                                    <p>{formData.firstName} {formData.lastName}</p>
                                    <p>{formData.email}</p>
                                    <p>{formData.phone}</p>
                                    <p>{formData.location}</p>
                                </div>
                            </div>

                            <div className="pt-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-semibold text-slate-900">Screening Questions</h4>
                                    <Button variant="ghost" size="sm" onClick={() => setCurrentStep(3)}>Edit</Button>
                                </div>
                                <div className="text-sm text-slate-600">
                                    {Object.keys(formData.screeningAnswers).length} questions answered
                                </div>
                            </div>

                            <div className="pt-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-semibold text-slate-900">Additional Details</h4>
                                    <Button variant="ghost" size="sm" onClick={() => setCurrentStep(4)}>Edit</Button>
                                </div>
                                <div className="text-sm text-slate-600 space-y-1">
                                    {formData.coverLetter && <p>✓ Cover letter included</p>}
                                    {formData.portfolioUrl && <p>✓ Portfolio link provided</p>}
                                    {formData.startDate && <p>✓ Start date specified</p>}
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                            <div className="flex items-start gap-2">
                                <input
                                    type="checkbox"
                                    id="consent"
                                    className="mt-1 rounded border-slate-300"
                                    required
                                />
                                <label htmlFor="consent" className="text-sm text-slate-600">
                                    I confirm that all information provided is accurate and I authorize background verification if required.
                                </label>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between">
                <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStep === 1 || isProcessing}
                >
                    Previous
                </Button>

                {currentStep < totalSteps ? (
                    <Button
                        onClick={handleNext}
                        disabled={isProcessing || (currentStep === 1 && !resumeFile)}
                    >
                        Next
                    </Button>
                ) : (
                    <Button
                        onClick={handleSubmit}
                        disabled={isProcessing}
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            "Submit Application"
                        )}
                    </Button>
                )}
            </div>

            {/* Auto-save indicator */}
            <div className="text-center">
                <p className="text-xs text-slate-500">
                    <Check className="inline h-3 w-3 mr-1" />
                    Your progress is automatically saved
                </p>
            </div>
        </div>
    );
}
