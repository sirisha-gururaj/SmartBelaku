import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { getComplaints } from "../../complaints/services/complaint.service";
import { getMslvlAccounts } from "../services/mslvl.service";
import type { Complaint } from "../../complaints/pages/Complaints";
import type { MslvlAccount } from "../services/mslvl.service";

interface AdminModalContextType {
  openComplaintId: string | null;
  openMslvlId: string | null;
  frontModal: "complaint" | "mslvl" | null;
  openComplaint: (id: string) => void;
  openMslvl: (id: string) => void;
  closeComplaint: () => void;
  closeMslvl: () => void;

  complaints: Complaint[];
  mslvlAccounts: MslvlAccount[];
  refreshAll: () => Promise<void>;
}

const AdminModalContext = createContext<AdminModalContextType | undefined>(undefined);

export const AdminModalProvider = ({ children }: { children: ReactNode }) => {
  const [openComplaintId, setOpenComplaintId] = useState<string | null>(null);
  const [openMslvlId, setOpenMslvlId] = useState<string | null>(null);
  const [frontModal, setFrontModal] = useState<"complaint" | "mslvl" | null>(null);

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [mslvlAccounts, setMslvlAccounts] = useState<MslvlAccount[]>([]);

  const refreshAll = useCallback(async () => {
    try {
      const [c, m] = await Promise.all([getComplaints(), getMslvlAccounts()]);
      setComplaints(c);
      setMslvlAccounts(m);
    } catch (err) {
      console.error("Failed to refresh admin data:", err);
    }
  }, []);

  useEffect(() => {
    void refreshAll();
  }, [refreshAll]);

  return (
    <AdminModalContext.Provider
      value={{
        openComplaintId,
        openMslvlId,
        frontModal,
        openComplaint: (id) => { setOpenComplaintId(id); setFrontModal("complaint"); },
        openMslvl: (id) => { setOpenMslvlId(id); setFrontModal("mslvl"); },
        closeComplaint: () => { setOpenComplaintId(null); if (frontModal === "complaint") setFrontModal(openMslvlId ? "mslvl" : null); },
        closeMslvl: () => { setOpenMslvlId(null); if (frontModal === "mslvl") setFrontModal(openComplaintId ? "complaint" : null); },
        complaints,
        mslvlAccounts,
        refreshAll,
      }}
    >
      {children}
    </AdminModalContext.Provider>
  );
};

export const useAdminModals = () => {
  const ctx = useContext(AdminModalContext);
  if (!ctx) throw new Error("useAdminModals must be used within AdminModalProvider");
  return ctx;
};