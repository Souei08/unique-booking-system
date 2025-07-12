import React, { useState, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface TagsInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  maxTags?: number;
  disabled?: boolean;
}

const TagsInput: React.FC<TagsInputProps> = ({
  value = [],
  onChange,
  placeholder = "Type and press Enter...",
  className,
  maxTags,
  disabled = false,
}) => {
  const [inputValue, setInputValue] = useState("");

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (
      trimmedTag &&
      !value.includes(trimmedTag) &&
      (!maxTags || value.length < maxTags)
    ) {
      onChange([...value, trimmedTag]);
      setInputValue("");
    }
  };

  // Filter out empty tags when rendering
  const filteredTags = value.filter((tag) => tag.trim() !== "");

  const removeTag = (index: number) => {
    const newTags = value.filter((_, i) => i !== index);
    onChange(newTags);
  };

  const removeFilteredTag = (index: number) => {
    const tagToRemove = filteredTags[index];
    const newTags = value.filter((tag) => tag !== tagToRemove);
    onChange(newTags);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    } else if (
      e.key === "Backspace" &&
      !inputValue &&
      filteredTags.length > 0
    ) {
      removeFilteredTag(filteredTags.length - 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleAddClick = () => {
    addTag(inputValue);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border border-input-border rounded-md bg-transparent focus-within:border-input-border-focus focus-within:ring-1 focus-within:ring-input-border-focus/20 transition-all duration-200">
        {filteredTags.map((tag, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="bg-brand/10 text-sm text-brand border-brand/20 hover:bg-brand/20 transition-colors group"
          >
            {tag}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-3 w-3 ml-2 p-0 text-brand hover:text-brand/80 bg-transparent  cursor-pointer"
              onClick={() => removeFilteredTag(index)}
              disabled={disabled}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={filteredTags.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[120px] border-0 p-0 h-6 text-sm focus:ring-0 focus:border-0 bg-transparent placeholder:text-weak outline-none"
          disabled={disabled || (maxTags ? value.length >= maxTags : false)}
        />
      </div>

      {inputValue && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddClick}
          className="h-8 border-dashed border-2 border-input-border hover:border-input-border-focus text-weak hover:text-strong transition-all duration-200 group"
          disabled={disabled || (maxTags ? value.length >= maxTags : false)}
        >
          <Plus className="h-3 w-3 mr-1 group-hover:scale-110 transition-transform" />
          Add "{inputValue}"
        </Button>
      )}

      {maxTags && (
        <div className="text-xs text-muted-foreground">
          {value.length} / {maxTags} tags
        </div>
      )}
    </div>
  );
};

export { TagsInput };
