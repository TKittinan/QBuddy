import { useState, useMemo, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { 
  Plus, MapPin, MoreHorizontal, ChevronDown, 
  Building2, CheckCircle2, Trash2, Edit, Phone, Map, Clock
} from "lucide-react";
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

export type Place = {
  id: string;        
  placeId: string;   
  name: string;
  address: string;
  status: "Active" | "Disabled";
  queueCount: number; 
  categories: string[]; 
  description: string;
  phone: string;
  latitude: string;
  longitude: string;
  openTime: string;
  closeTime: string;
  avgServiceTime: number; 
  createdAt: string;
  branch?: string; 
};

const defaultPlaces: Place[] = [
  { 
    id: "SC1", placeId: "#SC-001", name: "Seoul Chon", address: "1st Floor, Mega Bangna", 
    status: "Active", queueCount: 5, categories: ["ร้านอาหาร"], description: "ไก่ทอดเกาหลีชื่อดัง",
    phone: "0211122222", latitude: "13.6465", longitude: "100.6795", openTime: "10:00", closeTime: "22:00",
    avgServiceTime: 15, createdAt: new Date().toISOString(), branch: "Mega Bangna"
  }
];

export default function PlaceManagement() {
  const [places, setPlaces] = useState<Place[]>([]);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All"); 

  const context = useOutletContext<{ searchQuery: string }>();
  const searchQuery = context?.searchQuery || "";

  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [editName, setEditName] = useState("");
  const [editBranch, setEditBranch] = useState(""); 
  const [editAddress, setEditAddress] = useState("");
  const [editStatus, setEditStatus] = useState<"Active" | "Disabled">("Active");
  const [editCategories, setEditCategories] = useState<string[]>([]);
  const [editDescription, setEditDescription] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editLat, setEditLat] = useState("");
  const [editLng, setEditLng] = useState("");
  const [editOpenTime, setEditOpenTime] = useState("");
  const [editCloseTime, setEditCloseTime] = useState("");

  const [isAddPanelOpen, setIsAddPanelOpen] = useState(false);
  const [addName, setAddName] = useState("");
  const [addBranch, setAddBranch] = useState(""); 
  const [addAddress, setAddAddress] = useState("");
  const [addCategories, setAddCategories] = useState<string[]>([]);
  const [addDescription, setAddDescription] = useState("");
  const [addPhone, setAddPhone] = useState("");
  const [addLat, setAddLat] = useState("");
  const [addLng, setAddLng] = useState("");
  const [addOpenTime, setAddOpenTime] = useState("09:00");
  const [addCloseTime, setAddCloseTime] = useState("20:00");

  useEffect(() => {
    const savedPlaces = localStorage.getItem("local_shops_db");
    if (savedPlaces && savedPlaces !== "[]") { 
      setPlaces(JSON.parse(savedPlaces));
    } else {
      setPlaces(defaultPlaces);
      localStorage.setItem("local_shops_db", JSON.stringify(defaultPlaces));
    }
  }, []);

  const savePlacesToLocal = (newPlaces: Place[]) => {
    setPlaces(newPlaces);
    localStorage.setItem("local_shops_db", JSON.stringify(newPlaces));
  };

  const handleConfirmAdd = () => {
    if (
      !addName.trim() || 
      !addAddress.trim() || 
      !addDescription.trim() || 
      !addPhone.trim() || 
      !addLat.trim() || 
      !addLng.trim() || 
      !addOpenTime.trim() || 
      !addCloseTime.trim()
    ) {
      alert("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }

    if (addPhone.trim().length !== 10) {
      alert("กรุณากรอกเบอร์โทรศัพท์ให้ครบ 10 หลัก");
      return;
    }

    if (addCategories.length === 0) {
      alert("กรุณาเลือกหมวดหมู่อย่างน้อย 1 หมวดหมู่");
      return;
    }

    const generatedData = generateShopId(addName, addBranch, places);

    const newPlace: Place = {
      id: generatedData.internalId,
      placeId: generatedData.displayId,
      name: generatedData.fullName, 
      branch: addBranch.trim(),
      address: addAddress.trim(),
      status: "Disabled", 
      queueCount: 0,
      categories: addCategories,
      description: addDescription.trim(),
      phone: addPhone.trim(),
      latitude: addLat.trim(),
      longitude: addLng.trim(),
      openTime: addOpenTime,
      closeTime: addCloseTime,
      avgServiceTime: 15,
      createdAt: new Date().toISOString(),
    };

    savePlacesToLocal([...places, newPlace]);

    setAddName(""); setAddBranch(""); setAddAddress(""); setAddCategories([]); setAddDescription("");
    setAddPhone(""); setAddLat(""); setAddLng(""); setAddOpenTime("09:00"); setAddCloseTime("20:00");
    setIsAddPanelOpen(false);
  };

  const handleEditClick = (place: Place) => {
    setEditingPlace(place);
    setEditName(place.name.split(" (")[0]); 
    setEditBranch(place.branch || "");
    setEditAddress(place.address);
    setEditStatus(place.status);
    setEditCategories(place.categories || []);
    setEditDescription(place.description || "");
    setEditPhone(place.phone || "");
    setEditLat(place.latitude || "");
    setEditLng(place.longitude || "");
    setEditOpenTime(place.openTime || "09:00");
    setEditCloseTime(place.closeTime || "20:00");
  };

  const handleConfirmEdit = () => {
    if (!editingPlace) return;

    if (
      !editName.trim() || 
      !editAddress.trim() || 
      !editDescription.trim() || 
      !editPhone.trim() || 
      !editLat.trim() || 
      !editLng.trim() || 
      !editOpenTime.trim() || 
      !editCloseTime.trim()
    ) {
      alert("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }

    if (editPhone.trim().length !== 10) {
      alert("กรุณากรอกเบอร์โทรศัพท์ให้ครบ 10 หลัก");
      return;
    }

    if (editCategories.length === 0) {
      alert("กรุณาเลือกหมวดหมู่อย่างน้อย 1 หมวดหมู่");
      return;
    }

    let newInternalId = editingPlace.id;
    let newDisplayId = editingPlace.placeId;
    let newFullName = editingPlace.name;

    if (editName.trim() !== editingPlace.name.split(" (")[0] || editBranch.trim() !== (editingPlace.branch || "")) {
      const otherPlaces = places.filter(p => p.id !== editingPlace.id);
      const generated = generateShopId(editName, editBranch, otherPlaces);
      newInternalId = generated.internalId;
      newDisplayId = generated.displayId;
      newFullName = generated.fullName;
    }

    const updated = places.map((p) => 
      p.id === editingPlace.id 
        ? { 
            ...p, name: newFullName, branch: editBranch.trim(), address: editAddress.trim(), status: editStatus, 
            id: newInternalId, placeId: newDisplayId, categories: editCategories,
            description: editDescription.trim(), phone: editPhone.trim(), latitude: editLat.trim(), 
            longitude: editLng.trim(), openTime: editOpenTime, closeTime: editCloseTime
          } 
        : p
    );
    savePlacesToLocal(updated);
    setEditingPlace(null);
  };

  const handleDeletePlace = (id: string) => {
    if (confirm("Are you sure you want to delete this place?")) {
      const updated = places.filter(p => p.id !== id);
      savePlacesToLocal(updated);
    }
  };

  const filteredData = useMemo(() => {
    let result = [...places];

    if (statusFilter !== "All") {
      result = result.filter(p => p.status === statusFilter);
    }

    if (categoryFilter !== "All") {
      result = result.filter(p => p.categories?.includes(categoryFilter));
    }

    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(lowerQ) || 
        p.placeId.toLowerCase().includes(lowerQ)
      );
    }

    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return result;
  }, [places, statusFilter, categoryFilter, searchQuery]);

  useEffect(() => { setCurrentPage(1); }, [statusFilter, categoryFilter, searchQuery, places.length]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const columns: Column<Place>[] = [
    { 
      header: "PLACE NAME", 
      key: "name",
      className: "text-left w-[25%]",
      render: (item) => (
        <div className="text-left">
          <p className="font-bold text-slate-800 text-sm">{item.name}</p>
          <p className="text-[10px] font-medium text-slate-400">ID: {item.placeId}</p>
        </div>
      )
    },
    { 
      header: "CATEGORY", 
      key: "categories",
      className: "text-left w-[20%]",
      render: (item) => (
        <div className="flex flex-wrap gap-1">
          {item.categories?.map((cat, idx) => (
            <span key={idx} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-md text-[10px] font-bold">
              {cat}
            </span>
          ))}
        </div>
      )
    },
    { 
      header: "ADDRESS", 
      key: "address",
      className: "text-left w-[20%]",
      render: (item) => (
        <div className="flex items-center justify-start gap-2 text-slate-500 max-w-[200px] lg:max-w-xs">
          <MapPin size={14} className="shrink-0" />
          <span className="text-xs truncate">{item.address}</span>
        </div>
      )
    },
    {
      header: "STATUS",
      key: "status",
      className: "text-center w-[15%]",
      render: (item) => (
        <div className="flex justify-center">
          <Status status={item.status} />
        </div>
      )
    },
    { 
      header: "QUEUE", 
      key: "queueCount",
      className: "text-center w-[10%]",
      render: (item) => (
        <div className="flex justify-center">
          <span className="inline-block px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg font-bold text-slate-700 text-xs min-w-[32px] text-center">
            {item.queueCount}
          </span>
        </div>
      )
    },
    {
      header: "ACTIONS",
      key: "id",
      className: "text-right w-[10%]",
      render: (item) => (
        <div className="flex justify-end">
          <Dropdown 
            align="right" 
            trigger={<button className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><MoreHorizontal size={18} /></button>}
            items={[
              { label: "Edit Place", icon: <Edit size={16} />, onClick: () => handleEditClick(item) },
              { label: "Delete", icon: <Trash2 size={16} />, className: "text-red-600", divider: true, onClick: () => handleDeletePlace(item.id) }
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Dropdown 
            align="left" 
            trigger={
              <Button variant="outline" className="bg-white min-w-[140px] flex items-center justify-between whitespace-nowrap shadow-sm">
                <span className="font-medium text-slate-600">Status: {statusFilter}</span> 
                <ChevronDown size={14} className="ml-2 text-slate-400 shrink-0" />
              </Button>
            } 
            items={[
              { label: "All Status", onClick: () => setStatusFilter("All") },
              { label: "Active", onClick: () => setStatusFilter("Active") }, 
              { label: "Disabled", onClick: () => setStatusFilter("Disabled") }
            ]} 
          />

          <Dropdown 
            align="left" 
            trigger={
              <Button variant="outline" className="bg-white min-w-[160px] flex items-center justify-between whitespace-nowrap shadow-sm">
                <span className="font-medium text-slate-600">Category: {categoryFilter}</span> 
                <ChevronDown size={14} className="ml-2 text-slate-400 shrink-0" />
              </Button>
            } 
            items={[
              { label: "All Categories", onClick: () => setCategoryFilter("All") },
              ...CATEGORY_LIST.map(cat => ({ label: cat, onClick: () => setCategoryFilter(cat) }))
            ]}
          />
        </div>

        <Button 
          className="bg-[#5AB2A8] hover:bg-[#4a968d] text-white shadow-lg flex items-center justify-center gap-2 px-6"
          onClick={() => setIsAddPanelOpen(true)}
        >
          <Plus size={18} /> New Place
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
        <Table data={paginatedData} columns={columns} />
        
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredData.length}
          itemsPerPage={itemsPerPage}
          onChange={setCurrentPage}
        />
      </div>

      <SidePanelEdit
        isOpen={isAddPanelOpen}
        onClose={() => setIsAddPanelOpen(false)}
        title="Add New Place"
        footer={
          <button 
            onClick={handleConfirmAdd}
            className="w-full flex items-center justify-center gap-2 py-4 bg-[#5AB2A8] rounded-2xl text-white font-bold hover:bg-[#4a968d] shadow-lg shadow-teal-100 transition-all active:scale-[0.98]"
          >
            <Plus size={18} /> Create Place
          </button>
        }
      >
        <div className="space-y-6 pb-6">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Basic Information</h4>
          <div className="space-y-4">
            <Input 
              label="Place Name" icon={<Building2 size={16} />} type="text" 
              value={addName} onChange={(e) => setAddName(e.target.value)}
              placeholder="e.g. QBuddy Cafe" className="bg-slate-50 border-slate-200 py-2.5"
              maxLength={40} 
            />
            
            <Input 
              label="Branch (Optional)" icon={<MapPin size={16} />} type="text" 
              value={addBranch} onChange={(e) => setAddBranch(e.target.value)}
              placeholder="e.g. Mega Bangna" className="bg-slate-50 border-slate-200 py-2.5"
              maxLength={40} 
            />
            
            <div className="space-y-2 pt-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Categories <span className="text-[10px] font-normal text-slate-400 normal-case ml-1">(Select multiple)</span>
              </label>
              <CategorySelect 
                selectedCategories={addCategories} 
                onChange={setAddCategories} 
              />
            </div>

            <div className="space-y-2 pt-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Description</label>
              <textarea 
                value={addDescription} onChange={(e) => setAddDescription(e.target.value)} placeholder="รายละเอียดสถานที่เบื้องต้น..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#5AB2A8] outline-none min-h-[80px]"
              />
            </div>
          </div>

          <div className="h-px w-full bg-slate-100 my-6"></div>

          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Contact & Location</h4>
          <div className="space-y-4">
            <Input 
              label="Phone Number" icon={<Phone size={16} />} type="tel" 
              value={addPhone} onChange={(e) => setAddPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="02XXXXXXXX" className="bg-slate-50 border-slate-200 py-2.5"
              maxLength={10}
            />
            <Input 
              label="Full Address" icon={<MapPin size={16} />} type="text" 
              value={addAddress} onChange={(e) => setAddAddress(e.target.value)}
              placeholder="123 Street, City" className="bg-slate-50 border-slate-200 py-2.5"
            />
            
            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Latitude" icon={<Map size={16} />} type="number" 
                value={addLat} onChange={(e) => setAddLat(e.target.value)}
                placeholder="13.xxxx" className="bg-slate-50 border-slate-200 py-2.5"
              />
              <Input 
                label="Longitude" icon={<Map size={16} />} type="number" 
                value={addLng} onChange={(e) => setAddLng(e.target.value)}
                placeholder="100.xxxx" className="bg-slate-50 border-slate-200 py-2.5"
              />
            </div>
          </div>

          <div className="h-px w-full bg-slate-100 my-6"></div>

          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Operating Hours</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Open Time</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Clock size={16} /></div>
                <input 
                  type="time" value={addOpenTime} onChange={(e) => setAddOpenTime(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#5AB2A8] outline-none"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Close Time</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Clock size={16} /></div>
                <input 
                  type="time" value={addCloseTime} onChange={(e) => setAddCloseTime(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#5AB2A8] outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </SidePanelEdit>

      <SidePanelEdit
        isOpen={!!editingPlace}
        onClose={() => setEditingPlace(null)}
        title="Edit Place Details"
        footer={
          <button 
            onClick={handleConfirmEdit}
            className="w-full flex items-center justify-center gap-2 py-4 bg-[#5AB2A8] rounded-2xl text-white font-bold hover:bg-[#4a968d] shadow-lg shadow-teal-100 transition-all active:scale-[0.98]"
          >
            <CheckCircle2 size={18} /> Save Changes
          </button>
        }
      >
        {editingPlace && (
          <>
            <div className="flex flex-col items-center text-center mb-8">
              <h3 className="text-2xl font-bold text-slate-800 mt-4">{editingPlace.name}</h3>
              <p className="text-slate-500 text-sm mt-1 font-medium">{editingPlace.placeId}</p>
            </div>
            
            <div className="space-y-6 pb-6">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Basic Information</h4>
              <div className="space-y-4">
                <Input 
                  label="Place Name" icon={<Building2 size={16} />} type="text" 
                  value={editName} onChange={(e) => setEditName(e.target.value)}
                  className="bg-slate-50 border-slate-200 py-2.5" maxLength={40} 
                />

                <Input 
                  label="Branch (Optional)" icon={<MapPin size={16} />} type="text" 
                  value={editBranch} onChange={(e) => setEditBranch(e.target.value)}
                  className="bg-slate-50 border-slate-200 py-2.5" maxLength={40} 
                />

                <div className="space-y-2 pt-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Categories <span className="text-[10px] font-normal text-slate-400 normal-case ml-1">(Select multiple)</span>
                  </label>
                  <CategorySelect 
                    selectedCategories={editCategories} 
                    onChange={setEditCategories} 
                  />
                </div>

                <div className="space-y-2 pt-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Description</label>
                  <textarea 
                    value={editDescription} onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#5AB2A8] outline-none min-h-[80px]"
                  />
                </div>
              </div>

              <div className="h-px w-full bg-slate-100 my-6"></div>

              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Contact & Location</h4>
              <div className="space-y-4">
                <Input 
                  label="Phone Number" icon={<Phone size={16} />} type="tel" 
                  value={editPhone} onChange={(e) => setEditPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="bg-slate-50 border-slate-200 py-2.5"
                  maxLength={10}
                />
                <Input 
                  label="Full Address" icon={<MapPin size={16} />} type="text" 
                  value={editAddress} onChange={(e) => setEditAddress(e.target.value)}
                  className="bg-slate-50 border-slate-200 py-2.5"
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    label="Latitude" icon={<Map size={16} />} type="number" 
                    value={editLat} onChange={(e) => setEditLat(e.target.value)}
                    className="bg-slate-50 border-slate-200 py-2.5"
                  />
                  <Input 
                    label="Longitude" icon={<Map size={16} />} type="number" 
                    value={editLng} onChange={(e) => setEditLng(e.target.value)}
                    className="bg-slate-50 border-slate-200 py-2.5"
                  />
                </div>
              </div>

              <div className="h-px w-full bg-slate-100 my-6"></div>

              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Operating & Status</h4>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Open Time</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Clock size={16} /></div>
                      <input 
                        type="time" value={editOpenTime} onChange={(e) => setEditOpenTime(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#5AB2A8] outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Close Time</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Clock size={16} /></div>
                      <input 
                        type="time" value={editCloseTime} onChange={(e) => setEditCloseTime(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#5AB2A8] outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">System Status</label>
                  <div className="relative">
                    <select 
                      value={editStatus} onChange={(e) => setEditStatus(e.target.value as "Active" | "Disabled")}
                      className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#5AB2A8] outline-none appearance-none font-medium text-slate-700"
                    >
                      <option value="Active">Active</option>
                      <option value="Disabled">Disabled</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </SidePanelEdit>

    </div>
  );
}