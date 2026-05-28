export const BRAND_CONFIG = {
  website:
    process.env.NEXT_PUBLIC_CAR_DOCTOR_WEBSITE ??
    "https://cardoctor.example.com",
  phone: process.env.NEXT_PUBLIC_CAR_DOCTOR_PHONE ?? "+8801XXXXXXXXX",
  bookingUrl:
    process.env.NEXT_PUBLIC_CAR_DOCTOR_BOOKING_URL ??
    "https://cardoctor.example.com/book",
  currencySymbol: process.env.NEXT_PUBLIC_CURRENCY_SYMBOL ?? "৳",
  brandName: "CarDoctor",
} as const;

export const SOCIAL_LINKS = {
  facebook: "https://www.facebook.com",
  instagram: "https://www.instagram.com",
  whatsapp: "https://www.whatsapp.com",
} as const;

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
] as const;

export const ACCEPTED_IMAGE_EXTENSIONS = ".jpg,.jpeg,.png,.webp";

export const CHAT_STORAGE_KEY = "cardoctor-chat-messages";
