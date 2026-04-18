import { useState, useMemo, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { fetchPosts, deletePostAsync } from "../redux/Slice/postSlice"; 
import { MapPin, Clock, Users, Trash2, MoreHorizontal, Eye } from "lucide-react";
import { Table } from "../components/ui/Table/Table";
import { Dropdown } from "../components/ui/Dropdown";
import { Pagination } from "../components/ui/Pagination";
import { SidePanelEdit } from "../components/ui/Tabbar/SidePanelEdit";
import { StatusBadge } from "../components/ui/StatusBadge";
import type { Column, PartyActivity, Guest } from "../types";

export default function PostManagement() {
  const dispatch = useAppDispatch();
  // ดึงข้อมูลจาก Redux Store (ได้ทั้ง posts และ loading)
  const { posts, loading } = useAppSelector((state) => state.post);

  const context = useOutletContext<{ searchQuery: string } | null>();
  const searchQuery = context?.searchQuery || "";

  const [viewingPost, setViewingPost] = useState<PartyActivity | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // 1. ดึงข้อมูลผ่าน Thunk แทนการ fetch เอง
  useEffect(() => {
    dispatch(fetchPosts());
    const intervalId = setInterval(() => dispatch(fetchPosts()), 30000);
    return () => clearInterval(intervalId);
  }, [dispatch]);

  // 2. จัดการเรื่องการค้นหาและเรียงลำดับ
  const displayPosts = useMemo(() => {
    let result = [...posts]; // การ Sort ถูกจัดการใน Slice แล้ว แต่ถ้าจะ Sort ซ้ำที่นี่ก็ได้

    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(lowerQ) ||
        p.hostName.toLowerCase().includes(lowerQ) ||
        p.placeName.toLowerCase().includes(lowerQ)
      );
    }
    return result;
  }, [posts, searchQuery]);

  const totalPages = Math.ceil(displayPosts.length / itemsPerPage);
  const currentData = displayPosts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [searchQuery]);

  const handleView = (post: PartyActivity) => {
    setViewingPost(post);
    setIsPanelOpen(true);
  };

  // 3. ลบข้อมูลผ่าน Thunk (สะอาดมาก!)
  const handleDelete = async (id: string) => {
    if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบโพสต์นี้ออกจากระบบถาวร?")) {
      try {
        await dispatch(deletePostAsync(id)).unwrap();
        setIsPanelOpen(false);
      } catch (error: any) {
        alert(error || "ไม่สามารถลบโพสต์ได้ กรุณาลองใหม่อีกครั้ง");
      }
    }
  };

  // Columns definition (เหมือนเดิม)
  const columns: Column<PartyActivity>[] = [
    {
      header: "PARTY HOST", key: "host", className: "w-[20%] text-left",
      render: (row) => (<div><p className="font-bold text-slate-800">{row.hostName}</p><p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">{row.hostPhone || "No Phone"}</p></div>)
    },
    {
      header: "POST TITLE & PLACE", key: "title", className: "w-[30%] text-left",
      render: (row) => (<div><p className="font-semibold text-slate-700 truncate max-w-[200px]">{row.title}</p><div className="flex items-center gap-1 text-xs text-slate-500 mt-1"><MapPin size={12} className="text-indigo-400" /><span className="truncate max-w-[180px]">{row.placeName}</span></div></div>)
    },
    {
      header: "MEETING TIME", key: "time", className: "w-[20%] text-left",
      render: (row) => (<div className="flex items-center gap-1.5 text-sm font-medium text-slate-600"><Clock size={14} className="text-amber-500" />{row.meetingDate} • {row.meetingTime}</div>)
    },
    {
      header: "GUESTS", key: "guests", className: "w-[10%] text-center",
      render: (row) => (<div className="flex items-center justify-center gap-1.5"><Users size={14} className="text-slate-400" /><span className="text-sm font-bold text-slate-700">{row.joinedGuests.filter((g: Guest) => g.status === 'confirmed').length} / {row.maxGuests}</span></div>)
    },
    {
      header: "STATUS", key: "status", className: "w-[10%] text-center",
      render: (row) => <div className="flex justify-center"><StatusBadge status={row.status} /></div>
    },
    {
      header: "ACTIONS", key: "actions", className: "w-[10%] text-right",
      render: (row) => (
        <Dropdown align="right" trigger={<button className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"><MoreHorizontal size={18} /></button>}
          items={[
            { label: "View Details", icon: <Eye size={16} />, onClick: () => handleView(row) },
            { divider: true, label: "" },
            { label: "Delete Post", icon: <Trash2 size={16} />, onClick: () => handleDelete(row.id), className: "text-rose-600" }
          ]}
        />
      )
    }
  ];

  return (
    <div className="p-4 lg:p-8 max-w-[1600px] mx-auto w-full pt-10">
      {/* Table Section */}
      {loading && posts.length === 0 ? (
        <p className="text-center py-10 text-slate-400">Loading parties...</p>
      ) : (
        <>
          <Table data={currentData} columns={columns} emptyMessage={searchQuery ? "No posts match your search." : "No posts found."} />
          <div className="mt-4">
            <Pagination currentPage={currentPage} totalPages={totalPages} onChange={setCurrentPage} />
          </div>
        </>
      )}

      {/* Side Panel Section (Detail View) */}
      <SidePanelEdit isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} title="Post Details">
        {viewingPost && (
          <div className="p-6 space-y-6">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                {viewingPost.avatarUrl ? <img src={viewingPost.avatarUrl} alt="avatar" className="w-full h-full object-cover" /> : <Users className="text-slate-400" size={24} />}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">{viewingPost.hostName}</h3>
                <p className="text-sm text-slate-500">{viewingPost.hostPhone || "No Phone Number"}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Party Info</h4>
              <div className="p-4 bg-slate-50 rounded-xl space-y-3">
                <p className="font-bold text-slate-700">{viewingPost.title}</p>
                <div className="flex items-center gap-2 text-sm text-slate-600"><MapPin size={16} className="text-indigo-400" /> {viewingPost.placeName}</div>
                <div className="flex items-center gap-2 text-sm text-slate-600"><Clock size={16} className="text-amber-500" /> {viewingPost.meetingDate} @ {viewingPost.meetingTime}</div>
                <div className="flex items-center gap-2 text-sm text-slate-600"><Users size={16} className="text-emerald-500" /> Needs {viewingPost.maxGuests} more people</div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Description</h4>
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-700 leading-relaxed">
                {viewingPost.description || "No description provided."}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Joined Guests ({viewingPost.joinedGuests.length})</h4>
              <div className="space-y-2">
                {viewingPost.joinedGuests.map((guest: Guest, idx: number) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-white border border-slate-100 rounded-lg">
                    <span className="text-sm font-medium text-slate-700">{guest.userName} ({guest.pax} pax)</span>
                    <StatusBadge status={guest.status === 'confirmed' ? "Completed" : "Waiting"} />
                  </div>
                ))}
                {viewingPost.joinedGuests.length === 0 && <p className="text-sm text-slate-400 italic">No one has joined yet.</p>}
              </div>
            </div>

            <div className="pt-4 mt-2 border-t border-slate-100 flex gap-3">
              <button onClick={() => handleDelete(viewingPost.id)} className="w-full py-3.5 flex flex-row items-center justify-center gap-2 bg-rose-50 text-rose-600 font-bold rounded-xl hover:bg-rose-100 transition-colors whitespace-nowrap">
                <Trash2 size={16} />
                <span>Delete Post</span>
              </button>
            </div>
          </div>
        )}
      </SidePanelEdit>
    </div>
  );
}