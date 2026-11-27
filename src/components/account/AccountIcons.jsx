// Material-style filled icons used in the account area
const I = ({ d, ...p }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}><path d={d} /></svg>
)

export const PersonIcon = (p) => <I {...p} d="M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-2.7 0-8 1.3-8 4v2h16v-2c0-2.7-5.3-4-8-4z" />
export const DocAddIcon = (p) => <I {...p} d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zm2 12h-3v3h-2v-3H8v-2h3V9h2v3h3zM13 9V3.5L18.5 9z" />
export const DocIcon = (p) => <I {...p} d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zm2 16H8v-2h8zm0-4H8v-2h8zm-3-5V3.5L18.5 9z" />
export const GearIcon = (p) => <I {...p} d="M19.4 13a7.5 7.5 0 000-2l2.1-1.6-2-3.5-2.5 1a7.4 7.4 0 00-1.7-1L15 3h-4l-.4 2.9a7.4 7.4 0 00-1.7 1l-2.5-1-2 3.5L6.5 11a7.5 7.5 0 000 2l-2.1 1.6 2 3.5 2.5-1a7.4 7.4 0 001.7 1L11 21h4l.4-2.9a7.4 7.4 0 001.7-1l2.5 1 2-3.5zM13 15.5a3.5 3.5 0 110-7 3.5 3.5 0 010 7z" />
export const PencilIcon = (p) => <I {...p} d="M3 17.25V21h3.75L17.8 9.94l-3.75-3.75zM20.7 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75z" />
export const LockFilled = (p) => <I {...p} d="M18 8h-1V6a5 5 0 00-10 0v2H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V10a2 2 0 00-2-2zm-6 9a2 2 0 110-4 2 2 0 010 4zm3.1-9H8.9V6a3.1 3.1 0 016.2 0z" />
export const MailIcon = (p) => <I {...p} d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 4l-8 5-8-5V6l8 5 8-5z" />
export const CakeIcon = (p) => <I {...p} d="M12 6a2 2 0 002-2c0-.4-.1-.7-.3-1L12 0l-1.7 3c-.2.3-.3.6-.3 1a2 2 0 002 2zm6 3h-5V7h-2v2H6a3 3 0 00-3 3v1.5c0 1.1.9 2 2 2 .5 0 1-.2 1.4-.6L8.5 13l2.1 2.1a2 2 0 002.8 0l2.1-2.1 2.1 1.9c.4.4.9.6 1.4.6a2 2 0 002-2V12a3 3 0 00-3-3zM17 16.9l-1.6-1.4-1.6 1.4a3.8 3.8 0 01-5.5 0l-1.4-1.4L5.3 17c-.4.3-.9.5-1.3.6V21a1 1 0 001 1h14a1 1 0 001-1v-3.4c-.5-.1-.9-.3-1.3-.6z" />
export const GenderIcon = (p) => <I {...p} d="M9.5 11a4.5 4.5 0 110 9 4.5 4.5 0 010-9zm0 2a2.5 2.5 0 100 5 2.5 2.5 0 000-5zM15 3h6v6h-2V6.4l-3.8 3.8a6.5 6.5 0 00-1.4-1.4L17.6 5H15z" />
export const PinIcon = (p) => <I {...p} d="M12 2a7 7 0 00-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 00-7-7zm0 9.5A2.5 2.5 0 1112 6.5a2.5 2.5 0 010 5z" />
export const NavIcon = (p) => <I {...p} d="M21 3L3 10.5v1l7 2.5 2.5 7h1z" />
export const PillIcon = (p) => <I {...p} d="M4.2 11.8l7.6-7.6a5.4 5.4 0 017.6 7.6l-7.6 7.6a5.4 5.4 0 01-7.6-7.6zm6.2-3.8L7 11.4l5.6 5.6 3.4-3.4z" />
export const BodyIcon = (p) => <I {...p} d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 2a1.6 1.6 0 110 3.2A1.6 1.6 0 0112 4zm5 5h-3.5v10h-1.7v-4.5h-1.6V19H8.5V9H5V7.5h12z" />
export const HandIcon = (p) => <I {...p} d="M21 7a1.5 1.5 0 00-3 0v5h-1V3.5a1.5 1.5 0 00-3 0V12h-1V2.5a1.5 1.5 0 00-3 0V12H9V4.5a1.5 1.5 0 00-3 0v10.3L3.7 12.3a1.6 1.6 0 00-2.3 2.2L6 20a6 6 0 004.6 2H15a6 6 0 006-6z" />
export const ShieldIcon = (p) => <I {...p} d="M12 1L3 5v6c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V5zm-1.5 15.5L6.5 12.5l1.4-1.4 2.6 2.6 5.6-5.6 1.4 1.4z" />
export const DownloadIcon = (p) => <I {...p} d="M5 20h14v-2H5zM19 9h-4V3H9v6H5l7 7z" />
export const MoreIcon = (p) => <I {...p} d="M12 8a2 2 0 100-4 2 2 0 000 4zm0 2a2 2 0 100 4 2 2 0 000-4zm0 6a2 2 0 100 4 2 2 0 000-4z" />
export const PlusIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true" {...p}><path d="M12 5v14M5 12h14" /></svg>
)
