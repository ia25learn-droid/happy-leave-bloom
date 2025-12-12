// Malaysian Public Holidays 2025
export interface Holiday {
  date: string; // Format: MM-DD
  name: string;
}

export const malaysianHolidays2025: Holiday[] = [
  { date: '01-01', name: "New Year's Day" },
  { date: '02-01', name: 'Thaipusam' },
  { date: '02-02', name: 'Thaipusam (Observed)' },
  { date: '02-17', name: 'Chinese New Year' },
  { date: '02-18', name: 'Chinese New Year (2nd Day)' },
  { date: '03-07', name: 'Nuzul Al-Quran' },
  { date: '03-21', name: 'Hari Raya Aidilfitri' },
  { date: '03-22', name: 'Hari Raya Aidilfitri (2nd Day)' },
  { date: '03-23', name: 'Replacement Holiday (Raya)' },
  { date: '05-01', name: 'Labour Day' },
  { date: '05-27', name: 'Hari Raya Haji' },
  { date: '05-31', name: 'Wesak Day' },
  { date: '06-01', name: "Agong's Birthday / Wesak Replacement" },
  { date: '06-17', name: 'Awal Muharram' },
  { date: '07-07', name: 'George Town World Heritage City Day' },
  { date: '07-11', name: "Governor of Penang's Birthday" },
  { date: '08-25', name: 'Maulidur Rasul' },
  { date: '08-31', name: 'National Day' },
  { date: '09-16', name: 'Malaysia Day' },
  { date: '11-08', name: 'Deepavali' },
  { date: '11-09', name: 'Deepavali (Observed)' },
  { date: '12-25', name: 'Christmas Day' },
];

export const getHolidayForDate = (date: Date): Holiday | undefined => {
  const monthDay = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  return malaysianHolidays2025.find(h => h.date === monthDay);
};

export const isHoliday = (date: Date): boolean => {
  return getHolidayForDate(date) !== undefined;
};
