import { useEffect, useState } from "react";
import { useAdminModals } from "../context/AdminModalContext";
import Modal from "../../../components/ui/Modal";
import ComplaintDetail from "../../complaints/components/ComplaintDetail";
import type { ComplaintDetailData } from "../../complaints/components/ComplaintDetail";
import MslvlDetail from "./MslvlDetail";
import { getComplaintById, assignComplaint, verifyAndClose } from "../../complaints/services/complaint.service";
import { getMslvlCrewDetail } from "../services/mslvl.service";
import type { MslvlCrewDetail } from "../services/mslvl.service";

const GlobalModals = () => {
  const {
    openComplaintId, openMslvlId, frontModal,
    openComplaint, openMslvl, closeComplaint, closeMslvl,
    complaints, mslvlAccounts, refreshAll,
  } = useAdminModals();

  const [complaint, setComplaint] = useState<ComplaintDetailData | null>(null);
  const [complaintLoading, setComplaintLoading] = useState(false);
  const [crew, setCrew] = useState<MslvlCrewDetail | null>(null);
  const [crewLoading, setCrewLoading] = useState(false);

  const loadComplaint = async (id: string) => {
    setComplaintLoading(true);
    try {
      setComplaint(await getComplaintById(id));
    } catch (err) {
      console.error(err);
      alert("Failed to load complaint");
      closeComplaint();
    } finally {
      setComplaintLoading(false);
    }
  };

  const loadCrew = async (id: string) => {
    setCrewLoading(true);
    try {
      setCrew(await getMslvlCrewDetail(id));
    } catch (err) {
      console.error(err);
      alert("Failed to load MSLVL details");
      closeMslvl();
    } finally {
      setCrewLoading(false);
    }
  };

  useEffect(() => {
    if (!openComplaintId) { setComplaint(null); return; }
    void loadComplaint(openComplaintId);
  }, [openComplaintId]);

  useEffect(() => {
    if (!openMslvlId) { setCrew(null); return; }
    void loadCrew(openMslvlId);
  }, [openMslvlId]);

  const handleAssign = async (complaintId: string, mslvlId: string) => {
    await assignComplaint(complaintId, mslvlId);
    await refreshAll();
    if (openComplaintId === complaintId) await loadComplaint(complaintId);
    if (openMslvlId) await loadCrew(openMslvlId);
  };

  const handleVerifyClose = async () => {
    if (!complaint) return;
    await verifyAndClose(complaint.id);
    await refreshAll();
    await loadComplaint(complaint.id);
  };

  const unassignedComplaints = complaints.filter((c) => !c.assigned_mslvl_id);

  return (
    <>
      <Modal
        isOpen={!!openComplaintId}
        onClose={closeComplaint}
        title={complaint?.complaint_number ?? "Loading..."}
        zIndexClass={frontModal === "complaint" ? "z-[70]" : "z-50"}
      >
        {complaintLoading && <p className="text-slate-400 text-sm">Loading...</p>}
        {complaint && !complaintLoading && (
          <ComplaintDetail
            complaint={complaint}
            mslvlAccounts={mslvlAccounts}
            onVehicleClick={(id) => openMslvl(id)}
            onAssign={(mslvlId) => handleAssign(complaint.id, mslvlId)}
            onVerifyClose={handleVerifyClose}
          />
        )}
      </Modal>

      <Modal
        isOpen={!!openMslvlId}
        onClose={closeMslvl}
        title={crew?.full_name ?? "Loading..."}
        zIndexClass={frontModal === "mslvl" ? "z-[70]" : "z-50"}
      >
        {crewLoading && <p className="text-slate-400 text-sm">Loading...</p>}
        {crew && !crewLoading && (
          <MslvlDetail
            crew={crew}
            unassignedComplaints={unassignedComplaints}
            onAssignComplaint={(complaintId) => handleAssign(complaintId, crew.id)}
            onComplaintClick={(id) => openComplaint(id)}
          />
        )}
      </Modal>
    </>
  );
};

export default GlobalModals;