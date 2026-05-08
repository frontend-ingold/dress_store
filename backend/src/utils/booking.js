export function getNightCount(checkIn, checkOut) {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

export function calculateTotalPrice({ nightlyRateUsd, cleaningFeeUsd, nights }) {
  return Number(nightlyRateUsd) * nights + Number(cleaningFeeUsd);
}

export function makeBookingReference() {
  return `BK-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export function isValidDateRange(checkIn, checkOut) {
  if (!checkIn || !checkOut) {
    return false;
  }

  const start = new Date(checkIn);
  const end = new Date(checkOut);
  return Number.isFinite(start.getTime()) && Number.isFinite(end.getTime()) && end > start;
}
