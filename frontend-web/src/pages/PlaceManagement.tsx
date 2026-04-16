import { useState, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../redux/Reduxindex";
import { addPlace, updatePlace, deletePlace } from "../redux/placeSlice";
import { Plus, MoreHorizontal, ChevronDown, CheckCircle2, Trash2, Edit, Clock, Image as ImageIcon } from "lucide-react";
import { Table } from "../components/ui/Table/Table";
import { Button } from "../components/ui/Button";
import { Dropdown } from "../components/ui/Dropdown";
import { Pagination } from "../components/ui/Pagination";
import { SidePanelEdit } from "../components/ui/Tabbar/SidePanelEdit";
import { StatusBadge } from "../components/ui/StatusBadge"; 
import type { Column, Place } from "../types";
import { CategorySelect, CATEGORY_LIST } from "../components/ui/CategorySelect";
import { checkIsShopOpen } from "../utils/timeUtils"; 
import { generateShopPrefix } from "../utils/queueUtils"; 

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const placeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  branch: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  phone: z.string().optional(),
  address: z.string().optional(),
  openTime: z.string(),
  closeTime: z.string(),
  status: z.enum(["Active", "Disabled", "Inactive"])
});

type PlaceFormData = z.infer<typeof placeSchema>;

export default function PlaceManagement() {
  const dispatch = useDispatch();
  const places = useSelector((state: RootState) => state.places.places);
  const context = useOutletContext<{ searchQuery: string } | null>();
  const searchQuery = context?.searchQuery || "";

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const { control, handleSubmit, reset, formState: { errors } } = useForm<PlaceFormData>({
    resolver: zodResolver(placeSchema),
    defaultValues: { status: "Active", openTime: "10:00", closeTime: "22:00", category: "ร้านอาหาร" }
  });

  const displayPlaces = useMemo(() => {
    let result = [...places];
    if (searchQuery) {
      result = result.filter((p: Place) => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.placeId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return result;
  }, [places, searchQuery]);

  const totalPages = Math.ceil(displayPlaces.length / itemsPerPage);
  const currentData = displayPlaces.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleEdit = (place: Place) => {
    setEditingPlace(place);
    reset({
      name: place.name,
      branch: place.branch || "",
      category: place.category || CATEGORY_LIST[0],
      phone: place.phone || "",
      address: place.address || "",
      openTime: place.openTime,
      closeTime: place.closeTime,
      status: place.status as "Active" | "Disabled" | "Inactive"
    });
    setIsPanelOpen(true);
  };

  const handleAddNew = () => {
    setEditingPlace(null);
    reset({ name: "", branch: "", phone: "", address: "", status: "Active", openTime: "10:00", closeTime: "22:00", category: "ร้านอาหาร" });
    setIsPanelOpen(true);
  };

  const onSubmit = (data: PlaceFormData) => {
    const formattedName = data.branch ? `${data.name} (${data.branch})` : data.name;
    
    if (editingPlace) {
      const updated: Place = { 
        ...editingPlace, 
        ...data, 
        name: formattedName, 
        branch: data.branch || "",
        category: data.category
      };
      dispatch(updatePlace(updated));
    } else {
      const prefix = generateShopPrefix(formattedName, data.category);
      const newPlaceId = `#${prefix}-00${Math.floor(Math.random() * 9) + 1}`; 
      
      const newPlace: Place = {
        id: Date.now().toString(),
        placeId: newPlaceId,
        name: formattedName,
        branch: data.branch || "",
        category: data.category,
        tags: [data.category],
        phone: data.phone,
        address: data.address,
        openTime: data.openTime,
        closeTime: data.closeTime,
        status: data.status as "Active" | "Disabled" | "Inactive",
        queueCount: 0,
        avgServiceTime: 15,
        lat: 13.75, 
        lng: 100.5, 
        createdAt: new Date().toISOString()
      };
      dispatch(addPlace(newPlace));
    }
    setIsPanelOpen(false);
  };

  const columns: Column<Place>[] = [
    { 
      header: "Place Info", 
      key: "info",
      render: (row) => (
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
            {row.logoUrl ? <img src={row.logoUrl} alt="Logo" className="w-full h-full object-cover" /> : <ImageIcon className="text-slate-400" size={20} />}
          </div>
          <div>
            <p className="font-bold text-slate-800">{row.name}</p>
            <p className="text-xs text-slate-500 mt-0.5">{row.placeId}</p>
          </div>
        </div>
      )
    },
    { 
      header: "Category", 
      key: "category",
      render: (row) => <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-semibold">{row.category}</span>
    },
    { 
      header: "Operating Hours", 
      key: "time",
      render: (row) => {
        const isOpen = checkIsShopOpen(row.openTime, row.closeTime);
        return (
          <div>
            <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
              <Clock size={14} className={isOpen ? "text-emerald-500" : "text-slate-400"} />
              {row.openTime} - {row.closeTime}
            </div>
            <p className={`text-[10px] font-bold mt-1 ${isOpen ? "text-emerald-500" : "text-rose-500"}`}>
              {isOpen ? "OPEN NOW" : "CLOSED"}
            </p>
          </div>
        );
      }
    },
    { 
      header: "Status", 
      key: "status",
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: "Actions",
      key: "actions",
      className: "text-right",
      render: (row) => (
        <Dropdown 
          align="right"
          trigger={<button className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg"><MoreHorizontal size={18} /></button>}
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
    <div className="p-4 lg:p-8 max-w-[1600px] mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Place Management</h1>
          <p className="text-sm text-slate-500 mt-1">Manage branches, categories, and business hours</p>
        </div>
        <Button onClick={handleAddNew} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-100"><Plus size={16} className="mr-2" /> Add New Place</Button>
      </div>

      <Table data={currentData} columns={columns} emptyMessage="No places found." />
      <Pagination currentPage={currentPage} totalPages={totalPages} onChange={setCurrentPage} />

      <SidePanelEdit isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} title={editingPlace ? "Edit Place" : "Add New Place"}>
        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800 border-b pb-2">Basic Information</h3>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Place Name</label>
                <Controller control={control} name="name" render={({ field: { onChange, value } }) => (
                  <input type="text" value={value} onChange={onChange} className={`w-full pl-4 pr-4 py-3 bg-slate-50 border ${errors.name ? 'border-red-400' : 'border-slate-200'} rounded-xl text-sm outline-none focus:ring-2`} />
                )} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Branch (Optional)</label>
                <Controller control={control} name="branch" render={({ field: { onChange, value } }) => (
                  <input type="text" value={value} onChange={onChange} placeholder="e.g. Siam Paragon" className="w-full pl-4 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" />
                )} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Category</label>
                <Controller control={control} name="category" render={({ field: { onChange, value } }) => (
                   <CategorySelect selectedCategories={[value]} onChange={(cats) => onChange(cats[0] || CATEGORY_LIST[0])} />
                )} />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800 border-b pb-2">Operations</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase block">Open Time</label>
                  <Controller control={control} name="openTime" render={({ field: { onChange, value } }) => (
                    <div className="relative">
                      <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="time" value={value} onChange={onChange} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" />
                    </div>
                  )} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase block">Close Time</label>
                  <Controller control={control} name="closeTime" render={({ field: { onChange, value } }) => (
                    <div className="relative">
                      <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="time" value={value} onChange={onChange} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" />
                    </div>
                  )} />
                </div>
              </div>
              
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Status</label>
                <Controller control={control} name="status" render={({ field: { onChange, value } }) => (
                  <div className="relative">
                    <select value={value} onChange={onChange} className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm appearance-none outline-none">
                      <option value="Active">Active</option>
                      <option value="Disabled">Disabled</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                )} />
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100">
              <Button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-100">
                <CheckCircle2 size={18} className="mr-2" /> {editingPlace ? "Save Changes" : "Create Place"}
              </Button>
            </div>
          </form>
        </div>
      </SidePanelEdit>
    </div>
  );
}