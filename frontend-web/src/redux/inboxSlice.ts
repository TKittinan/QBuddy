import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type Message = {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
};

export type Ticket = {
  id: string;
  userName: string;
  subject: string;
  category: "Bug" | "Shop Issue" | "General";
  status: "Pending" | "Resolved";
  createdAt: string;
  messages: Message[];
};

// 5 Mock Data Entries
const initialTickets: Ticket[] = [
  {
    id: "TK-001",
    userName: "Somchai K.",
    subject: "แอปค้างตอนกดจองคิว",
    category: "Bug",
    status: "Pending",
    createdAt: "10:30 AM",
    messages: [
      { id: "m1", senderId: "u1", senderName: "Somchai K.", text: "สวัสดีครับ พอดีผมกดจองคิวร้าน Seoul Chon แล้วแอปมันค้างหน้าโหลดตลอดเลยครับ แก้ไขยังไงได้บ้าง", timestamp: "10:30 AM" }
    ]
  },
  {
    id: "TK-002",
    userName: "Wipada J.",
    subject: "ร้านค้าปฏิเสธคิว",
    category: "Shop Issue",
    status: "Resolved",
    createdAt: "Yesterday",
    messages: [
      { id: "m1", senderId: "u2", senderName: "Wipada J.", text: "ไปถึงหน้าร้านแล้วพนักงานบอกว่าคิวในระบบไม่ตรงกันค่ะ โดนข้ามคิวไปแล้ว", timestamp: "14:20 PM" },
      { id: "m2", senderId: "admin", senderName: "Admin User", text: "ต้องขออภัยในความไม่สะดวกด้วยครับ ทางเราได้ประสานงานกับทางร้านและปรับปรุงระบบคิวให้ใหม่แล้วครับ", timestamp: "14:45 PM" }
    ]
  },
  {
    id: "TK-003",
    userName: "Kittinan L.",
    subject: "พนักงานแจ้งว่าคิวในระบบไม่ตรง",
    category: "Shop Issue",
    status: "Pending",
    createdAt: "09:15 AM",
    messages: [
      { id: "m1", senderId: "u3", senderName: "Kittinan L.", text: "ไปถึงหน้าร้านสุกี้ตี๋น้อยแล้ว พนักงานบอกว่าคิวรันข้ามไปแล้วครับ ทั้งที่ในแอปยังไม่ถึงคิวผมเลย ตรวจสอบให้หน่อยครับ", timestamp: "09:15 AM" }
    ]
  },
  {
    id: "TK-004",
    userName: "Supinya M.",
    subject: "แอปไม่แจ้งเตือนเมื่อใกล้ถึงคิว",
    category: "Bug",
    status: "Pending",
    createdAt: "Yesterday",
    messages: [
      { id: "m1", senderId: "u4", senderName: "Supinya M.", text: "ตั้งค่าเปิดแจ้งเตือนไว้แล้ว แต่แอปไม่ยอมเด้งเตือนตอนใกล้ถึงคิวค่ะ ทำให้พลาดคิวไป", timestamp: "18:30 PM" },
      { id: "m2", senderId: "admin", senderName: "Admin User", text: "สวัสดีครับ เบื้องต้นรบกวนลูกค้าตรวจสอบการอนุญาตแจ้งเตือน (Notification) ในหน้าตั้งค่าของมือถืออีกครั้งนะครับ", timestamp: "18:45 PM" },
      { id: "m3", senderId: "u4", senderName: "Supinya M.", text: "เช็คแล้วค่ะ เปิดไว้ปกติเลย แต่ก็ยังไม่เด้ง", timestamp: "19:00 PM" }
    ]
  },
  {
    id: "TK-005",
    userName: "Nattapong T.",
    subject: "สอบถามวิธีดูประวัติการจองย้อนหลัง",
    category: "General",
    status: "Resolved",
    createdAt: "Oct 10",
    messages: [
      { id: "m1", senderId: "u5", senderName: "Nattapong T.", text: "ผมอยากทราบว่าจะดูประวัติว่าเคยกินร้านไหนไปแล้วบ้าง ต้องกดเข้าเมนูไหนครับ", timestamp: "11:00 AM" },
      { id: "m2", senderId: "admin", senderName: "Admin User", text: "ลูกค้าสามารถเข้าไปที่เมนู 'โปรไฟล์' ด้านขวาล่าง และเลือก 'ประวัติการจอง' ได้เลยครับ", timestamp: "11:15 AM" },
      { id: "m3", senderId: "u5", senderName: "Nattapong T.", text: "อ๋อ เจอแล้วครับ ขอบคุณมากครับ", timestamp: "11:20 AM" }
    ]
  }
];

interface InboxState {
  tickets: Ticket[];
}

const initialState: InboxState = {
  tickets: JSON.parse(localStorage.getItem("support_tickets") || "null") || initialTickets,
};

const inboxSlice = createSlice({
  name: "inbox",
  initialState,
  reducers: {
    addReply: (state, action: PayloadAction<{ ticketId: string; message: Message }>) => {
      const ticket = state.tickets.find(t => t.id === action.payload.ticketId);
      if (ticket) {
        ticket.messages.push(action.payload.message);
        localStorage.setItem("support_tickets", JSON.stringify(state.tickets));
      }
    },
    resolveTicket: (state, action: PayloadAction<string>) => {
      const ticket = state.tickets.find(t => t.id === action.payload);
      if (ticket) {
        ticket.status = "Resolved";
        localStorage.setItem("support_tickets", JSON.stringify(state.tickets));
      }
    }
  }
});

export const { addReply, resolveTicket } = inboxSlice.actions;
export default inboxSlice.reducer;