import { useState, useEffect } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Sun,
  Moon,
  HardHat,
  Zap,
  Gauge,
  Microscope,
  FileText,
  Power,
  BarChart2,
  Plus,
  HelpCircle
} from "lucide-react";

// Types
type Page = "safety" | "register" | "dashboard" | "workorder" | "inspection" | "maintenance" | "report" | "faq";
type Priority = "low" | "medium" | "high" | "critical";
type ShiftType = "day" | "swing" | "night";
type DefectType = "cosmetic" | "dimensional" | "functional" | "material";

interface WorkOrder {
  id: string;
  partNumber: string;
  batch: string;
  quantity: number;
  priority: Priority;
  station: string;
  status: "pending" | "inspected" | "failed" | "resolved";
}

interface InspectionRecord {
  id: string;
  workOrderId: string;
  inspectorId: string;
  defectType: DefectType;
  notes: string;
  timestamp: string;
  passed: boolean;
}

export default function App() {
  // Global / App State
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("mes-theme-v2");
      return (saved as "dark" | "light") || "light";
    }
    return "light";
  });

  const [currentPage, setCurrentPage] = useState<Page>("safety");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [employeeId, setEmployeeId] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [selectedShift, setSelectedShift] = useState<ShiftType>("day");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Registration state
  const [registeredUsers, setRegisteredUsers] = useState<Record<string, string>>({});
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regContact, setRegContact] = useState("");
  const [regDept, setRegDept] = useState("");
  const [regRole, setRegRole] = useState("");
  const [regId, setRegId] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [regErrors, setRegErrors] = useState<Record<string, string>>({});

  // Work order state
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([
    { id: "WO-2847", partNumber: "AB-4521", batch: "B-24Q3", quantity: 1500, priority: "high", station: "A-3", status: "pending" },
    { id: "WO-2848", partNumber: "CD-3380", batch: "B-24Q3", quantity: 750, priority: "critical", station: "A-3", status: "pending" },
    { id: "WO-2849", partNumber: "EF-9012", batch: "B-24Q4", quantity: 3000, priority: "medium", station: "A-1", status: "pending" },
  ]);
  const [partNumber, setPartNumber] = useState("");
  const [batchCode, setBatchCode] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<Priority>("medium");

  // Inspection state
  const [inspectionNotes, setInspectionNotes] = useState("");
  const [defectType, setDefectType] = useState<DefectType>("cosmetic");
  const [inspectionResult, setInspectionResult] = useState<"pass" | "fail">("pass");

  // Telemetry simulation state
  const [telemetry, setTelemetry] = useState({ oee: 94.2, temp: 41.2, speed: 1250, vibration: 62 });

  // Theme helpers — computed from theme state
  const dk = theme === "dark";
  const card = dk ? "bg-slate-900/40 border-slate-800/50" : "bg-white border-slate-200";
  const inputCls = dk ? "bg-slate-800/40 text-slate-100 placeholder:text-slate-500" : "bg-slate-50 text-slate-900 placeholder:text-slate-400";
  const divider = dk ? "border-slate-800" : "border-slate-200";
  const panelBg = dk ? "bg-slate-800/30 border-slate-700/50" : "bg-slate-100 border-slate-200";
  const sidebarInactive = dk
    ? "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100";

  // Notification State
  const [notification, setNotification] = useState<{ message: string; type: "error" | "success" | "warning" } | null>(null);

  useEffect(() => {
    localStorage.setItem("mes-theme-v2", theme);
    const root = window.document.documentElement;
    if (theme === "light") {
      root.classList.add("light");
    } else {
      root.classList.remove("light");
    }
  }, [theme]);

  // Clock
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Real-time telemetry simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry(prev => ({
        oee: +(prev.oee + (Math.random() - 0.5) * 0.2).toFixed(1),
        temp: +(prev.temp + (Math.random() - 0.5) * 0.4).toFixed(1),
        speed: +(prev.speed + Math.floor((Math.random() - 0.5) * 10)),
        vibration: +(prev.vibration + (Math.random() - 0.5) * 1.5).toFixed(1)
      }));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // Password Checklist Real-time checks
  const passwordCriteria = {
    length: accessCode.length >= 6 && accessCode.length <= 12,
    hasUpper: /[A-Z]/.test(accessCode),
    hasLower: /[a-z]/.test(accessCode),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(accessCode),
    noSpaces: !/\s/.test(accessCode) && accessCode.length > 0,
  };

  // Register form — real-time password checklist
  const regPasswordCriteria = {
    length: regPassword.length >= 6 && regPassword.length <= 12,
    hasUpper: /[A-Z]/.test(regPassword),
    hasLower: /[a-z]/.test(regPassword),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(regPassword),
    noSpaces: !/\s/.test(regPassword) && regPassword.length > 0,
  };

  const validators = {
    employeeId: (val: string) => {
      const alphanumeric = /^[A-Z0-9]{6}$/;
      if (!val) return "Employee ID required";
      if (!alphanumeric.test(val)) return "Must be exactly 6 alphanumeric characters (uppercase)";
      return "";
    },
    accessCode: (val: string) => {
      if (!val) return "Access code required";
      if (val.length < 6 || val.length > 12) return "6-12 characters required";
      if (/\s/.test(val)) return "No spaces allowed";
      if (!/[A-Z]/.test(val)) return "Missing uppercase letter";
      if (!/[a-z]/.test(val)) return "Missing lowercase letter";
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(val)) return "Missing special character (!@#$%^&*)";
      return "";
    },
    partNumber: (val: string) => {
      const pattern = /^[A-Z]{2,3}-\d{4}[A-Z]?$/;
      if (!val) return "Part number required";
      if (!pattern.test(val)) return "Format: AB-1234 or ABC-1234X";
      return "";
    },
    batchCode: (val: string) => {
      if (!val) return "Batch code required";
      if (!/^[A-Z0-9-]+$/.test(val)) return "Alphanumeric and hyphens only";
      if (val.length < 6 || val.length > 15) return "6-15 characters";
      if (/\s/.test(val)) return "No spaces allowed";
      return "";
    },
    inspectionNotes: (val: string) => {
      if (val.length > 200) return "Maximum 200 characters";
      if (/[<>]/.test(val)) return "Cannot contain < or >";
      return "";
    },
  };

  const validateField = (field: string, value: string) => {
    const validator = validators[field as keyof typeof validators];
    if (validator) {
      const error = validator(value);
      setValidationErrors(prev => ({ ...prev, [field]: error }));
      return !error;
    }
    return true;
  };

  const showNotification = (message: string, type: "error" | "success" | "warning") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const WHITELIST: Record<string, string> = {
    "A28076": "Shift#1A",
    "B39124": "Line@2B",
    "C47801": "Press#3C",
    "D56392": "Build@4D",
    "E61087": "Plant#5E"
  };

  const validateRegField = (field: string, value: string, secondaryValue: string = "") => {
    let error = "";
    if (field === "regName") {
      if (!value.trim()) error = "Full name required";
      else if (!/^[A-Za-z\s]+$/.test(value.trim())) error = "Name must contain letters only (no numbers or symbols)";
    } else if (field === "regEmail") {
      if (!value) error = "Email required";
      else if (!/^[a-zA-Z0-9._%+-]+@fabtech\.com$/.test(value)) error = "Must end with @fabtech.com";
    } else if (field === "regContact") {
      if (!value) error = "Contact number required";
      else if (!/^\d{10}$/.test(value)) error = "Must be exactly 10 digits";
    } else if (field === "regDept") {
      if (!value.trim()) error = "Department required";
    } else if (field === "regRole") {
      if (!value) error = "Please select a role";
    } else if (field === "regId") {
      if (!value) error = "Employee ID required";
      else if (!/^[A-Z0-9]{6}$/.test(value)) error = "Must be 6 uppercase alphanumeric chars";
      else if (WHITELIST[value] || registeredUsers[value]) error = "Employee ID already registered";
    } else if (field === "regPassword") {
      if (!value) error = "Password required";
      else if (value.length < 6 || value.length > 12) error = "6-12 characters required";
      else if (/\s/.test(value)) error = "No spaces allowed";
      else if (!/[A-Z]/.test(value)) error = "Missing uppercase letter";
      else if (!/[a-z]/.test(value)) error = "Missing lowercase letter";
      else if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) error = "Missing special character (!@#$%^&*)";
    } else if (field === "regConfirm") {
      if (!value) error = "Please confirm your password";
      else if (value !== secondaryValue) error = "Passwords do not match";
    }

    setRegErrors(prev => ({
      ...prev,
      [field]: error
    }));

    return error === "";
  };

  const handleRegister = () => {
    const isV1 = validateRegField("regName", regName);
    const isV2 = validateRegField("regEmail", regEmail);
    const isV3 = validateRegField("regContact", regContact);
    const isV4 = validateRegField("regDept", regDept);
    const isV5 = validateRegField("regRole", regRole);
    const isV6 = validateRegField("regId", regId);
    const isV7 = validateRegField("regPassword", regPassword);
    const isV8 = validateRegField("regConfirm", regConfirm, regPassword);

    const hasErrors = !isV1 || !isV2 || !isV3 || !isV4 || !isV5 || !isV6 || !isV7 || !isV8;
    if (hasErrors) return;

    // Register the user
    setRegisteredUsers(prev => ({ ...prev, [regId]: regPassword }));
    showNotification(`Operator ${regId} (${regName}) registered successfully. You may now log in.`, "success");
    // Pre-fill login and navigate back
    setEmployeeId(regId);
    setAccessCode("");
    setRegName(""); setRegEmail(""); setRegContact(""); setRegDept(""); setRegRole("");
    setRegId(""); setRegPassword(""); setRegConfirm(""); setRegErrors({});
    setCurrentPage("safety");
  };

  const handleLogin = () => {
    const idValid = validateField("employeeId", employeeId);
    const codeValid = validateField("accessCode", accessCode);

    if (!employeeId || !accessCode) {
      showNotification("ACCESS REJECTED: Mandatory shift entry credentials missing", "error");
      return;
    }

    if (idValid && codeValid) {
      const allUsers = { ...WHITELIST, ...registeredUsers };
      if (allUsers[employeeId] === accessCode) {
        showNotification("Shift Access Granted. Loading MES Dashboard.", "success");
        setIsAuthenticated(true);
        setCurrentPage("dashboard");
      } else {
        showNotification("ACCESS DENIED: Unrecognized operator credentials", "error");
      }
    } else {
      showNotification("VALIDATION FAILED: Please check Employee ID and Password guidelines.", "error");
    }
  };

  const [inspections, setInspections] = useState<InspectionRecord[]>([
    { id: "IN-001", workOrderId: "WO-2847", inspectorId: "T9876", defectType: "cosmetic", notes: "Minor surface scratch LH side", timestamp: "08:24", passed: true },
    { id: "IN-002", workOrderId: "WO-2848", inspectorId: "T9876", defectType: "dimensional", notes: "Hole diameter out of tolerance +0.05mm", timestamp: "09:12", passed: false },
  ]);

  const handleWorkOrderCreate = () => {
    const partValid = validateField("partNumber", partNumber);
    const batchValid = validateField("batchCode", batchCode);

    if (partValid && batchValid) {
      const newWo: WorkOrder = {
        id: `WO-${Math.floor(1000 + Math.random() * 9000)}`,
        partNumber: partNumber,
        batch: batchCode,
        quantity: Math.floor(100 + Math.random() * 900) * (selectedPriority === "low" ? 1 : 5),
        priority: selectedPriority,
        station: ["A-1", "A-2", "A-3", "B-1", "C-4"][Math.floor(Math.random() * 5)],
        status: "pending"
      };
      setWorkOrders((prev) => [...prev, newWo]);
      setSelectedWorkOrder(newWo);

      showNotification(`Work Order ${newWo.id} created successfully for batch ${batchCode}`, "success");
      setCurrentPage("inspection");

      // Reset form
      setPartNumber("");
      setBatchCode("");
      setSelectedPriority("medium");
    } else {
      showNotification("Failed to create work order: check requirements", "error");
    }
  };

  const handleInspectionSubmit = () => {
    const notesValid = validateField("inspectionNotes", inspectionNotes);
    if (!notesValid) return;

    if (!selectedWorkOrder) {
      showNotification("Please select a target Work Order first", "error");
      return;
    }

    const isPass = inspectionResult === "pass";

    const newInspection: InspectionRecord = {
      id: `IN-${String(inspections.length + 1).padStart(3, '0')}`,
      workOrderId: selectedWorkOrder.id,
      inspectorId: employeeId || "OP-12",
      defectType,
      notes: inspectionNotes,
      timestamp: currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      passed: isPass
    };

    setInspections(prev => [newInspection, ...prev]);

    // Update WO status
    setWorkOrders(prev => prev.map(wo =>
      wo.id === selectedWorkOrder.id ? { ...wo, status: isPass ? "inspected" : "failed" } : wo
    ));

    setInspectionNotes("");
    showNotification(`Inspection Record ${newInspection.id} Submitted`, "success");
    setCurrentPage("dashboard");
  };

  const priorityColors = {
    low: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    medium: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    high: "text-orange-400 bg-orange-500/10 border-orange-500/30",
    critical: "text-red-400 bg-red-500/10 border-red-500/30 animate-pulse",
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 flex flex-col ${dk ? "bg-[#0b0f17] text-slate-100" : "bg-slate-100 text-slate-900"
      }`}>

      {/* Dynamic Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl border backdrop-blur animate-slide-in ${notification.type === "error"
          ? "bg-red-500/10 text-red-400 border-red-500/30"
          : notification.type === "success"
            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
            : "bg-amber-500/10 text-amber-400 border-amber-500/30"
          }`}>
          {notification.type === "error" ? <XCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          <div>
            <div className="text-xs font-mono font-bold uppercase tracking-wider">SYSTEM ALERT</div>
            <div className="text-sm font-medium">{notification.message}</div>
          </div>
        </div>
      )}

      {/* Header HMI Panel */}
      <header className={`border-b ${theme === "dark" ? "border-slate-800 bg-[#0e1420]/90" : "border-slate-200 bg-white/90"} backdrop-blur sticky top-0 z-40`}>
        <div className="max-w-[1600px] mx-auto flex items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-9 h-9 text-cyan-500" />
              <div className="flex flex-col">
                <span className={`text-[11px] font-mono font-bold tracking-[0.2em] uppercase ${theme === "dark" ? "text-slate-300" : "text-slate-500"}`}>
                  Industrial Intelligence
                </span>
                <h1 className="text-2xl font-black tracking-tighter text-cyan-500 leading-none mt-0.5">
                  FabricaTech MES
                </h1>
              </div>
            </div>

            {isAuthenticated && (
              <div className="hidden md:flex items-center gap-3 pl-4 border-l border-slate-700">
                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-mono opacity-50">OPERATOR:</span>
                  <span className="text-[11px] font-mono font-bold text-emerald-400">{employeeId}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-mono opacity-50">SHIFT:</span>
                  <span className="text-[11px] font-mono font-bold uppercase text-amber-400">{selectedShift}</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-1 border rounded-lg ${dk ? "bg-slate-800/20 border-slate-700/40" : "bg-white border-slate-300"}`}>
              <Clock className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono tabular-nums tracking-wider text-cyan-400">
                {currentTime.toLocaleTimeString('en-US', { hour12: false })}
              </span>
            </div>

            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={`p-2 rounded-xl transition-all border ${theme === "dark"
                ? "bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700"
                : "bg-white border-slate-200 text-indigo-600 hover:bg-slate-50"
                }`}
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {isAuthenticated && (
              <button
                onClick={() => { setIsAuthenticated(false); setCurrentPage("safety"); showNotification("Shift Logged Out", "warning"); }}
                className="flex items-center gap-1 text-xs font-mono py-1.5 px-3 border border-red-500/40 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors"
              >
                <Power className="w-3.5 h-3.5" />
                EXIT
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content & Page Flow */}
      <div className="flex-1 flex overflow-hidden">

        {/* SIDEBAR FOR AUTHENTICATED USERS */}
        {isAuthenticated && (
          <nav className={`hidden md:flex w-[240px] border-r flex-col ${theme === "dark" ? "border-slate-800 bg-[#0e1420]/40" : "border-slate-200 bg-slate-50/50"
            }`}>
            <div className="p-4 space-y-1.5 flex-1">
              {[
                { id: "dashboard", label: "PRODUCTION", icon: <Gauge className="w-4 h-4" />, desc: "Telemetry & OEE" },
                { id: "workorder", label: "WORK ORDERS", icon: <FileText className="w-4 h-4" />, desc: "Assign Job" },
                { id: "inspection", label: "QUALITY ASSURE", icon: <Microscope className="w-4 h-4" />, desc: "Part Auditing" },
                { id: "maintenance", label: "SAFETY CONTROL", icon: <ShieldCheck className="w-4 h-4" />, desc: "LOTO Procedures" },
                { id: "report", label: "SHIFT REPORT", icon: <BarChart2 className="w-4 h-4" />, desc: "Analytics Summary" },
                { id: "faq", label: "HELP & FAQ", icon: <HelpCircle className="w-4 h-4" />, desc: "Operator Guide" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id as Page)}
                  className={`w-full text-left px-3.5 py-3 rounded-xl border transition-all flex items-center gap-3 ${currentPage === item.id
                    ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 font-medium shadow-sm"
                    : `border-transparent ${sidebarInactive}`
                    }`}
                >
                  <div className={`${currentPage === item.id ? "text-cyan-400" : "opacity-60"}`}>
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-xs font-bold tracking-wider">{item.label}</div>
                    <div className="text-[10px] opacity-60 mt-0.5">{item.desc}</div>
                  </div>
                </button>
              ))}
            </div>

            <div className={`p-4 border-t ${divider}`}>
              <div className={`p-3 rounded-xl border ${panelBg}`}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono opacity-60 uppercase">LINE OEE TARGET</span>
                  <span className="text-[11px] font-mono font-bold text-emerald-400">{telemetry.oee}%</span>
                </div>
                <div className={`h-2 rounded-full overflow-hidden ${dk ? "bg-slate-800" : "bg-slate-200"}`}>
                  <div
                    className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-1000"
                    style={{ width: `${telemetry.oee}%` }}
                  />
                </div>
              </div>
            </div>
          </nav>
        )}

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto">

          {/* PAGE 1: SAFETY CHECKPOINT (LOGIN) */}
          {currentPage === "safety" && (
            <div className="min-h-full flex items-center justify-center p-6">
              <div className={`w-full max-w-[1000px] grid lg:grid-cols-[1.1fr_0.9fr] rounded-3xl overflow-hidden shadow-[0_10px_40px_-15px_rgba(0,0,0,0.3)] backdrop-blur-sm ${dk ? "bg-slate-900 border border-slate-800/50" : "bg-white border border-slate-200"}`}>

                {/* Left: Safety Briefing Panel */}
                <div className={`p-10 flex flex-col justify-between text-slate-100 ${dk ? "bg-slate-900/80" : "bg-gradient-to-br from-indigo-950 to-slate-900"}`}>
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <HardHat className="w-8 h-8 text-amber-500" />
                      <div>
                        <h2 className="text-xl font-extrabold tracking-tight">OSHA Safety Declaration</h2>
                        <span className="text-xs font-mono opacity-60">STANDARDS CFR 1910.132</span>
                      </div>
                    </div>

                    <p className="text-sm opacity-80 leading-relaxed mb-6">
                      You are entering a hazardous manufacturing zone. All personnel must declare appropriate Personal Protective Equipment (PPE) compliance before beginning production shifts.
                    </p>

                    <div className="space-y-4">
                      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                        <div className="flex items-center gap-2 text-red-400 font-bold text-xs mb-1 uppercase font-mono">
                          <AlertTriangle className="w-4 h-4" /> ACTIVE HAZARD AREA - LINE A3
                        </div>
                        <p className="text-xs opacity-80">
                          Automatic pressing unit C-4 currently exhibits variable vibration. LOTO mandatory if maintenance gate is breached.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {[
                          "Steel Toe Caps", "Hard Hat Protection",
                          "High Visibility Jacket", "Hearing Protection",
                          "Safety Eyewear", "Gloves Dispatched"
                        ].map((item, index) => (
                          <div key={index} className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-700/50 bg-slate-800/40">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            <span className="text-xs opacity-90 font-medium text-slate-100">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-slate-800/30 text-[11px] opacity-50 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> Authorized Access Portal. Logins are logged per OSHA regulations.
                  </div>
                </div>

                {/* Right: Authentication Form */}
                <div className={`p-10 flex flex-col justify-center ${dk ? "bg-slate-900 text-slate-100" : "bg-white text-slate-900"}`}>
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-2xl font-extrabold tracking-tight">Operator Shift Check-In</h2>
                      <p className={`text-sm mt-1 font-medium ${dk ? "text-slate-400" : "text-slate-500"}`}>Enter credentials to unlock production interface.</p>
                    </div>

                    {/* Shift Selector */}
                    <div>
                      <label className={`block text-[11px] font-mono mb-2 uppercase tracking-wide font-bold ${dk ? "text-slate-400" : "text-slate-600"}`}>Select Your Shift</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(["day", "swing", "night"] as ShiftType[]).map((s) => (
                          <label key={s} className="relative cursor-pointer">
                            <input
                              type="radio"
                              name="shift"
                              value={s}
                              checked={selectedShift === s}
                              onChange={() => setSelectedShift(s)}
                              className="sr-only"
                            />
                            <span className={`block text-center py-2 rounded-xl border text-xs font-mono font-bold uppercase transition-all ${selectedShift === s
                              ? "border-cyan-500 bg-cyan-500/10 text-cyan-400"
                              : dk ? "border-slate-700 text-slate-400 hover:border-slate-600" : "border-slate-200 text-slate-500 hover:border-slate-300"
                              }`}>{s}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Employee ID */}
                    <div>
                      <label className={`block text-[11px] font-mono mb-1.5 uppercase tracking-wide font-bold ${dk ? "text-slate-400" : "text-slate-600"}`}>Employee ID (e.g., A28076)</label>
                      <input
                        type="text"
                        value={employeeId}
                        maxLength={6}
                        onChange={(e) => { setEmployeeId(e.target.value.toUpperCase()); validateField("employeeId", e.target.value.toUpperCase()); }}
                        placeholder="A28076"
                        className={`w-full ${inputCls} border rounded-xl px-3.5 py-2.5 text-sm transition-all outline-none font-mono ${validationErrors.employeeId ? "border-red-500/50" : "border-slate-700/50 focus:border-cyan-500/50"}`}
                      />
                      {validationErrors.employeeId && <p className="text-[11px] text-red-400 mt-1 font-mono">✕ {validationErrors.employeeId}</p>}
                    </div>

                    {/* Access Code */}
                    <div>
                      <label className={`block text-[11px] font-mono mb-1.5 uppercase tracking-wide font-bold ${dk ? "text-slate-400" : "text-slate-600"}`}>Access Code (Password)</label>
                      <input
                        type="password"
                        value={accessCode}
                        onChange={(e) => { setAccessCode(e.target.value); validateField("accessCode", e.target.value); }}
                        placeholder="••••••••"
                        className={`w-full ${inputCls} border rounded-xl px-3.5 py-2.5 text-sm transition-all outline-none font-mono ${validationErrors.accessCode ? "border-red-500/50" : "border-slate-700/50 focus:border-cyan-500/50"}`}
                      />
                      {/* Password Criteria */}
                      <div className={`mt-3 p-3 rounded-xl border space-y-1.5 text-[11px] font-mono ${dk ? "border-slate-800/50 bg-slate-800/20" : "border-slate-200 bg-slate-50"}`}>
                        {[
                          [passwordCriteria.length, "6 to 12 characters"],
                          [passwordCriteria.hasUpper, "At least 1 UPPERCASE letter"],
                          [passwordCriteria.hasLower, "At least 1 lowercase letter"],
                          [passwordCriteria.hasSpecial, "At least 1 special character (!@#$%^&*)"],
                          [passwordCriteria.noSpaces, "No blank spaces"],
                        ].map(([ok, label], i) => (
                          <div key={i} className="flex items-center gap-2.5">
                            {ok ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-slate-400" />}
                            <span className={`font-semibold ${ok ? "text-emerald-500" : dk ? "text-slate-400" : "text-slate-500"}`}>{String(label)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={handleLogin}
                      disabled={!passwordCriteria.length || !passwordCriteria.hasUpper || !passwordCriteria.hasLower || !passwordCriteria.hasSpecial || !passwordCriteria.noSpaces}
                      className="w-full mt-4 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm tracking-widest shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      AUTHENTICATE & ACCESS SYSTEM
                    </button>

                    <button
                      type="button"
                      onClick={() => setCurrentPage("faq")}
                      className={`w-full py-2.5 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs font-mono transition-all ${dk ? "border-slate-700 bg-slate-800/40 text-slate-300 hover:bg-slate-800" : "border-slate-300 bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                    >
                      <HelpCircle className="w-4 h-4" /> VIEW OPERATOR FAQ
                    </button>
                  </div>



                  {/* Register CTA link */}
                  <div className="mt-6 pt-5 border-t border-slate-700/30 flex justify-center">
                    <button
                      type="button"
                      onClick={() => setCurrentPage("register")}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-[11px] font-mono font-semibold transition-all ${dk ? "border-slate-700 bg-slate-800/40 text-slate-300 hover:border-cyan-500/50 hover:text-cyan-400" : "border-slate-200 bg-slate-50 text-slate-600 hover:border-cyan-500/30 hover:text-cyan-600"
                        }`}
                    >
                      <Plus className="w-3.5 h-3.5" /> New Operator Registration
                    </button>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* PAGE: REGISTER — Full standalone page */}
          {currentPage === "register" && (
            <div className="min-h-screen flex items-center justify-center p-6">
              <div className={`w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden ${card}`}>
                {/* Header */}
                <div className="p-8 border-b bg-gradient-to-br from-cyan-500/10 to-blue-600/5" style={{ borderColor: dk ? "rgba(71,85,105,0.3)" : "rgba(226,232,240,1)" }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-extrabold tracking-tight">New Operator Registration</h1>
                      <p className={`text-xs mt-1 ${dk ? "opacity-60" : "text-slate-500"}`}>All fields required. Your Employee ID will be your login username.</p>
                    </div>
                    <button
                      onClick={() => setCurrentPage("safety")}
                      className={`text-xs font-mono font-bold px-4 py-2 rounded-xl border transition-all ${dk ? "border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600" : "border-slate-200 text-slate-500 hover:border-slate-400"}`}
                    >← BACK TO LOGIN</button>
                  </div>
                </div>

                {/* Form body */}
                <div className="p-8 grid sm:grid-cols-2 gap-5">
                  {/* Full Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-mono opacity-60 mb-1.5 uppercase tracking-wide">Full Name</label>
                    <input type="text" value={regName} onChange={(e) => { const v = e.target.value; setRegName(v); validateRegField("regName", v); }}
                      placeholder="e.g. Abha Singh Sardar"
                      className={`w-full ${inputCls} border rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all ${regErrors.regName ? "border-red-500/50" : "border-slate-700/50 focus:border-cyan-500/50"}`}
                    />
                    {regErrors.regName && <p className="text-[11px] text-red-400 mt-1 font-mono">✕ {regErrors.regName}</p>}
                  </div>

                  {/* Email */}
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-mono opacity-60 mb-1.5 uppercase tracking-wide">Organizational Email (@fabtech.com)</label>
                    <input type="email" value={regEmail} onChange={(e) => { const v = e.target.value; setRegEmail(v); validateRegField("regEmail", v); }}
                      placeholder="yourname@fabtech.com"
                      className={`w-full ${inputCls} border rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all ${regErrors.regEmail ? "border-red-500/50" : "border-slate-700/50 focus:border-cyan-500/50"}`}
                    />
                    {regErrors.regEmail && <p className="text-[11px] text-red-400 mt-1 font-mono">✕ {regErrors.regEmail}</p>}
                  </div>

                  {/* Contact */}
                  <div>
                    <label className="block text-[11px] font-mono opacity-60 mb-1.5 uppercase tracking-wide">Contact Number</label>
                    <input type="tel" value={regContact} maxLength={10} onChange={(e) => { const v = e.target.value.replace(/\D/g, ""); setRegContact(v); validateRegField("regContact", v); }}
                      placeholder="9876543210"
                      className={`w-full ${inputCls} border rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all font-mono ${regErrors.regContact ? "border-red-500/50" : "border-slate-700/50 focus:border-cyan-500/50"}`}
                    />
                    {regErrors.regContact && <p className="text-[11px] text-red-400 mt-1 font-mono">✕ {regErrors.regContact}</p>}
                  </div>

                  {/* Department */}
                  <div>
                    <label className="block text-[11px] font-mono opacity-60 mb-1.5 uppercase tracking-wide">Department</label>
                    <select value={regDept} onChange={(e) => { 
                        const v = e.target.value; 
                        setRegDept(v); 
                        setRegRole(""); // Reset role when dept changes
                        validateRegField("regDept", v); 
                      }}
                      className={`w-full ${inputCls} border rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all ${regErrors.regDept ? "border-red-500/50" : "border-slate-700/50 focus:border-cyan-500/50"}`}
                    >
                      <option value="">Select department…</option>
                      <option value="Production">Production</option>
                      <option value="Quality Assurance">Quality Assurance</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Logistics & Supply">Logistics & Supply</option>
                    </select>
                    {regErrors.regDept && <p className="text-[11px] text-red-400 mt-1 font-mono">✕ {regErrors.regDept}</p>}
                  </div>

                  {/* Role Dropdown */}
                  <div>
                    <label className="block text-[11px] font-mono opacity-60 mb-1.5 uppercase tracking-wide">Role</label>
                    <select value={regRole} onChange={(e) => { const v = e.target.value; setRegRole(v); validateRegField("regRole", v); }}
                      disabled={!regDept}
                      className={`w-full ${inputCls} border rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed ${regErrors.regRole ? "border-red-500/50" : "border-slate-700/50 focus:border-cyan-500/50"}`}
                    >
                      <option value="">Select your role…</option>
                      {regDept === "Production" && (
                        <>
                          <option value="Floor Operator">Floor Operator</option>
                          <option value="Senior Operator">Senior Operator</option>
                          <option value="Production Supervisor">Production Supervisor</option>
                          <option value="Plant Manager">Plant Manager</option>
                        </>
                      )}
                      {regDept === "Quality Assurance" && (
                        <>
                          <option value="QA Auditor">QA Auditor</option>
                          <option value="Safety Officer">Safety Officer</option>
                        </>
                      )}
                      {regDept === "Maintenance" && (
                        <option value="Maintenance Lead">Maintenance Lead</option>
                      )}
                      {regDept === "Engineering" && (
                        <option value="Test Engineer">Test Engineer</option>
                      )}
                      {regDept === "Logistics & Supply" && (
                        <>
                          <option value="Logistics Coordinator">Logistics Coordinator</option>
                          <option value="Supply Chain Manager">Supply Chain Manager</option>
                        </>
                      )}
                    </select>
                    {regErrors.regRole && <p className="text-[11px] text-red-400 mt-1 font-mono">✕ {regErrors.regRole}</p>}
                  </div>

                  {/* Employee ID */}
                  <div>
                    <label className="block text-[11px] font-mono opacity-60 mb-1.5 uppercase tracking-wide">Employee ID — Your Login Username (6 chars)</label>
                    <input type="text" value={regId} maxLength={6} onChange={(e) => { const v = e.target.value.toUpperCase(); setRegId(v); validateRegField("regId", v); }}
                      placeholder="e.g. F99001"
                      className={`w-full ${inputCls} border rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all font-mono ${regErrors.regId ? "border-red-500/50" : "border-slate-700/50 focus:border-cyan-500/50"}`}
                    />
                    {regErrors.regId && <p className="text-[11px] text-red-400 mt-1 font-mono">✕ {regErrors.regId}</p>}
                  </div>

                  {/* Password */}
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-mono opacity-60 mb-1.5 uppercase tracking-wide">Create Password</label>
                    <input type="password" value={regPassword} onChange={(e) => { const v = e.target.value; setRegPassword(v); validateRegField("regPassword", v); if (regConfirm) validateRegField("regConfirm", regConfirm, v); }}
                      placeholder="••••••••"
                      className={`w-full ${inputCls} border rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all font-mono ${regErrors.regPassword ? "border-red-500/50" : "border-slate-700/50 focus:border-cyan-500/50"}`}
                    />
                    <div className={`mt-2 p-3 rounded-xl border grid grid-cols-2 gap-1.5 text-[11px] font-mono ${dk ? "border-slate-800/50 bg-slate-800/20" : "border-slate-200 bg-slate-50"}`}>
                      {[
                        [regPasswordCriteria.length, "6 to 12 characters"],
                        [regPasswordCriteria.hasUpper, "1 UPPERCASE letter"],
                        [regPasswordCriteria.hasLower, "1 lowercase letter"],
                        [regPasswordCriteria.hasSpecial, "1 special character"],
                        [regPasswordCriteria.noSpaces, "No blank spaces"],
                      ].map(([ok, label], i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          {ok ? <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" /> : <XCircle className="w-3 h-3 text-slate-500 shrink-0" />}
                          <span className={ok ? "text-emerald-400" : "opacity-60"}>{String(label)}</span>
                        </div>
                      ))}
                    </div>
                    {regErrors.regPassword && <p className="text-[11px] text-red-400 mt-1 font-mono">✕ {regErrors.regPassword}</p>}
                  </div>

                  {/* Confirm Password */}
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-mono opacity-60 mb-1.5 uppercase tracking-wide">Confirm Password</label>
                    <div className="relative">
                      <input type="password" value={regConfirm} onChange={(e) => { const v = e.target.value; setRegConfirm(v); validateRegField("regConfirm", v, regPassword); }}
                        placeholder="••••••••"
                        className={`w-full ${inputCls} border rounded-xl px-3.5 py-2.5 pr-10 text-sm outline-none transition-all font-mono ${regErrors.regConfirm ? "border-red-500/50" : regConfirm && regConfirm === regPassword ? "border-emerald-500/50" : "border-slate-700/50 focus:border-cyan-500/50"
                          }`}
                      />
                      {regConfirm.length > 0 && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2">
                          {regConfirm === regPassword ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
                        </span>
                      )}
                    </div>
                    {regErrors.regConfirm && <p className="text-[11px] text-red-400 mt-1 font-mono">✕ {regErrors.regConfirm}</p>}
                  </div>

                  {/* Submit */}
                  <div className="sm:col-span-2">
                    <button onClick={handleRegister}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm tracking-wider shadow-lg transition-all"
                    >
                      CREATE OPERATOR ACCOUNT
                    </button>
                    <p className={`text-center text-[11px] font-mono mt-3 ${dk ? "opacity-50" : "text-slate-500"}`}>
                      Already registered?{" "}
                      <button onClick={() => setCurrentPage("safety")} className="text-cyan-400 hover:underline">Sign In</button>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PAGE 2: PRODUCTION DASHBOARD */}

          {currentPage === "dashboard" && isAuthenticated && (
            <div className="p-6 max-w-[1400px] mx-auto space-y-6">

              <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4 ${divider}`}>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">OEE Live Telemetry</h2>
                  <p className="text-xs opacity-60 mt-1">Industrial Line A3 Digital Twin Streaming — Continuous Updates</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`px-4 py-2 border rounded-xl text-center ${panelBg}`}>
                    <span className="block text-[10px] opacity-60 font-mono">SPEED</span>
                    <span className="font-mono text-sm font-bold text-cyan-400 tabular-nums">{telemetry.speed} ppm</span>
                  </div>
                  <div className={`px-4 py-2 border rounded-xl text-center ${panelBg}`}>
                    <span className="block text-[10px] opacity-60 font-mono">VIBRATION</span>
                    <span className={`font-mono text-sm font-bold tabular-nums ${telemetry.vibration > 65 ? "text-amber-400" : "text-emerald-400"}`}>{telemetry.vibration} mm/s</span>
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { title: "OVERALL EFFICIENCY (OEE)", value: `${telemetry.oee}%`, status: "Operational", sub: "92% Target" },
                  { title: "AVAILABILITY", value: "98.1%", status: "Good", sub: "Lockout clear" },
                  { title: "PERFORMANCE", value: "95.4%", status: "Good", sub: "1250 units/min" },
                  { title: "QUALITY YIELD", value: "99.3%", status: "Perfect", sub: "First pass yield" },
                ].map((kpi, i) => (
                  <div key={i} className={`p-5 rounded-2xl border ${card}`}>
                    <span className="text-[10px] font-mono opacity-50 block uppercase tracking-wider">{kpi.title}</span>
                    <div className="text-2xl font-extrabold tracking-tight mt-1.5 text-cyan-400 font-mono">{kpi.value}</div>
                    <div className={`flex justify-between items-center mt-3 pt-3 border-t text-[11px] ${divider}`}>
                      <span className="opacity-60">{kpi.sub}</span>
                      <span className="text-emerald-400 font-bold">{kpi.status}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid lg:grid-cols-3 gap-6">

                {/* Active Work Orders */}
                <div className={`lg:col-span-2 p-5 rounded-2xl border ${card}`}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className={`text-sm font-bold tracking-wider uppercase ${dk ? "opacity-70" : "text-slate-500"}`}>Shift Jobs Queue</h3>
                    <button onClick={() => setCurrentPage("workorder")} className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors">
                      <Plus className="w-3.5 h-3.5" /> NEW WO
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono text-xs">
                      <thead>
                        <tr className={`border-b ${divider} opacity-60`}>
                          <th className="py-2.5">JOB ID</th>
                          <th>PART NO</th>
                          <th>BATCH</th>
                          <th>PRIORITY</th>
                          <th>STATUS</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${divider}`}>
                        {workOrders.map((wo) => (
                          <tr key={wo.id} className={dk ? "hover:bg-slate-800/20" : "hover:bg-slate-50"}>
                            <td className="py-3 font-bold text-cyan-400">{wo.id}</td>
                            <td>{wo.partNumber}</td>
                            <td>{wo.batch}</td>
                            <td>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${priorityColors[wo.priority]}`}>
                                {wo.priority.toUpperCase()}
                              </span>
                            </td>
                            <td>
                              <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${wo.status === "pending" ? "text-amber-400 border-amber-500/30" :
                                wo.status === "inspected" ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" :
                                  wo.status === "resolved" ? "text-blue-400 border-blue-500/30 bg-blue-500/10" :
                                    "text-red-400 border-red-500/30 bg-red-500/10"
                                }`}>
                                {wo.status.toUpperCase()}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Machine Status alerts */}
                <div className={`p-5 rounded-2xl border ${card}`}>
                  <h3 className={`text-sm font-bold tracking-wider uppercase mb-3 ${dk ? "opacity-70" : "text-slate-500"}`}>Predictive Alerts</h3>
                  <div className="space-y-3">
                    {workOrders.some(w => w.status === "failed") && (
                      <div className="p-3.5 bg-red-500/5 border border-red-500/20 rounded-xl">
                        <div className="flex items-center gap-2 text-red-500 mb-1">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="font-bold text-xs font-mono uppercase">SAFETY LOCKOUT</span>
                        </div>
                        <p className={`text-[11px] leading-relaxed mb-3 ${dk ? "opacity-70" : "text-slate-600"}`}>
                          A recent work order failed QA. The target machine is currently under LOTO protocol. Resolve immediately.
                        </p>
                        <button onClick={() => setCurrentPage("maintenance")} className="w-full py-1.5 text-[10px] font-bold bg-red-500 text-white rounded-lg">
                          GOTO SAFETY CONTROL
                        </button>
                      </div>
                    )}

                    {telemetry.vibration > 63.5 && (
                      <div className="p-3.5 bg-amber-500/5 border border-amber-500/20 rounded-xl transition-all duration-500 animate-in fade-in zoom-in-95">
                        <div className="flex justify-between font-mono text-xs text-amber-500 font-bold mb-1">
                          <span className="flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> BEARING VIBRATION</span>
                          <span>{telemetry.vibration} Hz</span>
                        </div>
                        <p className={`text-[11px] leading-relaxed ${dk ? "opacity-70" : "text-slate-600"}`}>Motor M-12 exceeding baseline. Check spindle alignment.</p>
                      </div>
                    )}

                    {telemetry.temp > 41.5 && (
                      <div className="p-3.5 bg-orange-500/5 border border-orange-500/20 rounded-xl transition-all duration-500 animate-in fade-in zoom-in-95">
                        <div className="flex justify-between font-mono text-xs text-orange-500 font-bold mb-1">
                          <span className="flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> SPINDLE OVERTEMP</span>
                          <span>{telemetry.temp}°C</span>
                        </div>
                        <p className={`text-[11px] leading-relaxed ${dk ? "opacity-70" : "text-slate-600"}`}>Thermal limits approaching. Consider adding coolant or reducing feed rate.</p>
                      </div>
                    )}

                    {!workOrders.some(w => w.status === "failed") && telemetry.vibration <= 63.5 && telemetry.temp <= 41.5 && (
                      <div className={`p-6 text-center border rounded-xl border-dashed ${dk ? "border-slate-800 text-emerald-500/60" : "border-slate-300 text-emerald-600/70"}`}>
                        <CheckCircle2 className="w-6 h-6 mx-auto mb-2 opacity-50" />
                        <div className="text-xs font-mono">All machine telemetry within baseline limits.</div>
                      </div>
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* PAGE 3: WORK ORDER CREATION */}
          {currentPage === "workorder" && isAuthenticated && (
            <div className="p-6 max-w-[900px] mx-auto space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-2xl font-bold tracking-tight">Assign Production Job</h2>
                <p className="text-xs opacity-60 mt-1">Deploy batch controls onto Line A3 ERP queue.</p>
              </div>

              <div className={`p-6 rounded-2xl border space-y-5 ${card}`}>

                {/* Part Number input with custom validation */}
                <div>
                  <label className="block text-[11px] font-mono opacity-60 mb-1.5 uppercase tracking-wide">
                    Part Number (Format: AB-1234 or ABC-1234X)
                  </label>
                  <input
                    type="text"
                    value={partNumber}
                    onChange={(e) => {
                      setPartNumber(e.target.value.toUpperCase());
                      validateField("partNumber", e.target.value.toUpperCase());
                    }}
                    placeholder="e.g. AB-1234"
                    className={`w-full ${inputCls} border rounded-xl px-3.5 py-2.5 text-sm transition-all outline-none font-mono ${validationErrors.partNumber ? "border-red-500/50 focus:border-red-500" : "border-slate-700/50 focus:border-cyan-500/50"
                      }`}
                  />
                  {validationErrors.partNumber && (
                    <p className="text-[11px] text-red-400 mt-1 font-mono">✕ {validationErrors.partNumber}</p>
                  )}
                </div>

                {/* Batch Code */}
                <div>
                  <label className="block text-[11px] font-mono opacity-60 mb-1.5 uppercase tracking-wide">
                    Batch Control Code (Alphanumeric & Hyphens only)
                  </label>
                  <input
                    type="text"
                    value={batchCode}
                    onChange={(e) => {
                      setBatchCode(e.target.value.toUpperCase());
                      validateField("batchCode", e.target.value.toUpperCase());
                    }}
                    placeholder="e.g. B-24Q3-882"
                    className={`w-full ${inputCls} border rounded-xl px-3.5 py-2.5 text-sm transition-all outline-none font-mono ${validationErrors.batchCode ? "border-red-500/50 focus:border-red-500" : "border-slate-700/50 focus:border-cyan-500/50"
                      }`}
                  />
                  {validationErrors.batchCode && (
                    <p className="text-[11px] text-red-400 mt-1 font-mono">✕ {validationErrors.batchCode}</p>
                  )}
                </div>

                {/* Priority Radios */}
                <div>
                  <label className="block text-[11px] font-mono opacity-60 mb-2 uppercase tracking-wide">Job Urgency Priority</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                    {(["low", "medium", "high", "critical"] as Priority[]).map((p) => (
                      <label key={p} className="relative cursor-pointer">
                        <input
                          type="radio"
                          name="priority"
                          value={p}
                          checked={selectedPriority === p}
                          onChange={() => setSelectedPriority(p)}
                          className="sr-only"
                        />
                        <div className={`p-3 rounded-xl border text-center font-bold text-xs capitalize transition-all ${selectedPriority === p
                          ? "bg-violet-500/10 border-violet-500/50 text-violet-400 ring-2 ring-violet-500/20"
                          : dk ? "bg-slate-800/40 border-slate-800 hover:border-slate-700 opacity-70" : "bg-slate-100 border-slate-300 text-slate-600 hover:border-slate-400"
                          }`}>
                          {p}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleWorkOrderCreate}
                  className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-bold text-sm tracking-wide shadow-lg"
                >
                  INITIALIZE PRODUCTION WORK ORDER
                </button>
              </div>
            </div>
          )}

          {/* PAGE 4: QUALITY INSPECTION */}
          {currentPage === "inspection" && isAuthenticated && (
            <div className="p-6 max-w-[1000px] mx-auto space-y-6">
              <div className={`border-b pb-4 ${divider}`}>
                <h2 className="text-2xl font-bold tracking-tight">Quality Assurance Audit</h2>
                <p className="text-xs opacity-60 mt-1">Log defect dimensions and classification metrics.</p>
              </div>

              <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6">
                <div className={`p-5 rounded-2xl border space-y-5 ${card}`}>
                  {workOrders.filter(w => w.status === "pending").length === 0 ? (
                    <div className="py-12 text-center text-sm font-mono opacity-60">
                      No pending work orders require inspection.
                      <button onClick={() => setCurrentPage("workorder")} className="block mx-auto mt-4 px-4 py-2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-xl transition-colors hover:bg-cyan-500/20">CREATE WORK ORDER</button>
                    </div>
                  ) : (
                    <>
                      {/* Work Order Selector */}
                      <div>
                        <label className="block text-[11px] font-mono opacity-60 mb-2 uppercase tracking-wide">Target Work Order</label>
                        <select
                          value={selectedWorkOrder?.id || ""}
                          onChange={(e) => setSelectedWorkOrder(workOrders.find(wo => wo.id === e.target.value) || null)}
                          className={`w-full ${inputCls} border rounded-xl px-3.5 py-2.5 text-sm transition-all outline-none font-mono border-slate-700/50`}
                        >
                          <option value="" disabled>Select Work Order</option>
                          {workOrders.filter(w => w.status === "pending").map((wo) => (
                            <option key={wo.id} value={wo.id}>{wo.id} — {wo.batch}</option>
                          ))}
                        </select>
                      </div>

                      {/* Pass/Fail Radio-style buttons */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold uppercase opacity-60">Status Assessment:</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setInspectionResult("pass")}
                            className={`px-4 py-1.5 rounded-xl font-mono font-bold text-xs border ${inspectionResult === "pass"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/50"
                              : "bg-slate-800/40 opacity-50"
                              }`}
                          >
                            PASS
                          </button>
                          <button
                            onClick={() => setInspectionResult("fail")}
                            className={`px-4 py-1.5 rounded-xl font-mono font-bold text-xs border ${inspectionResult === "fail"
                              ? "bg-red-500/10 text-red-400 border-red-500/50"
                              : "bg-slate-800/40 opacity-50"
                              }`}
                          >
                            FAIL
                          </button>
                        </div>
                      </div>

                      {/* Defect Type Radios */}
                      <div>
                        <label className="block text-[11px] font-mono opacity-60 mb-2 uppercase tracking-wide">Defect Root Cause Classification</label>
                        <div className="grid grid-cols-2 gap-2.5">
                          {(["cosmetic", "dimensional", "functional", "material"] as DefectType[]).map((type) => (
                            <label key={type} className="relative cursor-pointer">
                              <input
                                type="radio"
                                name="defectType"
                                value={type}
                                checked={defectType === type}
                                onChange={() => setDefectType(type)}
                                className="sr-only"
                              />
                              <div className={`p-2.5 rounded-xl border text-center transition-all ${defectType === type
                                ? "bg-violet-500/10 border-violet-500/50 text-violet-400"
                                : dk ? "bg-slate-800/40 border-slate-800 opacity-60" : "bg-slate-100 border-slate-300 text-slate-600"
                                }`}>
                                <span className="text-xs capitalize font-medium">{type}</span>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Notes with limit check */}
                      <div>
                        <label className="block text-[11px] font-mono opacity-60 mb-1.5 uppercase tracking-wide">
                          Inspector Notes (Max 200 chars, no HTML tags)
                        </label>
                        <textarea
                          value={inspectionNotes}
                          onChange={(e) => {
                            setInspectionNotes(e.target.value);
                            validateField("inspectionNotes", e.target.value);
                          }}
                          placeholder="Enter fault description or tolerance deviations..."
                          rows={3}
                          className={`w-full ${inputCls} border border-slate-700/50 rounded-xl px-3 py-2.5 text-sm outline-none resize-none font-mono`}
                          maxLength={200}
                        />
                        <div className="flex justify-between mt-1 text-[10px] font-mono opacity-50">
                          <span>Spaces allowed. Special chars permitted.</span>
                          <span>{inspectionNotes.length}/200</span>
                        </div>
                        {validationErrors.inspectionNotes && (
                          <p className="text-[11px] text-red-400 mt-1 font-mono">✕ {validationErrors.inspectionNotes}</p>
                        )}
                      </div>

                      <button
                        onClick={handleInspectionSubmit}
                        disabled={!!validationErrors.inspectionNotes}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-sm"
                      >
                        SAVE QUALITY RECORD
                      </button>
                    </>
                  )}
                </div>

                <div className={`p-5 rounded-2xl border ${card}`}>
                  <h3 className="text-xs font-bold font-mono tracking-wider opacity-60 mb-3">HISTORICAL QA LOGS</h3>
                  <div className="space-y-3">
                    {inspections.map((ins) => (
                      <div key={ins.id} className={`p-3 rounded-xl border text-xs font-mono ${panelBg}`}>
                        <div className="flex justify-between items-center font-bold mb-1">
                          <span className="text-cyan-400">{ins.id}</span>
                          <span className={ins.passed ? "text-emerald-400" : "text-red-400"}>{ins.passed ? "PASSED" : "FAILED"}</span>
                        </div>
                        <p className="opacity-70 mt-1">{ins.notes}</p>
                        <div className="mt-2 text-[10px] opacity-40">Inspector: {ins.inspectorId} • {ins.timestamp}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PAGE 5: SAFETY & LOCKOUT TAGOUT */}
          {currentPage === "maintenance" && isAuthenticated && (
            <div className="p-6 max-w-[1200px] mx-auto space-y-6">
              <div className={`border-b pb-4 ${divider}`}>
                <h2 className="text-2xl font-bold tracking-tight">Lockout / Tagout (LOTO) Command</h2>
                <p className="text-xs opacity-60 mt-1">Hazard isolation procedures — OSHA 1910.147 requirements.</p>
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                <div className={`lg:col-span-2 p-5 rounded-2xl border space-y-4 ${card}`}>
                  <h3 className="text-sm font-bold flex items-center gap-2 text-red-400 font-mono tracking-wide uppercase">
                    <Zap className="w-4 h-4 text-red-400 animate-pulse" /> Active Machine Lockouts
                  </h3>

                  <div className="space-y-3 font-mono text-xs">
                    {workOrders.filter(w => w.status === "failed").length === 0 ? (
                      <div className={`p-8 text-center border border-dashed rounded-xl ${dk ? "border-slate-800 text-slate-500" : "border-slate-300 text-slate-400"}`}>
                        All machine safety gates operational. No recorded QA faults require LOTO clearing.
                      </div>
                    ) : (
                      workOrders.filter(w => w.status === "failed").map((wo) => (
                        <div key={wo.id} className="p-4 rounded-xl border bg-red-500/5 border-red-500/30 flex justify-between items-center flex-wrap gap-4">
                          <div>
                            <div className="flex items-center gap-3 font-bold mb-1">
                              <span className="text-red-400">{wo.partNumber} ({wo.station})</span>
                              <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-500 text-[10px]">LOCKED BY FAULT</span>
                            </div>
                            <div className={`text-[10px] ${dk ? "opacity-60" : "text-slate-600"}`}>
                              Failed Job: {wo.id} • Batch: {wo.batch}
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              setWorkOrders(prev => prev.map(w => w.id === wo.id ? { ...w, status: "resolved" } : w));
                              showNotification(`LOTO procedure cleared. Machine at ${wo.station} is unlocked.`, "success");
                            }}
                            className="px-4 py-2 border border-emerald-500/50 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all rounded-lg font-bold text-[10px] tracking-widest uppercase"
                          >
                            Resolve & Unlock
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className={`p-5 rounded-2xl border ${card}`}>
                  <h3 className="text-sm font-bold font-mono tracking-wider opacity-70 mb-3">DIGITAL TWIN TELEMETRY</h3>
                  <div className="space-y-4 text-xs">
                    <div className="p-4 bg-violet-500/10 border border-violet-500/30 rounded-xl">
                      <span className="font-bold text-violet-400 font-mono block mb-1 uppercase text-[10px]">Real-time MQTT Stream</span>
                      <p className="opacity-70 leading-relaxed">
                        Digital Twin syncs to the physical press over an MQTT broker. If a hardware gate is opened without LOTO tags, the system halts production power within 15ms.
                      </p>
                    </div>

                    <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
                      <span className="font-bold text-cyan-400 font-mono block mb-1 uppercase text-[10px]">Augmented Reality Sync</span>
                      <p className="opacity-70 leading-relaxed">
                        Workers utilizing spatial computing tablets receive real-time color overlays of hydraulic pressure points when standing within 3 meters of Line A3.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* PAGE 6: SHIFT ANALYTICS REPORT */}
          {currentPage === "report" && isAuthenticated && (
            <div className="p-6 max-w-[1100px] mx-auto space-y-6">
              <div className={`border-b pb-4 ${divider}`}>
                <h2 className="text-2xl font-bold tracking-tight">Shift Analytics Report</h2>
                <p className={`text-xs mt-1 ${dk ? "opacity-60" : "text-slate-500"}`}>Production summary for {selectedShift.toUpperCase()} shift — Operator: {employeeId}</p>
              </div>

              {/* Summary KPIs - NOW DYNAMICALLY DRIVEN */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "UNITS LOADED", value: workOrders.reduce((acc, w) => acc + w.quantity, 0).toLocaleString(), suffix: "pcs", trend: "Target: 50k" },
                  { label: "QUALITY YIELD", value: inspections.length ? ((inspections.filter(i => i.passed).length / inspections.length) * 100).toFixed(1) : "100.0", suffix: "%", trend: "Active Shift" },
                  { label: "QA REJECTS", value: inspections.filter(i => !i.passed).length.toString(), suffix: "parts", trend: "Historical Log" },
                  { label: "AVG CYCLE TIME", value: (40 + Math.random() * 10).toFixed(1), suffix: "sec", trend: "Optimal" },
                ].map((kpi, index) => (
                  <div key={index} className={`p-5 rounded-2xl border ${card}`}>
                    <span className={`text-[10px] font-mono uppercase tracking-wider block ${dk ? "opacity-50" : "text-slate-500"}`}>{kpi.label}</span>
                    <div className="text-3xl font-extrabold font-mono mt-2 text-cyan-400">{kpi.value}<span className="text-sm opacity-50 ml-1">{kpi.suffix}</span></div>
                    <div className="text-[10px] mt-2 opacity-60 font-mono">{kpi.trend}</div>
                  </div>
                ))}
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                {/* Inspection Log Table */}
                <div className={`p-5 rounded-2xl border ${card}`}>
                  <h3 className={`text-sm font-bold tracking-wider uppercase mb-4 ${dk ? "opacity-70" : "text-slate-500"}`}>QA Inspection Log</h3>
                  {inspections.length === 0 ? (
                    <p className={`text-sm text-center py-6 ${dk ? "opacity-50" : "text-slate-400"}`}>No inspections submitted yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {inspections.map(ins => (
                        <div key={ins.id} className={`flex items-center justify-between p-3 rounded-xl border text-xs font-mono ${panelBg}`}>
                          <div>
                            <span className="text-cyan-400 font-bold">{ins.id}</span>
                            <span className={`ml-2 ${dk ? "opacity-60" : "text-slate-500"}`}>→ {ins.workOrderId}</span>
                            <p className={`mt-0.5 ${dk ? "opacity-50" : "text-slate-400"}`}>{ins.notes.slice(0, 40)}{ins.notes.length > 40 ? "…" : ""}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded font-bold text-[10px] border ${ins.passed ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" : "text-red-400 bg-red-500/10 border-red-500/30"}`}>
                            {ins.passed ? "PASS" : "FAIL"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Shift Telemetry Snapshot */}
                <div className={`p-5 rounded-2xl border ${card}`}>
                  <h3 className={`text-sm font-bold tracking-wider uppercase mb-4 ${dk ? "opacity-70" : "text-slate-500"}`}>Live Machine Telemetry</h3>
                  <div className="space-y-4">
                    {[
                      { label: "OEE", value: `${telemetry.oee}%`, bar: telemetry.oee, color: "bg-cyan-500" },
                      { label: "TEMPERATURE", value: `${telemetry.temp}°C`, bar: (telemetry.temp / 80) * 100, color: "bg-amber-500" },
                      { label: "LINE SPEED", value: `${telemetry.speed} ppm`, bar: (telemetry.speed / 1500) * 100, color: "bg-violet-500" },
                      { label: "VIBRATION", value: `${telemetry.vibration} mm/s`, bar: (telemetry.vibration / 100) * 100, color: telemetry.vibration > 65 ? "bg-red-500" : "bg-emerald-500" },
                    ].map((m, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-xs font-mono mb-1">
                          <span className={dk ? "opacity-60" : "text-slate-500"}>{m.label}</span>
                          <span className="font-bold">{m.value}</span>
                        </div>
                        <div className={`h-2 rounded-full overflow-hidden ${dk ? "bg-slate-800" : "bg-slate-200"}`}>
                          <div className={`h-full ${m.color} transition-all duration-1000`} style={{ width: `${Math.min(m.bar, 100)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PAGE 7: HELP & FAQ */}
          {currentPage === "faq" && (
            <div className="p-6 max-w-[900px] mx-auto space-y-6">
              <div className={`border-b pb-4 ${divider} flex justify-between items-center`}>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Operator FAQ & Flow Guide</h2>
                  <p className={`text-xs mt-1 ${dk ? "opacity-60" : "text-slate-500"}`}>System instructions and troubleshooting for FabricaTech MES.</p>
                </div>
                {!isAuthenticated && (
                  <button
                    onClick={() => setCurrentPage("safety")}
                    className="px-4 py-2 font-mono text-xs font-bold border border-cyan-500/50 text-cyan-500 bg-cyan-500/10 rounded-xl shadow-sm transition hover:bg-cyan-500/20"
                  >
                    RETURN TO LOGIN
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {[
                  { q: "What is my Employee ID and how do I log in?", a: "To log in securely onto the shift platform, use your assigned 6-character alphanumeric Employee ID (e.g., A28076) and matching Access Code. Only whitelisted users are accepted." },
                  { q: "What is the primary application workflow?", a: "A standard shift proceeds as follows: First, review telemetry on the Dashboard. Then click 'NEW WO' to generate a Work Order. After processing, go to Quality Assurance to audit the part. If a part fails, it triggers a machine safety lockout." },
                  { q: "How do I clear a Safety Lockout (LOTO)?", a: "When an audit fails, navigate to the SAFETY CONTROL page. The faulty machine will be listed under Active Lockouts. After physical verification is complete, click 'Resolve & Unlock' to reset the job status and bring the machine back online." },
                  { q: "How do I switch interface themes?", a: "Click the Sun/Moon icon in the top right corner of the application to seamlessly toggle between the dark high-contrast mode and the light industrial mode. All charts will automatically adjust to the setting." },
                ].map((item, i) => (
                  <div key={i} className={`p-5 rounded-2xl border ${card}`}>
                    <h3 className="text-sm font-bold tracking-wide flex items-start gap-2 mb-2 text-cyan-500">
                      <HelpCircle className="w-5 h-5 flex-shrink-0" /> {item.q}
                    </h3>
                    <p className={`text-sm leading-relaxed pl-7 ${dk ? "opacity-70" : "text-slate-600"}`}>
                      {item.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ASSIGNMENT FOOTER WITH INNOVATIVE DESIGN */}
      <footer className={`border-t p-3 lg:p-4 text-center font-mono tracking-wider flex flex-col md:flex-row justify-between items-center gap-3 relative z-10 ${dk ? "border-slate-800/80 bg-slate-900/90 text-slate-400" : "border-slate-200 bg-white text-slate-500 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]"}`}>
        <div className="text-[10px] md:text-[11px] text-left leading-relaxed">
          <span className="font-bold">MN204 HMI</span><br />
          <span className="opacity-80">Dr. Pradipta Biswas</span><br />
          <strong className={dk ? "text-cyan-400 md:text-xs" : "text-cyan-700 md:text-xs"}>Indian Institute of Science</strong>
        </div>

        <div className="text-[10px] md:text-[11px] font-bold tracking-widest text-center flex flex-col items-center">
          <span className="p-1 px-3 border rounded-xl mb-1 bg-current opacity-20"></span>
          <span>FABRICATECH MES • SYSTEM ONLINE</span>
        </div>

        <div className="text-[10px] md:text-[11px] text-right leading-relaxed flex flex-col items-end justify-end">
          <strong className={dk ? "text-violet-400 md:text-xs" : "text-violet-700 md:text-xs"}>Abha Singh Sardar</strong>
          <span className="opacity-80 font-bold">SR No. 28076</span>
        </div>
      </footer>

    </div>
  );
}
