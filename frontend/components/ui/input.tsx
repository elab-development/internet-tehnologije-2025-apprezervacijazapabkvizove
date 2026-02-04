type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export default function Input({ label, ...props }: Props) {
  return (
    <label style={{ display: "block", marginBottom: 12 }}>
      <div style={{ marginBottom: 6 }}>{label}</div>
      <input
        {...props}
        style={{
          padding: "10px 12px",
          border: "1px solid #ccc",
          borderRadius: 8,
          width: "100%",
          ...(props.style || {}),
        }}
      />
    </label>
  );
}
