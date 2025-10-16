import React from "react";

const InputItem = ({
  label,
  onChange,
  maxLength,
  className,
  value,
  labelName,
  id,
  name,
  placeholder,
  disabled,
  type,
  error,
  ...rest
}) => {
  return (
    <div className="w-full">
      <label htmlFor={id} className="text-[#4D626C] font-normal flex items-center mb-1">
        {labelName}
      </label>

      <label htmlFor={id} className="text-black font-low pb-5">
        {label}
      </label>

      <input
        id={id}
        name={name}
        placeholder={placeholder}
        className={`w-full rounded-md px-4 py-2 text-md focus:outline-none focus:ring-2 ${
          error
            ? "border border-red-500 bg-red-50 focus:ring-red-300"
            : "border border-gray-400 bg-white focus:ring-[#CE932C]"
        } ${className}`}
        type={type}
        value={value ?? ""}
        onChange={onChange}
        maxLength={maxLength}
        disabled={disabled}
        {...rest}
      />

      {error && error !== "border_only" && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
};

export default InputItem;
