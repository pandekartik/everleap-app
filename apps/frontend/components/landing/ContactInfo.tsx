"use client";

import { Envelope, MapPin } from "@phosphor-icons/react";

export function ContactInfo() {
    return (
        <div className="space-y-8">
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8">
                <div className="flex items-center gap-6 mb-2">
                    <div className="h-12 w-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-teal-600">
                        <Envelope weight="duotone" className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900">Email Us</h3>
                        <a href="mailto:contact@everleap.in" className="text-teal-600 font-medium hover:text-teal-700">
                            contact@everleap.in
                        </a>
                    </div>
                </div>
                <p className="text-slate-500 text-sm ml-18">Our team is ready to assist you.</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8">
                <div className="flex items-center gap-6 mb-2">
                    <div className="h-12 w-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-teal-600">
                        <MapPin weight="duotone" className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900">Headquarters</h3>
                        <p className="text-slate-600 font-medium">Pune, India</p>
                    </div>
                </div>
                <p className="text-slate-500 text-sm ml-18">Serving clients globally.</p>
            </div>
        </div>
    );
}
