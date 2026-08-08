// src/types/midtrans.d.ts
// snap dari midtrans tidak resmi punya types, jadi dideklarasikan manual di satu tempat, dipakai di CheckoutForm.tsx dan OrderDetail.tsx

export type MidtransSnap = {
  pay: (
    token: string,
    options: {
      onSuccess: (result: unknown) => void;
      onPending: (result: unknown) => void;
      onError: (result: unknown) => void;
      onClose: () => void;
    },
  ) => void;
};

declare global {
  interface Window {
    snap?: MidtransSnap;
  }
}
