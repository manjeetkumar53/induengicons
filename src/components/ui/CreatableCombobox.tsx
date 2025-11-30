'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronsUpDown, Plus } from 'lucide-react'

interface Option {
    value: string | number
    label: string
    color?: string
}

interface CreatableComboboxProps {
    options: Option[]
    value?: string | number
    onChange: (value: string) => void
    onCreate?: (value: string) => void
    placeholder?: string
    className?: string
    autoFocus?: boolean
}

export default function CreatableCombobox({
    options,
    value,
    onChange,
    onCreate,
    placeholder = 'Select or create...',
    className = '',
    autoFocus = false
}: CreatableComboboxProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [inputValue, setInputValue] = useState('')
    const [highlightedIndex, setHighlightedIndex] = useState(0)
    const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({})

    const containerRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Initialize input value from prop
    useEffect(() => {
        const selectedOption = options.find(opt => opt.value === value)
        if (selectedOption) {
            setInputValue(selectedOption.label)
        } else if (value !== undefined && value !== null) {
            setInputValue(String(value))
        } else {
            setInputValue('')
        }
    }, [value, options])

    // Filter options based on input
    const filteredOptions = useMemo(() => {
        if (!inputValue) return options

        const lowerInput = inputValue.toLowerCase()
        return options.filter(opt =>
            opt.label.toLowerCase().includes(lowerInput) ||
            String(opt.value).toLowerCase().includes(lowerInput)
        )
    }, [options, inputValue])

    // Check if exact match exists
    const exactMatch = useMemo(() => {
        return options.find(opt =>
            opt.label.toLowerCase() === inputValue.toLowerCase() ||
            String(opt.value).toLowerCase() === inputValue.toLowerCase()
        )
    }, [options, inputValue])

    // Update dropdown position
    const updatePosition = () => {
        if (containerRef.current && isOpen) {
            const rect = containerRef.current.getBoundingClientRect()
            setDropdownStyle({
                position: 'fixed',
                top: `${rect.bottom + window.scrollY + 4}px`,
                left: `${rect.left + window.scrollX}px`,
                width: `${rect.width}px`,
                zIndex: 9999
            })
        }
    }

    useEffect(() => {
        if (isOpen) {
            updatePosition()
            window.addEventListener('scroll', updatePosition, true)
            window.addEventListener('resize', updatePosition)

            return () => {
                window.removeEventListener('scroll', updatePosition, true)
                window.removeEventListener('resize', updatePosition)
            }
        }
    }, [isOpen])

    // Handle outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node
            const isOutsideContainer = containerRef.current && !containerRef.current.contains(target)
            const isOutsideDropdown = dropdownRef.current && !dropdownRef.current.contains(target)

            if (isOutsideContainer && isOutsideDropdown) {
                setIsOpen(false)
                // Reset input to current value on close without selection
                const selectedOption = options.find(opt => opt.value === value)
                if (selectedOption) {
                    setInputValue(selectedOption.label)
                } else if (value !== undefined && value !== null) {
                    setInputValue(String(value))
                } else {
                    setInputValue('')
                }
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [isOpen, options, value])

    // Focus input when opened
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus()
        }
    }, [isOpen])

    // Auto focus on mount if requested
    useEffect(() => {
        if (autoFocus && inputRef.current) {
            setIsOpen(true)
            inputRef.current.focus()
        }
    }, [autoFocus])

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) {
            if (e.key === 'ArrowDown' || e.key === 'Enter') {
                setIsOpen(true)
                e.preventDefault()
            }
            return
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault()
                setHighlightedIndex(prev =>
                    prev < filteredOptions.length + (showCreateOption ? 1 : 0) - 1 ? prev + 1 : prev
                )
                break
            case 'ArrowUp':
                e.preventDefault()
                setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0)
                break
            case 'Enter':
                e.preventDefault()
                handleSelect(highlightedIndex)
                break
            case 'Escape':
                setIsOpen(false)
                break
            case 'Tab':
                setIsOpen(false)
                break
        }
    }

    const showCreateOption = onCreate && inputValue && !exactMatch

    const handleSelect = (index: number) => {
        if (index < filteredOptions.length) {
            // Existing option
            const selected = filteredOptions[index]
            onChange(String(selected.value))
            setInputValue(selected.label)
            setIsOpen(false)
        } else if (showCreateOption) {
            // Create new
            onCreate(inputValue)
            setIsOpen(false)
        }
    }

    const dropdownContent = (
        <div
            ref={dropdownRef}
            className="bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
            style={dropdownStyle}
        >
            {filteredOptions.length === 0 && !showCreateOption && (
                <div className="cursor-default select-none relative py-2 px-4 text-gray-700">
                    No options found.
                </div>
            )}

            {filteredOptions.map((option, index) => (
                <div
                    key={option.value}
                    className={`cursor-pointer select-none relative py-2 pl-3 pr-9 ${highlightedIndex === index ? 'text-white bg-indigo-600' : 'text-gray-900'
                        }`}
                    onClick={() => handleSelect(index)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                >
                    <div className="flex items-center">
                        {option.color && (
                            <span
                                className={`inline-block h-2 w-2 rounded-full mr-2 ${option.color.split(' ')[0].replace('text-', 'bg-')}`}
                            />
                        )}
                        <span className={`block truncate ${value === option.value ? 'font-semibold' : 'font-normal'}`}>
                            {option.label}
                        </span>
                    </div>

                    {value === option.value && (
                        <span className={`absolute inset-y-0 right-0 flex items-center pr-4 ${highlightedIndex === index ? 'text-white' : 'text-indigo-600'
                            }`}>
                            <Check className="h-4 w-4" />
                        </span>
                    )}
                </div>
            ))}

            {showCreateOption && (
                <div
                    className={`cursor-pointer select-none relative py-2 pl-3 pr-9 border-t border-gray-100 ${highlightedIndex === filteredOptions.length ? 'text-white bg-indigo-600' : 'text-indigo-600'
                        }`}
                    onClick={() => handleSelect(filteredOptions.length)}
                    onMouseEnter={() => setHighlightedIndex(filteredOptions.length)}
                >
                    <div className="flex items-center">
                        <Plus className="h-4 w-4 mr-2" />
                        <span className="block truncate font-medium">
                            Create &quot;{inputValue}&quot;
                        </span>
                    </div>
                </div>
            )}
        </div>
    )

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    className="w-full border border-gray-300 rounded-md py-1.5 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder={placeholder}
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value)
                        setIsOpen(true)
                        setHighlightedIndex(0)
                    }}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                />
                <div
                    className="absolute inset-y-0 right-0 flex items-center px-2 cursor-pointer text-gray-400 hover:text-gray-600"
                    onClick={() => {
                        if (isOpen) {
                            setIsOpen(false)
                        } else {
                            setIsOpen(true)
                            inputRef.current?.focus()
                        }
                    }}
                >
                    <ChevronsUpDown className="h-4 w-4" />
                </div>
            </div>

            {isOpen && typeof document !== 'undefined' && createPortal(dropdownContent, document.body)}
        </div>
    )
}
