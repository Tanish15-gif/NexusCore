import { Navigate, Route, Routes } from "react-router-dom";

import PublicLayout from "./Components/layout/PublicLayout";
import CustomerDashboardLayout from "./Components/customer/CustomerDashboardLayout";

import HomePage from "./Pages/public/HomePage";
import AboutPage from "./Pages/public/about";
import ServicesPage from "./Pages/public/ServicesPage";
import FeaturesPage from "./Pages/public/FeaturesPage";
import AccountsPage from "./Pages/public/AccountsPage";
import LoginPage from "./Pages/public/LoginPage";
import RegisterPage from "./Pages/public/RegisterPage";
import ContactPage from "./Pages/public/ContactPage";
import LegalPage from "./Pages/public/LegalPage";

import CustomerAccountsPage from "./Pages/customer/CustomerAccountsPage";
import CustomerAccountDetailsPage from "./Pages/customer/CustomerAccountDetailsPage";
import CustomerTransactionsPage from "./Pages/customer/CustomerTransactionsPage";
import CustomerAiAdvisorPage from "./Pages/customer/CustomerAiAdvisorPage";
import EmployeeCustomerLookupPage from "./Pages/employee/EmployeeCustomerLookupPage";
import EmployeePendingAccountsPage from "./Pages/employee/EmployeePendingAccountsPage";
import EmployeeDashboardLayout from "./Components/employee/EmployeeDashboardLayout";
import ManagerPendingDepositsPage from "./Pages/manager/ManagerPendingDepositsPage";
import ManagerDashboardLayout from "./Components/manager/ManagerDashboardLayout";
import ManagerSecurityOperationsPage from "./Pages/manager/ManagerSecurityOperationsPage";
import ManagerGlobalLedgerPage from "./Pages/manager/ManagerGlobalLedgerPage";
import AdminAuditLogsPage from "./Pages/admin/AdminAuditLogsPage";
import AdminOverviewPage from "./Pages/admin/AdminOverviewPage";
import AdminStaffManagementPage from "./Pages/admin/AdminStaffManagementPage";
import AdminDashboardLayout from "./Components/admin/AdminDashboardLayout";

export default function App() {
  return (
    <Routes>
      {/* Public website */}
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/accounts" element={<AccountsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/legal" element={<LegalPage />} />
      </Route>

      <Route path="/dashboard" element={<CustomerDashboardLayout />}>
        <Route index element={<Navigate to="accounts" replace />} />

        <Route path="accounts" element={<CustomerAccountsPage />} />

        <Route
          path="accounts/:accountId"
          element={<CustomerAccountDetailsPage />}
        />
        <Route path="transactions" element={<CustomerTransactionsPage />} />
        <Route path="ai-advisor" element={<CustomerAiAdvisorPage />} />
      </Route>

      <Route path="/employee" element={<EmployeeDashboardLayout />}>
        <Route index element={<Navigate to="approvals" replace />} />

        <Route path="approvals" element={<EmployeePendingAccountsPage />} />

        <Route path="lookup" element={<EmployeeCustomerLookupPage />} />
      </Route>

      <Route path="/manager" element={<ManagerDashboardLayout />}>
        <Route index element={<Navigate to="deposits" replace />} />

        <Route path="deposits" element={<ManagerPendingDepositsPage />} />

        <Route path="ledger" element={<ManagerGlobalLedgerPage />} />

        <Route path="security" element={<ManagerSecurityOperationsPage />} />
      </Route>

      <Route path="/admin" element={<AdminDashboardLayout />}>
        <Route index element={<Navigate to="overview" replace />} />

        <Route path="overview" element={<AdminOverviewPage />} />

        <Route path="staff" element={<AdminStaffManagementPage />} />

        <Route path="audit" element={<AdminAuditLogsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
