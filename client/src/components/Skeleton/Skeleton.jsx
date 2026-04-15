import "./Skeleton.css";

const Box = ({ width = "100%", height = 16, borderRadius = 6, className = "" }) => (
  <div className={`skeleton ${className}`} style={{ width, height, borderRadius }} />
);

export const DashboardSkeleton = () => (
  <>
    {/* Summary Cards */}
    <div className="row g-3 mb-4">
      {[...Array(4)].map((_, i) => (
        <div className="col-6 col-md-3" key={i}>
          <div className="skeleton-card d-flex align-items-center gap-3" style={{ height: 80 }}>
            <Box width={40} height={40} borderRadius={10} />
            <div className="flex-1 w-100">
              <Box width="55%" height={10} className="mb-2" />
              <Box width="75%" height={20} />
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Budget Bar */}
    <div className="skeleton-card mb-4" style={{ height: 80 }}>
      <Box width="30%" height={12} className="mb-3" />
      <Box width="100%" height={10} borderRadius={99} />
    </div>

    {/* Charts */}
    <div className="row g-3 mb-4">
      <div className="col-12 col-md-5">
        <div className="skeleton-card" style={{ height: 260 }}>
          <Box width="40%" height={14} className="mb-3" />
          <div className="d-flex justify-content-center align-items-center" style={{ height: 200 }}>
            <Box width={160} height={160} borderRadius="50%" />
          </div>
        </div>
      </div>
      <div className="col-12 col-md-7">
        <div className="skeleton-card" style={{ height: 260 }}>
          <Box width="50%" height={14} className="mb-3" />
          <div className="d-flex align-items-end gap-2 mt-4" style={{ height: 180 }}>
            {[60, 40, 80, 30, 90, 50, 70].map((h, i) => (
              <Box key={i} width="100%" height={`${h}%`} borderRadius={4} />
            ))}
          </div>
        </div>
      </div>
    </div>

    {/* Recent Transactions */}
    <div className="skeleton-card p-3">
      <Box width="40%" height={14} className="mb-3" />
      {[...Array(4)].map((_, i) => (
        <div key={i} className="d-flex justify-content-between align-items-center py-2" style={{ borderBottom: "1px solid #f3f4f6" }}>
          <div className="d-flex gap-2 align-items-center">
            <Box width={40} height={40} borderRadius={12} />
            <div>
              <Box width={120} height={12} className="mb-1" />
              <Box width={80} height={10} />
            </div>
          </div>
          <Box width={70} height={13} />
        </div>
      ))}
    </div>
  </>
);

export const ExpenseListSkeleton = () => (
  <>
    {[...Array(6)].map((_, i) => (
      <div className="skeleton-expense-card d-flex justify-content-between align-items-center" key={i}>
        <div className="d-flex align-items-center gap-2">
          <Box width={8} height={8} borderRadius="50%" />
          <Box width={120 + i * 10} height={13} />
        </div>
        <div className="d-flex gap-2">
          <Box width={28} height={28} borderRadius={6} />
          <Box width={28} height={28} borderRadius={6} />
          <Box width={28} height={28} borderRadius={6} />
        </div>
      </div>
    ))}
  </>
);

export default Box;
