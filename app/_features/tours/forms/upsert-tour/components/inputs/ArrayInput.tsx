import {
  FieldValues,
  Path,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";

interface ArrayInputProps<T extends FieldValues> {
  name: Path<T>;
  placeholder?: string;
  label: string;
  error?: boolean;
  errorMessage?: string;
  register: UseFormRegister<T>;
  setValue: UseFormSetValue<T>;
  watch: UseFormWatch<T>;
}

export default function ArrayInput<T extends FieldValues>({
  name,
  placeholder,
  label,
  error,
  errorMessage,
  register,
  setValue,
  watch,
}: ArrayInputProps<T>) {
  const handleArrayInput = (value: string) => {
    const currentValue = (watch(name) as string[]) || [];
    if (value.trim()) {
      setValue(name, [...currentValue, value.trim()] as any);
    }
  };

  const removeArrayItem = (index: number) => {
    const currentValue = watch(name) as string[];
    setValue(name, currentValue.filter((_, i) => i !== index) as any);
  };

  return (
    <div>
      <label
        className={`block mb-1 text-sm/6 font-medium ${
          error ? "text-red-500" : "text-strong"
        }`}
      >
        {label}
      </label>
      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            className={`block w-full rounded-md bg-white px-3 py-1.5 text-base text-strong outline-1 -outline-offset-1 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 sm:text-sm/6 ${
              error
                ? "outline-red-500"
                : "outline-gray-300 focus:outline-indigo-600"
            }`}
            placeholder={placeholder}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleArrayInput(e.currentTarget.value);
                e.currentTarget.value = "";
              }
            }}
          />
          <button
            type="button"
            onClick={(e) => {
              const input = e.currentTarget
                .previousElementSibling as HTMLInputElement;
              handleArrayInput(input.value);
              input.value = "";
            }}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {(Array.isArray(watch(name)) ? watch(name) : []).map(
            (item, index) => (
              <div
                key={index}
                className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-md"
              >
                <span className="text-sm">{item}</span>
                <button
                  type="button"
                  onClick={() => removeArrayItem(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            )
          )}
        </div>
      </div>
      {error && errorMessage && (
        <p className="mt-1 text-sm text-red-500">{errorMessage}</p>
      )}
    </div>
  );
}
