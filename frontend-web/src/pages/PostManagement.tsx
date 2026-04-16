import { useState, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../redux/Reduxindex";
import { deletePost, updatePostStatus } from "../redux/postSlice";
import { MapPin, Clock, Users, Trash2, MoreHorizontal, Eye, Ban } from "lucide-react";
import { Table } from "../components/ui/Table/Table";
import { Dropdown } from "../components/ui/Dropdown";
import { Pagination } from "../components/ui/Pagination";
import { SidePanelEdit } from "../components/ui/Tabbar/SidePanelEdit";
import { StatusBadge } from "../components/ui/StatusBadge";
import type { Column, PartyActivity, Guest } from "../types";

export default function PostManagement() {
  const dispatch = useDispatch();
  const posts = useSelector((state: RootState) => state.post.posts);
  
  const context = useOutletContext<{ searchQuery: string } | null>();
  const searchQuery = context?.searchQuery || "";

  const [viewingPost, setViewingPost] = useState<PartyActivity | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // 🌟 แก้เป็น 6 แถวต่อหน้า

  const displayPosts = useMemo(() => {
    let result = [...posts];
    if (searchQuery) {
      result = result.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.hostName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.placeName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return result;
  }, [posts, searchQuery]);

  const totalPages = Math.ceil(displayPosts.length / itemsPerPage);
  const currentData = displayPosts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleView = (post: PartyActivity) => {
    setViewingPost(post);
    setIsPanelOpen(true);
  };

  const handleStatusChange = (id: string, status: PartyActivity["status"]) => {
    dispatch(updatePostStatus({ id, status }));
    setIsPanelOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      dispatch(deletePost(id));
      setIsPanelOpen(false);
    }
  };

  const columns: Column<PartyActivity>[] = [
    { 
      header: "Party Host", key: "host",
      render: (row) => (<div><p className="font-bold text-slate-800">{row.hostName}</p><p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">{row.hostPhone || "No Phone"}</p></div>)
    },
    { 
      header: "Post Title & Place", key: "title",
      render: (row) => (<div><p className="font-semibold text-slate-700 truncate max-w-[200px]">{row.title}</p><div className="flex items-center gap-1 text-xs text-slate-500 mt-1"><MapPin size={12} className="text-indigo-400" /><span className="truncate max-w-[180px]">{row.placeName}</span></div></div>)
    },
    { 
      header: "Meeting Time", key: "time",
      render: (row) => (<div className="flex items-center gap-1.5 text-sm font-medium text-slate-600"><Clock size={14} className="text-amber-500" />{row.meetingDate} • {row.meetingTime}</div>)
    },
    {
      header: "Guests", key: "guests",
      render: (row) => (<div className="flex items-center gap-1.5"><Users size={14} className="text-slate-400" /><span className="text-sm font-bold text-slate-700">{row.joinedGuests.filter((g: Guest) => g.status === 'confirmed').length} / {row.maxGuests}</span></div>)
    },
    { header: "Status", key: "status", render: (row) => <StatusBadge status={row.status} /> },
    {
      header: "Actions", key: "actions", className: "text-right",
      render: (row) => (
        <Dropdown align="right" trigger={<button className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"><MoreHorizontal size={18} /></button>}
          items={[
            { label: "View Details", icon: <Eye size={16} />, onClick: () => handleView(row) },
            { divider: true, label: "" },
            { label: "Force Close", icon: <Ban size={16} />, onClick: () => handleStatusChange(row.id, "Closed"), className: "text-amber-600" },
            { label: "Delete Post", icon: <Trash2 size={16} />, onClick: () => handleDelete(row.id), className: "text-rose-600" }
          ]}
        />
      )
    }
  ];

  return (
    <div className="p-4 lg:p-8 max-w-[1600px] mx-auto w-full pt-10">
      <Table data={currentData} columns={columns} emptyMessage="No posts found." />
      <Pagination currentPage={currentPage} totalPages={totalPages} onChange={setCurrentPage} />

      <SidePanelEdit isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} title="Post Details">
        {viewingPost && (
          <div className="p-6 space-y-6">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                {viewingPost.avatarUrl ? <img src={viewingPost.avatarUrl} alt="avatar" /> : <Users className="text-slate-400" size={24} />}
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
              <button onClick={() => handleStatusChange(viewingPost.id, "Closed")} className="flex-1 py-3.5 flex flex-row items-center justify-center gap-2 bg-amber-50 text-amber-600 font-bold rounded-xl hover:bg-amber-100 transition-colors whitespace-nowrap"><Ban size={16} /><span>Force Close</span></button>
              <button onClick={() => handleDelete(viewingPost.id)} className="flex-1 py-3.5 flex flex-row items-center justify-center gap-2 bg-rose-50 text-rose-600 font-bold rounded-xl hover:bg-rose-100 transition-colors whitespace-nowrap"><Trash2 size={16} /><span>Delete Post</span></button>
            </div>
          </div>
        )}
      </SidePanelEdit>
    </div>
  );
}