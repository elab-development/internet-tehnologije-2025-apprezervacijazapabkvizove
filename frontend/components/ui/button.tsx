type Props = React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button(props: Props) {
  return (
    <button
      {...props}
      style={{
        padding: "10px 12px",
        border: "1px solid #ccc",
        borderRadius: 8,
        cursor: "pointer",
        ...(props.style || {}),
      }}
    />
  );
}
