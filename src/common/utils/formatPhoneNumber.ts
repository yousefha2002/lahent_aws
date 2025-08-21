export function formatPhoneNumber(phone: string) {
return phone.replace(/[^0-9]/g, '');
}