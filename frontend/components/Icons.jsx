const Ico = ({ children, size = 18, stroke = 1.6 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
)

const Icons = {
  home:     () => <Ico><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/></Ico>,
  user:     () => <Ico><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6"/></Ico>,
  users:    () => <Ico><circle cx="9" cy="8" r="3.5"/><path d="M3 20c.8-3 3.4-5 6-5s5.2 2 6 5"/><circle cx="17" cy="9" r="2.5"/><path d="M16 20c.6-2 2-3 3.5-3"/></Ico>,
  team:     () => <Ico><path d="M3 21v-1a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v1"/><circle cx="10" cy="8" r="3.5"/><path d="M19 11a3 3 0 0 0 0-6"/><path d="M21 21v-1a3 3 0 0 0-2-2.8"/></Ico>,
  book:     () => <Ico><path d="M4 5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2z"/><path d="M8 7h7"/><path d="M8 11h7"/></Ico>,
  cal:      () => <Ico><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M8 3v4"/><path d="M16 3v4"/></Ico>,
  ruler:    () => <Ico><rect x="3" y="9" width="18" height="6" rx="1"/><path d="M7 9v3"/><path d="M11 9v4"/><path d="M15 9v3"/><path d="M19 9v3"/></Ico>,
  grade:    () => <Ico><path d="M4 4h16v6H4z"/><path d="M4 14h16v6H4z"/><path d="M8 7h6"/><path d="M8 17h10"/></Ico>,
  search:   () => <Ico><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></Ico>,
  bell:     () => <Ico><path d="M6 8a6 6 0 1 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/></Ico>,
  out:      () => <Ico><path d="M15 17l5-5-5-5"/><path d="M20 12H9"/><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/></Ico>,
  arrow:    () => <Ico><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></Ico>,
  chev:     () => <Ico><path d="m9 6 6 6-6 6"/></Ico>,
  check:    () => <Ico><path d="m5 12 5 5 9-11"/></Ico>,
  warn:     () => <Ico><path d="M12 3 2 21h20z"/><path d="M12 10v5"/><path d="M12 18h0"/></Ico>,
  download: () => <Ico><path d="M12 3v12"/><path d="m6 11 6 6 6-6"/><path d="M5 21h14"/></Ico>,
  refresh:  () => <Ico><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/></Ico>,
  award:    () => <Ico><circle cx="12" cy="9" r="6"/><path d="m9 14-2 7 5-3 5 3-2-7"/></Ico>,
  spark:    () => <Ico><path d="M12 3v4"/><path d="M12 17v4"/><path d="M3 12h4"/><path d="M17 12h4"/><path d="m6 6 2.5 2.5"/><path d="m15.5 15.5 2.5 2.5"/><path d="m6 18 2.5-2.5"/><path d="m15.5 8.5 2.5-2.5"/></Ico>,
  menu:     () => <Ico><path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/></Ico>,
  pin:      () => <Ico><path d="M12 22s8-7.5 8-13a8 8 0 1 0-16 0c0 5.5 8 13 8 13z"/><circle cx="12" cy="9" r="3"/></Ico>,
  plus:     () => <Ico><path d="M12 5v14"/><path d="M5 12h14"/></Ico>,
  edit:     () => <Ico><path d="M14 4l6 6-9 9H5v-6z"/><path d="m13 5 6 6"/></Ico>,
  trash:    () => <Ico><path d="M3 6h18"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/><path d="M6 6v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6"/><path d="M10 11v6"/><path d="M14 11v6"/></Ico>,
  star:     () => <Ico><path d="m12 3 2.9 6 6.6.9-4.8 4.6 1.1 6.5L12 18l-5.8 3 1.1-6.5L2.5 9.9l6.6-.9z"/></Ico>,
  layers:   () => <Ico><path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/><path d="m3 17 9 5 9-5"/></Ico>,
}

export default Icons
