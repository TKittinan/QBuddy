import { useState, useMemo, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { 
  fetchPlaces, 
  addPlaceAsync, 
  updatePlaceAsync, 
  deletePlaceAsync } from "../redux/placeSlice"; 
import { 
  Plus, MoreHorizontal, Trash2, Edit, Clock, 
  Image as ImageIcon, MapPin, Phone, FileText, 
  ImagePlus, TrendingUp 
} from "lucide-react";
import { Table } from "../components/ui/Table/Table";
import { Dropdown } from "../components/ui/Dropdown";
import { Input } from "../components/ui/Input";
import { Pagination } from "../components/ui/Pagination";
import { SidePanelEdit } from "../components/ui/Tabbar/SidePanelEdit";
import { StatusBadge } from "../components/ui/StatusBadge"; 
import type { Column, Place } from "../types"; 
import { CategorySelect } from "../components/ui/CategorySelect";
import { useForm, Controller } from "react-hook-form";

export default function PlaceManagement() {
  const dispatch = useAppDispatch();
  const { places, loading } = useAppSelector((state) => state.places);
  const context = useOutletContext<{ searchQuery: string } | null>();
  const searchQuery = context?.searchQuery || "";

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const { control, handleSubmit, reset } = useForm<Place>({
    defaultValues: { 
      status: "Active", openTime: "10:00", closeTime: "22:00", name: "", branch: "", tags: [], 
      avgServiceTime: 15, lat: 13.7563, lng: 100.5018, category: "General", 
      monthlyBookings: 0
    }
  });

  // 1. ดึงข้อมูลผ่าน Redux Thunk
  useEffect(() => { 
    dispatch(fetchPlaces()); 
  }, [dispatch]);

  // 2. บันทึกข้อมูล (Add/Update) ผ่าน Thunk
  const onSubmit = async (data: Place) => {
    try {
      if (editingPlace) {
        // อัปเดตข้อมูลที่มีอยู่
        await dispatch(updatePlaceAsync(data)).unwrap();
      } else {
        // เพิ่มที่ใหม่ (ตัด id ออกถ้า Backend เจนให้เอง)
        const { id, ...newPlaceData } = data;
        await dispatch(addPlaceAsync(newPlaceData)).unwrap();
      }
      
      setIsPanelOpen(false);
      reset();
    } catch (error: any) { 
      alert(error || "Error saving place"); 
    }
  };

  // 3. ลบข้อมูลผ่าน Thunk
  const handleDelete = async (id: string) => {
    if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบสถานที่นี้?")) {
      try {
        await dispatch(deletePlaceAsync(id)).unwrap();
      } catch (error: any) {
        alert(error || "Delete failed");
      }
    }
  };

  const handleEdit = (place: Place) => {
    setEditingPlace(place);
    reset(place);
    setIsPanelOpen(true);
  };

  const displayPlaces = useMemo(() => {
    return places.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.branch.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [places, searchQuery]);

  const currentData = displayPlaces.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const columns: Column<Place>[] = [
    { header: "Place Info", key: "info", className: "w-[30%]", render: (row) => (
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
          {row.logoUrl ? <img src={row.logoUrl} className="w-full h-full object-cover" alt="logo" /> : <ImageIcon className="text-slate-400" size={20} />}
        </div>
        <div><p className="font-bold text-slate-800">{row.name}</p><p className="text-xs text-slate-400">{row.branch}</p></div>
      </div>
    )},
    { header: "Trending Score", key: "trending", className: "w-[15%]", render: (row) => (
      <div className="flex items-center gap-1.5"><TrendingUp size={14} className="text-amber-500"/><span className="text-sm font-bold text-slate-700">{row.monthlyBookings || 0}</span></div>
    )},
    { header: "Status", key: "status", className: "w-[15%]", render: (row) => <StatusBadge status={row.status} /> },
    { header: "Actions", key: "actions", className: "text-right w-[10%]", render: (row) => (
      <Dropdown align="right" trigger={<button className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"><MoreHorizontal size={18} /></button>}
        items={[
          { label: "Edit Details", icon: <Edit size={16} />, onClick: () => handleEdit(row) },
          { label: "Delete", icon: <Trash2 size={16} />, className: "text-rose-600", onClick: () => handleDelete(row.id) }
        ]}
      />
    )}
  ];

  return (
    <div className="p-4 lg:p-8 max-w-[1600px] mx-auto w-full pt-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">Place Management</h2>
        <button 
          onClick={() => { setEditingPlace(null); reset(); setIsPanelOpen(true); }} 
          className="bg-[#5AB2A8] hover:bg-[#4a968d] text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg transition-all"
        >
          <Plus size={16}/> New Place
        </button>
      </div>

      {loading ? (
        <p className="text-center py-10 text-slate-500">Loading places...</p>
      ) : (
        <>
          <Table data={currentData} columns={columns} emptyMessage="No places found." />
          <Pagination 
            currentPage={currentPage} 
            totalPages={Math.ceil(displayPlaces.length / itemsPerPage)} 
            onChange={setCurrentPage} 
          />
        </>
      )}

      <SidePanelEdit 
        isOpen={isPanelOpen} 
        onClose={() => setIsPanelOpen(false)} 
        title={editingPlace ? "Edit Place" : "Create New Place"}
      >
        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Form Fields เหมือนเดิม... */}
            <div className="grid grid-cols-2 gap-4">
              <Controller control={control} name="name" render={({ field }) => <Input label="Shop Name" icon={<FileText size={16}/>} {...field} />} />
              <Controller control={control} name="branch" render={({ field }) => <Input label="Branch" icon={<MapPin size={16}/>} {...field} />} />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Main Category</label>
              <Controller control={control} name="category" render={({ field }) => (
                <CategorySelect value={field.value} onChange={field.onChange} />
              )} />
            </div>

            <Controller control={control} name="monthlyBookings" render={({ field }) => (
              <Input label="Monthly Bookings (ยอดจองรายเดือน)" type="number" icon={<TrendingUp size={16}/>} value={field.value} onChange={e => field.onChange(parseInt(e.target.value) || 0)} />
            )} />

            <div className="grid grid-cols-2 gap-4">
              <Controller control={control} name="openTime" render={({ field }) => <Input label="Open" type="time" icon={<Clock size={16}/>} {...field} />} />
              <Controller control={control} name="closeTime" render={({ field }) => <Input label="Close" type="time" icon={<Clock size={16}/>} {...field} />} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Controller control={control} name="lat" render={({ field }) => <Input label="Latitude" type="number" step="any" icon={<MapPin size={16}/>} value={field.value} onChange={e => field.onChange(parseFloat(e.target.value))} />} />
              <Controller control={control} name="lng" render={({ field }) => <Input label="Longitude" type="number" step="any" icon={<MapPin size={16}/>} value={field.value} onChange={e => field.onChange(parseFloat(e.target.value))} />} />
            </div>

            <Controller control={control} name="phone" render={({ field }) => <Input label="Contact Phone" icon={<Phone size={16}/>} {...field} value={field.value || ""} />} />
            <Controller control={control} name="logoUrl" render={({ field }) => <Input label="Logo Image URL" icon={<ImagePlus size={16}/>} {...field} value={field.value || ""} />} />
            
            <button type="submit" className="w-full py-3.5 bg-[#5AB2A8] hover:bg-[#4a968d] text-white font-bold rounded-xl shadow-lg mt-4 active:scale-[0.98] transition-all">Save Information</button>
          </form>
        </div>
      </SidePanelEdit>
    </div>
  );
}