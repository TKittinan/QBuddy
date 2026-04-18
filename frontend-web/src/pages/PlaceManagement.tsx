import { useState, useMemo, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { 
  fetchPlaces, 
  addPlaceAsync, 
  updatePlaceAsync, 
  deletePlaceAsync 
} from "../redux/Slice/placeSlice"; 
import { 
  Plus, MoreHorizontal, Trash2, Edit, Clock, 
  Image as ImageIcon, MapPin, Phone, FileText, 
  ImagePlus, AlignLeft, UploadCloud, X, Filter, ChevronDown, Activity, Users
} from "lucide-react";
import { Table } from "../components/ui/Table/Table";
import { Dropdown } from "../components/ui/Dropdown";
import { Input } from "../components/ui/Input";
import { Pagination } from "../components/ui/Pagination";
import { SidePanelEdit } from "../components/ui/Tabbar/SidePanelEdit";
import { StatusBadge } from "../components/ui/StatusBadge"; 
import type { Column, Place } from "../types"; 
import { useForm, Controller } from "react-hook-form";

const CATEGORY_OPTIONS = ["ร้านอาหาร", "คาเฟ่", "เสริมสวยอื่นๆ"];

const TABLE_SIZE_OPTIONS = [
  { label: "1-2 คน", value: "1-2 People" },
  { label: "3-4 คน", value: "3-4 People" },
  { label: "5-6 คน", value: "5-6 People" },
  { label: "7-8 คน", value: "7-8 People" },
  { label: "10 คนขึ้นไป", value: "10+ People" },
];

export default function PlaceManagement() {
  const dispatch = useAppDispatch();
  const { places, loading } = useAppSelector((state) => state.places);
  const context = useOutletContext<{ searchQuery: string } | null>();
  const searchQuery = context?.searchQuery || "";

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Inactive">("All");

  const { control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<any>({
    defaultValues: { 
      status: "Inactive", 
      openTime: "10:00", closeTime: "22:00", name: "", branch: "", 
      avgServiceTime: 15, lat: 13.7563, lng: 100.5018, category: "", 
      description: "", phone: "", logoUrl: "", coverUrls: [],
      table_types: [] 
    }
  });

  const selectedTables = watch("table_types") || [];

  useEffect(() => { 
    dispatch(fetchPlaces()); 
  }, [dispatch]);

  const onSubmit = async (data: any) => {
    try {
      const payloadToSave = {
        ...data,
        coverUrl: JSON.stringify(data.coverUrls || [])
      };
      delete payloadToSave.coverUrls;

      if (editingPlace) {
        await dispatch(updatePlaceAsync({ ...editingPlace, ...payloadToSave })).unwrap();
        alert("อัปเดตข้อมูลสำเร็จ!");
      } else {
        const { id, ...newPlaceData } = payloadToSave;
        await dispatch(addPlaceAsync({ ...newPlaceData, status: "Inactive" })).unwrap();
        alert("เพิ่มสถานที่สำเร็จ! (สถานะ: Inactive)");
      }
      
      dispatch(fetchPlaces());
      setIsPanelOpen(false);
      reset();
    } catch (error: any) { 
      alert(error || "Error saving place"); 
    }
  };

  const handleEdit = (place: any) => {
    setEditingPlace(place);
    let parsedCovers: string[] = [];
    try {
      if (place.coverUrl) {
        parsedCovers = JSON.parse(place.coverUrl);
      }
    } catch(e) { parsedCovers = []; }

    const currentTables = (place.TableType || []).map((t: any) => ({
      name: t.name,
      label: t.label,
      capacity: t.capacity
    }));

    reset({ 
      ...place, 
      coverUrls: parsedCovers.filter(Boolean),
      table_types: currentTables 
    });
    setIsPanelOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบสถานที่นี้?")) {
      try {
        await dispatch(deletePlaceAsync(id)).unwrap();
      } catch (error: any) { alert(error || "Delete failed"); }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, onChange: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) { alert("⚠️ ขนาดไฟล์รูปภาพใหญ่เกินไป (สูงสุด 50MB)"); return; }
      const reader = new FileReader();
      reader.onloadend = () => { onChange(reader.result as string); };
      reader.readAsDataURL(file);
    }
    if (e.target) e.target.value = '';
  };

  const displayPlaces = useMemo(() => {
    return (places || []).filter(p => {
      const matchesSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.branch?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "All" || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [places, searchQuery, statusFilter]);

  const currentData = displayPlaces.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // 🌟 จัด Layout ของตารางใหม่ทั้งหมดให้สวยและตรงตามที่ต้องการ
  const columns: Column<Place>[] = [
    { 
      header: "Place Info", 
      key: "info", 
      className: "w-[40%] text-left pl-4", // ชิดซ้าย
      render: (row) => (
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-100 shrink-0 shadow-sm">
            {row.logoUrl ? <img src={row.logoUrl} className="w-full h-full object-cover" alt="logo" /> : <ImageIcon className="text-slate-300" size={20} />}
          </div>
          <div className="flex flex-col">
            <p className="font-bold text-slate-800 text-left text-sm">{row.name}</p>
            <p className="text-xs text-slate-400 text-left mt-0.5">{row.branch}</p>
          </div>
        </div>
      )
    },
    { 
      header: "Category", 
      key: "category", 
      className: "w-[25%] text-center", // จัดให้อยู่กึ่งกลางคอลัมน์
      render: (row) => (
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {row.category ? (
            row.category.split(',').filter(Boolean).map((cat, idx) => (
              <span key={idx} className="text-[11px] font-bold px-3 py-1 bg-slate-50 rounded-lg text-slate-500 border border-slate-200 whitespace-nowrap shadow-sm">
                {cat.trim()}
              </span>
            ))
          ) : (
            <span className="text-slate-300 text-xs">-</span>
          )}
        </div>
      )
    },
    { 
      header: "Status", 
      key: "status", 
      className: "w-[20%] text-center", // จัดให้อยู่กึ่งกลางคอลัมน์
      render: (row) => (
        <div className="flex justify-center">
          <StatusBadge status={row.status} />
        </div>
      ) 
    },
    { 
      header: "Actions", 
      key: "actions", 
      className: "text-right w-[15%] pr-6", // ชิดขวาสุด
      render: (row) => (
        <div className="flex justify-end">
          <Dropdown align="right" trigger={<button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"><MoreHorizontal size={18} /></button>}
            items={[
              { label: "Edit Details", icon: <Edit size={14} />, onClick: () => handleEdit(row) },
              { label: "Delete", icon: <Trash2 size={14} />, className: "text-rose-500", onClick: () => handleDelete(row.id) }
            ]}
          />
        </div>
      )
    }
  ];

  return (
    <div className="p-4 lg:p-10 max-w-[1600px] mx-auto w-full pt-12">
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Filter size={15} /></div>
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value as any); setCurrentPage(1); }}
              className="appearance-none pl-11 pr-10 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-600 outline-none hover:border-[#5AB2A8] focus:ring-4 focus:ring-teal-50 transition-all cursor-pointer shadow-sm"
            >
              <option value="All">All Places</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none"><ChevronDown size={14} /></div>
          </div>
        </div>
        <button onClick={() => { setEditingPlace(null); reset({ status: "Inactive", openTime: "10:00", closeTime: "22:00", name: "", branch: "", avgServiceTime: 15, lat: 13.7563, lng: 100.5018, category: "", description: "", phone: "", logoUrl: "", coverUrls: [], table_types: [] }); setIsPanelOpen(true); }} 
          className="bg-[#5AB2A8] hover:bg-[#4a968d] text-white px-7 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2.5 transition-all shadow-md active:scale-95"
        >
          <Plus size={18} strokeWidth={3}/> New Place
        </button>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
        <Table data={currentData} columns={columns} emptyMessage={loading ? "Loading..." : "No places found."} />
      </div>
      
      {displayPlaces.length > itemsPerPage && (
        <div className="mt-8">
          <Pagination currentPage={currentPage} totalPages={Math.ceil(displayPlaces.length / itemsPerPage)} onChange={setCurrentPage} />
        </div>
      )}

      <SidePanelEdit isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} title={editingPlace ? "Edit Place Information" : "Create New Place"}>
        <div className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <Controller control={control} name="name" rules={{ required: "กรุณากรอกชื่อร้าน" }} render={({ field }) => (
                <Input label="Shop Name" icon={<FileText size={16}/>} {...field} error={errors.name?.message as string} />
              )} />
              <Controller control={control} name="branch" rules={{ required: "กรุณากรอกสาขา" }} render={({ field }) => (
                <Input label="Branch" icon={<MapPin size={16}/>} {...field} error={errors.branch?.message as string} />
              )} />
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Users size={14}/> Table Management
              </label>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {TABLE_SIZE_OPTIONS.map((opt) => {
                  const isSelected = selectedTables.some((t: any) => t.name === opt.value);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setValue("table_types", selectedTables.filter((t: any) => t.name !== opt.value));
                        } else {
                          setValue("table_types", [...selectedTables, { name: opt.value, label: opt.label, capacity: 1 }]);
                        }
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                        isSelected ? "bg-[#5AB2A8] text-white border-[#5AB2A8]" : "bg-white text-slate-500 border-slate-200 hover:border-[#5AB2A8]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-3 mt-4">
                {selectedTables.map((table: any, index: number) => (
                  <div key={table.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                    <span className="text-sm font-bold text-slate-700">{table.label || TABLE_SIZE_OPTIONS.find(o => o.value === table.name)?.label}</span>
                    <div className="flex items-center gap-3">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">จำนวนโต๊ะ:</label>
                      <input 
                        type="number"
                        min="1"
                        value={table.capacity}
                        onChange={(e) => {
                          const newTables = [...selectedTables];
                          newTables[index] = { ...table, capacity: parseInt(e.target.value) || 1 };
                          setValue("table_types", newTables);
                        }}
                        className="w-16 p-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-center outline-none focus:ring-2 focus:ring-[#5AB2A8]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {editingPlace && (
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Operational Status</label>
                <Controller control={control} name="status" render={({ field }) => (
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Activity size={16}/></div>
                    <select {...field} className="appearance-none w-full pl-11 pr-10 py-4 bg-slate-50 border-none rounded-2xl text-sm font-semibold outline-none focus:ring-2 focus:ring-[#5AB2A8] transition-all cursor-pointer">
                      <option value="Active">Active (Open)</option>
                      <option value="Inactive">Inactive (Closed)</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none"><ChevronDown size={14} /></div>
                  </div>
                )} />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Main Category <span className="text-rose-500">*</span></label>
              <Controller control={control} name="category" rules={{ validate: (val) => (val && val.length > 0) || "กรุณาเลือกอย่างน้อย 1 หมวดหมู่" }}
                render={({ field: { onChange, value } }) => {
                  const selectedCats = typeof value === 'string' && value ? value.split(',') : [];
                  return (
                    <div className="flex flex-wrap gap-2">
                      {CATEGORY_OPTIONS.map(cat => (
                        <button type="button" key={cat} onClick={() => onChange(selectedCats.includes(cat) ? selectedCats.filter(c => c !== cat).join(',') : [...selectedCats, cat].join(','))}
                          className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${selectedCats.includes(cat) ? "bg-[#E6FFFA] text-[#38B2AC] border-[#38B2AC]" : "bg-white text-slate-400 border-slate-200 hover:bg-slate-50"}`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  );
                }} 
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Description</label>
              <Controller control={control} name="description" render={({ field }) => (
                <div className="relative">
                  <div className="absolute top-4 left-4 text-slate-400"><AlignLeft size={16}/></div>
                  <textarea {...field} value={field.value || ""} placeholder="Shop description..." className="w-full pl-11 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-semibold outline-none focus:ring-2 focus:ring-[#5AB2A8] min-h-[120px] resize-y transition-all" />
                </div>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Controller control={control} name="openTime" render={({ field }) => <Input label="Open Time" type="time" icon={<Clock size={16}/>} {...field} />} />
              <Controller control={control} name="closeTime" render={({ field }) => <Input label="Close Time" type="time" icon={<Clock size={16}/>} {...field} />} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Controller control={control} name="lat" render={({ field }) => <Input label="Latitude" type="number" step="any" icon={<MapPin size={16}/>} value={field.value} onChange={e => field.onChange(parseFloat(e.target.value))} />} />
              <Controller control={control} name="lng" render={({ field }) => <Input label="Longitude" type="number" step="any" icon={<MapPin size={16}/>} value={field.value} onChange={e => field.onChange(parseFloat(e.target.value))} />} />
            </div>

            <Controller control={control} name="phone" render={({ field: { onChange, value, ...field } }) => (
                <Input label="Contact Phone" icon={<Phone size={16}/>} value={value || ""} maxLength={10} onChange={(e: any) => onChange(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))} {...field} />
            )} />

            <div className="space-y-4 pt-4 border-t border-slate-100">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Visual Assets</label>
              <Controller control={control} name="logoUrl" render={({ field }) => (
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                  <div className="w-16 h-16 rounded-xl bg-white border border-slate-100 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                    {field.value ? <img src={field.value} alt="Logo" className="w-full h-full object-cover" /> : <ImagePlus className="text-slate-200" size={24} />}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-600 mb-1">Logo Image</p>
                    <label className="cursor-pointer inline-flex items-center gap-1.5 text-[11px] font-black text-[#5AB2A8] uppercase tracking-wider px-3 py-2 bg-white rounded-lg shadow-sm border border-slate-100 hover:bg-teal-50 transition-all">
                      <UploadCloud size={14}/> Upload <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, field.onChange)} />
                    </label>
                  </div>
                </div>
              )} />

              <Controller control={control} name="coverUrls" render={({ field }) => {
                const covers: string[] = field.value || [];
                return (
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-xs font-bold text-slate-600">Cover Gallery ({covers.length}/3)</p>
                      {covers.length < 3 && (
                        <label className="cursor-pointer inline-flex items-center gap-1.5 text-[11px] font-black text-[#5AB2A8] uppercase tracking-wider px-3 py-2 bg-white rounded-lg shadow-sm border border-slate-100 hover:bg-teal-50 transition-all">
                          <Plus size={14}/> Add Photo <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, (newUrl) => field.onChange([...covers, newUrl]))} />
                        </label>
                      )}
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-1">
                      {covers.map((url, idx) => (
                        <div key={idx} className="relative w-20 h-20 rounded-xl bg-white border border-slate-100 overflow-hidden shrink-0 group shadow-sm">
                          <img src={url} alt={`Cover ${idx}`} className="w-full h-full object-cover" />
                          <button type="button" onClick={() => { let n = [...covers]; n.splice(idx, 1); field.onChange(n); }} className="absolute top-1 right-1 bg-rose-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={10}/></button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }} />
            </div>
            
            <button type="submit" disabled={loading} className="w-full py-4 bg-[#5AB2A8] hover:bg-[#4a968d] text-white font-black rounded-2xl shadow-lg mt-6 active:scale-95 transition-all disabled:opacity-50 uppercase tracking-widest">
              {loading ? "Processing..." : "Save Information"}
            </button>
          </form>
        </div>
      </SidePanelEdit>
    </div>
  );
}