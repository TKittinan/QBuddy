import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../redux/hooks";
import { Send, CheckCircle2, ArrowLeft, AlertCircle } from "lucide-react";
import { fetchInboxTickets, sendReplyAsync, resolveTicketAsync } from "../redux/Slice/inboxSlice"; 
import { Button } from "../components/ui/Button";
import { StatusBadge } from "../components/ui/StatusBadge";
import { ChatMessage } from "../components/ui/User/ChatMessage";

export default function Inbox() {
  const { id } = useParams<{ id: string }>(); 
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const [replyText, setReplyText] = useState("");

  const { tickets, loading } = useAppSelector((state) => state.inbox);
  const activeTicket = tickets.find(t => t.id === id);

  useEffect(() => {
    dispatch(fetchInboxTickets());
    const intervalId = setInterval(() => dispatch(fetchInboxTickets()), 15000);
    return () => clearInterval(intervalId);
  }, [dispatch]);

  if (!activeTicket) {
    return (
      <div className="flex-1 hidden lg:flex flex-col items-center justify-center text-slate-400 p-6 text-center">
        <AlertCircle size={48} className="mb-4 text-slate-200" />
        <p className="text-lg font-medium text-slate-500">No Ticket Selected</p>
        <p className="text-sm">Select a ticket from the left menu to view details.</p>
      </div>
    );
  }

  const handleSendReply = async () => {
    if (!replyText.trim()) return;

    try {
      await dispatch(sendReplyAsync({ 
        ticketId: activeTicket.id, 
        message: replyText.trim() 
      })).unwrap();
      
      setReplyText("");
      dispatch(fetchInboxTickets()); 
    } catch (error) {
      alert("ไม่สามารถส่งข้อความได้ กรุณาลองใหม่อีกครั้ง");
    }
  };

  const handleResolve = async () => {
    if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการปิดเคสนี้?")) {
      try {
        await dispatch(resolveTicketAsync(activeTicket.id)).unwrap();
        dispatch(fetchInboxTickets());
      } catch (error) {
        alert("ไม่สามารถปิดเคสได้ กรุณาลองใหม่อีกครั้ง");
      }
    }
  };

  return (
    <>
      <div className="p-4 lg:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-start justify-between bg-slate-50/50 gap-4 sm:gap-0">
        <div className="flex items-start gap-3">
          <button onClick={() => navigate("/inbox")} className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-200 rounded-full shrink-0">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="text-base lg:text-lg font-bold text-slate-800 truncate">{activeTicket.subject}</h3>
              <StatusBadge status={activeTicket.status === "Pending" ? "Waiting" : "Completed"} />
            </div>
            {/*  จุดที่แก้: ใส่ (activeTicket as any) เพื่อข้าม Type check */}
            <p className="text-xs lg:text-sm text-slate-500 font-medium truncate">Ticket ID: {activeTicket.id} • User: {(activeTicket as any).userId || 'Unknown'}</p>
          </div>
        </div>
        
        {activeTicket.status === "Pending" && (
          <Button onClick={handleResolve} className="bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 font-bold px-4 py-2 sm:py-1.5 flex items-center justify-center gap-2 shadow-none w-full sm:w-auto text-sm">
            <CheckCircle2 size={16} /> Mark Resolved
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 lg:p-6 bg-slate-50/30">
        {loading && activeTicket.messages?.length === 0 ? (
          <p className="text-center text-slate-400">Loading messages...</p>
        ) : (
          activeTicket.messages?.map((msg: any) => (
            <ChatMessage 
              key={msg.id} 
              text={msg.text} 
              senderName={msg.sender?.name || (msg.senderId === "admin" ? "Admin" : "User")} 
              timestamp={new Date(msg.createdAt || msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
              isAdmin={msg.senderId === "admin"} 
            />
          ))
        )}
      </div>

      <div className="p-3 lg:p-4 bg-white border-t border-slate-100">
        <div className="flex items-end gap-2 lg:gap-3">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={activeTicket.status === "Resolved" ? "This ticket is resolved." : "Type your reply..."}
            disabled={activeTicket.status === "Resolved"}
            className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-[#5AB2A8] outline-none min-h-[50px] lg:min-h-[80px] max-h-[120px] resize-y disabled:bg-slate-100 disabled:text-slate-400"
          />
          <Button 
            onClick={handleSendReply} 
            disabled={!replyText.trim() || activeTicket.status === "Resolved" || loading} 
            className="bg-[#5AB2A8] text-white px-4 lg:px-6 h-12 flex items-center justify-center gap-2 rounded-xl shrink-0 disabled:bg-slate-300"
          >
            <Send size={16} className="lg:mr-1" /> <span className="hidden lg:inline">Send</span>
          </Button>
        </div>
      </div>
    </>
  );
}