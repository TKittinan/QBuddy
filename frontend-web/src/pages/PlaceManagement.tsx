import { useState, useMemo, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { 
  Plus, MapPin, MoreHorizontal, ChevronDown, 
  Building2, CheckCircle2, Trash2, Edit 
} from "lucide-react";
import { Table } from "../components/ui/Table/Table";
import { Button } from "../components/ui/Button";
import { Dropdown } from "../components/ui/Dropdown";
import { Pagination } from "../components/ui/Pagination";
import { SidePanelEdit } from "../components/ui/Tabbar/SidePanelEdit";
import { Input } from "../components/ui/Input"; 
import { Status } from "../components/ui/Status"; // นำเข้า Component Status
import type { Column } from "../types";

import { generateShopId } from "../utils/generateShopId";

export type Place = {
  id: string;        
  placeId: string;   
  name: string;
  address: string;
  status: "Active" | "Disabled";
  queueCount: number; 
  imageUrl: string;
  serviceType: string; 
  avgServiceTime: number; 
  createdAt: string;
};

// ข้อมูลตั้งต้นสำหรับใช้ทดสอบ (มี Active 2 ร้าน, Disabled 1 ร้าน)
const defaultPlaces: Place[] = [
  { 
    id: generateShopId("Seoul Chon", 1), 
    placeId: "#SEO-001", 
    name: "Seoul Chon", 
    address: "1st Floor, Mega Bangna", 
    status: "Active", 
    queueCount: 5, 
    imageUrl: "🍗", 
    serviceType: "Table Service", 
    avgServiceTime: 15, 
    createdAt: new Date().toISOString() 
  },
  { 
    id: generateShopId("Nude Steak", 1), 
    placeId: "#NUD-001", 
    name: "Nude Steak", 
    address: "2nd Floor, Central World", 
    status: "Active", 
    queueCount: 12, 
    imageUrl: "🥩", 
    serviceType: "Table Service", 
    avgServiceTime: 20, 
    createdAt: new Date(Date.now() - 1000).toISOString()
  },
  { 
    id: generateShopId("Fast Cafe", 1), 
    placeId: "#FAS-001", 
    name: "Fast Cafe", 
    address: "BTS Asok Station", 
    status: "Disabled", 
    queueCount: 0, 
    imageUrl: "☕", 
    serviceType: "Counter Service", 
    avgServiceTime: 5, 
    createdAt: new Date(Date.now() - 2000).toISOString() 
  },
];

export default function PlaceManagement() {
  const [places, setPlaces] = useState<Place[]>([]);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const context = useOutletContext<{ searchQuery: string }>();
  const searchQuery = context?.searchQuery || "";

  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [editName, setEditName] = useState("");
  const [editAddress, setEditAddress] = useState("");

  const [isAddPanelOpen, setIsAddPanelOpen] = useState(false);
  const [addName, setAddName] = useState("");
  const [addAddress, setAddAddress] = useState("");

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
    if (!addName.trim() || !addAddress.trim()) {
      alert("กรุณากรอกชื่อและที่อยู่ให้ครบถ้วน");
      return;
    }

    const baseId = generateShopId(addName, 1).replace(/[0-9]/g, ''); 
    
    const sameNamePlaces = places.filter(p => p.name.toLowerCase() === addName.toLowerCase());
    const branchNumber = sameNamePlaces.length + 1;
    
    const internalId = `${baseId}${branchNumber}`;
    const displayId = `#${baseId}-${String(branchNumber).padStart(3, '0')}`;

    const newPlace: Place = {
      id: internalId,
      placeId: displayId,
      name: addName,
      address: addAddress,
      status: "Disabled", 
      queueCount: 0,
      imageUrl: "🏪", 
      serviceType: "Table Service", 
      avgServiceTime: 15,
      createdAt: new Date().toISOString(),
    };

    const updatedPlaces = [...places, newPlace];
    savePlacesToLocal(updatedPlaces);

    setAddName("");
    setAddAddress("");
    setIsAddPanelOpen(false);
  };

  const handleEditClick = (place: Place) => {
    setEditingPlace(place);
    setEditName(place.name);
    setEditAddress(place.address);
  };

  const handleConfirmEdit = () => {
    if (!editingPlace) return;

    let newInternalId = editingPlace.id;
    let newDisplayId = editingPlace.placeId;

    if (editName.trim().toLowerCase() !== editingPlace.name.toLowerCase()) {
      const baseId = generateShopId(editName, 1).replace(/[0-9]/g, ''); 
      const sameNamePlaces = places.filter(
        p => p.name.toLowerCase() === editName.trim().toLowerCase() && p.id !== editingPlace.id
      );
      const branchNumber = sameNamePlaces.length + 1;
      
      newInternalId = `${baseId}${branchNumber}`;
      newDisplayId = `#${baseId}-${String(branchNumber).padStart(3, '0')}`;
    }

    const updated = places.map((p) => 
      p.id === editingPlace.id 
        ? { ...p, name: editName, address: editAddress, id: newInternalId, placeId: newDisplayId } 
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

    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(lowerQ) || 
        p.placeId.toLowerCase().includes(lowerQ)
      );
    }

    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return result;
  }, [places, statusFilter, searchQuery]);

  useEffect(() => { setCurrentPage(1); }, [statusFilter, searchQuery, places.length]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const columns: Column<Place>[] = [
    { 
      header: "IMAGE", 
      key: "imageUrl",
      render: (item) => (
        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-xl shadow-sm border border-slate-200">
          {item.imageUrl}
        </div>
      )
    },
    { 
      header: "NAME", 
      key: "name",
      render: (item) => (
        <div>
          <p className="font-bold text-slate-800 text-sm">{item.name}</p>
          <p className="text-[10px] font-medium text-slate-400">ID: {item.placeId}</p>
        </div>
      )
    },
    { 
      header: "ADDRESS", 
      key: "address",
      render: (item) => (
        <div className="flex items-center gap-2 text-slate-500 max-w-[200px] lg:max-w-xs">
          <MapPin size={14} className="shrink-0" />
          <span className="text-xs truncate">{item.address}</span>
        </div>
      )
    },
    {
      header: "STATUS",
      key: "status",
      // เรียกใช้ Component Status
      render: (item) => <Status status={item.status} />,
    },
    { 
      header: "QUEUE COUNT", 
      key: "queueCount",
      className: "text-center",
      render: (item) => (
        <span className="inline-block px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg font-bold text-slate-700 text-xs min-w-[32px]">
          {item.queueCount}
        </span>
      )
    },
    {
      header: "ACTIONS",
      key: "id",
      className: "text-right",
      render: (item) => (
        <Dropdown 
          align="right" 
          trigger={<button className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><MoreHorizontal size={18} /></button>}
          items={[
            { label: "Edit Place", icon: <Edit size={16} />, onClick: () => handleEditClick(item) },
            { label: "Delete", icon: <Trash2 size={16} />, className: "text-red-600", divider: true, onClick: () => handleDeletePlace(item.id) }
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* 1. ตั้ง align="left" และ 2. ปรับ Button ให้เป็น flex แนวนอน ห้ามขึ้นบรรทัดใหม่ */}
          <Dropdown 
            align="left" 
            trigger={
              <Button variant="outline" className="bg-white min-w-[140px] flex items-center justify-between whitespace-nowrap">
                <span>Status: {statusFilter}</span> 
                <ChevronDown size={14} className="ml-2 text-slate-400 shrink-0" />
              </Button>
            } 
            items={[
              { label: "All Status", onClick: () => setStatusFilter("All") },
              { label: "Active", onClick: () => setStatusFilter("Active") }, 
              { label: "Disabled", onClick: () => setStatusFilter("Disabled") }
            ]} 
          />
        </div>

        <Button 
          className="bg-[#5AB2A8] hover:bg-[#4a968d] text-white shadow-lg flex items-center justify-center gap-2 px-6"
          onClick={() => setIsAddPanelOpen(true)}
        >
          <Plus size={18} /> Add New Place
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
        <div className="space-y-6">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Place Details</h4>
          <div className="space-y-4">
            <Input 
              label="Place Name"
              icon={<Building2 size={16} />}
              type="text" 
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
              placeholder="e.g. Newyork Kown"
              className="bg-slate-50 border-slate-200 py-2.5"
            />
            <Input 
              label="Full Address"
              icon={<MapPin size={16} />}
              type="text" 
              value={addAddress}
              onChange={(e) => setAddAddress(e.target.value)}
              placeholder="123 Street, City"
              className="bg-slate-50 border-slate-200 py-2.5"
            />
            <div className="pt-2 p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-500">
              <span className="font-bold text-slate-700 block mb-1">Status: Disabled</span>
              Status will be updated to "Active" when the shop connects to the system.
            </div>
          </div>
        </div>
      </SidePanelEdit>

      <SidePanelEdit
        isOpen={!!editingPlace}
        onClose={() => setEditingPlace(null)}
        title="Edit Place"
        footer={
          <button 
            onClick={handleConfirmEdit}
            className="w-full flex items-center justify-center gap-2 py-4 bg-[#5AB2A8] rounded-2xl text-white font-bold hover:bg-[#4a968d] shadow-lg shadow-teal-100 transition-all active:scale-[0.98]"
          >
            <CheckCircle2 size={18} /> Confirm Edit
          </button>
        }
      >
        {editingPlace && (
          <>
            <div className="flex flex-col items-center text-center mb-10">
              <div className="w-24 h-24 rounded-3xl bg-slate-100 flex items-center justify-center text-4xl shadow-sm border border-slate-200 mb-4">
                {editingPlace.imageUrl}
              </div>
              <h3 className="text-2xl font-bold text-slate-800">{editingPlace.name}</h3>
              <p className="text-slate-500 text-sm mt-1 font-medium">{editingPlace.placeId}</p>
            </div>
            
            <div className="space-y-6">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Place Information</h4>
              <div className="space-y-4">
                <Input 
                  label="Place Name"
                  icon={<Building2 size={16} />}
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="bg-slate-50 border-slate-200 py-2.5"
                />
                <Input 
                  label="Full Address"
                  icon={<MapPin size={16} />}
                  type="text" 
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="bg-slate-50 border-slate-200 py-2.5"
                />
              </div>
            </div>
          </>
        )}
      </SidePanelEdit>

    </div>
  );
}