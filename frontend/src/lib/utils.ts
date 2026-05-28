export function isBrandLink(href: string): boolean {
  const website =
    process.env.NEXT_PUBLIC_CAR_DOCTOR_WEBSITE ??
    "https://cardoctor.example.com";
  const bookingUrl =
    process.env.NEXT_PUBLIC_CAR_DOCTOR_BOOKING_URL ??
    "https://cardoctor.example.com/book";
  const phone =
    process.env.NEXT_PUBLIC_CAR_DOCTOR_PHONE ?? "+8801XXXXXXXXX";

  if (href.startsWith("tel:")) {
    const normalized = href.replace("tel:", "").replace(/\s/g, "");
    const phoneNormalized = phone.replace(/\s/g, "");
    return normalized.includes(phoneNormalized.slice(-8));
  }

  try {
    const url = new URL(href);
    const websiteHost = new URL(website).host;
    const bookingHost = new URL(bookingUrl).host;
    return url.host === websiteHost || url.host === bookingHost;
  } catch {
    return href.includes("cardoctor.example.com");
  }
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function formatTimestamp(timestamp: number): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(timestamp));
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
