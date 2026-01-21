"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "@phosphor-icons/react";
import { DemoRequestForm } from "./DemoRequestForm";

interface DemoRequestModalProps {
    children: React.ReactNode;
}

export function DemoRequestModal({ children }: DemoRequestModalProps) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger asChild>
                {children}
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
                <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 focus:outline-none">

                    <div className="flex items-center justify-between mb-6">
                        <Dialog.Title className="text-xl font-semibold text-slate-900">
                            Request a Demo
                        </Dialog.Title>
                        <Dialog.Close asChild>
                            <button className="text-slate-400 hover:text-slate-600 rounded-full p-1 hover:bg-slate-100 transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </Dialog.Close>
                    </div>

                    <DemoRequestForm />

                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
