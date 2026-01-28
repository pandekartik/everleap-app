'use client';

import { useState } from 'react';
import { emailTemplates } from './data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@everleap/design-system/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@everleap/design-system/components/ui/select';

export default function EmailPreviewPage() {
    const [selectedTemplate, setSelectedTemplate] = useState<string>('reset_password');

    // Mock data for replacement
    const mockData = {
        user_name: 'Alex Johnson',
        error: 'The link has expired or is invalid.',
        message: 'Your email has been successfully verified.',
        email: 'alex@example.com',
        company_name: 'Acme Corp',
        login_url: 'https://everleap.in/login',
        support_email: 'support@everleap.com',
        home_url: 'https://everleap.in',
        token: 'mock-token-123'
    };

    const getTemplateContent = (templateName: string) => {
        let content = emailTemplates[templateName as keyof typeof emailTemplates] || '';

        // Simple template variable replacement
        Object.entries(mockData).forEach(([key, value]) => {
            // Replace {{ key }} and {{key}} and {% if key %}...{% endif %} blocks (very basic regex)
            const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
            content = content.replace(regex, value);
        });

        // Clean up simplejinja-like conditional blocks if any remnants (basic cleanup)
        // using [\s\S] instead of . with s flag for broader compatibility
        content = content.replace(/{%\s*if\s+\w+\s*%}([\s\S]*?){%\s*else\s*%}([\s\S]*?){%\s*endif\s*%}/g, '$1');
        content = content.replace(/{%\s*if\s+\w+\s*%}([\s\S]*?){%\s*endif\s*%}/g, '$1');

        return content;
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Email Template Preview</h1>
                    <p className="text-slate-500">Preview how transactional emails look with the new design.</p>
                </div>
                <div className="w-[300px]">
                    <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a template" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="reset_password">Reset Password</SelectItem>
                            <SelectItem value="reset_success">Reset Success</SelectItem>
                            <SelectItem value="reset_error">Reset Error</SelectItem>
                            <SelectItem value="set_password">Set Password</SelectItem>
                            <SelectItem value="set_password_success">Set Password Success</SelectItem>
                            <SelectItem value="set_password_error">Set Password Error</SelectItem>
                            <SelectItem value="verify_success">Verify Success</SelectItem>
                            <SelectItem value="verify_error">Verify Error</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="border rounded-lg overflow-hidden bg-slate-100 h-[800px] w-full">
                        <iframe
                            srcDoc={getTemplateContent(selectedTemplate)}
                            className="w-full h-full"
                            title="Email Preview"
                        />
                    </div>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Context Variables</CardTitle>
                            <CardDescription>Mock data used in this preview</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <dl className="grid grid-cols-1 gap-3 text-sm">
                                {Object.entries(mockData).filter(([k]) => ['user_name', 'error', 'message'].includes(k)).map(([key, value]) => (
                                    <div key={key}>
                                        <dt className="font-medium text-slate-500">{key}</dt>
                                        <dd className="text-slate-900 truncate">{value}</dd>
                                    </div>
                                ))}
                            </dl>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Design System</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded bg-slate-50 border border-slate-200"></div>
                                <span>Background: Slate-50</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded bg-slate-900"></div>
                                <span>Primary: Slate-900</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded bg-white border border-slate-200 shadow-sm"></div>
                                <span>Container: White + Shadow</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
