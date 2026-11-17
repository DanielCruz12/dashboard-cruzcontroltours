import { useField } from 'formik';
import Select from 'react-select';

interface OptionType {
  value: string;
  label: string;
}

interface FormSelectProps {
  name: string;
  options: OptionType[];
  isMultiSelect?: boolean;
  placeH?: string;
  onSelectedChange?: (selected: OptionType[] | OptionType | null) => void;
}

const FormSelect: React.FC<FormSelectProps> = ({
  name,
  options,
  isMultiSelect = false,
  placeH = 'Select...',
  onSelectedChange,
}) => {
  const [field, , helpers] = useField(name); 

  return (
    <Select
      instanceId={name} 
      isMulti={isMultiSelect}
      options={options}
      placeholder={placeH}
      value={field.value || null}
      onChange={(value) => {
        helpers.setValue(value); 
        if (onSelectedChange) onSelectedChange(value);
      }}
      onBlur={() => helpers.setTouched(true)} 
      classNamePrefix="react-select"
      maxMenuHeight={160}
    />
  );
};

export default FormSelect;
