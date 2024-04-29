import { useState, forwardRef, useEffect } from "react";
import Input, { getCountryCallingCode } from "react-phone-number-input/input";
import { TextField } from "@mui/material";
import { DefaultInputComponentProps } from "react-phone-number-input/index";
import useStore from "../../hooks/useStore";

interface EditorInputPhoneProps {
  variant?: "standard" | "filled" | "outlined";
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  value: string;
  name: string;

  onChange(name: string, value: string, isValid: boolean): void;

  touched?: boolean;
}

const EditorInputPhone = ({
  label,
  placeholder,
  value,
  name,
  required,
  onChange,
  disabled,
  touched,
}: EditorInputPhoneProps) => {
  const [state, setState] = useState({
    touched: false,
    valid: false,
    errorMsg: "",
  });
  const { translations } = useStore();

  useEffect(() => {
    if (touched) {
      handleChange(value);
    }
    // eslint-disable-next-line
  }, [touched]);
  const handleChange = (value: string) => {
    const val = value;
    let isValid = true;
    let errorMsg = "";
    if (required && (!val || `${val}`.trim().length <= `+${getCountryCallingCode("RU")}`.length)) {
      isValid = false;
      errorMsg = translations?.validation?.required || "Required";
    }
    setState({ touched: true, valid: isValid, errorMsg: errorMsg });
    onChange(name, val, isValid);
  };

  return (
    <Input
      country="RU"
      // international={false}
      international
      withCountryCallingCode
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      label={label}
      disabled={disabled}
      touched={touched}
      required={required}
      error={state.touched && !state.valid}
      helperText={state.touched && !state.valid && state.errorMsg}
      inputComponent={PhoneInput}
    />
  );
};

const PhoneInput = forwardRef<any>(
  (props: DefaultInputComponentProps, ref: React.Ref<HTMLInputElement>) => {
    const { ...inputProps } = props;
    return <TextField {...inputProps} inputRef={ref} fullWidth name="phone" />;
  }
);
PhoneInput.displayName = "PhoneInput";

export { EditorInputPhone };
