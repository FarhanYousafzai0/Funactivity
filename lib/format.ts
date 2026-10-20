const TIME_ZONE = "Asia/Karachi";

/** "4:12 PM" in Pakistan time, whatever server the app runs on. */
export function formatTime(iso: string) {
  return new Intl.DateTimeFormat("en-PK", { hour: "numeric", minute: "2-digit", timeZone: TIME_ZONE }).format(new Date(iso));
}

export function firstName(name: string) {
  return name.split(" ")[0] ?? name;
}
