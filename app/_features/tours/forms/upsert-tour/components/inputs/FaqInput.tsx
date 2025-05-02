"use client";

import { useState } from "react";
import { Path, FieldValues } from "react-hook-form";

interface FaqInputProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  placeholder?: string;
  error?: boolean;
  value: string[] | string | any;
  onChange: (value: string[]) => void;
}

interface FaqItem {
  question: string;
  answer: string;
}

export default function FaqInput<T extends FieldValues>({
  name,
  label,
  placeholder = "Enter FAQ",
  error = false,
  value = [],
  onChange,
}: FaqInputProps<T>) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  // Ensure value is always an array
  const ensureArray = (val: any): string[] => {
    if (Array.isArray(val)) {
      return val.map((item) => {
        if (typeof item === "string") {
          try {
            // If it's already a valid JSON string, return it as is
            const parsed = JSON.parse(item);
            if (parsed.question && parsed.answer) {
              return item;
            }
          } catch (e) {
            // If not valid JSON, try to convert to proper format
            const parts = item.split(":");
            if (parts.length >= 2) {
              return JSON.stringify({
                question: parts[0].trim(),
                answer: parts.slice(1).join(":").trim(),
              });
            }
          }
        }
        // If item is an object with question and answer, stringify it
        if (
          typeof item === "object" &&
          item !== null &&
          "question" in item &&
          "answer" in item
        ) {
          return JSON.stringify(item);
        }
        return item;
      });
    } else if (typeof val === "string") {
      try {
        // Try to parse as JSON if it's a string
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) {
          return parsed.map((item) => {
            if (
              typeof item === "object" &&
              item !== null &&
              "question" in item &&
              "answer" in item
            ) {
              return JSON.stringify(item);
            }
            return item;
          });
        } else if (
          typeof parsed === "object" &&
          parsed !== null &&
          "question" in parsed &&
          "answer" in parsed
        ) {
          return [JSON.stringify(parsed)];
        }
      } catch (e) {
        // If not valid JSON, try to split by colon
        const parts = val.split(":");
        if (parts.length >= 2) {
          return [
            JSON.stringify({
              question: parts[0].trim(),
              answer: parts.slice(1).join(":").trim(),
            }),
          ];
        }
      }
      return [val];
    } else if (val === null || val === undefined) {
      return [];
    } else {
      // For any other type, convert to string and wrap in array
      return [String(val)];
    }
  };

  const safeValue = ensureArray(value);

  // Parse existing FAQ items from string array
  const parseFaqItems = (): FaqItem[] => {
    return safeValue.map((item) => {
      try {
        // Try to parse as JSON first
        const parsed = JSON.parse(item);
        if (parsed.question && parsed.answer) {
          return parsed;
        }
      } catch (e) {
        // If not JSON, try to split by colon
        const parts = item.split(":");
        if (parts.length >= 2) {
          return {
            question: parts[0].trim(),
            answer: parts.slice(1).join(":").trim(),
          };
        }
      }
      // Default fallback
      return { question: item, answer: "" };
    });
  };

  const faqItems = parseFaqItems();

  const handleAddFaq = () => {
    if (question.trim() && answer.trim()) {
      const newFaqItem: FaqItem = {
        question: question.trim(),
        answer: answer.trim(),
      };

      // Convert to JSON string
      const newFaqString = JSON.stringify(newFaqItem);

      // Add to existing values
      onChange([...safeValue, newFaqString]);

      // Clear inputs
      setQuestion("");
      setAnswer("");
    }
  };

  const handleRemoveFaq = (index: number) => {
    const newValue = [...safeValue];
    newValue.splice(index, 1);
    onChange(newValue);
  };

  return (
    <div className="space-y-2">
      <label
        className={`block mb-1 text-sm/6 font-medium ${
          error ? "text-red-500" : "text-strong"
        }`}
      >
        {label}
      </label>

      <div className="space-y-2">
        <div className="flex flex-col gap-2">
          <input
            type="text"
            className={`block w-full rounded-md bg-white px-3 py-1.5 text-base text-strong outline-1 -outline-offset-1 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 sm:text-sm/6 ${
              error
                ? "outline-red-500"
                : "outline-gray-300 focus:outline-indigo-600"
            }`}
            placeholder="Question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <textarea
            className={`block w-full rounded-md bg-white px-3 py-1.5 text-base text-strong outline-1 -outline-offset-1 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 sm:text-sm/6 ${
              error
                ? "outline-red-500"
                : "outline-gray-300 focus:outline-indigo-600"
            }`}
            placeholder="Answer"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={2}
          />
          <button
            type="button"
            onClick={handleAddFaq}
            disabled={!question.trim() || !answer.trim()}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Add FAQ
          </button>
        </div>

        <div className="mt-4 space-y-2">
          {faqItems.map((item, index) => (
            <div
              key={index}
              className="p-3 bg-gray-50 rounded-md border border-gray-200"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="font-medium text-sm">{item.question}</p>
                  <p className="text-sm text-gray-600">{item.answer}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveFaq(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
