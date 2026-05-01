'use client';
import ReactPhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

interface Props {
  value: string;
  onChange: (val: string) => void;
  required?: boolean;
  accentColor?: string;
}

export default function PhoneInput({ value, onChange, required, accentColor = '#cf3232' }: Props) {
  return (
    <div className="phone-input-wrapper">
      <ReactPhoneInput
        country="us"
        value={value}
        onChange={onChange}
        enableSearch
        searchPlaceholder="Search country..."
        inputProps={{ required }}
        containerStyle={{ width: '100%' }}
        inputStyle={{
          width: '100%',
          height: '42px',
          fontSize: '13px',
          borderRadius: '8px',
          border: '1px solid #d1d5db',
          paddingLeft: '52px',
          color: '#111827',
          background: '#fff',
        }}
        buttonStyle={{
          borderRadius: '8px 0 0 8px',
          border: '1px solid #d1d5db',
          borderRight: '1px solid #d1d5db',
          background: '#FAEFEF',
        }}
        dropdownStyle={{ borderRadius: '8px', fontSize: '13px', zIndex: 9999 }}
      />
      <style>{`
        .phone-input-wrapper .react-tel-input .form-control:focus {
          border-color: ${accentColor} !important;
          box-shadow: none !important;
          outline: none;
        }
        .phone-input-wrapper .react-tel-input .form-control:focus + .flag-dropdown,
        .phone-input-wrapper .react-tel-input .flag-dropdown.open {
          border-color: ${accentColor} !important;
          border-right-color: ${accentColor} !important;
        }
        .phone-input-wrapper .react-tel-input .flag-dropdown:hover {
          border-color: ${accentColor} !important;
          border-right-color: ${accentColor} !important;
        }
        .phone-input-wrapper .react-tel-input .flag-dropdown {
          border-right: 1px solid #d1d5db !important;
          transition: border-color 0.15s;
        }
      `}</style>
    </div>
  );
}
