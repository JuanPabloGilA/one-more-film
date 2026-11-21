'use client';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export type PreferenceOption<T extends string> = { value: T; label: string; hint: string };

/** One numbered step of the preference form: a set of large radio cards. */
export const PreferenceOptions = <T extends string>({
  name,
  step,
  legend,
  options,
  value,
  disabled,
  onChange,
}: {
  name: string;
  step: string;
  legend: string;
  options: PreferenceOption<T>[];
  value: T;
  disabled: boolean;
  onChange: (value: T) => void;
}) => (
  <fieldset disabled={disabled}>
    <legend>
      <span>{step}</span> {legend}
    </legend>
    <RadioGroup
      name={name}
      aria-label={legend}
      className="preference-options"
      value={value}
      disabled={disabled}
      // Base UI types the value as unknown; it is always one of `options`.
      onValueChange={(next) => onChange(next as T)}
    >
      {options.map((option) => (
        <label
          key={option.value}
          htmlFor={`${name}-${option.value}`}
          className="preference-radio has-[[data-checked]]:border-primary has-[[data-checked]]:bg-accent"
        >
          <RadioGroupItem id={`${name}-${option.value}`} value={option.value} className="order-2" />
          <span>
            <strong>{option.label}</strong>
            <small>{option.hint}</small>
          </span>
        </label>
      ))}
    </RadioGroup>
  </fieldset>
);
