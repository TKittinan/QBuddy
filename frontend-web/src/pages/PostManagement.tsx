import { useState, useMemo, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../redux/Reduxindex";
import { deletePost, type Post } from "../redux/postSlice";
import { 
  Search, MapPin, Clock, Users, Trash2, 
  MoreHorizontal, Eye, MessageSquare 
} from "lucide-react";
import { Table } from "../components/ui/Table/Table";
import { Button } from "../components/ui/Button";
import { Dropdown } from "../components/ui/Dropdown";
import { Pagination } from "../components/ui/Pagination";
import { SidePanelEdit } from "../components/ui/Tabbar/SidePanelEdit";
import { Status } from "../components/ui/Status";
import type { Column } from "../types";

export default function PostManagement() {
  const dispatch = useDispatch();
  const posts = useSelector((state: RootState) => state.post.posts);
  
  const context = useOutletContext<{ searchQuery: string } | null>();
  const searchQuery = context?.searchQuery || "";

  /* // =========================================================================
  // 🗄️ [SUPABASE DB CONNECTION MOCKUP]
  // =========================================================================
  // เมื่อต่อ Database จริง:
  // โพสต์อิงจากคิวที่จองไว้ การแก้ไขสถานะจะไปผูกกับทริกเกอร์ของตาราง Bookings/Queues 
  // แอดมินมีหน้าที่แค่อ่าน (Read) และลบ (Delete) กรณีทำผิดกฎ
  //
  // const fetchPosts = async () => {
  //   const { data, error } = await supabase
  //     .from('posts')
  //     .select(`
  //       id, 
  //       booking_id,                  <-- เชื่อมกับข้อมูลคิวที่ลูกค้าจอง
  //       meeting_time, 
  //       distance, 
  //       description, 
  //       created_at,
  //       bookings!inner ( status ),   <-- ดึง status มาจากคิวโดยตรง (ไม่ต้องเก็บแยกที่โพสต์)
  //       users ( name ),              <-- ดึงชื่อ Host
  //       places ( name, categories )  <-- ดึงชื่อร้าน และ Tags มาโชว์
  //     `);
  //   
  //   if (data) {
  //     // Format data เข้า Redux state
  //     dispatch(setPosts(formattedData));
  //   }
  // };
  // =========================================================================
  */

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [viewingPost, setViewingPost] = useState<Post | null>(null);

  const handleDeletePostAction = (id: string) => {
    if (confirm("คุณแน่ใจหรือไม่ที่จะลบโพสต์นี้? (ลบถาวรในระบบ)")) {
      // 🗄️ DB MOCK: await supabase.from('posts').delete().eq('id', id);
      dispatch(deletePost(id)); 
      if (viewingPost?.id === id) setViewingPost(null);
    }
  };

  const filteredData = useMemo(() => {
    let result = [...posts];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.hostName.toLowerCase().includes(q) || p.placeName.toLowerCase().includes(q));
    }
    return result;
  }, [posts, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, posts.length]);

  const columns: Column<Post>[] = [
    { 
      header: "HOST", 
      key: "hostName", 
      className: "w-[20%] text-left",
      render: (item) => (
        <div className="text-left">
          <p className="font-bold text-slate-800 text-sm">{item.hostName}</p>
        </div>
      )
    },
    { 
      header: "TARGET PLACE", 
      key: "placeName", 
      className: "w-[30%] text-left",
      render: (item) => (
        <div className="text-left">
          <p className="font-bold text-slate-700 text-sm mb-1.5">{item.placeName}</p>
          <div className="flex flex-wrap gap-1">
            {/* 🌟 แสดง Tag แบบ Read-Only โดยดึงสไตล์มาจาก CategorySelect */}
            {item.tags.map((tag, idx) => (
              <span key={idx} className="px-3 py-1 bg-teal-50 border border-teal-200 text-teal-700 rounded-xl text-[10px] font-bold">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )
    },
    { 
      header: "APPOINTMENT", 
      key: "meetingTime", 
      className: "w-[25%] text-left",
      render: (item) => (
        <div className="text-left">
          <p className="text-sm font-medium text-slate-700 flex items-center justify-start gap-1.5"><Clock size={14} className="text-slate-400 shrink-0"/> {item.meetingTime}</p>
          <p className="text-xs text-slate-400 flex items-center justify-start gap-1.5 mt-1"><MapPin size={14} className="shrink-0"/> {item.distance}</p>
        </div>
      )
    },
    { 
      header: "STATUS", 
      key: "status", 
      className: "w-[15%] text-center",
      render: (item) => (
        <div className="flex justify-center">
          <Status status={item.status} />
        </div>
      )
    },
    { 
      header: "ACTIONS", 
      key: "id", 
      className: "w-[10%] text-right",
      render: (item) => (
        <div className="flex justify-end">
          <Dropdown align="right" trigger={<button className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><MoreHorizontal size={18} /></button>}
            items={[
              { label: "View Details", icon: <Eye size={16} />, onClick: () => setViewingPost(item) },
              // 🌟 ถอดปุ่มอัปเดตสถานะออกตาม Requirement
              { label: "Delete Post", icon: <Trash2 size={16} />, className: "text-rose-600", divider: true, onClick: () => handleDeletePostAction(item.id) }
            ]}
          />
        </div>
      )},
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Post Management</h2>
          <p className="text-sm text-slate-500">จัดการข้อมูลโพสต์สร้างกิจกรรมหาเพื่อนในระบบ</p>
        </div>
      </div>

      {/* 🌟 ถอดกล่องสถิติ 3 กล่องออก เพื่อให้คลีนตามความต้องการ */}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 overflow-hidden">
        {filteredData.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <Table data={paginatedData} columns={columns} />
            <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={filteredData.length} itemsPerPage={itemsPerPage} onChange={setCurrentPage} />
          </>
        )}
      </div>

      <SidePanelEdit isOpen={!!viewingPost} onClose={() => setViewingPost(null)} title="Post Details"
        footer={
          <div className="flex gap-3 w-full">
            <Button variant="outline" onClick={() => setViewingPost(null)} className="flex-1 py-3">Close</Button>
            <Button variant="primary" onClick={() => handleDeletePostAction(viewingPost!.id)} className="flex-1 bg-rose-500 hover:bg-rose-600 focus:ring-rose-400 py-3 shadow-lg shadow-rose-100">
              <Trash2 size={18} className="mr-2 inline" /> Delete Post
            </Button>
          </div>
        }
      >
        {viewingPost && <PostDetailView viewingPost={viewingPost} />}
      </SidePanelEdit>
    </div>
  );
}

// ============================================================================
// Sub Components
// ============================================================================

function EmptyState() {
  return (
    <div className="py-16 text-center flex flex-col items-center">
      <Search size={48} className="text-slate-200 mb-4" />
      <p className="text-lg font-bold text-slate-600 mb-1">No posts found</p>
      <p className="text-sm text-slate-400">Search for host name or place name.</p>
    </div>
  );
}

function PostDetailView({ viewingPost }: { viewingPost: Post }) {
  return (
    <div className="space-y-6 pb-6">
      
      <div className="flex flex-col gap-2 p-4 bg-slate-50 border border-slate-100 rounded-xl">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Post Creator (Host)</p>
        <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
          <Users size={18} className="text-slate-400"/> {viewingPost.hostName}
        </h3>
      </div>

      <div className="h-px w-full bg-slate-100 my-2"></div>

      <div className="space-y-4">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Target Location</h4>
        <div className="flex items-start gap-3">
          <div className="mt-1 p-2 bg-[#5AB2A8]/10 text-[#5AB2A8] rounded-lg shrink-0"><MapPin size={20} /></div>
          <div>
            <p className="font-bold text-slate-800 text-base mb-1.5">{viewingPost.placeName}</p>
            <div className="flex flex-wrap gap-1 mb-2">
              {viewingPost.tags.map((tag, idx) => (
                <span key={idx} className="px-3 py-1 bg-teal-50 border border-teal-200 text-teal-700 rounded-xl text-[10px] font-bold">
                  {tag}
                </span>
              ))}
            </div>
            <p className="text-sm text-slate-500 mt-1 flex items-center gap-2"><Clock size={14}/> {viewingPost.meetingTime}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Message Description</h4>
        <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-700 leading-relaxed relative">
          <MessageSquare size={16} className="absolute top-4 right-4 text-slate-300" />
          {viewingPost.description}
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">System Info</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex flex-col items-center justify-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Current Status</p>
            <Status status={viewingPost.status} />
          </div>
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex flex-col items-center justify-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Posted At</p>
            <p className="font-bold text-slate-700 text-sm">{viewingPost.createdAt}</p>
          </div>
        </div>
      </div>

    </div>
  );
}