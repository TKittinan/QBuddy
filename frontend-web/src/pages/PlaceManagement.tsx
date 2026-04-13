import { useState, useMemo, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../redux/Reduxindex";
import { addPlace, updatePlace, deletePlace, type Place } from "../redux/placeSlice";
import { Plus, MapPin, MoreHorizontal, ChevronDown, Building2, CheckCircle2, Trash2, Edit, Phone, Map, Clock, Image as ImageIcon, Upload } from "lucide-react";
import { Table } from "../components/ui/Table/Table";
import { Button } from "../components/ui/Button";
import { Dropdown } from "../components/ui/Dropdown";
import { Pagination } from "../components/ui/Pagination";
import { SidePanelEdit } from "../components/ui/Tabbar/SidePanelEdit";
import { Input } from "../components/ui/Input"; 
import { Status } from "../components/ui/Status";
import type { Column } from "../types";
import { generateShopId } from "../utils/generateShopId";
import { CategorySelect, CATEGORY_LIST } from "../components/ui/CategorySelect";

// 🌟 นำเข้า useForm และ Zod
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// 🌟 กำหนด Schema กฎเหล็กในการกรอกฟอร์ม
const placeSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อร้าน"),
  branch: z.string().optional(),
  categories: z.array(z.string()).min(1, "กรุณาเลือกหมวดหมู่อย่างน้อย 1 อย่าง"),
  description: z.string().min(1, "กรุณากรอกรายละเอียด"),
  phone: z.string().length(10, "เบอร์โทรศัพท์ต้องมี 10 หลัก"),
  address: z.string().min(1, "กรุณากรอกที่อยู่"),
  latitude: z.string().min(1, "จำเป็น"),
  longitude: z.string().min(1, "จำเป็น"),
  openTime: z.string().min(1, "ระบุเวลา"),
  closeTime: z.string().min(1, "ระบุเวลา"),
  logoUrl: z.string().optional(),
  coverUrl: z.string().optional(),
  status: z.enum(["Active", "Disabled"])
});

type PlaceFormData = z.infer<typeof placeSchema>;

// ค่าเริ่มต้นสำหรับฟอร์มเปล่าๆ
const defaultFormValues: PlaceFormData = {
  name: "", branch: "", categories: [], description: "", phone: "",
  address: "", latitude: "", longitude: "", openTime: "09:00", closeTime: "20:00",
  logoUrl: "", coverUrl: "", status: "Disabled"
};

