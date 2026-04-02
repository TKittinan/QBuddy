import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from "./Button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onChange,
}) => {
  return (
    <View style={styles.container}>
      <Button
        title="Prev"
        variant="outline"
        disabled={currentPage === 1}
        onPress={() => onChange(currentPage - 1)}
        style={styles.btnWidth}
      />

      <Text style={styles.text}>
        Page {currentPage} of {totalPages}
      </Text>

      <Button
        title="Next"
        variant="outline"
        disabled={currentPage === totalPages}
        onPress={() => onChange(currentPage + 1)}
        style={styles.btnWidth}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginVertical: 20 },
  text: { fontSize: 14, color: '#4A5568', fontWeight: '500' },
  btnWidth: { width: 80, paddingVertical: 8 }
});