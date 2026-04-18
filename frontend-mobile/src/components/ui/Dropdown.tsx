import React, { useState } from "react";
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  TouchableWithoutFeedback 
} from "react-native";

export interface DropdownItem {
  label: string | React.ReactNode; 
  icon?: React.ReactNode;
  onClick?: () => void;
  divider?: boolean;
}

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
}

export function Dropdown({ trigger, items }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View>
      {/* 1. ส่วนปุ่มกด Trigger */}
      <TouchableOpacity activeOpacity={0.7} onPress={() => setIsOpen(true)}>
        {trigger}
      </TouchableOpacity>

      {/* 2. ส่วนเมนูลอย (Modal) */}
      <Modal 
        visible={isOpen} 
        transparent={true} 
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        {/* พื้นหลังโปร่งแสง กดแล้วปิด Dropdown */}
        <TouchableWithoutFeedback onPress={() => setIsOpen(false)}>
          <View style={styles.overlay}>
            
            {/* ตัวกล่องเมนู (ป้องกันไม่ให้คลิกที่เมนูแล้ว Modal ปิด) */}
            <TouchableWithoutFeedback>
              <View style={styles.menuContainer}>
                {items.map((item, index) => (
                  <View key={index}>
                    {item.divider && <View style={styles.divider} />}
                    
                    <TouchableOpacity
                      style={styles.menuItem}
                      activeOpacity={0.6}
                      onPress={() => {
                        setIsOpen(false);
                        item.onClick?.();
                      }}
                    >
                      {item.icon && <View style={styles.iconContainer}>{item.icon}</View>}
                      
                      {/* ตรวจสอบว่า label เป็น string หรือไม่ */}
                      {typeof item.label === 'string' ? (
                        <Text style={styles.menuText}>{item.label}</Text>
                      ) : (
                        item.label
                      )}
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </TouchableWithoutFeedback>

          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)", // สีพื้นหลังตอนเปิดเมนู
    justifyContent: "center", 
    alignItems: "center",
  },
  menuContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 8,
    width: 250,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5, // สำหรับ Android
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  iconContainer: {
    marginRight: 12,
  },
  menuText: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 4,
  },
});