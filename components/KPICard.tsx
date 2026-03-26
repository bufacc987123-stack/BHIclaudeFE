export default function KPICard({ title, value }: any) {
  return (
    <div style={{
      background: "#fff",
      padding: "20px",
      borderRadius: "12px",
      boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
      minWidth: "180px"
    }}>
      <h4 style={{ color: "#555" }}>{title}</h4>
      <h2 style={{ marginTop: "10px" }}>{value}</h2>
    </div>
  );
}