import { useState, useMemo, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../redux/Reduxindex";
import { addPlace, updatePlace, deletePlace } from "../redux/placeSlice";
import { Plus, MoreHorizontal, ChevronDown, CheckCircle2, Trash2, Edit, Clock, Image as ImageIcon, MapPin, Phone, FileText, ImagePlus, Filter } from "lucide-react";
import { Table } from "../components/ui/Table/Table";
import { Dropdown } from "../components/ui/Dropdown";
import { Pagination } from "../components/ui/Pagination";
import { SidePanelEdit } from "../components/ui/Tabbar/SidePanelEdit";
import { StatusBadge } from "../components/ui/StatusBadge"; 
import type { Column, Place } from "../types"; 
import { CategorySelect, CATEGORY_LIST } from "../components/ui/CategorySelect";
import { checkIsShopOpen } from "../utils/timeUtils"; 
import { generateShopPrefix } from "../utils/queueUtils"; 

import { useForm, Controller } from "react-hook-form";

export default function PlaceManagement() {
  const dispatch = useDispatch();
  const places = useSelector((state: RootState) => state.places.places);
  const context = useOutletContext<{ searchQuery: string } | null>();
  const searchQuery = context?.searchQuery || "";

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [tagFilter, setTagFilter] = useState<string>("All");

  const { control, handleSubmit, reset, formState: { errors } } = useForm<Place>({
    defaultValues: { 
      status: "Inactive", 
      openTime: "10:00", 
      closeTime: "22:00", 
      category: "",
      name: "", branch: "", description: "", phone: "", address: "", logoUrl: "", image: "", tags: []
    }
  });

  const fetchPlacesFromDB = async () => {
    try {
      console.log("Fetching real-time places from DB...");
    } catch (error) {
      console.error("Failed to fetch places:", error);
    }
  };

  useEffect(() => {
    fetchPlacesFromDB();
    const intervalId = setInterval(fetchPlacesFromDB, 30000); 
    return () => clearInterval(intervalId);
  }, []);

  const displayPlaces = useMemo(() => {
    let result = [...places];
    if (statusFilter !== "All") result = result.filter(p => p.status === statusFilter);
    if (tagFilter !== "All") result = result.filter(p => p.tags && p.tags.includes(tagFilter));
    if (searchQuery) result = result.filter((p: Place) => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.placeId.toLowerCase().includes(searchQuery.toLowerCase()));
    return result;
  }, [places, searchQuery, statusFilter, tagFilter]);

  const totalPages = Math.ceil(displayPlaces.length / itemsPerPage);
  const currentData = displayPlaces.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleEdit = (place: Place) => {
    setEditingPlace(place);
    reset({ ...place, name: place.name.split(" (")[0] });
    setIsPanelOpen(true);
  };

  const handleAddNew = () => {
    setEditingPlace(null);
    reset({ name: "", branch: "", description: "", phone: "", address: "", logoUrl: "", image: "", status: "Inactive", openTime: "10:00", closeTime: "22:00", category: "", tags: [] });
    setIsPanelOpen(true);
  };

  const onSubmit = (data: Place) => {
    const formattedName = data.branch ? `${data.name} (${data.branch})` : data.name;
    const primaryCategory = data.tags && data.tags.length > 0 ? data.tags[0] : "General";
    
    if (editingPlace) {
      dispatch(updatePlace({ ...editingPlace, ...data, name: formattedName, category: primaryCategory }));
    } else {
      const prefix = generateShopPrefix(formattedName, primaryCategory);
      const newPlaceId = `#${prefix}-00${Math.floor(Math.random() * 9) + 1}`; 
      dispatch(addPlace({ ...data, id: Date.now().toString(), placeId: newPlaceId, name: formattedName, category: primaryCategory, status: "Inactive", queueCount: 0, avgServiceTime: 15, lat: 13.75, lng: 100.5, createdAt: new Date().toISOString() }));
    }
    setIsPanelOpen(false);
  };

  const columns: Column<Place>[] = [
    { 
      header: "Place Info", key: "info", className: "w-[30%]",
      render: (row) => (
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200 shrink-0">
            {row.logoUrl ? <img src={row.logoUrl} alt="Logo" className="w-full h-full object-cover" /> : <ImageIcon className="text-slate-400" size={20} />}
          </div>
          <div><p className="font-bold text-slate-800">{row.name}</p><p className="text-xs text-slate-500 mt-0.5">{row.placeId}</p></div>
        </div>
      )
    },
    { header: "Tags", key: "tags", className: "w-[25%]", render: (row) => (<div className="flex flex-wrap gap-1">{row.tags && row.tags.map((tag, idx) => (<span key={idx} className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold border border-slate-200">{tag}</span>))}</div>) },
    { 
      header: "Operating Hours", key: "time", className: "w-[20%]",
      render: (row) => {
        const isOpen = checkIsShopOpen(row.openTime, row.closeTime);
        const isSystemActive = row.status === "Active";
        return (
          <div>
            <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600"><Clock size={14} className={(isOpen && isSystemActive) ? "text-emerald-500" : "text-slate-400"} />{row.openTime} - {row.closeTime}</div>
            <p className={`text-[10px] font-bold mt-1 ${(isOpen && isSystemActive) ? "text-emerald-500" : "text-slate-400"}`}>{(isOpen && isSystemActive) ? "OPEN NOW" : "CLOSED"}</p>
          </div>
        );
      }
    },
    { header: "Status", key: "status", className: "w-[15%]", render: (row) => <StatusBadge status={row.status} /> },
    {
      header: "Actions", key: "actions", className: "text-right w-[10%]",
      render: (row) => (
        <Dropdown align="right" trigger={<button className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg"><MoreHorizontal size={18} /></button>}
          items={[
            { label: "Edit Details", icon: <Edit size={16} />, onClick: () => handleEdit(row) },
            { divider: true, label: "" },
            { label: "Delete Place", icon: <Trash2 size={16} />, onClick: () => dispatch(deletePlace(row.id)), className: "text-rose-600" }
          ]}
        />
      )
    }
  ];

  return (
    <div className="p-4 lg:p-8 max-w-[1600px] mx-auto w-full pt-10">
      
      {/* 🌟 Filter ฝั่งซ้าย | ปุ่ม Add ฝั่งขวา */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 w-full">
        <div className="flex flex-wrap items-center gap-3">
          <Dropdown align="left" trigger={<button className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm flex flex-row items-center justify-between min-w-[140px] whitespace-nowrap px-4 py-2.5 rounded-xl text-sm font-bold transition-all"><Filter size={14} className="text-slate-400 mr-2"/> <span>Status: {statusFilter}</span> <ChevronDown size={14} className="ml-2 text-slate-400 shrink-0"/></button>}
            items={[{ label: "All Status", onClick: () => setStatusFilter("All") }, { label: "Active", onClick: () => setStatusFilter("Active") }, { label: "Inactive", onClick: () => setStatusFilter("Inactive") }]}
          />
          <Dropdown align="left" trigger={<button className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm flex flex-row items-center justify-between min-w-[140px] whitespace-nowrap px-4 py-2.5 rounded-xl text-sm font-bold transition-all"><Filter size={14} className="text-slate-400 mr-2"/> <span>Tag: {tagFilter}</span> <ChevronDown size={14} className="ml-2 text-slate-400 shrink-0"/></button>}
            items={[{ label: "All Tags", onClick: () => setTagFilter("All") }, ...CATEGORY_LIST.map(cat => ({ label: cat, onClick: () => setTagFilter(cat) }))]}
          />
        </div>

        <div className="flex items-center">
          <button onClick={handleAddNew} className="bg-[#5AB2A8] hover:bg-[#4a968d] text-white shadow-lg shadow-teal-100 flex flex-row items-center justify-center gap-2 whitespace-nowrap px-6 py-2.5 rounded-xl text-sm font-bold transition-all">
            <Plus size={16} />
            <span>New Place</span>
          </button>
        </div>
      </div>

      <Table data={currentData} columns={columns} emptyMessage="No places found." />
      <Pagination currentPage={currentPage} totalPages={totalPages} onChange={setCurrentPage} />

      <SidePanelEdit isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} title={editingPlace ? "Edit Place" : "Add New Place"}>
        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-800 border-b pb-2">Basic Information</h3>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Place Name</label>
                <Controller control={control} name="name" rules={{ required: "Name is required" }} render={({ field: { onChange, value } }) => (
                  <input type="text" value={value || ""} onChange={onChange} placeholder="e.g. Copper Buffet" className={`w-full px-4 py-3 bg-slate-50 border ${errors.name ? 'border-red-400' : 'border-slate-200'} rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#5AB2A8]`} />
                )} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Branch (Optional)</label>
                <Controller control={control} name="branch" render={({ field: { onChange, value } }) => (
                  <input type="text" value={value || ""} onChange={onChange} placeholder="e.g. Siam Paragon" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#5AB2A8]" />
                )} />
              </div>
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Tags (Select multiple)</label>
                <Controller control={control} name="tags" rules={{ validate: (v) => (v && v.length > 0) || "Please select at least one tag" }} render={({ field: { onChange, value } }) => (
                  <div>
                    <CategorySelect selectedCategories={value || []} onChange={onChange} />
                    {errors.tags && <p className="text-xs text-red-500 mt-1">{errors.tags.message}</p>}
                  </div>
                )} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Description</label>
                <Controller control={control} name="description" render={({ field: { onChange, value } }) => (
                  <div className="relative"><FileText size={16} className="absolute left-4 top-4 text-slate-400" /><textarea value={value || ""} onChange={onChange} placeholder="Brief description of the place..." className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none resize-none h-24 focus:ring-2 focus:ring-[#5AB2A8]" /></div>
                )} />
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-800 border-b pb-2">Contact & Location</h3>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Phone Number</label>
                <Controller control={control} name="phone" render={({ field: { onChange, value } }) => (
                  <div className="relative"><Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input type="tel" value={value || ""} onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))} placeholder="02XXXXXXX" className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#5AB2A8]" /></div>
                )} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Address</label>
                <Controller control={control} name="address" render={({ field: { onChange, value } }) => (
                  <div className="relative"><MapPin size={16} className="absolute left-4 top-4 text-slate-400" /><textarea value={value || ""} onChange={onChange} placeholder="Full address..." className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none resize-none h-20 focus:ring-2 focus:ring-[#5AB2A8]" /></div>
                )} />
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-800 border-b pb-2">Media & Images</h3>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Logo URL</label>
                <Controller control={control} name="logoUrl" render={({ field: { onChange, value } }) => (
                  <div className="relative"><ImageIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input type="url" value={value || ""} onChange={onChange} placeholder="https://example.com/logo.png" className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#5AB2A8]" /></div>
                )} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Cover Image URL</label>
                <Controller control={control} name="image" render={({ field: { onChange, value } }) => (
                  <div className="relative"><ImagePlus size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input type="url" value={value || ""} onChange={onChange} placeholder="https://example.com/cover.jpg" className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#5AB2A8]" /></div>
                )} />
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-800 border-b pb-2">Operations</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase block">Open Time</label>
                  <Controller control={control} name="openTime" render={({ field: { onChange, value } }) => (
                    <div className="relative"><Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input type="time" value={value || "10:00"} onChange={onChange} className="w-full pl-9 pr-2 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#5AB2A8]" /></div>
                  )} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase block">Close Time</label>
                  <Controller control={control} name="closeTime" render={({ field: { onChange, value } }) => (
                    <div className="relative"><Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input type="time" value={value || "22:00"} onChange={onChange} className="w-full pl-9 pr-2 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#5AB2A8]" /></div>
                  )} />
                </div>
              </div>
              
              {editingPlace && (
                <div className="space-y-1.5 pt-2 animate-in fade-in">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">System Status</label>
                  <Controller control={control} name="status" render={({ field: { onChange, value } }) => (
                    <div className="relative">
                      <select value={value || "Active"} onChange={onChange} className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold appearance-none outline-none focus:ring-2 focus:ring-[#5AB2A8]">
                        <option value="Active">Active (Online)</option>
                        <option value="Inactive">Inactive (Temporarily Closed)</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  )} />
                </div>
              )}
            </div>

            <div className="pt-4 mt-2 border-t border-slate-100">
              <button type="submit" className="w-full flex flex-row items-center justify-center gap-2 py-3.5 bg-[#5AB2A8] hover:bg-[#4a968d] text-white font-bold rounded-xl shadow-lg shadow-teal-100 transition-all active:scale-[0.98] whitespace-nowrap">
                <CheckCircle2 size={20} /> 
                <span>{editingPlace ? "Save Changes" : "Create Place"}</span>
              </button>
            </div>
          </form>
        </div>
      </SidePanelEdit>
    </div>
  );
}