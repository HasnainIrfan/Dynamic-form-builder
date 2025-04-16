"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { countries } from "@/lib/countries"
import { cn } from "@/lib/utils"

interface PhoneInputProps {
  id: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  borderRadius?: string
  borderColor?: string
  textColor?: string
}

export function PhoneInput({
  id,
  value,
  onChange,
  placeholder,
  borderRadius = "md",
  borderColor = "#e2e8f0",
  textColor = "#000000",
}: PhoneInputProps) {
  const [countryCode, setCountryCode] = useState("US")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Parse the value if it's in the format "+{countryCode} {number}"
    if (value && value.includes(" ")) {
      const [prefix, number] = value.split(" ")
      const code = countries.find((c) => c.dial_code === prefix)?.code
      if (code) {
        setCountryCode(code)
        setPhoneNumber(number)
      }
    } else {
      setPhoneNumber(value || "")
    }
  }, [value])

  const handleCountryChange = (code: string) => {
    setCountryCode(code)
    const dialCode = countries.find((c) => c.code === code)?.dial_code || ""
    onChange(`${dialCode} ${phoneNumber}`)
    validatePhoneNumber(phoneNumber, dialCode)
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNumber = e.target.value.replace(/[^\d]/g, "") // Only allow digits
    setPhoneNumber(newNumber)
    const dialCode = countries.find((c) => c.code === countryCode)?.dial_code || ""
    onChange(`${dialCode} ${newNumber}`)
    validatePhoneNumber(newNumber, dialCode)
  }

  const validatePhoneNumber = (number: string, dialCode: string) => {
    if (!number) {
      setError(null)
      return
    }

    // Basic validation based on length
    if (number.length < 4) {
      setError("Phone number is too short")
      return
    }

    if (number.length > 15) {
      setError("Phone number is too long")
      return
    }

    // Check if it matches the international format
    const fullNumber = `${dialCode} ${number}`
    const regex = /^\+[0-9]{1,3} [0-9]{4,14}$/
    if (!regex.test(fullNumber)) {
      setError("Invalid phone number format")
      return
    }

    setError(null)
  }

  // Get border radius class based on the selected radius
  const getBorderRadiusClass = (radius: string): string => {
    switch (radius) {
      case "none":
        return "rounded-none"
      case "sm":
        return "rounded-sm"
      case "md":
        return "rounded-md"
      case "lg":
        return "rounded-lg"
      case "xl":
        return "rounded-xl"
      case "full":
        return "rounded-full"
      default:
        return "rounded-md"
    }
  }

  const borderRadiusClass = getBorderRadiusClass(borderRadius)

  return (
    <div className="space-y-2">
      <div className="flex">
        <Select value={countryCode} onValueChange={handleCountryChange}>
          <SelectTrigger
            className={cn("w-[110px] flex-shrink-0 rounded-r-none", borderRadiusClass)}
            style={{
              borderColor: borderColor,
              color: textColor,
              backgroundColor: "transparent",
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
            }}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {countries.map((country) => (
              <SelectItem key={country.code} value={country.code}>
                <div className="flex items-center gap-2">
                  <span>{country.flag}</span>
                  <span>{country.dial_code}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          id={id}
          type="tel"
          value={phoneNumber}
          onChange={handlePhoneChange}
          placeholder={placeholder}
          className={cn("flex-1 rounded-l-none", borderRadiusClass)}
          style={{
            borderColor: borderColor,
            color: textColor,
            backgroundColor: "transparent",
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
          }}
        />
      </div>
      {error && <h6 className="text-sm text-red-500">{error}</h6>}
    </div>
  )
}
