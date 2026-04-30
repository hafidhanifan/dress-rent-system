// src/app/(admin)/admin/dashboard/page.tsx

const stats = [
  {
    label: "Total Revenue",
    value: "Rp 24,8Jt",
    change: "+12%",
    sub: "vs bulan lalu",
    up: true,
    icon: (
      <svg
        width="16"
        height="16"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33"
        />
      </svg>
    ),
  },
  {
    label: "Active Orders",
    value: "38",
    change: "+5",
    sub: "hari ini",
    up: true,
    icon: (
      <svg
        width="16"
        height="16"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.25 6.75h7.5M8.25 12h7.5m-7.5 5.25h7.5M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
        />
      </svg>
    ),
  },
  {
    label: "Total Products",
    value: "124",
    change: "+3",
    sub: "produk baru",
    up: true,
    icon: (
      <svg
        width="16"
        height="16"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6 6h.008v.008H6V6z"
        />
      </svg>
    ),
  },
  {
    label: "Customers",
    value: "892",
    change: "+28",
    sub: "bulan ini",
    up: true,
    icon: (
      <svg
        width="16"
        height="16"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
        />
      </svg>
    ),
  },
];

const orders = [
  {
    id: "ORD-001",
    customer: "Siti Aurellia",
    product: "Celeste Midi Dress",
    date: "28 Apr",
    status: "Active",
    amount: "Rp 350.000",
  },
  {
    id: "ORD-002",
    customer: "Rina Kusuma",
    product: "Aurelia Evening Gown",
    date: "27 Apr",
    status: "Returned",
    amount: "Rp 580.000",
  },
  {
    id: "ORD-003",
    customer: "Maya Putri",
    product: "Vivienne Wrap Dress",
    date: "26 Apr",
    status: "Active",
    amount: "Rp 280.000",
  },
  {
    id: "ORD-004",
    customer: "Dina Ayu",
    product: "Noir Cocktail Dress",
    date: "25 Apr",
    status: "Pending",
    amount: "Rp 420.000",
  },
  {
    id: "ORD-005",
    customer: "Fara Nadhira",
    product: "Celeste Midi Dress",
    date: "24 Apr",
    status: "Returned",
    amount: "Rp 350.000",
  },
];

const topProducts = [
  { name: "Celeste Midi Dress", cat: "Midi", rentals: 48, bar: 90 },
  { name: "Aurelia Evening Gown", cat: "Evening", rentals: 35, bar: 68 },
  { name: "Vivienne Wrap Dress", cat: "Wrap", rentals: 29, bar: 56 },
  { name: "Noir Cocktail", cat: "Cocktail", rentals: 22, bar: 42 },
];

const statusCfg: Record<string, { bg: string; color: string; dot: string }> = {
  Active: { bg: "rgba(52,211,153,0.08)", color: "#34d399", dot: "#34d399" },
  Returned: { bg: "rgba(255,255,255,0.04)", color: "#5a5450", dot: "#3a3430" },
  Pending: { bg: "rgba(212,180,120,0.1)", color: "#d4b478", dot: "#d4b478" },
};

// Warna aksen emas
const GOLD = "#d4b478";
const CARD = "rgba(255,255,255,0.03)";
const BORDER = "rgba(255,255,255,0.07)";

