import { useState } from "react";
import { 
  Plus, Search, MapPin, MoreHorizontal, ChevronDown, 
  Building2, CheckCircle2 
} from "lucide-react";
import { Table } from "../components/ui/Table/Table";
import { Button } from "../components/ui/Button";
import { Dropdown } from "../components/ui/Dropdown";
import { Pagination } from "../components/ui/Pagination";
import { SidePanelEdit } from "../components/ui/Tabbar/SidePanelEdit";
import { Input } from "../components/ui/Input"; // ✅ Import Input Component
import type { Column } from "../types";

type Place = {
  id: string;
  placeId: string;
  name: string;
  address: string;
  status: "Active" | "Disabled";
  queueCount: number;
  imageUrl: string;
};

const initialPlaces: Place[] = [
  { id: "1", placeId: "#PLC-1023", name: "Downtown Branch", address: "123 Main St, Cityville", status: "Active", queueCount: 12, imageUrl: "🏢" },
  { id: "2", placeId: "#PLC-1045", name: "Uptown Hub", address: "456 North Ave, Townsburg", status: "Disabled", queueCount: 0, imageUrl: "🏦" },
  { id: "3", placeId: "#PLC-1089", name: "Mall Kiosk", address: "789 Shop Ln, Marketcity", status: "Active", queueCount: 5, imageUrl: "🏪" },
  { id: "4", placeId: "#PLC-1102", name: "Airport Counter", address: "Terminal 2, Intl Airport", status: "Active", queueCount: 28, imageUrl: "🏬" },
  { id: "5", placeId: "#PLC-1234", name: "Suburban Office", address: "321 Oak Rd, Suburbia", status: "Active", queueCount: 3, imageUrl: "🏘️" },
];

export default function PlaceManagement() {
  const [currentPage, setCurrentPage] = useState(1);
  const [places, setPlaces] = useState<Place[]>(initialPlaces);

  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [editName, setEditName] = useState("");
  const [editAddress, setEditAddress] = useState("");

  const handleEditClick = (place: Place) => {
    setEditingPlace(place);
    setEditName(place.name);
    setEditAddress(place.address);
  };

  const handleConfirmEdit = () => {
    if (!editingPlace) return;
    const updated = places.map((p) => 
      p.id === editingPlace.id ? { ...p, name: editName, address: editAddress } : p
    );
    setPlaces(updated);
    setEditingPlace(null);
  };

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
      render: (item) => (
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
          item.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
        }`}>
          ● {item.status}
        </span>
      ),
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
          trigger={<button className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><MoreHorizontal size={18} /></button>}
          items={[
            { label: "Edit Place", onClick: () => handleEditClick(item) },
            { label: "Delete", className: "text-red-600", divider: true, onClick: () => confirm("Are you sure?") }
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header และ ค้นหา */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="relative w-full lg:max-w-xl">
          {/* ✅ เปลี่ยนมาใช้ Input Component สำหรับช่องค้นหา */}
          <Input 
            icon={<Search size={18} />}
            type="text" 
            placeholder="Search places by name or ID..." 
            className="bg-white shadow-sm border-slate-200 py-2.5"
          />
        </div>

        <div className="flex items-center gap-3">
          <Dropdown trigger={<Button variant="outline" className="bg-white">Status: All <ChevronDown size={14} className="ml-1" /></Button>} items={[{label: "Active"}, {label: "Disabled"}]} />
          <Dropdown trigger={<Button variant="outline" className="bg-white">Region: All <ChevronDown size={14} className="ml-1" /></Button>} items={[{label: "Downtown"}, {label: "North"}]} />
          <Button className="bg-[#5AB2A8] hover:bg-[#4a968d] text-white shadow-lg flex items-center gap-2 px-6">
            <Plus size={18} /> Add New Place
          </Button>
        </div>
      </div>

      {/* ตารางแสดงข้อมูล */}
      <div className="space-y-4">
        <Table data={places} columns={columns} />
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <p className="text-xs text-slate-400 font-medium">Showing 1 to 5 of 42 results</p>
          <Pagination currentPage={currentPage} totalPages={8} onChange={setCurrentPage} />
        </div>
      </div>

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
              <span className={`mt-4 px-3 py-1 rounded-full text-xs font-bold ${
                editingPlace.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
              }`}>
                {editingPlace.status}
              </span>
            </div>
            
            <div className="space-y-6">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Place Information</h4>
              
              <div className="space-y-4">
                {/* ✅ เปลี่ยนมาใช้ Input Component สำหรับฟอร์มแก้ไข */}
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