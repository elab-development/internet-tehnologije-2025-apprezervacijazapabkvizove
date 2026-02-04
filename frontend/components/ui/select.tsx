type Option = { value: string | number; label: string };

type Props = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: Option[];
};

export default function Select({ label, options, ...props }: Props) {
  return (
    <label style={{ display: "block", marginBottom: 12 }}>
      <div style={{ marginBottom: 6 }}>{label}</div>
      <select
        {...props}
        style={{
          padding: "10px 12px",
          border: "1px solid #ccc",
          borderRadius: 8,
          width: "100%",
          ...(props.style || {}),
        }}
      >
        {options.map((o) => (
          <option key={String(o.value)} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