export default function DashboardPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Greeting */}
      <div style={{ marginBottom: 4 }}>
        <p
          style={{
            fontSize: 11,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: "#4a4440",
          }}
        >
          Selamat datang kembali
        </p>
        <h2
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(1.6rem, 3vw, 2rem)",
            fontWeight: 300,
            color: "#e8ddc8",
            lineHeight: 1.2,
            marginTop: 4,
          }}
        >
          Naia Dress Dashboard
        </h2>
      </div>

      {/* ── Stat cards ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12,
        }}
      >
        {stats.map((s, i) => (
          <div
            key={i}
            style={{
              background: CARD,
              border: `1px solid ${BORDER}`,
              borderRadius: 4,
              padding: "20px 20px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Garis aksen atas */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 1,
                background:
                  i === 0
                    ? `linear-gradient(90deg, ${GOLD}, transparent)`
                    : "transparent",
              }}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 16,
              }}
            >
              <p
                style={{
                  fontSize: 9,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "#4a4440",
                }}
              >
                {s.label}
              </p>
              <span style={{ color: "#3a3430" }}>{s.icon}</span>
            </div>

            <p
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(1.5rem, 3vw, 2rem)",
                fontWeight: 300,
                color: "#e8ddc8",
                lineHeight: 1,
                marginBottom: 8,
              }}
            >
              {s.value}
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  fontSize: 10,
                  color: s.up ? "#34d399" : "#f87171",
                  background: s.up
                    ? "rgba(52,211,153,0.1)"
                    : "rgba(248,113,113,0.1)",
                  padding: "2px 7px",
                  borderRadius: 20,
                }}
              >
                {s.up ? "↑" : "↓"} {s.change}
              </span>
              <span style={{ fontSize: 10, color: "#3a3430" }}>{s.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Row 2: Tabel + Top Products ── */}
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}
        className="xl:grid-cols-[1fr_300px]"
      >
        {/* Tabel orders */}
        <div
          style={{
            background: CARD,
            border: `1px solid ${BORDER}`,
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "16px 20px",
              borderBottom: `1px solid ${BORDER}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <p
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 16,
                fontWeight: 300,
                color: "#c8baa0",
              }}
            >
              Recent Orders
            </p>
            <a
              href="/admin/orders"
              style={{
                fontSize: 10,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "#4a4440",
              }}
              className="hover:!text-[#d4b478] transition-colors"
            >
              View All →
            </a>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                minWidth: 520,
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr>
                  {[
                    "Order",
                    "Customer",
                    "Product",
                    "Date",
                    "Status",
                    "Amount",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 20px",
                        textAlign: "left",
                        fontSize: 9,
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        color: "#3a3430",
                        fontWeight: 400,
                        borderBottom: `1px solid ${BORDER}`,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((o, i) => (
                  <tr
                    key={i}
                    style={{ borderBottom: `1px solid rgba(255,255,255,0.03)` }}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td
                      style={{
                        padding: "14px 20px",
                        fontSize: 11,
                        color: "#4a4440",
                        fontFamily: "monospace",
                      }}
                    >
                      {o.id}
                    </td>
                    <td
                      style={{
                        padding: "14px 20px",
                        fontSize: 12,
                        color: "#c8baa0",
                      }}
                    >
                      {o.customer}
                    </td>
                    <td
                      style={{
                        padding: "14px 20px",
                        fontSize: 11,
                        color: "#5a5450",
                      }}
                    >
                      {o.product}
                    </td>
                    <td
                      style={{
                        padding: "14px 20px",
                        fontSize: 11,
                        color: "#3a3430",
                      }}
                    >
                      {o.date}
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          fontSize: 9,
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          padding: "3px 10px",
                          borderRadius: 20,
                          background: statusCfg[o.status].bg,
                          color: statusCfg[o.status].color,
                          border: `1px solid ${statusCfg[o.status].color}22`,
                        }}
                      >
                        <span
                          style={{
                            width: 4,
                            height: 4,
                            borderRadius: "50%",
                            background: statusCfg[o.status].dot,
                            flexShrink: 0,
                          }}
                        />
                        {o.status}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "14px 20px",
                        fontSize: 12,
                        color: "#c8baa0",
                      }}
                    >
                      {o.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top products */}
        <div
          style={{
            background: CARD,
            border: `1px solid ${BORDER}`,
            borderRadius: 4,
          }}
        >
          <div
            style={{
              padding: "16px 20px",
              borderBottom: `1px solid ${BORDER}`,
            }}
          >
            <p
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 16,
                fontWeight: 300,
                color: "#c8baa0",
              }}
            >
              Top Products
            </p>
          </div>
          <div style={{ padding: "8px 0" }}>
            {topProducts.map((p, i) => (
              <div
                key={i}
                style={{
                  padding: "14px 20px",
                  borderBottom:
                    i < topProducts.length - 1
                      ? `1px solid rgba(255,255,255,0.03)`
                      : "none",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontSize: 12,
                        color: "#c8baa0",
                        marginBottom: 2,
                      }}
                    >
                      {p.name}
                    </p>
                    <p
                      style={{
                        fontSize: 9,
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        color: "#3a3430",
                      }}
                    >
                      {p.cat}
                    </p>
                  </div>
                  <p style={{ fontSize: 11, color: "#d4b478" }}>{p.rentals}×</p>
                </div>
                {/* Progress bar */}
                <div
                  style={{
                    height: 2,
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: 2,
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${p.bar}%`,
                      background: `linear-gradient(90deg, ${GOLD}, #c8a060)`,
                      borderRadius: 2,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
