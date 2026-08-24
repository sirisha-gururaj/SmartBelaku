import { useEffect, useMemo, useState } from "react";
import { getAllSurveys, createSurvey, updateSurvey } from "../../survey/services/survey.service";
import type { Survey, SurveyFormValues } from "../../survey/services/survey.service";
import SurveyForm from "../../survey/components/SurveyForm";
import SurveyDetail from "../../survey/components/SurveyDetail";
import Modal from "../../../components/ui/Modal";
import { WARDS, POLE_TYPES, LED_MAKES, WATTAGES, CB_CONDITIONS, YES_NO } from "../../survey/constants";
import { exportSurveysToCsv } from "../../survey/utils/csv";

const Surveys = () => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Survey | null>(null);
  const [editing, setEditing] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const openSurvey = (s: Survey) => { setSelected(s); setEditing(false); };
  const closeModal = () => { setSelected(null); setEditing(false); };

  const [searchQuery, setSearchQuery] = useState("");
  const [wardFilter, setWardFilter] = useState("");
  const [poleTypeFilter, setPoleTypeFilter] = useState("");
  const [ledMakeFilter, setLedMakeFilter] = useState("");
  const [wattageFilter, setWattageFilter] = useState("");
  const [cbConditionFilter, setCbConditionFilter] = useState("");
  const [dedicatedLineFilter, setDedicatedLineFilter] = useState("");
  const [surveyorFilter, setSurveyorFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [editedFilter, setEditedFilter] = useState("");

  const load = async () => {
    setLoading(true);
    try { setSurveys(await getAllSurveys()); } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);

  const handleCreate = async (values: SurveyFormValues, photos: (File | null)[], meterPhoto: File | null) => {
    await createSurvey(values, photos, meterPhoto);
    setShowCreate(false);
    await load();
  };

  const handleUpdate = async (values: SurveyFormValues, photos: (File | null)[], meterPhoto: File | null) => {
    if (!selected) return;
    await updateSurvey(selected.id, values, photos, meterPhoto);
    closeModal();
    await load();
  };

  const surveyorOptions = useMemo(() => {
    const map = new Map<string, string>();
    surveys.forEach((s) => { if (s.surveyor) map.set(s.surveyor.id, s.surveyor.full_name); });
    return Array.from(map, ([id, full_name]) => ({ id, full_name }));
  }, [surveys]);

  const filteredSurveys = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return surveys.filter((s) => {
      if (wardFilter && String(s.ward ?? "") !== wardFilter) return false;
      if (poleTypeFilter && !s.poles.some((p) => p.pole_type === poleTypeFilter)) return false;
      if (ledMakeFilter && !s.poles.some((p) => p.lights.some((l) => l.led_make === ledMakeFilter))) return false;
      if (wattageFilter && !s.poles.some((p) => p.lights.some((l) => l.wattage === wattageFilter))) return false;
      if (cbConditionFilter && !s.poles.some((p) => p.cb_condition === cbConditionFilter)) return false;
      if (dedicatedLineFilter && !s.poles.some((p) => p.dedicated_street_light_line === dedicatedLineFilter)) return false;
      if (surveyorFilter && s.surveyor?.id !== surveyorFilter) return false;
      if (dateFilter && new Date(s.created_at).toISOString().slice(0, 10) !== dateFilter) return false;
      if (editedFilter === "admin" && s.last_edited_by_role !== "ADMIN") return false;
      if (editedFilter === "surveyor" && s.last_edited_by_role !== "SURVEYOR") return false;
      if (editedFilter === "none" && s.last_edited_by_role) return false;
      if (q) {
        const haystack = [
          s.sl_no ?? "", s.rr_number ?? "", s.mescom_meter_serial_number ?? "",
          s.zen_meter_serial_number ?? "", s.surveyor?.full_name ?? "",
          ...s.poles.map((p) => p.pole_number ?? ""),
          ...s.poles.flatMap((p) => p.lights.map((l) => l.led_make ?? "")),
        ].join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [
    surveys, searchQuery, wardFilter, poleTypeFilter, ledMakeFilter, wattageFilter,
    cbConditionFilter, dedicatedLineFilter, surveyorFilter, dateFilter, editedFilter,
  ]);

  const clearFilters = () => {
    setSearchQuery(""); setWardFilter(""); setPoleTypeFilter(""); setLedMakeFilter("");
    setWattageFilter(""); setCbConditionFilter(""); setDedicatedLineFilter("");
    setSurveyorFilter(""); setDateFilter(""); setEditedFilter("");
  };
  const hasActiveFilters = searchQuery || wardFilter || poleTypeFilter || ledMakeFilter || wattageFilter
    || cbConditionFilter || dedicatedLineFilter || surveyorFilter || dateFilter || editedFilter;

  const selectClass = "border rounded-lg p-2 text-xs sm:text-sm flex-1 min-w-[45%] sm:flex-none sm:min-w-0";

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Surveys</h1>
          <p className="text-slate-500 text-sm mt-1">Street light survey entries submitted by field surveyors.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="border border-teal-700 text-teal-700 px-4 py-2 rounded-lg hover:bg-teal-50 text-sm">Refresh</button>
          <button
            onClick={() => exportSurveysToCsv(filteredSurveys, `surveys-export-${new Date().toISOString().slice(0, 10)}.csv`)}
            disabled={filteredSurveys.length === 0}
            className="border border-teal-700 text-teal-700 px-4 py-2 rounded-lg hover:bg-teal-50 disabled:opacity-40 disabled:cursor-not-allowed text-sm"
          >
            Export CSV
          </button>
          <button onClick={() => setShowCreate(true)} className="bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded-lg text-sm">+ New Survey</button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow border p-3 sm:p-4 mb-5 space-y-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search SL No, RR number, meter serials, pole number, LED make, surveyor..."
          className="w-full border rounded-lg p-2 text-sm"
        />
        <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
          <select value={wardFilter} onChange={(e) => setWardFilter(e.target.value)} className={selectClass}>
            <option value="">All Wards</option>
            {WARDS.map((w) => <option key={w} value={w}>Ward {w}</option>)}
          </select>
          <select value={poleTypeFilter} onChange={(e) => setPoleTypeFilter(e.target.value)} className={selectClass}>
            <option value="">All Pole Types</option>
            {POLE_TYPES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={ledMakeFilter} onChange={(e) => setLedMakeFilter(e.target.value)} className={selectClass}>
            <option value="">All LED Makes</option>
            {LED_MAKES.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
          <select value={wattageFilter} onChange={(e) => setWattageFilter(e.target.value)} className={selectClass}>
            <option value="">All Wattages</option>
            {WATTAGES.map((w) => <option key={w} value={w}>{w}</option>)}
          </select>
          <select value={cbConditionFilter} onChange={(e) => setCbConditionFilter(e.target.value)} className={selectClass}>
            <option value="">All C & B Conditions</option>
            {CB_CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={dedicatedLineFilter} onChange={(e) => setDedicatedLineFilter(e.target.value)} className={selectClass}>
            <option value="">Dedicated Line: Any</option>
            {YES_NO.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <select value={surveyorFilter} onChange={(e) => setSurveyorFilter(e.target.value)} className={selectClass}>
            <option value="">All Surveyors</option>
            {surveyorOptions.map((s) => <option key={s.id} value={s.id}>{s.full_name}</option>)}
          </select>
          <select value={editedFilter} onChange={(e) => setEditedFilter(e.target.value)} className={selectClass}>
            <option value="">Edit Status: Any</option>
            <option value="admin">Edited by Admin</option>
            <option value="surveyor">Edited by Surveyor</option>
            <option value="none">Not Edited</option>
          </select>
          <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className={selectClass} />
          {hasActiveFilters && <button onClick={clearFilters} className="text-sm text-red-600 hover:underline sm:ml-auto w-full sm:w-auto text-left sm:text-right">Clear filters</button>}
        </div>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : filteredSurveys.length === 0 ? (
        <div className="bg-white rounded-xl shadow border p-8 sm:p-12 text-center text-slate-500">
          {surveys.length === 0 ? "No surveys submitted yet." : "No surveys match these filters."}
        </div>
      ) : (
        <>
          {/* Desktop: table */}
          <div className="hidden md:block bg-white rounded-xl shadow border overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-100">
                <tr>
                  <th className="text-left p-4">SL No</th>
                  <th className="text-left p-4">Ward</th>
                  <th className="text-left p-4">RR Number</th>
                  <th className="text-left p-4">Poles</th>
                  <th className="text-left p-4">Surveyor</th>
                  <th className="text-left p-4">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {filteredSurveys.map((s) => (
                  <tr key={s.id} className="border-t hover:bg-slate-50 cursor-pointer" onClick={() => openSurvey(s)}>
                    <td className="p-4 font-mono">{s.sl_no || "—"}</td>
                    <td className="p-4">{s.ward ? `Ward ${s.ward}` : "—"}</td>
                    <td className="p-4">{s.rr_number || "—"}</td>
                    <td className="p-4">{s.poles.length}</td>
                    <td className="p-4">{s.surveyor?.full_name ?? "—"}</td>
                    <td className="p-4">{new Date(s.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: stacked cards */}
          <div className="md:hidden space-y-3">
            {filteredSurveys.map((s) => (
              <div key={s.id} onClick={() => openSurvey(s)} className="bg-white rounded-xl shadow border p-4 cursor-pointer active:bg-slate-50">
                <div className="flex justify-between items-start gap-2 mb-1">
                  <span className="font-medium text-slate-800">{s.sl_no || "Untitled entry"}</span>
                  {s.last_edited_by_role === "ADMIN" && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full shrink-0">Edited by admin</span>
                  )}
                  {s.last_edited_by_role === "SURVEYOR" && (
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full shrink-0">Edited by surveyor</span>
                  )}
                </div>
                <p className="text-sm text-slate-500">{s.ward ? `Ward ${s.ward}` : "No ward"} · {s.poles.length} pole{s.poles.length === 1 ? "" : "s"} · {s.surveyor?.full_name ?? "Unknown surveyor"}</p>
                <p className="text-xs text-slate-400 mt-1">{new Date(s.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </>
      )}

      <Modal isOpen={!!selected} onClose={closeModal} title={selected?.sl_no || "Survey Entry"}>
        {selected && (
          editing ? (
            <SurveyForm initial={selected} onSubmit={handleUpdate} submitLabel="Save Changes" />
          ) : (
            <SurveyDetail survey={selected} onEdit={() => setEditing(true)} />
          )
        )}
      </Modal>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="New Survey">
        <SurveyForm onSubmit={handleCreate} submitLabel="Submit Survey" />
      </Modal>
    </div>
  );
};

export default Surveys;