export default function PlaceManagement() {
  const dispatch = useDispatch();
  const places = useSelector((state: RootState) => state.places.places);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All"); 

  const context = useOutletContext<{ searchQuery: string }>();
  const searchQuery = context?.searchQuery || "";

  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [isAddPanelOpen, setIsAddPanelOpen] = useState(false);

  // 🌟 ติดตั้ง useForm 
  const { control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<PlaceFormData>({
    resolver: zodResolver(placeSchema),
    defaultValues: defaultFormValues,
    mode: "onChange"
  });

  const currentLogoUrl = watch("logoUrl");
  const currentCoverUrl = watch("coverUrl");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: "logoUrl" | "coverUrl") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const tempLocalUrl = URL.createObjectURL(file);
    setValue(fieldName, tempLocalUrl, { shouldValidate: true, shouldDirty: true });
  };

  const handleOpenAdd = () => {
    reset(defaultFormValues);
    setIsAddPanelOpen(true);
  };

  const handleEditClick = (place: Place) => {
    setEditingPlace(place);
    reset({
      name: place.name.split(" (")[0], 
      branch: place.branch || "",
      address: place.address,
      status: place.status as "Active" | "Disabled",
      categories: place.categories || [],
      description: place.description || "",
      phone: place.phone || "",
      latitude: place.latitude || "",
      longitude: place.longitude || "",
      openTime: place.openTime || "09:00",
      closeTime: place.closeTime || "20:00",
      logoUrl: place.logoUrl || "",
      coverUrl: place.coverUrl || ""
    });
  };

  // =====================================================================
  // 🌟 ศูนย์กลางการ Save (แก้ปัญหา ID ชนกันที่นี่)
  // =====================================================================
  const onSubmit = (data: PlaceFormData) => {
    if (isAddPanelOpen) {
      // --- ADD MODE ---
      const generatedData = generateShopId(data.name, data.branch || "", data.categories, places);
      
      const newPlace: Place = {
        id: `sys_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`, 
        placeId: generatedData.displayId, 
        name: generatedData.fullName, 
        branch: data.branch?.trim() || "",
        address: data.address.trim(),
        status: data.status, 
        queueCount: 0,
        categories: data.categories,
        description: data.description.trim(),
        phone: data.phone.trim(),
        latitude: data.latitude.trim(),
        longitude: data.longitude.trim(),
        openTime: data.openTime,
        closeTime: data.closeTime,
        avgServiceTime: 15,
        createdAt: new Date().toISOString(),
        logoUrl: data.logoUrl || "", 
        coverUrl: data.coverUrl || "" 
      };

      dispatch(addPlace(newPlace));
      setIsAddPanelOpen(false);

    } else if (editingPlace) {
      // --- EDIT MODE ---
      let newDisplayId = editingPlace.placeId;
      let newFullName = editingPlace.name;

      // 🌟 แก้ไข: ถอด .sort() ออก เพื่อให้ถ้าแอดมินสลับลำดับแท็ก ถือว่าหมวดหมู่เปลี่ยนทันที!
      const oldCategoriesStr = JSON.stringify(editingPlace.categories || []);
      const newCategoriesStr = JSON.stringify(data.categories || []);
      const isCategoryChanged = oldCategoriesStr !== newCategoriesStr;

      if (
        data.name.trim() !== editingPlace.name.split(" (")[0] || 
        data.branch?.trim() !== (editingPlace.branch || "") ||
        isCategoryChanged
      ) {
        const otherPlaces = places.filter(p => p.id !== editingPlace.id);
        const generated = generateShopId(data.name, data.branch || "", data.categories, otherPlaces);
        newDisplayId = generated.displayId;
        newFullName = generated.fullName;
      }

      dispatch(updatePlace({
        ...editingPlace, 
        name: newFullName, 
        branch: data.branch?.trim() || "", 
        address: data.address.trim(), 
        status: data.status, 
        id: editingPlace.id, 
        placeId: newDisplayId, 
        categories: data.categories,
        description: data.description.trim(), 
        phone: data.phone.trim(), 
        latitude: data.latitude.trim(), 
        longitude: data.longitude.trim(), 
        openTime: data.openTime, 
        closeTime: data.closeTime,
        logoUrl: data.logoUrl || "", 
        coverUrl: data.coverUrl || "" 
      }));

      setEditingPlace(null);
    }
  };

  const handleDeletePlace = (id: string) => {
    if (confirm("Are you sure you want to delete this place?")) {
      dispatch(deletePlace(id));
    }
  };

  // =====================================================================
  // การจัดการตาราง
  // =====================================================================
  const filteredData = useMemo(() => {
    let result = [...places];
    if (statusFilter !== "All") result = result.filter(p => p.status === statusFilter);
    if (categoryFilter !== "All") result = result.filter(p => p.categories?.includes(categoryFilter));
    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(lowerQ) || p.placeId.toLowerCase().includes(lowerQ));
    }
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return result;
  }, [places, statusFilter, categoryFilter, searchQuery]);

  useEffect(() => { setCurrentPage(1); }, [statusFilter, categoryFilter, searchQuery, places.length]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const columns: Column<Place>[] = [
    { header: "PLACE NAME", key: "name", className: "text-left w-[25%]", render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200 overflow-hidden shrink-0">
            {item.logoUrl ? <img src={item.logoUrl} alt={item.name} className="w-full h-full object-cover" /> : <Building2 size={18} className="text-slate-400" />}
          </div>
          <div className="text-left"><p className="font-bold text-slate-800 text-sm">{item.name}</p><p className="text-[10px] font-medium text-slate-400">ID: {item.placeId}</p></div>
        </div>
      )
    },
    { header: "CATEGORY", key: "categories", className: "text-left w-[20%]", render: (item) => (
        <div className="flex flex-wrap gap-1">
          {item.categories?.map((cat, idx) => (
            <span key={idx} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-md text-[10px] font-bold">{cat}</span>
          ))}
        </div>
      )
    },
    { header: "ADDRESS", key: "address", className: "text-left w-[20%]", render: (item) => (
        <div className="flex items-center justify-start gap-2 text-slate-500 max-w-[200px] lg:max-w-xs"><MapPin size={14} className="shrink-0" /><span className="text-xs truncate">{item.address}</span></div>
      )
    },
    { header: "STATUS", key: "status", className: "text-center w-[15%]", render: (item) => (
        <div className="flex justify-center"><Status status={item.status} /></div>
      )
    },
    { header: "QUEUE", key: "queueCount", className: "text-center w-[10%]", render: (item) => (
        <div className="flex justify-center"><span className="inline-block px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg font-bold text-slate-700 text-xs min-w-[32px] text-center">{item.queueCount}</span></div>
      )
    },
    { header: "ACTIONS", key: "id", className: "text-right w-[10%]", render: (item) => (
        <div className="flex justify-end">
          <Dropdown align="right" trigger={<button className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><MoreHorizontal size={18} /></button>}
            items={[
              { label: "Edit Place", icon: <Edit size={16} />, onClick: () => handleEditClick(item) },
              { label: "Delete", icon: <Trash2 size={16} />, className: "text-red-600", divider: true, onClick: () => handleDeletePlace(item.id) }
            ]}
          />
        </div>
      )},
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Dropdown align="left" trigger={<Button variant="outline" className="bg-white min-w-[140px] flex items-center justify-between whitespace-nowrap shadow-sm"><span className="font-medium text-slate-600">Status: {statusFilter}</span> <ChevronDown size={14} className="ml-2 text-slate-400 shrink-0" /></Button>} 
            items={[{ label: "All Status", onClick: () => setStatusFilter("All") }, { label: "Active", onClick: () => setStatusFilter("Active") }, { label: "Disabled", onClick: () => setStatusFilter("Disabled") }]} 
          />
          <Dropdown align="left" trigger={<Button variant="outline" className="bg-white min-w-[160px] flex items-center justify-between whitespace-nowrap shadow-sm"><span className="font-medium text-slate-600">Category: {categoryFilter}</span> <ChevronDown size={14} className="ml-2 text-slate-400 shrink-0" /></Button>} 
            items={[{ label: "All Categories", onClick: () => setCategoryFilter("All") }, ...CATEGORY_LIST.map(cat => ({ label: cat, onClick: () => setCategoryFilter(cat) }))]}
          />
        </div>
        <Button className="bg-[#5AB2A8] hover:bg-[#4a968d] text-white shadow-lg flex items-center justify-center gap-2 px-6" onClick={handleOpenAdd}><Plus size={18} /> New Place</Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
        <Table data={paginatedData} columns={columns} />
        <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={filteredData.length} itemsPerPage={itemsPerPage} onChange={setCurrentPage} />
      </div>

      {/* ========================================================== */}
      {/* 🌟 NEW PLACE PANEL */}
      {/* ========================================================== */}
      <SidePanelEdit isOpen={isAddPanelOpen} onClose={() => setIsAddPanelOpen(false)} title="Add New Place"
        footer={<button onClick={handleSubmit(onSubmit)} className="w-full flex items-center justify-center gap-2 py-4 bg-[#5AB2A8] rounded-2xl text-white font-bold hover:bg-[#4a968d] shadow-lg shadow-teal-100 transition-all active:scale-[0.98]"><Plus size={18} /> Create Place</button>}
      >
        <div className="space-y-6 pb-6">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Basic Information</h4>
          <div className="space-y-4">
            <Controller control={control} name="name" render={({ field: { onChange, value } }) => (
              <div><Input label="Place Name" icon={<Building2 size={16} />} type="text" value={value} onChange={onChange} placeholder="e.g. QBuddy Cafe" className={`bg-slate-50 border-slate-200 py-2.5 ${errors.name ? 'border-red-400' : ''}`} maxLength={40} />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}</div>
            )}/>
            
            <Controller control={control} name="branch" render={({ field: { onChange, value } }) => (
              <Input label="Branch (Optional)" icon={<MapPin size={16} />} type="text" value={value} onChange={onChange} placeholder="e.g. Mega Bangna" className="bg-slate-50 border-slate-200 py-2.5" maxLength={40} />
            )}/>

            <div className="space-y-2 pt-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Categories</label>
              <Controller control={control} name="categories" render={({ field: { onChange, value } }) => (
                <div><CategorySelect selectedCategories={value} onChange={onChange} />
                {errors.categories && <p className="text-xs text-red-500 mt-1">{errors.categories.message}</p>}</div>
              )}/>
            </div>

            <div className="space-y-2 pt-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Description</label>
              <Controller control={control} name="description" render={({ field: { onChange, value } }) => (
                <div><textarea value={value} onChange={onChange} placeholder="รายละเอียดสถานที่เบื้องต้น..." className={`w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#5AB2A8] outline-none min-h-[80px] ${errors.description ? 'border-red-400' : ''}`} />
                {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}</div>
              )}/>
            </div>
          </div>
          
          <div className="h-px w-full bg-slate-100 my-6"></div>
          
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Media & Images</h4>
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Logo Image</label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                  {currentLogoUrl ? <img src={currentLogoUrl} alt="Logo" className="w-full h-full object-cover" /> : <ImageIcon className="text-slate-400" size={24} />}
                </div>
                <div className="flex-1">
                  <input type="file" id="addLogo" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, "logoUrl")} />
                  <label htmlFor="addLogo" className="inline-flex items-center justify-center px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-sm"><Upload size={16} className="mr-2 text-slate-400" /> Upload Logo</label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Cover Image</label>
              <div className="flex flex-col gap-3">
                <div className="w-full h-32 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                  {currentCoverUrl ? <img src={currentCoverUrl} alt="Cover" className="w-full h-full object-cover" /> : <ImageIcon className="text-slate-400" size={32} />}
                </div>
                <div>
                  <input type="file" id="addCover" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, "coverUrl")} />
                  <label htmlFor="addCover" className="inline-flex items-center justify-center px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-sm"><Upload size={16} className="mr-2 text-slate-400" /> Upload Cover</label>
                </div>
              </div>
            </div>
          </div>

          <div className="h-px w-full bg-slate-100 my-6"></div>

          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Contact & Location</h4>
          <div className="space-y-4">
            <Controller control={control} name="phone" render={({ field: { onChange, value } }) => (
              <div><Input label="Phone Number" icon={<Phone size={16} />} type="tel" value={value} onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 10))} className={`bg-slate-50 border-slate-200 py-2.5 ${errors.phone ? 'border-red-400' : ''}`} maxLength={10}/>
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}</div>
            )}/>
            
            <Controller control={control} name="address" render={({ field: { onChange, value } }) => (
              <div><Input label="Full Address" icon={<MapPin size={16} />} type="text" value={value} onChange={onChange} className={`bg-slate-50 border-slate-200 py-2.5 ${errors.address ? 'border-red-400' : ''}`} />
              {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address.message}</p>}</div>
            )}/>

            <div className="grid grid-cols-2 gap-4">
              <Controller control={control} name="latitude" render={({ field: { onChange, value } }) => (
                <div><Input label="Latitude" icon={<Map size={16} />} type="number" value={value} onChange={onChange} className="bg-slate-50 border-slate-200 py-2.5" />
                {errors.latitude && <p className="text-xs text-red-500 mt-1">{errors.latitude.message}</p>}</div>
              )}/>
              <Controller control={control} name="longitude" render={({ field: { onChange, value } }) => (
                <div><Input label="Longitude" icon={<Map size={16} />} type="number" value={value} onChange={onChange} className="bg-slate-50 border-slate-200 py-2.5" />
                {errors.longitude && <p className="text-xs text-red-500 mt-1">{errors.longitude.message}</p>}</div>
              )}/>
            </div>
          </div>

          <div className="h-px w-full bg-slate-100 my-6"></div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Operating Hours</h4>
          <div className="grid grid-cols-2 gap-4">
            <Controller control={control} name="openTime" render={({ field: { onChange, value } }) => (
              <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase block">Open Time</label>
              <div className="relative"><div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Clock size={16} /></div><input type="time" value={value} onChange={onChange} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" /></div></div>
            )}/>
            <Controller control={control} name="closeTime" render={({ field: { onChange, value } }) => (
              <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase block">Close Time</label>
              <div className="relative"><div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Clock size={16} /></div><input type="time" value={value} onChange={onChange} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" /></div></div>
            )}/>
          </div>
        </div>
      </SidePanelEdit>

      {/* ========================================================== */}
      {/* 🌟 EDIT PLACE PANEL */}
      {/* ========================================================== */}
      <SidePanelEdit isOpen={!!editingPlace} onClose={() => setEditingPlace(null)} title="Edit Place Details"
        footer={<button onClick={handleSubmit(onSubmit)} className="w-full flex items-center justify-center gap-2 py-4 bg-[#5AB2A8] rounded-2xl text-white font-bold hover:bg-[#4a968d] shadow-lg shadow-teal-100 transition-all active:scale-[0.98]"><CheckCircle2 size={18} /> Save Changes</button>}
      >
        {editingPlace && (
          <>
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-20 h-20 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200 overflow-hidden mb-3 shadow-sm relative group">
                {currentLogoUrl ? <img src={currentLogoUrl} alt="Logo" className="w-full h-full object-cover" /> : <Building2 size={32} className="text-slate-300" />}
                <label htmlFor="fastEditLogo" className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity"><Edit size={20} className="text-white" /></label>
                <input type="file" id="fastEditLogo" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, "logoUrl")} />
              </div>
              <h3 className="text-2xl font-bold text-slate-800">{editingPlace.name}</h3><p className="text-slate-500 text-sm mt-1 font-medium">{editingPlace.placeId}</p>
            </div>
            
            <div className="space-y-6 pb-6">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Basic Information</h4>
              <div className="space-y-4">
                <Controller control={control} name="name" render={({ field: { onChange, value } }) => (
                  <div><Input label="Place Name" icon={<Building2 size={16} />} type="text" value={value} onChange={onChange} className={`bg-slate-50 border-slate-200 py-2.5 ${errors.name ? 'border-red-400' : ''}`} maxLength={40} />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}</div>
                )}/>
                <Controller control={control} name="branch" render={({ field: { onChange, value } }) => (
                  <Input label="Branch (Optional)" icon={<MapPin size={16} />} type="text" value={value} onChange={onChange} className="bg-slate-50 border-slate-200 py-2.5" maxLength={40} />
                )}/>
                <div className="space-y-2 pt-1"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Categories</label>
                  <Controller control={control} name="categories" render={({ field: { onChange, value } }) => (
                    <div><CategorySelect selectedCategories={value} onChange={onChange} />
                    {errors.categories && <p className="text-xs text-red-500 mt-1">{errors.categories.message}</p>}</div>
                  )}/>
                </div>
                <div className="space-y-2 pt-1"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Description</label>
                  <Controller control={control} name="description" render={({ field: { onChange, value } }) => (
                    <div><textarea value={value} onChange={onChange} className={`w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm min-h-[80px] ${errors.description ? 'border-red-400' : ''}`} />
                    {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}</div>
                  )}/>
                </div>
              </div>
              
              <div className="h-px w-full bg-slate-100 my-6"></div>
              
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Media & Images</h4>
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Logo Image</label>
                  <div className="flex flex-col gap-3">
                    <input type="file" id="editLogo" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, "logoUrl")} />
                    <label htmlFor="editLogo" className="inline-flex items-center justify-center px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 cursor-pointer shadow-sm"><Upload size={16} className="mr-2 text-slate-400" /> Change Logo</label>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Cover Image</label>
                  <div className="flex flex-col gap-3">
                    <div className="w-full h-32 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                      {currentCoverUrl ? <img src={currentCoverUrl} alt="Cover" className="w-full h-full object-cover" /> : <ImageIcon className="text-slate-400" size={32} />}
                    </div>
                    <input type="file" id="editCover" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, "coverUrl")} />
                    <label htmlFor="editCover" className="inline-flex items-center justify-center px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 cursor-pointer shadow-sm"><Upload size={16} className="mr-2 text-slate-400" /> Change Cover</label>
                  </div>
                </div>
              </div>

              <div className="h-px w-full bg-slate-100 my-6"></div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Contact & Location</h4>
              <div className="space-y-4">
                <Controller control={control} name="phone" render={({ field: { onChange, value } }) => (
                  <div><Input label="Phone Number" icon={<Phone size={16} />} type="tel" value={value} onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 10))} className={`bg-slate-50 border-slate-200 py-2.5 ${errors.phone ? 'border-red-400' : ''}`} maxLength={10}/>
                  {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}</div>
                )}/>
                <Controller control={control} name="address" render={({ field: { onChange, value } }) => (
                  <div><Input label="Full Address" icon={<MapPin size={16} />} type="text" value={value} onChange={onChange} className={`bg-slate-50 border-slate-200 py-2.5 ${errors.address ? 'border-red-400' : ''}`} />
                  {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address.message}</p>}</div>
                )}/>
                <div className="grid grid-cols-2 gap-4">
                  <Controller control={control} name="latitude" render={({ field: { onChange, value } }) => (
                    <div><Input label="Latitude" icon={<Map size={16} />} type="number" value={value} onChange={onChange} className="bg-slate-50 border-slate-200 py-2.5" /></div>
                  )}/>
                  <Controller control={control} name="longitude" render={({ field: { onChange, value } }) => (
                    <div><Input label="Longitude" icon={<Map size={16} />} type="number" value={value} onChange={onChange} className="bg-slate-50 border-slate-200 py-2.5" /></div>
                  )}/>
                </div>
              </div>

              <div className="h-px w-full bg-slate-100 my-6"></div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Operating & Status</h4>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Controller control={control} name="openTime" render={({ field: { onChange, value } }) => (
                    <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase block">Open Time</label><div className="relative"><div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Clock size={16} /></div><input type="time" value={value} onChange={onChange} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" /></div></div>
                  )}/>
                  <Controller control={control} name="closeTime" render={({ field: { onChange, value } }) => (
                    <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase block">Close Time</label><div className="relative"><div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Clock size={16} /></div><input type="time" value={value} onChange={onChange} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" /></div></div>
                  )}/>
                </div>
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">System Status</label>
                  <Controller control={control} name="status" render={({ field: { onChange, value } }) => (
                    <div className="relative">
                      <select value={value} onChange={onChange} className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 appearance-none">
                        <option value="Active">Active</option>
                        <option value="Disabled">Disabled</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  )}/>
                </div>
              </div>
            </div>
          </>
        )}
      </SidePanelEdit>
    </div>
  );
}