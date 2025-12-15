"use client";

import { useState, useEffect, useRef } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";

interface Option {
    id: string;
    name: string;
    status?: string; // Optional for filtering/display
}

interface SearchableSelectProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    required?: boolean;
}

export default function SearchableSelect({
    options,
    value,
    onChange,
    placeholder = "Select option",
    className = "",
    required = false
}: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find((opt) => opt.id === value);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredOptions = query === ""
        ? options
        : options.filter((opt) =>
            opt.name.toLowerCase().includes(query.toLowerCase())
        );

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all flex items-center justify-between text-left"
            >
                <span className={`block truncate ${!selectedOption ? "text-gray-400 dark:text-gray-500" : "text-gray-900 dark:text-white"}`}>
                    {selectedOption ? selectedOption.name : placeholder}
                </span>
                <ChevronsUpDown className="w-4 h-4 text-gray-400" aria-hidden="true" />
            </button>

            {/* Hidden Input for Form Submission / Required check simulation */}
            <input
                type="text"
                className="sr-only"
                value={value}
                onChange={() => { }}
                required={required}
                tabIndex={-1}
            />

            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-neutral-900 rounded-xl shadow-lg border border-gray-100 dark:border-neutral-800 max-h-60 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-2 border-b border-gray-100 dark:border-neutral-800 sticky top-0 bg-white dark:bg-neutral-900">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-neutral-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-gray-400 dark:text-white"
                                placeholder="Search..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>

                    <ul className="overflow-y-auto flex-1 p-1">
                        {filteredOptions.length === 0 ? (
                            <li className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                                No results found.
                            </li>
                        ) : (
                            filteredOptions.map((option) => (
                                <li
                                    key={option.id}
                                    className={`relative flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer text-sm transition-colors ${value === option.id
                                            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium"
                                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800"
                                        }`}
                                    onClick={() => {
                                        onChange(option.id);
                                        setIsOpen(false);
                                        setQuery("");
                                    }}
                                >
                                    <span>{option.name}</span>
                                    {value === option.id && (
                                        <Check className="w-4 h-4" />
                                    )}
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}
