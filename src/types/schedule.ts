export type DayNumber = 2 | 3 | 4 | 5 | 6 | 7;

export interface ClassItem {
  id: string;
  day: DayNumber; // 2, 3, 4, 5, 6, 7
  subject: string; // Tên môn
  room: string; // Phòng học
  startTime: string; // "07:30"
  endTime: string; // "09:00"
  color?: string; // Màu thẻ
}
