'use client'

import { useField } from 'formik';
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface ReusableInputProps {
  label: string;
  name: string;
  placeholder?: string;
  typeInput?: string;
  classN?: string;
}

export const ReusableInput: React.FC<ReusableInputProps> = ({
  label,
  name,
  placeholder,
  typeInput = 'text',
  classN = '',
}) => {
  const [field, meta] = useField(name);

  const InputComponent = typeInput === 'textarea' ? Textarea : Input;

  return (
    <div className="w-full">
      <Label htmlFor={name} className="block text-sm font-medium mb-1 text-gray-700">
        {label}
      </Label>
      <InputComponent
        {...field}
        id={name}
        placeholder={placeholder}
        type={typeInput}
        className={`w-full p-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${classN}`}
      />
      {meta.touched && meta.error ? (
        <div className="text-red-500 text-sm mt-1">{meta.error}</div>
      ) : null}
    </div>
  );
};

