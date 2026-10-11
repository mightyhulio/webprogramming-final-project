import { useEffect, useMemo, useRef, useState } from "react";
import { jsPDF } from "jspdf";
import "./App.css";

const initialProducts = [
  { id: 1, name: "Wireless Mouse", price: 899, stock: 24 },
  { id: 2, name: "USB-C Hub", price: 1299, stock: 15 },
  { id: 3, name: "Mechanical Keyboard", price: 2499, stock: 9 },
];

const modules = [
  {
    id: "biometric",
    name: "Biometric Sync",
    description: "Sync attendance data from biometric devices.",
    price: 14500,
    impact: "Stronger timekeeping and attendance visibility.",
    badge: "High-demand",
  },
  {
    id: "cloud",
    name: "Multi-Branch Cloud Relay",
    description: "Connect branches through one live data layer.",
    price: 22000,
    impact: "Centralized branch-level reporting and shared inventory views.",
    badge: "Enterprise core",
  },
  {
    id: "tax",
    name: "AI Tax Automation",
    description: "Automate tax calculations and compliance checks.",
    price: 18500,
    impact: "Faster compliance workflows and fewer manual tax reviews.",
    badge: "Compliance boost",
  },
];

const comparisonTabs = [
  { id: "operations", label: "Operations" },
  { id: "payroll", label: "Payroll" },
  { id: "analytics", label: "Analytics" },
  { id: "compliance", label: "Compliance" },
];

const comparisonData = {
  operations: [
    {
      label: "Deployment model",
      basic: "Standalone POS rollout",
      suite: "Unified ERP + POS deployment across teams",
      module: null,
    },
    {
      label: "Branch coordination",
      basic: "Manual branch-level coordination",
      suite: "Cross-site workflows with central oversight",
      module: "cloud",
    },
    {
      label: "Attendance sync",
      basic: "Separate biometric or spreadsheet tracking",
      suite: "Integrated workforce attendance stream",
      module: "biometric",
    },
  ],
  payroll: [
    {
      label: "Payroll processing",
      basic: "Manual reconciliation before release",
      suite: "Automated payroll preparation and validation",
      module: null,
    },
    {
      label: "Timekeeping input",
      basic: "Uploaded attendance files",
      suite: "Direct biometric attendance intake",
      module: "biometric",
    },
    {
      label: "Exception handling",
      basic: "Reactive HR follow-up",
      suite: "Pre-check exceptions before payroll run",
      module: null,
    },
  ],
  analytics: [
    {
      label: "Reporting visibility",
      basic: "Store-level snapshot reports",
      suite: "Centralized analytics across branches",
      module: "cloud",
    },
    {
      label: "Executive dashboards",
      basic: "Static exports",
      suite: "Live operational dashboards and trend views",
      module: null,
    },
    {
      label: "Decision latency",
      basic: "Delayed operational insight",
      suite: "Faster decisions from unified data",
      module: "cloud",
    },
  ],
  compliance: [
    {
      label: "Tax calculation",
      basic: "Manual setup and review",
      suite: "Automated tax logic and audit-ready computation",
      module: "tax",
    },
    {
      label: "Compliance tracking",
      basic: "Fragmented spreadsheet process",
      suite: "System-guided compliance checkpoints",
      module: "tax",
    },
    {
      label: "Payroll-tax alignment",
      basic: "Separate payroll and tax review passes",
      suite: "Connected payroll and compliance workflow",
      module: "tax",
    },
  ],
};

const testimonials = [
  {
    quote: "We reduced branch reporting delays by 42% in one quarter.",
    source: "Operations Director, Retail Group",
  },
  {
    quote: "Payroll validation that took hours now takes minutes.",
    source: "HR Lead, Hospitality Network",
  },
  {
    quote: "The POS and ERP data finally live in one usable system.",
    source: "Finance Manager, Multi-branch Distributor",
  },
];

const peso = (value) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(value);

function AnimatedNumber({ value, format = "number", duration = 700 }) {
  const [displayValue, setDisplayValue] = useState(value);
  const previousValue = useRef(value);

  useEffect(() => {
    let frameId;
    const start = previousValue.current;
    const end = value;
    const startTime = performance.now();

    function animate(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * eased;
      setDisplayValue(current);

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      } else {
        previousValue.current = end;
      }
    }

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [value, duration]);

  if (format === "currency") {
    return <span className="animated-number">{peso(Math.round(displayValue))}</span>;
  }

  if (format === "percent") {
    return <span className="animated-number">{Math.round(displayValue)}%</span>;
  }

  return <span className="animated-number">{Math.round(displayValue)}</span>;
}

