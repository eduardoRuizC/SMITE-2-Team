import type { ReactNode } from 'react'

const paths: Record<string, ReactNode> = {
  cursor: <><path d="m5 3 6.8 16 2.4-6.1 6.3-2.4L5 3Z"/><path d="m14 14 4.5 4.5"/></>,
  pen: <><path d="m4 20 4.2-1 10.9-10.9a2.4 2.4 0 0 0-3.4-3.4L4.8 15.6 4 20Z"/><path d="m14.5 6 3.4 3.4"/></>,
  arrow: <><path d="M5 19 19 5"/><path d="M10 5h9v9"/></>,
  eraser: <><path d="m7 19-3-3 10-11a2 2 0 0 1 3 0l2 2a2 2 0 0 1 0 3l-8 9H7Z"/><path d="M11 19h10"/></>,
  undo: <><path d="M9 7 4 12l5 5"/><path d="M4 12h9a6 6 0 0 1 6 6"/></>,
  redo: <><path d="m15 7 5 5-5 5"/><path d="M20 12h-9a6 6 0 0 0-6 6"/></>,
  save: <><path d="M5 3h12l2 2v16H5V3Z"/><path d="M8 3v6h8V3M8 21v-7h8v7"/></>,
  download: <><path d="M12 3v12m-5-5 5 5 5-5"/><path d="M5 21h14"/></>,
  upload: <><path d="M12 16V4m-5 5 5-5 5 5"/><path d="M5 21h14"/></>,
  reset: <><path d="M4 7v5h5"/><path d="M5.5 17a8 8 0 1 0 0-10L4 8"/></>,
  trash: <><path d="M4 7h16M9 7V4h6v3m3 0-1 14H7L6 7"/><path d="M10 11v6m4-6v6"/></>,
  copy: <><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></>,
  close: <path d="m6 6 12 12M18 6 6 18"/>,
  chevron: <path d="m9 18 6-6-6-6"/>,
  search: <><circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/></>,
  image: <><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 15-5-5L5 20"/></>,
  zoom: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5M7.5 10.5h6m-3-3v6"/></>,
  expand: <><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5"/><path d="m3 8 6-6m12 6-6-6M3 16l6 6m12-6-6 6"/></>,
  compress: <><path d="M9 3v6H3M15 3v6h6M9 21v-6H3M15 21v-6h6"/></>,
}

export function Icon({ name, size = 18 }: { name: string; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}