function App() {
  const [activeTab, setActiveTab] = useState("analytics");
  const [comparisonTab, setComparisonTab] = useState("operations");
  const [employees, setEmployees] = useState(50);
  const [branches, setBranches] = useState(2);
  const [enabledModules, setEnabledModules] = useState(["cloud"]);
  const [inventory, setInventory] = useState(initialProducts.map((item) => ({ ...item })));
  const [cart, setCart] = useState([]);
  const [notice, setNotice] = useState("");
  const [payrollRun, setPayrollRun] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [formErrors, setFormErrors] = useState({});
  const [submittedRequest, setSubmittedRequest] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);
  const [formData, setFormData] = useState({
    company: "",
    domain: "",
    role: "",
    stack: "",
    teamSize: "",
    timeline: "",
    priority: "",
  });

  const selectedModuleData = useMemo(
    () => modules.filter((module) => enabledModules.includes(module.id)),
    [enabledModules]
  );

  const moduleCost = useMemo(
    () => selectedModuleData.reduce((sum, module) => sum + module.price, 0),
    [selectedModuleData]
  );

  const estimatedAnnualCost = useMemo(
    () => employees * 120 * 12 + branches * 25000 + moduleCost,
    [employees, branches, moduleCost]
  );

  const roi = useMemo(() => {
    const monthlyHoursSaved = employees * 1.6 + branches * 9;
    const annualHoursSaved = Math.round(monthlyHoursSaved * 12);
    const annualSavings = annualHoursSaved * 325;
    const roiPercent =
      estimatedAnnualCost > 0
        ? Math.max(
            0,
            Math.round(((annualSavings - estimatedAnnualCost) / estimatedAnnualCost) * 100)
          )
        : 0;

    return {
      annualHoursSaved,
      annualSavings,
      roiPercent,
    };
  }, [employees, branches, estimatedAnnualCost]);

  const saleTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price, 0),
    [cart]
  );

  const visibleComparisonRows = comparisonData[comparisonTab];

  const unlockedCapabilities = useMemo(
    () =>
      selectedModuleData.map((module) => ({
        id: module.id,
        name: module.name,
        impact: module.impact,
        badge: module.badge,
      })),
    [selectedModuleData]
  );

  const heroStats = [
    { label: "Availability target", value: "99.99%" },
    { label: "Active enterprise seats", value: 18240, format: "number" },
    { label: "Time to value", value: "3 clicks" },
    { label: "Demo instances launched", value: 248, format: "number" },
  ];

  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(""), 1800);
    return () => clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    if (isCarouselPaused) return undefined;
    const timer = setTimeout(() => {
      setActiveTestimonial((current) => (current + 1) % testimonials.length);
    }, 3200);
    return () => clearTimeout(timer);
  }, [activeTestimonial, isCarouselPaused]);

  function toggleModule(moduleId) {
    setEnabledModules((current) =>
      current.includes(moduleId)
        ? current.filter((id) => id !== moduleId)
        : [...current, moduleId]
    );
    setNotice("Module bundle updated");
  }

  function scanProduct(product) {
    if (product.stock === 0) {
      setNotice(`${product.name} is out of stock`);
      return;
    }

    setInventory((current) =>
      current.map((item) =>
        item.id === product.id ? { ...item, stock: item.stock - 1 } : item
      )
    );

    setCart((current) => [...current, product]);
    setNotice(`${product.name} scanned successfully`);
  }

  function resetSale() {
    setInventory(initialProducts.map((item) => ({ ...item })));
    setCart([]);
    setNotice("Sale reset");
  }

  function runPayrollSimulation() {
    setPayrollRun(true);
    setNotice("Payroll automation completed");
  }

  function exportProposal() {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 40;
    const contentWidth = pageWidth - margin * 2;

    const colors = {
      slate: [11, 15, 25],
      cyan: [0, 240, 255],
      violet: [124, 58, 237],
      text: [15, 23, 42],
      muted: [100, 116, 139],
      border: [219, 229, 240],
      white: [255, 255, 255],
      soft: [248, 251, 255],
      accentSoft: [236, 254, 255],
      accentBorder: [165, 243, 252],
    };

    const selectedModules = selectedModuleData.length
      ? selectedModuleData
      : [{ name: "No optional modules selected", price: 0 }];

    let y = 0;

    doc.setFillColor(...colors.slate);
    doc.rect(0, 0, pageWidth, 180, "F");

    doc.setFillColor(...colors.violet);
    doc.circle(pageWidth - 90, 60, 42, "F");

    doc.setFillColor(...colors.cyan);
    doc.circle(pageWidth - 50, 110, 22, "F");

    doc.setTextColor(...colors.cyan);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("NEXUSTECH B2B SOLUTIONS", margin, 42);

    doc.setTextColor(...colors.white);
    doc.setFontSize(26);
    doc.text("Custom Proposal Summary", margin, 72);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(220, 230, 245);
    const subtitle = doc.splitTextToSize(
      "Enterprise software promotional configuration snapshot for stakeholder review, sandbox evaluation, and next-step demo qualification.",
      340
    );
    doc.text(subtitle, margin, 94);

    const heroCards = [
      { label: "Projected ROI", value: `${roi.roiPercent}%` },
      { label: "Annual Savings", value: peso(roi.annualSavings) },
      { label: "Platform Cost", value: peso(estimatedAnnualCost) },
    ];

    let cardX = margin;
    heroCards.forEach((card) => {
      doc.setFillColor(255, 255, 255);
      doc.setGState(new doc.GState({ opacity: 0.12 }));
      doc.roundedRect(cardX, 128, 160, 42, 10, 10, "F");
      doc.setGState(new doc.GState({ opacity: 1 }));

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(210, 223, 240);
      doc.text(card.label.toUpperCase(), cardX + 12, 143);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(...colors.white);
      doc.text(card.value, cardX + 12, 159);

      cardX += 172;
    });

    y = 220;

    const drawSectionTitle = (title) => {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...colors.text);
      doc.setFontSize(15);
      doc.text(title, margin, y);
      y += 18;
    };

    const drawInfoCard = (x, top, width, label, value) => {
      doc.setFillColor(...colors.soft);
      doc.setDrawColor(...colors.border);
      doc.roundedRect(x, top, width, 72, 12, 12, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(...colors.muted);
      doc.text(label.toUpperCase(), x + 14, top + 20);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(...colors.text);
      doc.text(String(value), x + 14, top + 48);
    };

    drawSectionTitle("Business Profile");
    drawInfoCard(margin, y, (contentWidth - 12) / 2, "Employee Headcount", employees);
    drawInfoCard(
      margin + (contentWidth - 12) / 2 + 12,
      y,
      (contentWidth - 12) / 2,
      "Operational Branches",
      branches
    );
    y += 96;

    drawSectionTitle("Selected Modules");
    selectedModules.forEach((module) => {
      doc.setFillColor(...colors.white);
      doc.setDrawColor(...colors.border);
      doc.roundedRect(margin, y, contentWidth, 34, 10, 10, "FD");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(...colors.text);
      doc.text(module.name, margin + 14, y + 21);

      doc.setFont("helvetica", "bold");
      doc.text(peso(module.price), pageWidth - margin - 14, y + 21, {
        align: "right",
      });

      y += 42;
    });

    y += 8;
    drawSectionTitle("Value Estimate");

    const summaryCards = [
      { label: "Annual Hours Saved", value: String(roi.annualHoursSaved), accent: false },
      { label: "Estimated Savings", value: peso(roi.annualSavings), accent: false },
      { label: "Projected ROI", value: `${roi.roiPercent}%`, accent: true },
    ];

    const summaryWidth = (contentWidth - 24) / 3;
    let summaryX = margin;

    summaryCards.forEach((card) => {
      doc.setFillColor(...(card.accent ? colors.accentSoft : colors.soft));
      doc.setDrawColor(...(card.accent ? colors.accentBorder : colors.border));
      doc.roundedRect(summaryX, y, summaryWidth, 78, 12, 12, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(...colors.muted);
      doc.text(card.label.toUpperCase(), summaryX + 14, y + 20);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(...colors.text);
      doc.text(card.value, summaryX + 14, y + 48);

      summaryX += summaryWidth + 12;
    });

    y += 102;

    doc.setFillColor(...colors.slate);
    doc.roundedRect(margin, y, contentWidth, 72, 12, 12, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...colors.white);
    doc.text("Recommended Next Step", margin + 16, y + 22);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(226, 232, 240);
    const footerText = doc.splitTextToSize(
      "Request a 14-day populated sandbox to validate reporting workflows, payroll automation, multi-branch visibility, and operational fit.",
      contentWidth - 32
    );
    doc.text(footerText, margin + 16, y + 42);

    doc.save("nexustech-custom-proposal.pdf");
    setNotice("Branded PDF proposal downloaded");
  }

  function updateForm(field, value) {
    setFormData((current) => ({ ...current, [field]: value }));
    setFormErrors((current) => ({ ...current, [field]: "" }));
  }

  function validateStep(step) {
    const nextErrors = {};

    if (step === 1) {
      if (!formData.company.trim()) nextErrors.company = "Company name is required.";
      if (!formData.domain.trim()) {
        nextErrors.domain = "Company domain is required.";
      } else if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.domain.trim())) {
        nextErrors.domain = "Enter a valid domain such as company.com.";
      }
    }

    if (step === 2) {
      if (!formData.role.trim()) nextErrors.role = "Role is required.";
      if (!formData.stack.trim()) nextErrors.stack = "Current stack is required.";
    }

    if (step === 3) {
      if (!formData.teamSize) nextErrors.teamSize = "Select a company size.";
      if (!formData.timeline) nextErrors.timeline = "Select an implementation timeline.";
      if (!formData.priority) nextErrors.priority = "Choose your primary evaluation priority.";
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function openModal() {
    setShowModal(true);
    setSubmittedRequest(false);
    setFormStep(1);
    setFormErrors({});
  }

  function closeModal() {
    setShowModal(false);
    setSubmittedRequest(false);
    setFormStep(1);
    setFormErrors({});
  }

  function goNextStep() {
    if (!validateStep(formStep)) return;
    setFormStep((current) => current + 1);
  }

  function goBackStep() {
    setFormErrors({});
    setFormStep((current) => Math.max(1, current - 1));
  }

  function submitSandboxRequest(event) {
    event.preventDefault();
    if (!validateStep(3)) return;
    setSubmittedRequest(true);
    setNotice("14-day sandbox request submitted");
  }

  return (
    <div className="app-shell">
      <div className="grid-glow grid-glow-left" />
      <div className="grid-glow grid-glow-right" />
      <div className="grid-overlay" />

      <header className="hero-section">
        <nav className="topbar">
          <div className="brand-lockup">
            <div className="brand-mark">N</div>
            <div>
              <p className="eyebrow">NexusTech B2B Solutions</p>
              <h1>Enterprise software promotional portal</h1>
            </div>
          </div>

          <div className="topbar-actions">
            <button className="ghost-button" onClick={exportProposal} type="button">
              Export PDF proposal
            </button>
            <button className="primary-button" onClick={openModal} type="button">
              Request sandbox access
            </button>
          </div>
        </nav>

        <section className="hero-content">
          <div className="hero-copy">
            <span className="eyebrow">Interactive product showcase</span>
            <h2>Enterprise software demos built for faster buying decisions.</h2>
            <p className="hero-support-copy">
              Explore a polished enterprise portal that brings live analytics,
              payroll automation, POS workflows, configurable modules, and
              proposal-ready outputs into one guided product experience.
            </p>

            <div className="hero-cta-row">
              <button
                className="primary-button"
                onClick={() => setActiveTab("pos")}
                type="button"
              >
                Open POS scanner demo
              </button>
              <button
                className="secondary-button"
                onClick={() => setActiveTab("roi")}
                type="button"
              >
                Launch ROI calculator
              </button>
            </div>

            <div className="proof-strip">
              {heroStats.map((stat) => (
                <div className="proof-card" key={stat.label}>
                  <strong>
                    {typeof stat.value === "number" ? (
                      <AnimatedNumber value={stat.value} format={stat.format || "number"} />
                    ) : (
                      stat.value
                    )}
                  </strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          <aside className="hero-panel">
            <div className="hero-panel-header">
              <span className="eyebrow">Live enterprise snapshot</span>
              <span className="live-pill">
                <span className="live-dot" />
                Live sync
              </span>
            </div>

            <div className="metric-grid">
              <article className="metric-card">
                <p>Branches connected</p>
                <strong>
                  <AnimatedNumber value={branches} />
                </strong>
                <small>Cloud relay active</small>
              </article>
              <article className="metric-card">
                <p>Annual savings</p>
                <strong>
                  <AnimatedNumber value={roi.annualSavings} format="currency" />
                </strong>
                <small>Based on current inputs</small>
              </article>
              <article className="metric-card">
                <p>Modules enabled</p>
                <strong>
                  <AnimatedNumber value={enabledModules.length} />
                </strong>
                <small>Dynamic stack selection</small>
              </article>
              <article className="metric-card">
                <p>POS items scanned</p>
                <strong>
                  <AnimatedNumber value={cart.length} />
                </strong>
                <small>Real-time micro-demo</small>
              </article>
            </div>

            <div className="hero-panel-note">
              <div className="hero-panel-line" />
              <p>
                Unified analytics, payroll automation, POS simulation, and modular
                configuration inside one guided evaluation flow.
              </p>
            </div>
          </aside>
        </section>
      </header>

      <main className="main-content">
        <section className="sandbox-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Live feature sandbox</span>
              <h3>Interactive product showcase micro-demos</h3>
              <p>
                Switch between sandbox modules to preview live state changes and
                conversion-oriented interactions.
              </p>
            </div>
          </div>

          <div className="tab-row">
            <button
              className={activeTab === "analytics" ? "tab-button active" : "tab-button"}
              onClick={() => setActiveTab("analytics")}
              type="button"
            >
              Analytics
            </button>
            <button
              className={activeTab === "pos" ? "tab-button active" : "tab-button"}
              onClick={() => setActiveTab("pos")}
              type="button"
            >
              POS Scanner
            </button>
            <button
              className={activeTab === "payroll" ? "tab-button active" : "tab-button"}
              onClick={() => setActiveTab("payroll")}
              type="button"
            >
              Payroll
            </button>
            <button
              className={activeTab === "roi" ? "tab-button active" : "tab-button"}
              onClick={() => setActiveTab("roi")}
              type="button"
            >
              ROI Calculator
            </button>
            <button
              className={activeTab === "configurator" ? "tab-button active" : "tab-button"}
              onClick={() => setActiveTab("configurator")}
              type="button"
            >
              Module Configurator
            </button>
          </div>

          {notice ? <div className="scan-notice">{notice}</div> : null}

          {activeTab === "analytics" && (
            <section className="demo-panel">
              <div className="panel-header">
                <div>
                  <span className="eyebrow">Real-time analytics</span>
                  <h3>Branch operations dashboard</h3>
                </div>
                <span className="status-pill">Live sync</span>
              </div>

              <div className="analytics-grid">
                <article className="glass-card">
                  <p>Order throughput</p>
                  <strong>+18.4%</strong>
                  <small>Compared with last cycle</small>
                </article>
                <article className="glass-card">
                  <p>Inventory alerts</p>
                  <strong>07</strong>
                  <small>Auto-detected restock events</small>
                </article>
                <article className="glass-card">
                  <p>Payroll exceptions</p>
                  <strong>02</strong>
                  <small>Ready for review</small>
                </article>
              </div>

              <div className="mini-chart">
                <div style={{ height: "72%" }} />
                <div style={{ height: "56%" }} />
                <div style={{ height: "84%" }} />
                <div style={{ height: "61%" }} />
                <div style={{ height: "92%" }} />
                <div style={{ height: "74%" }} />
              </div>
            </section>
          )}

          {activeTab === "pos" && (
            <section className="demo-panel">
              <div className="panel-header">
                <div>
                  <span className="eyebrow">POS simulation</span>
                  <h3>Barcode scan micro-demo</h3>
                </div>
                <button className="ghost-button small-button" onClick={resetSale} type="button">
                  Reset sale
                </button>
              </div>

              <div className="pos-layout">
                <div className="product-list">
                  {inventory.map((product) => (
                    <button
                      className="product-card"
                      key={product.id}
                      onClick={() => scanProduct(product)}
                      disabled={product.stock === 0}
                      type="button"
                    >
                      <span className="barcode">||| || ||| |||</span>
                      <strong>{product.name}</strong>
                      <span>{peso(product.price)}</span>
                      <small>
                        {product.stock > 0
                          ? `${product.stock} units available`
                          : "Out of stock"}
                      </small>
                    </button>
                  ))}
                </div>

                <aside className="sale-summary">
                  <span className="eyebrow">Current sale</span>
                  <h3>
                    <AnimatedNumber value={cart.length} /> item
                    {cart.length !== 1 ? "s" : ""} scanned
                  </h3>

                  <div className="cart-items">
                    {cart.length === 0 ? (
                      <div className="empty-state-card">
                        <strong>Ready for first scan</strong>
                        <p className="empty-copy">
                          Use the product cards to simulate item capture and real-time cart updates.
                        </p>
                      </div>
                    ) : (
                      cart.map((item, index) => (
                        <div className="cart-row" key={`${item.id}-${index}`}>
                          <span>{item.name}</span>
                          <span>{peso(item.price)}</span>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="sale-total">
                    <span>Total</span>
                    <strong>
                      <AnimatedNumber value={saleTotal} format="currency" />
                    </strong>
                  </div>
                </aside>
              </div>
            </section>
          )}

          {activeTab === "payroll" && (
            <section className="demo-panel">
              <div className="panel-header">
                <div>
                  <span className="eyebrow">Payroll automation</span>
                  <h3>Monthly payroll run preview</h3>
                </div>
                <button
                  className="primary-button small-button"
                  onClick={runPayrollSimulation}
                  type="button"
                >
                  Run payroll
                </button>
              </div>

              <div className="payroll-grid">
                <article className="glass-card">
                  <p>Employees processed</p>
                  <strong>
                    <AnimatedNumber value={employees} />
                  </strong>
                  <small>Synced from workforce records</small>
                </article>
                <article className="glass-card">
                  <p>Estimated release</p>
                  <strong>
                    <AnimatedNumber value={employees * 18750} format="currency" />
                  </strong>
                  <small>Net payout calculation preview</small>
                </article>
                <article className="glass-card">
                  <p>Status</p>
                  <strong>{payrollRun ? "Completed" : "Pending"}</strong>
                  <small>
                    {payrollRun
                      ? "Tax automation and validation finished"
                      : "Ready to simulate payroll cycle"}
                  </small>
                </article>
              </div>
            </section>
          )}

          {activeTab === "roi" && (
            <section className="demo-panel">
              <div className="panel-header">
                <div>
                  <span className="eyebrow">Interactive calculator</span>
                  <h3>Annual ROI estimator</h3>
                </div>
                <span className="status-pill">Instant recalculation</span>
              </div>

              <div className="roi-layout">
                <div className="slider-card">
                  <label htmlFor="employees">Employee headcount</label>
                  <input
                    id="employees"
                    type="range"
                    min="10"
                    max="500"
                    value={employees}
                    onChange={(event) => setEmployees(Number(event.target.value))}
                  />
                  <div className="slider-meta">
                    <span>10</span>
                    <strong>
                      <AnimatedNumber value={employees} />
                    </strong>
                    <span>500</span>
                  </div>

                  <label htmlFor="branches">Operational branches</label>
                  <input
                    id="branches"
                    type="range"
                    min="1"
                    max="20"
                    value={branches}
                    onChange={(event) => setBranches(Number(event.target.value))}
                  />
                  <div className="slider-meta">
                    <span>1</span>
                    <strong>
                      <AnimatedNumber value={branches} />
                    </strong>
                    <span>20</span>
                  </div>
                </div>

                <div className="roi-summary">
                  <article className="glass-card">
                    <p>Annual labor hours saved</p>
                    <strong>
                      <AnimatedNumber value={roi.annualHoursSaved} />
                    </strong>
                  </article>
                  <article className="glass-card">
                    <p>Estimated annual savings</p>
                    <strong>
                      <AnimatedNumber value={roi.annualSavings} format="currency" />
                    </strong>
                  </article>
                  <article className="glass-card accent-card">
                    <p>Projected ROI</p>
                    <strong>
                      <AnimatedNumber value={roi.roiPercent} format="percent" />
                    </strong>
                  </article>
                </div>
              </div>
            </section>
          )}

          {activeTab === "configurator" && (
            <section className="demo-panel">
              <div className="panel-header">
                <div>
                  <span className="eyebrow">Dynamic module stack</span>
                  <h3>Interactive module configurator</h3>
                </div>
                <span className="status-pill">
                  <AnimatedNumber value={enabledModules.length} /> selected
                </span>
              </div>

              <div className="config-layout">
                <div className="module-list">
                  {modules.map((module) => {
                    const active = enabledModules.includes(module.id);

                    return (
                      <button
                        key={module.id}
                        className={active ? "module-card active" : "module-card"}
                        onClick={() => toggleModule(module.id)}
                        type="button"
                      >
                        <div className="module-card-top">
                          <span className="module-badge">{module.badge}</span>
                        </div>
                        <div className="module-topline">
                          <strong>{module.name}</strong>
                          <span>{peso(module.price)}</span>
                        </div>
                        <p>{module.description}</p>
                        <small>
                          {active ? "Enabled in current bundle" : "Click to enable"}
                        </small>
                      </button>
                    );
                  })}
                </div>

                <aside className="bundle-summary">
                  <span className="eyebrow">Bundle summary</span>
                  <h3>
                    <AnimatedNumber value={estimatedAnnualCost} format="currency" />
                  </h3>
                  <p>Estimated annual platform cost based on current selections.</p>

                  <div className="selected-modules">
                    {selectedModuleData.length === 0 ? (
                      <div className="empty-state-card">
                        <strong>No modules selected</strong>
                        <p className="empty-copy">
                          Enable optional add-ons to expand comparison advantages and proposal scope.
                        </p>
                      </div>
                    ) : (
                      selectedModuleData.map((module) => (
                        <div className="selected-row" key={module.id}>
                          <span>{module.name}</span>
                          <span>{peso(module.price)}</span>
                        </div>
                      ))
                    )}
                  </div>
                </aside>
              </div>
            </section>
          )}
        </section>

        <section className="client-proof-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Client proof</span>
              <h3>Enterprise teams using NexusTech at scale</h3>
              <p>
                Operational leaders use unified analytics, payroll automation, and
                modular branch infrastructure to reduce manual overhead.
              </p>
            </div>
          </div>

          <div
            className="client-proof-carousel"
            onMouseEnter={() => setIsCarouselPaused(true)}
            onMouseLeave={() => setIsCarouselPaused(false)}
          >
            <article className="proof-quote-card">
              <span className="proof-kicker">Featured testimonial</span>
              <strong>{testimonials[activeTestimonial].quote}</strong>
              <span>{testimonials[activeTestimonial].source}</span>
            </article>

            <div className="proof-sidebar">
              {testimonials.map((item, index) => (
                <button
                  key={item.source}
                  className={
                    index === activeTestimonial
                      ? "proof-nav-button active"
                      : "proof-nav-button"
                  }
                  onClick={() => setActiveTestimonial(index)}
                  type="button"
                >
                  <span className="proof-nav-index">0{index + 1}</span>
                  <span className="proof-nav-text">{item.source}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="comparison-section">
          <div className="comparison-header-block">
            <div className="comparison-copy">
              <span className="eyebrow">Feature matrix</span>
              <h3>Off-the-shelf packages versus modular ERP suite</h3>
              <p>
                Explore category-specific differences and see how enabled modules
                unlock stronger enterprise workflows.
              </p>
            </div>

            <div className="comparison-tab-row">
              {comparisonTabs.map((tab) => (
                <button
                  key={tab.id}
                  className={
                    comparisonTab === tab.id
                      ? "comparison-filter-button active"
                      : "comparison-filter-button"
                  }
                  onClick={() => setComparisonTab(tab.id)}
                  type="button"
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="comparison-layout">
            <div className="comparison-table">
              <div className="table-row table-head">
                <span>Capability</span>
                <span>Basic package</span>
                <span>NexusTech suite</span>
              </div>

              {visibleComparisonRows.map((row) => {
                const isUnlocked = row.module && enabledModules.includes(row.module);
                const relatedModule = row.module
                  ? modules.find((module) => module.id === row.module)
                  : null;

                return (
                  <div
                    className={isUnlocked ? "table-row unlocked-row" : "table-row"}
                    key={`${comparisonTab}-${row.label}`}
                  >
                    <span className="table-feature-cell">
                      {row.label}
                      {relatedModule ? (
                        <em className="module-tag">
                          {isUnlocked
                            ? `${relatedModule.name} enabled`
                            : `${relatedModule.name} optional`}
                        </em>
                      ) : null}
                    </span>
                    <span>{row.basic}</span>
                    <span>{row.suite}</span>
                  </div>
                );
              })}
            </div>

            <aside className="capability-panel">
              <span className="eyebrow">Unlocked capabilities</span>
              <h4>Current module impact</h4>
              <p>
                Enabled modules create visible product advantages across the matrix
                and the proposal workflow.
              </p>

              <div className="capability-list">
                {unlockedCapabilities.length === 0 ? (
                  <div className="empty-state-card">
                    <strong>No enhancements active</strong>
                    <p className="empty-copy">
                      Turn on optional modules to reveal category-level advantages.
                    </p>
                  </div>
                ) : (
                  unlockedCapabilities.map((item) => (
                    <div className="capability-card" key={item.id}>
                      <div className="capability-topline">
                        <strong>{item.name}</strong>
                        <span className="module-badge">{item.badge}</span>
                      </div>
                      <span>{item.impact}</span>
                    </div>
                  ))
                )}
              </div>
            </aside>
          </div>
        </section>

        <section className="footer-cta">
          <div>
            <span className="eyebrow">Persistent conversion path</span>
            <h3>Guide prospects from product preview to qualified demo request.</h3>
            <p>
              Combine live sandboxes, tailored ROI evidence, and proposal export in
              one conversion-oriented journey.
            </p>
          </div>
          <button className="primary-button" onClick={openModal} type="button">
            Start 14-day sandbox
          </button>
        </section>

        <section className="sticky-config-bar">
          <div className="sticky-config-copy">
            <span className="eyebrow">Live configuration</span>
            <strong>
              <AnimatedNumber value={enabledModules.length} /> module
              {enabledModules.length !== 1 ? "s" : ""} selected
            </strong>
            <span>
              ROI <AnimatedNumber value={roi.roiPercent} format="percent" /> · Annual
              cost <AnimatedNumber value={estimatedAnnualCost} format="currency" />
            </span>
          </div>

          <div className="sticky-config-actions">
            <button className="ghost-button small-button" onClick={exportProposal} type="button">
              Export PDF proposal
            </button>
            <button className="primary-button small-button" onClick={openModal} type="button">
              Request sandbox
            </button>
          </div>
        </section>
       
       <section className="project-attribution">
          <p>
            Developed by <strong>July Asuncion</strong> for WebProg final requirement.
          </p>
        </section>   
             
      </main>

      {showModal && (
        <div className="modal-backdrop" role="presentation" onClick={closeModal}>
          <div
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sandbox-title"
            onClick={(event) => event.stopPropagation()}
          >
            {!submittedRequest ? (
              <>
                <div className="modal-header">
                  <div>
                    <span className="eyebrow">VIP sandbox access</span>
                    <h3 id="sandbox-title">Request a 14-day populated demo instance</h3>
                  </div>
                  <button
                    className="close-button"
                    onClick={closeModal}
                    aria-label="Close modal"
                    type="button"
                  >
                    ×
                  </button>
                </div>

                <div className="modal-progress">
                  {[1, 2, 3].map((step) => (
                    <div
                      key={step}
                      className={step <= formStep ? "progress-step active" : "progress-step"}
                    >
                      <span>{step}</span>
                    </div>
                  ))}
                </div>

                <div className="modal-step-copy">
                  {formStep === 1 && (
                    <>
                      <strong>Business details</strong>
                      <p>Capture the company identity used to provision your demo workspace.</p>
                    </>
                  )}
                  {formStep === 2 && (
                    <>
                      <strong>Current stack assessment</strong>
                      <p>Understand the tools and decision-maker role involved in evaluation.</p>
                    </>
                  )}
                  {formStep === 3 && (
                    <>
                      <strong>Qualification snapshot</strong>
                      <p>Prioritize the sandbox around company size, evaluation timeline, and goals.</p>
                    </>
                  )}
                </div>

                <form onSubmit={submitSandboxRequest} className="modal-form">
                  {formStep === 1 && (
                    <div className="form-step">
                      <label>
                        Company name
                        <input
                          type="text"
                          value={formData.company}
                          onChange={(event) => updateForm("company", event.target.value)}
                          placeholder="Nexus Retail Group"
                        />
                        {formErrors.company ? (
                          <span className="field-error">{formErrors.company}</span>
                        ) : null}
                      </label>

                      <label>
                        Company domain
                        <input
                          type="text"
                          value={formData.domain}
                          onChange={(event) => updateForm("domain", event.target.value)}
                          placeholder="company.com"
                        />
                        {formErrors.domain ? (
                          <span className="field-error">{formErrors.domain}</span>
                        ) : null}
                      </label>
                    </div>
                  )}

                  {formStep === 2 && (
                    <div className="form-step">
                      <label>
                        Role
                        <input
                          type="text"
                          value={formData.role}
                          onChange={(event) => updateForm("role", event.target.value)}
                          placeholder="Operations Manager"
                        />
                        {formErrors.role ? (
                          <span className="field-error">{formErrors.role}</span>
                        ) : null}
                      </label>

                      <label>
                        Current software stack
                        <textarea
                          rows="4"
                          value={formData.stack}
                          onChange={(event) => updateForm("stack", event.target.value)}
                          placeholder="Current POS, HRIS, ERP, payroll, or reporting tools"
                        />
                        {formErrors.stack ? (
                          <span className="field-error">{formErrors.stack}</span>
                        ) : null}
                      </label>
                    </div>
                  )}

                  {formStep === 3 && (
                    <div className="form-step">
                      <label>
                        Team size
                        <select
                          value={formData.teamSize}
                          onChange={(event) => updateForm("teamSize", event.target.value)}
                        >
                          <option value="">Select company size</option>
                          <option value="1-50">1-50 employees</option>
                          <option value="51-200">51-200 employees</option>
                          <option value="201-500">201-500 employees</option>
                          <option value="500+">500+ employees</option>
                        </select>
                        {formErrors.teamSize ? (
                          <span className="field-error">{formErrors.teamSize}</span>
                        ) : null}
                      </label>

                      <label>
                        Implementation timeline
                        <select
                          value={formData.timeline}
                          onChange={(event) => updateForm("timeline", event.target.value)}
                        >
                          <option value="">Select timeline</option>
                          <option value="Immediate">Immediate</option>
                          <option value="30-60 days">30-60 days</option>
                          <option value="This quarter">This quarter</option>
                          <option value="Research phase">Research phase</option>
                        </select>
                        {formErrors.timeline ? (
                          <span className="field-error">{formErrors.timeline}</span>
                        ) : null}
                      </label>

                      <label>
                        Primary evaluation priority
                        <select
                          value={formData.priority}
                          onChange={(event) => updateForm("priority", event.target.value)}
                        >
                          <option value="">Choose a priority</option>
                          <option value="Payroll automation">Payroll automation</option>
                          <option value="Branch visibility">Branch visibility</option>
                          <option value="POS modernization">POS modernization</option>
                          <option value="Tax and compliance">Tax and compliance</option>
                        </select>
                        {formErrors.priority ? (
                          <span className="field-error">{formErrors.priority}</span>
                        ) : null}
                      </label>
                    </div>
                  )}

                  <div className="modal-actions">
                    <button
                      type="button"
                      className="ghost-button"
                      onClick={formStep === 1 ? closeModal : goBackStep}
                    >
                      {formStep === 1 ? "Cancel" : "Back"}
                    </button>

                    {formStep < 3 ? (
                      <button type="button" className="primary-button" onClick={goNextStep}>
                        Continue
                      </button>
                    ) : (
                      <button type="submit" className="primary-button">
                        Submit request
                      </button>
                    )}
                  </div>
                </form>
              </>
            ) : (
              <div className="modal-success">
                <div className="success-badge">✓</div>
                <span className="eyebrow">Sandbox request received</span>
                <h3>Your evaluation workspace is being prepared.</h3>
                <p>
                  The request has been queued with your company profile, evaluation
                  priority, and current stack details for a 14-day populated demo instance.
                </p>

                <div className="success-summary">
                  <div>
                    <span>Company</span>
                    <strong>{formData.company}</strong>
                  </div>
                  <div>
                    <span>Domain</span>
                    <strong>{formData.domain}</strong>
                  </div>
                  <div>
                    <span>Priority</span>
                    <strong>{formData.priority}</strong>
                  </div>
                </div>

                <button className="primary-button" onClick={closeModal} type="button">
                  Return to portal
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;